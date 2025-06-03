// ================================
// SAYU COMPLETE BACKEND MVP
// Full implementation with hyper-personalization
// ================================

// package.json
const packageJson = {
  "name": "sayu-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:setup": "node src/scripts/setupDatabase.js",
    "db:seed": "node src/scripts/seedData.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "pgvector": "^0.1.0",
    "redis": "^4.6.7",
    "openai": "^4.20.0",
    "axios": "^1.6.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.1",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
};

// ================================
// src/server.js - Main Express Server
// ================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const profileRoutes = require('./routes/profile');
const recommendationRoutes = require('./routes/recommendations');
const agentRoutes = require('./routes/agent');
const reflectionRoutes = require('./routes/reflections');
const artworkRoutes = require('./routes/artworks');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Trust proxy for production
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`🎨 SAYU Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// ================================
// src/config/database.js - PostgreSQL + pgvector
// ================================
const { Pool } = require('pg');
const pgvector = require('pgvector/pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function connectDatabase() {
  try {
    await pool.connect();
    await pgvector.registerType(pool);
    console.log('✅ Connected to PostgreSQL with pgvector');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Helper for transactions
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, connectDatabase, withTransaction };

// ================================
// src/config/redis.js - Redis for caching
// ================================
const { createClient } = require('redis');

let redisClient;

async function connectRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  
  await redisClient.connect();
  console.log('✅ Connected to Redis');
}

module.exports = { redisClient, connectRedis };

// ================================
// src/services/openai.js - AI Integration
// ================================
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  // Analyze quiz responses with philosophical depth
  async analyzeQuizResponses(responses) {
    const prompt = `
    Analyze these art preference responses to create a comprehensive psychological and philosophical profile.
    
    Exhibition responses: ${JSON.stringify(responses.exhibition)}
    Artwork responses: ${JSON.stringify(responses.artwork)}
    
    Generate a detailed analysis including:
    1. 4-letter type code (G/S, A/R, E/M, F/C)
    2. Poetic archetype name (2-3 words, evocative)
    3. One-line essence description
    4. Detailed personality analysis (200+ words)
    5. 15-20 emotional tags
    6. Aesthetic preferences
    7. Philosophical orientation (relationship to art)
    8. Growth trajectory potential
    9. Recommended interaction style
    10. Personalization preferences (UI, pace, depth)
    
    Return as structured JSON.
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert art psychologist and philosopher with deep understanding of human aesthetic experience."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error('Failed to analyze quiz responses');
    }
  }

  // Generate profile visualization
  async generateProfileImage(profile) {
    const styleMap = {
      'G': 'solitary gallery viewer, minimalist space',
      'S': 'social art experience, vibrant gallery',
      'A': 'abstract art environment, conceptual space',
      'R': 'classical museum, representational works',
      'E': 'emotionally charged atmosphere, dramatic lighting',
      'M': 'intellectual setting, analytical viewing',
      'F': 'focused on single artwork, intimate space',
      'C': 'comprehensive collection, expansive gallery'
    };
    
    const elements = profile.typeCode.split('').map(code => styleMap[code]);
    
    const prompt = `
    Create a cinematic, photorealistic image of a person experiencing art.
    
    Profile: ${profile.archetypeName} - ${profile.description}
    Setting elements: ${elements.join(', ')}
    Emotional tone: ${profile.emotionalTags.slice(0, 5).join(', ')}
    
    Style: Professional photography, dramatic lighting, depth of field
    Composition: Rule of thirds, leading lines to artwork
    Mood: ${profile.dominantMood || 'contemplative'}
    Colors: Sophisticated, gallery-appropriate palette
    
    The viewer should be shown from behind or in profile, creating mystery.
    Include subtle details that reflect their personality type.
    `;
    
    try {
      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        style: "natural"
      });
      
      return image.data[0].url;
    } catch (error) {
      console.error('Image generation error:', error);
      // Return a fallback image URL
      return `https://source.unsplash.com/1792x1024/?art,museum,${profile.typeCode}`;
    }
  }

  // Generate embeddings for semantic search
  async generateEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 384
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Analyze artwork for emotional and aesthetic qualities
  async analyzeArtwork(artwork) {
    const prompt = `
    Analyze this artwork for emotional, aesthetic, and philosophical qualities:
    
    Title: ${artwork.title}
    Artist: ${artwork.artist}
    Year: ${artwork.year || 'Unknown'}
    Medium: ${artwork.medium || 'Unknown'}
    Description: ${artwork.description || 'No description available'}
    
    Provide comprehensive analysis:
    1. Emotional tags (15-20 specific emotions/moods)
    2. Style tags (movement, technique, approach)
    3. Theme tags (subjects, concepts, meanings)
    4. Symbolic elements present
    5. Viewer experience description
    6. Color analysis (dominant palette, emotional impact)
    7. Composition notes (structure, flow, focus)
    8. Philosophical themes (existential, aesthetic, social)
    9. Transformation potential (how it might change viewers)
    10. Connection pathways (what it might remind viewers of)
    
    Format as detailed JSON.
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" }
      });
      
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Artwork analysis error:', error);
      throw new Error('Failed to analyze artwork');
    }
  }

  // Generate personalized recommendation explanation
  async explainRecommendation(userProfile, artwork, matchScore) {
    const prompt = `
    Create a personalized, conversational explanation for why this artwork matches this user.
    
    User Profile:
    - Archetype: ${userProfile.archetypeName} (${userProfile.typeCode})
    - Key traits: ${userProfile.emotionalTags.slice(0, 5).join(', ')}
    - Aesthetic preference: ${userProfile.aestheticPreference}
    
    Artwork:
    - Title: "${artwork.title}" by ${artwork.artist}
    - Emotional qualities: ${artwork.emotionalTags.slice(0, 5).join(', ')}
    - Themes: ${artwork.themeTags.slice(0, 3).join(', ')}
    
    Match score: ${Math.round(matchScore * 100)}%
    
    Write a warm, insightful 2-3 sentence explanation that:
    - Connects the artwork to their personality
    - Highlights what they might discover
    - Invites deeper engagement
    - Uses their preferred communication style
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 150
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Explanation generation error:', error);
      return "This artwork resonates with your unique perspective.";
    }
  }

  // Curator agent conversation
  async curatorChat(userId, message, context) {
    const systemPrompt = `
    You are SAYU's personal art curator - warm, insightful, and deeply attuned to emotional connections with art.
    
    User Profile: ${JSON.stringify(context.profile)}
    Recent interactions: ${JSON.stringify(context.recentInteractions)}
    Current emotional state: ${context.emotionalState}
    
    Guidelines:
    - Be warm and approachable, never condescending
    - Focus on emotional resonance over historical facts
    - Use sensory language to describe artworks
    - Adapt to their communication style
    - Encourage deeper reflection
    - Make surprising connections
    - Remember their journey and growth
    
    Their preferred interaction style: ${context.profile.interactionStyle}
    Their current journey stage: ${context.profile.journeyStage}
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...context.conversationHistory,
          { role: "user", content: message }
        ],
        temperature: 0.85,
        max_tokens: 500
      });
      
      return {
        text: completion.choices[0].message.content,
        suggestions: await this.generateFollowUpSuggestions(context),
        relatedArtworks: await this.findRelatedArtworks(message, context)
      };
    } catch (error) {
      console.error('Curator chat error:', error);
      throw new Error('Failed to generate response');
    }
  }

  // Generate reflection prompts based on interaction
  async generateReflectionPrompts(userId, interaction) {
    const prompt = `
    Based on this art interaction, generate thoughtful reflection prompts:
    
    Interaction type: ${interaction.type}
    Artwork: ${interaction.artwork?.title}
    Duration: ${interaction.duration} seconds
    Emotional response: ${interaction.emotionalResponse}
    User archetype: ${interaction.userProfile?.archetypeName}
    
    Create 3-4 prompts that:
    1. Match their reflection style
    2. Deepen their engagement
    3. Connect to their life
    4. Open new perspectives
    
    Return as JSON array of prompt objects with 'question' and 'type' fields.
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      return JSON.parse(completion.choices[0].message.content).prompts;
    } catch (error) {
      console.error('Reflection prompt error:', error);
      return [
        { question: "What emotions surfaced as you experienced this work?", type: "emotional" },
        { question: "How does this connect to your current life?", type: "personal" }
      ];
    }
  }

  async generateFollowUpSuggestions(context) {
    // Generate contextual follow-up suggestions
    return [
      "Tell me more about what draws you to this",
      "Show me similar works that moved me before",
      "How does this connect to my journey?"
    ];
  }

  async findRelatedArtworks(message, context) {
    // This would query the database for related artworks
    // For now, returning empty array
    return [];
  }
}

