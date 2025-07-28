const cron = require('node-cron');
const gamificationService = require('../services/optimizedGamificationService');

// 매일 자정 일일 퀘스트 리셋
const resetDailyQuests = cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Starting daily quest reset...');
  try {
    await gamificationService.resetDailyQuests();
    console.log('[CRON] Daily quest reset completed');
  } catch (error) {
    console.error('[CRON] Daily quest reset failed:', error);
  }
}, {
  scheduled: false,
  timezone: 'Asia/Seoul'
});

// 매주 월요일 자정 주간 리더보드 정산
const archiveWeeklyLeaderboard = cron.schedule('0 0 * * 1', async () => {
  console.log('[CRON] Starting weekly leaderboard archive...');
  try {
    await gamificationService.archiveWeeklyLeaderboard();
    console.log('[CRON] Weekly leaderboard archive completed');
  } catch (error) {
    console.error('[CRON] Weekly leaderboard archive failed:', error);
  }
}, {
  scheduled: false,
  timezone: 'Asia/Seoul'
});

// 크론 작업 시작
function startGamificationCron() {
  resetDailyQuests.start();
  archiveWeeklyLeaderboard.start();
  console.log('[CRON] Gamification cron jobs started');
}

// 크론 작업 중지
function stopGamificationCron() {
  resetDailyQuests.stop();
  archiveWeeklyLeaderboard.stop();
  console.log('[CRON] Gamification cron jobs stopped');
}

module.exports = {
  startGamificationCron,
  stopGamificationCron
};
