const express = require('express');
const router = express.Router();
const perceptionExchangeController = require('../controllers/perceptionExchangeController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimiter');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 감상 교환 CRUD 작업
router.post('/', 
  rateLimitMiddleware.createExchange,
  perceptionExchangeController.createExchange
);

router.get('/',
  rateLimitMiddleware.general,
  perceptionExchangeController.getMyExchanges
);

router.get('/:sessionId',
  rateLimitMiddleware.general,
  perceptionExchangeController.getSession
);

// 메시지 관련
router.post('/:sessionId/messages',
  rateLimitMiddleware.sendMessage,
  perceptionExchangeController.sendMessage
);

router.patch('/messages/:messageId/read',
  rateLimitMiddleware.general,
  perceptionExchangeController.markMessageAsRead
);

router.patch('/messages/:messageId/reaction',
  rateLimitMiddleware.general,
  perceptionExchangeController.addReaction
);

// 세션 상태 변경
router.patch('/:sessionId/accept',
  rateLimitMiddleware.general,
  perceptionExchangeController.acceptInvitation
);

router.patch('/:sessionId/decline',
  rateLimitMiddleware.general,
  perceptionExchangeController.declineInvitation
);

router.patch('/:sessionId/advance-phase',
  rateLimitMiddleware.general,
  perceptionExchangeController.requestPhaseAdvance
);

// 파트너 찾기 및 통계
router.get('/partners/artwork/:artworkId',
  rateLimitMiddleware.general,
  perceptionExchangeController.findPotentialPartners
);

router.get('/stats/my',
  rateLimitMiddleware.general,
  perceptionExchangeController.getExchangeStats
);

module.exports = router;