const { pool } = require('../config/database');

class MatchingController {
  async getCompatibleUsers(req, res) {
    try {
      const userId = req.userId;
      const { purpose } = req.query;

      // Get current user info
      const currentUserQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `;
      const currentUserResult = await pool.query(currentUserQuery, [userId]);
      const currentUser = currentUserResult.rows[0];

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetPurpose = purpose || currentUser.user_purpose || 'exploring';

      // Simple matching logic based on purpose
      let compatibleUsersQuery;
      let queryParams = [userId];

      switch (targetPurpose) {
        case 'dating':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose = 'dating'
            AND u.age IS NOT NULL
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'family':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('family', 'social')
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'professional':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('professional', 'exploring')
            AND up.type_code IS NOT NULL
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'social':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('social', 'exploring', 'family')
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        default: // exploring
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
      }

      const result = await pool.query(compatibleUsersQuery, queryParams);
      
      res.json({
        purpose: targetPurpose,
        users: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Get compatible users error:', error);
      res.status(500).json({ error: 'Failed to fetch compatible users' });
    }
  }

  async getUsersByPurpose(req, res) {
    try {
      const { purpose } = req.params;
      const userId = req.userId;

      const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
      if (!validPurposes.includes(purpose)) {
        return res.status(400).json({ error: 'Invalid purpose' });
      }

      const query = `
        SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id != $1 
        AND u.user_purpose = $2
        ORDER BY u.created_at DESC
        LIMIT 50
      `;

      const result = await pool.query(query, [userId, purpose]);
      
      res.json({
        purpose,
        users: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Get users by purpose error:', error);
      res.status(500).json({ error: 'Failed to fetch users by purpose' });
    }
  }
}

module.exports = new MatchingController();