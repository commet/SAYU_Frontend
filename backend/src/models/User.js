const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  async create(userData) {
    const {
      email,
      password,
      nickname,
      age,
      location,
      personalManifesto,
      role = 'user'
    } = userData;
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (
        id, email, password_hash, nickname, age, location,
        personal_manifesto, agency_level, aesthetic_journey_stage, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, nickname, agency_level, role, created_at
    `;
    
    const values = [
      id,
      email,
      hashedPassword,
      nickname,
      age,
      location ? JSON.stringify(location) : null,
      personalManifesto,
      'explorer',
      'discovering',
      role
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async createOAuthUser(userData) {
    const {
      email,
      displayName,
      provider,
      providerId,
      profileImage
    } = userData;
    
    const id = uuidv4();
    
    // Create user record
    const userQuery = `
      INSERT INTO users (
        id, email, nickname, agency_level, aesthetic_journey_stage, role
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const userValues = [
      id,
      email,
      displayName || email.split('@')[0],
      'explorer',
      'discovering',
      'user'
    ];
    
    const userResult = await pool.query(userQuery, userValues);
    const user = userResult.rows[0];
    
    // Create OAuth link
    const oauthQuery = `
      INSERT INTO user_oauth_accounts (
        user_id, provider, provider_id, profile_image
      ) VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(oauthQuery, [id, provider, providerId, profileImage]);
    
    return user;
  }

  async findByOAuth(provider, providerId) {
    const query = `
      SELECT u.* FROM users u
      JOIN user_oauth_accounts oa ON u.id = oa.user_id
      WHERE oa.provider = $1 AND oa.provider_id = $2
    `;
    const result = await pool.query(query, [provider, providerId]);
    return result.rows[0];
  }

  async linkOAuthAccount(userId, provider, providerId, profileImage = null) {
    const query = `
      INSERT INTO user_oauth_accounts (
        user_id, provider, provider_id, profile_image
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET provider_id = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(query, [userId, provider, providerId, profileImage]);
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT u.*, up.type_code, up.archetype_name, up.archetype_evolution_stage
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async updateRole(userId, role) {
    const query = `
      UPDATE users SET role = $2 WHERE id = $1
      RETURNING id, email, role
    `;
    const result = await pool.query(query, [userId, role]);
    return result.rows[0];
  }
}

module.exports = new UserModel();
