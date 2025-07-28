const QuizModel = require('../models/Quiz');
const ProfileModel = require('../models/Profile');
const AIService = require('../services/openai');
const ArtworkScoringService = require('../services/artworkScoring');
const ProfileImageMappingService = require('../services/profileImageMapping');
const journeyNudgeService = require('../services/journeyNudgeService');
const { redisClient } = require('../config/redis');

// Import quiz questions and types
const exhibitionQuestions = require('../data/exhibitionQuestions');
const artworkQuestions = require('../data/artworkQuestions');
const exhibitionTypes = require('../data/exhibitionTypes');

class QuizController {
  async startQuiz(req, res) {
    try {
      const { sessionType } = req.body;
      const { userId } = req;

      // Create quiz session
      const session = await QuizModel.createSession(userId, sessionType);

      // Cache session state
      await redisClient().setEx(
        `quiz:${session.id}`,
        3600,
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
      const sessionData = await redisClient().get(`quiz:${sessionId}`);
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
      await redisClient().setEx(`quiz:${sessionId}`, 3600, JSON.stringify(session));

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
      const sessionData = await redisClient().get(`quiz:${sessionId}`);
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

        // 🎯 APT 테스트 완료 시 7일 여정 시작!
        try {
          await journeyNudgeService.initializeJourney(session.userId);
          console.log(`✅ Journey started for user ${session.userId} after APT completion`);
        } catch (journeyError) {
          console.error('Journey initialization failed:', journeyError);
          // 여정 시작 실패해도 프로필 생성은 성공으로 처리
        }

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
      await redisClient().del(`quiz:${sessionId}`);
    } catch (error) {
      console.error('Complete quiz error:', error);
      res.status(500).json({ error: 'Failed to complete quiz' });
    }
  }

  determineBranch(responses) {
    // Simple branch determination logic
    // In real implementation, this would analyze tag frequencies
    const responseValues = Object.values(responses);
    const aCount = responseValues.filter(r => r.answer === 'A').length;
    const bCount = responseValues.filter(r => r.answer === 'B').length;

    if (aCount > bCount * 1.5) return 'painting';
    if (bCount > aCount * 1.5) return 'multidimensional';
    return 'mixed';
  }

  calculateExhibitionPersonality(exhibitionResponses) {
    // Initialize dimension scores
    const scores = { G: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };

    // Calculate scores based on responses
    exhibitionQuestions.forEach(question => {
      const response = exhibitionResponses[question.id];
      if (response) {
        const option = question.options.find(opt => opt.id === response.answer);
        if (option && option.weight) {
          Object.entries(option.weight).forEach(([dimension, weight]) => {
            scores[dimension] += weight;
          });
        }
      }
    });

    // Determine type code based on highest scores in each pair
    const typeCode =
      (scores.G >= scores.S ? 'G' : 'S') +
      (scores.A >= scores.R ? 'A' : 'R') +
      (scores.M >= scores.E ? 'M' : 'E') +
      (scores.F >= scores.C ? 'F' : 'C');

    // Get exhibition type info
    const exhibitionType = exhibitionTypes[typeCode];

    return {
      typeCode,
      scores,
      exhibitionType
    };
  }

  async generateProfile(userId) {
    try {
      // Get all quiz responses
      const sessions = await QuizModel.getUserSessions(userId);
      const exhibitionSession = sessions.find(s => s.session_type === 'exhibition');
      const artworkSession = sessions.find(s => s.session_type === 'artwork');

      if (!exhibitionSession || !artworkSession) {
        throw new Error('Missing quiz sessions');
      }

      // Calculate exhibition personality
      const exhibitionResult = this.calculateExhibitionPersonality(exhibitionSession.responses);

      // Calculate artwork preferences using new scoring system
      const artworkAnalysis = this.calculateArtworkPreferences(artworkSession.responses);

      // Get specific profile image using 128-combination system
      const profileImageInfo = ProfileImageMappingService.getProfileImage(
        exhibitionResult.typeCode,
        artworkAnalysis
      );

      // Generate fallback profile data
      const profileData = {
        typeCode: exhibitionResult.typeCode,
        artworkTypeCode: profileImageInfo.artworkType,
        combinationId: profileImageInfo.combinationId,
        archetypeName: exhibitionResult.exhibitionType?.name || 'Art Enthusiast',
        description: profileImageInfo.description,
        exhibitionScores: exhibitionResult.scores,
        artworkScores: artworkAnalysis.tagScores,
        artworkPreferences: artworkAnalysis,
        emotionalTags: exhibitionResult.exhibitionType?.traits || ['creative', 'thoughtful'],
        confidence: 0.85,
        dominantArtworkStyle: artworkAnalysis.dominantStyle,
        artworkRecommendations: artworkAnalysis.recommendations,
        profileImagePath: profileImageInfo.imagePath,
        fallbackImagePath: profileImageInfo.fallbackPath
      };

      // Use 128-profile system for image selection
      const profileImageUrl = profileImageInfo.imagePath;
      let cognitiveVector = new Array(1536).fill(0).map(() => Math.random() * 0.1);
      let emotionalVector = new Array(1536).fill(0).map(() => Math.random() * 0.1);

      try {
        // Attempt AI analysis for enhanced descriptions (optional)
        const aiAnalysis = await AIService.analyzeQuizResponses({
          exhibition: exhibitionSession.responses,
          artwork: artworkSession.responses
        });

        if (aiAnalysis) {
          // Enhance profile data with AI insights while keeping systematic image
          profileData.aiEnhancedDescription = aiAnalysis.description;
          profileData.aiEmotionalTags = aiAnalysis.emotionalTags;

          const profileText = `${profileData.archetypeName} ${profileData.description} ${artworkAnalysis.dominantStyle}`;
          cognitiveVector = await AIService.generateEmbedding(profileText) || cognitiveVector;
          emotionalVector = await AIService.generateEmbedding(profileData.emotionalTags.join(' ')) || emotionalVector;
        }
      } catch (aiError) {
        console.warn('AI services unavailable, using systematic profile data:', aiError.message);
      }

      // Create profile
      const profile = await ProfileModel.create({
        userId,
        typeCode: profileData.typeCode,
        archetypeName: profileData.archetypeName,
        archetypeDescription: profileData.description,
        exhibitionScores: profileData.exhibitionScores,
        artworkScores: profileData.artworkScores,
        emotionalTags: profileData.emotionalTags,
        cognitiveVector,
        emotionalVector,
        aestheticVector: cognitiveVector,
        personalityConfidence: profileData.confidence,
        uiCustomization: { theme: 'default', layout: 'standard' },
        interactionStyle: { pace: 'medium', feedback: 'balanced' },
        generatedImageUrl: profileImageUrl
      });

      return profile;
    } catch (error) {
      console.error('Generate profile error:', error);
      throw error;
    }
  }

  calculateArtworkPreferences(artworkResponses) {
    // Use the new artwork scoring system
    const artworkAnalysis = ArtworkScoringService.calculateArtworkPreferences(artworkResponses);

    return {
      tagScores: artworkAnalysis.tagScores,
      resultVector: artworkAnalysis.resultVector,
      topTags: artworkAnalysis.topTags,
      artworkPrompt: artworkAnalysis.artworkPrompt,
      preferenceProfile: artworkAnalysis.preferenceProfile,
      dominantStyle: artworkAnalysis.dominantStyle,
      recommendations: ArtworkScoringService.getArtworkRecommendations(artworkAnalysis)
    };
  }
}

module.exports = new QuizController();
