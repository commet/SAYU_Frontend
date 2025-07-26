/**
 * SAYU 글로벌 아티스트 수집을 위한 환경 설정 체크
 */

require('dotenv').config();

class EnvironmentChecker {
  constructor() {
    this.requirements = {
      essential: [
        'DATABASE_URL',
        'JWT_SECRET'
      ],
      recommended: [
        'OPENAI_API_KEY',
        'REPLICATE_API_TOKEN',
        'GOOGLE_AI_API_KEY'
      ],
      optional: [
        'CLOUDINARY_CLOUD_NAME',
        'SENTRY_DSN',
        'REDIS_URL'
      ]
    };

    this.status = {
      ready: false,
      warnings: [],
      errors: [],
      missing: []
    };
  }

  /**
   * 전체 환경 체크
   */
  checkEnvironment() {
    console.log('🔍 SAYU 환경 설정 체크 중...\n');

    // 필수 환경 변수 체크
    this.checkRequiredVars();
    
    // 데이터베이스 연결 체크
    this.checkDatabaseConnection();
    
    // API 키 체크
    this.checkAPIKeys();
    
    // Node.js 모듈 체크
    this.checkNodeModules();
    
    // 결과 출력
    this.displayResults();
    
    return this.status;
  }

  /**
   * 필수 환경 변수 체크
   */
  checkRequiredVars() {
    console.log('📋 필수 환경 변수 체크');
    console.log('─'.repeat(40));

    this.requirements.essential.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: 설정됨`);
      } else {
        console.log(`❌ ${varName}: 누락`);
        this.status.errors.push(`필수 환경 변수 ${varName}이 설정되지 않았습니다.`);
        this.status.missing.push(varName);
      }
    });

    console.log('\n📋 권장 환경 변수 체크');
    console.log('─'.repeat(40));

    this.requirements.recommended.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: 설정됨`);
      } else {
        console.log(`⚠️ ${varName}: 누락 (AI 기능 제한됨)`);
        this.status.warnings.push(`권장 환경 변수 ${varName}이 설정되지 않았습니다. AI 기능이 제한될 수 있습니다.`);
      }
    });

    console.log('\n📋 선택적 환경 변수 체크');
    console.log('─'.repeat(40));

    this.requirements.optional.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: 설정됨`);
      } else {
        console.log(`ℹ️ ${varName}: 누락 (선택사항)`);
      }
    });
  }

  /**
   * 데이터베이스 연결 체크
   */
  async checkDatabaseConnection() {
    console.log('\n🗄️ 데이터베이스 연결 체크');
    console.log('─'.repeat(40));

    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL이 설정되지 않음');
      this.status.errors.push('DATABASE_URL이 필요합니다.');
      return;
    }

    try {
      const { pool } = require('./src/config/database');
      
      // 간단한 연결 테스트
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ 데이터베이스 연결 성공');
      
      // artists 테이블 존재 확인
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'artists'
        );
      `);
      
      if (tableCheck.rows[0].exists) {
        console.log('✅ artists 테이블 존재');
        
        // 현재 아티스트 수 확인
        const countResult = await pool.query('SELECT COUNT(*) as count FROM artists');
        console.log(`ℹ️ 현재 ${countResult.rows[0].count}명의 아티스트가 저장됨`);
      } else {
        console.log('⚠️ artists 테이블 없음 (마이그레이션 필요)');
        this.status.warnings.push('artists 테이블이 존재하지 않습니다. 마이그레이션을 실행해주세요.');
      }
      
    } catch (error) {
      console.log('❌ 데이터베이스 연결 실패:', error.message);
      this.status.errors.push(`데이터베이스 연결 실패: ${error.message}`);
    }
  }

  /**
   * API 키 유효성 체크
   */
  async checkAPIKeys() {
    console.log('\n🔑 API 키 유효성 체크');
    console.log('─'.repeat(40));

    // OpenAI API 체크
    if (process.env.OPENAI_API_KEY) {
      try {
        const axios = require('axios');
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          timeout: 5000
        });
        
        if (response.status === 200) {
          console.log('✅ OpenAI API 키 유효');
        } else {
          console.log('❌ OpenAI API 키 무효');
          this.status.warnings.push('OpenAI API 키가 유효하지 않습니다.');
        }
      } catch (error) {
        console.log('⚠️ OpenAI API 키 확인 실패:', error.message);
        this.status.warnings.push('OpenAI API 키 확인에 실패했습니다.');
      }
    } else {
      console.log('ℹ️ OpenAI API 키 없음 (AI 분석 비활성화)');
    }

    // Met Museum API 체크 (키 불필요, 공개 API)
    try {
      const axios = require('axios');
      const response = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/search?q=artist', {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ Met Museum API 접근 가능');
      } else {
        console.log('⚠️ Met Museum API 접근 불가');
      }
    } catch (error) {
      console.log('⚠️ Met Museum API 확인 실패:', error.message);
      this.status.warnings.push('Met Museum API에 접근할 수 없습니다.');
    }

    // Cleveland Museum API 체크
    try {
      const axios = require('axios');
      const response = await axios.get('https://openaccess-api.clevelandart.org/api/artworks/?limit=1', {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ Cleveland Museum API 접근 가능');
      } else {
        console.log('⚠️ Cleveland Museum API 접근 불가');
      }
    } catch (error) {
      console.log('⚠️ Cleveland Museum API 확인 실패:', error.message);
      this.status.warnings.push('Cleveland Museum API에 접근할 수 없습니다.');
    }
  }

  /**
   * Node.js 모듈 체크
   */
  checkNodeModules() {
    console.log('\n📦 필수 Node.js 모듈 체크');
    console.log('─'.repeat(40));

    const requiredModules = [
      'pg',           // PostgreSQL
      'axios',        // HTTP 클라이언트
      'dotenv',       // 환경 변수
      'winston'       // 로깅
    ];

    requiredModules.forEach(moduleName => {
      try {
        require(moduleName);
        console.log(`✅ ${moduleName}: 설치됨`);
      } catch (error) {
        console.log(`❌ ${moduleName}: 설치 필요`);
        this.status.errors.push(`필수 모듈 ${moduleName}이 설치되지 않았습니다.`);
      }
    });
  }

  /**
   * 결과 출력
   */
  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 환경 설정 체크 결과');
    console.log('='.repeat(60));

    if (this.status.errors.length === 0) {
      if (this.status.warnings.length === 0) {
        console.log('🎉 모든 환경 설정이 완료되었습니다!');
        console.log('✅ 글로벌 아티스트 수집을 시작할 수 있습니다.');
        this.status.ready = true;
      } else {
        console.log('⚠️ 일부 경고가 있지만 기본 기능은 사용할 수 있습니다.');
        this.status.ready = true;
      }
    } else {
      console.log('❌ 환경 설정이 완료되지 않았습니다.');
      this.status.ready = false;
    }

    if (this.status.errors.length > 0) {
      console.log('\n🚨 오류:');
      this.status.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.status.warnings.length > 0) {
      console.log('\n⚠️ 경고:');
      this.status.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (this.status.missing.length > 0) {
      console.log('\n📝 필요한 설정:');
      console.log('다음 환경 변수를 .env 파일에 추가해주세요:');
      this.status.missing.forEach(varName => {
        console.log(`${varName}=your-${varName.toLowerCase().replace(/_/g, '-')}`);
      });
    }

    console.log('\n💡 다음 단계:');
    if (this.status.ready) {
      console.log('1. node global-artists-collector.js priority  # 우선순위 아티스트 20명 수집');
      console.log('2. node global-artists-collector.js all       # 전체 아티스트 100명 수집');
      console.log('3. node artist-collection-monitor.js          # 실시간 모니터링 시작');
    } else {
      console.log('1. 위의 오류들을 해결해주세요');
      console.log('2. npm install 실행 (필요한 경우)');
      console.log('3. .env 파일 설정 확인');
      console.log('4. 다시 이 스크립트를 실행해주세요');
    }

    console.log('='.repeat(60));
  }
}

// 실행
async function main() {
  const checker = new EnvironmentChecker();
  const result = await checker.checkEnvironment();
  
  process.exit(result.ready ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = EnvironmentChecker;