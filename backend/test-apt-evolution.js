// APT Evolution System Test Script
require('dotenv').config();
const db = require('./src/config/database');
const aptEvolutionService = require('./src/services/aptEvolutionService');
const AnimalEvolutionSystem = require('./src/models/animalEvolutionSystem');
const EvolutionRewardSystem = require('./src/models/evolutionRewardSystem');

async function testEvolutionSystem() {
  console.log('=== APT Evolution System Test ===\n');

  try {
    // 1. 테스트 사용자 생성/조회
    console.log('1. Setting up test user...');
    const userResult = await db.query(
      `SELECT u.id, sp.type_code 
       FROM users u 
       JOIN sayu_profiles sp ON u.id = sp.user_id 
       LIMIT 1`
    );

    if (userResult.rows.length === 0) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    const testUser = userResult.rows[0];
    console.log(`✓ Test user: ID=${testUser.id}, APT=${testUser.type_code}\n`);

    // 2. 진화 상태 조회
    console.log('2. Getting evolution state...');
    const evolutionState = await aptEvolutionService.getUserEvolutionState(testUser.id);
    console.log('✓ Current evolution state:');
    console.log(`  - Stage: ${evolutionState.stage} (${evolutionState.stageData.name})`);
    console.log(`  - Points: ${evolutionState.stats.totalPoints}`);
    console.log(`  - Progress: ${evolutionState.progress}%`);
    console.log(`  - Animal: ${evolutionState.animalEmoji} ${evolutionState.animalName}\n`);

    // 3. 다양한 행동 기록
    console.log('3. Recording various actions...');
    const actions = [
      { type: 'artwork_view', context: { targetId: 1, duration: 45 } },
      { type: 'artwork_like', context: { targetId: 1 } },
      { type: 'exhibition_visit', context: { targetId: 1 } },
      { type: 'follow_user', context: { targetId: 2 } }
    ];

    for (const action of actions) {
      const result = await aptEvolutionService.recordAction(
        testUser.id, 
        action.type, 
        action.context
      );
      console.log(`✓ ${action.type}: +${result.pointsEarned} points`);
      
      if (result.evolved) {
        console.log(`  🎉 EVOLVED to stage ${result.newStage}!`);
      }
      
      if (result.achievedMilestones.length > 0) {
        console.log(`  🏆 Achieved milestones:`);
        result.achievedMilestones.forEach(m => {
          console.log(`     - ${m.name}`);
        });
      }
    }
    console.log();

    // 4. 일일 체크인 테스트
    console.log('4. Testing daily check-in...');
    const checkInResult = await aptEvolutionService.checkDailyVisit(testUser.id);
    if (checkInResult.alreadyVisited) {
      console.log('✓ Already checked in today');
    } else {
      console.log(`✓ Check-in successful! Streak: ${checkInResult.streak} days`);
      if (checkInResult.perfectWeek) {
        console.log('  🎊 Perfect week achieved!');
      }
    }
    console.log();

    // 5. 마일스톤 체크
    console.log('5. Checking milestones...');
    const rewardSystem = new EvolutionRewardSystem();
    const userStats = {
      totalPoints: evolutionState.stats.totalPoints + 100, // 시뮬레이션
      evolutionStage: evolutionState.stage,
      actionCounts: {
        artwork_view: 5,
        artwork_like: 3
      },
      currentStreak: 3,
      viewedStyles: ['impressionism', 'abstract', 'modern']
    };

    const achievableMilestones = await rewardSystem.checkMilestones(testUser.id, userStats);
    console.log(`✓ ${achievableMilestones.length} milestones achievable`);
    achievableMilestones.forEach(m => {
      console.log(`  - ${m.name}: ${m.description}`);
    });
    console.log();

    // 6. 리더보드 조회
    console.log('6. Fetching leaderboard...');
    const leaderboard = await aptEvolutionService.getLeaderboard(null, 'weekly');
    console.log('✓ Weekly leaderboard (Top 5):');
    leaderboard.slice(0, 5).forEach(entry => {
      console.log(`  ${entry.rank}. ${entry.name} (${entry.aptType}) - ${entry.points} points`);
    });
    console.log();

    // 7. 시각적 데이터 테스트
    console.log('7. Testing visual data generation...');
    const visualSystem = require('./src/models/animalEvolutionVisual');
    const visual = new visualSystem();
    const visualData = visual.getVisualData(testUser.type_code, evolutionState.stage, ['first_evolution']);
    console.log('✓ Visual data generated:');
    console.log(`  - Base image: ${visualData.baseImage}`);
    console.log(`  - Container filter: ${visualData.containerStyles.filter}`);
    console.log(`  - Decorations: ${visualData.decorations.length} items`);
    console.log();

    // 8. 진화 애니메이션 데이터
    console.log('8. Testing evolution animation...');
    const animSystem = new AnimalEvolutionSystem();
    const animation = animSystem.getEvolutionAnimation(2, 3);
    console.log('✓ Evolution animation:');
    console.log(`  - Duration: ${animation.duration}ms`);
    console.log(`  - Phases: ${animation.effects.map(e => e.phase).join(' → ')}`);

    console.log('\n=== Test completed successfully! ===');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await db.end();
  }
}

// 실행
testEvolutionSystem();