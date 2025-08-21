/**
 * 🔧 Masters SQL 수정
 * 실제 artworks 테이블 구조에 맞게 SQL 재생성
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Masters SQL 수정');
console.log('=====================================');

// 최적화된 Masters 데이터 로드
const optimizedPath = path.join(__dirname, '../artvee-crawler/masters-optimized-for-sayu.json');
const optimizedData = JSON.parse(fs.readFileSync(optimizedPath, 'utf8'));

// 수정된 SQL 생성 (year 컬럼 제거)
function generateFixedSQL() {
  console.log('🗄️  수정된 Supabase SQL 생성 중...');
  
  const sqlInserts = optimizedData.artworks.map((artwork, index) => {
    const aptTypes = ['INFP', 'ISFP', 'INFJ', 'ISFJ', 'ENFP', 'ESFP', 'ENFJ', 'ESFJ'];
    const randomApt = aptTypes[index % aptTypes.length];
    
    return `INSERT INTO artworks (
  id, 
  title, 
  artist, 
  medium, 
  dimensions, 
  description, 
  image_url, 
  thumbnail_url, 
  source, 
  source_url, 
  tags, 
  color_palette, 
  style_period, 
  genre, 
  location, 
  created_at, 
  updated_at,
  sayu_type,
  category
) VALUES (
  '${artwork.id}',
  '${artwork.title.replace(/'/g, "''")}',
  'Masters Collection',
  'Oil on Canvas',
  'Various',
  'Masterpiece from the Artvee Masters Collection featuring classical artistic techniques and themes.',
  '${artwork.recommended}',
  '${artwork.recommended}',
  'Artvee Masters',
  '${artwork.original.url}',
  ARRAY['masters', 'classical', 'fine-art', 'painting'],
  ARRAY['classical', 'warm-tones', 'traditional'],
  'Classical',
  'Classical Art',
  'Masters Collection',
  NOW(),
  NOW(),
  '${randomApt}',
  'Masters'
);`;
  });
  
  return sqlInserts.join('\n\n');
}

const fixedSQL = generateFixedSQL();

console.log('✅ 수정된 SQL 생성 완료');
console.log('제거된 컬럼: year');
console.log('유지된 컬럼: id, title, artist, medium, dimensions, description, image_url, thumbnail_url, source, source_url, tags, color_palette, style_period, genre, location, created_at, updated_at, sayu_type, category');

// 수정된 SQL 파일 저장
const outputDir = path.join(__dirname, '../artvee-crawler');
fs.writeFileSync(
  path.join(outputDir, 'masters-insert-sql-fixed.sql'),
  `-- SAYU Masters Collection Integration (FIXED)
-- 13개 최적화된 Masters 작품 추가 - year 컬럼 제거
-- 생성일: ${new Date().toISOString()}

${fixedSQL}

-- Masters 카테고리 확인 쿼리
SELECT category, COUNT(*) as count 
FROM artworks 
WHERE category = 'Masters'
GROUP BY category;

-- 성공 확인 쿼리  
SELECT id, title, artist, category, sayu_type
FROM artworks 
WHERE category = 'Masters'
ORDER BY created_at DESC;`
);

console.log('\n💾 수정된 파일 저장: masters-insert-sql-fixed.sql');
console.log('\n🎯 이제 이 파일을 Supabase에서 실행하세요!');

module.exports = { fixedSQL };