/**
 * Artmap.com 크롤러 서비스
 * 전 세계 미술 기관 정보를 수집하는 서비스
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/database');

class ArtmapCrawlerService {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (compatible; SAYU-ArtCollector/1.0; +https://sayu.art)';
    this.requestDelay = 1000; // 1초 딜레이
    this.lastRequestTime = 0;
  }

  /**
   * 요청 간 딜레이 적용
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * HTTP 요청 헬퍼
   */
  async fetchPage(url) {
    await this.respectRateLimit();

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  /**
   * 기관 목록 크롤링 (알파벳별)
   */
  async crawlInstitutionsList(letter = 'a') {
    const url = `${this.baseUrl}/venues/institutions/${letter}/worldwide`;
    const html = await this.fetchPage(url);

    if (!html) return [];

    const $ = cheerio.load(html);
    const institutions = [];

    // 기관 목록 파싱
    $('.venulistentry').each((index, element) => {
      const $elem = $(element);
      const nameLink = $elem.find('a').first();
      const name = nameLink.text().trim();
      const urlPath = nameLink.attr('href');
      const city = $elem.find('.txGray').text().replace('&nbsp;', '').trim();
      const website = $elem.find('a[target="_blank"]').attr('href');

      if (name && urlPath) {
        institutions.push({
          name,
          urlPath: urlPath.startsWith('/') ? urlPath : `/${urlPath}`,
          city,
          website,
          type: 'institution'
        });
      }
    });

    console.log(`Found ${institutions.length} institutions for letter ${letter}`);
    return institutions;
  }

  /**
   * 기관 상세 정보 크롤링
   */
  async crawlInstitutionDetail(urlPath) {
    const contactUrl = `${this.baseUrl}${urlPath}/contact`;
    const html = await this.fetchPage(contactUrl);

    if (!html) return null;

    const $ = cheerio.load(html);

    // 상세 정보 추출
    const details = {
      name: $('h1').first().text().trim(),
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      coordinates: null
    };

    // 연락처 정보 파싱
    const contactDiv = $('.contact-info, .address-section, #content').first();
    const contactText = contactDiv.text();
    const contactHtml = contactDiv.html();

    // 주소 추출
    const addressMatch = contactText.match(/([^,\n]+),?\s*(\d{5,})?/);
    if (addressMatch) {
      details.address = addressMatch[1].trim();
    }

    // 전화번호 추출
    const phoneMatch = contactText.match(/Phone:\s*([+\d\s\-()]+)/i);
    if (phoneMatch) {
      details.phone = phoneMatch[1].trim();
    }

    // 이메일 추출
    const emailMatch = contactHtml?.match(/mailto:([^"]+)/);
    if (emailMatch) {
      details.email = emailMatch[1];
    }

    // 웹사이트 추출
    const websiteLink = $('a[target="_blank"]').filter((i, el) => {
      const href = $(el).attr('href');
      return href && (href.startsWith('http://') || href.startsWith('https://'));
    }).first();
    if (websiteLink.length) {
      details.website = websiteLink.attr('href');
    }

    // 좌표 추출 (Google Maps 데이터에서)
    const scriptContent = $('script').text();
    const coordMatch = scriptContent.match(/"lat":\s*([\d.-]+),\s*"lng":\s*([\d.-]+)/);
    if (coordMatch) {
      details.coordinates = {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2])
      };
    }

    // 도시와 국가 분리
    const locationDivs = contactDiv.find('div');
    locationDivs.each((i, div) => {
      const text = $(div).text().trim();
      if (text && !text.includes('Phone:') && !text.includes('Email:') && !text.includes('www.')) {
        if (!details.city && text.length < 50) {
          details.city = text;
        } else if (!details.country && text.length < 30) {
          details.country = text;
        }
      }
    });

    return details;
  }

  /**
   * 전시 목록 크롤링
   */
  async crawlExhibitionsList(venueType = 'institutions', sortBy = 'opening') {
    const url = `${this.baseUrl}/exhibitions/${venueType}/${sortBy}/worldwide`;
    const html = await this.fetchPage(url);

    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    $('.exibitionsListTable tr').each((index, element) => {
      const $row = $(element);
      const titleLink = $row.find('h2 a');
      const title = titleLink.text().trim();
      const urlPath = titleLink.attr('href');
      const venueLink = $row.find('a').first();
      const venueName = venueLink.text().trim();
      const venueUrlPath = venueLink.attr('href');

      // 날짜 정보 추출 (형식: "24.01. - 04.05.2025")
      const dateText = $row.text();
      const dateMatch = dateText.match(/(\d{2}\.\d{2}\.)\s*-\s*(\d{2}\.\d{2}\.\d{4})/);

      if (title && urlPath) {
        exhibitions.push({
          title,
          urlPath,
          venueName,
          venueUrlPath,
          startDate: dateMatch ? dateMatch[1] : null,
          endDate: dateMatch ? dateMatch[2] : null
        });
      }
    });

    console.log(`Found ${exhibitions.length} exhibitions`);
    return exhibitions;
  }

  /**
   * 전시 상세 정보 크롤링
   */
  async crawlExhibitionDetail(urlPath) {
    const url = `${this.baseUrl}${urlPath}`;
    const html = await this.fetchPage(url);

    if (!html) return null;

    const $ = cheerio.load(html);

    const details = {
      title: $('h1').first().text().trim(),
      description: '',
      artists: [],
      curator: '',
      dates: '',
      venue: {
        name: '',
        url: ''
      },
      images: []
    };

    // 설명 텍스트 추출
    const textBlock = $('#text-block');
    if (textBlock.length) {
      details.description = textBlock.text().trim();
    }

    // 아티스트 정보 추출
    const artistLinks = $('a[href*="/profile/"]');
    artistLinks.each((i, link) => {
      const artistName = $(link).text().trim();
      if (artistName) {
        details.artists.push(artistName);
      }
    });

    // 이미지 URL 추출
    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src && src.includes('/static/media/')) {
        details.images.push(this.baseUrl + src);
      }
    });

    return details;
  }

  /**
   * 데이터베이스에 기관 정보 저장
   */
  async saveInstitution(institution) {
    const query = `
      INSERT INTO venues (
        name, name_en, type, address, city, country, 
        phone, email, website, latitude, longitude, 
        source, external_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      ON CONFLICT (external_id, source) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        updated_at = NOW()
      RETURNING id
    `;

    const values = [
      institution.name,
      institution.name, // 영문명 (추후 번역 가능)
      'museum', // 타입
      institution.address,
      institution.city,
      institution.country,
      institution.phone,
      institution.email,
      institution.website,
      institution.coordinates?.lat,
      institution.coordinates?.lng,
      'artmap',
      institution.urlPath
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving institution:', error.message);
      return null;
    }
  }

  /**
   * 전체 크롤링 프로세스
   */
  async crawlAll() {
    console.log('Starting Artmap.com crawling...');

    // 1. 알파벳별로 기관 목록 수집
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const allInstitutions = [];

    for (const letter of alphabet) {
      console.log(`Crawling institutions starting with ${letter.toUpperCase()}...`);
      const institutions = await this.crawlInstitutionsList(letter);
      allInstitutions.push(...institutions);

      // 각 기관의 상세 정보 수집
      for (const inst of institutions) {
        console.log(`Fetching details for ${inst.name}...`);
        const details = await this.crawlInstitutionDetail(inst.urlPath);

        if (details) {
          const fullInfo = { ...inst, ...details };
          await this.saveInstitution(fullInfo);
        }
      }
    }

    // 2. 전시 정보 수집
    console.log('Crawling current exhibitions...');
    const exhibitions = await this.crawlExhibitionsList();

    for (const exhibition of exhibitions.slice(0, 50)) { // 처음 50개만
      const details = await this.crawlExhibitionDetail(exhibition.urlPath);
      if (details) {
        console.log(`Exhibition: ${details.title} - ${details.artists.join(', ')}`);
        // TODO: 전시 정보 DB 저장
      }
    }

    console.log(`Total institutions collected: ${allInstitutions.length}`);
    return allInstitutions;
  }
}

module.exports = ArtmapCrawlerService;
