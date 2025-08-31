const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

class RealExhibitionIntegrator {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Korean Cultural Data Sources
    this.apiSources = {
      culturePortal: {
        name: '문화포털',
        baseUrl: 'http://api.kcisa.kr/openapi/CNV_060/request',
        key: process.env.CULTURE_API_KEY,
        dailyLimit: 1000,
        priority: 1
      },
      seoulOpenData: {
        name: '서울열린데이터광장',
        baseUrl: 'http://openapi.seoul.go.kr:8088',
        key: process.env.SEOUL_API_KEY,
        priority: 2
      },
      artMap: {
        name: 'ArtMap',
        baseUrl: 'https://www.artmap.co.kr',
        priority: 3,
        type: 'crawler'
      }
    };

    // Major Seoul Venues with exact coordinates
    this.seoulVenues = [
      {
        name: '국립현대미술관 서울',
        name_en: 'MMCA Seoul',
        address: '서울 종로구 삼청로 30',
        lat: 37.5785,
        lng: 126.9800,
        district: '종로구',
        type: 'national_museum',
        website: 'https://www.mmca.go.kr',
        apt_affinity: {
          // SAYU 16 animal types with affinities
          'LAEF': 0.9, // 여우 - 창의적, 실험적 전시 선호
          'SAEF': 0.8, // 나비 - 감성적, 아름다운 전시 선호
          'LRMC': 0.9, // 거북이 - 체계적, 학술적 전시 선호
          'SRMC': 0.8  // 독수리 - 권위 있는 전시 선호
        }
      },
      {
        name: '서울시립미술관',
        name_en: 'SeMA',
        address: '서울 중구 덕수궁길 61',
        lat: 37.5640,
        lng: 126.9738,
        district: '중구',
        type: 'municipal_museum',
        website: 'https://sema.seoul.go.kr',
        apt_affinity: {
          'SREC': 0.9, // 오리 - 시민 친화적 전시
          'SAMC': 0.8, // 사슴 - 평화로운 전시 분위기
          'LREC': 0.8, // 고슴도치 - 접근 가능한 현대미술
          'SRMF': 0.7  // 코끼리 - 대중적 전시
        }
      },
      {
        name: '리움미술관',
        name_en: 'Leeum Museum',
        address: '서울 용산구 이태원로55길 60-16',
        lat: 37.5384,
        lng: 126.9990,
        district: '용산구',
        type: 'private_museum',
        website: 'https://www.leeum.org',
        apt_affinity: {
          'LAEF': 0.9, // 여우 - 혁신적 현대미술
          'LAMF': 0.8, // 올빼미 - 깊이 있는 작품
          'SREF': 0.8, // 강아지 - 활동적이고 흥미로운 전시
          'LREF': 0.7  // 카멜레온 - 다양한 장르
        }
      },
      {
        name: '아모레퍼시픽미술관',
        name_en: 'Amorepacific Museum',
        address: '서울 용산구 한강대로 100',
        lat: 37.5273,
        lng: 126.9727,
        district: '용산구',
        type: 'corporate_museum',
        website: 'https://www.amorepacific.com/museum',
        apt_affinity: {
          'SAEC': 0.9, // 펭귄 - 세련된 미적 감각
          'SAEF': 0.8, // 나비 - 뷰티와 예술의 조화
          'LREC': 0.7, // 고슴도치 - 편안한 관람 환경
          'SREC': 0.7  // 오리 - 접근성 좋은 전시
        }
      },
      {
        name: '대림미술관',
        name_en: 'Daelim Museum',
        address: '서울 종로구 자하문로4길 21',
        lat: 37.5414,
        lng: 126.9534,
        district: '종로구',
        type: 'private_museum',
        website: 'https://www.daelimmuseum.org',
        apt_affinity: {
          'SAEF': 0.9, // 나비 - 감성적, 트렌디한 전시
          'LAEF': 0.8, // 여우 - 독창적 기획전
          'SAEC': 0.8, // 펭귄 - 포토제닉한 전시
          'LREC': 0.6  // 고슴도치 - 아늑한 공간
        }
      }
    ];

