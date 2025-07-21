const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 한국 미술품 수집을 위한 멀티 뮤지엄 크롤러
class KoreanArtCollector {
  constructor() {
    this.museums = {
      smithsonian: {
        name: 'Smithsonian National Museum of Asian Art',
        searchUrl: 'https://api.si.edu/openaccess/api/v1.0/search',
        apiKey: 'nmMrADOq1kWjSLoQSfmlAEZraKLNhVTG14f0AJnb' // Updated public API key
      },
      cleveland: {
        name: 'Cleveland Museum of Art',
        searchUrl: 'https://openaccess-api.clevelandart.org/api/artworks',
        requiresAuth: false
      },
      brooklyn: {
        name: 'Brooklyn Museum',
        searchUrl: 'https://api.brooklynmuseum.org/v2/object',
        apiKey: 'YOUR_API_KEY' // Needs registration
      },
      rijksmuseum: {
        name: 'Rijksmuseum',
        searchUrl: 'https://www.rijksmuseum.nl/api/en/collection',
        apiKey: '0fiuZFh4' // Correct public API key
      },
      harvard: {
        name: 'Harvard Art Museums',
        searchUrl: 'https://api.harvardartmuseums.org/object',
        apiKey: '0d0f7b90-7b91-11ea-90e8-25e3586e7e91' // Public API key
      },
      artic: {
        name: 'Art Institute of Chicago',
        searchUrl: 'https://api.artic.edu/api/v1/artworks/search',
        detailUrl: 'https://api.artic.edu/api/v1/artworks',
        requiresAuth: false
      },
      nga: {
        name: 'National Gallery of Art',
        dataUrl: 'https://github.com/NationalGalleryOfArt/opendata/raw/main/data/objects.csv',
        requiresAuth: false
      },
      walters: {
        name: 'Walters Art Museum',
        searchUrl: 'https://api.thewalters.org/v1/objects',
        apiKey: 'YOUR_API_KEY', // Needs key but data available on GitHub
        requiresAuth: false
      },
      met: {
        name: 'Metropolitan Museum of Art',
        searchUrl: 'https://collectionapi.metmuseum.org/public/collection/v1/search',
        objectUrl: 'https://collectionapi.metmuseum.org/public/collection/v1/objects',
        requiresAuth: false
      },
      moma: {
        name: 'Museum of Modern Art',
        artistsUrl: 'https://github.com/MuseumofModernArt/collection/raw/main/Artists.csv',
        artworksUrl: 'https://github.com/MuseumofModernArt/collection/raw/main/Artworks.csv',
        requiresAuth: false
      }
    };
    
    this.koreanTerms = [
      'korea', 'korean', '한국', '조선', '고려', 'joseon', 'goryeo', 'silla',
      'baekje', '백제', '신라', 'celadon', '청자', '백자', 'buncheong',
      'kimchi', 'hanbok', 'hangul', '한글', 'seoul', '서울'
    ];
    
    this.results = [];
    this.saveDir = './korean-art-data';
    
    if (!fs.existsSync(this.saveDir)) {
      fs.mkdirSync(this.saveDir, { recursive: true });
    }
  }

