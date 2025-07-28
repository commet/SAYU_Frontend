/**
 * SAYU 아티스트 수집 실시간 모니터링 대시보드
 *
 * 수집 과정을 실시간으로 모니터링하고
 * 상세한 진행 상황과 통계를 제공합니다.
 */

require('dotenv').config();
const { pool } = require('./src/config/database');
const { logger } = require('./src/config/logger');

class ArtistCollectionMonitor {
  constructor() {
    this.monitoring = false;
    this.stats = {
      totalArtists: 0,
      recentlyAdded: 0,
      dbConnections: 0,
      apiCalls: 0,
      errors: 0
    };
  }

  /**
   * 현재 DB 상태 조회
   */
  async getCurrentDatabaseState() {
    try {
      const queries = await Promise.all([
        // 전체 아티스트 수
        pool.query('SELECT COUNT(*) as total FROM artists'),

        // 시대별 분포
        pool.query(`
          SELECT era, COUNT(*) as count 
          FROM artists 
          WHERE era IS NOT NULL 
          GROUP BY era 
          ORDER BY count DESC
        `),

        // 국적별 분포 (상위 15개)
        pool.query(`
          SELECT nationality, COUNT(*) as count 
          FROM artists 
          WHERE nationality IS NOT NULL 
          GROUP BY nationality 
          ORDER BY count DESC 
          LIMIT 15
        `),

        // 최근 24시간 추가된 아티스트
        pool.query(`
          SELECT COUNT(*) as recent_count 
          FROM artists 
          WHERE created_at > NOW() - INTERVAL '24 hours'
        `),

        // 데이터 품질 지표
        pool.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(bio) as has_bio,
            COUNT(birth_year) as has_birth_year,
            COUNT(images) as has_images,
            COUNT(CASE WHEN (images->>'portrait') IS NOT NULL THEN 1 END) as has_portrait
          FROM artists
        `),

        // 저작권 상태 분포
        pool.query(`
          SELECT copyright_status, COUNT(*) as count 
          FROM artists 
          WHERE copyright_status IS NOT NULL 
          GROUP BY copyright_status 
          ORDER BY count DESC
        `),

        // 최근 추가된 아티스트 샘플
        pool.query(`
          SELECT name, nationality, era, created_at 
          FROM artists 
          ORDER BY created_at DESC 
          LIMIT 10
        `)
      ]);

      return {
        total: queries[0].rows[0].total,
        eraDistribution: queries[1].rows,
        nationalityDistribution: queries[2].rows,
        recentlyAdded: queries[3].rows[0].recent_count,
        qualityMetrics: queries[4].rows[0],
        copyrightDistribution: queries[5].rows,
        recentArtists: queries[6].rows
      };

    } catch (error) {
      logger.error('DB 상태 조회 실패:', error.message);
      throw error;
    }
  }

  /**
   * 대시보드 출력
   */
  displayDashboard(data) {
    console.clear();

    const timestamp = new Date().toLocaleString('ko-KR');

    console.log('='.repeat(80));
    console.log('🎨 SAYU 글로벌 아티스트 컬렉션 모니터링 대시보드');
    console.log(`📅 ${timestamp}`);
    console.log('='.repeat(80));

    // === 기본 통계 ===
    console.log('\n📊 현재 아티스트 현황');
    console.log('─'.repeat(40));
    console.log(`총 아티스트 수: ${data.total.toLocaleString()}명`);
    console.log(`24시간 신규 추가: ${data.recentlyAdded}명`);

    // === 데이터 품질 지표 ===
    const quality = data.qualityMetrics;
    const bioRate = ((quality.has_bio / quality.total) * 100).toFixed(1);
    const birthYearRate = ((quality.has_birth_year / quality.total) * 100).toFixed(1);
    const portraitRate = ((quality.has_portrait / quality.total) * 100).toFixed(1);

    console.log('\n📈 데이터 품질 지표');
    console.log('─'.repeat(40));
    console.log(`약력 보유율: ${bioRate}% (${quality.has_bio}/${quality.total})`);
    console.log(`출생연도 보유율: ${birthYearRate}% (${quality.has_birth_year}/${quality.total})`);
    console.log(`초상화 보유율: ${portraitRate}% (${quality.has_portrait}/${quality.total})`);

    // === 시대별 분포 ===
    console.log('\n🏛️ 시대별 분포');
    console.log('─'.repeat(40));
    data.eraDistribution.forEach(era => {
      const percentage = ((era.count / data.total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`${era.era?.padEnd(15) || '미분류'.padEnd(15)}: ${era.count.toString().padStart(4)}명 (${percentage.padStart(5)}%) ${bar}`);
    });

    // === 국적별 분포 (상위 10개) ===
    console.log('\n🌍 국적별 분포 (상위 10개)');
    console.log('─'.repeat(40));
    data.nationalityDistribution.slice(0, 10).forEach(country => {
      const percentage = ((country.count / data.total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`${country.nationality?.padEnd(15) || '미상'.padEnd(15)}: ${country.count.toString().padStart(4)}명 (${percentage.padStart(5)}%) ${bar}`);
    });

    // === 저작권 상태 분포 ===
    console.log('\n⚖️ 저작권 상태 분포');
    console.log('─'.repeat(40));
    data.copyrightDistribution.forEach(status => {
      const percentage = ((status.count / data.total) * 100).toFixed(1);
      const statusName = this.getCopyrightStatusName(status.copyright_status);
      console.log(`${statusName.padEnd(15)}: ${status.count.toString().padStart(4)}명 (${percentage.padStart(5)}%)`);
    });

    // === 최근 추가된 아티스트 ===
    console.log('\n🆕 최근 추가된 아티스트 (상위 10명)');
    console.log('─'.repeat(80));
    data.recentArtists.forEach((artist, index) => {
      const addedTime = new Date(artist.created_at).toLocaleString('ko-KR');
      console.log(`${(index + 1).toString().padStart(2)}. ${artist.name?.padEnd(25) || '이름 없음'.padEnd(25)} | ${artist.nationality?.padEnd(12) || '국적 미상'.padEnd(12)} | ${artist.era?.padEnd(12) || '시대 미상'.padEnd(12)} | ${addedTime}`);
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log('💡 명령어: [Enter] 새로고침 | [q] 종료 | [s] 상세통계 | [c] 수집시작');
    console.log('='.repeat(80));
  }

  /**
   * 저작권 상태 한글명 반환
   */
  getCopyrightStatusName(status) {
    const statusMap = {
      'public_domain': '퍼블릭 도메인',
      'licensed': '라이선스 필요',
      'contemporary': '현대 작가',
      'transitional': '전환기',
      'unknown': '미상',
      'estate_managed': '유족 관리'
    };
    return statusMap[status] || status;
  }

  /**
   * 상세 통계 표시
   */
  async displayDetailedStats() {
    try {
      console.clear();
      console.log('📊 상세 통계 분석 중...\n');

      const queries = await Promise.all([
        // 연도별 작가 분포
        pool.query(`
          SELECT 
            CASE 
              WHEN birth_year < 1400 THEN '14세기 이전'
              WHEN birth_year < 1500 THEN '14-15세기'
              WHEN birth_year < 1600 THEN '15-16세기'
              WHEN birth_year < 1700 THEN '16-17세기'
              WHEN birth_year < 1800 THEN '17-18세기'
              WHEN birth_year < 1850 THEN '18-19세기 전반'
              WHEN birth_year < 1900 THEN '19세기 후반'
              WHEN birth_year < 1920 THEN '1900-1920'
              WHEN birth_year < 1940 THEN '1920-1940'
              WHEN birth_year < 1960 THEN '1940-1960'
              WHEN birth_year < 1980 THEN '1960-1980'
              ELSE '1980년 이후'
            END as period,
            COUNT(*) as count
          FROM artists
          WHERE birth_year IS NOT NULL
          GROUP BY period
          ORDER BY MIN(birth_year)
        `),

        // 성별 분포 (이름 패턴 기반 추정)
        pool.query(`
          SELECT 
            CASE 
              WHEN name ILIKE '%maria%' OR name ILIKE '%anna%' OR name ILIKE '%elizabeth%' 
                OR name ILIKE '%mary%' OR name ILIKE '%louise%' OR name ILIKE '%agnes%'
                OR name ILIKE '%frida%' OR name ILIKE '%georgia%' OR name ILIKE '%yayoi%'
                OR name ILIKE '%artemisia%' OR name ILIKE '%berthe%' OR name ILIKE '%tamara%'
                OR name ILIKE '%helen%' OR name ILIKE '%bridget%' OR name ILIKE '%marlene%'
                OR name ILIKE '%cecily%' OR name ILIKE '%amy%' OR name ILIKE '%elizabeth%'
                OR name ILIKE '%cindy%' OR name ILIKE '%kara%' OR name ILIKE '%shirin%'
                OR name ILIKE '%marina%' OR name ILIKE '%barbara%' THEN '여성 (추정)'
              ELSE '남성 (추정)'
            END as gender_estimate,
            COUNT(*) as count
          FROM artists
          GROUP BY gender_estimate
        `),

        // 활동 지역별 분포
        pool.query(`
          SELECT 
            CASE 
              WHEN nationality IN ('American', 'United States', 'USA') THEN '미국'
              WHEN nationality IN ('French', 'France') THEN '프랑스'
              WHEN nationality IN ('German', 'Germany') THEN '독일'
              WHEN nationality IN ('British', 'English', 'UK', 'United Kingdom') THEN '영국'
              WHEN nationality IN ('Italian', 'Italy') THEN '이탈리아'
              WHEN nationality IN ('Spanish', 'Spain') THEN '스페인'
              WHEN nationality IN ('Dutch', 'Netherlands') THEN '네덜란드'
              WHEN nationality IN ('Chinese', 'China') THEN '중국'
              WHEN nationality IN ('Japanese', 'Japan') THEN '일본'
              WHEN nationality IN ('Korean', 'South Korea', 'Korea') THEN '한국'
              ELSE '기타'
            END as region,
            COUNT(*) as count
          FROM artists
          WHERE nationality IS NOT NULL
          GROUP BY region
          ORDER BY count DESC
        `),

        // 데이터 소스 분포
        pool.query(`
          SELECT 
            CASE 
              WHEN sources::text LIKE '%wikipedia%' THEN '위키피디아'
              WHEN sources::text LIKE '%wikidata%' THEN '위키데이터'
              WHEN sources::text LIKE '%met%' THEN 'Met Museum'
              WHEN sources::text LIKE '%cleveland%' THEN 'Cleveland Museum'
              ELSE '기타 소스'
            END as source_type,
            COUNT(*) as count
          FROM artists
          WHERE sources IS NOT NULL
          GROUP BY source_type
          ORDER BY count DESC
        `)
      ]);

      console.log('🕐 연도별 작가 분포');
      console.log('─'.repeat(50));
      queries[0].rows.forEach(period => {
        console.log(`${period.period.padEnd(20)}: ${period.count}명`);
      });

      console.log('\n👥 성별 분포 (이름 패턴 기반 추정)');
      console.log('─'.repeat(50));
      queries[1].rows.forEach(gender => {
        console.log(`${gender.gender_estimate.padEnd(20)}: ${gender.count}명`);
      });

      console.log('\n🗺️ 주요 활동 지역별 분포');
      console.log('─'.repeat(50));
      queries[2].rows.forEach(region => {
        console.log(`${region.region.padEnd(20)}: ${region.count}명`);
      });

      console.log('\n📚 데이터 소스별 분포');
      console.log('─'.repeat(50));
      queries[3].rows.forEach(source => {
        console.log(`${source.source_type.padEnd(20)}: ${source.count}명`);
      });

      console.log('\n[Enter] 메인으로 돌아가기');

    } catch (error) {
      console.error('상세 통계 조회 실패:', error.message);
    }
  }

  /**
   * 대화형 모니터링 시작
   */
  async startInteractiveMonitoring() {
    this.monitoring = true;

    console.log('🎨 SAYU 아티스트 컬렉션 모니터링을 시작합니다...\n');

    // 초기 대시보드 표시
    try {
      const data = await this.getCurrentDatabaseState();
      this.displayDashboard(data);
    } catch (error) {
      console.error('❌ 초기 데이터 로딩 실패:', error.message);
      console.log('DB 연결을 확인해주세요. [Enter]로 재시도하거나 [q]로 종료하세요.');
    }

    // 입력 처리
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', async (key) => {
      try {
        if (key === 'q' || key === '\u0003') { // q 또는 Ctrl+C
          this.stopMonitoring();
          return;
        }

        if (key === 's') {
          await this.displayDetailedStats();
          return;
        }

        if (key === 'c') {
          console.clear();
          console.log('🚀 글로벌 아티스트 수집을 시작하시겠습니까?');
          console.log('1. 우선순위 아티스트만 (20명)');
          console.log('2. 전체 아티스트 (100명)');
          console.log('3. 취소');
          return;
        }

        if (key === '\r' || key === '\n') { // Enter
          const data = await this.getCurrentDatabaseState();
          this.displayDashboard(data);
        }

      } catch (error) {
        console.error('❌ 명령 처리 중 오류:', error.message);
        console.log('[Enter]로 재시도하거나 [q]로 종료하세요.');
      }
    });
  }

  /**
   * 모니터링 종료
   */
  stopMonitoring() {
    this.monitoring = false;
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.clear();
    console.log('👋 모니터링을 종료합니다. SAYU 아티스트 컬렉션을 계속 발전시켜 나가겠습니다!');
    process.exit(0);
  }

  /**
   * 자동 새로고침 모니터링 (백그라운드)
   */
  startAutoRefresh(intervalSeconds = 30) {
    const interval = setInterval(async () => {
      if (!this.monitoring) {
        clearInterval(interval);
        return;
      }

      try {
        const data = await this.getCurrentDatabaseState();
        this.displayDashboard(data);
      } catch (error) {
        logger.error('자동 새로고침 실패:', error.message);
      }
    }, intervalSeconds * 1000);

    return interval;
  }
}

// CLI 실행
async function main() {
  const monitor = new ArtistCollectionMonitor();

  try {
    await monitor.startInteractiveMonitoring();
  } catch (error) {
    console.error('❌ 모니터링 시작 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = ArtistCollectionMonitor;
