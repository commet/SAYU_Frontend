// 게이미피케이션 라우트 추가 예시
// server.js의 라우트 섹션에 추가해야 할 코드:

// 1. 상단에 import 추가:
const { router: gamificationOptimizedRoutes } = require('./routes/gamificationOptimizedRoutes');

// 2. 라우트 섹션에 추가 (line 293 대체):
app.use('/api/gamification', gamificationOptimizedRoutes);

// 3. 크론 작업 시작 (server.js의 맨 아래 부분에 추가):
const { startGamificationCron } = require('./cron/gamificationCron');
if (process.env.NODE_ENV === 'production') {
  startGamificationCron();
}

// 4. 다른 라우트에서 게이미피케이션 이벤트 트리거 예시:
const { triggerGamificationEvent } = require('./routes/gamificationOptimizedRoutes');

// 예: 퀴즈 완료 시
router.post('/complete', authenticateToken, triggerGamificationEvent('COMPLETE_QUIZ'), async (req, res) => {
  // 기존 퀴즈 완료 로직
});

// 예: 작품 감상 시
router.get('/artwork/:id', authenticateToken, triggerGamificationEvent('VIEW_ARTWORK'), async (req, res) => {
  // 기존 작품 조회 로직
});

// 예: 팔로우 시
router.post('/follow', authenticateToken, triggerGamificationEvent('FOLLOW_USER'), async (req, res) => {
  // 기존 팔로우 로직
});