// 🧪 Gallery Collection 빠른 테스트
// node scripts/quick-gallery-test.js 로 실행

const API_URL = 'http://localhost:3000/api/gallery/collection';

// ⚠️ 실제 USER_ID로 변경 필요!
// Supabase Dashboard > Authentication > Users에서 확인
const USER_ID = '103b58c7-3c54-4476-b341-46a8017ed90a';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function test() {
  console.log(`${colors.blue}🧪 Gallery Collection API 테스트 시작${colors.reset}\n`);
  
  if (USER_ID === 'YOUR_USER_ID_HERE') {
    console.log(`${colors.red}❌ USER_ID를 실제 ID로 변경해주세요!${colors.reset}`);
    console.log('Supabase Dashboard > Authentication > Users에서 확인 가능\n');
    return;
  }
  
  // 1. 작품 저장 테스트
  console.log(`${colors.yellow}1️⃣ 작품 저장 테스트...${colors.reset}`);
  try {
    const saveResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        artworkId: 'peasant-woman',
        action: 'save',
        artworkData: {
          title: 'Peasant Woman',
          artist: 'Vincent van Gogh',
          year: '1885',
          imageUrl: 'https://example.com/peasant-woman.jpg',
          museum: 'Van Gogh Museum',
          department: 'Paintings',
          medium: 'Oil on canvas',
          isPublicDomain: true
        }
      })
    });
    
    const saveData = await saveResponse.json();
    if (saveData.success) {
      console.log(`${colors.green}✅ 저장 성공!${colors.reset}`);
      console.log(`   새 컬렉션 수: ${saveData.newCount}`);
      if (saveData.alreadySaved) {
        console.log('   (이미 저장된 작품)');
      }
    } else {
      console.log(`${colors.red}❌ 저장 실패:${colors.reset}`, saveData.error);
      console.log('\n💡 해결 방법:');
      console.log('1. Supabase에서 scripts/01-add-external-id-safely.sql 실행');
      console.log('2. 서버 재시작 (npm run dev)');
    }
  } catch (error) {
    console.error(`${colors.red}❌ 네트워크 오류:${colors.reset}`, error.message);
    console.log('\n💡 서버가 실행 중인지 확인: npm run dev');
  }
  
  // 2. 다른 작품도 저장
  console.log(`\n${colors.yellow}2️⃣ 두 번째 작품 저장...${colors.reset}`);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        artworkId: 'met-436533',
        action: 'save',
        artworkData: {
          title: 'The Great Wave',
          artist: 'Katsushika Hokusai',
          year: '1831',
          imageUrl: 'https://example.com/great-wave.jpg',
          museum: 'Metropolitan Museum',
          department: 'Asian Art'
        }
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`${colors.green}✅ 저장 성공!${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ 오류:${colors.reset}`, error.message);
  }
  
  // 3. 컬렉션 조회 테스트
  console.log(`\n${colors.yellow}3️⃣ 컬렉션 조회 테스트...${colors.reset}`);
  try {
    const getResponse = await fetch(`${API_URL}?userId=${USER_ID}`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log(`${colors.green}✅ 조회 성공!${colors.reset}`);
      console.log(`   저장된 작품: ${getData.count}개`);
      
      if (getData.items && getData.items.length > 0) {
        console.log('\n   📚 컬렉션 목록:');
        getData.items.slice(0, 5).forEach((item, i) => {
          console.log(`   ${i + 1}. ${item.title} - ${item.artist}`);
          console.log(`      ID: ${item.id}`);
        });
      }
    } else {
      console.log(`${colors.red}❌ 조회 실패:${colors.reset}`, getData.error);
    }
  } catch (error) {
    console.error(`${colors.red}❌ 오류:${colors.reset}`, error.message);
  }
  
  // 4. 작품 제거 테스트
  console.log(`\n${colors.yellow}4️⃣ 작품 제거 테스트...${colors.reset}`);
  try {
    const removeResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        artworkId: 'peasant-woman',
        action: 'remove'
      })
    });
    
    const removeData = await removeResponse.json();
    if (removeData.success) {
      console.log(`${colors.green}✅ 제거 성공!${colors.reset}`);
      console.log(`   남은 작품: ${removeData.newCount}개`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ 오류:${colors.reset}`, error.message);
  }
  
  console.log(`\n${colors.green}✨ 테스트 완료!${colors.reset}`);
  console.log('\n📝 다음 단계:');
  console.log('1. 모든 테스트가 성공했다면 → 완료!');
  console.log('2. 실패한 테스트가 있다면 → scripts/STEP_BY_STEP_GUIDE.md 참고');
  console.log('3. 성능 최적화를 원한다면 → scripts/04-add-indexes.sql 실행');
}

// 실행
test().catch(console.error);