module.exports = new AIService();

// ================================
// src/models/User.js - User Model with Philosophy
// ================================
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
      personalManifesto
    } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (
        id, email, password_hash, nickname, age, location,
        personal_manifesto, agency_level, aesthetic_journey_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, nickname, agency_level, created_at
    `;
    
    const values = [
      id,
      email,
      hashedPassword,
      nickname,
      age,
      location ? JSON.stringify(location) : null,
      personalManifesto,
      'explorer', // Default agency level
      'discovering' // Default journey stage
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

  async updateJourneyStage(userId, newStage) {
    const query = `
      UPDATE users 
      SET aesthetic_journey_stage = $1, 
          last_meaningful_interaction = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [newStage, userId]);
    return result.rows[0];
  }

  async updateAgencyLevel(userId, newLevel) {
    const query = `
      UPDATE users 
      SET agency_level = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [newLevel, userId]);
    return result.rows[0];
  }

  async addToTrustedNetwork(userId, trustedUserId) {
    const query = `
      UPDATE users 
      SET trusted_network = array_append(trusted_network, $1)
      WHERE id = $2 AND NOT ($1 = ANY(trusted_network))
      RETURNING trusted_network
    `;
    
    const result = await pool.query(query, [trustedUserId, userId]);
    return result.rows[0];
  }

  async updateUIPreferences(userId, preferences) {
    const query = `
      UPDATE users 
      SET ui_theme_preference = $1
      WHERE id = $2
      RETURNING ui_theme_preference
    `;
    
    const result = await pool.query(query, [JSON.stringify(preferences), userId]);
    return result.rows[0];
  }
}

module.exports = new UserModel();

// ================================
// src/models/Profile.js - Enhanced Profile Model
// ================================
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const pgvector = require('pgvector/pg');

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
      pgvector.toSql(cognitiveVector),
      pgvector.toSql(emotionalVector),
      pgvector.toSql(aestheticVector),
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

  async updateEvolution(profileId, evolutionData) {
    const query = `
      UPDATE user_profiles 
      SET archetype_evolution_stage = archetype_evolution_stage + 1,
          last_major_shift = NOW(),
          growth_trajectory = growth_trajectory || $1::jsonb
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [JSON.stringify(evolutionData), profileId]);
    return result.rows[0];
  }

  async findSimilarProfiles(profileId, limit = 10) {
    const query = `
      WITH target_profile AS (
        SELECT cognitive_vector, emotional_vector, aesthetic_vector 
        FROM user_profiles 
        WHERE id = $1
      )
      SELECT 
        up.*,
        (1 - (up.cognitive_vector <=> tp.cognitive_vector)) AS cognitive_similarity,
        (1 - (up.emotional_vector <=> tp.emotional_vector)) AS emotional_similarity,
        (1 - (up.aesthetic_vector <=> tp.aesthetic_vector)) AS aesthetic_similarity
      FROM user_profiles up, target_profile tp
      WHERE up.id != $1
      ORDER BY (up.cognitive_vector <=> tp.cognitive_vector) + 
               (up.emotional_vector <=> tp.emotional_vector) + 
               (up.aesthetic_vector <=> tp.aesthetic_vector)
      LIMIT $2
    `;
    
    const result = await pool.query(query, [profileId, limit]);
    return result.rows;
  }
}

module.exports = new ProfileModel();

// ================================
// src/models/Quiz.js - Quiz Session Model
// ================================
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