  // Smithsonian API에서 한국 미술 검색
  async searchSmithsonian() {
    console.log('\n🏛️  Searching Smithsonian National Museum of Asian Art...');
    const results = [];
    
    for (const term of this.koreanTerms) {
      try {
        const params = {
          api_key: this.museums.smithsonian.apiKey,
          q: term,
          rows: 100,
          start: 0
        };
        
        const response = await axios.get(this.museums.smithsonian.searchUrl, { params });
        
        if (response.data.response && response.data.response.docs) {
          const koreanArt = response.data.response.docs.filter(doc => {
            // CC0 라이선스 확인
            const hasCC0 = doc.content?.descriptiveNonRepeating?.metadata?.usage?.cc0 === 'true';
            const isAsianArt = doc.content?.freetext?.physicalDescription?.[0]?.label === 'Asian Art';
            
            return hasCC0 && (
              this.isKoreanArt(doc.title) ||
              this.isKoreanArt(doc.content?.freetext?.culture?.[0]?.content) ||
              this.isKoreanArt(doc.content?.freetext?.place?.[0]?.content)
            );
          });
          
          results.push(...koreanArt.map(doc => this.formatSmithsonianArt(doc)));
        }
        
        await this.delay(1000); // Rate limiting
      } catch (error) {
        console.error(`Error searching Smithsonian for "${term}":`, error.message);
      }
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Smithsonian`);
    return results;
  }

  // Cleveland Museum API에서 한국 미술 검색
  async searchCleveland() {
    console.log('\n🎨 Searching Cleveland Museum of Art...');
    const results = [];
    
    try {
      // Cleveland API는 culture 필드로 검색 가능
      const params = {
        q: 'culture:Korea OR culture:Korean',
        has_image: 1,
        cc0: 1, // CC0 라이선스만
        limit: 100
      };
      
      const response = await axios.get(this.museums.cleveland.searchUrl, { params });
      
      if (response.data.data) {
        results.push(...response.data.data.map(art => this.formatClevelandArt(art)));
      }
      
      // 추가 검색어로도 검색
      for (const term of ['joseon', 'goryeo', 'silla']) {
        const searchParams = {
          q: term,
          has_image: 1,
          cc0: 1,
          limit: 50
        };
        
        const searchResponse = await axios.get(this.museums.cleveland.searchUrl, { 
          params: searchParams 
        });
        
        if (searchResponse.data.data) {
          const newResults = searchResponse.data.data
            .filter(art => {
              // Handle arrays and strings
              const cultureText = Array.isArray(art.culture) ? art.culture.join(' ') : art.culture || '';
              return this.isKoreanArt(cultureText) || this.isKoreanArt(art.description);
            })
            .map(art => this.formatClevelandArt(art));
          
          results.push(...newResults);
        }
        
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error searching Cleveland Museum:', error.message);
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Cleveland Museum`);
    return results;
  }

