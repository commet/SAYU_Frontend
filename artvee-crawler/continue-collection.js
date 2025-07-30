const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const crypto = require('crypto');
const FormData = require('form-data');
const sharp = require('sharp');
require('dotenv').config();

class ContinuedArtveeCollector {
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
    this.delay = 2000; // 2초 딜레이
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  async initialize() {
    console.log('🎨 Continued Artvee Collection - 추가 수집 시작...\n');
    
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

  async collectFromArtvee(targetCount = 50) {
    console.log(`🔍 Artvee에서 새로운 작품 ${targetCount}개 검색 중...\n`);
    
    // 추가 수집할 작가들 (이전에 실패했거나 새로운 작가들)
    const additionalArtists = [
      // 성공 가능성 높은 작가들
      { name: 'Rembrandt', slug: 'rembrandt' },
      { name: 'Vermeer', slug: 'johannes-vermeer' },
      { name: 'Caravaggio', slug: 'caravaggio' },
      { name: 'Botticelli', slug: 'sandro-botticelli' },
      { name: 'El Greco', slug: 'el-greco' },
      { name: 'Bruegel', slug: 'pieter-bruegel' },
      { name: 'Bosch', slug: 'hieronymus-bosch' },
      { name: 'Whistler', slug: 'james-mcneill-whistler' },
      { name: 'Sargent', slug: 'john-singer-sargent' },
      { name: 'Cassatt', slug: 'mary-cassatt' },
      { name: 'Caillebotte', slug: 'gustave-caillebotte' },
      { name: 'Corot', slug: 'jean-baptiste-camille-corot' },
      { name: 'Courbet', slug: 'gustave-courbet' },
      { name: 'Daumier', slug: 'honore-daumier' },
      { name: 'Ingres', slug: 'jean-auguste-dominique-ingres' },
      { name: 'Géricault', slug: 'theodore-gericault' },
      { name: 'Friedrich', slug: 'caspar-david-friedrich' },
      { name: 'Moreau', slug: 'gustave-moreau' },
      { name: 'Redon', slug: 'odilon-redon' },
      { name: 'Signac', slug: 'paul-signac' },
      { name: 'Vallotton', slug: 'felix-vallotton' },
      { name: 'Alma-Tadema', slug: 'lawrence-alma-tadema' },
      { name: 'Bouguereau', slug: 'william-adolphe-bouguereau' },
      { name: 'Rossetti', slug: 'dante-gabriel-rossetti' },
      { name: 'Burne-Jones', slug: 'edward-burne-jones' },
      { name: 'Waterhouse', slug: 'john-william-waterhouse' },
      { name: 'Millais', slug: 'john-everett-millais' },
      { name: 'Leighton', slug: 'frederic-leighton' },
      { name: 'Sorolla', slug: 'joaquin-sorolla' },
      { name: 'Zorn', slug: 'anders-zorn' }
    ];

    for (const artist of additionalArtists) {
      if (this.newArtworks.length >= targetCount) break;
      await this.collectFromArtist(artist);
      await this.sleep(this.delay);
    }

    // 특정 페이지에서 직접 수집
    if (this.newArtworks.length < targetCount) {
      await this.collectFromPopularPages();
    }

    console.log(`\n📊 수집 완료: ${this.newArtworks.length}개의 새로운 작품 발견\n`);
  }

  async collectFromArtist(artist) {
    try {
      const url = `https://artvee.com/artist/${artist.slug}/`;
      console.log(`👨‍🎨 ${artist.name} 작품 검색 중...`);
      
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];

      $('.product, .artwork-item, article.product').each((i, elem) => {
        const $elem = $(elem);
        const link = $elem.find('a').first();
        const artworkUrl = link.attr('href');
        const title = $elem.find('.product-title, h2, h3').first().text().trim() ||
                     link.attr('title') || '';
        
        if (artworkUrl && title) {
          const artworkId = this.extractArtworkId(artworkUrl);
          
          // 중복 체크
          if (!this.existingArtworks.has(artworkId) && 
              !this.newArtworks.find(a => a.id === artworkId)) {
            artworks.push({
              id: artworkId,
              url: artworkUrl.startsWith('http') ? artworkUrl : `https://artvee.com${artworkUrl}`,
              title: title,
              artist: artist.name,
              category: 'master-artist',
              importance: 'high'
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
    } catch (error) {
      console.error(`  ❌ ${artist.name} 수집 실패:`, error.message);
    }
  }

  async collectFromPopularPages() {
    const popularPages = [
      { url: 'https://artvee.com/c/landscapes/', name: '풍경화' },
      { url: 'https://artvee.com/c/portraits/', name: '초상화' },
      { url: 'https://artvee.com/c/abstract/', name: '추상화' },
      { url: 'https://artvee.com/c/figurative/', name: '인물화' },
      { url: 'https://artvee.com/c/still-life/', name: '정물화' }
    ];

    for (const page of popularPages) {
      if (this.newArtworks.length >= 50) break;
      
      try {
        console.log(`📄 ${page.name} 페이지 검색 중...`);
        
        const response = await axios.get(page.url, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const artworks = [];

        $('.product, .artwork-item').each((i, elem) => {
          const $elem = $(elem);
          const link = $elem.find('a').first();
          const artworkUrl = link.attr('href');
          const title = $elem.find('.product-title, h2, h3').first().text().trim() ||
                       link.attr('title') || '';
          const artist = $elem.find('.product-artist, .artist-name').first().text().trim() || 'Unknown';
          
          if (artworkUrl && title) {
            const artworkId = this.extractArtworkId(artworkUrl);
            
            if (!this.existingArtworks.has(artworkId) && 
                !this.newArtworks.find(a => a.id === artworkId)) {
              artworks.push({
                id: artworkId,
                url: artworkUrl.startsWith('http') ? artworkUrl : `https://artvee.com${artworkUrl}`,
                title: title,
                artist: artist,
                category: page.name,
                importance: 'medium'
              });
            }
          }
        });

        console.log(`  → ${artworks.length}개 새 작품 발견`);
        this.newArtworks.push(...artworks.slice(0, 10)); // 각 카테고리에서 최대 10개만
        
      } catch (error) {
        console.error(`  ❌ ${page.name} 수집 실패:`, error.message);
      }
      
      await this.sleep(this.delay);
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

    // 중요도 순으로 정렬
    const sortedArtworks = this.newArtworks.sort((a, b) => {
      if (a.importance === 'high' && b.importance !== 'high') return -1;
      if (a.importance !== 'high' && b.importance === 'high') return 1;
      return 0;
    });

    for (let i = 0; i < sortedArtworks.length; i++) {
      const artwork = sortedArtworks[i];
      const progress = ((i + 1) / sortedArtworks.length * 100).toFixed(1);
      
      console.log(`\n[${i + 1}/${sortedArtworks.length}] (${progress}%) 처리 중...`);
      console.log(`  제목: ${artwork.title}`);
      console.log(`  작가: ${artwork.artist}`);
      console.log(`  중요도: ${artwork.importance || 'normal'}`);
      
      try {
        // 상세 페이지에서 고화질 이미지 URL 추출
        const imageInfo = await this.extractDetailedImageInfo(artwork.url);
        
        if (imageInfo && imageInfo.imageUrl) {
          // 이미지 다운로드 및 크기 확인
          const imageBuffer = await this.downloadImage(imageInfo.imageUrl);
          
          if (imageBuffer) {
            // 크기가 크면 리사이즈
            const processedBuffer = await this.processImage(imageBuffer, artwork);
            
            if (processedBuffer) {
              // Cloudinary에 업로드
              const uploadResult = await this.uploadToCloudinary(processedBuffer, artwork, imageInfo);
              
              if (uploadResult) {
                cloudinaryUrls[artwork.id] = uploadResult;
                this.uploadedCount++;
                console.log(`  ✅ 업로드 완료`);
                
                // 중간 저장 (3개마다)
                if (this.uploadedCount % 3 === 0) {
                  await fs.writeFile(
                    './data/cloudinary-urls.json',
                    JSON.stringify(cloudinaryUrls, null, 2)
                  );
                  console.log(`  💾 중간 저장 완료 (${Object.keys(cloudinaryUrls).length}개)`);
                }
              } else {
                this.skippedCount++;
              }
            }
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
    await this.generateReport(sortedArtworks);
  }

  async downloadImage(imageUrl) {
    try {
      console.log(`  📥 이미지 다운로드 중...`);
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const buffer = Buffer.from(response.data);
      console.log(`  📏 원본 크기: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      return buffer;
    } catch (error) {
      console.error(`  ⚠️ 다운로드 실패:`, error.message);
      return null;
    }
  }

  async processImage(buffer, artwork) {
    try {
      // 10MB 이하면 그대로 사용
      if (buffer.length <= this.maxFileSize) {
        return buffer;
      }
      
      console.log(`  🔧 이미지 최적화 중 (10MB 이하로 조정)...`);
      
      // Sharp를 사용해 리사이즈 및 압축
      let processedBuffer = await sharp(buffer)
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();
      
      // 여전히 크면 더 압축
      let quality = 85;
      while (processedBuffer.length > this.maxFileSize && quality > 50) {
        processedBuffer = await sharp(buffer)
          .jpeg({ quality: quality, progressive: true })
          .toBuffer();
        quality -= 5;
      }
      
      // 그래도 크면 리사이즈
      if (processedBuffer.length > this.maxFileSize) {
        const metadata = await sharp(buffer).metadata();
        const scale = Math.sqrt(this.maxFileSize / processedBuffer.length);
        const newWidth = Math.floor(metadata.width * scale);
        
        processedBuffer = await sharp(buffer)
          .resize(newWidth)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      }
      
      console.log(`  ✨ 최적화 완료: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      return processedBuffer;
      
    } catch (error) {
      console.error(`  ⚠️ 이미지 처리 실패:`, error.message);
      return null;
    }
  }

  async uploadToCloudinary(imageBuffer, artwork, imageInfo) {
    try {
      // Base64 인코딩
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      // Cloudinary Upload API 사용
      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `sayu/artvee/enhanced/${artwork.id}`;
      
      // 서명 생성
      const params = {
        public_id: publicId,
        timestamp: timestamp,
        folder: 'sayu/artvee/enhanced',
        tags: `artvee,${artwork.category},${artwork.artist.toLowerCase().replace(/\s+/g, '-')}`,
        context: `title=${encodeURIComponent(artwork.title)}|artist=${encodeURIComponent(artwork.artist)}|importance=${artwork.importance || 'normal'}`
      };
      
      const signature = this.generateCloudinarySignature(params);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', base64Image);
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
        timeout: 60000
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
          importance: artwork.importance,
          source: 'artvee',
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
      by_artist: {},
      by_importance: {
        high: 0,
        medium: 0,
        normal: 0
      },
      artworks: processedArtworks.map(a => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        importance: a.importance || 'normal'
      }))
    };

    // 통계 계산
    processedArtworks.forEach(artwork => {
      if (!report.by_artist[artwork.artist]) {
        report.by_artist[artwork.artist] = 0;
      }
      report.by_artist[artwork.artist]++;
      
      const importance = artwork.importance || 'normal';
      report.by_importance[importance]++;
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
    console.log(`\n  중요도별:`);
    console.log(`  - 높음: ${report.by_importance.high}개`);
    console.log(`  - 중간: ${report.by_importance.medium}개`);
    console.log(`  - 보통: ${report.by_importance.normal}개`);
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
  const collector = new ContinuedArtveeCollector();
  
  try {
    await collector.initialize();
    
    // 50개씩 수집
    await collector.collectFromArtvee(50);
    
    if (collector.newArtworks.length > 0) {
      await collector.downloadAndUploadArtworks();
    } else {
      console.log('✨ 새로운 작품이 없습니다.');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

main().catch(console.error);