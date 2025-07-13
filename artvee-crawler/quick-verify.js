const axios = require('axios');

// 각 타입별로 1-2명씩 샘플 확인
const sampleArtists = [
  // 확실할 것 같은 작가들
  'vincent-van-gogh',
  'claude-monet', 
  'rembrandt',
  'leonardo-da-vinci',
  
  // 불확실한 작가들
  'william-blake',
  'salvador-dali',
  'jean-michel-basquiat',
  'frank-stella',
  'kaws',
  'nicolas-de-stael',
  'giorgio-morandi',
  'chaim-soutine'
];

async function quickVerify() {
  console.log('🔍 샘플 작가 빠른 확인\n');
  
  for (const artist of sampleArtists) {
    const url = `https://artvee.com/artist/${artist}/`;
    
    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });
      
      console.log(`✅ ${artist} - 존재함`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${artist} - 없음`);
      } else {
        console.log(`⚠️ ${artist} - 확인 불가`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

quickVerify().catch(console.error);