    // Exhibition categorization for APT matching
    this.exhibitionCategories = {
      contemporary_art: {
        keywords: ['현대미술', '컨템포러리', '신진작가', '실험', '미디어아트'],
        apt_types: ['LAEF', 'SAEF', 'LAMF', 'SAMF'],
        weight: 0.9
      },
      traditional_art: {
        keywords: ['전통', '고미술', '서화', '도자기', '불교미술'],
        apt_types: ['LRMC', 'SRMC', 'SAMC', 'LAMC'],
        weight: 0.8
      },
      photography: {
        keywords: ['사진', '포토', '다큐멘터리'],
        apt_types: ['LREC', 'SREC', 'LREF', 'SREF'],
        weight: 0.7
      },
      interactive: {
        keywords: ['체험', '인터랙티브', '미디어', '디지털', 'VR', 'AR'],
        apt_types: ['SREF', 'SAEF', 'SRMF', 'SAMF'],
        weight: 0.9
      },
      minimalism: {
        keywords: ['미니멀', '단색화', '추상', '기하학'],
        apt_types: ['LAMC', 'LRMC', 'LAMF', 'LRMF'],
        weight: 0.8
      },
      social_art: {
        keywords: ['사회', '참여', '공동체', '환경', '페미니즘'],
        apt_types: ['SRMF', 'SRMC', 'SAMF', 'SAMC'],
        weight: 0.8
      }
    };
  }

  // Main integration process
  async integrateRealExhibitions() {
    console.log('🎨 Starting real exhibition integration...');
    
    const results = {
      collected: 0,
      processed: 0,
      saved: 0,
      errors: []
    };

    try {
      // 1. Collect from Korean Cultural APIs
      const culturePortalData = await this.collectFromCulturePortal();
      const seoulOpenData = await this.collectFromSeoulOpenData();
      const artMapData = await this.collectFromArtMap();

      const allExhibitions = [
        ...culturePortalData,
        ...seoulOpenData,
        ...artMapData
      ];

      results.collected = allExhibitions.length;
      console.log(`📊 Collected ${results.collected} exhibitions from APIs`);

      // 2. Process and enhance data
      const processedExhibitions = await this.processExhibitionData(allExhibitions);
      results.processed = processedExhibitions.length;

      // 3. Save to Supabase
      const saveResult = await this.saveToSupabase(processedExhibitions);
      results.saved = saveResult.saved;
      results.errors = saveResult.errors;

      // 4. Update venue coordinates
      await this.updateVenueCoordinates();

      console.log(`✅ Integration complete: ${results.saved} exhibitions saved`);
      return results;

    } catch (error) {
      console.error('❌ Integration failed:', error);
      throw error;
    }
  }

  // Collect from Korean Culture Portal API
  async collectFromCulturePortal() {
    if (!process.env.CULTURE_API_KEY) {
      console.log('⚠️ Culture API key not found, skipping...');
      return [];
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const response = await axios.get(this.apiSources.culturePortal.baseUrl, {
        params: {
          serviceKey: this.apiSources.culturePortal.key,
          numOfRows: 100,
          pageNo: 1,
          startDate: today,
          endDate: futureDate,
          arrange: 'A', // 지역별
          sido: '11' // 서울
        },
        timeout: 10000
      });

      if (response.data?.response?.body?.items?.item) {
        const items = Array.isArray(response.data.response.body.items.item) 
          ? response.data.response.body.items.item 
          : [response.data.response.body.items.item];

        console.log(`🏛️ Culture Portal: ${items.length} exhibitions found`);
        
        return items
          .filter(item => item.title && item.place)
          .map(item => this.standardizeExhibition({
            title: item.title,
            venue: item.place,
            startDate: item.startDate,
            endDate: item.endDate,
            description: item.contents || item.program,
            address: item.addr1,
            phone: item.tel,
            homepage: item.homepage,
            image: item.firstImage,
            source: 'culture_portal'
          }));
      }

      return [];
    } catch (error) {
      console.error('Culture Portal API error:', error.message);
      return [];
    }
  }

  // Collect from Seoul Open Data
  async collectFromSeoulOpenData() {
    if (!process.env.SEOUL_API_KEY) {
      console.log('⚠️ Seoul API key not found, skipping...');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.apiSources.seoulOpenData.baseUrl}/${this.apiSources.seoulOpenData.key}/json/SebcExhibitInfo/1/100/`,
        { timeout: 10000 }
      );

      if (response.data?.SebcExhibitInfo?.row) {
        const items = response.data.SebcExhibitInfo.row;
        console.log(`🏢 Seoul Open Data: ${items.length} exhibitions found`);

        return items
          .filter(item => item.TITLE && item.PLACE)
          .map(item => this.standardizeExhibition({
            title: item.TITLE,
            venue: item.PLACE,
            startDate: item.START_DATE,
            endDate: item.END_DATE,
            description: item.PROGRAM,
            phone: item.PHONE,
            homepage: item.HOMEPAGE,
            image: item.MAIN_IMG,
            source: 'seoul_opendata'
          }));
      }

      return [];
    } catch (error) {
      console.error('Seoul Open Data API error:', error.message);
      return [];
    }
  }

  // Collect from ArtMap (web scraping)
  async collectFromArtMap() {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      // Navigate to ArtMap exhibition list
      await page.goto('https://www.artmap.co.kr/exhibition/list', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract exhibition data
      const exhibitions = await page.evaluate(() => {
        const items = document.querySelectorAll('.exhibition-item, .exh-item');
        return Array.from(items).slice(0, 50).map(item => {
          const titleEl = item.querySelector('.title, .exh-title, h3, h4');
          const venueEl = item.querySelector('.venue, .place, .location');
          const dateEl = item.querySelector('.date, .period');
          const linkEl = item.querySelector('a');
          const imageEl = item.querySelector('img');

          return {
            title: titleEl?.textContent?.trim(),
            venue: venueEl?.textContent?.trim(),
            date: dateEl?.textContent?.trim(),
            link: linkEl?.href,
            image: imageEl?.src
          };
        }).filter(item => item.title && item.venue);
      });

      await browser.close();
      console.log(`🎭 ArtMap: ${exhibitions.length} exhibitions found`);

      return exhibitions.map(item => {
        const dates = this.parseDateRange(item.date);
        return this.standardizeExhibition({
          title: item.title,
          venue: item.venue,
          startDate: dates.start,
          endDate: dates.end,
          image: item.image,
          homepage: item.link,
          source: 'artmap'
        });
      });

    } catch (error) {
      console.error('ArtMap scraping error:', error.message);
      return [];
    }
  }

  // Standardize exhibition data format
  standardizeExhibition(data) {
    return {
      external_id: this.generateExternalId(data),
      title: this.cleanTitle(data.title),
      venue: this.cleanVenue(data.venue),
      venue_address: data.address,
      start_date: this.parseDate(data.startDate),
      end_date: this.parseDate(data.endDate || data.startDate),
      description: data.description ? data.description.substring(0, 1000) : null,
      image_url: data.image,
      ticket_url: data.homepage,
      source: data.source,
      raw_data: JSON.stringify(data),
      collected_at: new Date().toISOString()
    };
  }

  // Process and enhance exhibition data
  async processExhibitionData(exhibitions) {
    const processed = [];

    for (const exhibition of exhibitions) {
      try {
        // 1. Find matching venue
        const venue = this.findMatchingVenue(exhibition.venue);
        
        // 2. Categorize exhibition
        const category = this.categorizeExhibition(exhibition.title, exhibition.description);
        
        // 3. Generate APT recommendations
        const aptRecommendations = this.generateAPTRecommendations(category, venue);
        
        // 4. Calculate coordinates if venue found
        let coordinates = null;
        if (venue) {
          coordinates = { lat: venue.lat, lng: venue.lng };
        } else {
          // Try to geocode the address
          coordinates = await this.geocodeAddress(exhibition.venue_address || exhibition.venue);
        }

        processed.push({
          ...exhibition,
          venue_coordinates: coordinates,
          venue_district: venue?.district,
          venue_type: venue?.type,
          category: category.name,
          category_confidence: category.confidence,
          recommended_apt: aptRecommendations,
          apt_weights: this.calculateAPTWeights(category, venue),
          status: this.determineStatus(exhibition.start_date, exhibition.end_date)
        });

      } catch (error) {
        console.error(`Error processing exhibition "${exhibition.title}":`, error.message);
      }
    }

    return processed;
  }

  // Find matching venue from our curated list
  findMatchingVenue(venueName) {
    const cleanName = venueName.toLowerCase()
      .replace(/[^\w가-힣]/g, '')
      .replace(/\s+/g, '');

    return this.seoulVenues.find(venue => {
      const venueCleanName = venue.name.toLowerCase()
        .replace(/[^\w가-힣]/g, '')
        .replace(/\s+/g, '');
      
      return venueCleanName.includes(cleanName) || cleanName.includes(venueCleanName);
    });
  }

  // Categorize exhibition based on title and description
  categorizeExhibition(title, description) {
    const text = `${title} ${description || ''}`.toLowerCase();
    let bestCategory = { name: 'general', confidence: 0.3 };

    for (const [categoryName, config] of Object.entries(this.exhibitionCategories)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += config.weight;
        }
      }

      const confidence = Math.min(score / config.keywords.length, 1.0);
      if (confidence > bestCategory.confidence) {
        bestCategory = { name: categoryName, confidence };
      }
    }

    return bestCategory;
  }

  // Generate APT recommendations
  generateAPTRecommendations(category, venue) {
    const recommendations = new Set();

    // Add category-based recommendations
    if (this.exhibitionCategories[category.name]) {
      this.exhibitionCategories[category.name].apt_types.forEach(type => {
        recommendations.add(type);
      });
    }

    // Add venue-based recommendations
    if (venue?.apt_affinity) {
      Object.entries(venue.apt_affinity)
        .filter(([type, affinity]) => affinity >= 0.7)
        .forEach(([type]) => recommendations.add(type));
    }

    // Ensure we have at least 3 recommendations
    if (recommendations.size < 3) {
      // Add default recommendations based on general preferences
      ['SAEF', 'LAEF', 'SREC'].forEach(type => recommendations.add(type));
    }

    return Array.from(recommendations).slice(0, 6); // Max 6 recommendations
  }

  // Calculate APT weights for matching algorithm
  calculateAPTWeights(category, venue) {
    const weights = {};

    // Initialize all 16 types with base weight
    const allTypes = [
      'LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'
    ];
    
    allTypes.forEach(type => weights[type] = 0.3);

    // Apply category weights
    if (this.exhibitionCategories[category.name]) {
      this.exhibitionCategories[category.name].apt_types.forEach(type => {
        weights[type] = Math.min(weights[type] + category.confidence, 1.0);
      });
    }

    // Apply venue weights
    if (venue?.apt_affinity) {
      Object.entries(venue.apt_affinity).forEach(([type, affinity]) => {
        weights[type] = Math.min(weights[type] + affinity * 0.3, 1.0);
      });
    }

    return weights;
  }

  // Save processed exhibitions to Supabase
  async saveToSupabase(exhibitions) {
    const results = { saved: 0, errors: [] };

    for (const exhibition of exhibitions) {
      try {
        // Check for duplicates
        const { data: existing } = await this.supabase
          .from('exhibitions')
          .select('id')
          .eq('external_id', exhibition.external_id)
          .single();

        if (existing) {
          // Update existing
          const { error } = await this.supabase
            .from('exhibitions')
            .update({
              ...exhibition,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await this.supabase
            .from('exhibitions')
            .insert({
              ...exhibition,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        }

        results.saved++;

      } catch (error) {
        console.error(`Failed to save "${exhibition.title}":`, error.message);
        results.errors.push({
          title: exhibition.title,
          error: error.message
        });
      }
    }

    return results;
  }

  // Update venue coordinates in the map route
  async updateVenueCoordinates() {
    const venueData = this.seoulVenues.map(venue => ({
      name: venue.name,
      name_en: venue.name_en,
      lat: venue.lat,
      lng: venue.lng,
      address: venue.address,
      district: venue.district,
      type: venue.type,
      website: venue.website,
      apt_affinity: venue.apt_affinity
    }));

    // Save venue data to a JSON file for the map route to use
    const fs = require('fs');
    const venueFilePath = require('path').join(__dirname, '../../data/seoul-venues.json');
    
    fs.writeFileSync(venueFilePath, JSON.stringify(venueData, null, 2));
    console.log(`💾 Venue data saved to ${venueFilePath}`);
  }

  // Utility functions
  generateExternalId(data) {
    const source = data.source;
    const titleHash = require('crypto')
      .createHash('md5')
      .update(`${data.title}_${data.venue}_${data.startDate}`)
      .digest('hex')
      .substring(0, 8);
    
    return `${source}_${titleHash}`;
  }

  cleanTitle(title) {
    if (!title) return '';
    return title
      .replace(/\s+/g, ' ')
      .replace(/[『』「」<>《》【】]/g, '')
      .trim()
      .substring(0, 200);
  }

  cleanVenue(venue) {
    if (!venue) return '';
    return venue
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  parseDate(dateStr) {
    if (!dateStr) return null;

    // Handle various Korean date formats
    const patterns = [
      /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,
      /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
      /(\d{1,2})[/.](\d{1,2})[/.](\d{4})/
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let year, month, day;
        if (match[1].length === 4) {
          [, year, month, day] = match;
        } else {
          [, month, day, year] = match;
        }

        const date = new Date(year, month - 1, day);
        return date.toISOString().split('T')[0];
      }
    }

    return null;
  }

  parseDateRange(dateStr) {
    if (!dateStr) return { start: null, end: null };

    const rangePattern = /(\d{4}[.\s년]*\d{1,2}[.\s월]*\d{1,2}[일]?)\s*[-~]\s*(\d{4}[.\s년]*\d{1,2}[.\s월]*\d{1,2}[일]?)/;
    const match = dateStr.match(rangePattern);

    if (match) {
      return {
        start: this.parseDate(match[1]),
        end: this.parseDate(match[2])
      };
    }

    const singleDate = this.parseDate(dateStr);
    return { start: singleDate, end: singleDate };
  }

  determineStatus(startDate, endDate) {
    if (!startDate) return 'unknown';

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  async geocodeAddress(address) {
    if (!address) return null;

    try {
      // Simple geocoding for Seoul addresses
      // This is a placeholder - in production, use a proper geocoding service
      const seoulCenter = { lat: 37.5665, lng: 126.9780 };
      
      // Add some randomness for different venues
      const hash = require('crypto').createHash('md5').update(address).digest('hex');
      const latOffset = (parseInt(hash.substring(0, 4), 16) / 65536 - 0.5) * 0.1;
      const lngOffset = (parseInt(hash.substring(4, 8), 16) / 65536 - 0.5) * 0.1;

      return {
        lat: seoulCenter.lat + latOffset,
        lng: seoulCenter.lng + lngOffset
      };

    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }
}

module.exports = new RealExhibitionIntegrator();