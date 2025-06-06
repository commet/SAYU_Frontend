const express = require('express');
const passport = require('../config/passport');
const { generateTokens } = require('../services/tokenService');
const logger = require('../utils/logger');

const router = express.Router();

// Helper function to handle OAuth callback
const handleOAuthCallback = async (req, res, provider) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens({ 
      id: req.user.id, 
      email: req.user.email 
    });

    // Store refresh token in database
    await require('../services/tokenService').storeRefreshToken(req.user.id, refreshToken);

    // Log successful OAuth login
    logger.info(`${provider} OAuth login successful`, { 
      userId: req.user.id, 
      email: req.user.email 
    });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    redirectUrl.searchParams.set('provider', provider);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error(`${provider} OAuth callback error:`, error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
  }
};

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => handleOAuthCallback(req, res, 'google')
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed` }),
  (req, res) => handleOAuthCallback(req, res, 'github')
);

// Apple OAuth routes
router.get('/apple',
  passport.authenticate('apple')
);

router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=apple_auth_failed` }),
  (req, res) => handleOAuthCallback(req, res, 'apple')
);

// Link OAuth account to existing user (requires authentication)
router.post('/link/:provider', 
  require('../middleware/auth'),
  async (req, res) => {
    try {
      const { provider } = req.params;
      const validProviders = ['google', 'github', 'apple'];
      
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ error: 'Invalid provider' });
      }

      // Store user ID in session for linking after OAuth flow
      req.session.linkUserId = req.user.id;
      
      // Redirect to OAuth provider
      res.json({ 
        redirectUrl: `/api/auth/${provider}?link=true` 
      });
    } catch (error) {
      logger.error('OAuth link error:', error);
      res.status(500).json({ error: 'Failed to link account' });
    }
  }
);

// Unlink OAuth account
router.delete('/unlink/:provider',
  require('../middleware/auth'),
  async (req, res) => {
    try {
      const { provider } = req.params;
      const userId = req.user.id;
      
      // Check if user has a password or other OAuth accounts
      const user = await require('../models/User').findById(userId);
      const query = `
        SELECT COUNT(*) as count FROM user_oauth_accounts 
        WHERE user_id = $1 AND provider != $2
      `;
      const result = await require('../config/database').pool.query(query, [userId, provider]);
      
      if (!user.password_hash && result.rows[0].count === 0) {
        return res.status(400).json({ 
          error: 'Cannot unlink last authentication method' 
        });
      }
      
      // Unlink the OAuth account
      const deleteQuery = `
        DELETE FROM user_oauth_accounts 
        WHERE user_id = $1 AND provider = $2
      `;
      await require('../config/database').pool.query(deleteQuery, [userId, provider]);
      
      logger.info('OAuth account unlinked', { userId, provider });
      res.json({ message: 'Account unlinked successfully' });
    } catch (error) {
      logger.error('OAuth unlink error:', error);
      res.status(500).json({ error: 'Failed to unlink account' });
    }
  }
);

module.exports = router;