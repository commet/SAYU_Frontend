const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const crypto = require('crypto');
const FormData = require('form-data');
const sharp = require('sharp');
require('dotenv').config();

class SteadyCollector1500 {
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
    console.log('🐂 Steady Collector - 1,500개 목표로 꾸준히 수집합니다...\n');
    
    // 기존 수집된 작품 목록 로드
    try {
      const cloudinaryData = await fs.readFile('./data/cloudinary-urls.json', 'utf8');
      const parsed = JSON.parse(cloudinaryData);
      Object.keys(parsed).forEach(id => {
        this.existingArtworks.set(id, true);
      });
      console.log(`✅ 현재 보유 작품: ${this.existingArtworks.size}개`);
      console.log(`🎯 목표: 1,500개 (${1500 - this.existingArtworks.size}개 더 필요)\n`);
    } catch (error) {
      console.log('⚠️ 기존 cloudinary-urls.json 파일이 없습니다. 새로 시작합니다.\n');
    }
  }

  async collectFromArtvee(targetCount = 100) {
    console.log(`🔍 Artvee에서 추가 작품 ${targetCount}개 검색 중...\n`);
    
    // 다양한 시대와 지역의 작가들 추가
    const expandedArtists = [
      // 초기 르네상스 & 고딕
      { name: 'Giotto', slug: 'giotto', priority: 8 },
      { name: 'Fra Angelico', slug: 'fra-angelico', priority: 8 },
      { name: 'Masaccio', slug: 'masaccio', priority: 7 },
      { name: 'Uccello', slug: 'paolo-uccello', priority: 6 },
      { name: 'Ghirlandaio', slug: 'domenico-ghirlandaio', priority: 6 },
      { name: 'Perugino', slug: 'pietro-perugino', priority: 6 },
      { name: 'Lippi', slug: 'filippo-lippi', priority: 6 },
      { name: 'Verrocchio', slug: 'andrea-del-verrocchio', priority: 6 },
      
      // 플랑드르 화파
      { name: 'Memling', slug: 'hans-memling', priority: 7 },
      { name: 'van der Weyden', slug: 'rogier-van-der-weyden', priority: 7 },
      { name: 'Brueghel the Younger', slug: 'pieter-brueghel-the-younger', priority: 6 },
      { name: 'Bruegel', slug: 'jan-brueghel-the-elder', priority: 6 },
      { name: 'Rubens', slug: 'peter-paul-rubens', priority: 8 },
      { name: 'Jordaens', slug: 'jacob-jordaens', priority: 6 },
      { name: 'Teniers', slug: 'david-teniers-the-younger', priority: 5 },
      
      // 네덜란드 황금시대 추가
      { name: 'Steen', slug: 'jan-steen', priority: 7 },
      { name: 'de Hooch', slug: 'pieter-de-hooch', priority: 7 },
      { name: 'Terborch', slug: 'gerard-ter-borch', priority: 6 },
      { name: 'Metsu', slug: 'gabriel-metsu', priority: 6 },
      { name: 'Dou', slug: 'gerrit-dou', priority: 6 },
      { name: 'Cuyp', slug: 'aelbert-cuyp', priority: 6 },
      { name: 'Hobbema', slug: 'meindert-hobbema', priority: 6 },
      
      // 영국 화파
      { name: 'Blake', slug: 'william-blake', priority: 8 },
      { name: 'Constable', slug: 'john-constable', priority: 8 },
      { name: 'Stubbs', slug: 'george-stubbs', priority: 6 },
      { name: 'Wright', slug: 'joseph-wright', priority: 6 },
      { name: 'Lawrence', slug: 'thomas-lawrence', priority: 6 },
      { name: 'Romney', slug: 'george-romney', priority: 5 },
      
      // 미국 화파
      { name: 'Homer', slug: 'winslow-homer', priority: 8 },
      { name: 'Eakins', slug: 'thomas-eakins', priority: 7 },
      { name: 'Church', slug: 'frederic-edwin-church', priority: 7 },
      { name: 'Cole', slug: 'thomas-cole', priority: 7 },
      { name: 'Bierstadt', slug: 'albert-bierstadt', priority: 7 },
      { name: 'Stuart', slug: 'gilbert-stuart', priority: 6 },
      { name: 'Copley', slug: 'john-singleton-copley', priority: 6 },
      { name: 'Peale', slug: 'charles-willson-peale', priority: 5 },
      
      // 독일/오스트리아
      { name: 'Friedrich', slug: 'caspar-david-friedrich', priority: 8 },
      { name: 'Dürer', slug: 'albrecht-durer', priority: 9 },
      { name: 'Grünewald', slug: 'matthias-grunewald', priority: 7 },
      { name: 'Altdorfer', slug: 'albrecht-altdorfer', priority: 6 },
      { name: 'Menzel', slug: 'adolph-menzel', priority: 6 },
      { name: 'Leibl', slug: 'wilhelm-leibl', priority: 5 },
      
      // 스페인 추가
      { name: 'Murillo', slug: 'bartolome-esteban-murillo', priority: 7 },
      { name: 'Zurbarán', slug: 'francisco-de-zurbaran', priority: 7 },
      { name: 'Ribera', slug: 'jusepe-de-ribera', priority: 6 },
      { name: 'Fortuny', slug: 'mariano-fortuny', priority: 6 },
      
      // 프랑스 추가
      { name: 'Lorrain', slug: 'claude-lorrain', priority: 7 },
      { name: 'Le Brun', slug: 'charles-le-brun', priority: 6 },
      { name: 'Rigaud', slug: 'hyacinthe-rigaud', priority: 5 },
      { name: 'Boucher', slug: 'francois-boucher', priority: 7 },
      { name: 'Greuze', slug: 'jean-baptiste-greuze', priority: 6 },
      { name: 'Vigée Le Brun', slug: 'elisabeth-louise-vigee-le-brun', priority: 7 },
      { name: 'Millet', slug: 'jean-francois-millet', priority: 8 },
      { name: 'Daubigny', slug: 'charles-francois-daubigny', priority: 6 },
      { name: 'Troyon', slug: 'constant-troyon', priority: 5 },
      
      // 이탈리아 추가
      { name: 'Canaletto', slug: 'canaletto', priority: 8 },
      { name: 'Tiepolo', slug: 'giovanni-battista-tiepolo', priority: 7 },
      { name: 'Guardi', slug: 'francesco-guardi', priority: 6 },
      { name: 'Carracci', slug: 'annibale-carracci', priority: 7 },
      { name: 'Reni', slug: 'guido-reni', priority: 6 },
      { name: 'Domenichino', slug: 'domenichino', priority: 6 },
      { name: 'Correggio', slug: 'correggio', priority: 7 },
      { name: 'Parmigianino', slug: 'parmigianino', priority: 6 },
      
      // 러시아/동유럽
      { name: 'Repin', slug: 'ilya-repin', priority: 7 },
      { name: 'Aivazovsky', slug: 'ivan-aivazovsky', priority: 7 },
      { name: 'Shishkin', slug: 'ivan-shishkin', priority: 6 },
      { name: 'Levitan', slug: 'isaac-levitan', priority: 6 },
      { name: 'Kramskoi', slug: 'ivan-kramskoi', priority: 5 },
      
      // 스칸디나비아
      { name: 'Larsson', slug: 'carl-larsson', priority: 6 },
      { name: 'Zorn', slug: 'anders-zorn', priority: 7 },
      { name: 'Hammershøi', slug: 'vilhelm-hammershoi', priority: 7 },
      { name: 'Krøyer', slug: 'peder-severin-kroyer', priority: 6 },
      
      // 오리엔탈리즘 & 아카데미
      { name: 'Gérôme', slug: 'jean-leon-gerome', priority: 7 },
      { name: 'Ingres', slug: 'jean-auguste-dominique-ingres', priority: 8 },
      { name: 'Cabanel', slug: 'alexandre-cabanel', priority: 6 },
      { name: 'Meissonier', slug: 'jean-louis-ernest-meissonier', priority: 6 },
      { name: 'Bouguereau', slug: 'william-adolphe-bouguereau', priority: 7 },
      
      // 상징주의 추가
      { name: 'Puvis de Chavannes', slug: 'pierre-puvis-de-chavannes', priority: 6 },
      { name: 'Watts', slug: 'george-frederic-watts', priority: 5 },
      { name: 'Stuck', slug: 'franz-stuck', priority: 6 },
      { name: 'Hodler', slug: 'ferdinand-hodler', priority: 6 }
    ];

    // 카테고리별 수집도 병행
    const categories = [
      { url: 'https://artvee.com/c/mythology/', name: '신화' },
      { url: 'https://artvee.com/c/religion/', name: '종교화' },
      { url: 'https://artvee.com/c/historical/', name: '역사화' },
      { url: 'https://artvee.com/c/animals/', name: '동물화' },
      { url: 'https://artvee.com/c/botanical/', name: '식물화' },
      { url: 'https://artvee.com/c/marine/', name: '해양화' },
      { url: 'https://artvee.com/c/cityscapes/', name: '도시풍경' },
      { url: 'https://artvee.com/c/interiors/', name: '실내화' }
    ];

    // 작가별로 수집
    for (const artist of expandedArtists) {
      if (this.newArtworks.length >= targetCount) break;
      await this.collectFromArtist(artist);
      await this.sleep(this.delay);
    }

    // 부족하면 카테고리별로 추가
    if (this.newArtworks.length < targetCount) {
      for (const category of categories) {
        if (this.newArtworks.length >= targetCount) break;
        await this.collectFromCategory(category);
        await this.sleep(this.delay);
      }
    }

    console.log(`\n📊 이번 배치 수집 완료: ${this.newArtworks.length}개의 새로운 작품 발견\n`);
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
              category: 'artist-collection',
              importance: artist.priority >= 8 ? 'high' : artist.priority >= 6 ? 'medium' : 'normal'
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`  ⚠️ ${artist.name} - 페이지 없음`);
      } else {
        console.error(`  ❌ ${artist.name} 수집 실패:`, error.message);
      }
    }
  }

  async collectFromCategory(category) {
    try {
      console.log(`📂 ${category.name} 카테고리 검색 중...`);
      
      const response = await axios.get(category.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];

      $('.product, .artwork-item').each((i, elem) => {
        if (i >= 20) return false; // 각 카테고리에서 최대 20개
        
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
              category: category.name,
              importance: 'normal'
            });
          }
        }
      });

      console.log(`  → ${artworks.length}개 새 작품 발견`);
      this.newArtworks.push(...artworks);
      
    } catch (error) {
      console.error(`  ❌ ${category.name} 수집 실패:`, error.message);
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
      const importanceOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
      return (importanceOrder[b.importance] || 0) - (importanceOrder[a.importance] || 0);
    });

    for (let i = 0; i < sortedArtworks.length; i++) {
      const artwork = sortedArtworks[i];
      const progress = ((i + 1) / sortedArtworks.length * 100).toFixed(1);
      const totalCount = Object.keys(cloudinaryUrls).length;
      
      console.log(`\n[${i + 1}/${sortedArtworks.length}] (${progress}%) | 전체: ${totalCount}/1500`);
      console.log(`  제목: ${artwork.title}`);
      console.log(`  작가: ${artwork.artist}`);
      
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
                
                // 중간 저장 (5개마다)
                if (this.uploadedCount % 5 === 0) {
                  await fs.writeFile(
                    './data/cloudinary-urls.json',
                    JSON.stringify(cloudinaryUrls, null, 2)
                  );
                  const currentTotal = Object.keys(cloudinaryUrls).length;
                  console.log(`  💾 중간 저장 완료 (총 ${currentTotal}개)`);
                  
                  // 목표 달성 체크
                  if (currentTotal >= 1500) {
                    console.log(`\n🎉 목표 달성! 1,500개 수집 완료!`);
                    break;
                  }
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
        context: `title=${encodeURIComponent(artwork.title)}|artist=${encodeURIComponent(artwork.artist)}|importance=${artwork.importance}`
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
    const totalInCloudinary = this.existingArtworks.size + this.uploadedCount;
    
    const report = {
      timestamp: timestamp,
      summary: {
        starting_count: this.existingArtworks.size,
        found_new: this.newArtworks.length,
        processed: processedArtworks.length,
        uploaded: this.uploadedCount,
        skipped: this.skippedCount,
        errors: this.errorCount,
        total_in_cloudinary: totalInCloudinary,
        remaining_to_1500: Math.max(0, 1500 - totalInCloudinary)
      },
      progress: {
        current: totalInCloudinary,
        target: 1500,
        percentage: ((totalInCloudinary / 1500) * 100).toFixed(1)
      }
    };

    const reportPath = `./data/steady-progress-${timestamp.split('T')[0]}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 이번 배치 결과:');
    console.log(`  - 시작 시점: ${this.existingArtworks.size}개`);
    console.log(`  - 발견한 새 작품: ${this.newArtworks.length}개`);
    console.log(`  - 업로드 성공: ${this.uploadedCount}개`);
    console.log(`  - 현재 총 작품 수: ${totalInCloudinary}개`);
    console.log(`  - 진행률: ${report.progress.percentage}%`);
    console.log(`  - 1,500개까지 남은 수: ${report.summary.remaining_to_1500}개`);
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
  const collector = new SteadyCollector1500();
  
  try {
    await collector.initialize();
    
    const currentCount = collector.existingArtworks.size;
    if (currentCount >= 1500) {
      console.log('🎉 이미 1,500개 목표를 달성했습니다!');
      return;
    }
    
    // 배치로 나누어 수집 (안정성)
    const batchSize = 100;
    const remaining = 1500 - currentCount;
    const targetCount = Math.min(batchSize, remaining);
    
    await collector.collectFromArtvee(targetCount);
    
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