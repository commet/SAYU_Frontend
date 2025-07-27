const { databaseService } = require('../services/database.service');
const { supabaseAdmin } = require('../config/supabase-client');
const AIService = require('../services/openai');
const ArtworkScoringService = require('../services/artworkScoring');
const ProfileImageMappingService = require('../services/profileImageMapping');
const { log } = require('../config/logger');

// Import quiz questions and types
const exhibitionQuestions = require('../data/exhibitionQuestions');
const artworkQuestions = require('../data/artworkQuestions');
const exhibitionTypes = require('../data/exhibitionTypes');

class QuizController {
  async startQuiz(req, res) {
    try {
      const { sessionType, language = 'ko' } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create quiz session in Supabase
      const { data: session, error } = await databaseService.query('quiz_sessions', 'insert', {
        data: {
          user_id: userId,
          session_id: sessionId,
          status: 'in_progress',
          language,
          current_question_index: 0,
          personality_scores: {}
        }
      });

      if (error) {
        log.error('Failed to create quiz session:', error);
        return res.status(500).json({ error: 'Failed to start quiz' });
      }

      // Get first question
      const questions = sessionType === 'exhibition' ? exhibitionQuestions : artworkQuestions.core;
      const firstQuestion = questions[0];

      res.json({
        success: true,
        data: {
          sessionId: session.data[0].session_id,
          sessionType,
          totalQuestions: sessionType === 'exhibition' ? 14 : 12,
          currentQuestion: 1,
          question: firstQuestion
        }
      });
    } catch (error) {
      log.error('Start quiz error:', error);
      res.status(500).json({ error: 'Failed to start quiz' });
    }
  }

