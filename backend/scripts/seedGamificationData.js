// 🎨 SAYU Gamification Data Seeder
// 기본 업적과 미션 템플릿 데이터를 데이터베이스에 추가

const { Achievement, MissionTemplate, CompanionTitle } = require('../src/models/Gamification');
const { CompanionTitle: CompanionTitleModel } = require('../src/models/CompanionEvaluation');

const achievementsData = [
  {
    id: 'first_steps',
    name: 'First Steps',
    name_ko: '첫 발걸음',
    description: 'Complete your first art personality quiz',
    description_ko: '첫 예술 성격 퀴즈 완료',
    icon: '👶',
    points: 50,
    category: 'exploration'
  },
  {
    id: 'self_discovery',
    name: 'Self Discovery',
    name_ko: '자아 발견',
    description: 'Explore all aspects of your personality type',
    description_ko: '내 성격 유형의 모든 면 탐구',
    icon: '🔍',
    points: 100,
    category: 'exploration'
  },
  {
    id: 'exhibition_explorer',
    name: 'Exhibition Explorer',
    name_ko: '전시 탐험가',
    description: 'Visit 5 different exhibitions',
    description_ko: '5개의 다른 전시 방문',
    icon: '🖼️',
    points: 150,
    category: 'exploration'
  },
  {
    id: 'chemistry_checker',
    name: 'Chemistry Checker',
    name_ko: '궁합 확인자',
    description: 'Check compatibility with 10 different types',
    description_ko: '10개의 다른 유형과 궁합 확인',
    icon: '💕',
    points: 100,
    category: 'social'
  },
  {
    id: 'perfect_match',
    name: 'Perfect Match',
    name_ko: '완벽한 매치',
    description: 'Find a platinum level compatibility',
    description_ko: '플래티넘 레벨 궁합 발견',
    icon: '💎',
    points: 150,
    category: 'social'
  }
];

const missionTemplatesData = [
  {
    id: 'daily_login',
    type: 'daily',
    title: 'Daily Check-in',
    title_ko: '일일 체크인',
    description: 'Log in to SAYU today',
    description_ko: '오늘 SAYU에 로그인하기',
    points: 10,
    target: 1,
    category: 'personality_exploration',
    recurring: true
  },
  {
    id: 'daily_compatibility',
    type: 'daily',
    title: 'Chemistry Check',
    title_ko: '궁합 체크',
    description: 'Check compatibility with one personality type',
    description_ko: '하나의 성격 유형과 궁합 확인하기',
    points: 20,
    target: 1,
    category: 'social_interaction',
    recurring: true
  },
  {
    id: 'weekly_exhibition',
    type: 'weekly',
    title: 'Exhibition Week',
    title_ko: '전시 주간',
    description: 'Visit 2 exhibitions this week',
    description_ko: '이번 주에 2개의 전시 방문하기',
    points: 100,
    target: 2,
    category: 'exhibition_visit',
    recurring: true
  }
];

const companionTitlesData = [
  {
    id: 'insight_provider',
    name: 'Insight Provider',
    name_ko: '인사이트 제공자',
    description: 'Consistently provides new perspectives on art',
    description_ko: '지속적으로 예술에 대한 새로운 관점을 제공',
    icon: '💡',
    requirement: 'Average newPerspectives rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'perfect_pace',
    name: 'Perfect Pace Partner',
    name_ko: '완벽한 페이스 파트너',
    description: 'Excellent at matching exhibition viewing pace',
    description_ko: '전시 관람 속도를 완벽하게 맞춤',
    icon: '🚶',
    requirement: 'Average paceMatching rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'art_communicator',
    name: 'Art Communicator',
    name_ko: '예술 소통가',
    description: 'Master of art-related conversations',
    description_ko: '예술 관련 대화의 달인',
    icon: '💬',
    requirement: 'Average communication rating > 4.5 (min 10 evaluations)'
  }
];

async function seedGamificationData() {
  try {
    console.log('🌱 Seeding gamification data...');

    // Seed achievements
    for (const achievement of achievementsData) {
      await Achievement.findOrCreate({
        where: { id: achievement.id },
        defaults: achievement
      });
    }
    console.log('✅ Achievements seeded');

    // Seed mission templates
    for (const template of missionTemplatesData) {
      await MissionTemplate.findOrCreate({
        where: { id: template.id },
        defaults: template
      });
    }
    console.log('✅ Mission templates seeded');

    // Seed companion titles
    for (const title of companionTitlesData) {
      await CompanionTitleModel.findOrCreate({
        where: { id: title.id },
        defaults: title
      });
    }
    console.log('✅ Companion titles seeded');

    console.log('🎉 Gamification data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding gamification data:', error);
  }
}

module.exports = { seedGamificationData };

// Run if called directly
if (require.main === module) {
  const { connectDatabase } = require('../src/config/database');

  connectDatabase().then(() => {
    seedGamificationData().then(() => {
      process.exit(0);
    });
  }).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
}
