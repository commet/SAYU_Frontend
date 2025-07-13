const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 테스트 서버가 포트 ${PORT}에서 실행 중!`);
});