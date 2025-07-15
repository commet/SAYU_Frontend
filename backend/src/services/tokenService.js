const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');
const crypto = require('crypto');

class TokenService {
  constructor() {
    this.accessTokenExpiry = '15m'; // 15 minutes
    this.refreshTokenExpiry = '7d'; // 7 days
    this.refreshTokenRedisExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
  }

  // Generate access token (short-lived)
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'sayu-app',
      audience: 'sayu-users'
    });
  }

  // Generate refresh token (long-lived, stored in Redis)
  async generateRefreshToken(userId) {
    // Use JWT for refresh tokens with additional security
    const payload = {
      userId,
      tokenId: crypto.randomUUID(),
      type: 'refresh'
    };
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'sayu-app',
      audience: 'sayu-refresh'
    });
    
    const tokenId = payload.tokenId;
    
    const tokenData = {
      userId,
      tokenId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      userAgent: null, // Will be set when used
      ipAddress: null  // Will be set when used
    };

    // Store in Redis with expiry
    const key = this.getRefreshTokenKey(refreshToken);
    await redisClient().setEx(key, this.refreshTokenRedisExpiry, JSON.stringify(tokenData));
    
    // Also store a reverse lookup for user cleanup
    const userTokensKey = this.getUserTokensKey(userId);
    await redisClient().sAdd(userTokensKey, refreshToken);
    await redisClient().expire(userTokensKey, this.refreshTokenRedisExpiry);

    return { refreshToken, tokenId };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'sayu-app',
        audience: 'sayu-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify and use refresh token
  async verifyRefreshToken(refreshToken, userAgent, ipAddress) {
    // First verify the JWT structure and signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        issuer: 'sayu-app',
        audience: 'sayu-refresh'
      });
    } catch (error) {
      throw new Error('Invalid refresh token signature');
    }
    
    // Then check if it exists in Redis (for revocation)
    const key = this.getRefreshTokenKey(refreshToken);
    const tokenDataStr = await redisClient().get(key);
    
    if (!tokenDataStr) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokenData = JSON.parse(tokenDataStr);
    
    // Verify token data matches JWT payload
    if (tokenData.userId !== decoded.userId || tokenData.tokenId !== decoded.tokenId) {
      throw new Error('Token data mismatch');
    }
    
    // Update last used timestamp and metadata
    tokenData.lastUsed = Date.now();
    tokenData.userAgent = userAgent;
    tokenData.ipAddress = ipAddress;
    
    // Update in Redis
    await redisClient().setEx(key, this.refreshTokenRedisExpiry, JSON.stringify(tokenData));
    
    return tokenData;
  }

  // Generate new token pair using refresh token
  async refreshTokens(refreshToken, userPayload, userAgent, ipAddress) {
    // Verify the refresh token
    const tokenData = await this.verifyRefreshToken(refreshToken, userAgent, ipAddress);
    
    if (tokenData.userId !== userPayload.userId) {
      throw new Error('Token user mismatch');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(userPayload);
    
    // Optionally rotate refresh token for enhanced security
    let newRefreshToken = refreshToken;
    if (this.shouldRotateRefreshToken(tokenData)) {
      // Invalidate old refresh token
      await this.revokeRefreshToken(refreshToken);
      
      // Generate new refresh token
      const { refreshToken: rotatedToken } = await this.generateRefreshToken(userPayload.userId);
      newRefreshToken = rotatedToken;
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      rotated: newRefreshToken !== refreshToken
    };
  }

  // Check if refresh token should be rotated
  shouldRotateRefreshToken(tokenData) {
    // Always rotate refresh tokens for maximum security
    // This prevents token replay attacks and session hijacking
    return true;
    
    // Alternative: Rotate after each use or time-based
    // const ageThreshold = 24 * 60 * 60 * 1000; // 1 day (reduced from 3 days)
    // const age = Date.now() - tokenData.createdAt;
    // return age > ageThreshold;
  }

  // Revoke a specific refresh token
  async revokeRefreshToken(refreshToken) {
    const key = this.getRefreshTokenKey(refreshToken);
    const tokenDataStr = await redisClient().get(key);
    
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      
      // Remove from user's token set
      const userTokensKey = this.getUserTokensKey(tokenData.userId);
      await redisClient().sRem(userTokensKey, refreshToken);
    }
    
    // Delete the token
    await redisClient().del(key);
  }

  // Revoke all refresh tokens for a user
  async revokeAllUserTokens(userId) {
    const userTokensKey = this.getUserTokensKey(userId);
    const userTokens = await redisClient().sMembers(userTokensKey);
    
    if (userTokens.length > 0) {
      // Delete all refresh tokens
      const deletePromises = userTokens.map(token => 
        redisClient().del(this.getRefreshTokenKey(token))
      );
      await Promise.all(deletePromises);
      
      // Clear the user tokens set
      await redisClient().del(userTokensKey);
    }
  }

  // Get all active sessions for a user
  async getUserSessions(userId) {
    const userTokensKey = this.getUserTokensKey(userId);
    const userTokens = await redisClient().sMembers(userTokensKey);
    
    const sessions = [];
    for (const token of userTokens) {
      const key = this.getRefreshTokenKey(token);
      const tokenDataStr = await redisClient().get(key);
      
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);
        sessions.push({
          tokenId: tokenData.tokenId,
          createdAt: new Date(tokenData.createdAt),
          lastUsed: new Date(tokenData.lastUsed),
          userAgent: tokenData.userAgent,
          ipAddress: tokenData.ipAddress,
          isCurrentSession: false // Will be set by caller if needed
        });
      }
    }
    
    return sessions.sort((a, b) => b.lastUsed - a.lastUsed);
  }

  // Revoke a specific session
  async revokeSession(userId, tokenId) {
    const userTokensKey = this.getUserTokensKey(userId);
    const userTokens = await redisClient().sMembers(userTokensKey);
    
    for (const token of userTokens) {
      const key = this.getRefreshTokenKey(token);
      const tokenDataStr = await redisClient().get(key);
      
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);
        if (tokenData.tokenId === tokenId) {
          await this.revokeRefreshToken(token);
          return true;
        }
      }
    }
    
    return false;
  }

  // Blacklist an access token (for immediate logout)
  async blacklistAccessToken(token, reason = 'user_logout') {
    try {
      const decoded = this.verifyAccessToken(token);
      const key = this.getBlacklistKey(token);
      const expiry = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (expiry > 0) {
        await redisClient().setEx(key, expiry, JSON.stringify({
          reason,
          blacklistedAt: Date.now(),
          userId: decoded.userId
        }));
      }
    } catch (error) {
      // Token is already invalid, no need to blacklist
    }
  }

  // Check if access token is blacklisted
  async isTokenBlacklisted(token) {
    const key = this.getBlacklistKey(token);
    const result = await redisClient().get(key);
    return !!result;
  }

  // Clean up expired sessions (maintenance task)
  async cleanupExpiredSessions() {
    const pattern = 'refresh_token:*';
    const keys = await redisClient().keys(pattern);
    let cleanedCount = 0;
    
    for (const key of keys) {
      const ttl = await redisClient().ttl(key);
      if (ttl === -2) { // Key doesn't exist (expired)
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  // Get token statistics
  async getTokenStats() {
    const refreshTokenPattern = 'refresh_token:*';
    const blacklistPattern = 'blacklist:*';
    const userTokensPattern = 'user_tokens:*';
    
    const [refreshTokens, blacklistedTokens, userTokenSets] = await Promise.all([
      redisClient().keys(refreshTokenPattern),
      redisClient().keys(blacklistPattern),
      redisClient().keys(userTokensPattern)
    ]);
    
    return {
      activeRefreshTokens: refreshTokens.length,
      blacklistedTokens: blacklistedTokens.length,
      activeUsers: userTokenSets.length,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods for Redis keys
  getRefreshTokenKey(token) {
    return `refresh_token:${token}`;
  }

  getUserTokensKey(userId) {
    return `user_tokens:${userId}`;
  }

  getBlacklistKey(token) {
    // Use a hash of the token to avoid storing the full token
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return `blacklist:${hash}`;
  }

  // Generate secure session info
  generateSessionInfo(req) {
    return {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      timestamp: Date.now()
    };
  }
}

module.exports = new TokenService();