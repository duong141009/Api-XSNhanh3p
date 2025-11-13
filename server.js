// server.js
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const BASE_API = 'https://a.hay88.studio/server/lottery/getCurrentLotteryInfo?lottery_id=46';

app.get('/api/ball/:pos', async (req, res) => {
  const pos = parseInt(req.params.pos);
  if (pos < 1 || pos > 5) return res.status(400).json({ error: 'Chỉ hỗ trợ bóng 1 đến 5' });

  try {
    const response = await axios.get(BASE_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const data = response.data.data;
    res.json({
      issue: data.issue,
      value: data.open_numbers_formatted[pos - 1],
      TX: data.open_result.bigSmall[pos - 1].name,
      CL: data.open_result.oddEven[pos - 1].name
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu API gốc' });
  }
});

app.get('/api/tong', async (req, res) => {
  try {
    const response = await axios.get(BASE_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const data = response.data.data;
    const total = data.open_result.sumTotalList;
    res.json({
      issue: data.issue,
      sum: total.sumTotal,
      TX: total.bigSmall.name,
      CL: total.oddEven.name
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu API gốc' });
  }
});

app.get('/api/full', async (req, res) => {
  try {
    const response = await axios.get(BASE_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu API gốc' });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 API proxy running on port ${PORT}`);
});
