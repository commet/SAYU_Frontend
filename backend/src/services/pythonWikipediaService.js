const { spawn } = require('child_process');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * Python Wikipedia API와 Node.js 연동 서비스
 *
 * 기능:
 * 1. Python Wikipedia 수집기 실행
 * 2. 결과 데이터 처리
 * 3. 에러 핸들링
 * 4. 진행 상황 모니터링
 */
class PythonWikipediaService {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, 'wikipediaArtistCollector.py');
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensure;
  }

  /**
   * 단일 아티스트 정보 수집
   */
  async collectSingleArtist(artistName, options = {}) {
    try {
      logger.info(`🐍 Python Wikipedia 수집기로 '${artistName}' 처리 시작`);

      // 임시 디렉토리 확인
      await this.ensureTempDir();

      const outputFile = path.join(this.tempDir, `${Date.now()}_${artistName.replace(/[^a-zA-Z0-9]/g, '_')}.json`);

      // Python 스크립트 실행
      const result = await this.executePythonScript([
        '--artist', artistName,
        '--output', outputFile
      ]);

      if (result.success) {
        // 결과 파일 읽기
        try {
          const resultData = await fs.readFile(outputFile, 'utf8');
          const parsedResult = JSON.parse(resultData);

          // 임시 파일 정리
          await fs.unlink(outputFile).catch(() => {}); // 실패해도 무시

          logger.info(`✅ Python Wikipedia 수집 완료: ${artistName}`);
          return {
            success: true,
            artist: parsedResult.successful?.[0] || null,
            pythonOutput: result.output
          };
        } catch (fileError) {
          logger.error(`결과 파일 읽기 실패: ${outputFile}`, fileError);
          return {
            success: false,
            error: 'Result file read failed',
            pythonOutput: result.output
          };
        }
      } else {
        logger.error(`Python 스크립트 실행 실패: ${artistName}`, result.error);
        return {
          success: false,
          error: result.error,
          pythonOutput: result.output
        };
      }

    } catch (error) {
      logger.error(`Python Wikipedia 서비스 오류: ${artistName}`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 배치 아티스트 정보 수집
   */
  async collectArtistsBatch(artistNames, options = {}) {
    try {
      logger.info(`🐍 Python Wikipedia 배치 수집 시작: ${artistNames.length}명`);

      // 임시 디렉토리 확인
      await this.ensureTempDir();

      // 아티스트 목록 파일 생성
      const listFile = path.join(this.tempDir, `artists_${Date.now()}.txt`);
      await fs.writeFile(listFile, artistNames.join('\n'), 'utf8');

      const outputFile = path.join(this.tempDir, `batch_result_${Date.now()}.json`);

      // Python 스크립트 실행
      const result = await this.executePythonScript([
        '--batch', listFile,
        '--output', outputFile
      ]);

      // 임시 목록 파일 정리
      await fs.unlink(listFile).catch(() => {});

      if (result.success) {
        try {
          const resultData = await fs.readFile(outputFile, 'utf8');
          const parsedResult = JSON.parse(resultData);

          // 결과 파일 정리
          await fs.unlink(outputFile).catch(() => {});

          logger.info(`✅ Python Wikipedia 배치 수집 완료: ${parsedResult.successful?.length || 0}명 성공`);

          return {
            success: true,
            results: parsedResult,
            pythonOutput: result.output
          };
        } catch (fileError) {
          logger.error(`배치 결과 파일 읽기 실패: ${outputFile}`, fileError);
          return {
            success: false,
            error: 'Batch result file read failed',
            pythonOutput: result.output
          };
        }
      } else {
        logger.error('Python 배치 스크립트 실행 실패', result.error);
        return {
          success: false,
          error: result.error,
          pythonOutput: result.output
        };
      }

    } catch (error) {
      logger.error('Python Wikipedia 배치 서비스 오류', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 하이브리드 수집: Node.js + Python 결합
   */
  async hybridArtistCollection(artistName, options = {}) {
    try {
      logger.info(`🔄 하이브리드 아티스트 수집 시작: ${artistName}`);

      // 1. 기존 Node.js 서비스로 1차 수집
      const nodeResult = await this.collectWithNodeService(artistName);

      // 2. Python Wikipedia API로 보완 수집
      const pythonResult = await this.collectSingleArtist(artistName, options);

      // 3. 두 결과 병합
      const mergedResult = await this.mergeCollectionResults(nodeResult, pythonResult, artistName);

      logger.info(`✅ 하이브리드 수집 완료: ${artistName}`);
      return mergedResult;

    } catch (error) {
      logger.error(`하이브리드 수집 실패: ${artistName}`, error);
      throw error;
    }
  }

  /**
   * Python 스크립트 실행
   */
  async executePythonScript(args) {
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [this.pythonScriptPath, ...args], {
        cwd: path.dirname(this.pythonScriptPath)
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        // 실시간 로그 출력
        logger.info(`Python: ${data.toString().trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        logger.warn(`Python Error: ${data.toString().trim()}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output,
            error: null
          });
        } else {
          resolve({
            success: false,
            output,
            error: errorOutput || `Python script exited with code ${code}`
          });
        }
      });

      pythonProcess.on('error', (error) => {
        logger.error('Python 프로세스 실행 오류', error);
        resolve({
          success: false,
          output,
          error: error.message
        });
      });
    });
  }

  /**
   * Node.js 서비스로 1차 수집
   */
  async collectWithNodeService(artistName) {
    try {
      // 기존 enhancedArtistCollectorService 사용
      const EnhancedArtistCollectorService = require('./enhancedArtistCollectorService');
      return await EnhancedArtistCollectorService.collectArtistInfo(artistName);
    } catch (error) {
      logger.warn(`Node.js 1차 수집 실패: ${artistName}`, error.message);
      return null;
    }
  }

  /**
   * Node.js와 Python 결과 병합
   */
  async mergeCollectionResults(nodeResult, pythonResult, artistName) {
    const merged = {
      name: artistName,
      sources: {
        nodejs: nodeResult ? 'collected' : 'failed',
        python: pythonResult.success ? 'collected' : 'failed'
      },
      confidence: 0.5
    };

    // Node.js 결과 처리
    if (nodeResult) {
      Object.assign(merged, nodeResult);
      merged.confidence += 0.3;
    }

    // Python 결과 처리 (더 정확한 정보로 덮어쓰기)
    if (pythonResult.success && pythonResult.artist) {
      const pythonData = pythonResult.artist.info;

      // Python 데이터가 더 상세한 경우 우선 적용
      if (pythonData.biography && pythonData.biography.length > (merged.bio?.length || 0)) {
        merged.bio = pythonData.biography;
      }

      if (pythonData.birth_year && !merged.birth_year) {
        merged.birth_year = pythonData.birth_year;
      }

      if (pythonData.death_year && !merged.death_year) {
        merged.death_year = pythonData.death_year;
      }

      if (pythonData.nationality && !merged.nationality) {
        merged.nationality = pythonData.nationality;
      }

      merged.confidence += 0.4;
    }

    // 최종 신뢰도 계산
    merged.confidence = Math.min(1.0, merged.confidence);

    // DB 저장
    if (merged.confidence > 0.6) {
      await this.saveMergedArtist(merged);
    }

    return merged;
  }

  /**
   * 병합된 아티스트 정보 DB 저장
   */
  async saveMergedArtist(artistData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 중복 확인
      const existingCheck = await client.query(
        'SELECT id FROM artists WHERE LOWER(name) = LOWER($1)',
        [artistData.name]
      );

      if (existingCheck.rows.length > 0) {
        // 업데이트
        const updateQuery = `
          UPDATE artists SET
            bio = COALESCE($2, bio),
            birth_year = COALESCE($3, birth_year),
            death_year = COALESCE($4, death_year),
            nationality = COALESCE($5, nationality),
            sources = $6,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;

        const result = await client.query(updateQuery, [
          existingCheck.rows[0].id,
          artistData.bio,
          artistData.birth_year,
          artistData.death_year,
          artistData.nationality,
          JSON.stringify(artistData.sources)
        ]);

        await client.query('COMMIT');
        logger.info(`✅ 병합된 아티스트 정보 업데이트: ${artistData.name}`);
        return result.rows[0];

      } else {
        // 새로 삽입
        const insertQuery = `
          INSERT INTO artists (
            name, bio, birth_year, death_year, nationality,
            sources, copyright_status, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;

        const result = await client.query(insertQuery, [
          artistData.name,
          artistData.bio,
          artistData.birth_year,
          artistData.death_year,
          artistData.nationality,
          JSON.stringify(artistData.sources),
          this.determineCopyrightStatus(artistData),
          artistData.confidence > 0.8
        ]);

        await client.query('COMMIT');
        logger.info(`✅ 병합된 새 아티스트 정보 저장: ${artistData.name}`);
        return result.rows[0];
      }

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('병합된 아티스트 DB 저장 실패', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 임시 디렉토리 확인/생성
   */
  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
      logger.info(`임시 디렉토리 생성: ${this.tempDir}`);
    }
  }

  /**
   * Python 환경 확인
   */
  async checkPythonEnvironment() {
    try {
      const result = await this.executePythonScript(['--help']);
      return result.success;
    } catch (error) {
      logger.error('Python 환경 확인 실패', error);
      return false;
    }
  }

  /**
   * 필요한 Python 패키지 설치 가이드
   */
  getInstallationGuide() {
    return {
      title: 'Python Wikipedia API 설정 가이드',
      steps: [
        'Python 3.7+ 설치 확인: python --version',
        'pip 업그레이드: python -m pip install --upgrade pip',
        '필수 패키지 설치:',
        '  pip install wikipedia-api',
        '  pip install requests',
        '  pip install psycopg2-binary',
        '  pip install openai',
        '환경 변수 설정:',
        '  DB_HOST, DB_NAME, DB_USER, DB_PASSWORD',
        '  OPENAI_API_KEY (선택사항)',
        '테스트: python wikipediaArtistCollector.py --artist "Pablo Picasso"'
      ]
    };
  }

  /**
   * 저작권 상태 판단
   */
  determineCopyrightStatus(artistData) {
    const currentYear = new Date().getFullYear();

    if (artistData.death_year) {
      const yearsSinceDeath = currentYear - artistData.death_year;
      if (yearsSinceDeath >= 70) return 'public_domain';
      if (yearsSinceDeath >= 50) return 'transitional';
      return 'licensed';
    } else if (artistData.birth_year) {
      const age = currentYear - artistData.birth_year;
      if (age > 150) return 'public_domain';
      return 'contemporary';
    }

    return 'unknown';
  }

  /**
   * 수집 통계 조회
   */
  async getCollectionStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_artists,
          COUNT(CASE WHEN sources::text LIKE '%python%' THEN 1 END) as python_collected,
          COUNT(CASE WHEN sources::text LIKE '%nodejs%' THEN 1 END) as nodejs_collected,
          COUNT(CASE WHEN sources::text LIKE '%python%' AND sources::text LIKE '%nodejs%' THEN 1 END) as hybrid_collected,
          AVG(CASE WHEN bio IS NOT NULL THEN length(bio) END) as avg_bio_length
        FROM artists
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('수집 통계 조회 실패', error);
      return null;
    }
  }
}

module.exports = new PythonWikipediaService();
