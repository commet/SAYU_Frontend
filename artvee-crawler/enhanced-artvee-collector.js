const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary 설정
cloudinary.config({
  cloud_name: 'dkdzgpj3n',
  api_key: '257249284342124',
  api_secret: process.env.CLOUDINARY_API_SECRET || '-JUkBhI-apD5r704sg1X0Uq8lNU'
});

class EnhancedArtveeCollector {
  constructor() {
    this.existingArtworks = new Map();
    this.newArtworks = [];
    this.uploadedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
    this.delay = 3000; // 3초 딜레이
  }

  async initialize() {
    console.log('🎨 Enhanced Artvee Collector 초기화...\n');
    
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

  async collectFromArtvee() {
    console.log('🔍 Artvee에서 새로운 작품 검색 중...\n');
    
    // 주요 카테고리와 유명 작가들
    const categories = [
      'impressionism', 'renaissance', 'baroque', 'modern-art', 
      'surrealism', 'abstract', 'expressionism', 'romanticism',
      'realism', 'post-impressionism', 'neoclassicism', 'symbolism'
    ];
    
    const famousArtists = [
      'monet', 'van-gogh', 'picasso', 'rembrandt', 'vermeer',
      'caravaggio', 'michelangelo', 'leonardo-da-vinci', 'botticelli',
      'klimt', 'munch', 'kandinsky', 'mondrian', 'pollock',
      'warhol', 'basquiat', 'hockney', 'rothko', 'klee',
      'chagall', 'matisse', 'gauguin', 'cezanne', 'degas',
      'toulouse-lautrec', 'manet', 'renoir', 'pissarro', 'sisley'
    ];

    // 카테고리별 수집
    for (const category of categories) {
      await this.collectFromCategory(category);
      if (this.newArtworks.length >= 200) break; // 한 번에 200개까지만
    }

    // 아직 부족하면 작가별 수집
    if (this.newArtworks.length < 200) {
      for (const artist of famousArtists) {
        await this.collectFromArtist(artist);
        if (this.newArtworks.length >= 200) break;
      }
    }

    console.log(`\n📊 수집 완료: ${this.newArtworks.length}개의 새로운 작품 발견\n`);
  }

  async collectFromCategory(category) {
    try {
      const url = `https://artvee.com/c/${category}/`;
      console.log(`📁 카테고리 검색: ${category}`);
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];

      $('.product').each((i, elem) => {
        const $elem = $(elem);
        const artworkUrl = $elem.find('a').attr('href');
        const title = $elem.find('.product-title').text().trim();
        const artist = $elem.find('.product-artist').text().trim();
        
        if (artworkUrl && title) {
          const artworkId = this.extractArtworkId(artworkUrl);
          
          // 중복 체크
          if (!this.existingArtworks.has(artworkId)) {
            artworks.push({
              id: artworkId,
              url: artworkUrl,
              title: title,
              artist: artist || 'Unknown',
              category: category
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
      await this.sleep(this.delay);
    } catch (error) {
      console.error(`  ❌ 카테고리 ${category} 수집 실패:`, error.message);
    }
  }

  async collectFromArtist(artist) {
    try {
      const url = `https://artvee.com/artist/${artist}/`;
      console.log(`👨‍🎨 작가 검색: ${artist}`);
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];

      $('.product').each((i, elem) => {
        const $elem = $(elem);
        const artworkUrl = $elem.find('a').attr('href');
        const title = $elem.find('.product-title').text().trim();
        
        if (artworkUrl && title) {
          const artworkId = this.extractArtworkId(artworkUrl);
          
          // 중복 체크
          if (!this.existingArtworks.has(artworkId)) {
            artworks.push({
              id: artworkId,
              url: artworkUrl,
              title: title,
              artist: artist.replace('-', ' '),
              category: 'artist-collection'
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
      await this.sleep(this.delay);
    } catch (error) {
      console.error(`  ❌ 작가 ${artist} 수집 실패:`, error.message);
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

    for (let i = 0; i < this.newArtworks.length; i++) {
      const artwork = this.newArtworks[i];
      const progress = ((i + 1) / this.newArtworks.length * 100).toFixed(1);
      
      console.log(`\n[${i + 1}/${this.newArtworks.length}] (${progress}%) ${artwork.title}`);
      
      try {
        // 상세 페이지에서 이미지 URL 추출
        const imageUrl = await this.extractImageUrl(artwork.url);
        
        if (imageUrl) {
          // Cloudinary에 업로드
          const uploadResult = await this.uploadToCloudinary(imageUrl, artwork);
          
          if (uploadResult) {
            cloudinaryUrls[artwork.id] = uploadResult;
            this.uploadedCount++;
            console.log(`  ✅ 업로드 완료`);
            
            // 중간 저장 (10개마다)
            if (this.uploadedCount % 10 === 0) {
              await fs.writeFile(
                './data/cloudinary-urls.json',
                JSON.stringify(cloudinaryUrls, null, 2)
              );
            }
          }
        }
      } catch (error) {
        console.error(`  ❌ 실패:`, error.message);
        this.errorCount++;
      }
      
      await this.sleep(this.delay);
    }

    // 최종 저장
    await fs.writeFile(
      './data/cloudinary-urls.json',
      JSON.stringify(cloudinaryUrls, null, 2)
    );

    // 수집 보고서 작성
    await this.generateReport();
  }

  async extractImageUrl(artworkUrl) {
    const response = await axios.get(artworkUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(response.data);
    
    // 다양한 선택자로 이미지 찾기
    const selectors = [
      'a.download-button',
      'a[href*="/download/"]',
      '.single-image-download a',
      '#download-button'
    ];
    
    for (const selector of selectors) {
      const downloadLink = $(selector).attr('href');
      if (downloadLink) {
        return downloadLink.startsWith('http') ? 
          downloadLink : 
          `https://artvee.com${downloadLink}`;
      }
    }
    
    // 대체 방법: 이미지 태그에서 직접
    const imgSrc = $('.single-image img').attr('src') || 
                   $('img.artwork-image').attr('src');
    
    return imgSrc;
  }

  async uploadToCloudinary(imageUrl, artwork) {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: 'sayu/artvee/enhanced',
        public_id: artwork.id,
        tags: [
          'artvee',
          artwork.category,
          artwork.artist.toLowerCase().replace(/\s+/g, '-')
        ],
        context: {
          title: artwork.title,
          artist: artwork.artist,
          source: 'artvee',
          category: artwork.category
        }
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        tags: result.tags,
        metadata: {
          title: artwork.title,
          artist: artwork.artist,
          category: artwork.category
        }
      };
    } catch (error) {
      console.error(`  ⚠️ Cloudinary 업로드 실패:`, error.message);
      return null;
    }
  }

  async generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp: timestamp,
      summary: {
        total_found: this.newArtworks.length,
        uploaded: this.uploadedCount,
        skipped: this.skippedCount,
        errors: this.errorCount
      },
      artworks: this.newArtworks
    };

    await fs.writeFile(
      `./data/collection-report-${timestamp.split('T')[0]}.json`,
      JSON.stringify(report, null, 2)
    );

    console.log('\n📊 수집 완료 보고서:');
    console.log(`  - 발견: ${this.newArtworks.length}개`);
    console.log(`  - 업로드: ${this.uploadedCount}개`);
    console.log(`  - 건너뜀: ${this.skippedCount}개`);
    console.log(`  - 오류: ${this.errorCount}개`);
  }

  extractArtworkId(url) {
    const match = url.match(/\/dl\/([^\/]+)\/?$/);
    return match ? match[1] : url.split('/').pop();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new EnhancedArtveeCollector();
  
  try {
    await collector.initialize();
    await collector.collectFromArtvee();
    
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