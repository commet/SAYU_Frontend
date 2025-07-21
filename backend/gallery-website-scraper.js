#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 주요 갤러리 웹사이트 스크래핑 설정
const GALLERY_CONFIGS = {
  // 국내 갤러리들
  'galleryhyundai': {
    name: '갤러리현대',
    url: 'https://www.galleryhyundai.com/ko/exhibitions/current',
    selectors: {
      container: '.exhibition-list-item, .exhibition-item',
      title: '.exhibition-title, .title',
      artist: '.artist-name, .artist',
      date: '.exhibition-date, .date',
      venue: '.venue',
      link: 'a'
    }
  },
  'kukjegallery': {
    name: '국제갤러리',
    url: 'https://www.kukjegallery.com/exhibitions?type=current',
    selectors: {
      container: '.exhibition-wrapper',
      title: '.exhibition-name',
      artist: '.artist-name',
      date: '.exhibition-date',
      link: 'a.exhibition-link'
    }
  },
  'pkmgallery': {
    name: 'PKM갤러리',
    url: 'https://www.pkmgallery.com/exhibitions/current',
    selectors: {
      container: '.exhibition-item',
      title: '.title',
      artist: '.artist',
      date: '.date',
      link: 'a'
    }
  },
  'arario': {
    name: '아라리오갤러리',
    url: 'https://www.arariogallery.com/exhibitions/current',
    selectors: {
      container: '.exhibition-box',
      title: '.exhibition-title',
      artist: '.artist-name',
      date: '.date',
      link: 'a'
    }
  },
  
  // 해외 주요 갤러리들
  'gagosian': {
    name: 'Gagosian',
    url: 'https://gagosian.com/exhibitions/current/',
    international: true,
    selectors: {
      container: '.exhibitions-list__item',
      title: '.exhibitions-list__item__title',
      artist: '.exhibitions-list__item__artist',
      date: '.exhibitions-list__item__date',
      venue: '.exhibitions-list__item__location',
      link: 'a'
    }
  },
  'davidzwirner': {
    name: 'David Zwirner',
    url: 'https://www.davidzwirner.com/exhibitions/current',
    international: true,
    selectors: {
      container: '.exhibition-card',
      title: '.exhibition-title',
      artist: '.exhibition-artist',
      date: '.exhibition-dates',
      venue: '.exhibition-location',
      link: 'a'
    }
  },
  'hauserwirth': {
    name: 'Hauser & Wirth',
    url: 'https://www.hauserwirth.com/exhibitions',
    international: true,
    selectors: {
      container: '.exhibition-item',
      title: '.title',
      artist: '.artist',
      date: '.dates',
      venue: '.location',
      link: 'a'
    }
  },
  'pace': {
    name: 'Pace Gallery',
    url: 'https://www.pacegallery.com/exhibitions/',
    international: true,
    selectors: {
      container: '.exhibition-grid-item',
      title: '.exhibition-title',
      artist: '.exhibition-artist',
      date: '.exhibition-dates',
      venue: '.exhibition-location',
      link: 'a'
    }
  }
};

class GalleryWebsiteScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; ArtExhibitionBot/1.0; +https://sayu.art)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    };
    this.exhibitions = [];
  }

  async scrapeAllGalleries() {
    console.log('🎨 갤러리 웹사이트 전시 정보 스크래핑 시작\n');
    console.log('⚖️  합법적 스크래핑 원칙 준수:');
    console.log('   - robots.txt 확인');
    console.log('   - User-Agent 명시');
    console.log('   - 요청 간격 유지 (3초)');
    console.log('   - 사실 정보만 수집\n');

    for (const [key, config] of Object.entries(GALLERY_CONFIGS)) {
      console.log(`\n🏛️  ${config.name} 스크래핑...`);
      
      try {
        // robots.txt 확인
        const robotsAllowed = await this.checkRobotsTxt(config.url);
        if (!robotsAllowed) {
          console.log('   ❌ robots.txt에서 차단됨');
          continue;
        }

        // 스크래핑 실행
        const exhibitions = await this.scrapeGallery(key, config);
        this.exhibitions.push(...exhibitions);
        
        console.log(`   ✅ ${exhibitions.length}개 전시 발견`);
        
        // 요청 간격 유지
        await this.delay(3000);
        
      } catch (error) {
        console.log(`   ❌ 오류: ${error.message}`);
      }
    }

    // 데이터베이스 저장
    await this.saveToDatabase();
    
    return this.exhibitions;
  }

  async checkRobotsTxt(url) {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      const response = await axios.get(robotsUrl, { 
        headers: this.headers,
        timeout: 5000 
      });
      
      // 간단한 체크 (실제로는 robotparser 사용 권장)
      const disallowed = response.data.includes('Disallow: /exhibitions') || 
                        response.data.includes('Disallow: /');
                        
      return !disallowed;
    } catch (error) {
      // robots.txt가 없으면 허용된 것으로 간주
      return true;
    }
  }

  async scrapeGallery(key, config) {
    const exhibitions = [];
    
    try {
      const response = await axios.get(config.url, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      
      // 전시 항목 추출
      $(config.selectors.container).each((i, elem) => {
        const $elem = $(elem);
        
        const exhibition = {
          gallery_key: key,
          gallery_name: config.name,
          title: $elem.find(config.selectors.title).text().trim(),
          artist: $elem.find(config.selectors.artist).text().trim(),
          date_text: $elem.find(config.selectors.date).text().trim(),
          venue_name: config.name,
          venue_city: config.international ? null : '서울',
          venue_country: config.international ? null : 'KR',
          source: 'gallery_website',
          source_url: config.url
        };

        // 장소 정보 (해외 갤러리)
        if (config.selectors.venue) {
          const venue = $elem.find(config.selectors.venue).text().trim();
          exhibition.venue_city = this.extractCity(venue);
        }

        // 링크
        if (config.selectors.link) {
          const link = $elem.find(config.selectors.link).attr('href');
          if (link) {
            exhibition.detail_url = new URL(link, config.url).href;
          }
        }

        // 날짜 파싱
        const dates = this.parseDates(exhibition.date_text);
        if (dates) {
          exhibition.start_date = dates.start;
          exhibition.end_date = dates.end;
        }

        if (exhibition.title && exhibition.start_date) {
          exhibitions.push(exhibition);
        }
      });

      // 상세 정보 수집 (선택적, 처음 3개만)
      for (let i = 0; i < Math.min(exhibitions.length, 3); i++) {
        if (exhibitions[i].detail_url) {
          await this.scrapeExhibitionDetail(exhibitions[i]);
          await this.delay(2000);
        }
      }

    } catch (error) {
      console.error(`스크래핑 오류 (${key}):`, error.message);
    }

    return exhibitions;
  }

  async scrapeExhibitionDetail(exhibition) {
    try {
      const response = await axios.get(exhibition.detail_url, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      
      // 상세 정보 추출 (갤러리마다 다름)
      exhibition.description = $('.exhibition-description, .description, .text').first().text().trim();
      
      // 이미지 URL (저작권 주의)
      const imageUrl = $('.exhibition-image img, .main-image img').first().attr('src');
      if (imageUrl) {
        exhibition.image_url = new URL(imageUrl, exhibition.detail_url).href;
      }
      
      console.log(`      ✅ 상세 정보: ${exhibition.title}`);
      
    } catch (error) {
      console.log(`      ⚠️  상세 정보 실패: ${exhibition.title}`);
    }
  }

  parseDates(dateText) {
    // 다양한 날짜 형식 파싱
    const patterns = [
      // 2025.07.01 - 2025.08.31
      /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[-–—]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
      // July 1 - August 31, 2025
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–—]\s*([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/,
      // 1 Jul - 31 Aug 2025
      /(\d{1,2})\s+([A-Za-z]+)\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = dateText.match(pattern);
      if (match) {
        // 파싱 로직 구현 (형식에 따라)
        return this.convertMatchToDates(match);
      }
    }

    return null;
  }

  convertMatchToDates(match) {
    // 실제 날짜 변환 로직
    // 여기서는 간단한 예시만
    if (match[0].includes('.')) {
      return {
        start: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
        end: `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`
      };
    }
    return null;
  }

  extractCity(venueText) {
    // 도시명 추출 로직
    const cities = ['New York', 'London', 'Paris', 'Hong Kong', 'Los Angeles', 'Basel', 'Geneva'];
    for (const city of cities) {
      if (venueText.includes(city)) {
        return city;
      }
    }
    return venueText;
  }

  async saveToDatabase() {
    const client = await pool.connect();
    let saved = 0;

    try {
      await client.query('BEGIN');

      for (const exhibition of this.exhibitions) {
        if (!exhibition.start_date || !exhibition.end_date) continue;

        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_local, title_en, venue_name, venue_city, venue_country,
              start_date, end_date, description, artists, source, source_url,
              status, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP
            )
          `, [
            exhibition.title,
            exhibition.title, // 영문 제목은 추후 번역
            exhibition.venue_name,
            exhibition.venue_city,
            exhibition.venue_country,
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.artist ? [exhibition.artist] : null,
            exhibition.source,
            exhibition.source_url,
            new Date(exhibition.start_date) <= new Date() && new Date(exhibition.end_date) >= new Date() 
              ? 'ongoing' : 'upcoming'
          ]);
          
          saved++;
        }
      }

      await client.query('COMMIT');
      console.log(`\n📊 총 ${saved}개 전시 저장 완료`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ DB 오류:', error);
    } finally {
      client.release();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const scraper = new GalleryWebsiteScraper();
  await scraper.scrapeAllGalleries();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = GalleryWebsiteScraper;