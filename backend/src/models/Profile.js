const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const CacheService = require('../services/cacheService');

class ProfileModel {
  async create(profileData) {
    const {
      userId,
      typeCode,
      archetypeName,
      archetypeDescription,
      exhibitionScores,
      artworkScores,
      emotionalTags,
      cognitiveVector,
      emotionalVector,
      aestheticVector,
      personalityConfidence,
      uiCustomization,
      interactionStyle,
      generatedImageUrl
    } = profileData;
    
    const id = uuidv4();
    
    const query = `
      INSERT INTO user_profiles (
        id, user_id, type_code, archetype_name, archetype_description,
        exhibition_scores, artwork_scores, emotional_tags,
        cognitive_vector, emotional_vector, aesthetic_vector,
        personality_confidence, ui_customization, interaction_style,
        generated_image_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *
    `;
    
    const values = [
      id,
      userId,
      typeCode,
      archetypeName,
      archetypeDescription,
      JSON.stringify(exhibitionScores),
      JSON.stringify(artworkScores),
      emotionalTags,
      JSON.stringify(cognitiveVector || []),
      JSON.stringify(emotionalVector || []),
      JSON.stringify(aestheticVector || []),
      personalityConfidence,
      JSON.stringify(uiCustomization),
      interactionStyle,
      generatedImageUrl
    ];
    
    const result = await pool.query(query, values);
    const profile = result.rows[0];
    
    // Cache the new profile and warm related caches
    if (profile) {
      await CacheService.setUserProfile(userId, profile, 7200); // 2 hours
      await CacheService.warmUserCache(userId, profile);
    }
    
    return profile;
  }

  async findByUserId(userId) {
    // Try to get from cache first
    const cached = await CacheService.getUserProfile(userId);
    if (cached) {
      return cached;
    }
    
    // If not in cache, fetch from database
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await pool.query(query, [userId]);
    const profile = result.rows[0];
    
    // Cache the result if found
    if (profile) {
      await CacheService.setUserProfile(userId, profile, 3600); // 1 hour
    }
    
    return profile;
  }

  async updateProfile(userId, updates) {
    // First get the current profile
    const currentProfile = await this.findByUserId(userId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [userId];
    let paramIndex = 2;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnake(key);
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return currentProfile;
    }

    const query = `
      UPDATE user_profiles 
      SET ${updateFields.join(', ')}
      WHERE user_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const updatedProfile = result.rows[0];

    // Update cache
    if (updatedProfile) {
      await CacheService.setUserProfile(userId, updatedProfile, 3600);
      // Clear related caches that might be affected
      await CacheService.clearPattern(`recommendations:${userId}:*`);
      await CacheService.clearPattern(`daily:${userId}:*`);
    }

    return updatedProfile;
  }

  async deleteProfile(userId) {
    const query = 'DELETE FROM user_profiles WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [userId]);
    
    // Clear all related caches
    await CacheService.invalidateUserProfile(userId);
    await CacheService.clearPattern(`*:${userId}:*`);
    
    return result.rows[0];
  }

  // Helper method to convert camelCase to snake_case
  camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

module.exports = new ProfileModel();
