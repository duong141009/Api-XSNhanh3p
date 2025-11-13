// pinger.js
const https = require('https');
const URL = 'https://api-xsnhanh3p.onrender.com';

function ping() {
  https.get(URL, (res) => {
    console.log(`[PING] ${new Date().toISOString()} | Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[PING ERROR]', err.message);
  });
}

ping(); // Ping ngay lúc khởi động
setInterval(ping, 1000 * 60 * 5); // Ping mỗi 5 phút