// ================================
// src/models/Interaction.js - Meaningful Interactions
// ================================
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class InteractionModel {
  async create(interactionData) {
    const {
      userId,
      targetType,
      targetId,
      interactionDepth,
      emotionalIntensity,
      cognitiveEngagement,
      personalMeaning,
      universalThemes,
      questionsRaised,
      insightsGained,
      context,
      transformationLevel
    } = interactionData;
    
    const id = uuidv4();
    
    const query = `
      INSERT INTO meaningful_interactions (
        id, user_id, target_type, target_id, interaction_depth,
        emotional_intensity, cognitive_engagement, personal_meaning,
        universal_themes, questions_raised, insights_gained,
        physical_context, emotional_context, social_context,
        transformation_level
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *
    `;
    
    const values = [
      id,
      userId,
      targetType,
      targetId,
      interactionDepth,
      emotionalIntensity,
      cognitiveEngagement,
      personalMeaning,
      universalThemes,
      questionsRaised,
      insightsGained,
      JSON.stringify(context.physical || {}),
      JSON.stringify(context.emotional || {}),
      JSON.stringify(context.social || {}),
      transformationLevel
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getUserInteractions(userId, limit = 20) {
    const query = `
      SELECT mi.*, a.title as artwork_title, a.artist
      FROM meaningful_interactions mi
      LEFT JOIN artworks a ON mi.target_id = a.id AND mi.target_type = 'artwork'
      WHERE mi.user_id = $1
      ORDER BY mi.timestamp DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  async getTransformativeInteractions(userId) {
    const query = `
      SELECT * FROM meaningful_interactions
      WHERE user_id = $1 AND transformation_level >= 7
      ORDER BY transformation_level DESC, timestamp DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new InteractionModel();

// ================================
// src/models/Reflection.js - Living Reflections
// ================================
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ReflectionModel {
  async create(reflectionData) {
    const {
      userId,
      title,
      content,
      emotionalSummary,
      cognitiveSummary,
      artworkIds,
      privacyLevel
    } = reflectionData;
    
    const id = uuidv4();
    
    const query = `
      INSERT INTO reflections (
        id, user_id, title, content, emotional_summary,
        cognitive_summary, artwork_ids, privacy_level, stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'initial')
      RETURNING *
    `;
    
    const values = [
      id,
      userId,
      title,
      content,
      JSON.stringify(emotionalSummary),
      JSON.stringify(cognitiveSummary),
      artworkIds,
      privacyLevel
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(reflectionId, updates) {
    const { content, stage, iterations } = updates;
    
    const query = `
      UPDATE reflections 
      SET content = COALESCE($1, content),
          stage = COALESCE($2, stage),
          iterations = iterations || $3::jsonb,
          last_evolved = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [
      content,
      stage,
      iterations ? JSON.stringify([iterations]) : '[]',
      reflectionId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getUserReflections(userId, privacyFilter = null) {
    let query = `
      SELECT r.*, 
        array_agg(DISTINCT a.title) as artwork_titles,
        array_agg(DISTINCT a.artist) as artists
      FROM reflections r
      LEFT JOIN artworks a ON a.id = ANY(r.artwork_ids)
      WHERE r.user_id = $1
    `;
    
    const values = [userId];
    
    if (privacyFilter) {
      query += ' AND r.privacy_level = $2';
      values.push(privacyFilter);
    }
    
    query += ' GROUP BY r.id ORDER BY r.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  async share(reflectionId, sharedWith) {
    const query = `
      UPDATE reflections 
      SET shared_with = array_cat(shared_with, $1),
          privacy_level = CASE 
            WHEN privacy_level = 'private' THEN 'trusted'
            ELSE privacy_level
          END
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [sharedWith, reflectionId]);
    return result.rows[0];
  }

  async incrementEngagement(reflectionId, engagementType) {
    const columnMap = {
      'view': 'views_count',
      'dialogue': 'sparked_dialogues',
      'inspire': 'inspired_reflections'
    };
    
    const column = columnMap[engagementType];
    if (!column) return null;
    
    const query = `
      UPDATE reflections 
      SET ${column} = ${column} + 1
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [reflectionId]);
    return result.rows[0];
  }
}

module.exports = new ReflectionModel();

// ================================
// src/models/Artwork.js - Living Artwork Model
// ================================
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const pgvector = require('pgvector/pg');

class ArtworkModel {
  async create(artworkData) {
    const {
      externalId,
      source,
      title,
      artist,
      yearCreated,
      medium,
      description,
      imageUrl,
      emotionalTags,
      styleTags,
      themeTags,
      visualEmbedding,
      semanticEmbedding,
      contributorId,
      contributorType
    } = artworkData;
    
    const id = uuidv4();
    
    const query = `
      INSERT INTO artworks (
        id, external_id, source, title, artist, year_created,
        medium, description, image_url, emotional_tags, style_tags,
        theme_tags, visual_embedding, semantic_embedding,
        contributor_id, contributor_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT (external_id, source) DO UPDATE
      SET title = EXCLUDED.title,
          emotional_tags = EXCLUDED.emotional_tags,
          last_engaged = NOW()
      RETURNING *
    `;
    
    const values = [
      id,
      externalId,
      source,
      title,
      artist,
      yearCreated,
      medium,
      description,
      imageUrl,
      emotionalTags,
      styleTags,
      themeTags,
      pgvector.toSql(visualEmbedding),
      pgvector.toSql(semanticEmbedding),
      contributorId,
      contributorType
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM artworks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async search(params) {
    const { query: searchQuery, emotionalTags, limit = 20, offset = 0 } = params;
    
    let query = `
      SELECT * FROM artworks
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;
    
    if (searchQuery) {
      paramCount++;
      query += ` AND (
        title ILIKE $${paramCount} OR 
        artist ILIKE $${paramCount} OR 
        description ILIKE $${paramCount}
      )`;
      values.push(`%${searchQuery}%`);
    }
    
    if (emotionalTags && emotionalTags.length > 0) {
      paramCount++;
      query += ` AND emotional_tags && $${paramCount}`;
      values.push(emotionalTags);
    }
    
    query += ` ORDER BY engagement_score DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  async findSimilar(artworkId, limit = 10) {
    const query = `
      WITH target_artwork AS (
        SELECT visual_embedding, semantic_embedding, emotional_tags
        FROM artworks
        WHERE id = $1
      )
      SELECT 
        a.*,
        1 - (a.visual_embedding <=> ta.visual_embedding) AS visual_similarity,
        1 - (a.semantic_embedding <=> ta.semantic_embedding) AS semantic_similarity,
        cardinality(a.emotional_tags::text[] & ta.emotional_tags::text[]) AS emotional_overlap
      FROM artworks a, target_artwork ta
      WHERE a.id != $1
      ORDER BY 
        (a.visual_embedding <=> ta.visual_embedding) + 
        (a.semantic_embedding <=> ta.semantic_embedding)
      LIMIT $2
    `;
    
    const result = await pool.query(query, [artworkId, limit]);
    return result.rows;
  }

  async incrementEngagement(artworkId, engagementType) {
    const updates = {
      'view': 'interaction_count = interaction_count + 1',
      'like': 'emotional_resonance_score = emotional_resonance_score + 0.1',
      'reflect': 'meaning_richness_score = meaning_richness_score + 0.2',
      'dialogue': 'dialogues_sparked = dialogues_sparked + 1',
      'transform': 'transformative_encounters = transformative_encounters + 1'
    };
    
    const update = updates[engagementType];
    if (!update) return null;
    
    const query = `
      UPDATE artworks 
      SET ${update}, last_engaged = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [artworkId]);
    return result.rows[0];
  }
}

module.exports = new ArtworkModel();

// ================================
// src/controllers/authController.js
// ================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, nickname, age, location, personalManifesto } = req.body;

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
        personalManifesto
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          agencyLevel: user.agency_level
        },
        token
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

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

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
        token
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
}

module.exports = new AuthController();

// ================================
// src/controllers/quizController.js
// ================================
const QuizModel = require('../models/Quiz');
const ProfileModel = require('../models/Profile');
const AIService = require('../services/openai');
const { redisClient } = require('../config/redis');

// Quiz questions data
const exhibitionQuestions = require('../data/exhibitionQuestions');
const artworkQuestions = require('../data/artworkQuestions');

class QuizController {
  async startQuiz(req, res) {
    try {
      const { sessionType } = req.body;
      const userId = req.userId;

      // Create quiz session
      const session = await QuizModel.createSession(userId, sessionType);

      // Cache session state
      await redisClient.setEx(
        `quiz:${session.id}`,
        3600, // 1 hour
        JSON.stringify({
          userId,
          sessionType,
          currentQuestion: 0,
          responses: {},
          startTime: Date.now()
        })
      );

      // Get first question
      const questions = sessionType === 'exhibition' ? exhibitionQuestions : artworkQuestions.core;
      const firstQuestion = questions[0];

      res.json({
        sessionId: session.id,
        sessionType,
        totalQuestions: sessionType === 'exhibition' ? 14 : 12,
        currentQuestion: 1,
        question: firstQuestion
      });
    } catch (error) {
      console.error('Start quiz error:', error);
      res.status(500).json({ error: 'Failed to start quiz' });
    }
  }

  async submitAnswer(req, res) {
    try {
      const { sessionId, questionId, answer, timeSpent } = req.body;

      // Get session from cache
      const sessionData = await redisClient.get(`quiz:${sessionId}`);
      if (!sessionData) {
        return res.status(404).json({ error: 'Session expired' });
      }

      const session = JSON.parse(sessionData);

      // Record response
      session.responses[questionId] = {
        answer,
        timeSpent,
        timestamp: Date.now()
      };

      // Update current question
      session.currentQuestion++;

      // Determine next question
      let nextQuestion = null;
      const isExhibition = session.sessionType === 'exhibition';
      
      if (isExhibition) {
        if (session.currentQuestion < exhibitionQuestions.length) {
          nextQuestion = exhibitionQuestions[session.currentQuestion];
        }
      } else {
        // Artwork quiz with branching logic
        if (session.currentQuestion < 8) {
          nextQuestion = artworkQuestions.core[session.currentQuestion];
        } else if (session.currentQuestion === 8) {
          // Determine branch
          const branch = this.determineBranch(session.responses);
          session.branch = branch;
          nextQuestion = artworkQuestions[branch][0];
        } else if (session.currentQuestion < 12) {
          const branchIndex = session.currentQuestion - 8;
          nextQuestion = artworkQuestions[session.branch][branchIndex];
        }
      }

      // Update cache
      await redisClient.setEx(`quiz:${sessionId}`, 3600, JSON.stringify(session));

      // Check if quiz is complete
      const isComplete = (isExhibition && session.currentQuestion >= 14) ||
                        (!isExhibition && session.currentQuestion >= 12);

      if (isComplete) {
        return this.completeQuiz(req, res);
      }

      res.json({
        currentQuestion: session.currentQuestion + 1,
        totalQuestions: isExhibition ? 14 : 12,
        question: nextQuestion,
        progress: session.currentQuestion / (isExhibition ? 14 : 12)
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  async completeQuiz(req, res) {
    try {
      const { sessionId } = req.body;

      // Get session data
      const sessionData = await redisClient.get(`quiz:${sessionId}`);
      if (!sessionData) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = JSON.parse(sessionData);
      const timeSpent = Math.floor((Date.now() - session.startTime) / 1000);

      // Update quiz session in database
      await QuizModel.updateSession(sessionId, {
        responses: session.responses,
        completedAt: new Date(),
        timeSpent,
        completionRate: 1.0
      });

      // Check if both quizzes are complete
      const userSessions = await QuizModel.getUserSessions(session.userId);
      const hasExhibition = userSessions.some(s => s.session_type === 'exhibition' && s.completed_at);
      const hasArtwork = userSessions.some(s => s.session_type === 'artwork' && s.completed_at);

      if (hasExhibition && hasArtwork) {
        // Generate profile
        const profile = await this.generateProfile(session.userId);
        
        res.json({
          complete: true,
          profileGenerated: true,
          profile: {
            typeCode: profile.type_code,
            archetypeName: profile.archetype_name,
            description: profile.archetype_description
          },
          nextStep: 'view_profile'
        });
      } else {
        res.json({
          complete: true,
          profileGenerated: false,
          nextStep: hasExhibition ? 'artwork_quiz' : 'exhibition_quiz'
        });
      }

      // Clear cache
      await redisClient.del(`quiz:${sessionId}`);
    } catch (error) {
      console.error('Complete quiz error:', error);
      res.status(500).json({ error: 'Failed to complete quiz' });
    }
  }

  determineBranch(responses) {
    // Analyze responses to determine branch
    const tagCounts = {};
    
    Object.entries(responses).forEach(([questionId, response]) => {
      // Find question and selected option
      const question = artworkQuestions.core.find(q => q.id === questionId);
      if (question) {
        const option = question.options.find(o => o.id === response.answer);
        if (option && option.tags) {
          option.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    // Calculate branch scores
    const paintingScore = (tagCounts['vibrant_color'] || 0) + 
                         (tagCounts['brushwork'] || 0) +
                         (tagCounts['traditional'] || 0);
    
    const multidimScore = (tagCounts['spatial'] || 0) +
                         (tagCounts['installation'] || 0) +
                         (tagCounts['multimedia'] || 0);

    if (paintingScore > multidimScore * 1.5) return 'painting';
    if (multidimScore > paintingScore * 1.5) return 'multidimensional';
    return 'mixed';
  }

  async generateProfile(userId) {
    try {
      // Get all quiz responses
      const sessions = await QuizModel.getUserSessions(userId);
      const exhibitionSession = sessions.find(s => s.session_type === 'exhibition');
      const artworkSession = sessions.find(s => s.session_type === 'artwork');

      // Prepare data for AI analysis
      const quizData = {
        exhibition: exhibitionSession.responses,
        artwork: artworkSession.responses
      };

      // Get AI analysis
      const aiAnalysis = await AIService.analyzeQuizResponses(quizData);

      // Generate profile image
      const profileImageUrl = await AIService.generateProfileImage(aiAnalysis);

      // Generate embeddings for the profile
      const profileText = `${aiAnalysis.archetypeName} ${aiAnalysis.description} ${aiAnalysis.emotionalTags.join(' ')}`;
      const cognitiveVector = await AIService.generateEmbedding(profileText);
      const emotionalVector = await AIService.generateEmbedding(aiAnalysis.emotionalTags.join(' '));
      const aestheticVector = await AIService.generateEmbedding(aiAnalysis.aestheticPreferences.join(' '));

      // Create profile
      const profile = await ProfileModel.create({
        userId,
        typeCode: aiAnalysis.typeCode,
        archetypeName: aiAnalysis.archetypeName,
        archetypeDescription: aiAnalysis.description,
        exhibitionScores: aiAnalysis.exhibitionScores,
        artworkScores: aiAnalysis.artworkScores,
        emotionalTags: aiAnalysis.emotionalTags,
        cognitiveVector,
        emotionalVector,
        aestheticVector,
        personalityConfidence: aiAnalysis.confidence || 0.85,
        uiCustomization: aiAnalysis.personalizationPreferences,
        interactionStyle: aiAnalysis.interactionStyle,
        generatedImageUrl: profileImageUrl
      });

      return profile;
    } catch (error) {
      console.error('Generate profile error:', error);
      throw error;
    }
  }
}

module.exports = new QuizController();

// ================================
// src/controllers/recommendationController.js
// ================================
const ProfileModel = require('../models/Profile');
const ArtworkModel = require('../models/Artwork');
const InteractionModel = require('../models/Interaction');
const AIService = require('../services/openai');
const { redisClient } = require('../config/redis');

class RecommendationController {
  async getRecommendations(req, res) {
    try {
      const userId = req.userId;
      const { mood, context, limit = 20 } = req.query;

      // Check cache
      const cacheKey = `recommendations:${userId}:${mood || 'default'}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Get user profile
      const profile = await ProfileModel.findByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Get user interactions
      const interactions = await InteractionModel.getUserInteractions(userId, 50);

      // Multi-strategy recommendations
      const recommendations = await this.generateHybridRecommendations(
        userId,
        profile,
        interactions,
        { mood, context }
      );

      // Add AI explanations
      const enrichedRecommendations = await this.enrichWithExplanations(
        profile,
        recommendations.slice(0, limit)
      );

      // Cache for 1 hour
      await redisClient.setEx(
        cacheKey,
        3600,
        JSON.stringify({ recommendations: enrichedRecommendations })
      );

      res.json({ recommendations: enrichedRecommendations });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  async generateHybridRecommendations(userId, profile, interactions, context) {
    const strategies = await Promise.all([
      this.profileBasedRecommendations(profile),
      this.behaviorBasedRecommendations(interactions),
      this.collaborativeRecommendations(profile),
      this.contextualRecommendations(profile, context)
    ]);

    // Merge and rank
    const merged = this.mergeRecommendations(strategies);
    return merged;
  }

  async profileBasedRecommendations(profile) {
    // Find artworks that match user's emotional and aesthetic preferences
    const artworks = await ArtworkModel.search({
      emotionalTags: profile.emotional_tags.slice(0, 5),
      limit: 30
    });

    return artworks.map(artwork => ({
      ...artwork,
      score: this.calculateProfileMatch(profile, artwork),
      source: 'profile'
    }));
  }

  async behaviorBasedRecommendations(interactions) {
    if (interactions.length === 0) return [];

    // Find artworks similar to what user has engaged with
    const engagedArtworkIds = interactions
      .filter(i => i.target_type === 'artwork' && i.transformation_level > 5)
      .map(i => i.target_id);

    if (engagedArtworkIds.length === 0) return [];

    const similarArtworks = await Promise.all(
      engagedArtworkIds.slice(0, 5).map(id => 
        ArtworkModel.findSimilar(id, 10)
      )
    );

    const flattened = similarArtworks.flat();
    return flattened.map(artwork => ({
      ...artwork,
      score: artwork.semantic_similarity * 0.3,
      source: 'behavior'
    }));
  }

  async collaborativeRecommendations(profile) {
    // Find similar profiles
    const similarProfiles = await ProfileModel.findSimilarProfiles(profile.id, 10);
    
    // This would need to be implemented with actual collaborative filtering
    // For now, returning empty array
    return [];
  }

  async contextualRecommendations(profile, context) {
    if (!context.mood && !context.context) return [];

    const contextTags = [];
    
    // Mood-based tags
    if (context.mood) {
      const moodMap = {
        'happy': ['vibrant', 'joyful', 'uplifting'],
        'contemplative': ['thoughtful', 'serene', 'philosophical'],
        'melancholic': ['poignant', 'introspective', 'wistful'],
        'energetic': ['dynamic', 'bold', 'explosive']
      };
      contextTags.push(...(moodMap[context.mood] || []));
    }

    const artworks = await ArtworkModel.search({
      emotionalTags: contextTags,
      limit: 10
    });

    return artworks.map(artwork => ({
      ...artwork,
      score: 0.2,
      source: 'contextual'
    }));
  }

  mergeRecommendations(strategies) {
    const artworkMap = new Map();

    strategies.flat().forEach(rec => {
      if (!rec || !rec.id) return;
      
      if (artworkMap.has(rec.id)) {
        const existing = artworkMap.get(rec.id);
        existing.score += rec.score;
        existing.sources = [...(existing.sources || []), rec.source];
      } else {
        artworkMap.set(rec.id, {
          ...rec,
          sources: [rec.source]
        });
      }
    });

    return Array.from(artworkMap.values())
      .sort((a, b) => b.score - a.score);
  }

  calculateProfileMatch(profile, artwork) {
    // Calculate emotional tag overlap
    const emotionalOverlap = profile.emotional_tags.filter(tag =>
      artwork.emotional_tags?.includes(tag)
    ).length;

    return emotionalOverlap / profile.emotional_tags.length;
  }

  async enrichWithExplanations(profile, recommendations) {
    return Promise.all(
      recommendations.map(async (rec) => {
        const explanation = await AIService.explainRecommendation(
          profile,
          rec,
          rec.score
        );

        return {
          ...rec,
          explanation,
          matchPercentage: Math.round(rec.score * 100)
        };
      })
    );
  }

  async recordInteraction(req, res) {
    try {
      const { artworkId, interactionType, duration } = req.body;
      const userId = req.userId;

      await InteractionModel.create({
        userId,
        targetType: 'artwork',
        targetId: artworkId,
        interactionDepth: interactionType,
        emotionalIntensity: duration > 30 ? 0.8 : 0.5,
        cognitiveEngagement: 0.6,
        context: {
          physical: { device: 'web' },
          emotional: {},
          social: {}
        },
        transformationLevel: 0
      });

      // Update artwork engagement
      await ArtworkModel.incrementEngagement(artworkId, interactionType);

      res.json({ success: true });
    } catch (error) {
      console.error('Record interaction error:', error);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  }
}

module.exports = new RecommendationController();

// ================================
// src/controllers/agentController.js
// ================================
const AIService = require('../services/openai');
const ProfileModel = require('../models/Profile');
const InteractionModel = require('../models/Interaction');
const { redisClient } = require('../config/redis');

class AgentController {
  async chat(req, res) {
    try {
      const { message, context } = req.body;
      const userId = req.userId;

      // Get user profile
      const profile = await ProfileModel.findByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Get conversation history from cache
      const conversationKey = `conversation:${userId}`;
      const history = await redisClient.get(conversationKey);
      const conversationHistory = history ? JSON.parse(history) : [];

      // Get recent interactions for context
      const recentInteractions = await InteractionModel.getUserInteractions(userId, 10);

      // Prepare context
      const aiContext = {
        profile: {
          typeCode: profile.type_code,
          archetypeName: profile.archetype_name,
          emotionalTags: profile.emotional_tags,
          interactionStyle: profile.interaction_style,
          journeyStage: profile.archetype_evolution_stage
        },
        recentInteractions: recentInteractions.map(i => ({
          type: i.target_type,
          title: i.artwork_title,
          emotionalIntensity: i.emotional_intensity
        })),
        conversationHistory: conversationHistory.slice(-5), // Last 5 messages
        emotionalState: context?.mood || 'neutral'
      };

      // Get AI response
      const response = await AIService.curatorChat(userId, message, aiContext);

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.text }
      );
      await redisClient.setEx(
        conversationKey,
        86400, // 24 hours
        JSON.stringify(conversationHistory.slice(-20)) // Keep last 20 messages
      );

      res.json({
        response: response.text,
        suggestions: response.suggestions,
        relatedArtworks: response.relatedArtworks
      });
    } catch (error) {
      console.error('Agent chat error:', error);
      res.status(500).json({ error: 'Failed to process chat' });
    }
  }

  async getMemory(req, res) {
    try {
      const userId = req.userId;

      // Get conversation history
      const conversationKey = `conversation:${userId}`;
      const history = await redisClient.get(conversationKey);

      res.json({
        conversationHistory: history ? JSON.parse(history) : [],
        totalInteractions: history ? JSON.parse(history).length / 2 : 0
      });
    } catch (error) {
      console.error('Get memory error:', error);
      res.status(500).json({ error: 'Failed to get memory' });
    }
  }
}

module.exports = new AgentController();

// ================================
// src/controllers/reflectionController.js
// ================================
const ReflectionModel = require('../models/Reflection');
const InteractionModel = require('../models/Interaction');
const AIService = require('../services/openai');

class ReflectionController {
  async createReflection(req, res) {
    try {
      const { title, content, artworkIds, emotionalSummary, privacyLevel } = req.body;
      const userId = req.userId;

      const reflection = await ReflectionModel.create({
        userId,
        title: title || 'Untitled Reflection',
        content,
        emotionalSummary,
        cognitiveSummary: {}, // AI can enhance this later
        artworkIds: artworkIds || [],
        privacyLevel: privacyLevel || 'private'
      });

      res.status(201).json({ reflection });
    } catch (error) {
      console.error('Create reflection error:', error);
      res.status(500).json({ error: 'Failed to create reflection' });
    }
  }

  async getReflections(req, res) {
    try {
      const userId = req.userId;
      const { privacyLevel } = req.query;

      const reflections = await ReflectionModel.getUserReflections(userId, privacyLevel);

      res.json({ reflections });
    } catch (error) {
      console.error('Get reflections error:', error);
      res.status(500).json({ error: 'Failed to get reflections' });
    }
  }

  async updateReflection(req, res) {
    try {
      const { id } = req.params;
      const { content, stage } = req.body;
      const userId = req.userId;

      // Verify ownership
      const reflection = await ReflectionModel.findById(id);
      if (!reflection || reflection.user_id !== userId) {
        return res.status(404).json({ error: 'Reflection not found' });
      }

      const updated = await ReflectionModel.update(id, {
        content,
        stage,
        iterations: {
          timestamp: new Date(),
          changes: { content, stage }
        }
      });

      res.json({ reflection: updated });
    } catch (error) {
      console.error('Update reflection error:', error);
      res.status(500).json({ error: 'Failed to update reflection' });
    }
  }

  async shareReflection(req, res) {
    try {
      const { id } = req.params;
      const { sharedWith } = req.body;
      const userId = req.userId;

      // Verify ownership
      const reflection = await ReflectionModel.findById(id);
      if (!reflection || reflection.user_id !== userId) {
        return res.status(404).json({ error: 'Reflection not found' });
      }

      const updated = await ReflectionModel.share(id, sharedWith);

      res.json({ reflection: updated });
    } catch (error) {
      console.error('Share reflection error:', error);
      res.status(500).json({ error: 'Failed to share reflection' });
    }
  }

  async getReflectionPrompts(req, res) {
    try {
      const { interactionId } = req.query;
      const userId = req.userId;

      // Get interaction details
      const interaction = await InteractionModel.findById(interactionId);
      if (!interaction || interaction.user_id !== userId) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      // Get user profile for personalization
      const profile = await ProfileModel.findByUserId(userId);

      // Generate AI prompts
      const prompts = await AIService.generateReflectionPrompts(userId, {
        type: interaction.target_type,
        artwork: interaction.artwork_title ? {
          title: interaction.artwork_title,
          artist: interaction.artist
        } : null,
        duration: interaction.duration,
        emotionalResponse: interaction.emotional_intensity,
        userProfile: profile
      });

      res.json({ prompts });
    } catch (error) {
      console.error('Get reflection prompts error:', error);
      res.status(500).json({ error: 'Failed to get prompts' });
    }
  }
}

module.exports = new ReflectionController();

// ================================
// src/routes/auth.js
// ================================
const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nickname').isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 13, max: 120 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

// ================================
// src/routes/quiz.js
// ================================
const router = require('express').Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // All quiz routes require authentication

router.post('/start', quizController.startQuiz);
router.post('/answer', quizController.submitAnswer);
router.post('/complete', quizController.completeQuiz);

module.exports = router;

// ================================
// src/routes/profile.js
// ================================
const router = require('express').Router();
const ProfileModel = require('../models/Profile');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const profile = await ProfileModel.findByUserId(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/preferences', async (req, res) => {
  try {
    const { uiTheme, interactionStyle } = req.body;
    const userId = req.userId;

    await UserModel.updateUIPreferences(userId, {
      mode: uiTheme,
      interactionStyle
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;

// ================================
// src/routes/recommendations.js
// ================================
const router = require('express').Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', recommendationController.getRecommendations.bind(recommendationController));
router.post('/interaction', recommendationController.recordInteraction.bind(recommendationController));

module.exports = router;

// ================================
// src/routes/agent.js
// ================================
const router = require('express').Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/chat', agentController.chat.bind(agentController));
router.get('/memory', agentController.getMemory.bind(agentController));

module.exports = router;

// ================================
// src/routes/reflections.js
// ================================
const router = require('express').Router();
const reflectionController = require('../controllers/reflectionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', reflectionController.createReflection.bind(reflectionController));
router.get('/', reflectionController.getReflections.bind(reflectionController));
router.put('/:id', reflectionController.updateReflection.bind(reflectionController));
router.post('/:id/share', reflectionController.shareReflection.bind(reflectionController));
router.get('/prompts', reflectionController.getReflectionPrompts.bind(reflectionController));

module.exports = router;

// ================================
// src/routes/artworks.js
// ================================
const router = require('express').Router();
const ArtworkModel = require('../models/Artwork');
const authMiddleware = require('../middleware/auth');

router.get('/search', async (req, res) => {
  try {
    const { q, tags, limit, offset } = req.query;

    const artworks = await ArtworkModel.search({
      query: q,
      emotionalTags: tags ? tags.split(',') : null,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    res.json({ artworks, total: artworks.length });
  } catch (error) {
    console.error('Search artworks error:', error);
    res.status(500).json({ error: 'Failed to search artworks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artwork = await ArtworkModel.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    res.json({ artwork });
  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ error: 'Failed to get artwork' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const { limit } = req.query;
    const similar = await ArtworkModel.findSimilar(
      req.params.id,
      parseInt(limit) || 10
    );

    res.json({ artworks: similar });
  } catch (error) {
    console.error('Get similar artworks error:', error);
    res.status(500).json({ error: 'Failed to get similar artworks' });
  }
});

module.exports = router;

// ================================
// src/routes/analytics.js - B2B Analytics
// ================================
const router = require('express').Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// This would have additional authorization for B2B clients
router.use(authMiddleware);

router.get('/exhibition/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Get visitor segments
    const segmentsQuery = `
      SELECT 
        up.type_code,
        up.archetype_name,
        COUNT(DISTINCT mi.user_id) as visitor_count,
        AVG(mi.emotional_intensity) as avg_emotional_intensity,
        AVG(mi.transformation_level) as avg_transformation
      FROM meaningful_interactions mi
      JOIN user_profiles up ON mi.user_id = up.user_id
      WHERE mi.target_id = $1 
        AND mi.target_type = 'exhibition'
        AND mi.timestamp BETWEEN $2 AND $3
      GROUP BY up.type_code, up.archetype_name
      ORDER BY visitor_count DESC
    `;

    const segments = await pool.query(segmentsQuery, [
      id,
      startDate || '2024-01-01',
      endDate || new Date()
    ]);

    // Get artwork performance
    const artworkQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT mi.user_id) as unique_viewers,
        AVG(mi.emotional_intensity) as avg_emotional_response,
        SUM(CASE WHEN mi.interaction_depth = 'transform' THEN 1 ELSE 0 END) as transformative_encounters
      FROM artworks a
      JOIN meaningful_interactions mi ON mi.target_id = a.id
      WHERE a.id IN (
        SELECT unnest(artwork_ids) FROM exhibitions WHERE id = $1
      )
      GROUP BY a.id
      ORDER BY transformative_encounters DESC
    `;

    const artworkPerformance = await pool.query(artworkQuery, [id]);

    res.json({
      exhibitionId: id,
      dateRange: { startDate, endDate },
      visitorSegments: segments.rows,
      artworkPerformance: artworkPerformance.rows,
      summary: {
        totalVisitors: segments.rows.reduce((sum, s) => sum + parseInt(s.visitor_count), 0),
        avgEmotionalIntensity: segments.rows.reduce((sum, s) => sum + parseFloat(s.avg_emotional_intensity), 0) / segments.rows.length,
        topArtwork: artworkPerformance.rows[0]
      }
    });
  } catch (error) {
    console.error('Get exhibition analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;

// ================================
// src/middleware/auth.js
// ================================
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ================================
// src/data/exhibitionQuestions.js
// ================================
module.exports = [
  {
    id: 'E1',
    dimension: 'G/S',
    question: 'When I view exhibitions, I usually prefer',
    options: [
      { 
        id: 'A', 
        text: 'To quietly appreciate it alone',
        weight: { G: 1, S: 0 }
      },
      { 
        id: 'B', 
        text: 'To discuss what I see with someone',
        weight: { G: 0, S: 1 }
      }
    ]
  },
  {
    id: 'E2',
    dimension: 'G/S',
    question: 'After I view an exhibition, I usually',
    options: [
      { 
        id: 'A', 
        text: 'Organize my thoughts internally or write quietly',
        weight: { G: 1, S: 0 }
      },
      { 
        id: 'B', 
        text: 'Share my impressions on SNS or chat with others',
        weight: { G: 0, S: 1 }
      }
    ]
  },
  {
    id: 'E3',
    dimension: 'G/S',
    question: 'When I see artworks, I often',
    options: [
      { 
        id: 'A', 
        text: 'Feel enough by sensing them internally',
        weight: { G: 1, S: 0 }
      },
      { 
        id: 'B', 
        text: 'Want to express my thoughts or emotions immediately',
        weight: { G: 0, S: 1 }
      }
    ]
  },
  {
    id: 'E4',
    dimension: 'A/R',
    question: "I'm more drawn to",
    options: [
      { 
        id: 'A', 
        text: 'Vague, imaginative or abstract works',
        weight: { A: 1, R: 0 }
      },
      { 
        id: 'B', 
        text: 'Clear and realistic depictions of figures or scenes',
        weight: { A: 0, R: 1 }
      }
    ]
  },
  {
    id: 'E5',
    dimension: 'A/R',
    question: 'I prefer artworks that',
    options: [
      { 
        id: 'A', 
        text: 'May not be specific but resonate emotionally',
        weight: { A: 1, R: 0 }
      },
      { 
        id: 'B', 
        text: 'Are clearly narrative or descriptive',
        weight: { A: 0, R: 1 }
      }
    ]
  },
  {
    id: 'E6',
    dimension: 'A/R',
    question: "I'm more drawn to exhibitions that feature",
    options: [
      { 
        id: 'A', 
        text: 'Sensory experiences like light, sound, or spatial flow',
        weight: { A: 1, R: 0 }
      },
      { 
        id: 'B', 
        text: 'Detailed visuals like brushwork and composition',
        weight: { A: 0, R: 1 }
      }
    ]
  },
  {
    id: 'E7',
    dimension: 'E/M',
    question: 'When viewing an artwork, I usually focus on',
    options: [
      { 
        id: 'A', 
        text: 'The emotion or atmosphere of the moment',
        weight: { E: 1, M: 0 }
      },
      { 
        id: 'B', 
        text: "The artist's intention and background",
        weight: { E: 0, M: 1 }
      }
    ]
  },
  {
    id: 'E8',
    dimension: 'E/M',
    question: 'After viewing, what stays with me longer is',
    options: [
      { 
        id: 'A', 
        text: 'A visual or emotional impression',
        weight: { E: 1, M: 0 }
      },
      { 
        id: 'B', 
        text: 'The meaning and message of the work',
        weight: { E: 0, M: 1 }
      }
    ]
  },
  {
    id: 'E9',
    dimension: 'E/M',
    question: 'I tend to appreciate',
    options: [
      { 
        id: 'A', 
        text: 'Exhibitions that let me walk freely',
        weight: { E: 1, M: 0 }
      },
      { 
        id: 'B', 
        text: 'Structured exhibitions with a clear order and explanation',
        weight: { E: 0, M: 1 }
      }
    ]
  },
  {
    id: 'E10',
    dimension: 'F/C',
    question: 'Before I visit an exhibition',
    options: [
      { 
        id: 'A', 
        text: 'I go with rough ideas and explore freely',
        weight: { F: 0, C: 1 }
      },
      { 
        id: 'B', 
        text: 'I research the artist and works in detail',
        weight: { F: 1, C: 0 }
      }
    ]
  },
  {
    id: 'E11',
    dimension: 'F/C',
    question: 'When I go to an exhibition',
    options: [
      { 
        id: 'A', 
        text: 'I plan the schedule and locations very specifically',
        weight: { F: 1, C: 0 }
      },
      { 
        id: 'B', 
        text: 'I want to experience it firsthand without prior knowledge',
        weight: { F: 0, C: 1 }
      }
    ]
  },
  {
    id: 'E12',
    dimension: 'F/C',
    question: 'My preferred exhibition space is',
    options: [
      { 
        id: 'A', 
        text: 'One with open flow between sections',
        weight: { F: 0, C: 1 }
      },
      { 
        id: 'B', 
        text: "One that's well-divided into themed rooms",
        weight: { F: 1, C: 0 }
      }
    ]
  },
  {
    id: 'E13',
    dimension: 'Mixed',
    question: 'After an exhibition',
    options: [
      { 
        id: 'A', 
        text: 'I want to remember a scene or feeling',
        weight: { E: 0.5, M: 0 }
      },
      { 
        id: 'B', 
        text: 'I want to re-analyze the exhibition or artist',
        weight: { E: 0, M: 0.5 }
      }
    ]
  },
  {
    id: 'E14',
    dimension: 'Mixed',
    question: "When I'm deeply impressed",
    options: [
      { 
        id: 'A', 
        text: 'I hold the feeling in mind',
        weight: { G: 0.5, E: 0.5 }
      },
      { 
        id: 'B', 
        text: 'I investigate and research further',
        weight: { S: 0.5, M: 0.5 }
      }
    ]
  }
];

// ================================
// src/data/artworkQuestions.js
// ================================
module.exports = {
  core: [
    {
      id: 'C1',
      type: 'visual',
      question: 'Which painting feels more intriguing to you?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C1_A.png',
          tags: ['symbolic_complexity', 'layered_narrative'],
          description: 'A symbolic scene with a layered narrative'
        },
        {
          id: 'B',
          image: '/images/quiz/C1_B.png',
          tags: ['clear_composition', 'sharp_lines'],
          description: 'A clear and calm composition with sharp lines'
        }
      ]
    },
    {
      id: 'C2',
      type: 'visual',
      question: 'Which image leaves a deeper impression?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C2_A.png',
          tags: ['spatial_structure', 'vivid_flow'],
          description: 'A composition with strong spatial structure and vivid flow'
        },
        {
          id: 'B',
          image: '/images/quiz/C2_B.png',
          tags: ['vibrant_color', 'eye_catching'],
          description: 'A scene of vibrant colors that catches your eye immediately'
        }
      ]
    },
    {
      id: 'C3',
      type: 'text',
      question: 'Which scene evokes more emotional resonance?',
      options: [
        {
          id: 'A',
          text: 'A complex abstract scene blending emotion and story',
          tags: ['abstract', 'emotional_blend']
        },
        {
          id: 'B',
          text: 'A realistic scene with clear emotional expression',
          tags: ['realistic', 'clear_emotion']
        }
      ]
    },
    {
      id: 'C4',
      type: 'text',
      question: 'Which composition feels more immersive?',
      options: [
        {
          id: 'A',
          text: 'A deep-toned layered background and immersive atmosphere',
          tags: ['deep_tones', 'atmospheric']
        },
        {
          id: 'B',
          text: 'A calm, precise composition with clear structure',
          tags: ['precise', 'structured']
        }
      ]
    },
    {
      id: 'C5',
      type: 'visual',
      question: 'Which painting would you like to look at longer?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C5_A.png',
          tags: ['poetic_abstract', 'emotional_memory'],
          description: 'A poetic abstract scene evoking emotional memory'
        },
        {
          id: 'B',
          image: '/images/quiz/C5_B.png',
          tags: ['figurative', 'narrative'],
          description: 'A figurative scene with clear story and characters'
        }
      ]
    },
    {
      id: 'C6',
      type: 'text',
      question: 'Which image expresses strong rhythm or flow?',
      options: [
        {
          id: 'A',
          text: 'A space where light and color flow together harmoniously',
          tags: ['light_flow', 'harmonic']
        },
        {
          id: 'B',
          text: 'A textured surface with subtle but intense direction',
          tags: ['textured', 'directional']
        }
      ]
    },
    {
      id: 'C7',
      type: 'text',
      question: 'Which composition do you find more beautiful?',
      options: [
        {
          id: 'A',
          text: 'A scene with symbolic color harmony and emotional mood',
          tags: ['symbolic_color', 'emotional_mood']
        },
        {
          id: 'B',
          text: 'A balanced and precise layout with clear visuals',
          tags: ['balanced', 'clear_visual']
        }
      ]
    },
    {
      id: 'C8',
      type: 'visual',
      question: 'Which color scheme is more appealing to you?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C8_A.png',
          tags: ['subtle_blend', 'poetic_atmosphere'],
          description: 'A subtle blend of tones forming a poetic atmosphere'
        },
        {
          id: 'B',
          image: '/images/quiz/C8_B.png',
          tags: ['dynamic_palette', 'strong_energy'],
          description: 'A colorful, dynamic palette expressing strong energy'
        }
      ]
    }
  ],
  
  painting: [
    {
      id: 'P1',
      type: 'text',
      question: 'Which painting would you prefer to hang at home?',
      options: [
        {
          id: 'A',
          text: 'A rich still-life with vibrant colors and structure',
          tags: ['vibrant_color', 'structured', 'traditional']
        },
        {
          id: 'B',
          text: 'A calm flower painting with soft tones and texture',
          tags: ['soft_tones', 'textured', 'peaceful']
        }
      ]
    },
    {
      id: 'P2',
      type: 'text',
      question: 'Which expression style is more appealing?',
      options: [
        {
          id: 'A',
          text: 'An abstract figurative painting using layers and lines',
          tags: ['abstract_figurative', 'layered', 'linear']
        },
        {
          id: 'B',
          text: 'A portrait painting with clear and realistic detail',
          tags: ['portrait', 'realistic', 'detailed']
        }
      ]
    },
    {
      id: 'P3',
      type: 'visual',
      question: 'Which scene evokes a stronger emotional impression?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/P3_A.png',
          tags: ['warm_colors', 'dramatic_lighting'],
          description: 'A warm-colored scene with dramatic lighting'
        },
        {
          id: 'B',
          image: '/images/quiz/P3_B.png',
          tags: ['dark_emotional', 'symbolic_elements'],
          description: 'A dark, emotional scene with symbolic elements'
        }
      ]
    },
    {
      id: 'P4',
      type: 'visual',
      question: 'Which structure feels more emotionally immersive?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/P4_A.png',
          tags: ['contemplative', 'shadow_play'],
          description: 'A contemplative space with shadows and solitude'
        },
        {
          id: 'B',
          image: '/images/quiz/P4_B.png',
          tags: ['minimal', 'form_focused'],
          description: 'A minimal and clean setup highlighting form'
        }
      ]
    }
  ],
  
  multidimensional: [
    {
      id: 'M1',
      type: 'visual',
      question: 'Which shape feels more solid and tactile?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/M1_A.png',
          tags: ['curved_materials', 'layered_sculpture'],
          description: 'A sculpture with layered and curved materials'
        },
        {
          id: 'B',
          image: '/images/quiz/M1_B.png',
          tags: ['geometric_structure', 'clean_surface'],
          description: 'A clean geometric structure with clear surface'
        }
      ]
    },
    {
      id: 'M2',
      type: 'visual',
      question: 'Which image delivers a stronger sensory stimulus?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/M2_A.png',
          tags: ['glowing_media', 'visual_media'],
          description: 'A glowing shape combined with visual media'
        },
        {
          id: 'B',
          image: '/images/quiz/M2_B.png',
          tags: ['immersive_light', 'spatial'],
          description: 'A dark immersive light-space installation'
        }
      ]
    },
    {
      id: 'M3',
      type: 'text',
      question: 'Which artwork better expresses the flow of time?',
      options: [
        {
          id: 'A',
          text: 'An installation that visually stretches or loops time',
          tags: ['time_stretch', 'installation', 'multimedia']
        },
        {
          id: 'B',
          text: 'A series of fragments structured like a time capsule',
          tags: ['fragments', 'time_capsule', 'archive']
        }
      ]
    },
    {
      id: 'M4',
      type: 'visual',
      question: 'Which composition feels deeper in space?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/M4_A.png',
          tags: ['layered_abstract', 'spatial_depth'],
          description: 'A sculpture with layered abstract shapes'
        },
        {
          id: 'B',
          image: '/images/quiz/M4_B.png',
          tags: ['geometric_contrast', 'spatial'],
          description: 'A sculpture with strong geometric contrast'
        }
      ]
    }
  ],
  
  mixed: [
    // Uses P1, P3 from painting and M2, M4 from multidimensional
  ]
};

