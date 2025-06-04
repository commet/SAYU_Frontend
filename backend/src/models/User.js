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
    
    const hashedPassword = await bcrypt.hash(password, 10);
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
