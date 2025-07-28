const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const waitlistController = require('../controllers/waitlistController');
const rateLimiter = require('../middleware/rateLimiter');

// 대기 목록 가입
router.post('/join',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 15분당 5회
  [
    body('email').isEmail().normalizeEmail(),
    body('referralCode').optional().isString().trim(),
    body('source').optional().isString()
  ],
  waitlistController.join
);

// APT 테스트 완료
router.post('/complete-apt',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  [
    body('email').isEmail().normalizeEmail(),
    body('aptScore').isObject()
  ],
  waitlistController.completeApt
);

// 대기 목록 통계 (공개)
router.get('/stats', waitlistController.getStats);

// 내 순위 확인
router.get('/position', waitlistController.checkPosition);

// 레퍼럴 통계
router.get('/referral/:referralCode', waitlistController.getReferralStats);

module.exports = router;
