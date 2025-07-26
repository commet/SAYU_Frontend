/**
 * SAYU 글로벌 A급 아티스트 자동 수집 시스템
 * 
 * 전 세계적으로 인정받는 핵심 아티스트 100명을 선정하여
 * enhancedArtistCollectorService를 통해 배치 수집합니다.
 * 
 * 선정 기준:
 * - 미술사적 중요성
 * - 글로벌 인지도
 * - 작품의 접근성
 * - 다양성 (지역, 시대, 장르, 성별)
 */

require('dotenv').config();
const enhancedArtistCollectorService = require('./src/services/enhancedArtistCollectorService');
const { logger } = require('./src/config/logger');

class GlobalArtistsCollector {
  constructor() {
    // 글로벌 A급 아티스트 100명 선정
    this.globalArtists = {
      // === 서양 고전/근대 거장 (25명) ===
      classical: [
        "Leonardo da Vinci",
        "Michelangelo",
        "Raphael",
        "Caravaggio",
        "Rembrandt",
        "Johannes Vermeer",
        "Francisco Goya",
        "Jacques-Louis David",
        "Eugène Delacroix",
        "Jean-Auguste-Dominique Ingres",
        "Caspar David Friedrich",
        "J.M.W. Turner",
        "John Constable",
        "Gustave Courbet",
        "Édouard Manet",
        "Edgar Degas",
        "Pierre-Auguste Renoir",
        "Claude Monet",
        "Paul Cézanne",
        "Vincent van Gogh",
        "Paul Gauguin",
        "Georges Seurat",
        "Henri de Toulouse-Lautrec",
        "Gustav Klimt",
        "Egon Schiele"
      ],

      // === 현대 서양 거장 (20명) ===
      modern_western: [
        "Pablo Picasso",
        "Henri Matisse",
        "Wassily Kandinsky",
        "Piet Mondrian",
        "Paul Klee",
        "Joan Miró",
        "Salvador Dalí",
        "René Magritte",
        "Marcel Duchamp",
        "Jackson Pollock",
        "Mark Rothko",
        "Willem de Kooning",
        "Andy Warhol",
        "Roy Lichtenstein",
        "Jasper Johns",
        "Robert Rauschenberg",
        "Francis Bacon",
        "Lucian Freud",
        "David Hockney",
        "Gerhard Richter"
      ],

      // === 동양 대표 작가 (15명) ===
      asian_masters: [
        // 중국
        "Qi Baishi",
        "Zhang Daqian",
        "Xu Beihong",
        "Wu Guanzhong",
        "Ai Weiwei",
        
        // 일본
        "Katsushika Hokusai",
        "Utagawa Hiroshige",
        "Yayoi Kusama",
        "Takashi Murakami",
        "Hiroshi Sugimoto",
        
        // 한국
        "Lee Ufan",
        "Park Seo-bo",
        "Kim Whanki",
        "Paik Nam-june",
        "Do Ho Suh"
      ],

      // === 현대 글로벌 스타 (15명) ===
      contemporary_global: [
        "Banksy",
        "Damien Hirst",
        "Jeff Koons",
        "Kaws",
        "Kehinde Wiley",
        "Kerry James Marshall",
        "Yinka Shonibare",
        "Anselm Kiefer",
        "Cindy Sherman",
        "Andreas Gursky",
        "Olafur Eliasson",
        "Marina Abramović",
        "Shirin Neshat",
        "Kara Walker",
        "Richard Prince"
      ],

      // === 여성 아티스트 강화 (15명) ===
      female_artists: [
        "Frida Kahlo",
        "Georgia O'Keeffe",
        "Louise Bourgeois",
        "Artemisia Gentileschi",
        "Mary Cassatt",
        "Berthe Morisot",
        "Élisabeth Vigée Le Brun",
        "Tamara de Lempicka",
        "Agnes Martin",
        "Helen Frankenthaler",
        "Bridget Riley",
        "Marlene Dumas",
        "Elizabeth Peyton",
        "Amy Sillman",
        "Cecily Brown"
      ],

      // === 조각/설치 전문가 (10명) ===
      sculptors: [
        "Auguste Rodin",
        "Constantin Brâncuși",
        "Henry Moore",
        "Alberto Giacometti",
        "Barbara Hepworth",
        "Alexander Calder",
        "Richard Serra",
        "Anish Kapoor",
        "Antony Gormley",
        "Tino Sehgal"
      ]
    };

    // 수집 통계
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * 전체 아티스트 리스트 반환
   */
  getAllArtists() {
    const allArtists = [];
    Object.values(this.globalArtists).forEach(category => {
      allArtists.push(...category);
    });
    return [...new Set(allArtists)]; // 중복 제거
  }

  /**
   * 카테고리별 수집 실행
   */
  async collectByCategory(categoryName, options = {}) {
    const artists = this.globalArtists[categoryName];
    if (!artists) {
      throw new Error(`카테고리를 찾을 수 없습니다: ${categoryName}`);
    }

    logger.info(`🎨 ${categoryName} 카테고리 수집 시작: ${artists.length}명`);
    
    const results = await enhancedArtistCollectorService.collectArtistsBatch(
      artists,
      {
        delay: options.delay || 2000, // API 율한 제한 고려
        forceUpdate: options.forceUpdate || false
      }
    );

    this.updateStats(results);
    this.logCategoryResults(categoryName, results);
    
    return results;
  }

  /**
   * 전체 아티스트 수집 실행
   */
  async collectAllArtists(options = {}) {
    this.stats.startTime = new Date();
    this.stats.total = this.getAllArtists().length;

    logger.info(`🚀 글로벌 A급 아티스트 전체 수집 시작`);
    logger.info(`📊 총 ${this.stats.total}명의 아티스트 수집 예정`);
    
    const allResults = {
      successful: [],
      failed: [],
      skipped: []
    };

    // 카테고리별 순차 실행 (서버 부하 고려)
    for (const [categoryName, artists] of Object.entries(this.globalArtists)) {
      try {
        logger.info(`\n=== ${categoryName.toUpperCase()} 카테고리 시작 ===`);
        
        const categoryResults = await this.collectByCategory(categoryName, options);
        
        // 결과 통합
        allResults.successful.push(...categoryResults.successful);
        allResults.failed.push(...categoryResults.failed);
        allResults.skipped.push(...categoryResults.skipped);

        // 카테고리 간 대기 시간 (서버 부하 방지)
        if (options.categoryDelay) {
          logger.info(`⏳ 다음 카테고리까지 ${options.categoryDelay/1000}초 대기...`);
          await new Promise(resolve => setTimeout(resolve, options.categoryDelay));
        }

      } catch (error) {
        logger.error(`❌ ${categoryName} 카테고리 수집 실패:`, error.message);
      }
    }

    this.stats.endTime = new Date();
    this.logFinalResults(allResults);
    
    return allResults;
  }

  /**
   * 우선순위 기반 수집 (상위 20명만)
   */
  async collectPriorityArtists() {
    const priorityArtists = [
      // 절대 필수 (10명)
      "Leonardo da Vinci",
      "Pablo Picasso",
      "Vincent van Gogh",
      "Claude Monet",
      "Frida Kahlo",
      "Andy Warhol",
      "Yayoi Kusama",
      "Banksy",
      "Jackson Pollock",
      "Michelangelo",
      
      // 아시아 대표 (5명)
      "Katsushika Hokusai",
      "Lee Ufan",
      "Takashi Murakami",
      "Ai Weiwei",
      "Paik Nam-june",
      
      // 현대 중요 작가 (5명)
      "Damien Hirst",
      "Jeff Koons",
      "David Hockney",
      "Gerhard Richter",
      "Marina Abramović"
    ];

    logger.info(`⭐ 우선순위 아티스트 수집 시작: ${priorityArtists.length}명`);
    
    return await enhancedArtistCollectorService.collectArtistsBatch(
      priorityArtists,
      {
        delay: 1500,
        forceUpdate: true
      }
    );
  }

  /**
   * 통계 업데이트
   */
  updateStats(results) {
    this.stats.successful += results.successful.length;
    this.stats.failed += results.failed.length;
    this.stats.skipped += results.skipped.length;
  }

  /**
   * 카테고리별 결과 로깅
   */
  logCategoryResults(categoryName, results) {
    const total = results.successful.length + results.failed.length + results.skipped.length;
    const successRate = ((results.successful.length / total) * 100).toFixed(1);
    
    logger.info(`✅ ${categoryName} 완료: ${results.successful.length}/${total} (${successRate}%)`);
    
    if (results.failed.length > 0) {
      logger.warn(`❌ 실패한 아티스트: ${results.failed.map(f => f.name).join(', ')}`);
    }
  }

  /**
   * 최종 결과 리포트
   */
  logFinalResults(results) {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const successRate = ((this.stats.successful / this.stats.total) * 100).toFixed(1);
    
    logger.info(`\n🎯 글로벌 아티스트 수집 완료!`);
    logger.info(`📊 최종 통계:`);
    logger.info(`   - 총 대상: ${this.stats.total}명`);
    logger.info(`   - 성공: ${this.stats.successful}명`);
    logger.info(`   - 실패: ${this.stats.failed}명`);
    logger.info(`   - 건너뜀: ${this.stats.skipped}명`);
    logger.info(`   - 성공률: ${successRate}%`);
    logger.info(`   - 소요시간: ${duration.toFixed(1)}초`);
    logger.info(`   - 평균 속도: ${(this.stats.total / duration).toFixed(2)}명/초`);

    if (results.failed.length > 0) {
      logger.warn(`\n❌ 수집 실패 아티스트 (${results.failed.length}명):`);
      results.failed.forEach(failed => {
        logger.warn(`   - ${failed.name}: ${failed.error}`);
      });
    }

    // 성공한 아티스트들의 카테고리별 분포
    this.logSuccessDistribution(results.successful);
  }

  /**
   * 성공한 아티스트들의 분포 분석
   */
  logSuccessDistribution(successful) {
    const distribution = {};
    
    Object.entries(this.globalArtists).forEach(([category, artists]) => {
      const successfulInCategory = successful.filter(s => 
        artists.includes(s.name)
      ).length;
      
      distribution[category] = {
        successful: successfulInCategory,
        total: artists.length,
        rate: ((successfulInCategory / artists.length) * 100).toFixed(1)
      };
    });

    logger.info(`\n📈 카테고리별 성공률:`);
    Object.entries(distribution).forEach(([category, stats]) => {
      logger.info(`   - ${category}: ${stats.successful}/${stats.total} (${stats.rate}%)`);
    });
  }

  /**
   * 수집 진행 상황 모니터링
   */
  startProgressMonitoring() {
    const interval = setInterval(() => {
      const progress = ((this.stats.successful + this.stats.failed + this.stats.skipped) / this.stats.total * 100).toFixed(1);
      logger.info(`📊 진행률: ${progress}% (${this.stats.successful + this.stats.failed + this.stats.skipped}/${this.stats.total})`);
    }, 30000); // 30초마다

    return interval;
  }
}

// CLI 실행 인터페이스
async function main() {
  const collector = new GlobalArtistsCollector();
  
  const command = process.argv[2];
  const options = {
    delay: 2000,           // 아티스트 간 대기시간
    categoryDelay: 5000,   // 카테고리 간 대기시간
    forceUpdate: false     // 기존 데이터 강제 업데이트
  };

  try {
    switch (command) {
      case 'priority':
        console.log('⭐ 우선순위 아티스트 수집 시작...');
        await collector.collectPriorityArtists();
        break;
        
      case 'category':
        const categoryName = process.argv[3];
        if (!categoryName) {
          console.log('카테고리 이름을 지정해주세요:');
          console.log('- classical, modern_western, asian_masters');
          console.log('- contemporary_global, female_artists, sculptors');
          return;
        }
        await collector.collectByCategory(categoryName, options);
        break;
        
      case 'all':
      default:
        console.log('🚀 전체 글로벌 아티스트 수집 시작...');
        const monitoring = collector.startProgressMonitoring();
        
        try {
          await collector.collectAllArtists(options);
        } finally {
          clearInterval(monitoring);
        }
        break;
    }
    
    console.log('\n✅ 수집 작업 완료!');
    
  } catch (error) {
    console.error('❌ 수집 작업 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = GlobalArtistsCollector;