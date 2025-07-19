// SAYU Quiz Controller - Integrates SAYU personality system with existing infrastructure
const SAYUQuizService = require('../services/sayuQuizService');
const SAYUTypes = require('../models/sayuTypes');
const SAYURelationships = require('../models/sayuRelationships');
const SAYUArtworkMatcher = require('../models/sayuArtworkMatcher');
const ProfileModel = require('../models/Profile');
const QuizModel = require('../models/Quiz');
const { redisClient } = require('../config/redis');

class SAYUQuizController {
  constructor() {
    this.sayuQuizService = new SAYUQuizService();
    this.sayuTypes = new SAYUTypes();
    this.sayuRelationships = new SAYURelationships(this.sayuTypes);
    this.sayuArtworkMatcher = new SAYUArtworkMatcher(this.sayuTypes);
  }

  async startSAYUQuiz(req, res) {
    try {
      const userId = req.userId;
      const { language = 'ko' } = req.body;

      // Create SAYU quiz session
      const session = this.sayuQuizService.createSession(userId, language);
      
      // Store in database for consistency with existing system
      const dbSession = await QuizModel.createSession(userId, 'sayu');
      
      // Cache session mapping
      await redisClient().setEx(
        `sayu:${session.sessionId}`,
        3600,
        JSON.stringify({
          ...session,
          dbSessionId: dbSession.id
        })
      );

      // Get first question
      const firstQuestion = this.sayuQuizService.formatQuestion(
        require('../data/sayuEnhancedQuizData').sayuEnhancedQuizData.questions[0],
        language
      );

      res.json({
        sessionId: session.sessionId,
        sessionType: 'sayu',
        totalQuestions: 15, // Art Persona Type (APT) quiz
        currentQuestion: 1,
        question: firstQuestion,
        dimensions: session.dimensions
      });
    } catch (error) {
      console.error('Start SAYU quiz error:', error);
      res.status(500).json({ error: 'Failed to start SAYU quiz' });
    }
  }

