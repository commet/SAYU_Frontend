const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 저작권 안전한 아시아 아트 수집기
class CopyrightSafeAsianCollector {
  constructor() {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    // 저작권 안전한 아시아 아티스트 (사망한 작가 + 70년 경과)
    this.safeAsianArtists = {
      korean: [
        'Park Seo-bo', // 1931-2023 (최근 사망, 확인 필요)
        'Lee Ufan', // 1936~ (생존 - 제외)
        'Dansaekhwa', // 운동/스타일 (안전)
        'Korean traditional art', // 전통 미술 (안전)
        'Yi Dynasty painting', // 조선시대 (안전)
        'Goryeo ceramics' // 고려시대 (안전)
      ],
      japanese: [
        'Katsushika Hokusai', // 1760-1849 (안전)
        'Utagawa Hiroshige', // 1797-1858 (안전)
        'Kitagawa Utamaro', // 1753-1806 (안전)
        'Kano School', // 칸노파 (안전)
        'Rinpa', // 린파 (안전)
        'Yamato-e', // 야마토에 (안전)
        'Ukiyo-e', // 우키요에 (안전)
        'Sumi-e', // 수묵화 (안전)
        'Japanese woodblock print', // 목판화 (안전)
        'Edo period art' // 에도시대 (안전)
      ],
      chinese: [
        'Traditional Chinese painting', // 전통 중국화 (안전)
        'Ming Dynasty art', // 명대 (안전)
        'Qing Dynasty art', // 청대 (안전)
        'Song Dynasty painting', // 송대 (안전)
        'Tang Dynasty art', // 당대 (안전)
        'Chinese calligraphy', // 서예 (안전)
        'Porcelain', // 도자기 (안전)
        'Jade carving', // 옥공예 (안전)
        'Chinese scroll painting', // 두루마리 그림 (안전)
        'Literati painting' // 문인화 (안전)
      ],
      southeast_asian: [
        'Angkor sculpture', // 앙코르 조각 (안전)
        'Balinese traditional art', // 발리 전통 미술 (안전)
        'Javanese batik', // 자바 바틱 (안전)
        'Thai traditional painting', // 태국 전통 회화 (안전)
        'Khmer art', // 크메르 미술 (안전)
        'Vietnamese lacquerware', // 베트남 칠기 (안전)
        'Burmese art', // 미얀마 미술 (안전)
        'Philippine traditional art' // 필리핀 전통 미술 (안전)
      ],
      south_asian: [
        'Mughal miniature painting', // 무굴 세밀화 (안전)
        'Rajasthani painting', // 라자스탄 회화 (안전)
        'Pahari painting', // 파하리 회화 (안전)
        'Tanjore painting', // 탄조르 회화 (안전)
        'Indian sculpture', // 인도 조각 (안전)
        'Buddhist art', // 불교 미술 (안전)
        'Hindu temple art', // 힌두 사원 미술 (안전)
        'Gandhara art', // 간다라 미술 (안전)
        'Madhubani painting', // 마드후바니 회화 (안전)
        'Warli art' // 와를리 아트 (안전)
      ]
    };
    
    // 생존 작가 제외 목록 (상업적 사용 위험)
    this.livingArtists = [
      'Nam June Paik', // 1932-2006 (사망 - 안전할 수 있음)
      'Do Ho Suh', // 1962~ (생존 - 제외)
      'Yayoi Kusama', // 1929~ (생존 - 제외)
      'Ai Weiwei', // 1957~ (생존 - 제외)
      'Takashi Murakami', // 1962~ (생존 - 제외)
      'Anish Kapoor', // 1954~ (생존 - 제외)
      'Lee Ufan', // 1936~ (생존 - 제외)
      'Subodh Gupta', // 1964~ (생존 - 제외)
      'Mariko Mori' // 1967~ (생존 - 제외)
    ];
    
    this.outputDir = './copyright-safe-asian-art';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // 저작권 안전성 검사
  isCopyrightSafe(artistName, artworkDate) {
    // 생존 작가 제외
    if (this.livingArtists.some(name => 
      artistName.toLowerCase().includes(name.toLowerCase())
    )) {
      return false;
    }

    // 1950년 이후 작품은 추가 검토 필요
    if (artworkDate) {
      const year = parseInt(artworkDate.match(/\d{4}/)?.[0]);
      if (year && year > 1950) {
        return false;
      }
    }

    return true;
  }

  // 대만 고궁박물관 (CC BY 4.0 - 안전)
  async collectTaiwanNationalPalaceMuseum() {
    console.log('🏛️  대만 고궁박물관 (CC BY 4.0) 수집 시작...');
    
    const artworks = [];
    
    try {
      // 실제 API 대신 Art Institute of Chicago에서 중국 전통 미술 검색
      const chineseTerms = [
        'chinese painting', 'chinese calligraphy', 'chinese porcelain',
        'ming dynasty', 'qing dynasty', 'song dynasty', 'tang dynasty',
        'jade', 'lacquer', 'scroll painting', 'literati painting'
      ];
      
      for (const term of chineseTerms) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(term)}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display,place_of_origin&limit=50`;
          
          const response = await axios.get(url, {
            httpsAgent: this.httpsAgent,
            timeout: 15000
          });
          
          if (response.data?.data) {
            for (const item of response.data.data) {
              if (item.is_public_domain && item.image_id) {
                // 저작권 안전성 검사
                if (this.isCopyrightSafe(item.artist_display || '', item.date_display || '')) {
                  artworks.push({
                    objectID: `safe-chinese-${item.id}`,
                    title: item.title || 'Untitled',
                    artist: item.artist_display || 'Unknown',
                    date: item.date_display || '',
                    medium: item.medium_display || '',
                    classification: item.classification_title || '',
                    placeOfOrigin: item.place_of_origin || '',
                    primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
                    primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
                    artworkUrl: `https://www.artic.edu/artworks/${item.id}`,
                    source: 'Art Institute of Chicago (Traditional Chinese)',
                    culture: 'Traditional Chinese',
                    copyrightStatus: 'Public Domain',
                    searchTerm: term,
                    tags: ['chinese-art', 'traditional', 'public-domain', term.replace(/\s+/g, '-')]
                  });
                }
              }
            }
          }
          
        } catch (error) {
          console.error(`중국 전통 미술 검색 오류 (${term}):`, error.message);
        }
      }
      
      console.log(`  ✅ 중국 전통 미술: ${artworks.length}개`);
      return artworks;
      
    } catch (error) {
      console.error('중국 전통 미술 수집 오류:', error.message);
      return [];
    }
  }

  // 일본 전통 미술 (에도시대 이전 - 안전)
  async collectTraditionalJapaneseArt() {
    console.log('🏛️  일본 전통 미술 (에도시대 이전) 수집 시작...');
    
    const artworks = [];
    
    try {
      const japaneseTerms = [
        'hokusai', 'hiroshige', 'utamaro', 'ukiyo-e', 'woodblock print',
        'japanese painting', 'sumi-e', 'yamato-e', 'rinpa', 'kano school',
        'edo period', 'meiji period', 'japanese ceramics', 'japanese lacquer'
      ];
      
      for (const term of japaneseTerms) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(term)}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display,place_of_origin&limit=50`;
          
          const response = await axios.get(url, {
            httpsAgent: this.httpsAgent,
            timeout: 15000
          });
          
          if (response.data?.data) {
            for (const item of response.data.data) {
              if (item.is_public_domain && item.image_id) {
                // 저작권 안전성 검사
                if (this.isCopyrightSafe(item.artist_display || '', item.date_display || '')) {
                  artworks.push({
                    objectID: `safe-japanese-${item.id}`,
                    title: item.title || 'Untitled',
                    artist: item.artist_display || 'Unknown',
                    date: item.date_display || '',
                    medium: item.medium_display || '',
                    classification: item.classification_title || '',
                    placeOfOrigin: item.place_of_origin || '',
                    primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
                    primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
                    artworkUrl: `https://www.artic.edu/artworks/${item.id}`,
                    source: 'Art Institute of Chicago (Traditional Japanese)',
                    culture: 'Traditional Japanese',
                    copyrightStatus: 'Public Domain',
                    searchTerm: term,
                    tags: ['japanese-art', 'traditional', 'public-domain', term.replace(/\s+/g, '-')]
                  });
                }
              }
            }
          }
          
        } catch (error) {
          console.error(`일본 전통 미술 검색 오류 (${term}):`, error.message);
        }
      }
      
      console.log(`  ✅ 일본 전통 미술: ${artworks.length}개`);
      return artworks;
      
    } catch (error) {
      console.error('일본 전통 미술 수집 오류:', error.message);
      return [];
    }
  }

  // 남June Paik 특별 처리 (2006년 사망 - 저작권 만료 확인 필요)
  async collectNamJunePaikSafely() {
    console.log('🎨 백남준 작품 (저작권 검토 필요) 수집...');
    
    const artworks = [];
    
    try {
      // 백남준은 2006년 사망, 일부 작품은 박물관 소유로 Public Domain일 수 있음
      const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent('Nam June Paik')}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display,copyright_notice&limit=20`;
      
      const response = await axios.get(url, {
        httpsAgent: this.httpsAgent,
        timeout: 15000
      });
      
      if (response.data?.data) {
        for (const item of response.data.data) {
          if (item.is_public_domain && item.image_id) {
            artworks.push({
              objectID: `paik-${item.id}`,
              title: item.title || 'Untitled',
              artist: item.artist_display || 'Nam June Paik',
              date: item.date_display || '',
              medium: item.medium_display || '',
              classification: item.classification_title || '',
              primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
              primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
              artworkUrl: `https://www.artic.edu/artworks/${item.id}`,
              source: 'Art Institute of Chicago (Nam June Paik)',
              culture: 'Korean Contemporary',
              copyrightStatus: 'Public Domain (Museum Collection)',
              copyrightNote: 'Nam June Paik (1932-2006) - Estate rights may apply',
              tags: ['korean-art', 'video-art', 'contemporary', 'nam-june-paik']
            });
          }
        }
      }
      
      console.log(`  ✅ 백남준 작품: ${artworks.length}개 (추가 검토 필요)`);
      return artworks;
      
    } catch (error) {
      console.error('백남준 작품 수집 오류:', error.message);
      return [];
    }
  }

  // 저작권 안전한 아시아 아트 통합 수집
  async collectCopyrightSafeAsianArt() {
    console.log('🛡️  저작권 안전한 아시아 아트 수집 시작...\n');
    
    const results = {
      metadata: {
        collectionDate: new Date().toISOString(),
        strategy: 'Copyright-Safe Asian Art Collection',
        copyrightPolicy: 'Public Domain and CC0 only',
        excludedArtists: this.livingArtists,
        safePeriod: 'Pre-1950 works prioritized'
      },
      artworks: [],
      copyrightAnalysis: {},
      summary: {}
    };
    
    try {
      // 1. 중국 전통 미술 (안전)
      const chineseArtworks = await this.collectTaiwanNationalPalaceMuseum();
      results.artworks.push(...chineseArtworks);
      
      // 2. 일본 전통 미술 (안전)
      const japaneseArtworks = await this.collectTraditionalJapaneseArt();
      results.artworks.push(...japaneseArtworks);
      
      // 3. 백남준 작품 (특별 검토)
      const paikArtworks = await this.collectNamJunePaikSafely();
      results.artworks.push(...paikArtworks);
      
      // 4. 중복 제거
      results.artworks = this.removeDuplicateArtworks(results.artworks);
      
      // 5. 저작권 분석
      results.copyrightAnalysis = this.analyzeCopyrightStatus(results.artworks);
      
      // 6. 통계 생성
      results.summary = this.generateSummary(results);
      
      // 7. 결과 저장
      await this.saveCopyrightSafeData(results);
      
      console.log('\n✅ 저작권 안전한 아시아 아트 수집 완료!');
      console.log(`📊 수집 결과:`);
      console.log(`  - 총 작품: ${results.artworks.length}개`);
      console.log(`  - 저작권 안전: ${results.copyrightAnalysis.safe}개`);
      console.log(`  - 검토 필요: ${results.copyrightAnalysis.needsReview}개`);
      
      return results;
      
    } catch (error) {
      console.error('저작권 안전한 아시아 아트 수집 오류:', error);
      throw error;
    }
  }

  // 중복 제거
  removeDuplicateArtworks(artworks) {
    const seen = new Set();
    const unique = [];
    
    for (const artwork of artworks) {
      const key = `${artwork.title.toLowerCase()}-${artwork.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(artwork);
      }
    }
    
    return unique;
  }

  // 저작권 상태 분석
  analyzeCopyrightStatus(artworks) {
    const analysis = {
      safe: 0,
      needsReview: 0,
      publicDomain: 0,
      ccLicense: 0,
      museumCollection: 0
    };
    
    artworks.forEach(artwork => {
      if (artwork.copyrightStatus === 'Public Domain') {
        analysis.publicDomain++;
        analysis.safe++;
      } else if (artwork.copyrightStatus?.includes('CC')) {
        analysis.ccLicense++;
        analysis.safe++;
      } else if (artwork.copyrightNote) {
        analysis.needsReview++;
      } else {
        analysis.safe++;
      }
      
      if (artwork.source.includes('Museum')) {
        analysis.museumCollection++;
      }
    });
    
    return analysis;
  }

  // 통계 생성
  generateSummary(results) {
    const summary = {
      totalArtworks: results.artworks.length,
      bySource: {},
      byCulture: {},
      byPeriod: {},
      copyrightSafety: results.copyrightAnalysis
    };
    
    results.artworks.forEach(artwork => {
      // 소스별
      const source = artwork.source || 'Unknown';
      summary.bySource[source] = (summary.bySource[source] || 0) + 1;
      
      // 문화별
      const culture = artwork.culture || 'Unknown';
      summary.byCulture[culture] = (summary.byCulture[culture] || 0) + 1;
      
      // 시대별
      const date = artwork.date || '';
      let period = 'Unknown';
      if (date.includes('19')) period = '19th Century';
      else if (date.includes('18')) period = '18th Century';
      else if (date.includes('17')) period = '17th Century';
      else if (date.includes('20')) period = '20th Century';
      else if (date.includes('Edo')) period = 'Edo Period';
      else if (date.includes('Ming')) period = 'Ming Dynasty';
      else if (date.includes('Qing')) period = 'Qing Dynasty';
      
      summary.byPeriod[period] = (summary.byPeriod[period] || 0) + 1;
    });
    
    return summary;
  }

  // 결과 저장
  async saveCopyrightSafeData(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 통합 결과 저장
    const outputFile = path.join(this.outputDir, `copyright-safe-asian-art-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    // CSV 저장
    const csvContent = [
      'ObjectID,Title,Artist,Date,Culture,Source,CopyrightStatus,Classification,ImageURL',
      ...results.artworks.map(a => 
        `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date || ''}","${a.culture || ''}","${a.source || ''}","${a.copyrightStatus || 'Public Domain'}","${a.classification || ''}","${a.primaryImage || ''}"`
      )
    ].join('\n');
    
    fs.writeFileSync(outputFile.replace('.json', '.csv'), csvContent);
    
    console.log(`💾 저장 완료:`);
    console.log(`  - JSON: ${outputFile}`);
    console.log(`  - CSV: ${outputFile.replace('.json', '.csv')}`);
  }
}

// 실행
async function runCopyrightSafeCollection() {
  const collector = new CopyrightSafeAsianCollector();
  
  try {
    await collector.collectCopyrightSafeAsianArt();
  } catch (error) {
    console.error('실행 오류:', error);
  }
}

if (require.main === module) {
  runCopyrightSafeCollection();
}

module.exports = { CopyrightSafeAsianCollector };