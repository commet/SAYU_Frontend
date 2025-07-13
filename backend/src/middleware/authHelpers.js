const authenticateToken = require('./auth');

// Optional auth middleware - continues even without valid token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }
  
  authenticateToken(req, res, (err) => {
    if (err) {
      req.user = null;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth
};