const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const crypto = require('crypto');
const FormData = require('form-data');
require('dotenv').config();

class EnhancedArtveeCollectorV2 {
  constructor() {
    this.cloudinaryConfig = {
      cloud_name: 'dkdzgpj3n',
      api_key: '257249284342124',
      api_secret: '-JUkBhI-apD5r704sg1X0Uq8lNU'
    };
    
    this.existingArtworks = new Map();
    this.newArtworks = [];
    this.uploadedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
    this.delay = 3000; // 3초 딜레이
  }

  async initialize() {
    console.log('🎨 Enhanced Artvee Collector V2 초기화...\n');
    
    // 기존 수집된 작품 목록 로드
    try {
      const cloudinaryData = await fs.readFile('./data/cloudinary-urls.json', 'utf8');
      const parsed = JSON.parse(cloudinaryData);
      Object.keys(parsed).forEach(id => {
        this.existingArtworks.set(id, true);
      });
      console.log(`✅ 기존 작품 ${this.existingArtworks.size}개 확인됨\n`);
    } catch (error) {
      console.log('⚠️ 기존 cloudinary-urls.json 파일이 없습니다. 새로 시작합니다.\n');
    }
  }

  async collectFromArtvee(targetCount = 100) {
    console.log(`🔍 Artvee에서 새로운 작품 ${targetCount}개 검색 중...\n`);
    
    // 다양한 검색 전략
    const strategies = [
      // 1. 시대별 명작
      { type: 'category', value: 'renaissance', name: '르네상스' },
      { type: 'category', value: 'baroque', name: '바로크' },
      { type: 'category', value: 'impressionism', name: '인상주의' },
      { type: 'category', value: 'modern-art', name: '현대미술' },
      { type: 'category', value: 'abstract', name: '추상' },
      
      // 2. 유명 작가
      { type: 'artist', value: 'rembrandt', name: 'Rembrandt' },
      { type: 'artist', value: 'vermeer', name: 'Vermeer' },
      { type: 'artist', value: 'caravaggio', name: 'Caravaggio' },
      { type: 'artist', value: 'botticelli', name: 'Botticelli' },
      { type: 'artist', value: 'klimt', name: 'Klimt' },
      { type: 'artist', value: 'munch', name: 'Munch' },
      { type: 'artist', value: 'kandinsky', name: 'Kandinsky' },
      { type: 'artist', value: 'mondrian', name: 'Mondrian' },
      { type: 'artist', value: 'basquiat', name: 'Basquiat' },
      { type: 'artist', value: 'hockney', name: 'Hockney' },
      
      // 3. 스타일별
      { type: 'tag', value: 'surrealism', name: '초현실주의' },
      { type: 'tag', value: 'expressionism', name: '표현주의' },
      { type: 'tag', value: 'cubism', name: '큐비즘' },
      { type: 'tag', value: 'pointillism', name: '점묘법' },
      
      // 4. 주제별
      { type: 'subject', value: 'mythology', name: '신화' },
      { type: 'subject', value: 'religious', name: '종교' },
      { type: 'subject', value: 'historical', name: '역사' },
      { type: 'subject', value: 'allegorical', name: '우화' }
    ];

    // 무작위로 섞기
    strategies.sort(() => Math.random() - 0.5);

    for (const strategy of strategies) {
      if (this.newArtworks.length >= targetCount) break;
      
      await this.collectWithStrategy(strategy);
      await this.sleep(this.delay);
    }

    console.log(`\n📊 수집 완료: ${this.newArtworks.length}개의 새로운 작품 발견\n`);
  }

