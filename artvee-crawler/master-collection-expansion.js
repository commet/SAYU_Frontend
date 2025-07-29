const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const crypto = require('crypto');
const FormData = require('form-data');
const sharp = require('sharp');
require('dotenv').config();

class MasterCollectionExpansion {
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
    this.delay = 2500; // 2.5초 딜레이
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    
    // 미술사 최고 거장들 - 확장된 목록
    this.masterArtists = [
      // 르네상스 3대 거장
      { name: 'Leonardo da Vinci', slug: 'leonardo-da-vinci', period: 'Renaissance', importance: 'legendary' },
      { name: 'Michelangelo', slug: 'michelangelo', period: 'Renaissance', importance: 'legendary' },
      { name: 'Raphael', slug: 'raphael', period: 'Renaissance', importance: 'legendary' },
      
      // 르네상스 기타 거장
      { name: 'Botticelli', slug: 'sandro-botticelli', period: 'Renaissance', importance: 'legendary' },
      { name: 'Titian', slug: 'titian', period: 'Renaissance', importance: 'legendary' },
      { name: 'Dürer', slug: 'albrecht-durer', period: 'Renaissance', importance: 'legendary' },
      { name: 'Giotto', slug: 'giotto', period: 'Medieval', importance: 'legendary' },
      
      // 바로크 거장
      { name: 'Rembrandt', slug: 'rembrandt', period: 'Baroque', importance: 'legendary' },
      { name: 'Vermeer', slug: 'johannes-vermeer', period: 'Baroque', importance: 'legendary' },
      { name: 'Rubens', slug: 'peter-paul-rubens', period: 'Baroque', importance: 'legendary' },
      { name: 'Poussin', slug: 'nicolas-poussin', period: 'Baroque', importance: 'legendary' },
      
      // 스페인 거장
      { name: 'Velázquez', slug: 'diego-velazquez', period: 'Baroque', importance: 'legendary' },
      { name: 'El Greco', slug: 'el-greco', period: 'Mannerism', importance: 'legendary' },
      { name: 'Goya', slug: 'francisco-goya', period: 'Romanticism', importance: 'legendary' },
      { name: 'Murillo', slug: 'bartolome-esteban-murillo', period: 'Baroque', importance: 'legendary' },
      
      // 프랑스 거장
      { name: 'David', slug: 'jacques-louis-david', period: 'Neoclassicism', importance: 'legendary' },
      { name: 'Ingres', slug: 'jean-auguste-dominique-ingres', period: 'Neoclassicism', importance: 'legendary' },
      { name: 'Delacroix', slug: 'eugene-delacroix', period: 'Romanticism', importance: 'legendary' },
      { name: 'Watteau', slug: 'antoine-watteau', period: 'Rococo', importance: 'legendary' },
      { name: 'Fragonard', slug: 'jean-honore-fragonard', period: 'Rococo', importance: 'legendary' },
      
      // 영국 거장
      { name: 'Turner', slug: 'j-m-w-turner', period: 'Romanticism', importance: 'legendary' },
      { name: 'Constable', slug: 'john-constable', period: 'Romanticism', importance: 'legendary' },
      { name: 'Gainsborough', slug: 'thomas-gainsborough', period: '18th Century', importance: 'legendary' },
      { name: 'Reynolds', slug: 'joshua-reynolds', period: '18th Century', importance: 'legendary' },
      
      // 인상주의 확장
      { name: 'Monet', slug: 'claude-monet', period: 'Impressionism', importance: 'legendary' },
      { name: 'Renoir', slug: 'pierre-auguste-renoir', period: 'Impressionism', importance: 'legendary' },
      { name: 'Degas', slug: 'edgar-degas', period: 'Impressionism', importance: 'legendary' },
      { name: 'Manet', slug: 'edouard-manet', period: 'Impressionism', importance: 'legendary' },
      { name: 'Pissarro', slug: 'camille-pissarro', period: 'Impressionism', importance: 'legendary' },
      { name: 'Sisley', slug: 'alfred-sisley', period: 'Impressionism', importance: 'legendary' },
      { name: 'Caillebotte', slug: 'gustave-caillebotte', period: 'Impressionism', importance: 'high' },
      { name: 'Morisot', slug: 'berthe-morisot', period: 'Impressionism', importance: 'high' },
      
      // 후기인상주의
      { name: 'Van Gogh', slug: 'vincent-van-gogh', period: 'Post-Impressionism', importance: 'legendary' },
      { name: 'Cézanne', slug: 'paul-cezanne', period: 'Post-Impressionism', importance: 'legendary' },
      { name: 'Gauguin', slug: 'paul-gauguin', period: 'Post-Impressionism', importance: 'legendary' },
      { name: 'Seurat', slug: 'georges-seurat', period: 'Post-Impressionism', importance: 'legendary' },
      { name: 'Toulouse-Lautrec', slug: 'henri-de-toulouse-lautrec', period: 'Post-Impressionism', importance: 'legendary' },
      { name: 'Signac', slug: 'paul-signac', period: 'Post-Impressionism', importance: 'high' },
      
      // 표현주의/상징주의
      { name: 'Munch', slug: 'edvard-munch', period: 'Expressionism', importance: 'legendary' },
      { name: 'Klimt', slug: 'gustav-klimt', period: 'Art Nouveau', importance: 'legendary' },
      { name: 'Schiele', slug: 'egon-schiele', period: 'Expressionism', importance: 'legendary' },
      { name: 'Kokoschka', slug: 'oskar-kokoschka', period: 'Expressionism', importance: 'high' },
      { name: 'Kirchner', slug: 'ernst-ludwig-kirchner', period: 'Expressionism', importance: 'high' },
      
      // 20세기 거장
      { name: 'Picasso', slug: 'pablo-picasso', period: 'Modern', importance: 'legendary' },
      { name: 'Matisse', slug: 'henri-matisse', period: 'Modern', importance: 'legendary' },
      { name: 'Braque', slug: 'georges-braque', period: 'Cubism', importance: 'legendary' },
      { name: 'Léger', slug: 'fernand-leger', period: 'Modern', importance: 'high' },
      { name: 'Miró', slug: 'joan-miro', period: 'Surrealism', importance: 'legendary' },
      { name: 'Dalí', slug: 'salvador-dali', period: 'Surrealism', importance: 'legendary' },
      { name: 'Magritte', slug: 'rene-magritte', period: 'Surrealism', importance: 'legendary' },
      { name: 'Chagall', slug: 'marc-chagall', period: 'Modern', importance: 'legendary' },
      { name: 'Modigliani', slug: 'amedeo-modigliani', period: 'Modern', importance: 'legendary' },
      
      // 추상/현대
      { name: 'Kandinsky', slug: 'wassily-kandinsky', period: 'Abstract', importance: 'legendary' },
      { name: 'Mondrian', slug: 'piet-mondrian', period: 'Abstract', importance: 'legendary' },
      { name: 'Klee', slug: 'paul-klee', period: 'Abstract', importance: 'legendary' },
      { name: 'Rothko', slug: 'mark-rothko', period: 'Abstract Expressionism', importance: 'legendary' },
      { name: 'Pollock', slug: 'jackson-pollock', period: 'Abstract Expressionism', importance: 'legendary' },
      { name: "O'Keeffe", slug: 'georgia-okeeffe', period: 'American Modernism', importance: 'legendary' },
      { name: 'Hopper', slug: 'edward-hopper', period: 'American Realism', importance: 'legendary' },
      { name: 'de Kooning', slug: 'willem-de-kooning', period: 'Abstract Expressionism', importance: 'legendary' },
      
      // 현대 거장
      { name: 'Warhol', slug: 'andy-warhol', period: 'Pop Art', importance: 'legendary' },
      { name: 'Lichtenstein', slug: 'roy-lichtenstein', period: 'Pop Art', importance: 'high' },
      { name: 'Basquiat', slug: 'jean-michel-basquiat', period: 'Contemporary', importance: 'legendary' },
      { name: 'Hockney', slug: 'david-hockney', period: 'Contemporary', importance: 'legendary' },
      { name: 'Bacon', slug: 'francis-bacon', period: 'Contemporary', importance: 'legendary' },
      { name: 'Freud', slug: 'lucian-freud', period: 'Contemporary', importance: 'high' }
    ];
  }

  async initialize() {
    console.log('🎨 Master Collection Expansion - 미술사 거장들 대규모 수집\n');
    console.log(`📋 목표: ${this.masterArtists.length}명의 거장들로부터 고품질 작품 수집\n`);
    
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

  async collectMasterpieces(targetCount = 200) {
    console.log(`🔍 ${targetCount}개의 걸작 수집 시작...\n`);
    
    // 중요도순으로 정렬 (legendary > high)
    const sortedArtists = [...this.masterArtists].sort((a, b) => {
      if (a.importance === 'legendary' && b.importance !== 'legendary') return -1;
      if (a.importance !== 'legendary' && b.importance === 'legendary') return 1;
      return Math.random() - 0.5; // 같은 중요도면 랜덤
    });

    // 작가별 수집
    for (const artist of sortedArtists) {
      if (this.newArtworks.length >= targetCount) break;
      
      console.log(`👨‍🎨 ${artist.name} (${artist.period}) - ${artist.importance} 중요도`);
      await this.collectFromMasterArtist(artist);
      await this.sleep(this.delay);
      
      // 진행상황 표시
      const progress = Math.min(100, (this.newArtworks.length / targetCount * 100)).toFixed(1);
      console.log(`   📊 진행률: ${progress}% (${this.newArtworks.length}/${targetCount})\n`);
    }

    // 추가 다양성 확보 - 주제별 수집
    if (this.newArtworks.length < targetCount) {
      await this.collectDiverseWorks(targetCount - this.newArtworks.length);
    }

    console.log(`\n🎯 수집 완료: ${this.newArtworks.length}개의 걸작 발견!`);
    
    // 수집 통계
    this.printCollectionStats();
  }

  async collectFromMasterArtist(artist) {
    try {
      // 다양한 URL 패턴 시도
      const urlPatterns = [
        `https://artvee.com/artist/${artist.slug}/`,
        `https://artvee.com/artist/${artist.slug.replace('-', '')}/`,
        `https://artvee.com/a/${artist.slug}/`,
        `https://artvee.com/search/?s=${encodeURIComponent(artist.name)}`
      ];

      let artworks = [];
      for (const url of urlPatterns) {
        try {
          artworks = await this.scrapeArtistPage(url, artist);
          if (artworks.length > 0) break;
        } catch (error) {
          continue; // 다음 패턴 시도
        }
      }

      if (artworks.length > 0) {
        console.log(`   → ${artworks.length}개 새 작품 발견`);
        this.newArtworks.push(...artworks);
      } else {
        console.log(`   ⚠️ 작품을 찾을 수 없음`);
      }
      
    } catch (error) {
      console.error(`   ❌ ${artist.name} 수집 실패:`, error.message);
    }
  }

  async scrapeArtistPage(url, artist) {
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const artworks = [];

    // 다양한 선택자로 작품 찾기
    const selectors = [
      '.product',
      '.artwork-item', 
      'article.product',
      '.gallery-item',
      '.artwork',
      '.post'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        const $elem = $(elem);
        const link = $elem.find('a').first();
        const artworkUrl = link.attr('href');
        
        // 제목 추출
        const title = $elem.find('.product-title, h2, h3, .title, .artwork-title').first().text().trim() ||
                     link.attr('title') || 
                     $elem.find('img').attr('alt') || '';
        
        if (artworkUrl && title && title.length > 3) {
          const artworkId = this.extractArtworkId(artworkUrl);
          
          // 중복 체크
          if (!this.existingArtworks.has(artworkId) && 
              !this.newArtworks.find(a => a.id === artworkId)) {
            
            artworks.push({
              id: artworkId,
              url: artworkUrl.startsWith('http') ? artworkUrl : `https://artvee.com${artworkUrl}`,
              title: title,
              artist: artist.name,
              period: artist.period,
              importance: artist.importance,
              category: 'master-collection'
            });
          }
        }
      });
      
      if (artworks.length > 0) break; // 작품을 찾으면 다른 선택자는 시도하지 않음
    }

    return artworks;
  }

  async collectDiverseWorks(remaining) {
    console.log(`🌍 다양성 확보를 위한 추가 수집 (${remaining}개)...\n`);
    
    const diverseCategories = [
      { type: 'subject', value: 'mythology', name: '신화화' },
      { type: 'subject', value: 'religious', name: '종교화' },
      { type: 'subject', value: 'historical', name: '역사화' },
      { type: 'subject', value: 'genre', name: '풍속화' },
      { type: 'category', value: 'sculpture', name: '조각' },
      { type: 'category', value: 'manuscript', name: '필사본' },
      { type: 'category', value: 'prints', name: '판화' },
      { type: 'period', value: 'medieval', name: '중세' },
      { type: 'period', value: 'gothic', name: '고딕' },
      { type: 'period', value: 'oriental', name: '동양화' }
    ];

    for (const category of diverseCategories) {
      if (this.newArtworks.length >= this.newArtworks.length + remaining) break;
      
      console.log(`🎨 ${category.name} 수집 중...`);
      await this.collectByCategory(category);
      await this.sleep(this.delay);
    }
  }

  async collectByCategory(category) {
    try {
      let url;
      switch (category.type) {
        case 'subject':
          url = `https://artvee.com/s/${category.value}/`;
          break;
        case 'category':
          url = `https://artvee.com/c/${category.value}/`;
          break;
        case 'period':
          url = `https://artvee.com/p/${category.value}/`;
          break;
      }

      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
              category: category.value,
              importance: 'medium',
              source: category.type
            });
          }
        }
      });

      console.log(`   → ${artworks.length}개 작품 발견`);
      this.newArtworks.push(...artworks);
      
    } catch (error) {
      console.error(`   ❌ ${category.name} 수집 실패:`, error.message);
    }
  }

  printCollectionStats() {
    console.log('\n📊 수집 통계:');
    
    // 중요도별 통계
    const byImportance = {};
    const byPeriod = {};
    const byArtist = {};
    
    this.newArtworks.forEach(artwork => {
      const importance = artwork.importance || 'medium';
      const period = artwork.period || 'Unknown';
      const artist = artwork.artist || 'Unknown';
      
      byImportance[importance] = (byImportance[importance] || 0) + 1;
      byPeriod[period] = (byPeriod[period] || 0) + 1;
      byArtist[artist] = (byArtist[artist] || 0) + 1;
    });
    
    console.log('\n🏆 중요도별:');
    Object.entries(byImportance)
      .sort((a, b) => b[1] - a[1])
      .forEach(([importance, count]) => {
        console.log(`   ${importance}: ${count}개`);
      });
    
    console.log('\n🕰️ 시대별:');
    Object.entries(byPeriod)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([period, count]) => {
        console.log(`   ${period}: ${count}개`);
      });
    
    console.log('\n👨‍🎨 작가별 (상위 15명):');
    Object.entries(byArtist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([artist, count]) => {
        console.log(`   ${artist}: ${count}개`);
      });
  }

  async downloadAndUploadMasterpieces() {
    console.log('\n📥 걸작들 다운로드 및 Cloudinary 업로드 시작...\n');
    
    const cloudinaryUrls = {};
    
    // 기존 데이터 로드
    try {
      const existing = await fs.readFile('./data/cloudinary-urls.json', 'utf8');
      Object.assign(cloudinaryUrls, JSON.parse(existing));
    } catch (error) {
      // 파일이 없으면 새로 시작
    }

    // 중요도순으로 정렬하여 처리
    const sortedArtworks = this.newArtworks.sort((a, b) => {
      const importanceOrder = { 'legendary': 3, 'high': 2, 'medium': 1 };
      return (importanceOrder[b.importance] || 1) - (importanceOrder[a.importance] || 1);
    });

    // 배치 처리 (150개까지)
    const batchSize = Math.min(sortedArtworks.length, 150);
    const selectedArtworks = sortedArtworks.slice(0, batchSize);

    console.log(`🎯 ${batchSize}개 작품 처리 시작 (중요도 순)\n`);

    for (let i = 0; i < selectedArtworks.length; i++) {
      const artwork = selectedArtworks[i];
      const progress = ((i + 1) / selectedArtworks.length * 100).toFixed(1);
      
      console.log(`\n[${i + 1}/${selectedArtworks.length}] (${progress}%) 처리 중...`);
      console.log(`  🎨 제목: ${artwork.title}`);
      console.log(`  👨‍🎨 작가: ${artwork.artist} (${artwork.period || 'Unknown'})`);
      console.log(`  ⭐ 중요도: ${artwork.importance || 'medium'}`);
      
      try {
        // 상세 페이지에서 고화질 이미지 URL 추출
        const imageInfo = await this.extractDetailedImageInfo(artwork.url);
        
        if (imageInfo && imageInfo.imageUrl) {
          // 이미지 다운로드 및 처리
          const imageBuffer = await this.downloadImage(imageInfo.imageUrl);
          
          if (imageBuffer) {
            const processedBuffer = await this.processImage(imageBuffer, artwork);
            
            if (processedBuffer) {
              // Cloudinary에 업로드
              const uploadResult = await this.uploadToCloudinary(processedBuffer, artwork, imageInfo);
              
              if (uploadResult) {
                cloudinaryUrls[artwork.id] = uploadResult;
                this.uploadedCount++;
                console.log(`  ✅ 업로드 완료!`);
                
                // 중간 저장 (10개마다)
                if (this.uploadedCount % 10 === 0) {
                  await fs.writeFile(
                    './data/cloudinary-urls.json',
                    JSON.stringify(cloudinaryUrls, null, 2)
                  );
                  console.log(`  💾 중간 저장 완료 (총 ${Object.keys(cloudinaryUrls).length}개)`);
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

    // 최종 보고서 작성
    await this.generateFinalReport(selectedArtworks);
  }

  // 나머지 메서드들은 이전 버전과 동일...
  async downloadImage(imageUrl) {
    try {
      console.log(`    📥 이미지 다운로드 중...`);
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const buffer = Buffer.from(response.data);
      console.log(`    📏 원본 크기: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      return buffer;
    } catch (error) {
      console.error(`    ⚠️ 다운로드 실패:`, error.message);
      return null;
    }
  }

  async processImage(buffer, artwork) {
    try {
      // 10MB 이하면 그대로 사용
      if (buffer.length <= this.maxFileSize) {
        return buffer;
      }
      
      console.log(`    🔧 이미지 최적화 중 (10MB 이하로 조정)...`);
      
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
      
      console.log(`    ✨ 최적화 완료: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      return processedBuffer;
      
    } catch (error) {
      console.error(`    ⚠️ 이미지 처리 실패:`, error.message);
      return null;
    }
  }

  async uploadToCloudinary(imageBuffer, artwork, imageInfo) {
    try {
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `sayu/artvee/masters/${artwork.id}`;
      
      const params = {
        public_id: publicId,
        timestamp: timestamp,
        folder: 'sayu/artvee/masters',
        tags: `artvee,master,${artwork.importance},${artwork.period?.toLowerCase().replace(/\s+/g, '-')}`,
        context: `title=${encodeURIComponent(artwork.title)}|artist=${encodeURIComponent(artwork.artist)}|period=${encodeURIComponent(artwork.period || '')}|importance=${artwork.importance}`
      };
      
      const signature = this.generateCloudinarySignature(params);
      
      const formData = new FormData();
      formData.append('file', base64Image);
      formData.append('api_key', this.cloudinaryConfig.api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('folder', 'sayu/artvee/masters');
      formData.append('tags', params.tags);
      formData.append('context', params.context);
      
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
          period: artwork.period,
          importance: artwork.importance,
          category: artwork.category,
          source: 'artvee-masters',
          ...imageInfo.metadata
        }
      };
    } catch (error) {
      console.error(`    ⚠️ Cloudinary 업로드 실패:`, error.message);
      return null;
    }
  }

  async extractDetailedImageInfo(artworkUrl) {
    try {
      const response = await axios.get(artworkUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
      
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://artvee.com${imageUrl}`;
      }
      
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
      console.error(`    ⚠️ 상세 페이지 로드 실패:`, error.message);
      return null;
    }
  }

  generateCloudinarySignature(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + this.cloudinaryConfig.api_secret)
      .digest('hex');
    
    return signature;
  }

  async generateFinalReport(processedArtworks) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp: timestamp,
      expansion_summary: {
        target_masters: this.masterArtists.length,
        existing_before: this.existingArtworks.size,
        found_new: this.newArtworks.length,
        processed: processedArtworks.length,
        uploaded: this.uploadedCount,
        skipped: this.skippedCount,
        errors: this.errorCount,
        total_after: this.existingArtworks.size + this.uploadedCount
      },
      by_importance: {},
      by_period: {},
      by_artist: {},
      legendary_artworks: [],
      processed_artworks: processedArtworks
    };

    // 통계 계산
    processedArtworks.forEach(artwork => {
      const importance = artwork.importance || 'medium';
      const period = artwork.period || 'Unknown';
      const artist = artwork.artist || 'Unknown';
      
      report.by_importance[importance] = (report.by_importance[importance] || 0) + 1;
      report.by_period[period] = (report.by_period[period] || 0) + 1;
      report.by_artist[artist] = (report.by_artist[artist] || 0) + 1;
      
      if (importance === 'legendary') {
        report.legendary_artworks.push({
          title: artwork.title,
          artist: artwork.artist,
          period: artwork.period
        });
      }
    });

    const reportPath = `./data/master-expansion-report-${timestamp.split('T')[0]}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n🏆 MASTER COLLECTION EXPANSION 완료!');
    console.log('=====================================');
    console.log(`📊 총 수집 현황:`);
    console.log(`   - 확장 전: ${this.existingArtworks.size}개`);
    console.log(`   - 새로 발견: ${this.newArtworks.length}개`);
    console.log(`   - 처리 완료: ${processedArtworks.length}개`);
    console.log(`   - 업로드 성공: ${this.uploadedCount}개`);
    console.log(`   - 확장 후 총계: ${this.existingArtworks.size + this.uploadedCount}개`);
    
    console.log(`\n🏆 중요도별 성과:`);
    Object.entries(report.by_importance)
      .sort((a, b) => {
        const order = { 'legendary': 3, 'high': 2, 'medium': 1 };
        return (order[b[0]] || 1) - (order[a[0]] || 1);
      })
      .forEach(([importance, count]) => {
        const emoji = importance === 'legendary' ? '👑' : importance === 'high' ? '⭐' : '📋';
        console.log(`   ${emoji} ${importance}: ${count}개`);
      });
    
    console.log(`\n🕰️ 시대별 대표작:`);
    Object.entries(report.by_period)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([period, count]) => {
        console.log(`   ${period}: ${count}개`);
      });
    
    console.log(`\n📄 상세 보고서: ${reportPath}`);
    console.log(`🎨 미술사 거장들의 걸작이 SAYU 컬렉션에 추가되었습니다!`);
  }

  extractArtworkId(url) {
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
  const collector = new MasterCollectionExpansion();
  
  try {
    await collector.initialize();
    
    // 명령줄 인자로 수집 개수 지정 가능 (기본 150개)
    const targetCount = process.argv[2] ? parseInt(process.argv[2]) : 150;
    
    await collector.collectMasterpieces(targetCount);
    
    if (collector.newArtworks.length > 0) {
      await collector.downloadAndUploadMasterpieces();
    } else {
      console.log('✨ 새로운 걸작이 없습니다. 모든 거장들의 작품이 이미 수집되었습니다.');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

main().catch(console.error);