// ================================
// src/scripts/setupDatabase.js
// ================================
const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Setting up SAYU database...');
  
  try {
    // Read SQL schema file
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully');
    
    // Create indexes
    const indexes = [
      'CREATE INDEX idx_users_email ON users(email)',
      'CREATE INDEX idx_profiles_user_id ON user_profiles(user_id)',
      'CREATE INDEX idx_interactions_user_id ON meaningful_interactions(user_id)',
      'CREATE INDEX idx_artworks_emotional_tags ON artworks USING gin(emotional_tags)',
      'CREATE INDEX idx_reflections_user_id ON reflections(user_id)'
    ];
    
    for (const index of indexes) {
      try {
        await pool.query(index);
        console.log(`✅ Created index: ${index.split(' ')[2]}`);
      } catch (error) {
        if (error.code !== '42P07') { // Index already exists
          throw error;
        }
      }
    }
    
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();

// ================================
// src/scripts/seedData.js
// ================================
const { pool } = require('../config/database');
const AIService = require('../services/openai');
const ArtworkModel = require('../models/Artwork');

async function seedData() {
  console.log('🌱 Seeding initial data...');
  
  try {
    // Sample artworks (you would fetch these from museum APIs)
    const sampleArtworks = [
      {
        externalId: 'met-436524',
        source: 'met',
        title: 'Starry Night Over the Rhône',
        artist: 'Vincent van Gogh',
        yearCreated: 1888,
        medium: 'Oil on canvas',
        description: 'Night scene with stars reflected in the Rhône River',
        imageUrl: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg'
      },
      {
        externalId: 'moma-79802',
        source: 'moma',
        title: 'The Persistence of Memory',
        artist: 'Salvador Dalí',
        yearCreated: 1931,
        medium: 'Oil on canvas',
        description: 'Surrealist painting featuring melting clocks',
        imageUrl: 'https://www.moma.org/media/W1siZiIsIjM4NjQ3MCJd.jpg'
      }
    ];
    
    // Process and save artworks
    for (const artwork of sampleArtworks) {
      console.log(`Processing ${artwork.title}...`);
      
      // Get AI analysis
      const analysis = await AIService.analyzeArtwork(artwork);
      
      // Generate embeddings
      const textForEmbedding = `${artwork.title} ${artwork.artist} ${artwork.medium} ${analysis.emotionalTags.join(' ')}`;
      const embedding = await AIService.generateEmbedding(textForEmbedding);
      
      // Save to database
      await ArtworkModel.create({
        ...artwork,
        emotionalTags: analysis.emotionalTags,
        styleTags: analysis.styleTags,
        themeTags: analysis.themeTags,
        visualEmbedding: embedding,
        semanticEmbedding: embedding,
        contributorType: 'system'
      });
      
      console.log(`✅ Added ${artwork.title}`);
    }
    
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();

// ================================
// .env.example
// ================================
`
# Database
DATABASE_URL=postgresql://sayu_user:your_password@localhost:5432/sayu_db

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend
FRONTEND_URL=http://localhost:3000

# Image Storage (Optional - Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
`;

// ================================
// schema.sql
// ================================
`
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Users table with philosophy
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    age INTEGER,
    location JSONB,
    personal_manifesto TEXT,
    agency_level VARCHAR(50) DEFAULT 'explorer',
    aesthetic_journey_stage VARCHAR(50) DEFAULT 'discovering',
    ui_theme_preference JSONB DEFAULT '{"mode": "dynamic"}',
    accessibility_needs JSONB DEFAULT '{}',
    language_preferences TEXT[],
    trusted_network UUID[],
    influence_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_meaningful_interaction TIMESTAMPTZ,
    total_reflection_time INTEGER DEFAULT 0
);

-- User profiles with living characteristics
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type_code VARCHAR(4),
    archetype_name VARCHAR(100),
    archetype_description TEXT,
    archetype_evolution_stage INTEGER DEFAULT 1,
    exhibition_scores JSONB,
    artwork_scores JSONB,
    emotional_tags TEXT[],
    cognitive_vector vector(384),
    emotional_vector vector(384),
    aesthetic_vector vector(384),
    personality_confidence FLOAT,
    last_major_shift TIMESTAMPTZ,
    growth_trajectory JSONB,
    ui_customization JSONB,
    interaction_style VARCHAR(50),
    generated_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20),
    device_info JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent INTEGER,
    responses JSONB,
    completion_rate FLOAT,
    abandoned_at VARCHAR(10)
);

-- Artworks as active agents
CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(200),
    source VARCHAR(50),
    contributor_id UUID REFERENCES users(id),
    contributor_type VARCHAR(50),
    title VARCHAR(500),
    artist VARCHAR(300),
    year_created INTEGER,
    medium VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    image_thumbnail VARCHAR(500),
    emotional_tags TEXT[],
    style_tags TEXT[],
    theme_tags TEXT[],
    symbolic_elements TEXT[],
    visual_embedding vector(384),
    semantic_embedding vector(384),
    interaction_count INTEGER DEFAULT 0,
    total_viewing_time INTEGER DEFAULT 0,
    emotional_resonance_score FLOAT DEFAULT 0,
    meaning_richness_score FLOAT DEFAULT 0,
    dialogues_sparked INTEGER DEFAULT 0,
    connections_made INTEGER DEFAULT 0,
    transformative_encounters INTEGER DEFAULT 0,
    copyright_status VARCHAR(50),
    usage_rights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_engaged TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_artwork UNIQUE(external_id, source)
);

-- Meaningful interactions
CREATE TABLE meaningful_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50),
    target_id UUID,
    interaction_depth VARCHAR(50),
    emotional_intensity FLOAT,
    cognitive_engagement FLOAT,
    personal_meaning TEXT,
    universal_themes TEXT[],
    questions_raised TEXT[],
    insights_gained TEXT[],
    physical_context JSONB,
    emotional_context JSONB,
    social_context JSONB,
    led_to_action VARCHAR(100),
    transformation_level INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Living reflections
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT,
    emotional_summary JSONB,
    cognitive_summary JSONB,
    stage VARCHAR(50) DEFAULT 'initial',
    iterations JSONB[],
    artwork_ids UUID[],
    exhibition_ids UUID[],
    connected_reflections UUID[],
    privacy_level VARCHAR(50) DEFAULT 'private',
    shared_with UUID[],
    share_format JSONB,
    views_count INTEGER DEFAULT 0,
    sparked_dialogues INTEGER DEFAULT 0,
    inspired_reflections INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_evolved TIMESTAMPTZ DEFAULT NOW()
);

-- User connections
CREATE TABLE user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID REFERENCES users(id) ON DELETE CASCADE,
    user_b UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_type VARCHAR(50),
    strength FLOAT DEFAULT 0.5,
    shared_artworks UUID[],
    shared_exhibitions UUID[],
    interactions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exhibitions (for B2B)
CREATE TABLE exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    title VARCHAR(500),
    description TEXT,
    venue VARCHAR(300),
    location JSONB,
    start_date DATE,
    end_date DATE,
    artwork_ids UUID[],
    curator_notes TEXT,
    tags TEXT[],
    visitor_flow_data JSONB,
    engagement_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
