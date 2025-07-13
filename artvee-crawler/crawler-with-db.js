const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
const pLimit = require('p-limit');
require('dotenv').config();

/**
 * 데이터베이스 연동 크롤러
 * URL 수집된 작품들의 상세 정보를 크롤링하여 DB에 직접 저장
 */

class ArtveeDBCrawler {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.delay = parseInt(process.env.DELAY_MS) || 2500;
    this.userAgent = process.env.USER_AGENT || 'SAYU-Bot/1.0 (Educational Art Platform)';
    this.concurrentLimit = parseInt(process.env.MAX_CONCURRENT) || 3;
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      const client = await this.pool.connect();
      console.log('✅ 데이터베이스 연결 성공');
      client.release();
      return true;
    } catch (error) {
      console.error('❌ 데이터베이스 연결 실패:', error.message);
      throw error;
    }
  }

  async crawlPendingArtworks(limit = null) {
    console.log('🎨 Artvee 상세 정보 크롤링 시작...\n');
    
    // 크롤링이 필요한 작품 조회
    const pendingArtworks = await this.getPendingArtworks(limit);
    
    if (pendingArtworks.length === 0) {
      console.log('✅ 크롤링할 작품이 없습니다.');
      return;
    }
    
    console.log(`📊 크롤링 대상: ${pendingArtworks.length}개 작품\n`);
    
    // 작업 생성
    const jobId = await this.createCrawlingJob(pendingArtworks.length);
    
    // 동시 실행 제한 설정
    const limit = pLimit(this.concurrentLimit);
    
    // 배치 처리
    const batchSize = 10;
    for (let i = 0; i < pendingArtworks.length; i += batchSize) {
      const batch = pendingArtworks.slice(i, i + batchSize);
      
      console.log(`\n📦 배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(pendingArtworks.length/batchSize)} 처리 중...`);
      
      // 배치 내 작품들 동시 처리
      const promises = batch.map(artwork => 
        limit(() => this.crawlAndSaveArtwork(artwork))
      );
      
      await Promise.all(promises);
      
      // 진행 상황 업데이트
      await this.updateJobProgress(jobId);
      
      // 배치 간 추가 딜레이
      if (i + batchSize < pendingArtworks.length) {
        await this.sleep(this.delay * 2);
      }
    }
    
    // 작업 완료
    await this.completeJob(jobId);
    
    // 통계 출력
    this.printStatistics();
  }

  async getPendingArtworks(limit) {
    const query = `
      SELECT id, artvee_id, artvee_url, title, artist
      FROM artvee_artworks
      WHERE processing_status IN ('url_collected', 'pending')
        AND is_active = true
      ORDER BY 
        CASE WHEN artist IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC
      ${limit ? `LIMIT ${limit}` : ''};
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async crawlAndSaveArtwork(artworkRecord) {
    this.stats.total++;
    
    try {
      console.log(`🔍 크롤링: ${artworkRecord.title || artworkRecord.artvee_id}`);
      
      // 페이지 크롤링
      const artworkData = await this.crawlArtworkPage(artworkRecord.artvee_url);
      
      // DB 업데이트
      await this.updateArtworkData(artworkRecord.id, artworkData);
      
      this.stats.success++;
      console.log(`   ✅ 성공: ${artworkData.title} - ${artworkData.artist}`);
      
    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push({
        artwork: artworkRecord.title || artworkRecord.artvee_id,
        error: error.message
      });
      
      // 오류 상태 업데이트
      await this.markArtworkFailed(artworkRecord.id, error.message);
      
      console.error(`   ❌ 실패: ${error.message}`);
    }
    
    // 딜레이
    await this.sleep(this.delay);
  }

  async crawlArtworkPage(url) {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    // 상세 정보 추출
    const artwork = {
      title: this.extractTitle($),
      artist: this.extractArtist($),
      year: this.extractYear($),
      medium: this.extractMedium($),
      dimensions: this.extractDimensions($),
      museum: this.extractMuseum($),
      description: this.extractDescription($),
      imageUrls: this.extractImageUrls($, url),
      categories: this.extractCategories($),
      tags: this.extractTags($),
      metadata: this.extractMetadata($)
    };
    
    return artwork;
  }

  // 추출 메서드들
  extractTitle($) {
    // 여러 가능한 위치에서 제목 찾기
    const selectors = [
      'h1.entry-title',
      'h1.product-title',
      'h1.artwork-title',
      '.single-product-main h1',
      'h1'
    ];
    
    for (const selector of selectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0) return title;
    }
    
    return $('meta[property="og:title"]').attr('content') || 'Untitled';
  }

  extractArtist($) {
    // 작가 정보 추출
    const selectors = [
      'a[href*="/artist/"]',
      '.artist-name',
      '.artwork-artist',
      'span.by-artist',
      'p:contains("Artist:")'
    ];
    
    for (const selector of selectors) {
      const element = $(selector).first();
      let artist = element.text().trim();
      
      if (artist) {
        // 정제
        artist = artist.replace(/^(by|artist:|작가:)/i, '').trim();
        if (artist.length > 0) return artist;
      }
    }
    
    // 메타데이터에서 찾기
    const productInfo = $('.product_meta').text();
    const artistMatch = productInfo.match(/Artist:\s*([^\n]+)/i);
    if (artistMatch) return artistMatch[1].trim();
    
    return null;
  }

  extractYear($) {
    // 제작 연도 추출
    const text = $('body').text();
    const patterns = [
      /\b(circa|c\.)\s*(1[0-9]{3})\b/i,  // c. 1890
      /\b(1[0-9]{3})\s*[-–]\s*(1[0-9]{3})\b/, // 1890-1920
      /\b(1[0-9]{3})\b/, // 1890
      /\b([0-9]{1,2})(st|nd|rd|th)\s+century\b/i // 19th century
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }

  extractMedium($) {
    // 매체/재료 정보
    const selectors = [
      '.medium',
      '.artwork-medium',
      'dt:contains("Medium") + dd',
      'span:contains("Medium:")',
      '.product_meta'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).text();
      const mediumMatch = text.match(/Medium:\s*([^\n,]+)/i);
      if (mediumMatch) return mediumMatch[1].trim();
    }
    
    return null;
  }

  extractDimensions($) {
    // 크기 정보
    const text = $('.product_meta').text() + ' ' + $('.artwork-details').text();
    const dimMatch = text.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)\s*(cm|in|mm)/i);
    
    if (dimMatch) {
      return dimMatch[0];
    }
    
    return null;
  }

  extractMuseum($) {
    // 소장처 정보
    const selectors = [
      '.museum',
      '.collection',
      'dt:contains("Collection") + dd',
      'span:contains("Museum:")',
      'span:contains("Collection:")'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      const text = element.text().trim();
      if (text) {
        return text.replace(/^(Museum:|Collection:)/i, '').trim();
      }
    }
    
    return null;
  }

  extractDescription($) {
    // 작품 설명
    const selectors = [
      '.artwork-description',
      '.product-description',
      '.entry-content',
      '#tab-description',
      '.description'
    ];
    
    for (const selector of selectors) {
      const desc = $(selector).first().text().trim();
      if (desc && desc.length > 20) return desc;
    }
    
    return null;
  }

  extractImageUrls($, pageUrl) {
    const images = {
      main: null,
      thumbnail: null,
      download: null,
      gallery: []
    };
    
    // 메인 이미지
    const mainSelectors = [
      'meta[property="og:image"]',
      '.single-product-main img',
      '.wp-post-image',
      '#product-img',
      '.artwork-image img'
    ];
    
    for (const selector of mainSelectors) {
      const src = $(selector).attr('content') || $(selector).attr('src');
      if (src) {
        images.main = this.resolveUrl(src, pageUrl);
        break;
      }
    }
    
    // 다운로드 링크
    const downloadSelectors = [
      'a.download-button',
      'a[href*="/download/"]',
      'a:contains("Download")',
      '.download-link'
    ];
    
    for (const selector of downloadSelectors) {
      const href = $(selector).attr('href');
      if (href) {
        images.download = this.resolveUrl(href, pageUrl);
        break;
      }
    }
    
    // 갤러리 이미지들
    $('.gallery img, .thumbnails img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) images.gallery.push(this.resolveUrl(src, pageUrl));
    });
    
    // 썸네일 (메인 이미지의 축소판)
    if (images.main) {
      images.thumbnail = images.main.replace(/\.(jpg|jpeg|png)$/i, '-300x300.$1');
    }
    
    return images;
  }

  extractCategories($) {
    const categories = [];
    
    // breadcrumb에서 카테고리 추출
    $('.breadcrumb a, .breadcrumbs a').each((i, el) => {
      const text = $(el).text().trim();
      if (text && !text.match(/home|artvee/i)) {
        categories.push(text);
      }
    });
    
    // 카테고리 링크에서 추출
    $('a[href*="/c/"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && !categories.includes(text)) {
        categories.push(text);
      }
    });
    
    return categories;
  }

  extractTags($) {
    const tags = new Set();
    
    // 태그 추출
    $('.product_tag a, .tags a, a[href*="/t/"]').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.add(tag.toLowerCase());
    });
    
    // 키워드 메타 태그
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      keywords.split(',').forEach(kw => tags.add(kw.trim().toLowerCase()));
    }
    
    return Array.from(tags);
  }

  extractMetadata($) {
    const metadata = {};
    
    // Open Graph 메타데이터
    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr('property').replace('og:', '');
      metadata[property] = $(el).attr('content');
    });
    
    // 구조화된 데이터
    const ldJson = $('script[type="application/ld+json"]').html();
    if (ldJson) {
      try {
        metadata.structuredData = JSON.parse(ldJson);
      } catch (e) {
        // JSON 파싱 실패 무시
      }
    }
    
    return metadata;
  }

  resolveUrl(url, baseUrl) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return this.baseUrl + url;
    return new URL(url, baseUrl).href;
  }

  // 데이터베이스 메서드들
  async updateArtworkData(artworkId, data) {
    const client = await this.pool.connect();
    
    try {
      // 성격 및 감정 태그 생성
      const personalityTags = this.generatePersonalityTags(data);
      const emotionTags = this.generateEmotionTags(data);
      const usageTags = this.generateUsageTags(data);
      
      const query = `
        UPDATE artvee_artworks
        SET 
          title = COALESCE($2, title),
          artist = COALESCE($3, artist),
          year_created = COALESCE($4, year_created),
          medium = COALESCE($5, medium),
          dimensions = COALESCE($6, dimensions),
          source_museum = COALESCE($7, source_museum),
          description = COALESCE($8, description),
          cdn_url = COALESCE($9, cdn_url),
          thumbnail_url = COALESCE($10, thumbnail_url),
          personality_tags = $11,
          emotion_tags = $12,
          usage_tags = $13,
          metadata = metadata || $14,
          processing_status = 'crawled',
          updated_at = NOW()
        WHERE id = $1;
      `;
      
      const metadata = {
        ...data.metadata,
        imageUrls: data.imageUrls,
        categories: data.categories,
        tags: data.tags,
        crawledAt: new Date().toISOString()
      };
      
      const values = [
        artworkId,
        data.title,
        data.artist,
        data.year,
        data.medium,
        data.dimensions,
        data.museum,
        data.description,
        data.imageUrls.main,
        data.imageUrls.thumbnail,
        personalityTags,
        emotionTags,
        usageTags,
        metadata
      ];
      
      await client.query(query, values);
      
    } finally {
      client.release();
    }
  }

  generatePersonalityTags(data) {
    const tags = [];
    
    // 아티스트 기반 매핑
    const artistPersonality = {
      'van gogh': ['ISFP', 'INFP'],
      'picasso': ['ESTP', 'ENTP'],
      'monet': ['ISFP', 'INFJ'],
      'da vinci': ['ENTP', 'INTP'],
      'rembrandt': ['ISFJ', 'ISTJ']
    };
    
    if (data.artist) {
      const artistLower = data.artist.toLowerCase();
      for (const [artist, types] of Object.entries(artistPersonality)) {
        if (artistLower.includes(artist)) {
          tags.push(...types);
        }
      }
    }
    
    // 카테고리/태그 기반 매핑
    const allText = `${data.categories.join(' ')} ${data.tags.join(' ')}`.toLowerCase();
    
    if (allText.includes('portrait') || allText.includes('people')) {
      tags.push('ESFJ', 'ENFJ');
    }
    if (allText.includes('landscape') || allText.includes('nature')) {
      tags.push('ISFP', 'INFP');
    }
    if (allText.includes('abstract') || allText.includes('surreal')) {
      tags.push('INTP', 'ENTP');
    }
    
    return [...new Set(tags)];
  }

  generateEmotionTags(data) {
    const tags = [];
    const allText = `${data.title} ${data.description || ''} ${data.tags.join(' ')}`.toLowerCase();
    
    const emotionKeywords = {
      'serene': ['calm', 'peaceful', 'tranquil', 'quiet'],
      'joyful': ['happy', 'joy', 'celebration', 'bright'],
      'melancholic': ['sad', 'melancholy', 'sorrow', 'grief'],
      'dramatic': ['intense', 'dramatic', 'powerful', 'bold'],
      'mysterious': ['mystery', 'enigma', 'dark', 'shadow']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(kw => allText.includes(kw))) {
        tags.push(emotion);
      }
    }
    
    return tags;
  }

  generateUsageTags(data) {
    const tags = ['gallery'];
    
    if (data.categories.includes('Portrait')) {
      tags.push('personality_result', 'profile');
    }
    if (data.categories.includes('Landscape')) {
      tags.push('quiz_bg', 'background', 'meditation');
    }
    if (data.categories.includes('Abstract')) {
      tags.push('exhibition_card', 'modern');
    }
    
    // 고화질 이미지가 있으면
    if (data.imageUrls.download) {
      tags.push('high_quality', 'printable');
    }
    
    return [...new Set(tags)];
  }

  async markArtworkFailed(artworkId, errorMessage) {
    const query = `
      UPDATE artvee_artworks
      SET 
        processing_status = 'failed',
        metadata = metadata || $2,
        updated_at = NOW()
      WHERE id = $1;
    `;
    
    const errorData = {
      lastError: errorMessage,
      failedAt: new Date().toISOString()
    };
    
    await this.pool.query(query, [artworkId, errorData]);
  }

  // 작업 관리 메서드들
  async createCrawlingJob(targetCount) {
    const query = `
      INSERT INTO artvee_collection_jobs (
        job_type, 
        category,
        target_count,
        job_status,
        started_at
      ) VALUES (
        'artwork_detail',
        'crawling',
        $1,
        'running',
        NOW()
      )
      RETURNING id;
    `;
    
    const result = await this.pool.query(query, [targetCount]);
    return result.rows[0].id;
  }

  async updateJobProgress(jobId) {
    const query = `
      UPDATE artvee_collection_jobs
      SET 
        items_processed = $2,
        items_successful = $3,
        items_failed = $4
      WHERE id = $1;
    `;
    
    await this.pool.query(query, [
      jobId,
      this.stats.total,
      this.stats.success,
      this.stats.failed
    ]);
  }

  async completeJob(jobId) {
    const query = `
      UPDATE artvee_collection_jobs
      SET 
        job_status = $2,
        items_processed = $3,
        items_successful = $4,
        items_failed = $5,
        completed_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
      WHERE id = $1;
    `;
    
    const status = this.stats.failed === 0 ? 'completed' : 'completed_with_errors';
    
    await this.pool.query(query, [
      jobId,
      status,
      this.stats.total,
      this.stats.success,
      this.stats.failed
    ]);
  }

  printStatistics() {
    console.log('\n📊 크롤링 통계:');
    console.log(`  • 전체: ${this.stats.total}개`);
    console.log(`  • 성공: ${this.stats.success}개`);
    console.log(`  • 실패: ${this.stats.failed}개`);
    console.log(`  • 성공률: ${(this.stats.success / this.stats.total * 100).toFixed(1)}%`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ 주요 오류:');
      this.stats.errors.slice(0, 5).forEach(err => {
        console.log(`  • ${err.artwork}: ${err.error}`);
      });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    await this.pool.end();
    console.log('\n🔌 데이터베이스 연결 종료');
  }
}

// 실행
async function main() {
  const crawler = new ArtveeDBCrawler();
  
  try {
    // 초기화
    await crawler.initialize();
    
    // 크롤링 개수 (기본: 전체)
    const limit = process.argv[2] ? parseInt(process.argv[2]) : null;
    
    if (limit) {
      console.log(`🎯 ${limit}개 작품 크롤링을 시작합니다.\n`);
    } else {
      console.log(`🎯 모든 미처리 작품을 크롤링합니다.\n`);
    }
    
    // 크롤링 실행
    await crawler.crawlPendingArtworks(limit);
    
  } catch (error) {
    console.error('\n❌ 크롤러 오류:', error.message);
    console.error(error.stack);
  } finally {
    await crawler.close();
  }
}

main().catch(console.error);