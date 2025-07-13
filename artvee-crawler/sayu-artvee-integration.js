const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const ArtistPreferenceSystem = require('./lib/artist-preference-system');
require('dotenv').config();

/**
 * SAYU-Artvee 통합 시스템
 * Artvee 작품을 SAYU 플랫폼으로 가져오고 SAYU 타입별로 분류
 */
class SAYUArtveeIntegration {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.preferenceSystem = new ArtistPreferenceSystem(process.env.DATABASE_URL);
    
    // SAYU 타입별 키워드 매핑
    this.sayuKeywords = {
      // L+A 그룹 (혼자서 분위기를 음미하는)
      'LAEF': { // 여우 - 몽환적 방랑자
        keywords: ['dream', 'mystical', 'romantic', 'ethereal', 'fantasy', 'surreal', 'visionary'],
        artists: ['van-gogh', 'turner', 'blake', 'redon', 'moreau'],
        genres: ['symbolism', 'romanticism', 'surrealism']
      },
      'LAEC': { // 고양이 - 감성 큐레이터
        keywords: ['elegant', 'refined', 'atmospheric', 'poetic', 'sophisticated', 'graceful'],
        artists: ['monet', 'degas', 'cassatt', 'sargent', 'whistler'],
        genres: ['impressionism', 'aestheticism', 'tonalism']
      },
      'LAMF': { // 올빼미 - 직관적 탐구자
        keywords: ['contemplative', 'introspective', 'mysterious', 'psychological', 'symbolic'],
        artists: ['vermeer', 'hammershoi', 'hopper', 'wyeth', 'balthus'],
        genres: ['realism', 'magic-realism', 'new-objectivity']
      },
      'LAMC': { // 거북이 - 철학적 수집가
        keywords: ['meditative', 'structured', 'harmonious', 'classical', 'timeless'],
        artists: ['chardin', 'morandi', 'cezanne', 'braque', 'klee'],
        genres: ['still-life', 'post-impressionism', 'cubism']
      },
      
      // L+R 그룹 (혼자서 정밀하게 관찰하는)
      'LREF': { // 카멜레온 - 고독한 관찰자
        keywords: ['observational', 'naturalistic', 'realistic', 'detailed', 'precise'],
        artists: ['velazquez', 'manet', 'courbet', 'eakins', 'lucian-freud'],
        genres: ['realism', 'contemporary-realism']
      },
      'LREC': { // 고슴도치 - 섬세한 감정가
        keywords: ['gentle', 'delicate', 'pastoral', 'intimate', 'tender', 'soft'],
        artists: ['renoir', 'fragonard', 'boucher', 'gainsborough', 'greuze'],
        genres: ['rococo', 'genre-painting', 'pastoral']
      },
      'LRMF': { // 문어 - 디지털 탐험가
        keywords: ['dramatic', 'intense', 'psychological', 'raw', 'expressive', 'bold'],
        artists: ['caravaggio', 'ribera', 'goya', 'bacon', 'lucian-freud'],
        genres: ['baroque', 'expressionism']
      },
      'LRMC': { // 비버 - 학구적 연구자
        keywords: ['precise', 'detailed', 'technical', 'classical', 'academic', 'masterful'],
        artists: ['durer', 'van-eyck', 'holbein', 'ingres', 'david'],
        genres: ['northern-renaissance', 'neoclassicism', 'academic-art']
      },
      
      // S+A 그룹 (함께 분위기를 느끼는)
      'SAEF': { // 나비 - 감성 나눔이
        keywords: ['vibrant', 'joyful', 'colorful', 'expressive', 'dynamic', 'lively'],
        artists: ['matisse', 'chagall', 'dufy', 'delaunay', 'kirchner'],
        genres: ['fauvism', 'orphism', 'expressionism']
      },
      'SAEC': { // 펭귄 - 예술 네트워커
        keywords: ['geometric', 'systematic', 'harmonious', 'rhythmic', 'organized'],
        artists: ['mondrian', 'kandinsky', 'malevich', 'albers', 'vasarely'],
        genres: ['de-stijl', 'bauhaus', 'constructivism', 'op-art']
      },
      'SAMF': { // 앵무새 - 영감 전도사
        keywords: ['pop', 'contemporary', 'communicative', 'bold', 'modern', 'urban'],
        artists: ['basquiat', 'haring', 'koons', 'murakami', 'kaws'],
        genres: ['pop-art', 'street-art', 'neo-expressionism']
      },
      'SAMC': { // 사슴 - 문화 기획자
        keywords: ['cultural', 'systematic', 'contemporary', 'conceptual', 'social'],
        artists: ['warhol', 'lichtenstein', 'rauschenberg', 'johns', 'hockney'],
        genres: ['pop-art', 'contemporary-art']
      },
      
      // S+R 그룹 (함께 정확히 감상하는)
      'SREF': { // 강아지 - 열정적 관람자
        keywords: ['narrative', 'accessible', 'decorative', 'sentimental', 'warm'],
        artists: ['rockwell', 'leyendecker', 'parrish', 'alma-tadema', 'bouguereau'],
        genres: ['american-realism', 'golden-age-illustration']
      },
      'SREC': { // 오리 - 따뜻한 안내자
        keywords: ['romantic', 'narrative', 'decorative', 'symbolic', 'beautiful'],
        artists: ['millais', 'rossetti', 'waterhouse', 'burne-jones', 'mucha'],
        genres: ['pre-raphaelite', 'art-nouveau', 'symbolism']
      },
      'SRMF': { // 코끼리 - 지식 멘토
        keywords: ['masterful', 'monumental', 'classical', 'grand', 'historic'],
        artists: ['rembrandt', 'titian', 'rubens', 'velazquez', 'poussin'],
        genres: ['baroque', 'high-renaissance', 'venetian-school']
      },
      'SRMC': { // 독수리 - 체계적 교육자
        keywords: ['classical', 'systematic', 'educational', 'ideal', 'perfect'],
        artists: ['raphael', 'leonardo', 'michelangelo', 'botticelli', 'giotto'],
        genres: ['high-renaissance', 'early-renaissance']
      }
    };
  }

  /**
   * Artvee 작품 크롤링 및 SAYU DB 저장
   */
  async importArtwork(artworkUrl) {
    try {
      // 1. 작품 정보 크롤링
      const artwork = await this.crawlArtwork(artworkUrl);
      if (!artwork) {
        throw new Error('Failed to crawl artwork');
      }
      
      // 2. SAYU 타입 매칭
      const sayuTypes = this.matchSayuTypes(artwork);
      
      // 3. 데이터베이스에 저장
      const savedArtwork = await this.saveToDatabase(artwork, sayuTypes);
      
      // 4. 이미지 분석 요청 (비동기)
      this.requestImageAnalysis(savedArtwork.id).catch(console.error);
      
      return savedArtwork;
      
    } catch (error) {
      console.error(`Error importing artwork ${artworkUrl}:`, error.message);
      throw error;
    }
  }

  /**
   * 작품 정보 크롤링
   */
  async crawlArtwork(url) {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SAYU-Artvee-Crawler/1.0'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    // Artvee ID 추출
    const artveeId = url.match(/\/dl\/([^\/]+)\//)?.[1] || url;
    
    const artwork = {
      artveeId,
      url,
      title: $('h1').first().text().trim(),
      artist: $('.product-artist a').first().text().trim() || 'Unknown',
      imageUrl: $('.woocommerce-product-gallery__image img').first().attr('src'),
      tags: [],
      metadata: {}
    };
    
    // 태그 수집
    $('.product-tags a').each((i, el) => {
      artwork.tags.push($(el).text().trim().toLowerCase());
    });
    
    // 메타데이터
    $('.product-meta span').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Date:')) {
        artwork.metadata.date = text.replace('Date:', '').trim();
      } else if (text.includes('Medium:')) {
        artwork.metadata.medium = text.replace('Medium:', '').trim();
      } else if (text.includes('Location:')) {
        artwork.metadata.location = text.replace('Location:', '').trim();
      }
    });
    
    // 설명
    artwork.description = $('.product-description').text().trim();
    
    return artwork;
  }

  /**
   * SAYU 타입 매칭
   */
  matchSayuTypes(artwork) {
    const matches = {};
    
    // 각 SAYU 타입별 점수 계산
    Object.entries(this.sayuKeywords).forEach(([type, config]) => {
      let score = 0;
      const reasons = [];
      
      // 태그 매칭
      artwork.tags.forEach(tag => {
        if (config.keywords.some(keyword => tag.includes(keyword))) {
          score += 10;
          reasons.push(`태그: ${tag}`);
        }
      });
      
      // 작가 매칭
      const artistLower = artwork.artist.toLowerCase();
      config.artists.forEach(artist => {
        if (artistLower.includes(artist)) {
          score += 30;
          reasons.push(`작가: ${artwork.artist}`);
        }
      });
      
      // 장르/시대 매칭 (태그에서 추출)
      config.genres.forEach(genre => {
        if (artwork.tags.some(tag => tag.includes(genre))) {
          score += 20;
          reasons.push(`장르: ${genre}`);
        }
      });
      
      if (score > 0) {
        matches[type] = { score, reasons };
      }
    });
    
    // 상위 3개 타입 선택
    const topTypes = Object.entries(matches)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
      .map(([type]) => type);
    
    return topTypes;
  }

  /**
   * 데이터베이스에 저장
   */
  async saveToDatabase(artwork, sayuTypes) {
    const query = `
      INSERT INTO artvee_artworks (
        artvee_id, title, artist, year_created,
        medium, artvee_url, cdn_url,
        personality_tags, emotion_tags,
        description, processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (artvee_id) DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        personality_tags = EXCLUDED.personality_tags,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      artwork.artveeId,
      artwork.title,
      artwork.artist,
      artwork.metadata.date || null,
      artwork.metadata.medium || null,
      artwork.url,
      artwork.imageUrl,
      sayuTypes,
      artwork.tags.slice(0, 10), // 상위 10개 태그만
      artwork.description,
      'pending'
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 이미지 분석 요청
   */
  async requestImageAnalysis(artworkId) {
    const query = `
      INSERT INTO image_optimization_queue (
        artwork_id, optimization_type, priority
      ) VALUES ($1, 'analysis', 5)
      ON CONFLICT (artwork_id, optimization_type) DO NOTHING
    `;
    
    await this.pool.query(query, [artworkId]);
  }

  /**
   * 배치 임포트
   */
  async batchImport(urlsFile, options = {}) {
    const { limit = 100, startFrom = 0 } = options;
    
    console.log('🎨 SAYU-Artvee 배치 임포트 시작\n');
    
    // URL 목록 로드
    const urlsJson = await fs.readFile(urlsFile, 'utf8');
    const urls = JSON.parse(urlsJson);
    
    const totalUrls = Math.min(urls.length - startFrom, limit);
    console.log(`📊 처리할 작품: ${totalUrls}개\n`);
    
    // 작업 로그 생성
    const jobResult = await this.pool.query(`
      INSERT INTO artvee_collection_jobs (
        job_type, job_status, target_count, started_at
      ) VALUES ('batch_import', 'running', $1, NOW())
      RETURNING id
    `, [totalUrls]);
    
    const jobId = jobResult.rows[0].id;
    
    let successful = 0;
    let failed = 0;
    const errors = [];
    
    // 배치 처리
    for (let i = startFrom; i < startFrom + totalUrls; i++) {
      const url = urls[i];
      
      try {
        console.log(`[${i - startFrom + 1}/${totalUrls}] 처리 중: ${url}`);
        
        const artwork = await this.importArtwork(url);
        successful++;
        
        console.log(`   ✅ 저장 완료: ${artwork.title}`);
        console.log(`   🎯 SAYU 타입: ${artwork.personality_tags.join(', ')}\n`);
        
        // 진행 상황 업데이트
        await this.pool.query(`
          UPDATE artvee_collection_jobs
          SET items_processed = $1, items_successful = $2
          WHERE id = $3
        `, [i - startFrom + 1, successful, jobId]);
        
        // 속도 조절
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failed++;
        errors.push({ url, error: error.message });
        console.log(`   ❌ 실패: ${error.message}\n`);
        
        // 에러 로그 업데이트
        await this.pool.query(`
          UPDATE artvee_collection_jobs
          SET items_failed = $1, last_error = $2
          WHERE id = $3
        `, [failed, error.message, jobId]);
      }
    }
    
    // 작업 완료
    await this.pool.query(`
      UPDATE artvee_collection_jobs
      SET job_status = 'completed',
          completed_at = NOW(),
          duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
      WHERE id = $1
    `, [jobId]);
    
    // 결과 요약
    console.log('\n✅ 배치 임포트 완료!');
    console.log(`📊 결과:`);
    console.log(`   - 성공: ${successful}개`);
    console.log(`   - 실패: ${failed}개`);
    
    if (errors.length > 0) {
      console.log(`\n❌ 실패한 URL:`);
      errors.slice(0, 5).forEach(({ url, error }) => {
        console.log(`   - ${url}: ${error}`);
      });
      if (errors.length > 5) {
        console.log(`   ... 외 ${errors.length - 5}개`);
      }
    }
    
    // 통계 갱신
    await this.updateStatistics();
    
    return {
      jobId,
      successful,
      failed,
      errors
    };
  }

  /**
   * 통계 업데이트
   */
  async updateStatistics() {
    // 성격 유형별 작품 매핑 갱신
    const types = Object.keys(this.sayuKeywords);
    
    for (const type of types) {
      const result = await this.pool.query(`
        SELECT array_agg(id) as artwork_ids
        FROM artvee_artworks
        WHERE $1 = ANY(personality_tags)
        AND is_active = true
        ORDER BY image_quality_score DESC
        LIMIT 100
      `, [type]);
      
      if (result.rows[0].artwork_ids) {
        await this.pool.query(`
          INSERT INTO personality_artwork_mapping (
            personality_type, primary_artworks
          ) VALUES ($1, $2)
          ON CONFLICT (personality_type) DO UPDATE SET
            primary_artworks = EXCLUDED.primary_artworks,
            last_updated = NOW()
        `, [type, result.rows[0].artwork_ids]);
      }
    }
    
    // 추천 캐시 갱신
    await this.pool.query('SELECT refresh_artwork_recommendations()');
    
    console.log('\n📊 통계 업데이트 완료');
  }

  /**
   * 연결 종료
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = SAYUArtveeIntegration;