const axios = require('axios');
const crypto = require('crypto');

class InstagramAuth {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/instagram/callback`;
  }

  /**
   * Generate Instagram OAuth URL
   */
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: state || crypto.randomBytes(16).toString('hex')
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code
      });

      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram token exchange error:', error.response?.data || error);
      throw new Error('Failed to exchange Instagram authorization code');
    }
  }

  /**
   * Get user profile using access token
   */
  async getUserProfile(accessToken, userId) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${userId}`,
        {
          params: {
            fields: 'id,username,account_type,media_count',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram profile fetch error:', error.response?.data || error);
      throw new Error('Failed to fetch Instagram profile');
    }
  }

  /**
   * Get long-lived access token
   */
  async getLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: this.clientSecret,
            access_token: shortLivedToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram long-lived token error:', error.response?.data || error);
      throw new Error('Failed to get long-lived token');
    }
  }

  /**
   * Refresh long-lived token
   */
  async refreshLongLivedToken(token) {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/refresh_access_token',
        {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: token
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram token refresh error:', error.response?.data || error);
      throw new Error('Failed to refresh token');
    }
  }
}

module.exports = new InstagramAuth();