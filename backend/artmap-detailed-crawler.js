const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class DetailedArtmapCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.delay = 7000; // 7초 간격 (더욱 보수적)
    this.dailyLimit = 20; // 더 낮은 한도
    this.userAgent = 'SAYU Research Bot (contact: info@sayu.ai) - Educational Art Research';
    this.requestCount = 0;
    this.shouldStop = false;
    this.exhibitions = [];
    this.errors = [];
  }

  async safeDelay() {
    console.log(`⏳ ${this.delay/1000}초 대기 중... (${this.requestCount}/${this.dailyLimit})`);
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  checkRequestLimit() {
    if (this.requestCount >= this.dailyLimit) {
      console.log('🛑 일일 요청 한도 도달! 크롤링 중단.');
      this.shouldStop = true;
      return false;
    }
    return true;
  }

  checkResponseStatus(response, url) {
    const status = response.status;
    console.log(`📊 ${url} - Status: ${status}`);
    
    if (status === 429) {
      console.log('⚠️ Rate Limit 감지! 크롤링 중단.');
      this.shouldStop = true;
      return false;
    }
    
    if (status === 403) {
      console.log('⚠️ 접근 차단 감지! 크롤링 중단.');
      this.shouldStop = true;
      return false;
    }
    
    return status === 200;
  }

  async safeRequest(url) {
    if (!this.checkRequestLimit() || this.shouldStop) {
      return null;
    }

    try {
      this.requestCount++;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        timeout: 20000
      });

      if (!this.checkResponseStatus(response, url)) {
        return null;
      }

      return response;
    } catch (error) {
      console.log(`❌ 요청 실패: ${url} - ${error.message}`);
      this.errors.push({ url, error: error.message, timestamp: new Date() });
      
      if (error.response && error.response.status === 429) {
        console.log('🛑 Rate Limit으로 인한 크롤링 중단');
        this.shouldStop = true;
      }
      
      return null;
    }
  }

  // 개별 전시 정보를 더 정확하게 추출
  async extractDetailedExhibitionInfo() {
    console.log('🔍 개별 전시 정보 추출 시작...');
    
    // 첫 번째 전시 목록 페이지에서 실제 전시 데이터 파싱
    const response = await this.safeRequest(`${this.baseUrl}/exhibitions`);
    if (!response) return [];

    const $ = cheerio.load(response.data);
    const exhibitions = [];

    // 페이지에서 각 전시를 개별적으로 파싱
    let exhibitionIndex = 0;
    
    // H2 태그들이 전시 제목인 것으로 보임
    $('h2').each((i, titleElement) => {
      if (exhibitionIndex >= 3) return false; // 안전을 위해 3개만
      
      const title = $(titleElement).text().trim();
      
      // 'Exhibitions' 같은 일반적인 제목은 스킵
      if (!title || title === 'Exhibitions' || title.length < 3) return;
      
      // 해당 전시의 상세 정보 추출
      const exhibition = this.parseExhibitionBlock($, titleElement);
      
      if (exhibition.title && exhibition.title !== 'Exhibitions') {
        exhibitions.push(exhibition);
        exhibitionIndex++;
        console.log(`✅ 전시 발견: ${exhibition.title}`);
      }
    });

    console.log(`📋 총 ${exhibitions.length}개 전시 정보 추출 완료`);
    return exhibitions;
  }

  // 전시 블록에서 상세 정보 파싱
  parseExhibitionBlock($, titleElement) {
    const title = $(titleElement).text().trim();
    
    // 제목 다음의 H3 태그들에서 정보 추출
    const nextElements = $(titleElement).nextAll('h3').slice(0, 3);
    
    let venue = 'N/A';
    let period = 'N/A';
    let location = 'N/A';
    
    nextElements.each((i, el) => {
      const text = $(el).text().trim();
      
      // 날짜 패턴 감지
      if (text.match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jul|Aug|Sep|Oct|Nov|Dec)|\d{1,2}\s+\w+\s+-\s+\d{1,2}/)) {
        period = text;
      }
      // 갤러리/미술관 이름 감지
      else if (text.includes('Gallery') || text.includes('Museum') || text.includes('Kunst') || 
               text.includes('Galerie') || text.includes('Contemporary') || text.includes('Art')) {
        venue = text;
        
        // 위치 추출
        const locations = ['Berlin', 'London', 'New York', 'Los Angeles', 'Munich', 'Basel', 'Zürich', 'Karlsruhe', 'Düsseldorf', 'Vienna', 'Oslo', 'Stockholm', 'Amsterdam', 'Krakow', 'Innsbruck'];
        for (const loc of locations) {
          if (text.includes(loc)) {
            location = loc;
            break;
          }
        }
      }
    });

    // 이미지 추출 (제목 근처의 이미지들)
    const images = [];
    $(titleElement).parent().find('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        const fullSrc = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
        images.push(fullSrc);
      }
    });

    return {
      title: title,
      venue: venue,
      period: period,
      location: location,
      images: images.slice(0, 2), // 최대 2개 이미지
      extractedAt: new Date().toISOString()
    };
  }

  // SAYU 포맷으로 변환
  convertToSayuFormat(exhibition) {
    // 아티스트명이 제목에 포함되어 있는지 확인
    const possibleArtist = exhibition.title;
    const isArtistName = !exhibition.title.includes('Exhibition') && 
                        !exhibition.title.includes('Group') && 
                        exhibition.title.length < 50;

    return {
      title: exhibition.title,
      titleEn: exhibition.title,
      description: `Contemporary art exhibition${exhibition.venue !== 'N/A' ? ` at ${exhibition.venue}` : ''}${exhibition.location !== 'N/A' ? ` in ${exhibition.location}` : ''}`,
      venue: {
        name: exhibition.venue,
        location: exhibition.location,
        country: this.getCountryFromLocation(exhibition.location)
      },
      period: {
        text: exhibition.period,
        // TODO: 파싱하여 구체적인 startDate, endDate 추가
      },
      artists: isArtistName ? [exhibition.title] : [],
      images: exhibition.images,
      source: 'artmap.com',
      sourceUrl: `${this.baseUrl}/exhibitions`,
      category: 'contemporary',
      region: 'international',
      isActive: true,
      extractedAt: exhibition.extractedAt,
      
      // SAYU 특화 필드
      emotionTags: this.generateEmotionTags(exhibition),
      artMovement: 'contemporary',
      priceRange: 'free', // 대부분 갤러리 전시는 무료
      accessibility: {
        wheelchair: true, // 기본값
        parking: true,
        publicTransport: true
      }
    };
  }

  // 위치에서 국가 추출
  getCountryFromLocation(location) {
    const locationMap = {
      'Berlin': 'Germany',
      'Munich': 'Germany',
      'Düsseldorf': 'Germany',
      'Basel': 'Switzerland',
      'Zürich': 'Switzerland',
      'Vienna': 'Austria',
      'London': 'United Kingdom',
      'New York': 'United States',
      'Los Angeles': 'United States',
      'Oslo': 'Norway',
      'Stockholm': 'Sweden',
      'Amsterdam': 'Netherlands',
      'Krakow': 'Poland',
      'Innsbruck': 'Austria'
    };
    
    return locationMap[location] || 'Unknown';
  }

  // 감정 태그 생성 (SAYU용)
  generateEmotionTags(exhibition) {
    const tags = ['contemporary', 'artistic'];
    
    // 제목이나 장소를 기반으로 감정 태그 추가
    const title = exhibition.title.toLowerCase();
    
    if (title.includes('nature') || title.includes('plant') || title.includes('garden')) {
      tags.push('peaceful', 'natural');
    }
    if (title.includes('abstract') || title.includes('color')) {
      tags.push('creative', 'imaginative');
    }
    if (title.includes('history') || title.includes('memory')) {
      tags.push('reflective', 'thoughtful');
    }
    if (title.includes('future') || title.includes('digital') || title.includes('tech')) {
      tags.push('innovative', 'forward-thinking');
    }
    
    return tags;
  }

  // 메인 크롤링 실행
  async runDetailedCrawling() {
    console.log('🚀 Artmap.com 상세 크롤링 시작');
    console.log(`⚠️ 매우 보수적인 설정 (${this.delay/1000}초 간격, 최대 ${this.dailyLimit}개 요청)`);
    console.log('🎯 개별 전시 정보에 집중합니다.');
    console.log('');

    try {
      // 개별 전시 정보 추출
      const rawExhibitions = await this.extractDetailedExhibitionInfo();
      
      if (rawExhibitions.length === 0) {
        console.log('❌ 전시 정보를 찾을 수 없습니다.');
        return { exhibitions: [], errors: this.errors };
      }

      // SAYU 포맷으로 변환
      this.exhibitions = rawExhibitions.map(exhibition => 
        this.convertToSayuFormat(exhibition)
      );

      // 결과 저장
      await this.saveResults();
      
      console.log(`\n🎯 상세 크롤링 완료!`);
      console.log(`✅ 성공: ${this.exhibitions.length}개 전시`);
      console.log(`❌ 오류: ${this.errors.length}개`);
      console.log(`📊 총 요청: ${this.requestCount}개`);

      return {
        exhibitions: this.exhibitions,
        errors: this.errors,
        summary: {
          successCount: this.exhibitions.length,
          errorCount: this.errors.length,
          totalRequests: this.requestCount
        }
      };

    } catch (error) {
      console.log(`❌ 크롤링 중 치명적 오류: ${error.message}`);
      return { exhibitions: this.exhibitions, errors: this.errors, fatalError: error.message };
    }
  }

  // 결과 저장
  async saveResults() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // SAYU 포맷 데이터 저장
      const sayuFile = path.join(__dirname, `artmap-sayu-format-${timestamp}.json`);
      await fs.writeFile(sayuFile, JSON.stringify(this.exhibitions, null, 2), 'utf8');
      console.log(`💾 SAYU 포맷 데이터 저장: ${sayuFile}`);
      
      // 요약 리포트 저장
      const report = {
        timestamp: new Date().toISOString(),
        source: 'artmap.com',
        crawlingType: 'detailed_exhibitions',
        summary: {
          totalExhibitions: this.exhibitions.length,
          totalErrors: this.errors.length,
          totalRequests: this.requestCount,
          crawlingStopped: this.shouldStop
        },
        exhibitions: this.exhibitions,
        errors: this.errors,
        metadata: {
          averageImagesPerExhibition: this.exhibitions.reduce((sum, ex) => sum + ex.images.length, 0) / this.exhibitions.length,
          venuesDiscovered: [...new Set(this.exhibitions.map(ex => ex.venue.name))].length,
          locationsDiscovered: [...new Set(this.exhibitions.map(ex => ex.venue.location))].length,
          artistsDiscovered: this.exhibitions.filter(ex => ex.artists.length > 0).length
        }
      };
      
      const reportFile = path.join(__dirname, `artmap-detailed-report-${timestamp}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');
      console.log(`📊 상세 리포트 저장: ${reportFile}`);
      
    } catch (error) {
      console.log(`❌ 결과 저장 실패: ${error.message}`);
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log('⚠️ 주의사항:');
  console.log('- 이 크롤링은 교육 및 연구 목적으로만 사용됩니다.');
  console.log('- 개별 전시 정보에 집중하여 더 정확한 데이터를 수집합니다.');
  console.log('- 매우 보수적인 설정으로 사이트 부하를 최소화합니다.');
  console.log('- SAYU 데이터베이스 통합을 위한 표준 포맷으로 변환됩니다.');
  console.log('');
  
  const crawler = new DetailedArtmapCrawler();
  const results = await crawler.runDetailedCrawling();
  
  if (results.fatalError) {
    console.log('\n🛑 치명적 오류로 인한 조기 종료');
  } else {
    console.log('\n✅ 상세 크롤링 완료');
    console.log('수집된 데이터는 SAYU 전시 추천 시스템에 통합 준비 완료입니다.');
    
    if (results.exhibitions && results.exhibitions.length > 0) {
      console.log('\n📋 수집된 전시 샘플:');
      results.exhibitions.slice(0, 2).forEach((exhibition, index) => {
        console.log(`${index + 1}. ${exhibition.title}`);
        console.log(`   📍 ${exhibition.venue.name}, ${exhibition.venue.location}`);
        console.log(`   📅 ${exhibition.period.text}`);
        console.log(`   🏷️ ${exhibition.emotionTags.join(', ')}`);
        console.log('');
      });
    }
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 상세 크롤링 실행 실패:', error.message);
    process.exit(1);
  });
}

module.exports = DetailedArtmapCrawler;