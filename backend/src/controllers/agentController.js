const AIService = require('../services/openai');
const ProfileModel = require('../models/Profile');
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
      const history = await redisClient().get(conversationKey);
      const conversationHistory = history ? JSON.parse(history) : [];

      // Prepare context
      const aiContext = {
        profile: {
          typeCode: profile.type_code,
          archetypeName: profile.archetype_name,
          emotionalTags: profile.emotional_tags,
          interactionStyle: profile.interaction_style
        },
        conversationHistory: conversationHistory.slice(-5),
        emotionalState: context?.mood || 'neutral'
      };

      // Get AI response
      const response = await AIService.curatorChat(userId, message, aiContext);

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.text }
      );
      await redisClient().setEx(
        conversationKey,
        86400,
        JSON.stringify(conversationHistory.slice(-20))
      );

      res.json({
        response: response.text,
        suggestions: response.suggestions
      });
    } catch (error) {
      console.error('Agent chat error:', error);
      res.status(500).json({ error: 'Failed to process chat' });
    }
  }

  async getMemory(req, res) {
    try {
      const userId = req.userId;
      const conversationKey = `conversation:${userId}`;
      const history = await redisClient().get(conversationKey);

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