  async submitSAYUAnswer(req, res) {
    try {
      const { sessionId, questionId, answerId, timeSpent } = req.body;

      // Process answer through SAYU service
      const result = this.sayuQuizService.processAnswer(
        sessionId,
        questionId,
        answerId,
        timeSpent
      );

      // Update database session
      const cachedSession = await redisClient().get(`sayu:${sessionId}`);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        await QuizModel.updateSession(sessionData.dbSessionId, {
          responses: this.sayuQuizService.getSession(sessionId).responses,
          lastUpdated: new Date()
        });
      }

      if (result.complete) {
        // Generate complete profile
        return this.completeSAYUQuiz(req, res);
      }

      res.json({
        ...result,
        currentQuestion: result.progress ? Math.floor(result.progress / 5) + 1 : 1
      });
    } catch (error) {
      console.error('Submit SAYU answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  async completeSAYUQuiz(req, res) {
    try {
      const { sessionId } = req.body;
      const session = this.sayuQuizService.getSession(sessionId);
      
      if (!session || !session.result) {
        return res.status(400).json({ error: 'Invalid session state' });
      }

      const { personalityType, dimensions, confidence } = session.result;
      
      // Get SAYU type info
      const typeInfo = this.sayuTypes.getTypeInfo(personalityType.code);
      const growthAreas = this.sayuTypes.getGrowthAreas(personalityType.code);
      
      // Get best matches
      const bestMatches = this.sayuRelationships.getBestMatches(personalityType.code, 3);
      
      // Generate artwork recommendations
      const artworkRecommendations = this.generateArtworkRecommendations(
        personalityType.code,
        personalityType.preferences
      );

      // Create or update user profile
      const profile = await this.createSAYUProfile(
        session.userId,
        personalityType,
        dimensions,
        confidence,
        typeInfo,
        artworkRecommendations
      );

      // Update quiz session in database
      const cachedSession = await redisClient().get(`sayu:${sessionId}`);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        await QuizModel.updateSession(sessionData.dbSessionId, {
          completedAt: new Date(),
          timeSpent: Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000),
          completionRate: 1.0,
          result: session.result
        });
      }

      // Clean up cache
      await redisClient().del(`sayu:${sessionId}`);

      res.json({
        complete: true,
        profile: {
          typeCode: personalityType.code,
          typeName: typeInfo.name,
          animalName: personalityType.name,
          description: personalityType.description,
          archetype: personalityType.archetype,
          characteristics: personalityType.characteristics,
          growthAreas: growthAreas,
          bestMatches: bestMatches,
          artworkRecommendations: artworkRecommendations,
          visualScene: personalityType.visualScene,
          galleryBehavior: personalityType.galleryBehavior,
          confidence: confidence,
          dimensions: this.sayuQuizService.getDimensionSnapshot(dimensions)
        },
        nextStep: 'view_profile'
      });
    } catch (error) {
      console.error('Complete SAYU quiz error:', error);
      res.status(500).json({ error: 'Failed to complete quiz' });
    }
  }

  async createSAYUProfile(userId, personalityType, dimensions, confidence, typeInfo, artworkRecommendations) {
    try {
      // Check if profile exists
      let profile = await ProfileModel.findByUserId(userId);
      
      const profileData = {
        userId,
        typeCode: personalityType.code,
        archetypeName: typeInfo.name,
        archetypeDescription: personalityType.description,
        exhibitionScores: dimensions, // Using SAYU dimensions
        artworkScores: artworkRecommendations.scores,
        emotionalTags: personalityType.characteristics,
        personalityConfidence: confidence.overall / 100,
        uiCustomization: {
          theme: this.getThemeForType(personalityType.code),
          layout: 'sayu_gallery'
        },
        interactionStyle: {
          pace: this.getPaceForType(personalityType.code),
          feedback: 'encouraging'
        },
        sayuData: {
          animalArchetype: personalityType.name,
          dominantFunction: typeInfo.conscious[0],
          inferiorFunction: typeInfo.conscious[3],
          growthAreas: typeInfo.conscious.slice(2, 4),
          visualScene: personalityType.visualScene,
          galleryBehavior: personalityType.galleryBehavior
        }
      };

      if (profile) {
        // Update existing profile
        await ProfileModel.update(profile.id, profileData);
        profile = await ProfileModel.findByUserId(userId);
      } else {
        // Create new profile
        profile = await ProfileModel.create({
          ...profileData,
          cognitiveVector: new Array(1536).fill(0).map(() => Math.random() * 0.1),
          emotionalVector: new Array(1536).fill(0).map(() => Math.random() * 0.1),
          aestheticVector: new Array(1536).fill(0).map(() => Math.random() * 0.1)
        });
      }

      return profile;
    } catch (error) {
      console.error('Create SAYU profile error:', error);
      throw error;
    }
  }

  generateArtworkRecommendations(typeCode, preferences) {
    // Sample artwork database for demonstration
    const sampleArtworks = [
      {
        id: 1,
        title: 'Abstract Composition',
        abstractionLevel: 0.9,
        emotionalIntensity: 0.7,
        requiresContemplation: 0.8,
        explorationFriendly: 0.6
      },
      {
        id: 2,
        title: 'Portrait Study',
        abstractionLevel: 0.2,
        emotionalIntensity: 0.8,
        requiresContemplation: 0.5,
        structuredNarrative: 0.7
      },
      {
        id: 3,
        title: 'Landscape Vista',
        abstractionLevel: 0.3,
        emotionalIntensity: 0.5,
        discussionPotential: 0.7,
        structuredNarrative: 0.6
      }
    ];

    const scores = this.sayuArtworkMatcher.analyzeArtworkForTypes({ 
      ...preferences,
      abstractionLevel: typeCode[1] === 'A' ? 0.8 : 0.2,
      emotionalIntensity: typeCode[2] === 'E' ? 0.8 : 0.3,
      requiresContemplation: typeCode[0] === 'L' ? 0.8 : 0.3,
      explorationFriendly: typeCode[3] === 'F' ? 0.8 : 0.3
    });

    const recommendations = this.sayuArtworkMatcher.recommendArtworksForGrowth(
      typeCode,
      sampleArtworks
    );

    return {
      scores,
      recommendations,
      preferredStyles: this.getPreferredStylesForType(typeCode)
    };
  }

  getThemeForType(typeCode) {
    // L types prefer minimal, S types prefer social
    // A types prefer abstract themes, R types prefer realistic
    const themes = {
      'L': 'minimal',
      'S': 'vibrant',
      'A': 'abstract',
      'R': 'classic'
    };
    return themes[typeCode[0]] + '_' + themes[typeCode[1]];
  }

  getPaceForType(typeCode) {
    // F types prefer fast/flexible, C types prefer careful/structured
    return typeCode[3] === 'F' ? 'flexible' : 'structured';
  }

  getPreferredStylesForType(typeCode) {
    const styles = [];
    
    if (typeCode[1] === 'A') {
      styles.push('Abstract Expressionism', 'Contemporary', 'Conceptual');
    } else {
      styles.push('Realism', 'Classical', 'Figurative');
    }
    
    if (typeCode[2] === 'E') {
      styles.push('Impressionism', 'Fauvism');
    } else {
      styles.push('Minimalism', 'Geometric Abstraction');
    }
    
    return styles;
  }

  async getSAYUTypes(req, res) {
    try {
      const types = this.sayuQuizService.getAllPersonalityTypes('ko');
      
      res.json({
        types: types.map(type => ({
          ...type,
          typeInfo: this.sayuTypes.getTypeInfo(type.code)
        }))
      });
    } catch (error) {
      console.error('Get SAYU types error:', error);
      res.status(500).json({ error: 'Failed to get personality types' });
    }
  }

  async compareTypes(req, res) {
    try {
      const { type1, type2 } = req.query;
      
      const comparison = this.sayuQuizService.comparePersonalityTypes(type1, type2, 'ko');
      const relationship = this.sayuRelationships.relationships[`${type1}-${type2}`];
      
      res.json({
        ...comparison,
        relationship: relationship
      });
    } catch (error) {
      console.error('Compare types error:', error);
      res.status(500).json({ error: 'Failed to compare types' });
    }
  }
}

module.exports = new SAYUQuizController();