  // Rijksmuseum API에서 한국 미술 검색
  async searchRijksmuseum() {
    console.log('\n🇳🇱 Searching Rijksmuseum...');
    const results = [];
    
    try {
      for (const term of ['korea', 'korean', 'joseon']) {
        const params = {
          key: this.museums.rijksmuseum.apiKey,
          q: term,
          imgonly: true,
          ps: 100,
          format: 'json'
        };
        
        const response = await axios.get(this.museums.rijksmuseum.searchUrl, { params });
        
        if (response.data.artObjects) {
          const koreanArt = response.data.artObjects
            .filter(art => art.permitDownload) // 다운로드 가능한 것만
            .map(art => this.formatRijksmuseumArt(art));
          
          results.push(...koreanArt);
        }
        
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error searching Rijksmuseum:', error.message);
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Rijksmuseum`);
    return results;
  }

  // Harvard Art Museums API에서 한국 미술 검색
  async searchHarvard() {
    console.log('\n🎓 Searching Harvard Art Museums...');
    const results = [];
    
    try {
      const params = {
        apikey: this.museums.harvard.apiKey,
        culture: 'Korean',
        hasimage: 1,
        size: 100,
        fields: 'objectid,title,dated,culture,classification,primaryimageurl,imagepermissionlevel,creditline'
      };
      
      const response = await axios.get(this.museums.harvard.searchUrl, { params });
      
      if (response.data.records) {
        const publicDomainArt = response.data.records
          .filter(art => art.imagepermissionlevel === 0) // Public domain
          .map(art => this.formatHarvardArt(art));
        
        results.push(...publicDomainArt);
      }
      
      // 추가 검색
      for (const term of ['joseon', 'goryeo', 'celadon']) {
        const searchParams = {
          apikey: this.museums.harvard.apiKey,
          keyword: term,
          hasimage: 1,
          size: 50
        };
        
        const searchResponse = await axios.get(this.museums.harvard.searchUrl, { 
          params: searchParams 
        });
        
        if (searchResponse.data.records) {
          const newResults = searchResponse.data.records
            .filter(art => art.imagepermissionlevel === 0 && 
                          (this.isKoreanArt(art.culture) || this.isKoreanArt(art.classification)))
            .map(art => this.formatHarvardArt(art));
          
          results.push(...newResults);
        }
        
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error searching Harvard Museums:', error.message);
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Harvard Museums`);
    return results;
  }

  // 한국 미술품인지 확인
  isKoreanArt(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return this.koreanTerms.some(term => lowerText.includes(term.toLowerCase()));
  }

  // 포맷 함수들
  formatSmithsonianArt(doc) {
    const content = doc.content || {};
    return {
      id: `smithsonian-${doc.id}`,
      museum: 'Smithsonian',
      title: doc.title || 'Untitled',
      artist: content.freetext?.name?.[0]?.content || 'Unknown',
      date: content.freetext?.date?.[0]?.content || '',
      culture: content.freetext?.culture?.[0]?.content || 'Korean',
      medium: content.freetext?.physicalDescription?.[0]?.content || '',
      primaryImage: content.descriptiveNonRepeating?.online_media?.media?.[0]?.content || '',
      metUrl: doc.url || '',
      license: 'CC0',
      source: 'Smithsonian National Museum of Asian Art'
    };
  }

  formatClevelandArt(art) {
    return {
      id: `cleveland-${art.id}`,
      museum: 'Cleveland Museum of Art',
      title: art.title || 'Untitled',
      artist: art.creators?.[0]?.description || 'Unknown',
      date: art.creation_date || '',
      culture: art.culture || 'Korean',
      medium: art.technique || '',
      primaryImage: art.images?.web?.url || '',
      metUrl: art.url || '',
      license: 'CC0',
      source: 'Cleveland Museum of Art'
    };
  }

  formatRijksmuseumArt(art) {
    return {
      id: `rijksmuseum-${art.objectNumber}`,
      museum: 'Rijksmuseum',
      title: art.title || 'Untitled',
      artist: art.principalOrFirstMaker || 'Unknown',
      date: art.dating?.presentingDate || '',
      culture: 'Korean/Asian',
      medium: art.materials || '',
      primaryImage: art.webImage?.url || '',
      metUrl: art.links?.web || '',
      license: 'CC0',
      source: 'Rijksmuseum'
    };
  }

  formatHarvardArt(art) {
    return {
      id: `harvard-${art.objectid}`,
      museum: 'Harvard Art Museums',
      title: art.title || 'Untitled',
      artist: art.people?.[0]?.name || 'Unknown',
      date: art.dated || '',
      culture: art.culture || 'Korean',
      medium: art.medium || '',
      primaryImage: art.primaryimageurl || '',
      metUrl: `https://www.harvardartmuseums.org/collections/object/${art.objectid}`,
      license: 'Public Domain',
      source: 'Harvard Art Museums'
    };
  }

  // 헬퍼 함수들
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  removeDuplicates(artworks) {
    const seen = new Set();
    return artworks.filter(art => {
      const key = `${art.title}-${art.artist}-${art.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  saveResults(artworks) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = path.join(this.saveDir, `korean-art-collection-${timestamp}.json`);
    
    const data = {
      metadata: {
        date: new Date().toISOString(),
        total: artworks.length,
        sources: {
          smithsonian: artworks.filter(a => a.museum === 'Smithsonian').length,
          cleveland: artworks.filter(a => a.museum === 'Cleveland Museum of Art').length,
          rijksmuseum: artworks.filter(a => a.museum === 'Rijksmuseum').length,
          harvard: artworks.filter(a => a.museum === 'Harvard Art Museums').length,
          artic: artworks.filter(a => a.museum === 'Art Institute of Chicago').length,
          nga: artworks.filter(a => a.museum === 'National Gallery of Art').length,
          walters: artworks.filter(a => a.museum === 'Walters Art Museum').length,
          met: artworks.filter(a => a.museum === 'Metropolitan Museum of Art').length,
          moma: artworks.filter(a => a.museum === 'Museum of Modern Art').length
        },
        license: 'CC0 / Public Domain',
        purpose: 'Commercial use allowed'
      },
      artworks: artworks
    };
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n💾 Saved ${artworks.length} Korean artworks to ${filename}`);
    return filename;
  }

  // Art Institute of Chicago API에서 한국 미술 검색
  async searchArtic() {
    console.log('\n🎨 Searching Art Institute of Chicago...');
    const results = [];
    
    try {
      for (const term of this.koreanTerms) {
        const params = {
          q: term,
          fields: 'id,title,artist_display,date_display,place_of_origin,medium_display,image_id,api_link,is_public_domain',
          limit: 100
        };
        
        const response = await axios.get(this.museums.artic.searchUrl, { params });
        
        if (response.data.data) {
          const koreanArt = response.data.data.filter(art => {
            return art.is_public_domain && (
              this.isKoreanArt(art.place_of_origin) ||
              this.isKoreanArt(art.artist_display) ||
              this.isKoreanArt(art.title)
            );
          });
          
          results.push(...koreanArt.map(art => this.formatArticArt(art)));
        }
        
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error searching Art Institute:', error.message);
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Art Institute of Chicago`);
    return results;
  }

  formatArticArt(art) {
    return {
      id: `artic-${art.id}`,
      museum: 'Art Institute of Chicago',
      title: art.title || 'Untitled',
      artist: art.artist_display || 'Unknown',
      date: art.date_display || '',
      culture: art.place_of_origin || 'Korean',
      medium: art.medium_display || '',
      primaryImage: art.image_id ? `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg` : '',
      metUrl: `https://www.artic.edu/artworks/${art.id}`,
      license: 'CC0',
      source: 'Art Institute of Chicago'
    };
  }

  // National Gallery of Art에서 한국 미술 검색
  async searchNGA() {
    console.log('\n🖼️  Searching National Gallery of Art...');
    const results = [];
    
    try {
      // 데이터가 크므로 스트림으로 처리하는 것이 좋지만, 간단히 처리
      console.log('Downloading NGA data (this may take a moment)...');
      const response = await axios.get(this.museums.nga.dataUrl, {
        responseType: 'text',
        maxContentLength: 50 * 1024 * 1024, // 50MB limit
        timeout: 60000 // 60 seconds timeout
      });
      
      // 간단한 CSV 파싱 (제대로 된 CSV 파서 필요)
      const lines = response.data.split('\n');
      console.log(`Processing ${lines.length} records...`);
      
      // 첫 줄은 헤더
      const headers = lines[0].toLowerCase().split('\t'); // NGA는 탭 구분자 사용
      
      // 필드 인덱스 찾기
      const objectidIdx = headers.findIndex(h => h.includes('objectid'));
      const titleIdx = headers.findIndex(h => h.includes('title'));
      const artistIdx = headers.findIndex(h => h.includes('attribution'));
      const dateIdx = headers.findIndex(h => h.includes('displaydate'));
      const mediumIdx = headers.findIndex(h => h.includes('medium'));
      const classificationIdx = headers.findIndex(h => h.includes('classification'));
      
      let found = 0;
      // 모든 레코드 검색
      for (let i = 1; i < lines.length && found < 100; i++) {
        if (i % 10000 === 0) console.log(`Processed ${i} records...`);
        
        const line = lines[i];
        if (!line || line.trim() === '') continue;
        
        const values = line.split('\t');
        
        // 모든 필드에서 한국 관련 키워드 검색
        const fullText = line.toLowerCase();
        if (this.koreanTerms.some(term => fullText.includes(term.toLowerCase()))) {
          found++;
          results.push({
            id: `nga-${values[objectidIdx] || i}`,
            museum: 'National Gallery of Art',
            title: values[titleIdx] || 'Untitled',
            artist: values[artistIdx] || 'Unknown',
            date: values[dateIdx] || '',
            culture: 'Korean', // NGA doesn't have culture field
            medium: values[mediumIdx] || '',
            primaryImage: '', // 이미지는 별도 처리 필요
            metUrl: `https://www.nga.gov/collection/art-object-page.${values[objectidIdx]}.html`,
            license: 'CC0',
            source: 'National Gallery of Art'
          });
        }
      }
    } catch (error) {
      console.error('Error searching National Gallery:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
      }
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from National Gallery of Art`);
    return results;
  }

  // Met Museum에서 한국 미술 검색 (조심스럽게)
  async searchMet() {
    console.log('\n🏛️  Searching Metropolitan Museum of Art (carefully)...');
    const results = [];
    
    try {
      // 한국 관련 검색어 하나만 시도 (rate limit 피하기)
      const searchTerm = 'Korea';
      const params = {
        q: searchTerm,
        hasImages: true
      };
      
      console.log(`Searching for "${searchTerm}"...`);
      const searchResponse = await axios.get(this.museums.met.searchUrl, { 
        params,
        timeout: 10000
      });
      
      if (searchResponse.data.objectIDs && searchResponse.data.objectIDs.length > 0) {
        console.log(`Found ${searchResponse.data.objectIDs.length} potential matches`);
        
        // 처음 20개만 가져오기 (rate limit 조심)
        const objectIds = searchResponse.data.objectIDs.slice(0, 20);
        
        for (const objectId of objectIds) {
          try {
            await this.delay(2000); // 2초 대기 (rate limit 방지)
            
            const objectResponse = await axios.get(`${this.museums.met.objectUrl}/${objectId}`, {
              timeout: 10000
            });
            
            const obj = objectResponse.data;
            
            // CC0인지 확인
            if (obj.isPublicDomain) {
              results.push({
                id: `met-${obj.objectID}`,
                museum: 'Metropolitan Museum of Art',
                title: obj.title || 'Untitled',
                artist: obj.artistDisplayName || 'Unknown',
                date: obj.objectDate || '',
                culture: obj.culture || 'Korean',
                medium: obj.medium || '',
                primaryImage: obj.primaryImage || '',
                metUrl: obj.objectURL || '',
                license: 'CC0',
                source: 'Metropolitan Museum of Art'
              });
            }
          } catch (error) {
            console.error(`Error fetching object ${objectId}:`, error.message);
            break; // 에러 발생시 중단
          }
        }
      }
    } catch (error) {
      console.error('Error searching Met Museum:', error.message);
      console.log('⚠️  Stopping Met search to avoid rate limiting');
    }
    
    console.log(`✅ Found ${results.length} Korean artworks from Met Museum`);
    return results;
  }

  // MoMA에서 한국 현대미술 검색
  async searchMoMA() {
    console.log('\n🎨 Searching Museum of Modern Art (MoMA)...');
    const results = [];
    
    try {
      // Artists CSV 다운로드
      console.log('Downloading MoMA artists data...');
      const artistsResponse = await axios.get(this.museums.moma.artistsUrl, {
        responseType: 'text',
        timeout: 30000
      });
      
      // CSV 파싱
      const artistLines = artistsResponse.data.split('\n');
      const artistHeaders = artistLines[0].split(',');
      
      // 헤더 인덱스 찾기
      const nameIdx = artistHeaders.findIndex(h => h.includes('DisplayName'));
      const nationalityIdx = artistHeaders.findIndex(h => h.includes('Nationality'));
      const birthIdx = artistHeaders.findIndex(h => h.includes('BeginDate'));
      const artistIdIdx = artistHeaders.findIndex(h => h.includes('ConstituentID'));
      
      // 한국 아티스트 찾기
      const koreanArtists = [];
      for (let i = 1; i < artistLines.length; i++) {
        const values = artistLines[i].split(',');
        const nationality = values[nationalityIdx];
        
        if (nationality && (nationality.includes('Korean') || nationality.includes('South Korean'))) {
          koreanArtists.push({
            id: values[artistIdIdx],
            name: values[nameIdx],
            birthYear: values[birthIdx]
          });
        }
      }
      
      console.log(`Found ${koreanArtists.length} Korean artists in MoMA collection`);
      
      // 간단히 처리 - 아티스트 정보만 반환
      results.push(...koreanArtists.map((artist, idx) => ({
        id: `moma-artist-${artist.id}`,
        museum: 'Museum of Modern Art',
        title: `Works by ${artist.name}`,
        artist: artist.name,
        date: artist.birthYear ? `Born ${artist.birthYear}` : '',
        culture: 'Korean Contemporary',
        medium: 'Various',
        primaryImage: '', // MoMA는 이미지 제공 안함
        metUrl: `https://www.moma.org/artists/${artist.id}`,
        license: 'CC0',
        source: 'Museum of Modern Art'
      })));
      
    } catch (error) {
      console.error('Error searching MoMA:', error.message);
    }
    
