const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { rateLimits } = require('../middleware/validation');

// Pioneer 통계 조회 (실시간 카운터용)
router.get('/stats', rateLimits.lenient, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        total_pioneers,
        latest_pioneer_number,
        new_today,
        new_this_week
      FROM pioneer_stats
    `);

    if (result.rows.length === 0) {
      return res.json({
        total_pioneers: 0,
        latest_pioneer_number: 0,
        new_today: 0,
        new_this_week: 0
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Pioneer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch pioneer statistics' });
  }
});

// 특정 사용자의 Pioneer 정보 조회
router.get('/profile/:userId', rateLimits.moderate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        id,
        pioneer_number,
        nickname,
        created_at,
        apt_result
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pioneer not found' });
    }

    const pioneer = result.rows[0];
    res.json({
      id: pioneer.id,
      pioneer_number: pioneer.pioneer_number,
      nickname: pioneer.nickname,
      joined_date: pioneer.created_at,
      apt_result: pioneer.apt_result
    });
  } catch (error) {
    console.error('Pioneer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch pioneer profile' });
  }
});

module.exports = router;