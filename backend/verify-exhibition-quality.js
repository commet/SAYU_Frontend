/**
 * 수집된 전시 데이터의 품질 및 유명도 검증
 */

const fs = require('fs');

class ExhibitionQualityVerifier {
  constructor() {
    this.cityData = null;
    this.famousVenues = {
      // 각 도시별 세계적으로 유명한 미술관/갤러리
      london: [
        'Tate Modern', 'Tate Britain', 'National Gallery', 'British Museum', 
        'V&A Museum', 'Saatchi Gallery', 'Hayward Gallery', 'Serpentine',
        'Royal Academy', 'Whitechapel Gallery', 'ICA London'
      ],
      paris: [
        'Louvre', 'Musée d\'Orsay', 'Centre Pompidou', 'Musée Rodin',
        'Musée Picasso', 'Palais de Tokyo', 'Jeu de Paume', 'Grand Palais',
        'Petit Palais', 'Musée Marmottan', 'Fondation Cartier'
      ],
      berlin: [
        'Museum Island', 'Hamburger Bahnhof', 'Berlinische Galerie', 
        'Neue Nationalgalerie', 'Gropius Bau', 'KW Institute', 'C/O Berlin',
        'me Collectors Room', 'Galerie Eigen + Art', 'Sprüth Magers'
      ],
      munich: [
        'Pinakothek', 'Lenbachhaus', 'Haus der Kunst', 'Museum Brandhorst',
        'Staatliche Antikensammlungen', 'Glyptothek', 'Schackgalerie'
      ],
      basel: [
        'Kunstmuseum Basel', 'Fondation Beyeler', 'Schaulager', 'Kunsthalle Basel',
        'Museum Tinguely', 'Vitra Design Museum'
      ],
      vienna: [
        'Kunsthistorisches Museum', 'Belvedere', 'Albertina', 'mumok',
        'Kunsthalle Wien', 'Leopold Museum', 'MAK'
      ]
    };
    
    this.worldClassArtists = [
      // 현재 세계적으로 주목받는 아티스트들
      'Ai Weiwei', 'Banksy', 'Jeff Koons', 'Damien Hirst', 'Yayoi Kusama',
      'Gerhard Richter', 'David Hockney', 'Kaws', 'Takashi Murakami',
      'Anselm Kiefer', 'Georg Baselitz', 'Peter Halley', 'Kerry James Marshall',
      'Kara Walker', 'Jenny Holzer', 'Barbara Kruger', 'Cindy Sherman',
      'Andreas Gursky', 'Thomas Struth', 'Wolfgang Tillmans',
      // 클래식 마스터들
      'Pablo Picasso', 'Claude Monet', 'Vincent van Gogh', 'Leonardo da Vinci',
      'Michelangelo', 'Andy Warhol', 'Jackson Pollock', 'Frida Kahlo'
    ];
  }

  async verifyQuality() {
    console.log('🔍 EXHIBITION QUALITY VERIFICATION');
    console.log('==================================\n');

    // 1. 데이터 로드
    await this.loadCityData();
    
    // 2. 각 도시별 venue 분석
    await this.analyzeVenuesByCity();
    
    // 3. 아티스트 유명도 분석
    await this.analyzeArtistFame();
    
    // 4. 웹 검색으로 현재 핫한 전시와 비교
    await this.compareWithCurrentHotExhibitions();
    
    // 5. 최종 품질 평가
    this.generateQualityReport();
  }

  async loadCityData() {
    const filename = 'artmap-city-collection-2025-07-26T13-14-58-571Z.json';
    
    if (fs.existsSync(filename)) {
      this.cityData = JSON.parse(fs.readFileSync(filename, 'utf8'));
      console.log(`✅ 데이터 로드 완료: ${this.cityData.metadata.totalExhibitions}개 전시`);
    } else {
      throw new Error(`데이터 파일을 찾을 수 없습니다: ${filename}`);
    }
  }

