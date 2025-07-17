const fs = require('fs');
const path = require('path');

// 모든 JSON 파일을 스캔하여 작품 데이터 통합
function consolidateAllData() {
  console.log('🔄 모든 수집 데이터 통합 시작...\n');
  
  const dataDir = './met-artworks-data';
  const allArtworks = [];
  const sources = [];
  
  // 디렉토리에서 모든 JSON 파일 찾기
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    if (file.includes('progress') || file.includes('upload')) continue;
    
    try {
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let artworks = [];
      
      // 다양한 데이터 형식 처리
      if (data.artworks && Array.isArray(data.artworks)) {
        artworks = data.artworks;
      } else if (Array.isArray(data)) {
        artworks = data;
      }
      
      console.log(`📁 ${file}: ${artworks.length}개 작품`);
      
      // 각 작품에 source 정보 추가
      for (const artwork of artworks) {
        if (artwork.objectID && artwork.title && artwork.primaryImage) {
          artwork.sourceFile = file;
          artwork.source = artwork.source || 'Met Museum';
          allArtworks.push(artwork);
        }
      }
      
      sources.push({
        file,
        count: artworks.length,
        source: data.metadata?.source || 'Unknown'
      });
      
    } catch (error) {
      console.error(`❌ ${file} 처리 오류:`, error.message);
    }
  }
  
  // 중복 제거 (objectID 기준)
  const uniqueArtworks = [];
  const seenIds = new Set();
  
  for (const artwork of allArtworks) {
    const id = `${artwork.source}-${artwork.objectID}`;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueArtworks.push(artwork);
    }
  }
  
  // 유명 작가 우선 정렬
  const famousKeywords = [
    'van gogh', 'monet', 'renoir', 'degas', 'cezanne', 'picasso', 'matisse',
    'rembrandt', 'vermeer', 'hokusai', 'hiroshige', 'klimt', 'turner'
  ];
  
  uniqueArtworks.sort((a, b) => {
    const aIsFamous = famousKeywords.some(keyword => 
      (a.artist || '').toLowerCase().includes(keyword)
    );
    const bIsFamous = famousKeywords.some(keyword => 
      (b.artist || '').toLowerCase().includes(keyword)
    );
    
    if (aIsFamous && !bIsFamous) return -1;
    if (!aIsFamous && bIsFamous) return 1;
    if (a.isHighlight && !b.isHighlight) return -1;
    if (!a.isHighlight && b.isHighlight) return 1;
    
    return 0;
  });
  
  // 통계 계산
  const stats = {
    bySource: {},
    byArtist: {},
    famousArtists: 0,
    highlights: 0
  };
  
  for (const artwork of uniqueArtworks) {
    // 소스별 통계
    const source = artwork.source || 'Unknown';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    
    // 작가별 통계
    const artist = artwork.artist || 'Unknown';
    if (artist !== 'Unknown') {
      stats.byArtist[artist] = (stats.byArtist[artist] || 0) + 1;
    }
    
    // 유명 작가 카운트
    if (famousKeywords.some(keyword => artist.toLowerCase().includes(keyword))) {
      stats.famousArtists++;
    }
    
    // 하이라이트 카운트
    if (artwork.isHighlight) {
      stats.highlights++;
    }
  }
  
  // 최종 데이터 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(dataDir, `consolidated-artworks-${timestamp}.json`);
  
  const finalData = {
    metadata: {
      consolidatedAt: new Date().toISOString(),
      totalArtworks: uniqueArtworks.length,
      sources: sources,
      statistics: stats
    },
    artworks: uniqueArtworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));
  
  // CSV 파일도 생성
  const csvFile = outputFile.replace('.json', '.csv');
  const csvContent = [
    'ObjectID,Title,Artist,Date,Source,Department,IsHighlight,ImageURL',
    ...uniqueArtworks.map(a => 
      `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date || ''}","${a.source || ''}","${a.department || ''}","${a.isHighlight || false}","${a.primaryImage || ''}"`
    )
  ].join('\n');
  
  fs.writeFileSync(csvFile, csvContent);
  
  // 결과 출력
  console.log('\n✨ 데이터 통합 완료!');
  console.log(`📊 전체 통계:`);
  console.log(`  - 총 작품 수: ${uniqueArtworks.length}개`);
  console.log(`  - 유명 작가 작품: ${stats.famousArtists}개`);
  console.log(`  - 하이라이트 작품: ${stats.highlights}개`);
  
  console.log(`\n🏛️  소스별 분포:`);
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  - ${source}: ${count}개`);
    });
  
  console.log(`\n👨‍🎨 주요 작가 (5명 이상):`);
  Object.entries(stats.byArtist)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 5)
    .slice(0, 15)
    .forEach(([artist, count]) => {
      console.log(`  - ${artist}: ${count}개`);
    });
  
  console.log(`\n💾 저장 파일:`);
  console.log(`  - JSON: ${outputFile}`);
  console.log(`  - CSV: ${csvFile}`);
  
  return outputFile;
}

// 실행
if (require.main === module) {
  consolidateAllData();
}

module.exports = { consolidateAllData };