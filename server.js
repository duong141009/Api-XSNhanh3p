// server.js
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const BASE_API = 'https://a.hay88.studio/server/lottery/getCurrentLotteryInfo?lottery_id=46';
const DATA_DIR = './data';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function saveToFile(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

function loadFile(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fullPath)) return [];
  return JSON.parse(fs.readFileSync(fullPath));
}

function updateHistoryFile(filename, newEntry) {
  let history = loadFile(filename);
  if (!history.find(item => item.issue === newEntry.issue)) {
    history.push(newEntry);
    saveToFile(filename, history);
  }
}

app.get('/api/ball/:pos', async (req, res) => {
  const pos = parseInt(req.params.pos);
  if (pos < 1 || pos > 5) return res.status(400).json({ error: 'Chỉ hỗ trợ bóng 1 đến 5' });

  try {
    const response = await axios.get(BASE_API);
    const data = response.data.data;

    const issue = data.issue;
    const entry = {
      issue,
      value: data.open_numbers_formatted[pos - 1],
      TX: data.open_result.bigSmall[pos - 1].name,
      CL: data.open_result.oddEven[pos - 1].name
    };

    updateHistoryFile(`ball${pos}.json`, entry);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu bóng' });
  }
});

app.get('/api/tong', async (req, res) => {
  try {
    const response = await axios.get(BASE_API);
    const data = response.data.data;
    const total = data.open_result.sumTotalList;

    const entry = {
      issue: data.issue,
      sum: total.sumTotal,
      TX: total.bigSmall.name,
      CL: total.oddEven.name
    };

    updateHistoryFile('tong.json', entry);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu tổng' });
  }
});

app.get('/api/full', async (req, res) => {
  try {
    const response = await axios.get(BASE_API);
    const data = response.data.data;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy full dữ liệu' });
  }
});

app.get('/api/history/:target', (req, res) => {
  const { target } = req.params;
  const allowed = ['tong', 'ball1', 'ball2', 'ball3', 'ball4', 'ball5'];
  if (!allowed.includes(target)) return res.status(400).json({ error: 'Không hợp lệ' });
  res.json(loadFile(`${target}.json`).slice(-50));
});

app.listen(PORT, () => {
  console.log(`🔥 Server tracking history files per type & running on port ${PORT}`);
});
