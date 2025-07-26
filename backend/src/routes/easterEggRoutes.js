/**
 * Easter Egg Routes
 * Tracks and manages user's easter egg discoveries
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const pool = require('../config/database');

// Report easter egg discovery
router.post('/discover', authenticate, async (req, res) => {
  try {
    const { eggId, discoveredAt } = req.body;
    const userId = req.user.id;

    // Check if already discovered
    const checkQuery = `
      SELECT id FROM user_easter_eggs 
      WHERE user_id = $1 AND egg_id = $2
    `;
    const existingDiscovery = await pool.query(checkQuery, [userId, eggId]);

    if (existingDiscovery.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Already discovered',
        alreadyDiscovered: true
      });
    }

    // Record discovery
    const insertQuery = `
      INSERT INTO user_easter_eggs (user_id, egg_id, discovered_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, eggId, discoveredAt]);

    // Update user statistics
    await updateUserStats(userId);

    res.json({
      success: true,
      discovery: result.rows[0],
      message: 'Easter egg discovered!'
    });
  } catch (error) {
    console.error('Error recording easter egg discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record discovery'
    });
  }
});

// Get user's easter egg progress
router.get('/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get discovered eggs
    const discoveriesQuery = `
      SELECT 
        uee.*,
        ee.name,
        ee.description,
        ee.rarity,
        ee.icon,
        ee.category
      FROM user_easter_eggs uee
      JOIN easter_eggs ee ON uee.egg_id = ee.id
      WHERE uee.user_id = $1
      ORDER BY uee.discovered_at DESC
    `;
    const discoveries = await pool.query(discoveriesQuery, [userId]);

    // Get user stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_discoveries,
        COUNT(CASE WHEN ee.rarity = 'common' THEN 1 END) as common_discoveries,
        COUNT(CASE WHEN ee.rarity = 'rare' THEN 1 END) as rare_discoveries,
        COUNT(CASE WHEN ee.rarity = 'epic' THEN 1 END) as epic_discoveries,
        COUNT(CASE WHEN ee.rarity = 'legendary' THEN 1 END) as legendary_discoveries,
        SUM(ee.points) as total_points
      FROM user_easter_eggs uee
      JOIN easter_eggs ee ON uee.egg_id = ee.id
      WHERE uee.user_id = $1
    `;
    const stats = await pool.query(statsQuery, [userId]);

    res.json({
      success: true,
      discoveries: discoveries.rows,
      statistics: stats.rows[0],
      totalEggs: await getTotalEggs()
    });
  } catch (error) {
    console.error('Error fetching easter egg progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.personality_type,
        COUNT(uee.egg_id) as discoveries,
        SUM(ee.points) as total_points,
        MAX(uee.discovered_at) as last_discovery
      FROM users u
      JOIN user_easter_eggs uee ON u.id = uee.user_id
      JOIN easter_eggs ee ON uee.egg_id = ee.id
      GROUP BY u.id, u.name, u.personality_type
      ORDER BY total_points DESC, discoveries DESC
      LIMIT 100
    `;
    const leaderboard = await pool.query(query);

    res.json({
      success: true,
      leaderboard: leaderboard.rows
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Admin: Get easter egg statistics
router.get('/admin/stats', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Overall statistics
    const overallQuery = `
      SELECT 
        ee.id,
        ee.name,
        ee.rarity,
        COUNT(uee.user_id) as discovery_count,
        MIN(uee.discovered_at) as first_discovered,
        MAX(uee.discovered_at) as last_discovered
      FROM easter_eggs ee
      LEFT JOIN user_easter_eggs uee ON ee.id = uee.egg_id
      GROUP BY ee.id, ee.name, ee.rarity
      ORDER BY discovery_count DESC
    `;
    const overallStats = await pool.query(overallQuery);

    // Daily discoveries
    const dailyQuery = `
      SELECT 
        DATE(discovered_at) as date,
        COUNT(*) as discoveries,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_easter_eggs
      WHERE discovered_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(discovered_at)
      ORDER BY date DESC
    `;
    const dailyStats = await pool.query(dailyQuery);

    // Most active users
    const activeUsersQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(uee.egg_id) as discoveries,
        MAX(uee.discovered_at) as last_activity
      FROM users u
      JOIN user_easter_eggs uee ON u.id = uee.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY discoveries DESC
      LIMIT 20
    `;
    const activeUsers = await pool.query(activeUsersQuery);

    res.json({
      success: true,
      statistics: {
        eggStats: overallStats.rows,
        dailyDiscoveries: dailyStats.rows,
        mostActiveUsers: activeUsers.rows,
        totalEggs: await getTotalEggs(),
        totalDiscoveries: await getTotalDiscoveries()
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Helper functions
async function updateUserStats(userId) {
  try {
    // Update user's badge count and points
    const updateQuery = `
      UPDATE users 
      SET 
        easter_egg_count = (
          SELECT COUNT(*) FROM user_easter_eggs WHERE user_id = $1
        ),
        total_points = (
          SELECT COALESCE(SUM(ee.points), 0) 
          FROM user_easter_eggs uee
          JOIN easter_eggs ee ON uee.egg_id = ee.id
          WHERE uee.user_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
    `;
    await pool.query(updateQuery, [userId]);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

async function getTotalEggs() {
  const result = await pool.query('SELECT COUNT(*) FROM easter_eggs');
  return parseInt(result.rows[0].count);
}

async function getTotalDiscoveries() {
  const result = await pool.query('SELECT COUNT(*) FROM user_easter_eggs');
  return parseInt(result.rows[0].count);
}

module.exports = router;