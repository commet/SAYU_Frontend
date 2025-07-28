const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  authenticateToken(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
};
const validateRequest = require('../middleware/validateRequest');
const { body, query, param } = require('express-validator');
const cloudinaryArtveeService = require('../services/cloudinaryArtveeService');

// 성격 유형별 아트웍 조회 (로그인 선택)
router.get('/personality/:type',
  optionalAuth,
  [
    param('type').isIn(['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC']),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
    query('usageType').optional().isString(),
    query('emotionFilter').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type } = req.params;
      const { limit, usageType, emotionFilter } = req.query;

      // Cloudinary 서비스로 아트웍 조회
      const artworks = await cloudinaryArtveeService.getArtworksForPersonality(
        type,
        {
          limit: parseInt(limit) || 10,
          usageType,
          emotionFilter
        }
      );

      res.json({
        success: true,
        data: artworks,
        personality_type: type,
        count: artworks.length
      });
    } catch (error) {
      console.error('Error fetching personality artworks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artworks for personality type'
      });
    }
  });

// 개별 아트웍 조회
router.get('/artwork/:artveeId',
  optionalAuth,
  [
    param('artveeId').isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { artveeId } = req.params;
      const artwork = await cloudinaryArtveeService.getArtworkById(artveeId);

      if (!artwork) {
        return res.status(404).json({
          success: false,
          error: 'Artwork not found'
        });
      }

      res.json({
        success: true,
        data: artwork
      });
    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artwork'
      });
    }
  });

// 랜덤 아트웍 조회
router.get('/random',
  optionalAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit } = req.query;
      const artworks = await cloudinaryArtveeService.getRandomArtworks(parseInt(limit) || 10);

      res.json({
        success: true,
        data: artworks,
        count: artworks.length
      });
    } catch (error) {
      console.error('Error fetching random artworks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch random artworks'
      });
    }
  });

// 아티스트별 아트웍 조회
router.get('/artist/:artistName',
  optionalAuth,
  [
    param('artistName').isString(),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { artistName } = req.params;
      const { limit } = req.query;

      const artworks = await cloudinaryArtveeService.getArtworksByArtist(
        artistName,
        parseInt(limit) || 10
      );

      res.json({
        success: true,
        data: artworks,
        artist: artistName,
        count: artworks.length
      });
    } catch (error) {
      console.error('Error fetching artist artworks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artworks by artist'
      });
    }
  });

// 통계 정보
router.get('/stats',
  optionalAuth,
  async (req, res) => {
    try {
      const stats = await cloudinaryArtveeService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  });

// 퀴즈 배경 이미지 조회
router.get('/quiz-backgrounds',
  optionalAuth,
  [
    query('personalityType').optional().isIn(['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { personalityType } = req.query;

      // 성격 유형에 맞는 퀴즈 배경 이미지 선택
      const artworks = await cloudinaryArtveeService.getArtworksForPersonality(
        personalityType || 'LAEF',
        {
          limit: 5,
          usageType: 'quiz_bg'
        }
      );

      res.json({
        success: true,
        backgrounds: artworks.map(artwork => ({
          id: artwork.artveeId,
          url: artwork.imageUrl,
          thumbnailUrl: artwork.thumbnailUrl,
          title: artwork.title,
          artist: artwork.artist
        }))
      });
    } catch (error) {
      console.error('Quiz backgrounds error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quiz backgrounds'
      });
    }
  });

// 결과 페이지 아트웍 추천
router.get('/results/:personalityType',
  optionalAuth,
  [
    param('personalityType').isIn(['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC']),
    query('limit').optional().isInt({ min: 1, max: 20 }).default(6)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { personalityType } = req.params;
      const { limit } = req.query;

      const artworks = await cloudinaryArtveeService.getArtworksForPersonality(
        personalityType,
        {
          limit: parseInt(limit) || 6,
          usageType: 'personality_result'
        }
      );

      res.json({
        success: true,
        personalityType,
        recommendations: artworks,
        total: artworks.length
      });
    } catch (error) {
      console.error('Results artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get result artworks'
      });
    }
  });

module.exports = router;
