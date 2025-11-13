// pinger.js
const https = require('https');

const BASE = 'https://api-xsnhanh3p.onrender.com';
const routes = [
  '/',            // giữ awake
  '/api/tong',    // lấy tổng
  '/api/ball/1',  // lấy bóng 1
  '/api/ball/2',
  '/api/ball/3',
  '/api/ball/4',
  '/api/ball/5'
];

function pingAll() {
  console.log(`\n[🔥 PING] ${new Date().toLocaleTimeString()} - Gửi ping đến ${routes.length} endpoint...\n`);
  routes.forEach(route => {
    const url = `${BASE}${route}`;
    https.get(url, res => {
      console.log(`[OK] ${route.padEnd(15)} ➜ ${res.statusCode}`);
    }).on('error', err => {
      console.error(`[FAIL] ${route.padEnd(15)} ➜ ${err.message}`);
    });
  });
}

pingAll(); // chạy ngay lúc khởi động
setInterval(pingAll, 1000 * 30); // ⏱️ ping mỗi 30 giây
