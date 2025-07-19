const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;

/**
 * 향상된 URL 수집기
 * SAYU 플랫폼에 적합한 1000개 작품을 더 정교하게 선별합니다
 */

class EnhancedArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.allUrls = [];
    
    // 우선순위 작가 목록 (APT 성격 유형과 연관성 높은 작가들)
    this.priorityArtists = [
      // 감정 표현이 강한 작가들 (F 타입)
      'van gogh', 'monet', 'renoir', 'degas', 'cezanne', 'gauguin',
      'toulouse-lautrec', 'manet', 'pissarro', 'sisley',
      
      // 구조와 형태가 명확한 작가들 (T 타입)
      'picasso', 'mondrian', 'kandinsky', 'klee', 'miro', 
      'dali', 'duchamp', 'braque', 'leger', 'malevich',
      
      // 상상력과 환상적 요소 (N 타입)
      'chagall', 'klimt', 'schiele', 'bosch', 'bruegel',
      'blake', 'fuseli', 'moreau', 'redon', 'rousseau',
      
      // 현실적이고 구체적인 작가들 (S 타입)
      'vermeer', 'rembrandt', 'caravaggio', 'velazquez', 'rubens',
      'titian', 'raphael', 'botticelli', 'leonardo', 'michelangelo',
      
      // 동양 작가들 (다양성)
      'hokusai', 'hiroshige', 'utamaro', 'kuniyoshi', 'yoshitoshi',
      
      // 미국 작가들
      'hopper', 'whistler', 'sargent', 'homer', 'eakins',
      'rockwell', 'wyeth', 'o\'keeffe', 'pollock', 'warhol'
    ];
    
    // SAYU 성격 유형별 선호 장르
    this.personalityGenreMap = {
      // 외향형 - 활동적이고 역동적인 작품
      'E': ['cityscape', 'celebration', 'crowd', 'battle', 'sport'],
      
      // 내향형 - 조용하고 사색적인 작품
      'I': ['landscape', 'stillLife', 'interior', 'solitude', 'meditation'],
      
      // 직관형 - 추상적이고 상징적인 작품
      'N': ['abstract', 'surreal', 'mythology', 'fantasy', 'symbolic'],
      
      // 감각형 - 구체적이고 현실적인 작품
      'S': ['portrait', 'nature', 'animal', 'botanical', 'realistic'],
      
      // 사고형 - 구조적이고 기하학적인 작품
      'T': ['geometric', 'architecture', 'technical', 'scientific', 'map'],
      
      // 감정형 - 감성적이고 표현적인 작품
      'F': ['romantic', 'emotional', 'religious', 'family', 'love'],
      
      // 판단형 - 정돈되고 계획적인 작품
      'J': ['classical', 'academic', 'formal', 'symmetrical', 'ordered'],
      
      // 인식형 - 자유롭고 즉흥적인 작품
      'P': ['impressionist', 'sketch', 'casual', 'spontaneous', 'fluid']
    };
    
    // 감정 키워드 (SAYU 감정 분석용)
    this.emotionKeywords = {
      'serene': ['calm', 'peaceful', 'tranquil', 'quiet', 'meditation', 'zen'],
      'joyful': ['happy', 'celebration', 'bright', 'cheerful', 'festive', 'dance'],
      'melancholic': ['sad', 'solitude', 'rain', 'autumn', 'nostalgia', 'longing'],
      'dramatic': ['storm', 'battle', 'dark', 'intense', 'conflict', 'passion'],
      'mysterious': ['night', 'shadow', 'dream', 'surreal', 'enigma', 'hidden'],
      'energetic': ['movement', 'action', 'dynamic', 'vibrant', 'bold', 'power']
    };
    
    this.stats = {
      totalSitemaps: 0,
      successfulSitemaps: 0,
      failedSitemaps: [],
      byArtist: {},
      byGenre: {},
      byEmotion: {},
      byPeriod: {}
    };
  }

  async collectEnhanced() {
    console.log('🎨 SAYU Enhanced URL Collection 시작...\n');
    console.log('📋 목표: APT 성격 유형에 맞는 1,000개 작품 선별\n');
    
    // 1단계: 타겟 sitemap 범위 설정
    console.log('1️⃣ Sitemap 범위 탐색...');
    const sitemapRange = await this.determineSitemapRange();
    console.log(`   ✅ 유효 범위: ${sitemapRange.start} ~ ${sitemapRange.end}\n`);
    
    // 2단계: 전략적 수집
    console.log('2️⃣ 전략적 URL 수집 시작...');
    await this.strategicCollection(sitemapRange);
    
    // 3단계: 상세 분석
    console.log('\n3️⃣ 수집된 URL 상세 분석...');
    await this.analyzeCollection();
    
    // 4단계: SAYU 맞춤 선별
    console.log('\n4️⃣ SAYU 플랫폼 맞춤 선별...');
    await this.selectForSAYU();
    
    // 5단계: 최종 저장
    await this.saveEnhancedResults();
  }

  async determineSitemapRange() {
    // 최신 sitemap부터 역순으로 탐색
    let start = 1;
    let end = 1;
    
    // 최대 sitemap 번호 찾기
    for (let i = 500; i >= 1; i -= 10) {
      if (await this.sitemapExists(i)) {
        end = i + 10; // 여유분 추가
        break;
      }
    }
    
    // 세밀한 탐색으로 정확한 끝 찾기
    for (let i = end; i >= end - 10; i--) {
      if (await this.sitemapExists(i)) {
        end = i;
        break;
      }
    }
    
    return { start, end };
  }

  async strategicCollection(range) {
    // 수집 전략:
    // 1. 최신 작품 (최근 sitemap)
    // 2. 중간 시대 작품 (중간 sitemap)  
    // 3. 초기 작품 (초기 sitemap)
    
    const sections = [
      { start: Math.max(range.end - 50, 1), end: range.end, weight: 0.4 },     // 최신 40%
      { start: Math.floor(range.end / 2) - 25, end: Math.floor(range.end / 2) + 25, weight: 0.3 }, // 중간 30%
      { start: 1, end: Math.min(50, range.end), weight: 0.3 }  // 초기 30%
    ];
    
    for (const section of sections) {
      console.log(`\n   📁 섹션: Sitemap ${section.start}-${section.end} (${Math.round(section.weight * 100)}%)`);
      
      const targetCount = Math.ceil(5000 * section.weight); // 총 5000개 목표
      const collected = [];
      
      for (let i = section.start; i <= section.end && collected.length < targetCount; i++) {
        const urls = await this.processSitemapEnhanced(i);
        if (urls.length > 0) {
          collected.push(...urls);
          console.log(`      ✓ Sitemap ${i}: ${urls.length}개 수집`);
        }
        
        // 서버 부하 방지
        await this.sleep(100);
      }
      
      this.allUrls.push(...collected);
      console.log(`   📊 섹션 소계: ${collected.length}개`);
    }
    
    console.log(`\n   💾 전체 수집: ${this.allUrls.length}개`);
  }

  async processSitemapEnhanced(number) {
    try {
      const url = `${this.baseUrl}/product-sitemap${number}.xml`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'SAYU-Bot/1.0 (Educational Art Platform)' }
      });
      
      const result = await this.parser.parseStringPromise(response.data);
      const urls = [];
      
      if (result.urlset && result.urlset.url) {
        for (const urlItem of result.urlset.url) {
          const artworkUrl = urlItem.loc[0];
          const lastmod = urlItem.lastmod ? urlItem.lastmod[0] : null;
          
          // 향상된 메타데이터 추출
          const metadata = this.extractEnhancedMetadata(artworkUrl);
          
          urls.push({
            url: artworkUrl,
            lastmod: lastmod,
            sitemap: `product-sitemap${number}.xml`,
            artworkId: this.extractArtworkId(artworkUrl),
            metadata: metadata
          });
        }
      }
      
      this.stats.totalSitemaps++;
      this.stats.successfulSitemaps++;
      
      return urls;
    } catch (error) {
      this.stats.failedSitemaps.push(number);
      return [];
    }
  }

  extractEnhancedMetadata(url) {
    const metadata = {
      possibleArtist: null,
      genres: [],
      emotions: [],
      period: null,
      keywords: [],
      personalityMatch: []
    };
    
    const urlLower = url.toLowerCase();
    
    // 작가 검출 (우선순위 작가 체크)
    for (const artist of this.priorityArtists) {
      if (urlLower.includes(artist.replace(/\s+/g, '-'))) {
        metadata.possibleArtist = artist;
        metadata.priority = 'high';
        break;
      }
    }
    
    // 장르 검출 (MBTI 관련)
    for (const [mbtiType, genres] of Object.entries(this.personalityGenreMap)) {
      for (const genre of genres) {
        if (urlLower.includes(genre.toLowerCase())) {
          metadata.genres.push(genre);
          metadata.personalityMatch.push(mbtiType);
        }
      }
    }
    
    // 감정 키워드 검출
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      for (const keyword of keywords) {
        if (urlLower.includes(keyword)) {
          metadata.emotions.push(emotion);
          metadata.keywords.push(keyword);
        }
      }
    }
    
    // 시대 검출
    const periods = [
      'renaissance', 'baroque', 'rococo', 'neoclassical', 'romantic',
      'impressionist', 'post-impressionist', 'modern', 'contemporary',
      'medieval', 'gothic', 'byzantine'
    ];
    
    for (const period of periods) {
      if (urlLower.includes(period)) {
        metadata.period = period;
        break;
      }
    }
    
    return metadata;
  }

  async analyzeCollection() {
    // 중복 제거
    const uniqueMap = new Map();
    this.allUrls.forEach(item => uniqueMap.set(item.url, item));
    const uniqueUrls = Array.from(uniqueMap.values());
    
    console.log(`   ✅ 중복 제거: ${this.allUrls.length} → ${uniqueUrls.length}`);
    
    // 통계 생성
    uniqueUrls.forEach(item => {
      // 작가별
      if (item.metadata.possibleArtist) {
        const artist = item.metadata.possibleArtist;
        this.stats.byArtist[artist] = (this.stats.byArtist[artist] || 0) + 1;
      }
      
      // 장르별
      item.metadata.genres.forEach(genre => {
        this.stats.byGenre[genre] = (this.stats.byGenre[genre] || 0) + 1;
      });
      
      // 감정별
      item.metadata.emotions.forEach(emotion => {
        this.stats.byEmotion[emotion] = (this.stats.byEmotion[emotion] || 0) + 1;
      });
      
      // 시대별
      if (item.metadata.period) {
        this.stats.byPeriod[item.metadata.period] = (this.stats.byPeriod[item.metadata.period] || 0) + 1;
      }
    });
    
    this.allUrls = uniqueUrls;
    
    // 통계 출력
    console.log('\n   📊 수집 통계:');
    console.log(`      • 유명 작가: ${Object.keys(this.stats.byArtist).length}명`);
    console.log(`      • 장르: ${Object.keys(this.stats.byGenre).length}개`);
    console.log(`      • 감정 태그: ${Object.keys(this.stats.byEmotion).length}개`);
    console.log(`      • 시대: ${Object.keys(this.stats.byPeriod).length}개`);
  }

  async selectForSAYU() {
    const selected = [];
    const used = new Set();
    
    // 1. 우선순위 작가 작품 (300개)
    console.log('\n   🎯 우선순위 작가 선별...');
    const priorityArtworks = this.allUrls
      .filter(item => item.metadata.priority === 'high')
      .sort(() => Math.random() - 0.5)
      .slice(0, 300);
    
    priorityArtworks.forEach(item => {
      selected.push(item);
      used.add(item.url);
    });
    console.log(`      ✓ ${priorityArtworks.length}개 선별`);
    
    // 2. MBTI 유형별 균등 분배 (400개)
    console.log('\n   🧠 MBTI 유형별 선별...');
    const mbtiTypes = ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'];
    const perType = 50; // 각 유형당 50개
    
    for (const mbtiType of mbtiTypes) {
      const typeArtworks = this.allUrls
        .filter(item => 
          !used.has(item.url) && 
          item.metadata.personalityMatch.includes(mbtiType)
        )
        .slice(0, perType);
      
      typeArtworks.forEach(item => {
        selected.push(item);
        used.add(item.url);
      });
      
      console.log(`      • ${mbtiType}형: ${typeArtworks.length}개`);
    }
    
    // 3. 감정별 분배 (200개)
    console.log('\n   💭 감정별 선별...');
    const emotions = Object.keys(this.emotionKeywords);
    const perEmotion = Math.floor(200 / emotions.length);
    
    for (const emotion of emotions) {
      const emotionArtworks = this.allUrls
        .filter(item => 
          !used.has(item.url) && 
          item.metadata.emotions.includes(emotion)
        )
        .slice(0, perEmotion);
      
      emotionArtworks.forEach(item => {
        selected.push(item);
        used.add(item.url);
      });
      
      console.log(`      • ${emotion}: ${emotionArtworks.length}개`);
    }
    
    // 4. 다양성을 위한 랜덤 추가 (100개)
    console.log('\n   🎲 다양성 확보...');
    const remaining = this.allUrls
      .filter(item => !used.has(item.url))
      .sort(() => Math.random() - 0.5)
      .slice(0, 100);
    
    selected.push(...remaining);
    console.log(`      ✓ ${remaining.length}개 추가`);
    
    // 최종 1000개로 조정
    this.allUrls = selected.slice(0, 1000);
    console.log(`\n   ✅ 최종 선별: ${this.allUrls.length}개`);
  }

  async saveEnhancedResults() {
    await fs.mkdir('./data', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    
    // 메인 JSON 파일
    const mainData = {
      metadata: {
        total: this.allUrls.length,
        collectedAt: new Date().toISOString(),
        strategy: 'SAYU Enhanced Collection - MBTI Optimized',
        version: '2.0',
        stats: this.stats
      },
      urls: this.allUrls
    };
    
    // 파일 저장
    await fs.writeFile('./data/artvee-urls-enhanced.json', JSON.stringify(mainData, null, 2));
    await fs.writeFile('./data/artvee-urls-final.json', JSON.stringify(mainData, null, 2));
    
    // CSV 저장
    const csvContent = this.generateCSV();
    await fs.writeFile('./data/artvee-urls-final.csv', csvContent);
    
    // 통계 리포트
    const report = this.generateReport();
    await fs.writeFile('./data/collection-report.md', report);
    
    console.log('\n💾 저장 완료:');
    console.log('   • artvee-urls-enhanced.json');
    console.log('   • artvee-urls-final.json');
    console.log('   • artvee-urls-final.csv');
    console.log('   • collection-report.md');
  }

  generateCSV() {
    const headers = ['URL', 'Artist', 'Genres', 'Emotions', 'Period', 'MBTI Match', 'Priority'];
    const rows = [headers.join(',')];
    
    this.allUrls.forEach(item => {
      const row = [
        item.url,
        item.metadata.possibleArtist || '',
        item.metadata.genres.join(';'),
        item.metadata.emotions.join(';'),
        item.metadata.period || '',
        item.metadata.personalityMatch.join(';'),
        item.metadata.priority || 'normal'
      ];
      rows.push(row.map(cell => `"${cell}"`).join(','));
    });
    
    return rows.join('\n');
  }

  generateReport() {
    const report = `# SAYU Artvee Collection Report

## 📊 Collection Summary
- **Total Artworks**: ${this.allUrls.length}
- **Collection Date**: ${new Date().toISOString()}
- **Strategy**: SAYU Enhanced Collection v2.0

## 🎨 Artist Distribution
${Object.entries(this.stats.byArtist)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([artist, count]) => `- ${artist}: ${count} works`)
  .join('\n')}

## 🖼️ Genre Distribution
${Object.entries(this.stats.byGenre)
  .sort((a, b) => b[1] - a[1])
  .map(([genre, count]) => `- ${genre}: ${count} works`)
  .join('\n')}

## 💭 Emotion Distribution
${Object.entries(this.stats.byEmotion)
  .sort((a, b) => b[1] - a[1])
  .map(([emotion, count]) => `- ${emotion}: ${count} works`)
  .join('\n')}

## 🕐 Period Distribution
${Object.entries(this.stats.byPeriod)
  .sort((a, b) => b[1] - a[1])
  .map(([period, count]) => `- ${period}: ${count} works`)
  .join('\n')}

## 🧠 MBTI Coverage
- E (Extrovert): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('E')).length} works
- I (Introvert): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('I')).length} works
- N (Intuitive): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('N')).length} works
- S (Sensing): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('S')).length} works
- T (Thinking): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('T')).length} works
- F (Feeling): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('F')).length} works
- J (Judging): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('J')).length} works
- P (Perceiving): ${this.allUrls.filter(u => u.metadata.personalityMatch.includes('P')).length} works

## ✅ Quality Metrics
- Priority Artists: ${this.allUrls.filter(u => u.metadata.priority === 'high').length}
- Multi-tag Works: ${this.allUrls.filter(u => u.metadata.genres.length > 1).length}
- Emotion Tagged: ${this.allUrls.filter(u => u.metadata.emotions.length > 0).length}
- Period Identified: ${this.allUrls.filter(u => u.metadata.period).length}
`;
    
    return report;
  }

  extractArtworkId(url) {
    const match = url.match(/\/dl\/([^\/]+)/);
    return match ? match[1] : url.split('/').pop();
  }

  async sitemapExists(number) {
    try {
      const url = `${this.baseUrl}/product-sitemap${number}.xml`;
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  console.log('🚀 SAYU Enhanced Artvee Collector v2.0\n');
  console.log('⏱️ 예상 소요 시간: 10-15분\n');
  
  const collector = new EnhancedArtveeCollector();
  await collector.collectEnhanced();
  
  console.log('\n✅ Enhanced Collection 완료!');
  console.log('📁 다음 단계: node crawler.js 로 메타데이터 크롤링 시작');
}

main().catch(console.error);