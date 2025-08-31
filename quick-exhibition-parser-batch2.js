// 빠른 전시 데이터 입력 파서 - Batch 2 (Exhibitions 145-165)
// 형식: "갤러리명 / 전시명 (날짜)"를 파싱해서 데이터베이스 형식으로 변환

// Batch 2: 21 additional exhibitions (145-165)
const quickExhibitionsBatch2 = `
N/A / 거상거상 거상거 - 차연서 (9.1-10.12)
IAH / Troubled at his saying - 세실 렘퍼트 (8.23-9.21)
서울시립미술관 본관 외 3곳 / 제13회 서울미디어시티비엔날레 <강령: 영혼의 기술> (8.26-11.23)
서울시립 북서울미술관 / 2025 타이틀 매치 - 장영혜중공업 & 홍진환 (8.14-11.2)
도도빌딩 3층 / 얇은 도약의 나날들 - 양혜규 (8.15-9.7)
프리즈 하우스 서울 / 언하우스(UnHouse) - 듀킴, 캐서린 오피 등 14명 (9.2-10.2)
스페이스K 서울 / 딥다이버 Deep Diver - 배윤환 (8.14-11.9)
호암미술관 / 덩었고 영원한 - 루이즈 부르주아 (8.30-2026.1.4)
실린더 ONE / Messengers - 김서현 (8.22-9.21)
우양미술관 / Humanity in the Circuits - 백남준 (7.20-11.30)
우양미술관 / I Have Been Here Before - 아모아코 보아포 (7.20-11.30)
국제갤러리 부산 / 열두 개의 질문 - 안규철 (8.22-10.19)
K&L 뮤지엄 / 시대전술 - 김영찬, 유이란, 요한한, 신민, 남다현 (8.28-12.28)
뮤지엄 산 / Drawing on Space - 안토니 곰리 (6.20-11.30)
파주 임진각 평화누리 등 / UNDO DMZ - 양혜규, 원성원, 홍영인 등 10명 (8.11-11.5)
부산현대미술관 / 적절한 소환 - 힐마 아프 클린트 (7.19-10.26)
CYLINDER TWO / A Chorus - Jennifer Carvalho (8.30-9.28)
SHOWER / Dust - Ruofan Chen (8.22-9.14)
Primary Practice / 멜랑콜리아 - 김다움, 김의현, 이동혁, 장진승 (8.29-10.11)
뮤지엄헤드 / Pit Calls Wall - 김새은 (7.16-9.6)
휘겸재 / 다이얼로그: 수신미확인 - 김봉영, 김지민, 박애나 등 (8.24-9.15)
`;

// 날짜 파싱 함수 (Batch 1과 동일)
function parseDate(dateStr, year = 2025) {
  // "8.22" -> "2025-08-22"
  // "2026.2.1" -> "2026-02-01"
  
  if (dateStr.includes('2026')) {
    year = 2026;
    dateStr = dateStr.replace('2026.', '');
  }
  
  const parts = dateStr.split('.');
  if (parts.length === 2) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
}

// 전시 타입 추측
function guessExhibitionType(title) {
  if (title.includes('회고전') || title.includes('개인전')) return 'solo';
  if (title.includes('비엔날레') || title.includes('Biennale')) return 'biennale';
  if (title.includes('특별전') || title.includes('아트페어') || title.includes('Frieze') || title.includes('Kiaf')) return 'special';
  if (title.includes(':') && !title.includes('전')) return 'solo'; // "작가명:" 형식
  return 'group';
}

// 장르 추측
function guessGenre(title, venue) {
  if (title.includes('미디어') || title.includes('비엔날레') || venue.includes('DDP')) return 'media';
  if (title.includes('사진') || title.includes('photography')) return 'photography';
  if (title.includes('조각')) return 'sculpture';
  if (title.includes('설치')) return 'installation';
  if (title.includes('공예') || title.includes('백자') || title.includes('도자')) return 'craft';
  if (title.includes('디자인')) return 'design';
  if (venue.includes('한가람') && title.includes('특별전')) return 'painting';
  if (title.includes('해양') || title.includes('문화')) return 'contemporary';
  return 'contemporary';
}