  async collectWithStrategy(strategy) {
    try {
      let url;
      switch (strategy.type) {
        case 'category':
          url = `https://artvee.com/c/${strategy.value}/`;
          break;
        case 'artist':
          url = `https://artvee.com/artist/${strategy.value}/`;
          break;
        case 'tag':
          url = `https://artvee.com/t/${strategy.value}/`;
          break;
        case 'subject':
          url = `https://artvee.com/s/${strategy.value}/`;
          break;
      }

      console.log(`🔍 ${strategy.name} 검색 중...`);
      
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];

      // 작품 추출
      $('.product, .artwork-item, article.product').each((i, elem) => {
        const $elem = $(elem);
        
        // 다양한 선택자 시도
        const link = $elem.find('a').first();
        const artworkUrl = link.attr('href');
        
        const title = $elem.find('.product-title, h2, h3').first().text().trim() ||
                     link.attr('title') || '';
                     
        const artist = $elem.find('.product-artist, .artist-name, .by-artist').first().text().trim() ||
                      strategy.type === 'artist' ? strategy.name : 'Unknown';
        
        if (artworkUrl && title) {
          const artworkId = this.extractArtworkId(artworkUrl);
          
          // 중복 체크
          if (!this.existingArtworks.has(artworkId) && 
              !this.newArtworks.find(a => a.id === artworkId)) {
            artworks.push({
              id: artworkId,
              url: artworkUrl.startsWith('http') ? artworkUrl : `https://artvee.com${artworkUrl}`,
              title: title,
              artist: artist,
              category: strategy.value,
              source: strategy.type
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
    } catch (error) {
      console.error(`  ❌ ${strategy.name} 수집 실패:`, error.message);
    }
  }

  async downloadAndUploadArtworks() {
    console.log('\n📥 작품 다운로드 및 Cloudinary 업로드 시작...\n');
    
    const cloudinaryUrls = {};
    
    // 기존 데이터 로드
    try {
      const existing = await fs.readFile('./data/cloudinary-urls.json', 'utf8');
      Object.assign(cloudinaryUrls, JSON.parse(existing));
    } catch (error) {
      // 파일이 없으면 새로 시작
    }

    // 진행 상황 추적
    const batchSize = Math.min(this.newArtworks.length, 100); // 최대 100개
    const selectedArtworks = this.newArtworks.slice(0, batchSize);

    for (let i = 0; i < selectedArtworks.length; i++) {
      const artwork = selectedArtworks[i];
      const progress = ((i + 1) / selectedArtworks.length * 100).toFixed(1);
      
      console.log(`\n[${i + 1}/${selectedArtworks.length}] (${progress}%) 처리 중...`);
      console.log(`  제목: ${artwork.title}`);
      console.log(`  작가: ${artwork.artist}`);
      
      try {
        // 상세 페이지에서 고화질 이미지 URL 추출
        const imageInfo = await this.extractDetailedImageInfo(artwork.url);
        
        if (imageInfo && imageInfo.imageUrl) {
          // Cloudinary에 업로드
          const uploadResult = await this.uploadToCloudinary(imageInfo.imageUrl, artwork, imageInfo);
          
          if (uploadResult) {
            cloudinaryUrls[artwork.id] = uploadResult;
            this.uploadedCount++;
            console.log(`  ✅ 업로드 완료`);
            
            // 중간 저장 (5개마다)
            if (this.uploadedCount % 5 === 0) {
              await fs.writeFile(
                './data/cloudinary-urls.json',
                JSON.stringify(cloudinaryUrls, null, 2)
              );
              console.log(`  💾 중간 저장 완료 (${Object.keys(cloudinaryUrls).length}개)`);
            }
          } else {
            this.skippedCount++;
          }
        } else {
          console.log(`  ⚠️ 이미지 URL을 찾을 수 없음`);
          this.skippedCount++;
        }
      } catch (error) {
        console.error(`  ❌ 처리 실패:`, error.message);
        this.errorCount++;
      }
      
      // 서버 부하 방지
      await this.sleep(this.delay);
    }

    // 최종 저장
    await fs.writeFile(
      './data/cloudinary-urls.json',
      JSON.stringify(cloudinaryUrls, null, 2)
    );

    // 수집 보고서 작성
    await this.generateReport(selectedArtworks);
  }

  async extractDetailedImageInfo(artworkUrl) {
    try {
      const response = await axios.get(artworkUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      // 다운로드 링크 찾기
      let downloadUrl = null;
      const downloadSelectors = [
        'a.download-btn',
        'a.download-button',
        'a[href*="/download/"]',
        '.single-image-download a',
        'a:contains("Download")',
        '#download-button'
      ];
      
      for (const selector of downloadSelectors) {
        const elem = $(selector).first();
        if (elem.length) {
          downloadUrl = elem.attr('href');
          if (downloadUrl) break;
        }
      }
      
      // 이미지 URL 찾기
      let imageUrl = downloadUrl;
      if (!imageUrl) {
        const imgSelectors = [
          'meta[property="og:image"]',
          '.single-image img',
          '.artwork-image img',
          'img.main-image',
          '#artwork-image'
        ];
        
        for (const selector of imgSelectors) {
          if (selector.includes('meta')) {
            imageUrl = $(selector).attr('content');
          } else {
            imageUrl = $(selector).attr('src');
          }
          if (imageUrl) break;
        }
      }
      
      // URL 정규화
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://artvee.com${imageUrl}`;
      }
      
      // 추가 메타데이터 추출
      const metadata = {
        date: $('.artwork-date, .date, time').first().text().trim(),
        medium: $('.medium, .technique').first().text().trim(),
        dimensions: $('.dimensions, .size').first().text().trim(),
        museum: $('.museum, .collection').first().text().trim(),
        description: $('.description, .artwork-description').first().text().trim()
      };
      
      return {
        imageUrl: imageUrl,
        downloadUrl: downloadUrl,
        metadata: metadata
      };
    } catch (error) {
      console.error(`  ⚠️ 상세 페이지 로드 실패:`, error.message);
      return null;
    }
  }

  async uploadToCloudinary(imageUrl, artwork, imageInfo) {
    try {
      // Cloudinary Upload API 사용
      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `sayu/artvee/enhanced/${artwork.id}`;
      
      // 서명 생성
      const params = {
        public_id: publicId,
        timestamp: timestamp,
        folder: 'sayu/artvee/enhanced',
        tags: `artvee,${artwork.source},${artwork.artist.toLowerCase().replace(/\s+/g, '-')}`,
        context: `title=${encodeURIComponent(artwork.title)}|artist=${encodeURIComponent(artwork.artist)}`
      };
      
      const signature = this.generateCloudinarySignature(params);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('api_key', this.cloudinaryConfig.api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('folder', 'sayu/artvee/enhanced');
      formData.append('tags', params.tags);
      formData.append('context', params.context);
      
      // 업로드 요청
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloud_name}/image/upload`;
      
      const response = await axios.post(uploadUrl, formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        format: response.data.format,
        width: response.data.width,
        height: response.data.height,
        bytes: response.data.bytes,
        metadata: {
          title: artwork.title,
          artist: artwork.artist,
          category: artwork.category,
          source: artwork.source,
          ...imageInfo.metadata
        }
      };
    } catch (error) {
      console.error(`  ⚠️ Cloudinary 업로드 실패:`, error.message);
      if (error.response) {
        console.error(`  응답:`, error.response.data);
      }
      return null;
    }
  }

  generateCloudinarySignature(params) {
    // 파라미터를 알파벳 순으로 정렬
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // SHA1 해시 생성
    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + this.cloudinaryConfig.api_secret)
      .digest('hex');
    
    return signature;
  }

  async generateReport(processedArtworks) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp: timestamp,
      summary: {
        existing_count: this.existingArtworks.size,
        found_new: this.newArtworks.length,
        processed: processedArtworks.length,
        uploaded: this.uploadedCount,
        skipped: this.skippedCount,
        errors: this.errorCount,
        total_in_cloudinary: this.existingArtworks.size + this.uploadedCount
      },
      by_source: {},
      by_artist: {},
      artworks: processedArtworks
    };

    // 소스별 통계
    processedArtworks.forEach(artwork => {
      if (!report.by_source[artwork.source]) {
        report.by_source[artwork.source] = 0;
      }
      report.by_source[artwork.source]++;
      
      if (!report.by_artist[artwork.artist]) {
        report.by_artist[artwork.artist] = 0;
      }
      report.by_artist[artwork.artist]++;
    });

    const reportPath = `./data/collection-report-${timestamp.split('T')[0]}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 수집 완료 보고서:');
    console.log(`  - 기존 작품: ${this.existingArtworks.size}개`);
    console.log(`  - 발견한 새 작품: ${this.newArtworks.length}개`);
    console.log(`  - 처리한 작품: ${processedArtworks.length}개`);
    console.log(`  - 업로드 성공: ${this.uploadedCount}개`);
    console.log(`  - 건너뜀: ${this.skippedCount}개`);
    console.log(`  - 오류: ${this.errorCount}개`);
    console.log(`  - Cloudinary 총 작품 수: ${this.existingArtworks.size + this.uploadedCount}개`);
    console.log(`\n📄 상세 보고서: ${reportPath}`);
  }

  extractArtworkId(url) {
    // URL에서 작품 ID 추출
    const patterns = [
      /\/dl\/([^\/]+)\/?$/,
      /\/artwork\/([^\/]+)\/?$/,
      /\/([^\/]+)\/?$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/[^a-z0-9-]/gi, '-');
      }
    }
    
    return url.split('/').pop().replace(/[^a-z0-9-]/gi, '-');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new EnhancedArtveeCollectorV2();
  
  try {
    await collector.initialize();
    
    // 명령줄 인자로 수집 개수 지정 가능
    const targetCount = process.argv[2] ? parseInt(process.argv[2]) : 100;
    
    await collector.collectFromArtvee(targetCount);
    
    if (collector.newArtworks.length > 0) {
      await collector.downloadAndUploadArtworks();
    } else {
      console.log('✨ 새로운 작품이 없습니다. 모든 작품이 이미 수집되었습니다.');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

main().catch(console.error);