const fs = require('fs').promises;
const path = require('path');

/**
 * 모든 수집된 작품을 병합하여 최종 컬렉션 생성
 */
async function mergeCollections() {
  console.log('📊 컬렉션 병합 시작\n');
  
  try {
    // 1. 유명 작가 작품 로드
    const famousData = await fs.readFile('./data/famous-artists-artworks.json', 'utf8');
    const famousArtworks = JSON.parse(famousData);
    console.log(`✅ 유명 작가 작품: ${famousArtworks.length}개`);
    
    // 2. 벌크 수집 작품 로드
    const bulkData = await fs.readFile('./data/bulk-artworks.json', 'utf8');
    const bulkArtworks = JSON.parse(bulkData);
    console.log(`✅ 벌크 수집 작품: ${bulkArtworks.length}개`);
    
    // 3. SAYU 타입 할당 (벌크 작품에 타입이 없는 경우)
    const sayuTypeMapping = {
      'unknown': 'LAMF', // 기본값
      'landscape': 'LAEF', // 풍경화
      'portrait': 'LREC', // 초상화
      'still life': 'LAMC', // 정물화
      'abstract': 'SAEC', // 추상화
      'religious': 'SRMC', // 종교화
      'mythology': 'SRMF', // 신화
      'genre': 'LREF', // 장르화
      'historical': 'SRMF' // 역사화
    };
    
    // 벌크 작품에 SAYU 타입 추가
    bulkArtworks.forEach(artwork => {
      if (!artwork.sayuType) {
        // 제목이나 태그에서 타입 추측
        const title = (artwork.title || '').toLowerCase();
        let assignedType = 'LAMF'; // 기본값
        
        for (const [keyword, type] of Object.entries(sayuTypeMapping)) {
          if (title.includes(keyword)) {
            assignedType = type;
            break;
          }
        }
        
        artwork.sayuType = assignedType;
      }
    });
    
    // 4. 중복 제거 및 병합
    const allArtworks = [...famousArtworks];
    const existingIds = new Set(famousArtworks.map(a => a.artveeId || a.url));
    
    let duplicates = 0;
    bulkArtworks.forEach(artwork => {
      const id = artwork.artveeId || artwork.url;
      if (!existingIds.has(id)) {
        allArtworks.push(artwork);
        existingIds.add(id);
      } else {
        duplicates++;
      }
    });
    
    console.log(`\n📊 병합 결과:`);
    console.log(`   중복 제거: ${duplicates}개`);
    console.log(`   최종 작품 수: ${allArtworks.length}개`);
    
    // 5. 통계 분석
    const stats = {
      totalArtworks: allArtworks.length,
      byArtist: {},
      bySayuType: {},
      withImages: 0,
      withoutImages: 0
    };
    
    allArtworks.forEach(artwork => {
      // 작가별 통계
      const artist = artwork.artist || 'Unknown';
      stats.byArtist[artist] = (stats.byArtist[artist] || 0) + 1;
      
      // SAYU 타입별 통계
      const sayuType = artwork.sayuType || 'Unknown';
      stats.bySayuType[sayuType] = (stats.bySayuType[sayuType] || 0) + 1;
      
      // 이미지 유무
      if (artwork.imageUrl || artwork.thumbnail) {
        stats.withImages++;
      } else {
        stats.withoutImages++;
      }
    });
    
    console.log(`\n🎨 작가 통계:`);
    console.log(`   총 작가 수: ${Object.keys(stats.byArtist).length}명`);
    console.log(`   상위 10명:`);
    Object.entries(stats.byArtist)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([artist, count]) => {
        console.log(`     ${artist}: ${count}개`);
      });
    
    console.log(`\n🦊 SAYU 타입별 분포:`);
    Object.entries(stats.bySayuType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / allArtworks.length) * 100).toFixed(1);
        console.log(`   ${type}: ${count}개 (${percentage}%)`);
      });
    
    console.log(`\n📷 이미지 상태:`);
    console.log(`   이미지 있음: ${stats.withImages}개`);
    console.log(`   이미지 없음: ${stats.withoutImages}개`);
    
    // 6. 최종 데이터 저장
    await fs.writeFile(
      './data/final-artwork-collection.json',
      JSON.stringify(allArtworks, null, 2)
    );
    
    // URL만 추출하여 저장
    const urls = allArtworks.map(a => a.url);
    await fs.writeFile(
      './data/final-artwork-urls.json',
      JSON.stringify(urls, null, 2)
    );
    
    // CSV 형태로도 저장
    const csvContent = [
      'url,artist,sayuType,title,artveeId,hasImage',
      ...allArtworks.map(a => 
        `"${a.url}","${a.artist || 'Unknown'}","${a.sayuType || 'Unknown'}","${(a.title || 'Untitled').replace(/"/g, '""')}","${a.artveeId || ''}","${!!(a.imageUrl || a.thumbnail)}"`
      )
    ].join('\n');
    
    await fs.writeFile('./data/final-artwork-collection.csv', csvContent);
    
    console.log(`\n💾 파일 저장 완료:`);
    console.log(`   - final-artwork-collection.json`);
    console.log(`   - final-artwork-urls.json`);
    console.log(`   - final-artwork-collection.csv`);
    
    return {
      totalArtworks: allArtworks.length,
      stats
    };
    
  } catch (error) {
    console.error('오류:', error);
    return null;
  }
}

// 실행
if (require.main === module) {
  mergeCollections();
}

module.exports = mergeCollections;