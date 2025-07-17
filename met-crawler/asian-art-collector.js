const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 아시아 아트 전용 수집기
class AsianArtCollector {
  constructor() {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    // 아시아 아티스트 목록
    this.asianArtists = {
      korean: [
        'Nam June Paik', 'Do Ho Suh', 'Haegue Yang', 'Lee Bul', 'Anna Park',
        'Kimsooja', 'Choi Jeong-hwa', 'Yang Haegue', 'Suh Do Ho', 'Park Seo-bo',
        'Lee Ufan', 'Dansaekhwa', 'Monotone', 'Korean Minimalism'
      ],
      japanese: [
        'Yayoi Kusama', 'Takashi Murakami', 'Katsushika Hokusai', 'Utagawa Hiroshige',
        'Miyoko Ito', 'Chiura Obata', 'Yukimasa Ida', 'Yuki Onodera',
        'Mariko Mori', 'Yoshitomo Nara', 'Kaws', 'Superflat'
      ],
      chinese: [
        'Ai Weiwei', 'Liu Wei', 'Zeng Fanzhi', 'Yin Xiuzhen', 'Xiang Jing',
        'Zhang Xiaogang', 'Fang Lijun', 'Wang Guangyi', 'Xu Bing', 'Cai Guo-Qiang',
        'Political Pop', 'Cynical Realism'
      ],
      southeast_asian: [
        'Rirkrit Tiravanija', 'Apichatpong Weerasethakul', 'Montien Boonma',
        'FX Harsono', 'Dadang Christanto', 'Simryn Gill', 'Heri Dono'
      ],
      south_asian: [
        'Anish Kapoor', 'Subodh Gupta', 'Bharti Kher', 'Shilpa Gupta',
        'Raqib Shaw', 'Atul Dodiya', 'Nalini Malani'
      ]
    };
    
    this.sources = {
      // 대만 고궁박물관 (오픈 데이터)
      npmTaiwan: 'https://opendata.npm.gov.tw/api/v1',
      
      // 일본 국립박물관 통합 데이터베이스
      colbase: 'https://colbase.nich.go.jp/api',
      
      // 아시아 아트 아카이브
      asiaArtArchive: 'https://aaa.org.hk/api',
      
      // 서울시립미술관 (확인 필요)
      seoulMuseum: 'https://sema.seoul.go.kr/api',
      
      // 국립현대미술관 (확인 필요)
      mmca: 'https://mmca.go.kr/api',
      
      // 위키데이터 (아시아 아티스트 쿼리)
      wikidata: 'https://www.wikidata.org/w/api.php'
    };
    
    this.outputDir = './asian-art-data';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // 대만 고궁박물관 데이터 수집
  async collectTaiwanNationalPalaceMuseum() {
    console.log('🏛️  대만 고궁박물관 데이터 수집 시작...');
    
    const artworks = [];
    
    try {
      // 오픈 데이터 API 호출
      const url = `${this.sources.npmTaiwan}/Collection`;
      const response = await axios.get(url, {
        httpsAgent: this.httpsAgent,
        timeout: 30000,
        headers: {
          'User-Agent': 'SAYU-Art-Platform/1.0 (educational-research)',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.data) {
        for (const item of response.data.data) {
          artworks.push({
            objectID: `npm-taiwan-${item.id}`,
            title: item.title || item.title_zh || 'Untitled',
            titleZh: item.title_zh,
            titleEn: item.title_en,
            artist: item.artist || item.creator || 'Unknown',
            artistZh: item.artist_zh,
            artistEn: item.artist_en,
            date: item.date || item.period,
            dynasty: item.dynasty,
            category: item.category,
            material: item.material,
            dimensions: item.dimensions,
            description: item.description || item.description_zh,
            descriptionZh: item.description_zh,
            descriptionEn: item.description_en,
            primaryImage: item.image_url || item.thumbnail_url,
            imageRights: 'CC BY 4.0',
            source: 'National Palace Museum Taiwan',
            culture: 'Chinese',
            tags: ['taiwan', 'chinese-art', 'traditional', 'imperial-collection']
          });
        }
      }
      
      console.log(`  ✅ 대만 고궁박물관: ${artworks.length}개`);
      return artworks;
      
    } catch (error) {
      console.error('대만 고궁박물관 수집 오류:', error.message);
      return [];
    }
  }

  // 일본 국립박물관 데이터 수집
  async collectJapaneseNationalMuseums() {
    console.log('🏛️  일본 국립박물관 데이터 수집 시작...');
    
    const artworks = [];
    
    try {
      // ColBase API 대신 오픈 데이터 사용
      const searches = [
        'ukiyo-e', 'woodblock', 'japanese painting', 'ceramics', 'samurai',
        'buddhist art', 'shinto', 'kimono', 'lacquerware', 'calligraphy'
      ];
      
      for (const searchTerm of searches) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // 임시로 Art Institute of Chicago에서 일본 작품 검색
          const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchTerm + ' japanese')}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display,place_of_origin&limit=50`;
          
          const response = await axios.get(url, {
            httpsAgent: this.httpsAgent,
            timeout: 15000
          });
          
          if (response.data?.data) {
            for (const item of response.data.data) {
              if (item.is_public_domain && item.image_id && 
                  (item.place_of_origin?.toLowerCase().includes('japan') || 
                   item.artist_display?.toLowerCase().includes('japan'))) {
                
                artworks.push({
                  objectID: `japanese-${item.id}`,
                  title: item.title || 'Untitled',
                  artist: item.artist_display || 'Unknown',
                  date: item.date_display || '',
                  medium: item.medium_display || '',
                  classification: item.classification_title || '',
                  placeOfOrigin: item.place_of_origin || '',
                  primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
                  primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
                  artworkUrl: `https://www.artic.edu/artworks/${item.id}`,
                  source: 'Art Institute of Chicago (Japanese Collection)',
                  culture: 'Japanese',
                  searchTerm: searchTerm,
                  tags: ['japanese-art', 'traditional', searchTerm.replace(/\s+/g, '-')]
                });
              }
            }
          }
          
        } catch (error) {
          console.error(`일본 작품 검색 오류 (${searchTerm}):`, error.message);
        }
      }
      
      console.log(`  ✅ 일본 작품: ${artworks.length}개`);
      return artworks;
      
    } catch (error) {
      console.error('일본 국립박물관 수집 오류:', error.message);
      return [];
    }
  }

  // 위키데이터에서 아시아 아티스트 정보 수집
  async collectAsianArtistsFromWikidata() {
    console.log('🌐 위키데이터 아시아 아티스트 정보 수집 시작...');
    
    const artistsData = {};
    
    for (const [region, artists] of Object.entries(this.asianArtists)) {
      console.log(`📍 ${region.toUpperCase()} 아티스트 처리 중...`);
      
      artistsData[region] = [];
      
      for (const artistName of artists) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const artistData = await this.getArtistFromWikidata(artistName);
          if (artistData) {
            artistsData[region].push({
              ...artistData,
              region: region,
              searchName: artistName
            });
            console.log(`  ✅ ${artistName}`);
          } else {
            console.log(`  ❌ ${artistName} - 데이터 없음`);
          }
          
        } catch (error) {
          console.error(`  ❌ ${artistName} 오류:`, error.message);
        }
      }
    }
    
    return artistsData;
  }

  // 위키데이터에서 개별 아티스트 정보 조회
  async getArtistFromWikidata(artistName) {
    try {
      // 엔티티 검색
      const searchUrl = `${this.sources.wikidata}?action=wbsearchentities&search=${encodeURIComponent(artistName)}&language=en&format=json`;
      const searchResponse = await axios.get(searchUrl, {
        httpsAgent: this.httpsAgent,
        timeout: 15000
      });

      if (!searchResponse.data.search || searchResponse.data.search.length === 0) {
        return null;
      }

      const entityId = searchResponse.data.search[0].id;
      
      // 엔티티 상세 정보
      const entityUrl = `${this.sources.wikidata}?action=wbgetentities&ids=${entityId}&format=json`;
      const entityResponse = await axios.get(entityUrl, {
        httpsAgent: this.httpsAgent,
        timeout: 15000
      });

      const entity = entityResponse.data.entities[entityId];
      
      return {
        wikidataId: entityId,
        name: entity.labels?.en?.value || artistName,
        nameKo: entity.labels?.ko?.value,
        nameJa: entity.labels?.ja?.value,
        nameZh: entity.labels?.zh?.value,
        description: entity.descriptions?.en?.value,
        descriptionKo: entity.descriptions?.ko?.value,
        birthDate: this.extractWikidataDate(entity.claims?.P569),
        deathDate: this.extractWikidataDate(entity.claims?.P570),
        nationality: this.extractWikidataEntity(entity.claims?.P27),
        occupation: this.extractWikidataEntity(entity.claims?.P106),
        movement: this.extractWikidataEntity(entity.claims?.P135),
        notableWorks: this.extractWikidataEntity(entity.claims?.P800),
        wikipediaLinks: entity.sitelinks,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`위키데이터 조회 오류 (${artistName}):`, error.message);
      return null;
    }
  }

  // 위키데이터 날짜 추출
  extractWikidataDate(claims) {
    if (!claims || !claims[0] || !claims[0].mainsnak) return null;
    
    const datavalue = claims[0].mainsnak.datavalue;
    if (datavalue && datavalue.value && datavalue.value.time) {
      return datavalue.value.time.substring(1, 11); // +1890-01-01 -> 1890-01-01
    }
    return null;
  }

  // 위키데이터 엔티티 추출
  extractWikidataEntity(claims) {
    if (!claims || !claims[0] || !claims[0].mainsnak) return null;
    
    const datavalue = claims[0].mainsnak.datavalue;
    if (datavalue && datavalue.value && datavalue.value.id) {
      return datavalue.value.id;
    }
    return null;
  }

  // 현대 아시아 아티스트 작품 검색
  async searchContemporaryAsianArt() {
    console.log('🎨 현대 아시아 아티스트 작품 검색 시작...');
    
    const artworks = [];
    
    // 현대 아시아 아티스트 리스트
    const contemporaryArtists = [
      'Nam June Paik', 'Do Ho Suh', 'Yayoi Kusama', 'Ai Weiwei',
      'Takashi Murakami', 'Mariko Mori', 'Anish Kapoor', 'Subodh Gupta'
    ];
    
    for (const artist of contemporaryArtists) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        // Art Institute of Chicago에서 검색
        const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(artist)}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display,place_of_origin&limit=20`;
        
        const response = await axios.get(url, {
          httpsAgent: this.httpsAgent,
          timeout: 15000
        });
        
        if (response.data?.data) {
          for (const item of response.data.data) {
            if (item.is_public_domain && item.image_id) {
              artworks.push({
                objectID: `contemporary-asian-${item.id}`,
                title: item.title || 'Untitled',
                artist: item.artist_display || artist,
                date: item.date_display || '',
                medium: item.medium_display || '',
                classification: item.classification_title || '',
                placeOfOrigin: item.place_of_origin || '',
                primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
                primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
                artworkUrl: `https://www.artic.edu/artworks/${item.id}`,
                source: 'Art Institute of Chicago (Contemporary Asian)',
                culture: 'Contemporary Asian',
                searchArtist: artist,
                tags: ['contemporary', 'asian-artist', 'modern-art']
              });
            }
          }
        }
        
        console.log(`  ✅ ${artist}: ${artworks.filter(a => a.searchArtist === artist).length}개`);
        
      } catch (error) {
        console.error(`${artist} 검색 오류:`, error.message);
      }
    }
    
    console.log(`  ✅ 현대 아시아 작품 총 ${artworks.length}개`);
    return artworks;
  }

  // 통합 아시아 아트 수집
  async collectAsianArtComplete() {
    console.log('🌏 통합 아시아 아트 수집 시작...\n');
    
    const results = {
      metadata: {
        collectionDate: new Date().toISOString(),
        strategy: 'Comprehensive Asian Art Collection',
        sources: Object.keys(this.sources),
        regions: Object.keys(this.asianArtists)
      },
      artworks: [],
      artists: {},
      summary: {}
    };
    
    try {
      // 1. 대만 고궁박물관 (중국 전통 미술)
      const taiwanArtworks = await this.collectTaiwanNationalPalaceMuseum();
      results.artworks.push(...taiwanArtworks);
      
      // 2. 일본 전통 미술
      const japaneseArtworks = await this.collectJapaneseNationalMuseums();
      results.artworks.push(...japaneseArtworks);
      
      // 3. 현대 아시아 아티스트 작품
      const contemporaryArtworks = await this.searchContemporaryAsianArt();
      results.artworks.push(...contemporaryArtworks);
      
      // 4. 아시아 아티스트 정보 (위키데이터)
      results.artists = await this.collectAsianArtistsFromWikidata();
      
      // 5. 중복 제거
      results.artworks = this.removeDuplicateArtworks(results.artworks);
      
      // 6. 통계 생성
      results.summary = this.generateSummary(results);
      
      // 7. 결과 저장
      await this.saveAsianArtData(results);
      
      console.log('\n✨ 아시아 아트 수집 완료!');
      console.log(`📊 수집 결과:`);
      console.log(`  - 총 작품: ${results.artworks.length}개`);
      console.log(`  - 아티스트 정보: ${Object.values(results.artists).flat().length}명`);
      console.log(`  - 소스: ${results.metadata.sources.length}개`);
      
      return results;
      
    } catch (error) {
      console.error('아시아 아트 수집 오류:', error);
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

  // 통계 생성
  generateSummary(results) {
    const summary = {
      totalArtworks: results.artworks.length,
      totalArtists: Object.values(results.artists).flat().length,
      bySource: {},
      byCulture: {},
      byRegion: {}
    };
    
    // 소스별 통계
    results.artworks.forEach(artwork => {
      const source = artwork.source || 'Unknown';
      summary.bySource[source] = (summary.bySource[source] || 0) + 1;
      
      const culture = artwork.culture || 'Unknown';
      summary.byCulture[culture] = (summary.byCulture[culture] || 0) + 1;
    });
    
    // 지역별 아티스트 통계
    Object.entries(results.artists).forEach(([region, artists]) => {
      summary.byRegion[region] = artists.length;
    });
    
    return summary;
  }

  // 결과 저장
  async saveAsianArtData(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 통합 결과 저장
    const outputFile = path.join(this.outputDir, `asian-art-collection-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    // CSV 저장
    const csvContent = [
      'ObjectID,Title,Artist,Date,Culture,Source,Classification,ImageURL',
      ...results.artworks.map(a => 
        `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date || ''}","${a.culture || ''}","${a.source || ''}","${a.classification || ''}","${a.primaryImage || ''}"`
      )
    ].join('\n');
    
    fs.writeFileSync(outputFile.replace('.json', '.csv'), csvContent);
    
    console.log(`💾 저장 완료:`);
    console.log(`  - JSON: ${outputFile}`);
    console.log(`  - CSV: ${outputFile.replace('.json', '.csv')}`);
  }
}

// 실행
async function runAsianArtCollection() {
  const collector = new AsianArtCollector();
  
  try {
    await collector.collectAsianArtComplete();
  } catch (error) {
    console.error('실행 오류:', error);
  }
}

if (require.main === module) {
  runAsianArtCollection();
}

module.exports = { AsianArtCollector };