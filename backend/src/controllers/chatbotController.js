const chatbotService = require('../services/chatbotService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class ChatbotController {
  // Send message to chatbot
  async sendMessage(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { message, artworkId } = req.body;
      const { userId } = req;
      const userType = req.user?.personalityType || 'LAEF';

      // Get artwork details (in real implementation, fetch from database)
      const artwork = req.body.artwork || {
        id: artworkId,
        title: req.body.artworkTitle || 'Unknown Artwork',
        artist: req.body.artworkArtist || 'Unknown Artist',
        year: req.body.artworkYear || 2024,
        medium: req.body.artworkMedium,
        description: req.body.artworkDescription
      };

      // Process message
      const result = await chatbotService.processMessage(
        userId,
        message,
        artwork,
        userType
      );

      // Log interaction for analytics
      logger.info('Chatbot interaction', {
        userId,
        artworkId,
        messageLength: message.length,
        success: result.success
      });

      return res.status(200).json(result);

    } catch (error) {
      logger.error('Chatbot controller error:', error);
      return res.status(500).json({
        success: false,
        message: '챗봇 서비스에 일시적인 문제가 발생했습니다.'
      });
    }
  }

  // Get conversation history
  async getHistory(req, res) {
    try {
      const { artworkId } = req.params;
      const { userId } = req;

      const history = await chatbotService.getConversationHistory(userId, artworkId);

      return res.status(200).json(history);

    } catch (error) {
      logger.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        message: '대화 기록을 불러올 수 없습니다.'
      });
    }
  }

  // Clear conversation sessions
  async clearSessions(req, res) {
    try {
      const { userId } = req;

      const result = await chatbotService.clearUserSessions(userId);

      return res.status(200).json({
        success: true,
        message: '대화 세션이 초기화되었습니다.',
        ...result
      });

    } catch (error) {
      logger.error('Clear sessions error:', error);
      return res.status(500).json({
        success: false,
        message: '세션 초기화에 실패했습니다.'
      });
    }
  }

  // Save feedback on chatbot response
  async saveFeedback(req, res) {
    try {
      const { sessionId, messageId, rating, feedback } = req.body;
      const { userId } = req;

      // In production, save to database
      logger.info('Chatbot feedback', {
        userId,
        sessionId,
        messageId,
        rating,
        feedback
      });

      return res.status(200).json({
        success: true,
        message: '피드백이 저장되었습니다. 감사합니다!'
      });

    } catch (error) {
      logger.error('Save feedback error:', error);
      return res.status(500).json({
        success: false,
        message: '피드백 저장에 실패했습니다.'
      });
    }
  }

  // Get suggested questions for an artwork
  async getSuggestions(req, res) {
    try {
      const { artworkId } = req.params;
      const { userId } = req;
      const userType = req.user?.personalityType || 'LAEF';

      // Get artwork details
      const artwork = {
        id: artworkId,
        title: req.query.title || 'Artwork',
        artist: req.query.artist || 'Artist',
        year: req.query.year || 2024
      };

      // Get session or create temporary one
      const session = chatbotService.getOrCreateSession(userId, artwork, userType);
      const suggestions = chatbotService.getFollowUpQuestions(artwork, session);

      return res.status(200).json({
        success: true,
        suggestions,
        personality: userType
      });

    } catch (error) {
      logger.error('Get suggestions error:', error);
      return res.status(500).json({
        success: false,
        message: '추천 질문을 불러올 수 없습니다.'
      });
    }
  }

  // Check chatbot health status
  async healthCheck(req, res) {
    try {
      const isHealthy = chatbotService.model !== null;

      return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? 'operational' : 'unavailable',
        message: isHealthy ? 'Chatbot service is running' : 'Chatbot service is not initialized'
      });

    } catch (error) {
      logger.error('Health check error:', error);
      return res.status(503).json({
        success: false,
        status: 'error',
        message: 'Health check failed'
      });
    }
  }
}

module.exports = new ChatbotController();
