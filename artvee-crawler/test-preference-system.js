const ArtistPreferenceSystem = require('./lib/artist-preference-system');
require('dotenv').config();

/**
 * 작가 선호도 시스템 테스트
 */
async function testPreferenceSystem() {
  const prefSystem = new ArtistPreferenceSystem(process.env.DATABASE_URL);
  
  console.log('🎨 작가 선호도 시스템 테스트\n');
  
  try {
    // 테스트용 사용자 ID (실제 DB에 있는 사용자 ID로 변경 필요)
    const testUserId = 'test-user-id'; // 실제 UUID로 교체
    const testSayuType = 'LAEF'; // 여우 - 몽환적 방랑자
    
    // 1. 초기 선호도 설정
    console.log('1️⃣ APT 기반 초기 선호도 설정...');
    await prefSystem.initializeUserPreferences(testUserId, testMbtiType);
    console.log('   ✅ 완료\n');
    
    // 2. 사용자 상호작용 시뮬레이션
    console.log('2️⃣ 사용자 상호작용 학습...');
    
    // Van Gogh 작품 감상
    await prefSystem.learnUserPreference(testUserId, {
      artworkId: 'test-artwork-1', // 실제 artwork ID로 교체
      interactionType: 'view',
      duration: 120, // 2분
      rating: 5
    });
    console.log('   - Van Gogh 작품 감상 (2분, 5점)');
    
    // Monet 작품 좋아요
    await prefSystem.learnUserPreference(testUserId, {
      artworkId: 'test-artwork-2',
      interactionType: 'like',
      duration: 45
    });
    console.log('   - Monet 작품 좋아요');
    
    // 탐색적 작품 저장
    await prefSystem.learnUserPreference(testUserId, {
      artworkId: 'test-artwork-3',
      interactionType: 'save',
      rating: 4
    });
    console.log('   - 새로운 스타일 작품 저장\n');
    
    // 3. 사용자 프로필 로드
    console.log('3️⃣ 사용자 취향 프로필 분석...');
    const userProfile = await prefSystem.loadUserProfile(testUserId);
    
    console.log('   📊 선호 작가 Top 5:');
    userProfile.topArtists.slice(0, 5).forEach((pref, i) => {
      console.log(`      ${i + 1}. ${pref.artist} (점수: ${pref.total_score})`);
    });
    
    console.log('\n   📊 선호 장르 Top 3:');
    userProfile.topGenres.slice(0, 3).forEach((pref, i) => {
      console.log(`      ${i + 1}. ${pref.genre} (점수: ${pref.total_score})`);
    });
    
    // 4. 맞춤형 추천 생성
    console.log('\n4️⃣ 맞춤형 작품 추천...');
    const recommendations = await prefSystem.getPersonalizedRecommendations(testUserId, {
      limit: 10,
      diversityFactor: 0.3
    });
    
    console.log(`   🎯 추천 작품 ${recommendations.length}개:\n`);
    
    recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. "${rec.title}" - ${rec.artist}`);
      console.log(`      유형: ${rec.recommendation_type}`);
      console.log(`      점수: ${rec.final_score?.toFixed(2) || 'N/A'}`);
      
      const explanation = prefSystem.generateRecommendationExplanation(
        rec, 
        userProfile, 
        rec.recommendation_type
      );
      console.log(`      설명: ${explanation}\n`);
    });
    
    // 5. 추천 다양성 분석
    console.log('5️⃣ 추천 다양성 분석...');
    const uniqueArtists = new Set(recommendations.map(r => r.artist));
    const uniqueGenres = new Set(recommendations.map(r => r.genre));
    const recommendationTypes = recommendations.reduce((acc, r) => {
      acc[r.recommendation_type] = (acc[r.recommendation_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   - 고유 작가 수: ${uniqueArtists.size}`);
    console.log(`   - 고유 장르 수: ${uniqueGenres.size}`);
    console.log('   - 추천 유형 분포:');
    Object.entries(recommendationTypes).forEach(([type, count]) => {
      console.log(`     • ${type}: ${count}개`);
    });
    
    // 6. 작가 연관성 테스트
    console.log('\n6️⃣ 작가 연관성 분석...');
    const artistRelations = prefSystem.artistRelations['monet'];
    if (artistRelations) {
      console.log('   Monet과 연관된 작가들:');
      console.log(`   - 같은 운동: ${artistRelations.related.join(', ')}`);
      console.log(`   - 영향받은: ${artistRelations.influenced_by.join(', ')}`);
      console.log(`   - 영향준: ${artistRelations.influenced.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 실행
testPreferenceSystem().catch(console.error);