  async analyzeVenuesByCity() {
    console.log('\n🏛️  도시별 Venue 분석');
    console.log('====================\n');

    for (const cityResult of this.cityData.cityResults) {
      const city = cityResult.city;
      const famousVenuesInCity = this.famousVenues[city] || [];
      
      console.log(`📍 ${city.toUpperCase()}`);
      console.log(`   수집된 전시: ${cityResult.totalExhibitions}개`);
      
      if (famousVenuesInCity.length === 0) {
        console.log(`   ⚠️  유명 venue 리스트 없음`);
        continue;
      }
      
      // 수집된 venue들 추출
      const collectedVenues = new Set();
      cityResult.exhibitions.forEach(ex => {
        if (ex.venue?.name) {
          collectedVenues.add(ex.venue.name);
        }
        // URL에서 venue 추출 시도
        if (ex.url) {
          const match = ex.url.match(/artmap\.com\/([^\/]+)/);
          if (match) {
            collectedVenues.add(match[1]);
          }
        }
      });

      console.log(`   수집된 venue 수: ${collectedVenues.size}개`);
      
      // 유명 venue들과 매칭 확인
      const matchedFamousVenues = [];
      const collectedVenueArray = Array.from(collectedVenues);
      
      famousVenuesInCity.forEach(famousVenue => {
        const matched = collectedVenueArray.some(collected => 
          collected.toLowerCase().includes(famousVenue.toLowerCase()) ||
          famousVenue.toLowerCase().includes(collected.toLowerCase())
        );
        
        if (matched) {
          matchedFamousVenues.push(famousVenue);
        }
      });

      const coverage = Math.round((matchedFamousVenues.length / famousVenuesInCity.length) * 100);
      
      console.log(`   🎯 유명 venue 커버리지: ${coverage}% (${matchedFamousVenues.length}/${famousVenuesInCity.length})`);
      
      if (matchedFamousVenues.length > 0) {
        console.log(`   ✅ 포함된 유명 venue: ${matchedFamousVenues.slice(0, 3).join(', ')}`);
      }
      
      if (coverage < 30) {
        console.log(`   ❌ 낮은 커버리지 - 주요 미술관 누락`);
        const missing = famousVenuesInCity.filter(v => 
          !matchedFamousVenues.includes(v)
        ).slice(0, 3);
        console.log(`   🔍 누락된 주요 venue: ${missing.join(', ')}`);
      }
      
      console.log('');
    }
  }