  async submitAnswer(req, res) {
    try {
      const { sessionId, questionId, answer, timeSpent } = req.body;

      // Get session from database
      const { data: sessions } = await databaseService.query('quiz_sessions', 'select', {
        filters: { session_id: sessionId },
        limit: 1
      });

      if (!sessions || sessions.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = sessions[0];

      // Check if session belongs to current user
      if (session.user_id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Record answer in database
      await databaseService.query('quiz_answers', 'insert', {
        data: {
          session_id: sessionId,
          question_id: questionId,
          choice_id: answer,
          dimension: this.getQuestionDimension(questionId),
          score_impact: this.calculateScoreImpact(questionId, answer)
        }
      });

      // Update session progress
      const currentQuestionIndex = session.current_question_index + 1;
      await databaseService.query('quiz_sessions', 'update', {
        filters: { session_id: sessionId },
        data: {
          current_question_index: currentQuestionIndex,
          personality_scores: await this.updatePersonalityScores(sessionId)
        }
      });

      // Determine session type from answers pattern
      const sessionType = await this.determineSessionType(sessionId);
      
      // Determine next question
      let nextQuestion = null;
      const isExhibition = sessionType === 'exhibition';
      
      if (isExhibition) {
        if (currentQuestionIndex < exhibitionQuestions.length) {
          nextQuestion = exhibitionQuestions[currentQuestionIndex];
        }
      } else {
        // Artwork quiz with branching logic
        if (currentQuestionIndex < 8) {
          nextQuestion = artworkQuestions.core[currentQuestionIndex];
        } else if (currentQuestionIndex === 8) {
          // Determine branch based on previous answers
          const branch = await this.determineBranch(sessionId);
          nextQuestion = artworkQuestions[branch][0];
        } else if (currentQuestionIndex < 12) {
          const branch = await this.getCurrentBranch(sessionId);
          const branchIndex = currentQuestionIndex - 8;
          nextQuestion = artworkQuestions[branch][branchIndex];
        }
      }

      // Check if quiz is complete
      const isComplete = (isExhibition && currentQuestionIndex >= 14) ||
                        (!isExhibition && currentQuestionIndex >= 12);

      if (isComplete) {
        return this.completeQuiz(req, res);
      }

      res.json({
        success: true,
        data: {
          currentQuestion: currentQuestionIndex + 1,
          totalQuestions: isExhibition ? 14 : 12,
          question: nextQuestion,
          progress: currentQuestionIndex / (isExhibition ? 14 : 12)
        }
      });
    } catch (error) {
      log.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  async completeQuiz(req, res) {
    try {
      const { sessionId } = req.body;

      // Get session and verify ownership
      const { data: sessions } = await databaseService.query('quiz_sessions', 'select', {
        filters: { session_id: sessionId },
        limit: 1
      });

      if (!sessions || sessions.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = sessions[0];
      if (session.user_id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update session as completed
      await databaseService.query('quiz_sessions', 'update', {
        filters: { session_id: sessionId },
        data: {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      });

      // Check if both quizzes are complete
      const { data: allSessions } = await databaseService.query('quiz_sessions', 'select', {
        filters: { 
          user_id: req.userId,
          status: 'completed'
        }
      });

      const sessionType = await this.determineSessionType(sessionId);
      const hasExhibition = allSessions.some(s => this.isExhibitionSession(s));
      const hasArtwork = allSessions.some(s => !this.isExhibitionSession(s));

      if (hasExhibition && hasArtwork) {
        // Generate comprehensive profile
        const profile = await this.generateProfile(req.userId);
        
        res.json({
          success: true,
          data: {
            complete: true,
            profileGenerated: true,
            profile: {
              typeCode: profile.personality_type,
              animalType: profile.animal_type,
              description: profile.detailed_analysis
            },
            nextStep: 'view_profile'
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            complete: true,
            profileGenerated: false,
            nextStep: hasExhibition ? 'artwork_quiz' : 'exhibition_quiz'
          }
        });
      }
    } catch (error) {
      log.error('Complete quiz error:', error);
      res.status(500).json({ error: 'Failed to complete quiz' });
    }
  }

  async generateProfile(userId) {
    try {
      // Get all completed sessions
      const { data: sessions } = await databaseService.query('quiz_sessions', 'select', {
        filters: { 
          user_id: userId,
          status: 'completed'
        }
      });

      if (!sessions || sessions.length < 2) {
        throw new Error('Insufficient quiz data');
      }

      // Get all answers
      const allAnswers = {};
      for (const session of sessions) {
        const { data: answers } = await databaseService.query('quiz_answers', 'select', {
          filters: { session_id: session.session_id }
        });
        allAnswers[session.session_id] = answers;
      }

      // Separate exhibition and artwork responses
      const exhibitionSession = sessions.find(s => this.isExhibitionSession(s));
      const artworkSession = sessions.find(s => !this.isExhibitionSession(s));

      const exhibitionAnswers = allAnswers[exhibitionSession.session_id];
      const artworkAnswers = allAnswers[artworkSession.session_id];

      // Calculate personality
      const exhibitionResult = this.calculateExhibitionPersonality(exhibitionAnswers);
      const artworkAnalysis = this.calculateArtworkPreferences(artworkAnswers);
      
      // Get profile image using 128-combination system
      const profileImageInfo = ProfileImageMappingService.getProfileImage(
        exhibitionResult.typeCode, 
        artworkAnalysis
      );

      // Determine animal type based on personality
      const animalType = this.mapPersonalityToAnimal(exhibitionResult.typeCode);

      // Generate profile vectors
      let cognitiveVector = new Array(768).fill(0).map(() => Math.random() * 0.1);
      let emotionalVector = new Array(768).fill(0).map(() => Math.random() * 0.1);

      try {
        // Try to enhance with AI
        const profileText = `${animalType} ${exhibitionResult.exhibitionType?.name} ${artworkAnalysis.dominantStyle}`;
        cognitiveVector = await AIService.generateEmbedding(profileText) || cognitiveVector;
        emotionalVector = await AIService.generateEmbedding(exhibitionResult.exhibitionType?.traits?.join(' ')) || emotionalVector;
      } catch (aiError) {
        log.warn('AI enhancement failed, using fallback vectors');
      }

      // Create quiz result
      const { data: quizResult } = await databaseService.query('quiz_results', 'insert', {
        data: {
          user_id: userId,
          session_id: exhibitionSession.session_id,
          personality_type: exhibitionResult.typeCode,
          animal_type: animalType,
          scores: exhibitionResult.scores,
          traits: exhibitionResult.exhibitionType?.traits || {},
          strengths: exhibitionResult.exhibitionType?.strengths || [],
          challenges: exhibitionResult.exhibitionType?.challenges || [],
          art_preferences: artworkAnalysis,
          recommended_artists: artworkAnalysis.recommendations?.artists || [],
          recommended_styles: artworkAnalysis.recommendations?.styles || [],
          detailed_analysis: profileImageInfo.description
        }
      });

      // Update user profile
      await databaseService.query('users', 'update', {
        filters: { id: userId },
        data: {
          personality_type: exhibitionResult.typeCode,
          quiz_completed: true
        }
      });

      // Create art profile
      await databaseService.query('art_profiles', 'insert', {
        data: {
          user_id: userId,
          personality_type: exhibitionResult.typeCode,
          profile_image_url: profileImageInfo.imagePath,
          profile_data: {
            combinationId: profileImageInfo.combinationId,
            artworkType: profileImageInfo.artworkType,
            exhibitionScores: exhibitionResult.scores,
            artworkScores: artworkAnalysis.tagScores
          },
          generation_prompt: profileImageInfo.description,
          style_attributes: artworkAnalysis.preferenceProfile,
          color_palette: this.extractColorPalette(exhibitionResult.typeCode),
          artistic_elements: artworkAnalysis.topTags
        }
      });

      // Store emotion vectors
      await databaseService.query('emotion_vectors', 'insert', {
        data: {
          entity_type: 'user',
          entity_id: userId,
          emotion_vector: `[${cognitiveVector.join(',')}]`,
          emotion_tags: exhibitionResult.exhibitionType?.traits || [],
          context: { source: 'quiz_completion' }
        }
      });

      return quizResult.data[0];
    } catch (error) {
      log.error('Generate profile error:', error);
      throw error;
    }
  }

  // Helper methods
  getQuestionDimension(questionId) {
    // Map question IDs to personality dimensions
    const dimensionMap = {
      'q1': 'G-S', 'q2': 'G-S', 'q3': 'A-R', 'q4': 'A-R',
      'q5': 'M-E', 'q6': 'M-E', 'q7': 'F-C', 'q8': 'F-C'
    };
    return dimensionMap[questionId] || 'unknown';
  }

  calculateScoreImpact(questionId, answer) {
    // Calculate how the answer impacts personality scores
    const question = [...exhibitionQuestions, ...artworkQuestions.core]
      .find(q => q.id === questionId);
    
    if (!question) return {};
    
    const option = question.options.find(opt => opt.id === answer);
    return option?.weight || {};
  }

  async updatePersonalityScores(sessionId) {
    const { data: answers } = await databaseService.query('quiz_answers', 'select', {
      filters: { session_id: sessionId }
    });

    const scores = { G: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    for (const answer of answers) {
      if (answer.score_impact) {
        Object.entries(answer.score_impact).forEach(([dimension, weight]) => {
          if (scores.hasOwnProperty(dimension)) {
            scores[dimension] += weight;
          }
        });
      }
    }

    return scores;
  }

  async determineSessionType(sessionId) {
    const { data: answers } = await databaseService.query('quiz_answers', 'select', {
      filters: { session_id: sessionId },
      limit: 1
    });

    if (!answers || answers.length === 0) return 'exhibition';
    
    // Check if it's an exhibition question based on ID pattern
    return answers[0].question_id.startsWith('q') ? 'exhibition' : 'artwork';
  }

  isExhibitionSession(session) {
    // Exhibition sessions have personality scores with G,S,A,R,E,M,F,C dimensions
    const scores = session.personality_scores || {};
    return 'G' in scores || 'S' in scores;
  }

  async determineBranch(sessionId) {
    const { data: answers } = await databaseService.query('quiz_answers', 'select', {
      filters: { session_id: sessionId }
    });

    const aCount = answers.filter(a => a.choice_id === 'A').length;
    const bCount = answers.filter(a => a.choice_id === 'B').length;
    
    if (aCount > bCount * 1.5) return 'painting';
    if (bCount > aCount * 1.5) return 'multidimensional';
    return 'mixed';
  }

  async getCurrentBranch(sessionId) {
    // Store branch decision in session metadata
    const { data: sessions } = await databaseService.query('quiz_sessions', 'select', {
      filters: { session_id: sessionId },
      limit: 1
    });

    return sessions[0]?.personality_scores?.branch || 'mixed';
  }

  calculateExhibitionPersonality(answers) {
    const scores = { G: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    // Calculate scores from answers
    answers.forEach(answer => {
      if (answer.score_impact) {
        Object.entries(answer.score_impact).forEach(([dimension, weight]) => {
          if (scores.hasOwnProperty(dimension)) {
            scores[dimension] += weight;
          }
        });
      }
    });

    // Determine type code
    const typeCode = 
      (scores.G >= scores.S ? 'G' : 'S') +
      (scores.A >= scores.R ? 'A' : 'R') +
      (scores.M >= scores.E ? 'M' : 'E') +
      (scores.F >= scores.C ? 'F' : 'C');

    const exhibitionType = exhibitionTypes[typeCode];
    
    return {
      typeCode,
      scores,
      exhibitionType
    };
  }

  calculateArtworkPreferences(answers) {
    // Convert answers to response format expected by scoring service
    const responses = {};
    answers.forEach(answer => {
      responses[answer.question_id] = {
        answer: answer.choice_id,
        timeSpent: 5000 // Default time
      };
    });

    return ArtworkScoringService.calculateArtworkPreferences(responses);
  }

  mapPersonalityToAnimal(typeCode) {
    // Map 16 personality types to animal representations
    const animalMap = {
      'GAMF': '호랑이', 'GAMC': '사자', 'GRMF': '늑대', 'GRMC': '표범',
      'GAEF': '독수리', 'GAEC': '매', 'GREF': '올빼미', 'GREC': '까마귀',
      'SAMF': '돌고래', 'SAMC': '코끼리', 'SRMF': '여우', 'SRMC': '고양이',
      'SAEF': '나비', 'SAEC': '벌새', 'SREF': '사슴', 'SREC': '토끼'
    };
    
    return animalMap[typeCode] || '예술가';
  }

  extractColorPalette(typeCode) {
    // Define color palettes for each personality type
    const paletteMap = {
      'GAMF': ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      'GAMC': ['#F7B731', '#5F27CD', '#EE5A24'],
      'GRMF': ['#6C5CE7', '#A29BFE', '#74B9FF'],
      // ... add more palettes
    };
    
    return paletteMap[typeCode] || ['#333333', '#666666', '#999999'];
  }
}

module.exports = new QuizController();