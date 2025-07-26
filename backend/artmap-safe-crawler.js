const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class SafeArtmapCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.delay = 5000; // 5초 간격 (매우 보수적)
    this.dailyLimit = 50; // 하루 최대 50개 요청
    this.userAgent = 'SAYU Research Bot (contact: info@sayu.ai) - Educational Art Research';
    this.requestCount = 0;
    this.shouldStop = false;
    this.exhibitions = [];
    this.errors = [];
  }

  // 안전한 지연
  async safeDelay() {
    console.log(`⏳ ${this.delay/1000}초 대기 중... (${this.requestCount}/${this.dailyLimit})`);
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // 요청 제한 확인
  checkRequestLimit() {
    if (this.requestCount >= this.dailyLimit) {
      console.log('🛑 일일 요청 한도 도달! 크롤링 중단.');
      this.shouldStop = true;
      return false;
    }
    return true;
  }

  // HTTP 응답 상태 모니터링
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
    
    if (status >= 500) {
      console.log('⚠️ 서버 오류 감지');
      return false;
    }
    
    return status === 200;
  }

  // 안전한 HTTP 요청
  async safeRequest(url) {
    if (!this.checkRequestLimit() || this.shouldStop) {
      return null;
    }

    try {
      this.requestCount++;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000
      });

      if (!this.checkResponseStatus(response, url)) {
        return null;
      }

      return response;
    } catch (error) {
      console.log(`❌ 요청 실패: ${url} - ${error.message}`);
      this.errors.push({ url, error: error.message, timestamp: new Date() });
      
      // 네트워크 오류나 타임아웃이 연속으로 발생하면 중단
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        console.log('🛑 네트워크 오류로 인한 크롤링 중단');
        this.shouldStop = true;
      }
      
      return null;
    }
  }

  // 전시 리스트 페이지에서 개별 전시 URL 추출
  async extractExhibitionUrls() {
    console.log('🔍 전시 URL 추출 중...');
    
    const response = await this.safeRequest(`${this.baseUrl}/exhibitions`);
    if (!response) return [];

    const $ = cheerio.load(response.data);
    const exhibitionUrls = [];

    // 페이지 구조 분석 결과를 바탕으로 전시 링크 추출
    $('a[href*="/exhibitions/"]').each((i, element) => {
      const href = $(element).attr('href');
      if (href && href.includes('/exhibitions/') && !href.includes('/institutions/') && !href.includes('/galleries/')) {
        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
        if (!exhibitionUrls.includes(fullUrl)) {
          exhibitionUrls.push(fullUrl);
        }
      }
    });

    // 안전을 위해 처음 10개만 선택
    const limitedUrls = exhibitionUrls.slice(0, 10);
    console.log(`📋 ${limitedUrls.length}개 전시 URL 발견 (${exhibitionUrls.length}개 중 안전하게 10개만 선택)`);
    
    return limitedUrls;
  }

  // 개별 전시 정보 추출
  async extractExhibitionInfo(url) {
    if (this.shouldStop) return null;
    
    await this.safeDelay();
    
    console.log(`🎨 전시 정보 추출: ${url}`);
    
    const response = await this.safeRequest(url);
    if (!response) return null;

    try {
      const $ = cheerio.load(response.data);
      
      // 전시 정보 추출 (페이지 구조에 맞춰 조정)
      const exhibition = {
        url: url,
        title: this.extractTitle($),
        artist: this.extractArtist($),
        venue: this.extractVenue($),
        period: this.extractPeriod($),
        description: this.extractDescription($),
        location: this.extractLocation($),
        images: this.extractImages($),
        extractedAt: new Date().toISOString()
      };

      console.log(`✅ 추출 완료: ${exhibition.title}`);
      return exhibition;
      
    } catch (error) {
      console.log(`❌ 정보 추출 실패: ${url} - ${error.message}`);
      this.errors.push({ url, error: error.message, type: 'extraction', timestamp: new Date() });
      return null;
    }
  }

  // 제목 추출
  extractTitle($) {
    // 여러 가능한 선택자 시도
    const selectors = ['h1', '.exhibition-title', '.title', 'h2'];
    for (const selector of selectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0) {
        return title;
      }
    }
    return $('title').text().replace('Artmap.com - Contemporary Art', '').trim() || 'N/A';
  }

  // 작가 추출
  extractArtist($) {
    const selectors = ['.artist', '.artist-name', 'h2', '.exhibition-artist'];
    for (const selector of selectors) {
      const artist = $(selector).first().text().trim();
      if (artist && artist.length > 0 && !artist.includes('Exhibition') && !artist.includes('Gallery')) {
        return artist;
      }
    }
    return 'N/A';
  }

  // 전시장 추출
  extractVenue($) {
    const selectors = ['.venue', '.gallery', '.museum', '.location-name', 'h3'];
    for (const selector of selectors) {
      const venue = $(selector).text().trim();
      if (venue && venue.length > 0 && (venue.includes('Gallery') || venue.includes('Museum') || venue.includes('Kunst'))) {
        return venue;
      }
    }
    return 'N/A';
  }

  // 전시 기간 추출
  extractPeriod($) {
    const selectors = ['.period', '.date', '.exhibition-period'];
    for (const selector of selectors) {
      const period = $(selector).text().trim();
      if (period && (period.includes('-') || period.includes('until') || period.includes('2025'))) {
        return period;
      }
    }
    
    // 헤딩에서 날짜 패턴 찾기
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text.match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d{1,2}\s+(Jul|Aug|Sep|Oct|Nov|Dec)\s+-/)) {
        return text;
      }
    });
    
    return 'N/A';
  }

  // 설명 추출
  extractDescription($) {
    const selectors = ['meta[name="description"]', '.description', '.exhibition-description', '.content'];
    for (const selector of selectors) {
      let description = '';
      if (selector.startsWith('meta')) {
        description = $(selector).attr('content');
      } else {
        description = $(selector).text().trim();
      }
      
      if (description && description.length > 20) {
        return description.substring(0, 500); // 최대 500자
      }
    }
    return 'N/A';
  }

  // 위치 추출
  extractLocation($) {
    const text = $('body').text();
    const locations = ['Berlin', 'London', 'New York', 'Los Angeles', 'Munich', 'Basel', 'Zürich', 'Karlsruhe', 'Düsseldorf'];
    
    for (const location of locations) {
      if (text.includes(location)) {
        return location;
      }
    }
    return 'N/A';
  }

  // 이미지 추출
  extractImages($) {
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        const fullSrc = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
        images.push(fullSrc);
      }
    });
    return images.slice(0, 3); // 최대 3개 이미지
  }

  // SAYU 데이터베이스 포맷으로 변환
  convertToSayuFormat(exhibition) {
    return {
      title: exhibition.title,
      titleEn: exhibition.title, // 이미 영어인 경우가 많음
      description: exhibition.description,
      venue: {
        name: exhibition.venue,
        location: exhibition.location
      },
      period: {
        text: exhibition.period,
        // 추후 파싱하여 startDate, endDate 추가 가능
      },
      artists: exhibition.artist !== 'N/A' ? [exhibition.artist] : [],
      images: exhibition.images,
      source: 'artmap.com',
      sourceUrl: exhibition.url,
      category: 'contemporary',
      region: 'international',
      isActive: true,
      extractedAt: exhibition.extractedAt
    };
  }

  // 메인 크롤링 실행
  async runSafeCrawling() {
    console.log('🚀 Artmap.com 안전 크롤링 시작');
    console.log(`⚠️ 매우 보수적인 설정 (${this.delay/1000}초 간격, 최대 ${this.dailyLimit}개 요청)`);
    console.log('');

    try {
      // 1. 전시 URL 목록 추출
      const exhibitionUrls = await this.extractExhibitionUrls();
      
      if (exhibitionUrls.length === 0) {
        console.log('❌ 전시 URL을 찾을 수 없습니다.');
        return { exhibitions: [], errors: this.errors };
      }

      // 2. 각 전시 정보 추출 (최대 5개만)
      const safeLimit = Math.min(exhibitionUrls.length, 5);
      console.log(`📋 ${safeLimit}개 전시 정보 수집 예정`);

      for (let i = 0; i < safeLimit && !this.shouldStop; i++) {
        const exhibition = await this.extractExhibitionInfo(exhibitionUrls[i]);
        
        if (exhibition) {
          // SAYU 포맷으로 변환
          const sayuFormattedExhibition = this.convertToSayuFormat(exhibition);
          this.exhibitions.push(sayuFormattedExhibition);
          
          console.log(`✅ ${i + 1}/${safeLimit} 완료: ${exhibition.title}`);
        }
      }

      // 3. 결과 저장
      await this.saveResults();
      
      console.log(`\n🎯 크롤링 완료!`);
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
      
      // 전시 데이터 저장
      const exhibitionsFile = path.join(__dirname, `artmap-exhibitions-${timestamp}.json`);
      await fs.writeFile(exhibitionsFile, JSON.stringify(this.exhibitions, null, 2), 'utf8');
      console.log(`💾 전시 데이터 저장: ${exhibitionsFile}`);
      
      // 에러 로그 저장
      if (this.errors.length > 0) {
        const errorsFile = path.join(__dirname, `artmap-errors-${timestamp}.json`);
        await fs.writeFile(errorsFile, JSON.stringify(this.errors, null, 2), 'utf8');
        console.log(`📝 에러 로그 저장: ${errorsFile}`);
      }
      
      // 요약 리포트 저장
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalExhibitions: this.exhibitions.length,
          totalErrors: this.errors.length,
          totalRequests: this.requestCount,
          crawlingStopped: this.shouldStop
        },
        exhibitions: this.exhibitions,
        errors: this.errors
      };
      
      const reportFile = path.join(__dirname, `artmap-report-${timestamp}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');
      console.log(`📊 종합 리포트 저장: ${reportFile}`);
      
    } catch (error) {
      console.log(`❌ 결과 저장 실패: ${error.message}`);
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log('⚠️ 주의사항:');
  console.log('- 이 크롤링은 교육 및 연구 목적으로만 사용됩니다.');
  console.log('- 매우 보수적인 설정으로 사이트에 최소한의 부하만 가합니다.');
  console.log('- 차단 신호 감지 시 즉시 중단됩니다.');
  console.log('- 실제 사용 전에 사이트 운영자와 연락하는 것을 권장합니다.');
  console.log('');
  
  const crawler = new SafeArtmapCrawler();
  const results = await crawler.runSafeCrawling();
  
  if (results.fatalError) {
    console.log('\n🛑 치명적 오류로 인한 조기 종료');
  } else {
    console.log('\n✅ 안전 크롤링 완료');
    console.log('수집된 데이터는 SAYU 데이터베이스 통합을 위해 검토 후 사용됩니다.');
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 크롤링 실행 실패:', error.message);
    process.exit(1);
  });
}

module.exports = SafeArtmapCrawler;