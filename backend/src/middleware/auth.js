const jwt = require('jsonwebtoken');
const TokenService = require('../services/tokenService');
const { verifySupabaseToken, requireAdmin: supabaseRequireAdmin } = require('./supabaseAuth');
const { isSupabaseConfigured } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  // If Supabase is configured, use Supabase auth
  if (isSupabaseConfigured()) {
    return verifySupabaseToken(req, res, next);
  }

  // Fallback to existing JWT auth
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await TokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify the access token
    const decoded = TokenService.verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || 'user';
    req.tokenId = decoded.jti; // JWT ID for tracking
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = async (req, res, next) => {
  // If Supabase is configured, use Supabase auth
  if (isSupabaseConfigured()) {
    // First verify the token
    await verifySupabaseToken(req, res, async () => {
      // Then check if admin
      await supabaseRequireAdmin(req, res, next);
    });
    return;
  }

  // Fallback to existing JWT auth
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await TokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify the access token
    const decoded = TokenService.verifyAccessToken(token);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
module.exports.authenticate = authMiddleware;
module.exports.authenticateUser = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
