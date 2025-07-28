const router = require('express').Router();
const ProfileModel = require('../models/Profile');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../config/database');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const profile = await ProfileModel.findByUserId(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get linked OAuth accounts
router.get('/oauth-accounts', async (req, res) => {
  try {
    const query = `
      SELECT provider, profile_image, created_at
      FROM user_oauth_accounts
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [req.userId]);

    // Build response with all providers
    const providers = ['google', 'github', 'apple'];
    const linkedProviders = result.rows.map(row => row.provider);

    const accounts = providers.map(provider => ({
      provider,
      linked: linkedProviders.includes(provider),
      profileImage: result.rows.find(r => r.provider === provider)?.profile_image
    }));

    res.json({ accounts });
  } catch (error) {
    console.error('Get OAuth accounts error:', error);
    res.status(500).json({ error: 'Failed to get OAuth accounts' });
  }
});

module.exports = router;
