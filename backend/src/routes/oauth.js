const express = require('express');
const passport = require('../config/passport');
const { generateTokens } = require('../services/tokenService');
const { logger } = require("../config/logger");
const instagramAuth = require('../utils/instagramAuth');
const User = require('../models/User');
const crypto = require('crypto');

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

// Instagram OAuth routes
router.get('/instagram', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  const authUrl = instagramAuth.getAuthorizationUrl(state);
  res.redirect(authUrl);
});

router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      logger.error('Instagram OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=instagram_auth_failed`);
    }
    
    // Verify state to prevent CSRF
    if (state !== req.session.oauthState) {
      logger.error('Instagram OAuth state mismatch');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
    }
    
    // Exchange code for token
    const tokenData = await instagramAuth.getAccessToken(code);
    const { access_token: accessToken, user_id: instagramId } = tokenData;
    
    // Get user profile
    const profile = await instagramAuth.getUserProfile(accessToken, instagramId);
    
    // Check if user exists
    let user = await User.findByOAuth('instagram', instagramId);
    
    if (!user) {
      // Instagram doesn't provide email, so we use username@instagram.local
      const email = `${profile.username}@instagram.local`;
      const existingUser = await User.findByEmail(email);
      
      if (existingUser) {
        await User.linkOAuthAccount(existingUser.id, 'instagram', instagramId);
        user = existingUser;
      } else {
        user = await User.createOAuthUser({
          email: email,
          displayName: profile.username,
          provider: 'instagram',
          providerId: instagramId,
          profileImage: null // Instagram Basic Display API doesn't provide profile picture
        });
      }
    }
    
    // Set req.user for handleOAuthCallback
    req.user = user;
    
    // Use the common OAuth callback handler
    handleOAuthCallback(req, res, 'instagram');
  } catch (error) {
    logger.error('Instagram OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=instagram_auth_failed`);
  }
});

// Link OAuth account to existing user (requires authentication)
router.post('/link/:provider', 
  require('../middleware/auth'),
  async (req, res) => {
    try {
      const { provider } = req.params;
      const validProviders = ['google', 'github', 'apple', 'instagram'];
      
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