const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * Artvee 데이터베이스 임포터
 * 크롤링된 데이터를 PostgreSQL에 저장합니다
 */

class ArtveeDBImporter {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.stats = {
      total: 0,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      // 연결 테스트
      const client = await this.pool.connect();
      console.log('✅ 데이터베이스 연결 성공');
      
      // 테이블 존재 확인
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'artvee_artworks'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('⚠️ artvee_artworks 테이블이 없습니다. 생성 중...');
        await this.createTables(client);
      }
      
      client.release();
      return true;
    } catch (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error.message);
      throw error;
    }
  }

  async createTables(client) {
    // 기본 테이블 생성 (스키마 파일이 이미 있다면 그것을 사용)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS artvee_artworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artvee_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        artist VARCHAR(200),
        year_created VARCHAR(50),
        period VARCHAR(100),
        style VARCHAR(100),
        genre VARCHAR(100),
        medium VARCHAR(200),
        artvee_url TEXT NOT NULL,
        cdn_url TEXT,
        thumbnail_url TEXT,
        medium_url TEXT,
        personality_tags TEXT[] DEFAULT '{}',
        emotion_tags TEXT[] DEFAULT '{}',
        color_palette JSONB,
        usage_tags TEXT[] DEFAULT '{}',
        source_museum VARCHAR(200),
        dimensions VARCHAR(100),
        description TEXT,
        image_quality_score FLOAT DEFAULT 0.0,
        processing_status VARCHAR(50) DEFAULT 'pending',
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_artvee_artworks_artvee_id ON artvee_artworks(artvee_id);
      CREATE INDEX IF NOT EXISTS idx_artvee_artworks_artist ON artvee_artworks(artist);
      CREATE INDEX IF NOT EXISTS idx_artvee_artworks_personality_tags ON artvee_artworks USING GIN(personality_tags);
      CREATE INDEX IF NOT EXISTS idx_artvee_artworks_emotion_tags ON artvee_artworks USING GIN(emotion_tags);
    `;
    
    await client.query(createTableQuery);
    console.log('✅ 테이블 생성 완료');
  }

  async importFromFile(filePath) {
    console.log(`\n📂 파일 읽기: ${filePath}`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      // URL 컬렉션인지 크롤링 데이터인지 확인
      if (jsonData.urls) {
        // URL 컬렉션 파일
        console.log(`📋 URL 컬렉션 발견: ${jsonData.urls.length}개`);
        await this.importURLCollection(jsonData.urls);
      } else if (Array.isArray(jsonData)) {
        // 크롤링된 상세 데이터
        console.log(`📋 크롤링 데이터 발견: ${jsonData.length}개`);
        await this.importCrawledData(jsonData);
      } else {
        throw new Error('알 수 없는 데이터 형식');
      }
      
    } catch (error) {
      console.error('❌ 파일 읽기 실패:', error.message);
      throw error;
    }
  }

  async importURLCollection(urls) {
    console.log('\n🔄 URL 컬렉션 임포트 시작...');
    
    for (const urlData of urls) {
      this.stats.total++;
      
      try {
        await this.saveURLData(urlData);
        this.stats.imported++;
        
        if (this.stats.total % 50 === 0) {
          console.log(`   진행률: ${this.stats.total}/${urls.length} (${Math.round(this.stats.total/urls.length*100)}%)`);
        }
      } catch (error) {
        this.stats.failed++;
        this.stats.errors.push({
          url: urlData.url,
          error: error.message
        });
      }
    }
  }

  async saveURLData(urlData) {
    const client = await this.pool.connect();
    
    try {
      // artvee_id 생성
      const artveeId = urlData.artworkId || this.extractIdFromURL(urlData.url);
      
      // 기본 데이터 구성
      const artwork = {
        artvee_id: artveeId,
        title: this.extractTitleFromURL(urlData.url),
        artist: urlData.metadata?.possibleArtist || null,
        artvee_url: urlData.url,
        period: urlData.metadata?.period || null,
        genre: urlData.metadata?.genres?.[0] || null,
        personality_tags: urlData.metadata?.personalityMatch || [],
        emotion_tags: urlData.metadata?.emotions || [],
        usage_tags: this.generateUsageTags(urlData.metadata),
        processing_status: 'url_collected',
        metadata: urlData.metadata || {},
        is_active: true
      };
      
      const query = `
        INSERT INTO artvee_artworks (
          artvee_id, title, artist, artvee_url,
          period, genre, personality_tags, emotion_tags,
          usage_tags, processing_status, metadata, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (artvee_id) DO UPDATE SET
          artist = COALESCE(EXCLUDED.artist, artvee_artworks.artist),
          period = COALESCE(EXCLUDED.period, artvee_artworks.period),
          genre = COALESCE(EXCLUDED.genre, artvee_artworks.genre),
          personality_tags = EXCLUDED.personality_tags,
          emotion_tags = EXCLUDED.emotion_tags,
          metadata = artvee_artworks.metadata || EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING id;
      `;
      
      const values = [
        artwork.artvee_id,
        artwork.title,
        artwork.artist,
        artwork.artvee_url,
        artwork.period,
        artwork.genre,
        artwork.personality_tags,
        artwork.emotion_tags,
        artwork.usage_tags,
        artwork.processing_status,
        artwork.metadata,
        artwork.is_active
      ];
      
      await client.query(query, values);
      
    } finally {
      client.release();
    }
  }

  async importCrawledData(artworks) {
    console.log('\n🔄 크롤링 데이터 임포트 시작...');
    
    for (const artwork of artworks) {
      this.stats.total++;
      
      try {
        await this.saveCrawledArtwork(artwork);
        this.stats.imported++;
        
        if (this.stats.total % 10 === 0) {
          console.log(`   진행률: ${this.stats.total}/${artworks.length} (${Math.round(this.stats.total/artworks.length*100)}%)`);
        }
      } catch (error) {
        this.stats.failed++;
        this.stats.errors.push({
          artwork: artwork.title,
          error: error.message
        });
      }
    }
  }

  async saveCrawledArtwork(artwork) {
    const client = await this.pool.connect();
    
    try {
      const artveeId = this.extractIdFromURL(artwork.url);
      
      const query = `
        INSERT INTO artvee_artworks (
          artvee_id, title, artist, year_created,
          artvee_url, cdn_url, thumbnail_url,
          description, source_museum,
          processing_status, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        ON CONFLICT (artvee_id) DO UPDATE SET
          title = EXCLUDED.title,
          artist = COALESCE(EXCLUDED.artist, artvee_artworks.artist),
          year_created = COALESCE(EXCLUDED.year_created, artvee_artworks.year_created),
          cdn_url = COALESCE(EXCLUDED.cdn_url, artvee_artworks.cdn_url),
          thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, artvee_artworks.thumbnail_url),
          description = COALESCE(EXCLUDED.description, artvee_artworks.description),
          source_museum = COALESCE(EXCLUDED.source_museum, artvee_artworks.source_museum),
          processing_status = 'crawled',
          metadata = artvee_artworks.metadata || EXCLUDED.metadata,
          updated_at = NOW();
      `;
      
      const metadata = {
        category: artwork.category,
        tags: artwork.tags,
        imageUrl: artwork.imageUrl,
        downloadUrl: artwork.downloadUrl,
        crawledAt: artwork.crawledAt
      };
      
      const values = [
        artveeId,
        artwork.title || 'Untitled',
        artwork.artist || null,
        artwork.date || null,
        artwork.url,
        artwork.imageUrl || null,
        artwork.imageUrl || null, // thumbnail로도 사용
        artwork.description || null,
        artwork.museum || null,
        'crawled',
        metadata
      ];
      
      await client.query(query, values);
      this.stats.updated++;
      
    } finally {
      client.release();
    }
  }

  // 헬퍼 메서드들
  extractIdFromURL(url) {
    // /dl/artwork-name/ 형식에서 artwork-name 추출
    const match = url.match(/\/dl\/([^\/]+)/);
    if (match) return match[1];
    
    // 기타 형식
    const parts = url.split('/').filter(p => p);
    return parts[parts.length - 1] || `artvee_${Date.now()}`;
  }

  extractTitleFromURL(url) {
    const id = this.extractIdFromURL(url);
    // 하이픈을 공백으로, 각 단어 첫글자 대문자
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateUsageTags(metadata) {
    const tags = ['gallery']; // 기본 태그
    
    if (metadata?.genres) {
      if (metadata.genres.includes('portrait')) tags.push('personality_result');
      if (metadata.genres.includes('landscape')) tags.push('quiz_bg', 'background');
      if (metadata.genres.includes('abstract')) tags.push('exhibition_card');
      if (metadata.genres.includes('stillLife')) tags.push('card');
    }
    
    if (metadata?.emotions) {
      if (metadata.emotions.includes('serene')) tags.push('meditation');
      if (metadata.emotions.includes('energetic')) tags.push('loading');
    }
    
    return tags;
  }

  async createCollectionJob(jobType, sourceFile) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO artvee_collection_jobs (
          job_type, 
          job_status,
          collection_config,
          target_count,
          started_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING id;
      `;
      
      const config = {
        sourceFile: sourceFile,
        importedAt: new Date().toISOString()
      };
      
      const result = await client.query(query, [
        jobType,
        'running',
        JSON.stringify(config),
        this.stats.total
      ]);
      
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async updateCollectionJob(jobId) {
    const client = await this.pool.connect();
    
    try {
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
      
      await client.query(query, [
        jobId,
        this.stats.failed === 0 ? 'completed' : 'completed_with_errors',
        this.stats.total,
        this.stats.imported + this.stats.updated,
        this.stats.failed
      ]);
    } finally {
      client.release();
    }
  }

  async printStatistics() {
    console.log('\n📊 임포트 통계:');
    console.log(`   • 전체: ${this.stats.total}개`);
    console.log(`   • 신규 추가: ${this.stats.imported}개`);
    console.log(`   • 업데이트: ${this.stats.updated}개`);
    console.log(`   • 실패: ${this.stats.failed}개`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      this.stats.errors.slice(0, 5).forEach(err => {
        console.log(`   • ${err.url || err.artwork}: ${err.error}`);
      });
      if (this.stats.errors.length > 5) {
        console.log(`   ... 외 ${this.stats.errors.length - 5}개`);
      }
    }
    
    // DB에서 현재 상태 조회
    try {
      const result = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN processing_status = 'url_collected' THEN 1 END) as url_only,
          COUNT(CASE WHEN processing_status = 'crawled' THEN 1 END) as crawled,
          COUNT(CASE WHEN processing_status = 'processed' THEN 1 END) as processed,
          COUNT(DISTINCT artist) as unique_artists,
          COUNT(DISTINCT period) as unique_periods
        FROM artvee_artworks;
      `);
      
      const stats = result.rows[0];
      console.log('\n📈 데이터베이스 현황:');
      console.log(`   • 총 작품: ${stats.total}개`);
      console.log(`   • URL만 수집: ${stats.url_only}개`);
      console.log(`   • 크롤링 완료: ${stats.crawled}개`);
      console.log(`   • 처리 완료: ${stats.processed}개`);
      console.log(`   • 작가 수: ${stats.unique_artists}명`);
      console.log(`   • 시대: ${stats.unique_periods}개`);
    } catch (error) {
      console.error('통계 조회 실패:', error.message);
    }
  }

  async close() {
    await this.pool.end();
    console.log('\n🔌 데이터베이스 연결 종료');
  }
}

// 실행
async function main() {
  const importer = new ArtveeDBImporter();
  
  try {
    // 초기화
    await importer.initialize();
    
    // 파일 경로 확인
    const filePath = process.argv[2];
    if (!filePath) {
      console.log('사용법: node db-import.js <데이터파일경로>');
      console.log('예시: node db-import.js ./data/artvee-urls-final.json');
      console.log('      node db-import.js ./data/artworks-2024-01-13.json');
      process.exit(1);
    }
    
    // 파일 존재 확인
    try {
      await fs.access(filePath);
    } catch {
      console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
      process.exit(1);
    }
    
    // 작업 시작
    console.log(`\n🚀 Artvee 데이터 임포트 시작`);
    console.log(`📁 소스 파일: ${filePath}`);
    
    const jobId = await importer.createCollectionJob('db_import', filePath);
    console.log(`📋 작업 ID: ${jobId}\n`);
    
    // 임포트 실행
    await importer.importFromFile(filePath);
    
    // 작업 완료 업데이트
    await importer.updateCollectionJob(jobId);
    
    // 통계 출력
    await importer.printStatistics();
    
  } catch (error) {
    console.error('\n❌ 임포트 실패:', error.message);
    console.error(error.stack);
  } finally {
    await importer.close();
  }
}

// 테이블 생성만 하는 유틸리티
async function createTablesOnly() {
  const importer = new ArtveeDBImporter();
  
  try {
    await importer.initialize();
    console.log('✅ 테이블 생성/확인 완료');
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error.message);
  } finally {
    await importer.close();
  }
}

// 명령줄 인자 확인
if (process.argv[2] === '--create-tables') {
  createTablesOnly();
} else {
  main();
}