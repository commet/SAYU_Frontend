const { getSupabaseAdmin } = require('../config/supabase');
const { log } = require('../config/logger');

/**
 * Middleware to verify Supabase JWT tokens
 */
async function verifySupabaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      log.error('Supabase admin client not configured');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    // Verify the JWT token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get full profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      log.error('Error fetching user profile:', profileError);
    }

    // Attach user and profile to request
    req.user = {
      id: user.id,
      email: user.email,
      ...profile
    };

    next();
  } catch (error) {
    log.error('Error in Supabase auth middleware:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Optional authentication - attaches user if token is present but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return next();
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        ...profile
      };
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
}

module.exports = {
  verifySupabaseToken,
  requireAdmin,
  optionalAuth
};