# OAuth Social Login Setup Guide

This guide helps you configure OAuth authentication for Google, GitHub, and Apple Sign In.

## Overview

SAYU now supports social login with:
- Google OAuth 2.0
- GitHub OAuth
- Apple Sign In

## Backend Setup

### 1. Database Migration

First, run the OAuth migration to create necessary tables:

```bash
cd backend
node scripts/setupOAuth.js
```

This creates:
- `user_oauth_accounts` table
- Additional OAuth-related columns in the users table

### 2. Environment Variables

Add these to your `backend/.env` file:

```env
# Session Secret (generate a secure random string)
SESSION_SECRET=your-session-secret-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Apple Sign In
APPLE_CLIENT_ID=com.yourcompany.sayu
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
your-apple-private-key
-----END PRIVATE KEY-----
```

## OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Choose "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy Client ID and Client Secret

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: SAYU
   - Homepage URL: Your app URL
   - Authorization callback URL:
     - Development: `http://localhost:3001/api/auth/github/callback`
     - Production: `https://yourdomain.com/api/auth/github/callback`
4. Copy Client ID and Client Secret

### Apple Sign In Setup

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID with Sign in with Apple capability
3. Create a Service ID for web authentication
4. Configure domains and return URLs:
   - Development: `http://localhost:3001/api/auth/apple/callback`
   - Production: `https://yourdomain.com/api/auth/apple/callback`
5. Create a private key for Sign in with Apple
6. Note your Team ID, Key ID, and download the private key

## Frontend Setup

### Environment Variables

Add to your `frontend/.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-generate-this

# OAuth Providers (same as backend)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

APPLE_CLIENT_ID=com.yourcompany.sayu
APPLE_CLIENT_SECRET=your-generated-apple-client-secret
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## Features

### For Users

1. **Social Login**: Users can sign in with Google, GitHub, or Apple
2. **Account Linking**: Existing users can link social accounts
3. **Multiple Providers**: Users can link multiple social accounts

### Implementation Details

1. **OAuth Flow**:
   - User clicks social login button
   - Redirected to provider for authentication
   - Provider redirects back with auth code
   - Backend exchanges code for user info
   - User is created or logged in
   - JWT tokens are issued

2. **Account Linking**:
   - Logged-in users can link additional social accounts
   - Prevents duplicate accounts with same email
   - Users can unlink accounts (keeping at least one auth method)

3. **Security**:
   - OAuth state parameter prevents CSRF
   - Secure session management
   - JWT tokens for API authentication
   - Profile images from OAuth providers supported

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure callback URLs match exactly in provider settings
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **Session Issues**
   - Ensure SESSION_SECRET is set
   - Check cookie settings for production (secure: true)

3. **Apple Sign In**
   - Ensure private key format is correct
   - Verify Team ID and Key ID
   - Check Service ID configuration

## Production Considerations

1. **HTTPS Required**: OAuth providers require HTTPS in production
2. **Domain Verification**: Some providers require domain verification
3. **Privacy Policy**: Required for Apple Sign In
4. **User Data**: Handle OAuth profile data according to privacy laws

## Testing

1. Test each provider's login flow
2. Test account linking for existing users
3. Test unlinking accounts
4. Verify error handling for failed authentications
5. Test token refresh with OAuth accounts

## Next Steps

1. Consider adding more providers (Facebook, Twitter, etc.)
2. Implement OAuth account management UI
3. Add social profile data syncing
4. Enable social sharing features