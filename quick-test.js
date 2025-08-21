// Quick test script for ProfileCompletion
// Run this in browser console

console.log('=== SAYU ProfileCompletion Test ===');

// 1. Check current localStorage state
console.log('\n📦 localStorage 상태:');
console.log('profile_completed:', localStorage.getItem('profile_completed'));
console.log('profile_skipped:', localStorage.getItem('profile_skipped'));

// 2. Clear flags to trigger ProfileCompletion
function clearProfileFlags() {
  localStorage.removeItem('profile_completed');
  localStorage.removeItem('profile_skipped');
  console.log('✅ ProfileCompletion 플래그 초기화 완료');
  console.log('🔄 페이지를 새로고침하면 ProfileCompletion이 표시됩니다');
}

// 2-1. Set APT personality type for testing  
function setPersonalityType(type) {
  // Valid APT types (L=Lone, S=Social / A=Abstract, R=Realistic / E=Emotional, M=Methodical / F=Flexible, C=Controlled)
  const validTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
  const aptType = validTypes.includes(type) ? type : 'LAEF';
  
  const quizData = {
    personalityType: aptType,
    scores: {},
    responses: [],
    completedAt: new Date().toISOString()
  };
  localStorage.setItem('quizResults', JSON.stringify(quizData));
  console.log(`✅ APT 유형을 ${aptType}로 설정했습니다`);
  console.log('🔄 페이지를 새로고침하면 적용됩니다');
}

// 3. Check if user is logged in
const hasUser = document.querySelector('[data-user-id]') || 
                document.cookie.includes('supabase-auth-token');
console.log('\n👤 로그인 상태:', hasUser ? '로그인됨' : '로그아웃');

// 4. Check if mobile view
const isMobile = window.innerWidth < 768;
console.log('📱 디바이스:', isMobile ? '모바일' : '데스크탑', `(${window.innerWidth}px)`);

// 5. Should show ProfileCompletion?
const shouldShow = hasUser && 
                   !localStorage.getItem('profile_completed') && 
                   !localStorage.getItem('profile_skipped');
console.log('\n🎯 ProfileCompletion 표시 조건:', shouldShow ? '충족 ✅' : '미충족 ❌');
console.log('✨ 이제 모바일과 데스크탑 모두에서 모달 팝업으로 표시됩니다!');

// Check current personality type
const quizResults = localStorage.getItem('quizResults');
if (quizResults) {
  const results = JSON.parse(quizResults);
  console.log('\n🎨 현재 저장된 유형:', results.personalityType);
  
  // Check if it's invalid MBTI type
  const validAPT = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                    'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
  
  if (!validAPT.includes(results.personalityType)) {
    console.log('⚠️ 잘못된 MBTI 타입이 저장되어 있습니다! APT로 변경이 필요합니다.');
    console.log('👉 setPersonalityType("LAEF") 등으로 올바른 APT 타입을 설정하세요');
  }
} else {
  console.log('\n❌ APT 유형이 설정되지 않았습니다');
}

// Instructions
console.log('\n📋 사용 방법:');
console.log('1. fixPersonalityType() - MBTI를 APT로 자동 교체 (ENFP 등 제거)');
console.log('2. clearProfileFlags() - ProfileCompletion 표시를 위한 초기화');
console.log('3. setPersonalityType("LAEF") - APT 유형 설정');
console.log('   L: Lone(혼자), S: Social(함께)');
console.log('   A: Abstract(추상), R: Realistic(구상)');  
console.log('   E: Emotional(감성), M: Methodical(논리)');
console.log('   F: Flexible(유연), C: Controlled(통제)');
console.log('   예시: LAEF(몽환적 방랑자), SAEF(네온 축제), SRMF(스포트라이트 마에스트로)');
console.log('3. 페이지 새로고침 후 변경사항 확인');
console.log('4. 개발자 도구 Console에서 로그 확인');

// 3. Clean up invalid MBTI and set correct APT
function fixPersonalityType() {
  // Remove any invalid MBTI data
  const quizResults = localStorage.getItem('quizResults');
  if (quizResults) {
    const results = JSON.parse(quizResults);
    const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                       'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    if (mbtiTypes.includes(results.personalityType)) {
      console.log('🧹 잘못된 MBTI 타입 제거 중...');
      localStorage.removeItem('quizResults');
      
      // Set a default APT type
      const defaultAPT = 'LAEF'; // 몽환적 방랑자
      setPersonalityType(defaultAPT);
      console.log(`✅ APT 타입 ${defaultAPT}(몽환적 방랑자)로 교체 완료!`);
      return true;
    }
  }
  console.log('✅ 이미 올바른 APT 타입이거나 설정 없음');
  return false;
}

// Make functions available globally
window.clearProfileFlags = clearProfileFlags;
window.setPersonalityType = setPersonalityType;
window.fixPersonalityType = fixPersonalityType;

// Auto check and fix MBTI types
if (typeof window !== 'undefined') {
  // Check for invalid MBTI immediately
  const quizData = localStorage.getItem('quizResults');
  if (quizData) {
    const results = JSON.parse(quizData);
    const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                       'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    if (mbtiTypes.includes(results.personalityType)) {
      console.log('\n🚨 경고: 잘못된 MBTI 타입 발견!', results.personalityType);
      console.log('👉 fixPersonalityType()을 실행하여 APT로 교체하세요!');
    }
  }
}

// Auto-run test when script is loaded
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('\n🚀 ProfileCompletion 자동 테스트 시작...');
    
    // Run the test
    console.log('\n=== 1단계: localStorage 초기화 ===');
    clearProfileFlags();
    
    console.log('\n=== 2단계: 현재 상태 확인 ===');
    const currentUrl = window.location.href;
    console.log('현재 URL:', currentUrl);
    
    if (!currentUrl.includes('/profile')) {
      console.log('📌 /profile 페이지로 이동해서 ProfileCompletion을 확인하세요');
      console.log('또는 다음 명령어를 실행하세요: window.location.href = "/profile"');
    } else {
      console.log('✅ 이미 프로필 페이지에 있습니다');
      console.log('🔍 ProfileCompletion 컴포넌트를 찾는 중...');
      
      setTimeout(() => {
        const profileModal = document.querySelector('.fixed.inset-0.bg-black\\/50') || 
                             document.querySelector('[class*="ProfileCompletion"]');
        
        if (profileModal) {
          console.log('✅ ProfileCompletion 모달을 찾았습니다!');
          console.log('🎯 모달이 화면에 표시되고 있습니다');
          profileModal.style.border = '3px solid red';
          profileModal.style.boxShadow = '0 0 20px red';
        } else {
          console.log('❌ ProfileCompletion 모달을 찾을 수 없습니다');
          console.log('다음을 확인하세요:');
          console.log('- 로그인 되었나요?');
          console.log('- localStorage가 초기화되었나요?');
          console.log('- 페이지가 완전히 로드되었나요?');
          console.log('📝 모달이 표시될 때까지 잠시 기다려보세요');
        }
      }, 1000);
    }
  }, 500);
}