// 우선순위 결정 (Batch 2는 40번대부터 시작)
function getPriority(venue) {
  // 주요 미술관들은 40번대
  if (venue.includes('호암미술관')) return 40;
  if (venue.includes('부산현대미술관')) return 41;
  if (venue.includes('서울시립미술관')) return 42;
  if (venue.includes('국립현대미술관')) return 43;
  
  // 지역 미술관들
  if (venue.includes('도립미술관')) return 50;
  if (venue.includes('시립미술관')) return 51;
  
  // 특수한 경우들
  if (venue.includes('N/A')) return 60; // N/A venue 처리
  if (venue.includes('외')) return 45; // "본관 외 3곳" 같은 다중 장소
  
  // 일반 갤러리
  return 55;
}

// 특별 케이스 처리
function processSpecialVenues(venue) {
  // "서울시립미술관 본관 외 3곳" -> "서울시립미술관 (다중 장소)"
  if (venue.includes('외') && venue.includes('곳')) {
    const mainVenue = venue.split('외')[0].trim();
    return {
      name: mainVenue,
      isMultiVenue: true,
      originalName: venue
    };
  }
  
  // "N/A" 처리
  if (venue === 'N/A' || venue.includes('N/A')) {
    return {
      name: '미정',
      isUnknownVenue: true,
      originalName: venue
    };
  }
  
  return {
    name: venue,
    isMultiVenue: false,
    isUnknownVenue: false,
    originalName: venue
  };
}

// 파싱 함수
function parseQuickExhibitions(text) {
  const lines = text.trim().split('\n').filter(line => line.trim() && !line.includes('PLACEHOLDER'));
  const exhibitions = [];
  
  lines.forEach((line, index) => {
    // Special handling for "N/A /" at the beginning
    let processedLine = line;
    if (line.startsWith('N/A /')) {
      processedLine = line.replace('N/A /', 'N/A갤러리 /');
    }
    
    const match = processedLine.match(/(.+?)\s*\/\s*(.+?)\s*\((.+?)\)/);
    
    if (match) {
      const [_, rawVenue, titleWithArtist, dateRange] = match;
      let venueInfo = processSpecialVenues(rawVenue.trim());
      
      // Special fix for N/A갤러리
      if (rawVenue.includes('N/A갤러리')) {
        venueInfo = {
          name: '미정',
          isUnknownVenue: true,
          isMultiVenue: false,
          originalName: 'N/A'
        };
      }
      
      // 제목과 아티스트 분리 처리 (두 가지 형식 지원)
      let title = titleWithArtist.trim();
      let artists = [];
      
      // Format 1: "전시명 - 작가명" 형식
      if (title.includes(' - ') && !title.includes('타이틀 매치')) {
        const parts = title.split(' - ');
        title = parts[0].trim();
        if (parts[1]) {
          // 여러 작가명 처리 (쉼표, &, 등)
          const artistText = parts[1].trim();
          if (artistText.includes(',')) {
            artists = artistText.split(',').map(a => a.trim());
          } else if (artistText.includes('&')) {
            artists = artistText.split('&').map(a => a.trim());
          } else if (artistText.includes('등')) {
            // "작가명 등 10명" 형식
            const mainArtist = artistText.split('등')[0].trim();
            if (mainArtist) artists = [mainArtist];
          } else {
            artists = [artistText];
          }
        }
      }
      // Format 2: "작가명:" 형식 (but not for biennale titles)
      else if (title.includes(':') && !title.includes('비엔날레') && !title.includes('<')) {
        const artistName = title.split(':')[0].trim();
        if (!artistName.includes('전') && !artistName.includes('특별')) {
          artists = [artistName];
        }
      }
      
      // 날짜 처리 - dateRange에 여러 형식 지원
      const dates = dateRange.split('-');
      const startDate = parseDate(dates[0].trim());
      const endDate = dates[1] ? parseDate(dates[1].trim()) : startDate;
      
      // 현재 날짜와 비교해서 status 결정
      const today = new Date('2025-08-31');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let status = 'ongoing';
      if (start > today) status = 'upcoming';
      if (end < today) status = 'ended';
      
      // 도시 결정 (부산 갤러리는 부산으로 설정)
      let city = "서울";
      if (venueInfo.name.includes('부산') || venueInfo.originalName.includes('부산')) {
        city = "부산";
      } else if (venueInfo.name.includes('파주') || venueInfo.originalName.includes('파주')) {
        city = "파주";
      }
      
      exhibitions.push({
        exhibition_title: title,
        venue_name: venueInfo.name,
        venue_original_name: venueInfo.originalName,
        is_multi_venue: venueInfo.isMultiVenue,
        is_unknown_venue: venueInfo.isUnknownVenue,
        start_date: startDate,
        end_date: endDate,
        status: status,
        exhibition_type: guessExhibitionType(title),
        genre: guessGenre(title, venueInfo.name),
        priority_order: getPriority(venueInfo.name) + index * 0.1, // Batch2는 40+부터
        is_featured: getPriority(venueInfo.name) <= 45, // 주요 미술관만 featured
        artists: artists,
        city: city,
        batch: 2,
        exhibition_number: 145 + index // 145부터 시작
      });
    }
  });
  
  return exhibitions;
}

