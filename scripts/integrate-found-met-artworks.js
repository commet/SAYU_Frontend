/**
 * 🎨 발견된 MET 작품들 SAYU 통합
 * 4개 작품의 메타데이터 수집 및 DB 통합 준비
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🎨 발견된 MET 작품들 SAYU 통합!');
console.log('=====================================');

// 발견된 MET Chicago 작품들
const DISCOVERED_ARTWORKS = [
  {
    objectId: '205641',
    cloudinaryUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-205641.jpg',
    fileSize: '0.18MB'
  },
  {
    objectId: '57854',
    cloudinaryUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-57854.jpg',
    fileSize: '0.20MB'
  },
  {
    objectId: '19432',
    cloudinaryUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-19432.jpg',
    fileSize: '0.08MB'
  },
  {
    objectId: '58540',
    cloudinaryUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-58540.jpg',
    fileSize: '0.22MB'
  }
];

function apiRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`JSON 파싱 오류: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

function inferAPTTypes(metadata) {
  const aptTypes = [];
  
  // 부서별 APT 추론
  const dept = metadata.department?.toLowerCase() || '';
  const classification = metadata.classification?.toLowerCase() || '';
  const medium = metadata.medium?.toLowerCase() || '';
  
  // 도자기, 장식예술 → 세련되고 미적인 성향
  if (classification.includes('ceramics') || classification.includes('porcelain')) {
    aptTypes.push('SAEF', 'SREF', 'LAEF'); // 세련된 예술적 성향
  }
  
  if (dept.includes('decorative') || dept.includes('sculpture')) {
    aptTypes.push('SREF', 'SAEF', 'LRMF'); // 미적 감각이 뛰어난 성향
  }
  
  // 유럽 예술 → 클래식하고 전통적인 성향
  if (dept.includes('european')) {
    aptTypes.push('SREF', 'SRIF', 'SAEF');
  }
  
  // 기본 추천 (예술 작품이므로)
  if (aptTypes.length === 0) {
    aptTypes.push('SAEF', 'LAEF', 'SREF'); // 예술적 성향들
  }
  
  return [...new Set(aptTypes)].slice(0, 3); // 중복 제거, 상위 3개
}

async function collectMetadata() {
  console.log('📚 MET API에서 메타데이터 수집...\n');
  
  const artworksWithMetadata = [];
  
  for (const artwork of DISCOVERED_ARTWORKS) {
    try {
      console.log(`🔍 Object ID ${artwork.objectId} 메타데이터 수집...`);
      
      const metadata = await apiRequest(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${artwork.objectId}`);
      
      if (metadata.objectID) {
        const enrichedArtwork = {
          ...artwork,
          metadata: {
            title: metadata.title || 'Untitled',
            artist: metadata.artistDisplayName || 'Unknown Artist',
            artistBio: metadata.artistBio || '',
            department: metadata.department || '',
            classification: metadata.classification || '',
            medium: metadata.medium || '',
            dimensions: metadata.dimensions || '',
            date: metadata.objectDate || '',
            period: metadata.period || '',
            dynasty: metadata.dynasty || '',
            culture: metadata.culture || '',
            region: metadata.region || '',
            country: metadata.country || '',
            creditLine: metadata.creditLine || '',
            isPublicDomain: metadata.isPublicDomain || false,
            primaryImage: metadata.primaryImage || '',
            additionalImages: metadata.additionalImages || [],
            tags: metadata.tags || [],
            accessionNumber: metadata.accessionNumber || '',
            objectURL: metadata.objectURL || '',
            repository: metadata.repository || ''
          }
        };
        
        artworksWithMetadata.push(enrichedArtwork);
        
        console.log(`   ✅ "${enrichedArtwork.metadata.title}"`);
        console.log(`      👨‍🎨 ${enrichedArtwork.metadata.artist}`);
        console.log(`      📅 ${enrichedArtwork.metadata.date}`);
        console.log(`      🏛️ ${enrichedArtwork.metadata.department}`);
        console.log(`      🎨 ${enrichedArtwork.metadata.medium}`);
        console.log('');
        
      } else {
        console.log(`❌ Object ID ${artwork.objectId}: API 데이터 없음`);
      }
      
      // API 호출 제한 준수
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Object ID ${artwork.objectId} 메타데이터 수집 실패: ${error.message}`);
    }
  }
  
  return artworksWithMetadata;
}

function generateSayuData(artworksWithMetadata) {
  console.log('🎨 SAYU 컬렉션용 데이터 생성...\n');
  
  const sayuArtworks = artworksWithMetadata.map((artwork, index) => {
    const aptTypes = inferAPTTypes(artwork.metadata);
    
    // 연도 추출
    const yearMatch = artwork.metadata.date?.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : null;
    
    // 태그 정리
    const tags = artwork.metadata.tags?.map(tag => tag.term).filter(Boolean) || [];
    
    const sayuArtwork = {
      id: `met-chicago-${artwork.objectId}`,
      title: artwork.metadata.title,
      artist: artwork.metadata.artist,
      year: year,
      medium: artwork.metadata.medium,
      dimensions: artwork.metadata.dimensions,
      description: artwork.metadata.title, // 임시로 제목 사용
      
      // SAYU 특화 필드들
      source: 'Metropolitan Museum of Art',
      sourceUrl: artwork.metadata.objectURL,
      isPublicDomain: artwork.metadata.isPublicDomain,
      
      // 이미지 URL
      full: {
        url: artwork.cloudinaryUrl,
        width: null, // 나중에 이미지 정보로 업데이트
        height: null
      },
      
      // APT 매칭
      sayuType: aptTypes[0] || 'SAEF', // 주 타입
      suggestedAptTypes: aptTypes,
      
      // MET 특화 정보
      metObjectId: parseInt(artwork.objectId),
      department: artwork.metadata.department,
      classification: artwork.metadata.classification,
      culture: artwork.metadata.culture,
      period: artwork.metadata.period,
      creditLine: artwork.metadata.creditLine,
      accessionNumber: artwork.metadata.accessionNumber,
      
      // 메타데이터
      tags: tags,
      fileSize: artwork.fileSize,
      
      // DB 삽입용 추가 필드
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    console.log(`${index + 1}. ${sayuArtwork.title}`);
    console.log(`   👨‍🎨 ${sayuArtwork.artist} (${sayuArtwork.year || 'Unknown'})`);
    console.log(`   🎨 ${sayuArtwork.medium}`);
    console.log(`   🏛️ ${sayuArtwork.department}`);
    console.log(`   🧬 APT: ${sayuArtwork.suggestedAptTypes.join(', ')}`);
    console.log(`   🔗 ${sayuArtwork.full.url}`);
    console.log('');
    
    return sayuArtwork;
  });
  
  return sayuArtworks;
}

function generateSupabaseSQL(sayuArtworks) {
  console.log('📝 Supabase SQL 삽입문 생성...\n');
  
  const insertValues = sayuArtworks.map(artwork => {
    // SQL 안전한 문자열로 변환
    const escape = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
    
    return `(
      ${escape(artwork.id)},
      ${escape(artwork.title)},
      ${escape(artwork.artist)},
      ${artwork.year || 'NULL'},
      ${escape(artwork.medium)},
      ${escape(artwork.description)},
      ${escape(artwork.source)},
      ${escape(artwork.sourceUrl)},
      ${artwork.isPublicDomain},
      '${JSON.stringify(artwork.full).replace(/'/g, "''")}',
      ${escape(artwork.sayuType)},
      ${artwork.metObjectId},
      ${escape(artwork.department)},
      ${escape(artwork.classification)},
      ${escape(artwork.culture)},
      ${escape(artwork.period)},
      ${escape(artwork.creditLine)},
      ${escape(artwork.accessionNumber)},
      '${JSON.stringify(artwork.tags).replace(/'/g, "''")}',
      NOW(),
      NOW(),
      true
    )`;
  }).join(',\n    ');
  
  const sql = `-- SAYU MET Chicago 컬렉션 삽입
-- 발견된 4개 MET 작품을 artwork 테이블에 추가

INSERT INTO artwork (
  id,
  title,
  artist,
  year,
  medium,
  description,
  source,
  source_url,
  is_public_domain,
  full,
  sayu_type,
  met_object_id,
  department,
  classification,
  culture,
  period,
  credit_line,
  accession_number,
  tags,
  created_at,
  updated_at,
  is_active
) VALUES
    ${insertValues};

-- 삽입 확인 쿼리
SELECT 
  id, 
  title, 
  artist, 
  year,
  source,
  sayu_type,
  met_object_id
FROM artwork 
WHERE source = 'Metropolitan Museum of Art'
ORDER BY met_object_id;`;

  return sql;
}

// 메인 실행
async function integrateMetArtworks() {
  try {
    console.log('🚀 MET 작품 SAYU 통합 시작...\n');
    console.log(`📊 통합 대상: ${DISCOVERED_ARTWORKS.length}개 작품\n`);
    
    // 1. 메타데이터 수집
    const artworksWithMetadata = await collectMetadata();
    console.log(`✅ 메타데이터 수집 완료: ${artworksWithMetadata.length}개\n`);
    
    // 2. SAYU 데이터 생성
    const sayuArtworks = generateSayuData(artworksWithMetadata);
    console.log(`✅ SAYU 데이터 생성 완료: ${sayuArtworks.length}개\n`);
    
    // 3. SQL 생성
    const sql = generateSupabaseSQL(sayuArtworks);
    
    // 4. 결과 저장
    const resultsDir = path.join(__dirname, '../artvee-crawler/met-integration');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // JSON 데이터 저장
    fs.writeFileSync(
      path.join(resultsDir, 'met-artworks-for-sayu.json'),
      JSON.stringify({
        integrationDate: new Date().toISOString(),
        totalArtworks: sayuArtworks.length,
        artworks: sayuArtworks,
        sourceInfo: {
          discoveryMethod: 'User-suggested IDs + systematic scanning',
          cloudinaryPattern: 'met-chicago-{objectId}.jpg',
          metApiSource: 'https://collectionapi.metmuseum.org/public/collection/v1/objects/{objectId}'
        }
      }, null, 2)
    );
    
    // SQL 파일 저장
    fs.writeFileSync(
      path.join(resultsDir, 'insert-met-artworks.sql'),
      sql
    );
    
    // 요약 결과
    console.log('🏆 MET 통합 완료!');
    console.log('=====================================');
    console.log(`📊 기존 Artvee 컬렉션: 773개`);
    console.log(`➕ 새로운 MET 작품: ${sayuArtworks.length}개`);
    console.log(`🎯 총 컬렉션: ${773 + sayuArtworks.length}개`);
    console.log(`📈 증가율: ${Math.round(sayuArtworks.length / 773 * 100)}%`);
    
    console.log('\n🎨 추가된 작품들:');
    sayuArtworks.forEach((artwork, i) => {
      console.log(`   ${i+1}. ${artwork.title} - ${artwork.artist} (${artwork.year || 'Unknown'})`);
    });
    
    console.log('\n📂 생성된 파일:');
    console.log('   📄 met-artworks-for-sayu.json (JSON 데이터)');
    console.log('   📄 insert-met-artworks.sql (Supabase 삽입문)');
    
    console.log('\n⚡ 다음 단계:');
    console.log('1. Supabase에서 SQL 실행');
    console.log('2. Gallery 컴포넌트에서 새로운 작품들 확인');
    console.log('3. APT 매칭 알고리즘 테스트');
    console.log('4. 사용자에게 새로운 MET 컬렉션 알림');
    
    console.log('\n🚀 SAYU 컬렉션이 MET Museum과 통합되었습니다! 🎉');
    
  } catch (error) {
    console.error('❌ MET 통합 중 오류:', error.message);
  }
}

integrateMetArtworks();