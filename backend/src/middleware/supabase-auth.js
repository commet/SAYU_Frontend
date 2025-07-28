const { supabaseAdmin } = require('../config/supabase-client');
const { log } = require('../config/logger');

/**
 * Supabase Authentication Middleware
 * Verifies JWT tokens from Supabase Auth
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided',
        code: 'AUTH_HEADER_MISSING'
      });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Invalid authorization format',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      log.warn('Authentication failed:', error?.message || 'User not found');
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      log.error('Error fetching user profile:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_ERROR'
      });
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        log.error('Error creating user profile:', createError);
        return res.status(500).json({
          error: 'Failed to create user profile',
          code: 'PROFILE_CREATE_ERROR'
        });
      }

      req.user = { ...user, profile: newProfile };
    } else {
      req.user = { ...user, profile };
    }

    // Add user ID for convenience
    req.userId = profile?.id || req.user.profile.id;

    next();
  } catch (error) {
    log.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Allows requests to proceed even without auth
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No auth header, proceed without user
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    // Try to verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Invalid token, proceed without user
      req.user = null;
      req.userId = null;
      return next();
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    req.user = profile ? { ...user, profile } : null;
    req.userId = profile?.id || null;

    next();
  } catch (error) {
    // Error in auth, proceed without user
    log.warn('Optional auth error:', error.message);
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Admin authentication middleware
 * Requires user to have admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticateUser(req, res, async () => {
      // Check if user has admin role
      const userRole = req.user?.profile?.role || req.user?.user_metadata?.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          error: 'Admin access required',
          code: 'ADMIN_REQUIRED'
        });
      }

      next();
    });
  } catch (error) {
    log.error('Admin auth middleware error:', error);
    res.status(500).json({
      error: 'Authorization service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Rate limiting by user
 */
const userRateLimit = (limit = 100, windowMs = 60000) => {
  const requests = new Map();

  return async (req, res, next) => {
    if (!req.userId) {
      return next();
    }

    const now = Date.now();
    const userRequests = requests.get(req.userId) || [];

    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(req.userId, validRequests);

    next();
  };
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin,
  userRateLimit
};
