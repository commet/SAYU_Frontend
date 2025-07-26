const { pool } = require('../config/database');
const Redis = require('ioredis');
const { log } = require('../config/logger');
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fetch = require('node-fetch');
const EventEmitter = require('events');

class ArtveeService extends EventEmitter {
  constructor() {
    super();
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (error) => {
          log.error('Redis error in Artvee service:', error);
          this.redis = null;
        });
      } catch (error) {
        log.warn('Redis connection failed in Artvee service, running without cache:', error.message);
        this.redis = null;
      }
    } else {
      this.redis = null;
      log.warn('Artvee service running without Redis cache - REDIS_URL not configured');
    }
    this.browser = null;
    this.baseUrl = 'https://artvee.com';
    this.initializeService();
  }

  async initializeService() {
    try {
      if (this.redis) {
        await this.redis.ping();
        log.info('Artvee service initialized with Redis');
      } else {
        log.info('Artvee service initialized without Redis (cache disabled)');
      }
      
      // Skip browser initialization for basic queries
      // await this.initializeBrowser();
    } catch (error) {
      log.error('Artvee service initialization failed:', error);
      this.redis = null;
    }
  }

  async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      log.info('Artvee browser initialized');
    } catch (error) {
      log.error('Browser initialization failed:', error);
    }
  }

  // 카테고리별 아트웍 수집
  async collectByCategory(category, limit = 50) {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser.newPage();
    const artworks = [];

    try {
      const categoryUrl = `${this.baseUrl}/category/${category}/`;
      log.info(`Collecting artworks from: ${categoryUrl}`);

      await page.goto(categoryUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // 무한 스크롤 처리
      await this.autoScroll(page, limit);

      // 아트웍 링크 추출
      const artworkLinks = await page.evaluate(() => {
        const links = [];
        const items = document.querySelectorAll('.item-image a, .product a, .artwork-item a');
        
        items.forEach(item => {
          const href = item.href;
          const img = item.querySelector('img');
          const title = img?.alt || img?.title || '';
          
          if (href && href.includes('/artwork/')) {
            links.push({
              url: href,
              thumbnailUrl: img?.src || '',
              title: title
            });
          }
        });
        
        return links;
      });

      log.info(`Found ${artworkLinks.length} artwork links`);

      // 각 작품 상세 정보 수집
      for (let i = 0; i < Math.min(artworkLinks.length, limit); i++) {
        const link = artworkLinks[i];
        
        try {
          const artwork = await this.collectArtworkDetail(link.url);
          if (artwork) {
            artwork.thumbnailUrl = link.thumbnailUrl;
            artwork.category = category;
            artworks.push(artwork);
          }
          
          // Rate limiting
          await this.delay(2000);
        } catch (error) {
          log.error(`Failed to collect artwork ${link.url}:`, error);
        }
      }

      log.info(`Collected ${artworks.length} artworks from ${category}`);
      return artworks;

    } catch (error) {
      log.error(`Category collection error for ${category}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  // 아트웍 상세 정보 수집
  async collectArtworkDetail(url) {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser.newPage();

    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const artwork = await page.evaluate(() => {
        const getTextContent = (selector) => 
          document.querySelector(selector)?.textContent?.trim() || '';

        const getAttributeContent = (selector, attribute) =>
          document.querySelector(selector)?.getAttribute(attribute) || '';

        // 기본 정보 추출
        const title = getTextContent('h1, .artwork-title, .product-title');
        const artist = getTextContent('.artist-name, .product-artist, .artwork-artist');
        const year = getTextContent('.artwork-year, .product-year, .year');
        const medium = getTextContent('.medium, .artwork-medium, .product-medium');
        const dimensions = getTextContent('.dimensions, .artwork-dimensions, .size');
        const description = getTextContent('.description, .artwork-description, .product-description');
        
        // 이미지 URL 추출
        const imageSelectors = [
          '.artwork-image img',
          '.product-image img', 
          '.main-image img',
          '.hero-image img',
          'img[alt*="artwork"]',
          'img[src*="artvee"]'
        ];
        
        let imageUrl = '';
        let downloadUrl = '';
        
        for (const selector of imageSelectors) {
          const img = document.querySelector(selector);
          if (img && img.src) {
            imageUrl = img.src;
            break;
          }
        }
        
        // 다운로드 링크 찾기
        const downloadLink = document.querySelector('a[href*="download"], .download-btn, .download-link');
        if (downloadLink) {
          downloadUrl = downloadLink.href;
        }

        // 박물관/컬렉션 정보
        const museum = getTextContent('.museum, .collection, .source-museum');

        return {
          title: title || 'Untitled',
          artist: artist || 'Unknown Artist',
          year_created: year,
          medium,
          dimensions,
          description,
          imageUrl,
          downloadUrl,
          source_museum: museum
        };
      });

      // URL에서 Artvee ID 추출
      const urlParts = url.split('/');
      artwork.artveeId = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
      artwork.artveeUrl = url;

      // 추가 메타데이터 생성
      artwork.period = this.inferPeriod(artwork.artist, artwork.year_created);
      artwork.style = this.inferStyle(artwork.title, artwork.description);
      artwork.genre = this.inferGenre(artwork.title, artwork.description);

      return artwork;

    } catch (error) {
      log.error(`Artwork detail collection error for ${url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  // 이미지 처리 및 저장
  async processAndUploadImage(artwork) {
    try {
      if (!artwork.imageUrl && !artwork.downloadUrl) {
        log.warn(`No image URL for artwork: ${artwork.title}`);
        return artwork;
      }

      const imageUrl = artwork.downloadUrl || artwork.imageUrl;
      log.info(`Processing image: ${imageUrl}`);

      // 이미지 다운로드
      const imageBuffer = await this.downloadImage(imageUrl);
      if (!imageBuffer) {
        log.warn(`Failed to download image: ${imageUrl}`);
        return artwork;
      }

      // 다양한 크기로 최적화
      const sizes = {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1920, height: 1080 }
      };

      const processedImages = {};

      for (const [size, dimensions] of Object.entries(sizes)) {
        try {
          const processed = await sharp(imageBuffer)
            .resize(dimensions.width, dimensions.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: 85 })
            .toBuffer();

          // 실제 구현에서는 CDN 업로드 (Cloudinary, AWS S3 등)
          const uploadResult = await this.uploadToCDN(processed, {
            folder: `artvee/${size}`,
            public_id: `${artwork.artveeId}_${size}`,
            format: 'webp'
          });

          processedImages[size] = uploadResult.secure_url;
        } catch (processError) {
          log.error(`Image processing error for size ${size}:`, processError);
        }
      }

      // 색상 팔레트 추출
      const colorPalette = await this.extractColorPalette(imageBuffer);

      return {
        ...artwork,
        cdn_url: processedImages.large,
        thumbnail_url: processedImages.thumbnail,
        medium_url: processedImages.medium,
        color_palette: colorPalette
      };

    } catch (error) {
      log.error('Image processing error:', error);
      return artwork;
    }
  }

  // 성격 유형별 아트웍 매핑
  async mapArtworksToPersonalities() {
    try {
      log.info('Starting personality mapping process...');

      // 모든 아트웍 조회
      const artworksQuery = `
        SELECT id, title, artist, period, style, genre, description, color_palette
        FROM artvee_artworks 
        WHERE personality_tags IS NULL OR array_length(personality_tags, 1) = 0
        LIMIT 1000
      `;

      const result = await pool.query(artworksQuery);
      const artworks = result.rows;

      log.info(`Processing ${artworks.length} artworks for personality mapping`);

      for (const artwork of artworks) {
        const personalityTags = this.generatePersonalityTags(artwork);
        const emotionTags = this.generateEmotionTags(artwork);
        const usageTags = this.generateUsageTags(artwork);

        // 데이터베이스 업데이트
        await pool.query(`
          UPDATE artvee_artworks 
          SET personality_tags = $1, emotion_tags = $2, usage_tags = $3, updated_at = NOW()
          WHERE id = $4
        `, [personalityTags, emotionTags, usageTags, artwork.id]);
      }

      log.info('Personality mapping completed');
      
      // 성격 유형별 대표 작품 설정
      await this.updatePersonalityArtworkMappings();

    } catch (error) {
      log.error('Personality mapping error:', error);
      throw error;
    }
  }

  // SAYU 태그 생성
  generatePersonalityTags(artwork) {
    const tags = [];

    // 성격 유형별 매핑
    const personalityMappings = {
      'LAEF': { // 꿈꾸는 예술가
        periods: ['Impressionism', 'Romanticism', 'Symbolism'],
        styles: ['dreamy', 'soft', 'ethereal'],
        keywords: ['dream', 'mist', 'light', 'nature', 'emotion']
      },
      'SRMC': { // 체계적 큐레이터  
        periods: ['Renaissance', 'Neoclassicism', 'Academic'],
        styles: ['precise', 'detailed', 'classical'],
        keywords: ['structure', 'balance', 'harmony', 'order', 'classical']
      },
      'GREF': { // 혁신적 탐험가
        periods: ['Expressionism', 'Fauvism', 'Abstract'],
        styles: ['bold', 'vibrant', 'experimental'],
        keywords: ['bold', 'color', 'expression', 'energy', 'innovation']
      },
      'CREF': { // 창조적 실험가
        periods: ['Surrealism', 'Dadaism', 'Contemporary'],
        styles: ['unique', 'unconventional', 'thought-provoking'],
        keywords: ['surreal', 'abstract', 'conceptual', 'experimental', 'unique']
      }
    };

    const text = `${artwork.title} ${artwork.description || ''}`.toLowerCase();

    for (const [personality, criteria] of Object.entries(personalityMappings)) {
      let score = 0;

      // 시대 매칭
      if (criteria.periods.some(period => artwork.period?.includes(period))) {
        score += 3;
      }

      // 스타일 매칭
      if (criteria.styles.some(style => text.includes(style))) {
        score += 2;
      }

      // 키워드 매칭
      const keywordMatches = criteria.keywords.filter(keyword => text.includes(keyword));
      score += keywordMatches.length;

      // 임계값을 넘으면 태그 추가
      if (score >= 2) {
        tags.push(personality);
      }
    }

    return tags;
  }

  generateEmotionTags(artwork) {
    const emotionKeywords = {
      serene: ['peaceful', 'calm', 'tranquil', 'quiet', 'gentle'],
      dramatic: ['dark', 'storm', 'battle', 'intense', 'powerful'],
      joyful: ['bright', 'celebration', 'dance', 'happy', 'colorful'],
      melancholic: ['sad', 'lonely', 'blue', 'somber', 'contemplative'],
      energetic: ['movement', 'dynamic', 'active', 'vibrant', 'lively']
    };

    const text = `${artwork.title} ${artwork.description || ''}`.toLowerCase();
    const tags = [];

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(emotion);
      }
    }

    // 색상 기반 감정 추론
    if (artwork.color_palette) {
      const dominantColors = artwork.color_palette.dominant || [];
      
      if (dominantColors.includes('blue') || dominantColors.includes('green')) {
        tags.push('serene');
      }
      if (dominantColors.includes('red') || dominantColors.includes('orange')) {
        tags.push('energetic');
      }
      if (dominantColors.includes('gray') || dominantColors.includes('black')) {
        tags.push('melancholic');
      }
    }

    return [...new Set(tags)]; // 중복 제거
  }

  generateUsageTags(artwork) {
    const tags = [];

    // 장르 기반 사용 용도
    if (artwork.genre === 'Landscape') tags.push('quiz_bg', 'meditation');
    if (artwork.genre === 'Portrait') tags.push('personality_result', 'profile_bg');
    if (artwork.genre === 'Still Life') tags.push('card_bg', 'decoration');
    if (artwork.genre === 'Abstract') tags.push('loading_screen', 'background');

    // 색상 기반 사용 용도
    if (artwork.color_palette?.dominant) {
      tags.push('card_bg');
    }

    // 크기/구도 기반 사용 용도
    if (artwork.dimensions) {
      if (artwork.dimensions.includes('wide') || artwork.dimensions.includes('horizontal')) {
        tags.push('banner', 'header_bg');
      }
      if (artwork.dimensions.includes('square')) {
        tags.push('avatar', 'icon');
      }
    }

    return tags;
  }

  // 아트웍 저장
  async saveArtwork(artworkData) {
    try {
      const query = `
        INSERT INTO artvee_artworks (
          artvee_id, title, artist, year_created, period, style, genre, medium,
          artvee_url, cdn_url, thumbnail_url, personality_tags, emotion_tags,
          color_palette, usage_tags, source_museum, dimensions, description,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
          NOW(), NOW()
        )
        ON CONFLICT (artvee_id) 
        DO UPDATE SET
          cdn_url = $10,
          thumbnail_url = $11,
          personality_tags = $12,
          emotion_tags = $13,
          color_palette = $14,
          usage_tags = $15,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        artworkData.artveeId,
        artworkData.title || 'Untitled',
        artworkData.artist || 'Unknown Artist',
        artworkData.year_created,
        artworkData.period,
        artworkData.style,
        artworkData.genre,
        artworkData.medium,
        artworkData.artveeUrl,
        artworkData.cdn_url,
        artworkData.thumbnail_url,
        artworkData.personality_tags || [],
        artworkData.emotion_tags || [],
        artworkData.color_palette ? JSON.stringify(artworkData.color_palette) : null,
        artworkData.usage_tags || [],
        artworkData.source_museum,
        artworkData.dimensions,
        artworkData.description
      ];

      const result = await pool.query(query, values);
      log.info(`Artwork saved: ${artworkData.title}`);

      return result.rows[0];
    } catch (error) {
      log.error('Artwork save error:', error);
      throw error;
    }
  }

  // 성격 유형별 아트웍 조회
  async getArtworksForPersonality(personalityType, options = {}) {
    const { limit = 10, usageType = null, emotionFilter = null } = options;

    try {
      let query = `
        SELECT * FROM artvee_artworks
        WHERE sayu_type = $1
      `;
      
      const queryParams = [personalityType];
      let paramCount = 1;

      if (usageType) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(usage_tags)`;
        queryParams.push(usageType);
      }

      if (emotionFilter) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(emotion_tags)`;
        queryParams.push(emotionFilter);
      }

      query += ` ORDER BY RANDOM() LIMIT $${paramCount + 1}`;
      queryParams.push(limit);

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      log.error('Personality artworks query error:', error);
      throw error;
    }
  }

  // 헬퍼 메소드들
  async autoScroll(page, maxItems) {
    await page.evaluate(async (maxItems) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const maxScrollTime = 30000; // 30초 최대 타임아웃
        const startTime = Date.now();
        
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          const currentItems = document.querySelectorAll('.item-image, .product, .artwork-item').length;
          const elapsedTime = Date.now() - startTime;

          // 종료 조건: 스크롤 끝, 최대 아이템 수 도달, 또는 타임아웃
          if (totalHeight >= scrollHeight || currentItems >= maxItems || elapsedTime >= maxScrollTime) {
            clearInterval(timer);
            if (elapsedTime >= maxScrollTime) {
              console.warn('⚠️ AutoScroll 타임아웃 (30초)');
            }
            resolve();
          }
        }, 100);
      });
    }, maxItems);
  }

  async downloadImage(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.buffer();
    } catch (error) {
      log.error(`Image download error for ${url}:`, error);
      return null;
    }
  }

  async extractColorPalette(imageBuffer) {
    try {
      const { dominant } = await sharp(imageBuffer).stats();
      
      // 간단한 색상 분석
      const colors = {
        dominant: this.rgbToColorName(dominant.r, dominant.g, dominant.b),
        palette: [
          { r: dominant.r, g: dominant.g, b: dominant.b }
        ]
      };

      return colors;
    } catch (error) {
      log.error('Color extraction error:', error);
      return null;
    }
  }

  rgbToColorName(r, g, b) {
    // 간단한 색상 이름 매핑
    if (r > 200 && g > 200 && b > 200) return 'white';
    if (r < 50 && g < 50 && b < 50) return 'black';
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    if (r > 150 && g > 150 && b < 100) return 'yellow';
    return 'mixed';
  }

  async uploadToCDN(buffer, options) {
    // 실제 구현에서는 Cloudinary, AWS S3 등 사용
    // 여기서는 더미 응답 반환
    return {
      secure_url: `https://cdn.sayu.art/${options.public_id}.${options.format || 'webp'}`
    };
  }

  inferPeriod(artist, year) {
    const periods = {
      'Renaissance': [1400, 1600],
      'Baroque': [1600, 1750],
      'Neoclassicism': [1750, 1850],
      'Romanticism': [1800, 1850],
      'Impressionism': [1860, 1890],
      'Post-Impressionism': [1880, 1905],
      'Modern': [1900, 1945],
      'Contemporary': [1945, 2024]
    };

    if (year) {
      const yearNum = parseInt(year);
      for (const [period, [start, end]] of Object.entries(periods)) {
        if (yearNum >= start && yearNum <= end) {
          return period;
        }
      }
    }

    // 작가 이름으로 추론
    const artistPeriods = {
      'Monet': 'Impressionism',
      'Van Gogh': 'Post-Impressionism',
      'Picasso': 'Modern',
      'Leonardo': 'Renaissance'
    };

    for (const [artistName, period] of Object.entries(artistPeriods)) {
      if (artist?.includes(artistName)) {
        return period;
      }
    }

    return 'Unknown';
  }

  inferStyle(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('abstract')) return 'Abstract';
    if (text.includes('realistic') || text.includes('portrait')) return 'Realism';
    if (text.includes('landscape')) return 'Landscape';
    if (text.includes('still life')) return 'Still Life';
    
    return 'Unknown';
  }

  inferGenre(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('portrait')) return 'Portrait';
    if (text.includes('landscape')) return 'Landscape';
    if (text.includes('still life')) return 'Still Life';
    if (text.includes('abstract')) return 'Abstract';
    if (text.includes('religious')) return 'Religious';
    
    return 'Unknown';
  }

  async updatePersonalityArtworkMappings() {
    const personalities = ['LAEF', 'SRMC', 'GREF', 'CREF'];
    
    for (const personality of personalities) {
      const artworks = await this.getArtworksForPersonality(personality, { limit: 20 });
      
      if (artworks.length > 0) {
        const primaryArtworks = artworks.slice(0, 5).map(a => a.id);
        
        await pool.query(`
          INSERT INTO personality_artwork_mapping (personality_type, primary_artworks, created_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (personality_type)
          DO UPDATE SET primary_artworks = $2, created_at = NOW()
        `, [personality, primaryArtworks]);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        log.warn('Redis close failed:', error.message);
      }
    }
  }
}

module.exports = new ArtveeService();