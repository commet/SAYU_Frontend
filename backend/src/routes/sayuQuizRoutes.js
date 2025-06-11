// SAYU Quiz API Endpoints
// Backend: /backend/src/routes/sayuQuizRoutes.js

const express = require('express');
const router = express.Router();
const SAYUQuizService = require('../services/sayuQuizService');

// Initialize quiz service
const quizService = new SAYUQuizService();

// ==================== ENDPOINTS ====================

/**
 * POST /api/quiz/start
 * Initialize a new quiz session
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, language = 'en' } = req.body;
    
    // Create new session using service
    const session = quizService.createSession(userId, language);
    
    // Get first question
    const firstQuestion = quizService.formatQuestion(
      quizService.sayuEnhancedQuizData?.questions[0] || { id: 'q1', title: 'Loading...' }, 
      language
    );
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        currentQuestion: firstQuestion,
        totalQuestions: 10, // Total questions in the quiz
        progress: 0
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start quiz' 
    });
  }
});

/**
 * POST /api/quiz/answer
 * Submit an answer and get next question or result
 */
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, questionId, answerId, timeSpent } = req.body;
    
    // Process answer using service
    const result = quizService.processAnswer(sessionId, questionId, answerId, timeSpent);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error processing answer:', error);
    
    // Handle specific error types
    if (error.message === 'Session not found') {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    if (error.message === 'Question not found' || error.message === 'Answer not found') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid question or answer' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process answer' 
    });
  }
});

/**
 * GET /api/quiz/progress/:sessionId
 * Get current quiz progress
 */
router.get('/progress/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = quizService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: 10, // Total questions in the quiz
        progress: (session.currentQuestionIndex / 10) * 100,
        dimensions: quizService.getDimensionSnapshot(session.dimensions),
        status: session.status
      }
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get progress' 
    });
  }
});

/**
 * GET /api/quiz/result/:sessionId
 * Get quiz result for completed session
 */
router.get('/result/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    if (session.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Quiz not completed' 
      });
    }
    
    res.json({
      success: true,
      data: formatResult(session.result, session.language)
    });
  } catch (error) {
    console.error('Error getting result:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get result' 
    });
  }
});

/**
 * POST /api/quiz/share
 * Generate shareable content for result
 */
router.post('/share', async (req, res) => {
  try {
    const { sessionId, platform } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid session or quiz not completed' 
      });
    }
    
    const shareContent = generateShareContent(session.result, platform);
    
    res.json({
      success: true,
      data: shareContent
    });
  } catch (error) {
    console.error('Error generating share content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate share content' 
    });
  }
});

/**
 * GET /api/quiz/types
 * Get all personality type information
 */
router.get('/types', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    // Get all personality types using service
    const types = quizService.getAllPersonalityTypes(language);
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error getting personality types:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get personality types' 
    });
  }
});

/**
 * POST /api/quiz/compare
 * Compare two personality types
 */
router.post('/compare', async (req, res) => {
  try {
    const { type1, type2, language = 'en' } = req.body;
    
    const comparison = quizService.comparePersonalityTypes(type1, type2, language);
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing types:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to compare types' 
    });
  }
});

// ==================== ADDITIONAL ENDPOINTS ====================

/**
 * POST /api/sayu-quiz/share
 * Generate shareable content for result
 */
router.post('/share', async (req, res) => {
  try {
    const { sessionId, platform } = req.body;
    const session = quizService.getSession(sessionId);
    
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid session or quiz not completed' 
      });
    }
    
    const shareContent = generateShareContent(session.result, platform);
    
    res.json({
      success: true,
      data: shareContent
    });
  } catch (error) {
    console.error('Error generating share content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate share content' 
    });
  }
});

// Helper function for share content generation
function generateShareContent(result, platform) {
  const { personalityType } = result;
  
  const baseContent = {
    title: `I'm a ${personalityType.name}!`,
    description: personalityType.description,
    url: `https://sayu.art/quiz/result/${personalityType.code}`,
    hashtags: ['SAYUArtPersonality', personalityType.code, 'ArtLovers', 'DiscoverYourArtStyle']
  };
  
  switch (platform) {
    case 'instagram':
      return {
        ...baseContent,
        imageUrl: `https://sayu.art/api/cards/${personalityType.code}.png`,
        caption: `${baseContent.title}\n\n${baseContent.description}\n\n${baseContent.hashtags.map(h => '#' + h).join(' ')}\n\nDiscover your art personality at ${baseContent.url}`
      };
      
    case 'twitter':
      const text = `${baseContent.title} ${baseContent.description}`;
      const hashtags = baseContent.hashtags.map(h => '#' + h).join(' ');
      const maxLength = 280 - hashtags.length - baseContent.url.length - 4;
      
      return {
        ...baseContent,
        text: `${text.substring(0, maxLength)}... ${hashtags} ${baseContent.url}`
      };
      
    case 'facebook':
      return {
        ...baseContent,
        imageUrl: `https://sayu.art/api/cards/${personalityType.code}.png`
      };
      
    default:
      return baseContent;
  }
}

// Export router
module.exports = router;