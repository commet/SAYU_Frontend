const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const User = require('../models/User');
const { logger } = require('./logger');

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findByOAuth('google', profile.id);
      
      if (!user) {
        // Check if email is already registered
        const existingUser = await User.findByEmail(profile.emails[0].value);
        
        if (existingUser) {
          // Link OAuth account to existing user
          await User.linkOAuthAccount(existingUser.id, 'google', profile.id);
          user = existingUser;
        } else {
          // Create new user
          user = await User.createOAuthUser({
            email: profile.emails[0].value,
            displayName: profile.displayName,
            provider: 'google',
            providerId: profile.id,
            profileImage: profile.photos[0]?.value
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      logger.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findByOAuth('github', profile.id);
      
      if (!user) {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        const existingUser = await User.findByEmail(email);
        
        if (existingUser) {
          await User.linkOAuthAccount(existingUser.id, 'github', profile.id);
          user = existingUser;
        } else {
          user = await User.createOAuthUser({
            email: email,
            displayName: profile.displayName || profile.username,
            provider: 'github',
            providerId: profile.id,
            profileImage: profile.photos[0]?.value
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      logger.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Apple OAuth Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    key: process.env.APPLE_PRIVATE_KEY,
    callbackURL: "/api/auth/apple/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, decodedIdToken, profile, done) => {
    try {
      let user = await User.findByOAuth('apple', profile.id);
      
      if (!user) {
        const email = decodedIdToken.email;
        const existingUser = await User.findByEmail(email);
        
        if (existingUser) {
          await User.linkOAuthAccount(existingUser.id, 'apple', profile.id);
          user = existingUser;
        } else {
          user = await User.createOAuthUser({
            email: email,
            displayName: decodedIdToken.name || email.split('@')[0],
            provider: 'apple',
            providerId: profile.id
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      logger.error('Apple OAuth error:', error);
      return done(error, null);
    }
  }));
}

module.exports = passport;