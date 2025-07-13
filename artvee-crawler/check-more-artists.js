const axios = require('axios');

// 추가로 확인이 필요한 작가들
const checkArtists = [
  // 이름 형식 확인
  'j-m-w-turner',  // 또는 joseph-mallord-william-turner?
  'lawrence-alma-tadema',  // 또는 다른 형식?
  'jean-baptiste-simeon-chardin',  // 긴 이름
  
  // 현대 작가들
  'francis-bacon',
  'lucian-freud', 
  'david-hockney',
  'andy-warhol',
  
  // 새로 추가한 작가들
  'arthur-rackham',
  'gustave-dore',
  'grant-wood',
  'georgia-okeeffe'
];

async function checkMoreArtists() {
  console.log('🔍 추가 작가 확인\n');
  
  for (const artist of checkArtists) {
    const url = `https://artvee.com/artist/${artist}/`;
    
    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });
      
      console.log(`✅ ${artist}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${artist} - 404`);
        
        // 대체 이름 시도
        if (artist === 'j-m-w-turner') {
          console.log('   → turner 또는 joseph-mallord-william-turner 시도 필요');
        }
      } else {
        console.log(`⚠️ ${artist} - 오류`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n💡 Artvee에서 확인된 다른 유명 작가들:');
  const safeAlternatives = [
    'eugene-delacroix', 'theodore-gericault', 'jacques-louis-david',
    'jean-leon-gerome', 'alexandre-cabanel', 'william-adolphe-bouguereau',
    'ivan-aivazovsky', 'ilya-repin', 'valentin-serov',
    'joaquin-sorolla', 'john-william-godward', 'eugene-boudin'
  ];
  console.log(safeAlternatives.join(', '));
}

checkMoreArtists().catch(console.error);