  async analyzeArtistFame() {
    console.log('\n🎨 아티스트 유명도 분석');
    console.log('======================\n');

    const allArtists = new Set();
    const worldClassMatches = [];
    
    // 모든 전시 제목에서 아티스트명 추출
    this.cityData.allExhibitions.forEach(ex => {
      if (ex.title) {
        // 전시 제목에서 아티스트명 찾기
        this.worldClassArtists.forEach(artist => {
          const lastName = artist.split(' ').pop();
          if (ex.title.toLowerCase().includes(artist.toLowerCase()) ||
              ex.title.toLowerCase().includes(lastName.toLowerCase())) {
            worldClassMatches.push({
              artist,
              exhibition: ex.title,
              city: ex.city,
              url: ex.url
            });
            allArtists.add(artist);
          }
        });
      }
    });

    console.log(`🌟 발견된 세계적 아티스트: ${allArtists.size}명`);
    
    if (worldClassMatches.length > 0) {
      console.log(`\n✅ 주요 아티스트 전시들:`);
      worldClassMatches.slice(0, 10).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.artist} - "${match.exhibition}" (${match.city})`);
      });
      
      if (worldClassMatches.length > 10) {
        console.log(`   ... 및 ${worldClassMatches.length - 10}개 더`);
      }
    } else {
      console.log(`❌ 세계적으로 유명한 아티스트 전시 없음`);
    }

    const artistCoverage = Math.round((allArtists.size / this.worldClassArtists.length) * 100);
    console.log(`\n📊 세계적 아티스트 커버리지: ${artistCoverage}% (${allArtists.size}/${this.worldClassArtists.length}명)`);
  }

  async compareWithCurrentHotExhibitions() {
    console.log('\n🔥 현재 핫한 전시와 비교');
    console.log('=========================\n');
    
    // 수집된 전시 제목들 분석
    const exhibitionTitles = this.cityData.allExhibitions.map(ex => ex.title);
    
    // 2025년 현재 화제가 될만한 키워드들
    const hotKeywords = [
      'biennale', 'biennial', 'documenta', 'art basel', 'frieze',
      'retrospective', 'survey', 'major exhibition', 'world premiere',
      'AI', 'artificial intelligence', 'NFT', 'digital art',
      'climate', 'sustainability', 'social justice', 'diversity'
    ];

    const hotExhibitions = [];
    
    exhibitionTitles.forEach((title, index) => {
      hotKeywords.forEach(keyword => {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          hotExhibitions.push({
            title,
            keyword,
            exhibition: this.cityData.allExhibitions[index]
          });
        }
      });
    });

    console.log(`🔍 화제성 있는 전시 키워드 매칭: ${hotExhibitions.length}개`);
    
    if (hotExhibitions.length > 0) {
      console.log(`\n✅ 화제의 전시들:`);
      hotExhibitions.slice(0, 8).forEach((hot, i) => {
        console.log(`   ${i + 1}. "${hot.title}" (키워드: ${hot.keyword})`);
      });
    }

    // 전시 제목의 일반적인 품질 체크
    console.log(`\n📝 전시 제목 품질 분석:`);
    
    const shortTitles = exhibitionTitles.filter(t => t.length < 10).length;
    const longTitles = exhibitionTitles.filter(t => t.length > 50).length;
    const artistNameTitles = exhibitionTitles.filter(t => {
      // 아티스트 이름으로 보이는 패턴 (대문자로 시작하는 2-3 단어)
      return /^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?$/.test(t);
    }).length;
    
    console.log(`   단순 제목 (10자 이하): ${shortTitles}개 (${Math.round(shortTitles/exhibitionTitles.length*100)}%)`);
    console.log(`   긴 제목 (50자 이상): ${longTitles}개 (${Math.round(longTitles/exhibitionTitles.length*100)}%)`);
    console.log(`   아티스트명 패턴: ${artistNameTitles}개 (${Math.round(artistNameTitles/exhibitionTitles.length*100)}%)`);
  }

  generateQualityReport() {
    console.log('\n📋 최종 품질 평가');
    console.log('================\n');

    // 종합 점수 계산
    let totalScore = 0;
    let maxScore = 0;
    const scores = [];

    // 1. 유명 venue 커버리지 점수
    for (const cityResult of this.cityData.cityResults) {
      const city = cityResult.city;
      const famousVenues = this.famousVenues[city] || [];
      
      if (famousVenues.length > 0) {
        const collectedVenues = new Set();
        cityResult.exhibitions.forEach(ex => {
          if (ex.url) {
            const match = ex.url.match(/artmap\.com\/([^\/]+)/);
            if (match) collectedVenues.add(match[1]);
          }
        });

        const matchedCount = famousVenues.filter(famous => 
          Array.from(collectedVenues).some(collected => 
            collected.toLowerCase().includes(famous.toLowerCase()) ||
            famous.toLowerCase().includes(collected.toLowerCase())
          )
        ).length;

        const cityScore = Math.round((matchedCount / famousVenues.length) * 100);
        scores.push({ city, score: cityScore, type: 'venue_coverage' });
        totalScore += cityScore;
        maxScore += 100;
      }
    }

    const avgVenueScore = maxScore > 0 ? Math.round(totalScore / (maxScore / 100)) : 0;

    console.log(`🎯 종합 품질 점수`);
    console.log(`==================`);
    console.log(`유명 venue 커버리지: ${avgVenueScore}/100`);
    
    let overallGrade = 'F';
    if (avgVenueScore >= 80) overallGrade = 'A';
    else if (avgVenueScore >= 60) overallGrade = 'B';
    else if (avgVenueScore >= 40) overallGrade = 'C';
    else if (avgVenueScore >= 20) overallGrade = 'D';

    console.log(`\n🏆 종합 등급: ${overallGrade}`);
    
    if (overallGrade === 'A' || overallGrade === 'B') {
      console.log(`✅ 높은 품질의 전시 데이터`);
      console.log(`   사용자들이 인지할 수 있는 유명한 전시들 포함`);
    } else {
      console.log(`⚠️  품질 개선 필요`);
      console.log(`   주요 미술관/갤러리 전시 보완 필요`);
      console.log(`\n🔧 개선 방안:`);
      console.log(`   1. 각 도시의 대형 미술관 공식 웹사이트 직접 크롤링`);
      console.log(`   2. Google Arts & Culture API 연동`);
      console.log(`   3. 미술관 공식 RSS 피드 활용`);
      console.log(`   4. 현지 아트 매거진/블로그 데이터 추가`);
    }

    // 권장사항
    console.log(`\n💡 권장사항:`);
    
    if (avgVenueScore < 50) {
      console.log(`   🚨 긴급: 주요 미술관 데이터 추가 필요`);
      console.log(`   - Tate Modern, Centre Pompidou, MoMA 등 누락`);
    }
    
    console.log(`   📈 정기 업데이트: 주 1회 크롤링`);
    console.log(`   🔍 사용자 피드백: 누락된 전시 신고 기능`);
    console.log(`   📱 사용자 관심도: 전시 조회수/북마크 트래킹`);

    // 상세 보고서 저장
    const report = {
      timestamp: new Date().toISOString(),
      overallGrade,
      avgVenueScore,
      cityScores: scores,
      recommendations: [
        avgVenueScore < 50 ? '주요 미술관 데이터 추가 필요' : '현재 품질 유지',
        '정기 업데이트 시스템 구축',
        '사용자 피드백 시스템 도입'
      ]
    };

    fs.writeFileSync(
      `exhibition-quality-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      JSON.stringify(report, null, 2)
    );
  }
}

// 실행
async function main() {
  const verifier = new ExhibitionQualityVerifier();
  await verifier.verifyQuality();
}

if (require.main === module) {
  main();
}

module.exports = ExhibitionQualityVerifier;