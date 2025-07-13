const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
require('dotenv').config();

/**
 * Step 2: 메타데이터 크롤링
 * 수집된 URL에서 작품 정보를 추출합니다
 */

class ArtveeCrawler {
  constructor() {
    this.delay = parseInt(process.env.DELAY_MS) || 2500;
    this.userAgent = process.env.USER_AGENT || 'SAYU-Bot/1.0';
    this.artworks = [];
    this.errors = [];
  }

  async crawlArtworks(limit = 100) {
    console.log('🎨 Artvee 작품 크롤링 시작...\n');
    
    // URL 목록 로드
    const urlData = await this.loadUrls();
    const urls = urlData.slice(0, limit);
    
    console.log(`📊 크롤링 대상: ${urls.length}개 작품\n`);

    // 진행 상황 표시
    for (let i = 0; i < urls.length; i++) {
      const progress = ((i + 1) / urls.length * 100).toFixed(1);
      console.log(`\n[${i + 1}/${urls.length}] (${progress}%) 처리 중...`);
      
      try {
        const artwork = await this.crawlSingleArtwork(urls[i].url);
        this.artworks.push(artwork);
        console.log(`✅ 성공: ${artwork.title} - ${artwork.artist}`);
      } catch (error) {
        console.error(`❌ 실패: ${urls[i].url}`);
        this.errors.push({
          url: urls[i].url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      // 서버 부하 방지
      if (i < urls.length - 1) {
        await this.sleep(this.delay);
      }
    }

    // 결과 저장
    await this.saveResults();
  }

  async crawlSingleArtwork(url) {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.userAgent
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // 메타데이터 추출
    const artwork = {
      url: url,
      title: this.extractTitle($),
      artist: this.extractArtist($),
      date: this.extractDate($),
      museum: this.extractMuseum($),
      category: this.extractCategory($),
      tags: this.extractTags($),
      imageUrl: this.extractImageUrl($),
      downloadUrl: this.extractDownloadUrl($),
      description: this.extractDescription($),
      crawledAt: new Date().toISOString()
    };

    return artwork;
  }

  // 추출 메서드들
  extractTitle($) {
    return $('h1').first().text().trim() || 
           $('meta[property="og:title"]').attr('content') || 
           'Unknown Title';
  }

  extractArtist($) {
    // 여러 가능한 위치에서 작가명 찾기
    const artistLink = $('a[href*="/artist/"]').first().text().trim();
    if (artistLink) return artistLink;
    
    // 다른 패턴들
    const patterns = [
      $('.artist-name'),
      $('.artwork-artist'),
      $('p:contains("Artist:")').text()
    ];
    
    for (const pattern of patterns) {
      const text = pattern.text ? pattern.text().trim() : pattern.toString().trim();
      if (text) return text.replace('Artist:', '').trim();
    }
    
    return 'Unknown Artist';
  }

  extractDate($) {
    // 날짜 패턴 찾기 (예: 1945-1950, c. 1890, 19th century)
    const text = $('body').text();
    const datePatterns = [
      /\b(1[0-9]{3})\s*[-–]\s*(1[0-9]{3})\b/, // 1945-1950
      /\b(c\.\s*1[0-9]{3})\b/, // c. 1890
      /\b(1[0-9]{3})\b/, // 1945
      /\b([0-9]{1,2}th century)\b/ // 19th century
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return '';
  }

  extractMuseum($) {
    // 소장처 정보 찾기
    const museumPatterns = [
      $('.museum-name'),
      $('.collection-name'),
      $('p:contains("Collection:")'),
      $('p:contains("Museum:")')
    ];
    
    for (const pattern of museumPatterns) {
      const text = pattern.text ? pattern.text().trim() : '';
      if (text) return text.replace(/Collection:|Museum:/, '').trim();
    }
    
    return '';
  }

  extractCategory($) {
    // 카테고리 추출 (URL 또는 breadcrumb에서)
    const breadcrumb = $('.breadcrumb a').map((i, el) => $(el).text()).get();
    if (breadcrumb.length > 0) return breadcrumb.join(' > ');
    
    // URL에서 카테고리 추측
    const urlMatch = $.url.match(/\/c\/([^\/]+)/);
    if (urlMatch) return urlMatch[1];
    
    return '';
  }

  extractTags($) {
    const tags = [];
    $('.tag, .keyword, a[href*="/t/"]').each((i, el) => {
      tags.push($(el).text().trim());
    });
    return tags.join(', ');
  }

  extractImageUrl($) {
    return $('meta[property="og:image"]').attr('content') ||
           $('.artwork-image img').attr('src') ||
           $('img.main-image').attr('src') ||
           '';
  }

  extractDownloadUrl($) {
    // 다운로드 버튼 찾기
    const downloadBtn = $('a:contains("Download")').attr('href') ||
                       $('a.download-button').attr('href') ||
                       $('a[href*="/download/"]').attr('href');
    
    if (downloadBtn && !downloadBtn.startsWith('http')) {
      return `https://artvee.com${downloadBtn}`;
    }
    
    return downloadBtn || '';
  }

  extractDescription($) {
    return $('.artwork-description').text().trim() ||
           $('.description').text().trim() ||
           '';
  }

  // 유틸리티 메서드들
  async loadUrls() {
    const data = await fs.readFile('./data/artvee-urls.json', 'utf8');
    return JSON.parse(data);
  }

  async saveResults() {
    // 디렉토리 생성
    await fs.mkdir('./data', { recursive: true });
    await fs.mkdir('./logs', { recursive: true });

    // JSON 저장
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const jsonPath = `./data/artworks-${timestamp}.json`;
    await fs.writeFile(jsonPath, JSON.stringify(this.artworks, null, 2));
    console.log(`\n💾 JSON 저장: ${jsonPath}`);

    // CSV 저장
    const csvPath = `./data/artworks-${timestamp}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'url', title: 'URL' },
        { id: 'title', title: 'Title' },
        { id: 'artist', title: 'Artist' },
        { id: 'date', title: 'Date' },
        { id: 'museum', title: 'Museum' },
        { id: 'category', title: 'Category' },
        { id: 'tags', title: 'Tags' },
        { id: 'imageUrl', title: 'Image URL' },
        { id: 'downloadUrl', title: 'Download URL' },
        { id: 'crawledAt', title: 'Crawled At' }
      ]
    });
    
    await csvWriter.writeRecords(this.artworks);
    console.log(`💾 CSV 저장: ${csvPath}`);

    // 에러 로그
    if (this.errors.length > 0) {
      const errorPath = `./logs/errors-${timestamp}.json`;
      await fs.writeFile(errorPath, JSON.stringify(this.errors, null, 2));
      console.log(`📝 에러 로그: ${errorPath}`);
    }

    // 통계 출력
    console.log(`\n📊 크롤링 통계:`);
    console.log(`  - 성공: ${this.artworks.length}개`);
    console.log(`  - 실패: ${this.errors.length}개`);
    console.log(`  - 성공률: ${(this.artworks.length / (this.artworks.length + this.errors.length) * 100).toFixed(1)}%`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const crawler = new ArtveeCrawler();
  
  // 명령줄 인자로 크롤링 개수 지정 가능
  const limit = process.argv[2] ? parseInt(process.argv[2]) : 10;
  
  console.log(`🚀 ${limit}개 작품 크롤링 시작합니다...\n`);
  await crawler.crawlArtworks(limit);
}

main().catch(console.error);