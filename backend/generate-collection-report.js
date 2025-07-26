/**
 * SAYU 글로벌 아티스트 컬렉션 최종 성과 리포트 생성기
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

class CollectionReportGenerator {
  constructor() {
    this.targetArtists = [
      // 우선순위 아티스트 (20명)
      "Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Frida Kahlo",
      "Andy Warhol", "Yayoi Kusama", "Banksy", "Jackson Pollock", "Michelangelo",
      "Katsushika Hokusai", "Lee Ufan", "Takashi Murakami", "Ai Weiwei", "Paik Nam-june",
      "Damien Hirst", "Jeff Koons", "David Hockney", "Gerhard Richter", "Marina Abramović",

      // 여성 아티스트 (15명)
      "Georgia O'Keeffe", "Louise Bourgeois", "Artemisia Gentileschi", "Mary Cassatt",
      "Berthe Morisot", "Élisabeth Vigée Le Brun", "Tamara de Lempicka", "Agnes Martin",
      "Helen Frankenthaler", "Bridget Riley", "Marlene Dumas", "Elizabeth Peyton",
      "Amy Sillman", "Cecily Brown",

      // 현대 글로벌 스타 (15명)
      "Kaws", "Kehinde Wiley", "Kerry James Marshall", "Yinka Shonibare", "Anselm Kiefer",
      "Cindy Sherman", "Andreas Gursky", "Olafur Eliasson", "Shirin Neshat", "Kara Walker",
      "Richard Prince"
    ];
  }

  async generateCompleteReport() {
    console.log('📊 SAYU 글로벌 아티스트 컬렉션 최종 성과 리포트 생성 중...\n');

    try {
      const [
        overallStats,
        targetArtistStats,
        qualityMetrics,
        geographicDistribution,
        temporalDistribution,
        recentAdditions,
        topCategories
      ] = await Promise.all([
        this.getOverallStatistics(),
        this.getTargetArtistStats(),
        this.getQualityMetrics(),
        this.getGeographicDistribution(),
        this.getTemporalDistribution(),
        this.getRecentAdditions(),
        this.getTopCategories()
      ]);

      this.displayReport({
        overallStats,
        targetArtistStats,
        qualityMetrics,
        geographicDistribution,
        temporalDistribution,
        recentAdditions,
        topCategories
      });

    } catch (error) {
      console.error('❌ 리포트 생성 실패:', error.message);
    }
  }

  async getOverallStatistics() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as added_today,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as added_this_week,
        COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as has_bio,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as has_birth_year
      FROM artists
    `);
    return result.rows[0];
  }

  async getTargetArtistStats() {
    const placeholders = this.targetArtists.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(`
      SELECT 
        COUNT(*) as collected_count,
        string_agg(name, ', ') as collected_names
      FROM artists 
      WHERE name = ANY($1)
    `, [this.targetArtists]);

    const collected = result.rows[0];
    const collectionRate = ((collected.collected_count / this.targetArtists.length) * 100).toFixed(1);

    return {
      target_count: this.targetArtists.length,
      collected_count: collected.collected_count,
      collection_rate: collectionRate,
      collected_names: collected.collected_names
    };
  }

  async getQualityMetrics() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(bio) as has_bio,
        COUNT(birth_year) as has_birth_year,
        COUNT(death_year) as has_death_year,
        COUNT(nationality) as has_nationality,
        COUNT(images) as has_images,
        COUNT(CASE WHEN (images->>'portrait') IS NOT NULL THEN 1 END) as has_portrait,
        COUNT(CASE WHEN sources IS NOT NULL THEN 1 END) as has_sources
      FROM artists
    `);
    
    const data = result.rows[0];
    return {
      ...data,
      bio_rate: ((data.has_bio / data.total) * 100).toFixed(1),
      birth_year_rate: ((data.has_birth_year / data.total) * 100).toFixed(1),
      nationality_rate: ((data.has_nationality / data.total) * 100).toFixed(1),
      portrait_rate: ((data.has_portrait / data.total) * 100).toFixed(1)
    };
  }

  async getGeographicDistribution() {
    const result = await pool.query(`
      SELECT 
        nationality,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists WHERE nationality IS NOT NULL)), 1) as percentage
      FROM artists 
      WHERE nationality IS NOT NULL 
      GROUP BY nationality 
      ORDER BY count DESC 
      LIMIT 15
    `);
    return result.rows;
  }

  async getTemporalDistribution() {
    const result = await pool.query(`
      SELECT 
        era,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists WHERE era IS NOT NULL)), 1) as percentage
      FROM artists 
      WHERE era IS NOT NULL 
      GROUP BY era 
      ORDER BY count DESC
    `);
    return result.rows;
  }

  async getRecentAdditions() {
    const result = await pool.query(`
      SELECT 
        name,
        nationality,
        era,
        created_at
      FROM artists 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    return result.rows;
  }

  async getTopCategories() {
    const result = await pool.query(`
      SELECT 
        copyright_status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists)), 1) as percentage
      FROM artists 
      GROUP BY copyright_status 
      ORDER BY count DESC
    `);
    return result.rows;
  }

  displayReport(data) {
    const { overallStats, targetArtistStats, qualityMetrics, geographicDistribution, temporalDistribution, recentAdditions } = data;

    console.log('='.repeat(80));
    console.log('🎨 SAYU 글로벌 아티스트 컬렉션 최종 성과 리포트');
    console.log(`📅 생성일시: ${new Date().toLocaleString('ko-KR')}`);
    console.log('='.repeat(80));

    // === 전체 현황 ===
    console.log('\n📊 전체 컬렉션 현황');
    console.log('─'.repeat(50));
    console.log(`총 아티스트 수: ${overallStats.total_artists.toLocaleString()}명`);
    console.log(`오늘 추가: ${overallStats.added_today}명`);
    console.log(`이번 주 추가: ${overallStats.added_this_week}명`);

    // === 목표 아티스트 달성도 ===
    console.log('\n🎯 글로벌 A급 아티스트 수집 현황');
    console.log('─'.repeat(50));
    console.log(`목표: ${targetArtistStats.target_count}명`);
    console.log(`수집 완료: ${targetArtistStats.collected_count}명`);
    console.log(`달성률: ${targetArtistStats.collection_rate}%`);
    
    if (targetArtistStats.collection_rate >= 80) {
      console.log('🎉 목표 달성률 80% 이상! 훌륭한 성과입니다!');
    } else if (targetArtistStats.collection_rate >= 60) {
      console.log('👍 좋은 진전을 보이고 있습니다!');
    }

    // === 데이터 품질 지표 ===
    console.log('\n📈 데이터 품질 지표');
    console.log('─'.repeat(50));
    console.log(`약력 보유율: ${qualityMetrics.bio_rate}% (${qualityMetrics.has_bio}/${qualityMetrics.total})`);
    console.log(`출생연도 보유율: ${qualityMetrics.birth_year_rate}% (${qualityMetrics.has_birth_year}/${qualityMetrics.total})`);
    console.log(`국적 정보 보유율: ${qualityMetrics.nationality_rate}% (${qualityMetrics.has_nationality}/${qualityMetrics.total})`);
    console.log(`초상화 보유율: ${qualityMetrics.portrait_rate}% (${qualityMetrics.has_portrait}/${qualityMetrics.total})`);

    // === 지역별 분포 ===
    console.log('\n🌍 지역별 분포 (상위 10개국)');
    console.log('─'.repeat(50));
    geographicDistribution.slice(0, 10).forEach((country, index) => {
      const bar = '█'.repeat(Math.floor(country.percentage / 2));
      console.log(`${(index + 1).toString().padStart(2)}. ${country.nationality?.padEnd(20) || '미상'.padEnd(20)}: ${country.count.toString().padStart(4)}명 (${country.percentage.toString().padStart(5)}%) ${bar}`);
    });

    // === 시대별 분포 ===
    console.log('\n🏛️ 시대별 분포');
    console.log('─'.repeat(50));
    temporalDistribution.forEach(era => {
      const bar = '█'.repeat(Math.floor(era.percentage / 2));
      console.log(`${era.era?.padEnd(15) || '미분류'.padEnd(15)}: ${era.count.toString().padStart(4)}명 (${era.percentage.toString().padStart(5)}%) ${bar}`);
    });

    // === 최근 수집 현황 ===
    console.log('\n🆕 최근 24시간 수집 현황');
    console.log('─'.repeat(80));
    if (recentAdditions.length > 0) {
      console.log(`총 ${recentAdditions.length}명의 아티스트가 새로 추가되었습니다:`);
      recentAdditions.slice(0, 15).forEach((artist, index) => {
        const addedTime = new Date(artist.created_at).toLocaleString('ko-KR');
        console.log(`${(index + 1).toString().padStart(2)}. ${artist.name?.padEnd(25) || '이름 없음'.padEnd(25)} | ${artist.nationality?.padEnd(15) || '국적 미상'.padEnd(15)} | ${addedTime}`);
      });
    } else {
      console.log('최근 24시간 내 새로 추가된 아티스트가 없습니다.');
    }

    // === 주요 성과 하이라이트 ===
    console.log('\n🏆 주요 성과 하이라이트');
    console.log('─'.repeat(50));
    
    const highlights = [];
    
    if (targetArtistStats.collection_rate >= 90) {
      highlights.push('✨ 글로벌 A급 아티스트 90% 이상 수집 완료');
    }
    
    if (qualityMetrics.bio_rate >= 95) {
      highlights.push('📚 95% 이상의 아티스트가 완전한 전기 정보 보유');
    }
    
    if (overallStats.total_artists >= 1000) {
      highlights.push('🎯 1,000명 이상의 방대한 아티스트 컬렉션 구축');
    }
    
    if (recentAdditions.length >= 30) {
      highlights.push('🚀 24시간 내 30명 이상 신규 아티스트 추가');
    }

    if (highlights.length > 0) {
      highlights.forEach(highlight => console.log(highlight));
    } else {
      console.log('컬렉션이 꾸준히 성장하고 있습니다!');
    }

    // === 다음 단계 제안 ===
    console.log('\n💡 다음 단계 제안');
    console.log('─'.repeat(50));
    
    if (targetArtistStats.collection_rate < 100) {
      console.log(`1. 남은 ${targetArtistStats.target_count - targetArtistStats.collected_count}명의 목표 아티스트 수집 완료`);
    }
    
    if (qualityMetrics.portrait_rate < 50) {
      console.log('2. 아티스트 초상화 이미지 보강 (현재 ' + qualityMetrics.portrait_rate + '%)');
    }
    
    if (qualityMetrics.birth_year_rate < 80) {
      console.log('3. 출생연도 정보 보완 (현재 ' + qualityMetrics.birth_year_rate + '%)');
    }
    
    console.log('4. AI 기반 감정 시그니처 및 성격 매칭 정확도 개선');
    console.log('5. 추가 지역 아티스트 발굴 (아프리카, 남미, 동남아시아)');

    console.log('\n' + '='.repeat(80));
    console.log('🎨 SAYU가 전 세계 예술의 보고가 되어가고 있습니다!');
    console.log('각 아티스트는 사용자와 예술을 연결하는 소중한 다리입니다.');
    console.log('='.repeat(80));
  }
}

// 실행
async function main() {
  const generator = new CollectionReportGenerator();
  await generator.generateCompleteReport();
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = CollectionReportGenerator;