// server.js
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
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

app.get('/', (req, res) => {
  res.send(`
    <h1>🎯 API XS Nhanh 3P HAY88</h1>
    <p><b>BY DWONG & GPT</b></p>
    <hr/>
    <h3>📦 Endpoint chính:</h3>
    <ul>
      <li><a href="/api/tong">/api/tong</a> – Lấy tổng và lưu lịch sử</li>
      <li><a href="/api/ball/1">/api/ball/1</a> đến <a href="/api/ball/5">/api/ball/5</a> – Lấy từng bóng</li>
      <li><a href="/api/full">/api/full</a> – Dữ liệu thô đầy đủ</li>
      <li><a href="/api/history/tong">/api/history/tong</a> – Xem lịch sử tổng</li>
      <li><a href="/api/history/ball1">/api/history/ball1</a> ... <a href="/api/history/ball5">/api/history/ball5</a> – Lịch sử từng bóng</li>
      <li><a href="/api/download/tong">/api/download/tong</a> ... <a href="/api/download/ball5">/api/download/ball5</a> – Tải file JSON</li>
      <li><a href="/api/download/all">/api/download/all</a> – 📦 Tải tất cả JSON thành .zip</li>
    </ul>
    <hr/>
    <p style="color: gray;">© 2025 Dwong & GPT – API Auto Updater</p>
  `);
});

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
    res.json(response.data.data);
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

app.get('/api/download/:target', (req, res) => {
  const { target } = req.params;
  const filePath = path.join(__dirname, 'data', `${target}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Không tìm thấy file');
  }
  res.download(filePath);
});

app.get('/api/download/all', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('xsnhanh3p-data.zip');

  archive.on('error', err => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  const files = ['tong.json', 'ball1.json', 'ball2.json', 'ball3.json', 'ball4.json', 'ball5.json'];
  files.forEach(file => {
    const fullPath = path.join(DATA_DIR, file);
    if (fs.existsSync(fullPath)) archive.file(fullPath, { name: file });
  });

  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`🔥 Full-feature API running on port ${PORT}`);
});
