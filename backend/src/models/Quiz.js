const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class QuizModel {
  async createSession(userId, sessionType) {
    const id = uuidv4();
    
    const query = `
      INSERT INTO quiz_sessions (
        id, user_id, session_type, device_info, started_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    
    const values = [id, userId, sessionType, JSON.stringify({})];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateSession(sessionId, updates) {
    const { responses, completedAt, timeSpent, completionRate } = updates;
    
    const query = `
      UPDATE quiz_sessions 
      SET responses = $1,
          completed_at = $2,
          time_spent = $3,
          completion_rate = $4
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [
      JSON.stringify(responses),
      completedAt,
      timeSpent,
      completionRate,
      sessionId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getSession(sessionId) {
    const query = 'SELECT * FROM quiz_sessions WHERE id = $1';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  async getUserSessions(userId) {
    const query = `
      SELECT * FROM quiz_sessions 
      WHERE user_id = $1 
      ORDER BY started_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new QuizModel();
