require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class BatchArtworkImporter {
  constructor() {
    this.batchSize = 50; // 한 번에 처리할 작품 수
    this.delayBetweenBatches = 1000; // 배치 간 1초 대기
    this.progressFile = 'batch-import-progress.json';
  }

  // 진행 상황 저장
  async saveProgress(processed, total, currentBatch) {
    const progress = {
      processed,
      total,
      currentBatch,
      percentage: ((processed / total) * 100).toFixed(2),
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
    console.log(`진행률: ${progress.percentage}% (${processed}/${total})`);
  }

  // 진행 상황 불러오기
  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { processed: 0, currentBatch: 0 };
    }
  }

  // 작가 ID 찾기 또는 생성
  async findOrCreateArtist(artistName) {
    if (!artistName || artistName.trim() === '') return null;
    
    const cleanName = artistName.split('\n')[0].trim();
    
    // 기존 작가 검색
    const existingArtist = await pool.query(
      'SELECT id FROM artists WHERE name ILIKE $1 LIMIT 1',
      [cleanName]
    );
    
    if (existingArtist.rows.length > 0) {
      return existingArtist.rows[0].id;
    }
    
    // 새 작가 생성
    const newArtist = await pool.query(
      'INSERT INTO artists (name, birth_year, death_year, nationality, source) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [cleanName, null, null, 'Unknown', 'batch_import']
    );
    
    return newArtist.rows[0].id;
  }

  // 기관 ID 찾기 또는 생성
  async findOrCreateInstitution(sourceName) {
    if (!sourceName) return null;
    
    const existingInstitution = await pool.query(
      'SELECT id FROM institutions WHERE name = $1 LIMIT 1',
      [sourceName]
    );
    
    if (existingInstitution.rows.length > 0) {
      return existingInstitution.rows[0].id;
    }
    
    // 새 기관 생성
    const newInstitution = await pool.query(
      'INSERT INTO institutions (name, type, country, website) VALUES ($1, $2, $3, $4) RETURNING id',
      [sourceName, 'museum', 'US', '']
    );
    
    return newInstitution.rows[0].id;
  }

  // 단일 작품 임포트
  async importArtwork(artwork) {
    try {
      // 중복 확인
      const existing = await pool.query(
        'SELECT id FROM artworks WHERE source_id = $1 AND source = $2',
        [artwork.objectID, artwork.source]
      );
      
      if (existing.rows.length > 0) {
        return { success: true, skipped: true };
      }

      // 작가 처리
      const artistId = await this.findOrCreateArtist(artwork.artist);
      
      // 기관 처리
      const institutionId = await this.findOrCreateInstitution(artwork.source);
      
      // 작품 삽입
      const artworkResult = await pool.query(`
        INSERT INTO artworks (
          title, description, creation_date, medium, dimensions,
          style, classification, source, source_id, source_url,
          image_url, thumbnail_url, cloudinary_url, cloudinary_public_id,
          institution_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING id
      `, [
        artwork.title || 'Untitled',
        artwork.description || '',
        artwork.date || null,
        artwork.medium || '',
        artwork.dimensions || '',
        artwork.style || '',
        artwork.classification || 'artwork',
        artwork.source || 'unknown',
        artwork.objectID,
        artwork.metUrl || '',
        artwork.primaryImage || '',
        artwork.primaryImageSmall || '',
        artwork.cloudinaryUrl || '',
        artwork.cloudinaryPublicId || '',
        institutionId
      ]);

      const artworkId = artworkResult.rows[0].id;

      // 작가-작품 연결
      if (artistId) {
        await pool.query(
          'INSERT INTO artwork_artists (artwork_id, artist_id, role) VALUES ($1, $2, $3)',
          [artworkId, artistId, 'creator']
        );
      }

      return { success: true, artworkId };
      
    } catch (error) {
      console.error(`작품 임포트 실패 (${artwork.objectID}):`, error.message);
      return { success: false, error: error.message };
    }
  }

  // 배치 처리
  async processBatch(artworks, batchIndex) {
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    console.log(`\n배치 ${batchIndex + 1} 처리 중... (${artworks.length}개 작품)`);
    
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i];
      const result = await this.importArtwork(artwork);
      
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
          process.stdout.write('S');
        } else {
          results.success++;
          process.stdout.write('✓');
        }
      } else {
        results.failed++;
        results.errors.push({
          objectID: artwork.objectID,
          error: result.error
        });
        process.stdout.write('✗');
      }
      
      // 매 10개마다 줄바꿈
      if ((i + 1) % 10 === 0) {
        process.stdout.write('\n');
      }
    }
    
    console.log(`\n배치 완료: 성공 ${results.success}, 실패 ${results.failed}, 건너뜀 ${results.skipped}`);
    return results;
  }

  // 메인 임포트 함수
  async importFromFile(filePath) {
    try {
      console.log(`파일 읽기: ${filePath}`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (!data.artworks || !Array.isArray(data.artworks)) {
        throw new Error('유효하지 않은 파일 형식: artworks 배열이 필요합니다.');
      }

      const artworks = data.artworks;
      const totalArtworks = artworks.length;
      
      console.log(`총 ${totalArtworks}개 작품을 배치 크기 ${this.batchSize}로 처리합니다.`);
      
      // 이전 진행 상황 확인
      const progress = await this.loadProgress();
      let startIndex = progress.processed || 0;
      
      if (startIndex > 0) {
        console.log(`이전 진행 상황 발견: ${startIndex}개 작품 처리 완료`);
        const continueImport = await this.promptContinue();
        if (!continueImport) {
          startIndex = 0;
        }
      }

      const totalResults = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      // 배치 단위로 처리
      for (let i = startIndex; i < totalArtworks; i += this.batchSize) {
        const batch = artworks.slice(i, Math.min(i + this.batchSize, totalArtworks));
        const batchIndex = Math.floor(i / this.batchSize);
        
        const batchResults = await this.processBatch(batch, batchIndex);
        
        // 결과 누적
        totalResults.success += batchResults.success;
        totalResults.failed += batchResults.failed;
        totalResults.skipped += batchResults.skipped;
        totalResults.errors.push(...batchResults.errors);
        
        // 진행 상황 저장
        const processed = i + batch.length;
        await this.saveProgress(processed, totalArtworks, batchIndex + 1);
        
        // 마지막 배치가 아니면 잠시 대기
        if (i + this.batchSize < totalArtworks) {
          console.log(`${this.delayBetweenBatches}ms 대기 중...`);
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
        }
      }

      // 최종 결과 출력
      console.log('\n=== 임포트 완료 ===');
      console.log(`총 처리: ${totalArtworks}개`);
      console.log(`성공: ${totalResults.success}개`);
      console.log(`실패: ${totalResults.failed}개`);
      console.log(`건너뜀: ${totalResults.skipped}개`);
      console.log(`성공률: ${((totalResults.success / totalArtworks) * 100).toFixed(2)}%`);

      // 실패한 항목들 저장
      if (totalResults.errors.length > 0) {
        const errorFile = `import-errors-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        await fs.writeFile(errorFile, JSON.stringify(totalResults.errors, null, 2));
        console.log(`오류 로그 저장: ${errorFile}`);
      }

      // 진행 상황 파일 삭제 (완료됨)
      await fs.unlink(this.progressFile).catch(() => {});

    } catch (error) {
      console.error('임포트 중 오류 발생:', error);
    }
  }

  // 계속 진행할지 묻기 (실제로는 자동으로 계속 진행)
  async promptContinue() {
    return true; // 자동으로 계속 진행
  }
}

// 실행
async function main() {
  const importer = new BatchArtworkImporter();
  
  // 명령행 인수로 파일 경로 받기
  const filePath = process.argv[2] || './met-artworks-data/met-artworks-with-cloudinary-2025-07-18T12-00-34-830Z.json';
  
  if (!await fs.access(filePath).then(() => true).catch(() => false)) {
    console.error(`파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  await importer.importFromFile(filePath);
  await pool.end();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BatchArtworkImporter;