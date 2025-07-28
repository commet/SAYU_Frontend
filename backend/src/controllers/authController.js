const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const TokenService = require('../services/tokenService');
const journeyNudgeService = require('../services/journeyNudgeService');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, nickname, age, location, personalManifesto, userPurpose } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      const user = await UserModel.create({
        email,
        password,
        nickname,
        age,
        location,
        personalManifesto,
        userPurpose: userPurpose || 'exploring'
      });

      // Generate token pair
      const sessionInfo = TokenService.generateSessionInfo(req);
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        jti: require('crypto').randomUUID()
      };

      const accessToken = TokenService.generateAccessToken(tokenPayload);
      const { refreshToken } = await TokenService.generateRefreshToken(user.id);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          pioneer_number: user.pioneer_number,
          nickname: user.nickname,
          agencyLevel: user.agency_level
        },
        accessToken,
        refreshToken,
        expiresIn: '15m'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token pair
      const sessionInfo = TokenService.generateSessionInfo(req);
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        jti: require('crypto').randomUUID()
      };

      const accessToken = TokenService.generateAccessToken(tokenPayload);
      const { refreshToken } = await TokenService.generateRefreshToken(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          agencyLevel: user.agency_level,
          journeyStage: user.aesthetic_journey_stage,
          hasProfile: !!user.type_code
        },
        accessToken,
        refreshToken,
        expiresIn: '15m'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          agencyLevel: user.agency_level,
          journeyStage: user.aesthetic_journey_stage,
          hasProfile: !!user.type_code,
          typeCode: user.type_code,
          archetypeName: user.archetype_name
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      // Get user data for new token
      const sessionInfo = TokenService.generateSessionInfo(req);

      // Verify refresh token and get user data
      const tokenData = await TokenService.verifyRefreshToken(
        refreshToken,
        sessionInfo.userAgent,
        sessionInfo.ipAddress
      );

      const user = await UserModel.findById(tokenData.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user'
      };

      // Generate new tokens
      const tokens = await TokenService.refreshTokens(
        refreshToken,
        userPayload,
        sessionInfo.userAgent,
        sessionInfo.ipAddress
      );

      res.json({
        message: 'Tokens refreshed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: '15m',
        rotated: tokens.rotated
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: error.message || 'Invalid refresh token' });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.split(' ')[1];

      // Blacklist the access token for immediate logout
      if (accessToken) {
        await TokenService.blacklistAccessToken(accessToken, 'user_logout');
      }

      // Revoke the refresh token
      if (refreshToken) {
        await TokenService.revokeRefreshToken(refreshToken);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async logoutAll(req, res) {
    try {
      const { userId } = req;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.split(' ')[1];

      // Blacklist current access token
      if (accessToken) {
        await TokenService.blacklistAccessToken(accessToken, 'logout_all');
      }

      // Revoke all refresh tokens for the user
      await TokenService.revokeAllUserTokens(userId);

      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({ error: 'Logout all failed' });
    }
  }

  async getSessions(req, res) {
    try {
      const { userId } = req;
      const sessions = await TokenService.getUserSessions(userId);

      res.json({
        sessions: sessions.map(session => ({
          tokenId: session.tokenId,
          createdAt: session.createdAt,
          lastUsed: session.lastUsed,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          isCurrentSession: session.tokenId === req.tokenId
        }))
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  async revokeSession(req, res) {
    try {
      const { userId } = req;
      const { tokenId } = req.params;

      const revoked = await TokenService.revokeSession(userId, tokenId);

      if (revoked) {
        res.json({ message: 'Session revoked successfully' });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({ error: 'Failed to revoke session' });
    }
  }

  async updateUserPurpose(req, res) {
    try {
      const { userId } = req;
      const { userPurpose } = req.body;

      if (!userPurpose) {
        return res.status(400).json({ error: 'User purpose is required' });
      }

      const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
      if (!validPurposes.includes(userPurpose)) {
        return res.status(400).json({ error: 'Invalid user purpose' });
      }

      const updatedUser = await UserModel.updateUserPurpose(userId, userPurpose);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User purpose updated successfully',
        userPurpose: updatedUser.user_purpose
      });
    } catch (error) {
      console.error('Update user purpose error:', error);
      res.status(500).json({ error: 'Failed to update user purpose' });
    }
  }
}

module.exports = new AuthController();
