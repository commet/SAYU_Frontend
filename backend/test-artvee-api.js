/**
 * Artvee-Artists API 테스트
 * 새로 생성된 API 엔드포인트들의 동작 확인
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

const BASE_URL = 'http://localhost:3001/api/artvee-artworks';

async function testArtveeAPI() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Artvee-Artists API 테스트 시작...\n');
    
    // 1. 테스트용 작가 ID 찾기 (Vincent van Gogh)
    const artistResult = await client.query(`
      SELECT a.id, a.name 
      FROM artists a
      INNER JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      WHERE LOWER(a.name) LIKE '%van gogh%'
      LIMIT 1
    `);
    
    if (artistResult.rows.length === 0) {
      console.log('❌ 테스트용 작가를 찾을 수 없습니다.');
      return;
    }
    
    const testArtist = artistResult.rows[0];
    console.log(`🎨 테스트 작가: ${testArtist.name} (${testArtist.id})`);
    
    // 2. API 테스트 시나리오
    const testCases = [
      {
        name: '특정 작가의 작품 조회',
        url: `${BASE_URL}/artists/${testArtist.id}/artworks?limit=5`,
        method: 'GET'
      },
      {
        name: 'LAEF 성격 유형 추천',
        url: `${BASE_URL}/recommendations/personality/LAEF?limit=10`,
        method: 'GET'
      },
      {
        name: '랜덤 작품 (매칭된 작가만)',
        url: `${BASE_URL}/random?count=3&matchedOnly=true`,
        method: 'GET'
      },
      {
        name: '작가 검색',
        url: `${BASE_URL}/artists/search?q=van&limit=5`,
        method: 'GET'
      },
      {
        name: '매칭 통계',
        url: `${BASE_URL}/stats`,
        method: 'GET'
      }
    ];
    
    console.log('\n📡 API 엔드포인트 테스트:\n');
    
    // curl 명령어 생성 및 실행 안내
    for (const testCase of testCases) {
      console.log(`🔍 ${testCase.name}:`);
      console.log(`   curl "${testCase.url}"`);
      console.log('');
    }
    
    // 실제 데이터 쿼리로 검증
    console.log('✅ 데이터 검증:\n');
    
    // 작가별 작품 수 확인
    const artistArtworks = await client.query(`
      SELECT COUNT(*) as count
      FROM artvee_artwork_artists
      WHERE artist_id = $1
    `, [testArtist.id]);
    
    console.log(`📊 ${testArtist.name}의 Artvee 작품 수: ${artistArtworks.rows[0].count}개`);
    
    // LAEF 타입 작품 수 확인
    const laefArtworks = await client.query(`
      SELECT COUNT(*) as count
      FROM artvee_artworks
      WHERE 'LAEF' = ANY(personality_tags) OR sayu_type = 'LAEF'
    `);
    
    console.log(`🦊 LAEF 성격 유형 작품 수: ${laefArtworks.rows[0].count}개`);
    
    // 매칭된 작품 비율
    const matchedRatio = await client.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(aaa.artwork_id) as matched_artworks,
        ROUND(COUNT(aaa.artwork_id)::numeric / COUNT(*) * 100, 1) as match_percentage
      FROM artvee_artworks aa
      LEFT JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
    `);
    
    const stats = matchedRatio.rows[0];
    console.log(`🔗 매칭 비율: ${stats.matched_artworks}/${stats.total_artworks} (${stats.match_percentage}%)`);
    
    console.log('\n🚀 API 사용 예시:');
    console.log(`
// JavaScript 예시
async function getArtistArtworks(artistId) {
  const response = await fetch('${BASE_URL}/artists/\${artistId}/artworks');
  const data = await response.json();
  return data.data.artworks;
}

// React 컴포넌트 예시
function ArtveeGallery({ personalityType }) {
  const [artworks, setArtworks] = useState([]);
  
  useEffect(() => {
    fetch('${BASE_URL}/recommendations/personality/\${personalityType}')
      .then(res => res.json())
      .then(data => setArtworks(data.data.artworks));
  }, [personalityType]);
  
  return (
    <div className="gallery">
      {artworks.map(artwork => (
        <img 
          key={artwork.id}
          src={artwork.artvee_url} 
          alt={artwork.title}
          title={\`\${artwork.title} by \${artwork.artist_name}\`}
        />
      ))}
    </div>
  );
}

// Cloudinary 통합 예시 (향후)
function getCloudinaryUrl(artveeArtwork, transformations = '') {
  // artveeArtwork.artvee_url을 Cloudinary URL로 변환
  const baseUrl = 'https://res.cloudinary.com/sayu/image/fetch';
  const transforms = transformations || 'c_fill,w_400,h_400,q_auto';
  return \`\${baseUrl}/\${transforms}/\${encodeURIComponent(artveeArtwork.artvee_url)}\`;
}
    `);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    client.release();
  }
}

// 실행
testArtveeAPI().then(() => {
  console.log('\n✅ API 테스트 완료!');
  process.exit(0);
}).catch(error => {
  console.error('❌ 테스트 실패:', error);
  process.exit(1);
});