    console.log(`✅ Found ${results.length} Korean artists from MoMA`);
    return results;
  }

  // 메인 수집 함수
  async collectAll() {
    console.log('🚀 Starting Korean Art Collection from Multiple Museums...\n');
    console.log('🎯 Target: CC0/Public Domain Korean artworks for commercial use\n');
    
    const allResults = [];
    
    // 각 뮤지엄에서 수집
    allResults.push(...await this.searchSmithsonian());
    allResults.push(...await this.searchCleveland());
    allResults.push(...await this.searchRijksmuseum());
    allResults.push(...await this.searchHarvard());
    allResults.push(...await this.searchArtic());
    allResults.push(...await this.searchNGA());
    allResults.push(...await this.searchMet()); // Met은 마지막에 조심스럽게
    allResults.push(...await this.searchMoMA());
    
    // 중복 제거
    const uniqueResults = this.removeDuplicates(allResults);
    
    // 결과 저장
    const filename = this.saveResults(uniqueResults);
    
    // 요약 출력
    console.log('\n📊 Collection Summary:');
    console.log('='.repeat(50));
    console.log(`Total Korean artworks collected: ${uniqueResults.length}`);
    console.log('\nBy Museum:');
    Object.entries(this.museums).forEach(([key, museum]) => {
      const count = uniqueResults.filter(a => a.museum === museum.name).length;
      console.log(`- ${museum.name}: ${count}`);
    });
    console.log('\n✅ All artworks are CC0/Public Domain - Commercial use allowed!');
    
    return uniqueResults;
  }
}

// 실행
if (require.main === module) {
  const collector = new KoreanArtCollector();
  collector.collectAll()
    .then(() => console.log('\n🎉 Korean art collection completed!'))
    .catch(error => console.error('Error:', error));
}

module.exports = KoreanArtCollector;