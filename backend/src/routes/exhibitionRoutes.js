const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController');

// 전시 목록 조회 (필터링, 페이지네이션 지원)
router.get('/exhibitions', exhibitionController.getExhibitions);

// 특정 전시 조회
router.get('/exhibitions/:id', exhibitionController.getExhibition);

// 전시 좋아요/좋아요 취소
router.post('/exhibitions/:id/like', exhibitionController.likeExhibition);

// 전시 제출 (사용자 제출)
router.post('/exhibitions/submit', exhibitionController.submitExhibition);

// 도시별 전시 통계
router.get('/exhibitions/stats/cities', exhibitionController.getCityStats);

// 인기 전시 조회
router.get('/exhibitions/popular', exhibitionController.getPopularExhibitions);

// 장소(venue) 목록 조회
router.get('/venues', exhibitionController.getVenues);

module.exports = router;