// SQL 생성
function generateSQL(exhibitions) {
  const values = exhibitions.map(ex => {
    const artists = ex.artists.length > 0 
      ? `ARRAY['${ex.artists.join("','")}']` 
      : 'NULL';
    
    return `(
    '${ex.exhibition_title.replace(/'/g, "''")}',
    '${ex.venue_name.replace(/'/g, "''")}',
    '${ex.start_date}',
    '${ex.end_date}',
    '${ex.status}',
    '${ex.exhibition_type}',
    '${ex.genre}',
    ${ex.priority_order},
    ${ex.is_featured},
    ${artists},
    '${ex.city}'
  )`;
  });
  
  return `
-- 전시 데이터 Batch 2 (Exhibitions 145-165)
-- 생성일: ${new Date().toISOString()}
-- 총 ${exhibitions.length}개 전시

INSERT INTO exhibitions_clean (
  exhibition_title,
  venue_name,
  start_date,
  end_date,
  status,
  exhibition_type,
  genre,
  priority_order,
  is_featured,
  artists,
  city
) VALUES 
${values.join(',\n')};
  `;
}

// JSON 생성
function generateJSON(exhibitions) {
  return {
    batch: 2,
    totalCount: exhibitions.length,
    generatedAt: new Date().toISOString(),
    exhibitions: exhibitions.map((ex, index) => ({
      id: 145 + index,
      ...ex
    }))
  };
}

// 실행
function processBatch2() {
  if (quickExhibitionsBatch2.includes('PLACEHOLDER')) {
    console.log('⚠️  USER INPUT REQUIRED:');
    console.log('Please provide the 21 additional exhibitions (145-165) in this format:');
    console.log('갤러리명 / 전시명 (날짜)');
    console.log('\nExample:');
    console.log('호암미술관 / 조선 백자 특별전 (8.15-11.30)');
    console.log('부산현대미술관 / 해양 문화와 예술 (9.1-12.15)');
    console.log('서울시립미술관 본관 외 3곳 / 도시 속 예술 (8.20-10.30)');
    console.log('\nThen replace the PLACEHOLDER section in this file and run again.');
    return;
  }

  const parsedExhibitions = parseQuickExhibitions(quickExhibitionsBatch2);
  
  // 결과 출력
  console.log('=== Batch 2 파싱 결과 ===');
  console.log(`총 전시 수: ${parsedExhibitions.length}`);
  console.log('\n=== 특별 케이스 처리 결과:');
  
  parsedExhibitions.forEach(ex => {
    if (ex.is_multi_venue) {
      console.log(`✅ 다중 장소: ${ex.venue_original_name} -> ${ex.venue_name}`);
    }
    if (ex.is_unknown_venue) {
      console.log(`⚠️  미확인 장소: ${ex.venue_original_name} -> ${ex.venue_name}`);
    }
  });
  
  console.log('\n=== JSON 샘플 (처음 3개):');
  console.log(JSON.stringify(parsedExhibitions.slice(0, 3), null, 2));
  
  // 파일 저장
  const fs = require('fs');
  const sqlContent = generateSQL(parsedExhibitions);
  const jsonContent = generateJSON(parsedExhibitions);
  
  fs.writeFileSync('exhibitions-clean-batch2.sql', sqlContent);
  fs.writeFileSync('exhibitions-clean-batch2.json', JSON.stringify(jsonContent, null, 2));
  
  console.log('\n✅ 파일 저장 완료:');
  console.log('- exhibitions-clean-batch2.sql');
  console.log('- exhibitions-clean-batch2.json');
  
  return parsedExhibitions;
}

// 실행
if (require.main === module) {
  processBatch2();
}

module.exports = { parseQuickExhibitions, generateSQL, generateJSON, processSpecialVenues };