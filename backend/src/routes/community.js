const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const communityService = require('../services/communityService');
const { logger } = require("../config/logger");

router.use(authMiddleware);

// Forum routes
router.get('/forums', async (req, res) => {
  try {
    const forums = await communityService.getForums();
    res.json(forums);
  } catch (error) {
    logger.error('Failed to get forums:', error);
    res.status(500).json({ error: 'Failed to get forums' });
  }
});

router.post('/forums', async (req, res) => {
  try {
    const { name, description, slug, category } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const forum = await communityService.createForum({
      name, description, slug, category
    });
    
    res.status(201).json(forum);
  } catch (error) {
    logger.error('Failed to create forum:', error);
    res.status(500).json({ error: 'Failed to create forum' });
  }
});

// Topic routes
router.get('/forums/:forumId/topics', async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const topics = await communityService.getTopics(forumId, parseInt(limit), offset);
    res.json(topics);
  } catch (error) {
    logger.error('Failed to get topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

router.get('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await communityService.getTopic(topicId, req.userId);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    logger.error('Failed to get topic:', error);
    res.status(500).json({ error: 'Failed to get topic' });
  }
});

router.post('/forums/:forumId/topics', async (req, res) => {
  try {
    const { forumId } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const topic = await communityService.createTopic({
      forumId, userId: req.userId, title, content
    });
    
    res.status(201).json(topic);
  } catch (error) {
    logger.error('Failed to create topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Reply routes
router.get('/topics/:topicId/replies', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const replies = await communityService.getReplies(
      topicId, parseInt(limit), offset, req.userId
    );
    
    res.json(replies);
  } catch (error) {
    logger.error('Failed to get replies:', error);
    res.status(500).json({ error: 'Failed to get replies' });
  }
});

router.post('/topics/:topicId/replies', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, parentReplyId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const reply = await communityService.createReply({
      topicId, userId: req.userId, content, parentReplyId
    });
    
    res.status(201).json(reply);
  } catch (error) {
    logger.error('Failed to create reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Like/Unlike routes
router.post('/topics/:topicId/like', async (req, res) => {
  try {
    const { topicId } = req.params;
    const result = await communityService.toggleLike(req.userId, topicId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to toggle topic like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

router.post('/replies/:replyId/like', async (req, res) => {
  try {
    const { replyId } = req.params;
    const result = await communityService.toggleLike(req.userId, null, replyId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to toggle reply like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// User following routes
router.post('/users/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await communityService.followUser(req.userId, userId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to follow user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.delete('/users/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await communityService.unfollowUser(req.userId, userId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to unfollow user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

router.get('/users/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await communityService.getUserFollows(userId);
    res.json(following);
  } catch (error) {
    logger.error('Failed to get user following:', error);
    res.status(500).json({ error: 'Failed to get following list' });
  }
});

router.get('/users/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await communityService.getUserFollowers(userId);
    res.json(followers);
  } catch (error) {
    logger.error('Failed to get user followers:', error);
    res.status(500).json({ error: 'Failed to get followers list' });
  }
});

// Content moderation routes
router.post('/report', async (req, res) => {
  try {
    const { reportedUserId, topicId, replyId, reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const report = await communityService.reportContent({
      reporterId: req.userId,
      reportedUserId,
      topicId,
      replyId,
      reason,
      description
    });
    
    res.status(201).json(report);
  } catch (error) {
    logger.error('Failed to create report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Badge routes
router.get('/users/:userId/badges', async (req, res) => {
  try {
    const { userId } = req.params;
    const badges = await communityService.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    logger.error('Failed to get user badges:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Community stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await communityService.getCommunityStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get community stats:', error);
    res.status(500).json({ error: 'Failed to get community stats' });
  }
});

module.exports = router;