const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

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
    return result.rows[0];
  }

  async findByUserId(userId) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = new ProfileModel();
