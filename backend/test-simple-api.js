require('dotenv').config();
const express = require('express');
const { pool } = require('./src/config/database');

const app = express();
app.use(express.json());

// 간단한 테스트 라우트
app.get('/test/artvee/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT artvee_id, title, artist, url, sayu_type
      FROM artvee_artworks 
      WHERE sayu_type = $1 
      ORDER BY RANDOM() 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [type, parseInt(limit)]);
    
    res.json({
      success: true,
      personalityType: type,
      artworks: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`Simple test server running on port ${port}`);
});

module.exports = app;