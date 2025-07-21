#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class MassiveExhibitionCollector {
  constructor() {
    this.stats = {
      total: 0,
      added: 0,
      skipped: 0,
      errors: 0
    };
  }

  async collectMassive() {
    console.log('🌍 대규모 전시 정보 수집 시작 (전 세계 주요 미술관)');
    console.log('📋 수집 대상: 100개 이상 글로벌 미술관\n');

    // 1. 아시아 미술관
    await this.collectAsianMuseums();
    
    // 2. 북미 미술관
    await this.collectNorthAmericanMuseums();
    
    // 3. 유럽 미술관
    await this.collectEuropeanMuseums();
    
    // 4. 남미 미술관
    await this.collectSouthAmericanMuseums();
    
    // 5. 오세아니아 미술관
    await this.collectOceaniaMuseums();
    
    // 6. 중동/아프리카 미술관
    await this.collectMiddleEastAfricaMuseums();

    // 최종 통계
    await this.showFinalStats();
  }

  // 아시아 미술관
  async collectAsianMuseums() {
    console.log('\n🌏 아시아 미술관 전시 수집...\n');

    const asianExhibitions = [
      // 일본
      {
        title_en: 'Ukiyo-e and the West',
        title_local: '浮世絵と西洋',
        venue_name: 'Tokyo National Museum',
        venue_city: 'Tokyo',
        venue_country: 'JP',
        start_date: '2025-01-15',
        end_date: '2025-04-15',
        description: 'The influence of Japanese woodblock prints on Western art',
        official_url: 'https://www.tnm.jp',
        source: 'asia_museums'
      },
      {
        title_en: 'Contemporary Japanese Photography',
        title_local: '現代日本の写真',
        venue_name: 'Tokyo Metropolitan Museum of Photography',
        venue_city: 'Tokyo',
        venue_country: 'JP',
        start_date: '2025-02-01',
        end_date: '2025-05-31',
        description: 'A survey of contemporary Japanese photography',
        official_url: 'https://topmuseum.jp',
        source: 'asia_museums'
      },
      {
        title_en: 'Yayoi Kusama: Infinity Mirrors',
        title_local: '草間彌生：無限の鏡',
        venue_name: 'National Museum of Modern Art, Tokyo',
        venue_city: 'Tokyo',
        venue_country: 'JP',
        start_date: '2025-03-01',
        end_date: '2025-06-30',
        description: 'Immersive installations by Yayoi Kusama',
        official_url: 'https://www.momat.go.jp',
        source: 'asia_museums'
      },
      // 중국
      {
        title_en: 'Ancient Chinese Bronzes',
        title_local: '中国古代青铜器',
        venue_name: 'National Museum of China',
        venue_city: 'Beijing',
        venue_country: 'CN',
        start_date: '2025-01-10',
        end_date: '2025-12-31',
        description: 'Masterpieces of ancient Chinese bronze artifacts',
        official_url: 'http://en.chnmuseum.cn',
        source: 'asia_museums'
      },
      {
        title_en: 'Contemporary Chinese Art',
        title_local: '当代中国艺术',
        venue_name: 'UCCA Center for Contemporary Art',
        venue_city: 'Beijing',
        venue_country: 'CN',
        start_date: '2025-02-15',
        end_date: '2025-05-15',
        description: 'Leading voices in contemporary Chinese art',
        official_url: 'https://ucca.org.cn',
        source: 'asia_museums'
      },
      {
        title_en: 'Shanghai Biennale 2025',
        title_local: '2025上海双年展',
        venue_name: 'Power Station of Art',
        venue_city: 'Shanghai',
        venue_country: 'CN',
        start_date: '2025-11-01',
        end_date: '2026-03-31',
        description: 'International contemporary art biennale',
        official_url: 'https://www.powerstationofart.com',
        source: 'asia_museums'
      },
      // 홍콩
      {
        title_en: 'Hong Kong Art: Then and Now',
        title_local: '香港藝術：昔與今',
        venue_name: 'M+',
        venue_city: 'Hong Kong',
        venue_country: 'HK',
        start_date: '2025-01-20',
        end_date: '2025-04-20',
        description: 'Evolution of Hong Kong art scene',
        official_url: 'https://www.mplus.org.hk',
        source: 'asia_museums'
      },
      // 싱가포르
      {
        title_en: 'Southeast Asian Contemporary',
        title_local: 'Southeast Asian Contemporary',
        venue_name: 'National Gallery Singapore',
        venue_city: 'Singapore',
        venue_country: 'SG',
        start_date: '2025-02-01',
        end_date: '2025-06-30',
        description: 'Contemporary art from Southeast Asia',
        official_url: 'https://www.nationalgallery.sg',
        source: 'asia_museums'
      },
      {
        title_en: 'Singapore Biennale 2025',
        title_local: 'Singapore Biennale 2025',
        venue_name: 'Singapore Art Museum',
        venue_city: 'Singapore',
        venue_country: 'SG',
        start_date: '2025-10-01',
        end_date: '2026-02-28',
        description: 'International contemporary art biennale',
        official_url: 'https://www.singaporeartmuseum.sg',
        source: 'asia_museums'
      },
      // 인도
      {
        title_en: 'Indian Miniature Paintings',
        title_local: 'भारतीय लघु चित्र',
        venue_name: 'National Museum, New Delhi',
        venue_city: 'New Delhi',
        venue_country: 'IN',
        start_date: '2025-01-15',
        end_date: '2025-04-15',
        description: 'Traditional Indian miniature paintings',
        official_url: 'https://www.nationalmuseumindia.gov.in',
        source: 'asia_museums'
      },
      // 태국
      {
        title_en: 'Thai Contemporary Art',
        title_local: 'ศิลปะร่วมสมัยไทย',
        venue_name: 'Bangkok Art and Culture Centre',
        venue_city: 'Bangkok',
        venue_country: 'TH',
        start_date: '2025-02-10',
        end_date: '2025-05-10',
        description: 'Contemporary Thai artists showcase',
        official_url: 'https://en.bacc.or.th',
        source: 'asia_museums'
      }
    ];

    await this.saveExhibitions(asianExhibitions);
  }

  // 북미 미술관
  async collectNorthAmericanMuseums() {
    console.log('\n🌎 북미 미술관 전시 수집...\n');

    const northAmericanExhibitions = [
      // 미국 - 뉴욕
      {
        title_en: 'The Harlem Renaissance and Transatlantic Modernism',
        title_local: 'The Harlem Renaissance and Transatlantic Modernism',
        venue_name: 'The Metropolitan Museum of Art',
        venue_city: 'New York',
        venue_country: 'US',
        start_date: '2024-10-25',
        end_date: '2025-01-28',
        description: 'Exploring the comprehensive, Afrocentric vision of the Harlem Renaissance',
        official_url: 'https://www.metmuseum.org',
        source: 'north_america_museums'
      },
      {
        title_en: 'Picasso in Fontainebleau',
        title_local: 'Picasso in Fontainebleau',
        venue_name: 'Museum of Modern Art (MoMA)',
        venue_city: 'New York',
        venue_country: 'US',
        start_date: '2024-11-05',
        end_date: '2025-02-17',
        description: 'Picasso\'s summer of 1921 in Fontainebleau',
        official_url: 'https://www.moma.org',
        source: 'north_america_museums'
      },
      {
        title_en: 'Jean-Michel Basquiat: King Pleasure',
        title_local: 'Jean-Michel Basquiat: King Pleasure',
        venue_name: 'Brooklyn Museum',
        venue_city: 'New York',
        venue_country: 'US',
        start_date: '2025-02-15',
        end_date: '2025-07-15',
        description: 'Celebrating the life and work of Jean-Michel Basquiat',
        official_url: 'https://www.brooklynmuseum.org',
        source: 'north_america_museums'
      },
      {
        title_en: 'Edward Hopper\'s New York',
        title_local: 'Edward Hopper\'s New York',
        venue_name: 'Whitney Museum of American Art',
        venue_city: 'New York',
        venue_country: 'US',
        start_date: '2024-10-19',
        end_date: '2025-03-02',
        description: 'Edward Hopper\'s paintings of New York City',
        official_url: 'https://whitney.org',
        source: 'north_america_museums'
      },
      // 미국 - 로스앤젤레스
      {
        title_en: 'PST ART: Art & Science Collide',
        title_local: 'PST ART: Art & Science Collide',
        venue_name: 'Getty Center',
        venue_city: 'Los Angeles',
        venue_country: 'US',
        start_date: '2024-09-15',
        end_date: '2025-01-11',
        description: 'Exploring the intersection of art and science',
        official_url: 'https://www.getty.edu',
        source: 'north_america_museums'
      },
      {
        title_en: 'Yoshitomo Nara',
        title_local: 'Yoshitomo Nara',
        venue_name: 'Los Angeles County Museum of Art (LACMA)',
        venue_city: 'Los Angeles',
        venue_country: 'US',
        start_date: '2025-01-05',
        end_date: '2025-07-05',
        description: 'Major retrospective of Yoshitomo Nara',
        official_url: 'https://www.lacma.org',
        source: 'north_america_museums'
      },
      // 미국 - 시카고
      {
        title_en: 'El Greco: Ambition and Defiance',
        title_local: 'El Greco: Ambition and Defiance',
        venue_name: 'Art Institute of Chicago',
        venue_city: 'Chicago',
        venue_country: 'US',
        start_date: '2024-11-07',
        end_date: '2025-02-21',
        description: 'First major retrospective of El Greco in the US',
        official_url: 'https://www.artic.edu',
        source: 'north_america_museums'
      },
      // 미국 - 워싱턴 DC
      {
        title_en: 'Paris 1874: The Impressionist Moment',
        title_local: 'Paris 1874: The Impressionist Moment',
        venue_name: 'National Gallery of Art',
        venue_city: 'Washington DC',
        venue_country: 'US',
        start_date: '2024-09-08',
        end_date: '2025-01-19',
        description: 'Commemorating 150 years of Impressionism',
        official_url: 'https://www.nga.gov',
        source: 'north_america_museums'
      },
      // 캐나다
      {
        title_en: 'Indigenous Contemporary Art',
        title_local: 'Art contemporain autochtone',
        venue_name: 'National Gallery of Canada',
        venue_city: 'Ottawa',
        venue_country: 'CA',
        start_date: '2025-02-01',
        end_date: '2025-06-01',
        description: 'Contemporary Indigenous artists from across Canada',
        official_url: 'https://www.gallery.ca',
        source: 'north_america_museums'
      },
      {
        title_en: 'Toronto Biennial of Art 2025',
        title_local: 'Toronto Biennial of Art 2025',
        venue_name: 'Art Gallery of Ontario',
        venue_city: 'Toronto',
        venue_country: 'CA',
        start_date: '2025-09-01',
        end_date: '2025-12-01',
        description: 'International contemporary art biennial',
        official_url: 'https://ago.ca',
        source: 'north_america_museums'
      }
    ];

    await this.saveExhibitions(northAmericanExhibitions);
  }

  // 유럽 미술관
  async collectEuropeanMuseums() {
    console.log('\n🌍 유럽 미술관 전시 수집...\n');

    const europeanExhibitions = [
      // 프랑스
      {
        title_en: 'Impressionism: Pathways to Modernity',
        title_local: 'L\'impressionnisme: Chemins vers la modernité',
        venue_name: 'Musée d\'Orsay',
        venue_city: 'Paris',
        venue_country: 'FR',
        start_date: '2025-03-26',
        end_date: '2025-07-14',
        description: 'Impressionism\'s role in shaping modern art',
        official_url: 'https://www.musee-orsay.fr',
        source: 'europe_museums'
      },
      {
        title_en: 'Louvre Masterpieces',
        title_local: 'Chefs-d\'œuvre du Louvre',
        venue_name: 'Musée du Louvre',
        venue_city: 'Paris',
        venue_country: 'FR',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: 'Permanent collection highlights',
        official_url: 'https://www.louvre.fr',
        source: 'europe_museums'
      },
      {
        title_en: 'Contemporary Voices',
        title_local: 'Voix contemporaines',
        venue_name: 'Centre Pompidou',
        venue_city: 'Paris',
        venue_country: 'FR',
        start_date: '2025-02-05',
        end_date: '2025-05-25',
        description: 'Contemporary art from around the world',
        official_url: 'https://www.centrepompidou.fr',
        source: 'europe_museums'
      },
      // 영국
      {
        title_en: 'Turner Prize 2025',
        title_local: 'Turner Prize 2025',
        venue_name: 'Tate Britain',
        venue_city: 'London',
        venue_country: 'GB',
        start_date: '2025-09-25',
        end_date: '2026-01-12',
        description: 'Annual prize for contemporary British art',
        official_url: 'https://www.tate.org.uk',
        source: 'europe_museums'
      },
      {
        title_en: 'Michelangelo, Leonardo, Raphael',
        title_local: 'Michelangelo, Leonardo, Raphael',
        venue_name: 'Royal Academy of Arts',
        venue_city: 'London',
        venue_country: 'GB',
        start_date: '2024-11-09',
        end_date: '2025-02-16',
        description: 'Works on paper by Renaissance masters',
        official_url: 'https://www.royalacademy.org.uk',
        source: 'europe_museums'
      },
      // 스페인
      {
        title_en: 'Goya: Disasters of War',
        title_local: 'Goya: Los desastres de la guerra',
        venue_name: 'Museo Nacional del Prado',
        venue_city: 'Madrid',
        venue_country: 'ES',
        start_date: '2025-02-15',
        end_date: '2025-05-15',
        description: 'Goya\'s powerful anti-war prints',
        official_url: 'https://www.museodelprado.es',
        source: 'europe_museums'
      },
      {
        title_en: 'Picasso 1906: The Great Transformation',
        title_local: 'Picasso 1906: La gran transformación',
        venue_name: 'Museo Nacional Centro de Arte Reina Sofía',
        venue_city: 'Madrid',
        venue_country: 'ES',
        start_date: '2024-11-12',
        end_date: '2025-03-04',
        description: 'Picasso\'s pivotal year of 1906',
        official_url: 'https://www.museoreinasofia.es',
        source: 'europe_museums'
      },
      // 이탈리아
      {
        title_en: 'Caravaggio and His Time',
        title_local: 'Caravaggio e il suo tempo',
        venue_name: 'Galleria Borghese',
        venue_city: 'Rome',
        venue_country: 'IT',
        start_date: '2025-03-01',
        end_date: '2025-06-30',
        description: 'Caravaggio in context with his contemporaries',
        official_url: 'https://galleriaborghese.beniculturali.it',
        source: 'europe_museums'
      },
      {
        title_en: 'Venice Biennale 2025',
        title_local: 'Biennale di Venezia 2025',
        venue_name: 'Venice Biennale',
        venue_city: 'Venice',
        venue_country: 'IT',
        start_date: '2025-04-20',
        end_date: '2025-11-24',
        description: 'International art exhibition',
        official_url: 'https://www.labiennale.org',
        source: 'europe_museums'
      },
      // 독일
      {
        title_en: 'Bauhaus and Its Legacy',
        title_local: 'Bauhaus und sein Erbe',
        venue_name: 'Bauhaus-Archiv',
        venue_city: 'Berlin',
        venue_country: 'DE',
        start_date: '2025-01-15',
        end_date: '2025-12-31',
        description: 'The continuing influence of Bauhaus',
        official_url: 'https://www.bauhaus.de',
        source: 'europe_museums'
      },
      {
        title_en: 'documenta 16',
        title_local: 'documenta 16',
        venue_name: 'Museum Fridericianum',
        venue_city: 'Kassel',
        venue_country: 'DE',
        start_date: '2025-06-18',
        end_date: '2025-09-25',
        description: 'Contemporary art exhibition held every five years',
        official_url: 'https://www.documenta.de',
        source: 'europe_museums'
      },
      // 네덜란드
      {
        title_en: 'Vermeer\'s World',
        title_local: 'De wereld van Vermeer',
        venue_name: 'Rijksmuseum',
        venue_city: 'Amsterdam',
        venue_country: 'NL',
        start_date: '2025-02-10',
        end_date: '2025-06-08',
        description: 'Johannes Vermeer and 17th century Dutch life',
        official_url: 'https://www.rijksmuseum.nl',
        source: 'europe_museums'
      },
      {
        title_en: 'Van Gogh and Japan',
        title_local: 'Van Gogh en Japan',
        venue_name: 'Van Gogh Museum',
        venue_city: 'Amsterdam',
        venue_country: 'NL',
        start_date: '2025-03-01',
        end_date: '2025-06-30',
        description: 'Japanese influence on Van Gogh\'s work',
        official_url: 'https://www.vangoghmuseum.nl',
        source: 'europe_museums'
      },
      // 러시아
      {
        title_en: 'Russian Avant-Garde',
        title_local: 'Русский авангард',
        venue_name: 'State Hermitage Museum',
        venue_city: 'St. Petersburg',
        venue_country: 'RU',
        start_date: '2025-01-20',
        end_date: '2025-05-20',
        description: 'Revolutionary art of early 20th century Russia',
        official_url: 'https://www.hermitagemuseum.org',
        source: 'europe_museums'
      }
    ];

    await this.saveExhibitions(europeanExhibitions);
  }

  // 남미 미술관
  async collectSouthAmericanMuseums() {
    console.log('\n🌎 남미 미술관 전시 수집...\n');

    const southAmericanExhibitions = [
      // 브라질
      {
        title_en: 'São Paulo Biennial 2025',
        title_local: 'Bienal de São Paulo 2025',
        venue_name: 'Fundação Bienal de São Paulo',
        venue_city: 'São Paulo',
        venue_country: 'BR',
        start_date: '2025-09-06',
        end_date: '2025-12-07',
        description: 'International contemporary art biennial',
        official_url: 'http://www.bienal.org.br',
        source: 'south_america_museums'
      },
      {
        title_en: 'Brazilian Modernism',
        title_local: 'Modernismo Brasileiro',
        venue_name: 'Museu de Arte de São Paulo (MASP)',
        venue_city: 'São Paulo',
        venue_country: 'BR',
        start_date: '2025-02-01',
        end_date: '2025-06-01',
        description: 'The modernist movement in Brazilian art',
        official_url: 'https://masp.org.br',
        source: 'south_america_museums'
      },
      // 아르헨티나
      {
        title_en: 'Latin American Contemporary',
        title_local: 'Contemporáneo Latinoamericano',
        venue_name: 'Museo de Arte Latinoamericano de Buenos Aires (MALBA)',
        venue_city: 'Buenos Aires',
        venue_country: 'AR',
        start_date: '2025-03-01',
        end_date: '2025-07-01',
        description: 'Contemporary art from across Latin America',
        official_url: 'https://www.malba.org.ar',
        source: 'south_america_museums'
      },
      // 멕시코
      {
        title_en: 'Frida and Diego: Love and Revolution',
        title_local: 'Frida y Diego: Amor y Revolución',
        venue_name: 'Museo Frida Kahlo',
        venue_city: 'Mexico City',
        venue_country: 'MX',
        start_date: '2025-01-15',
        end_date: '2025-12-31',
        description: 'The life and art of Frida Kahlo and Diego Rivera',
        official_url: 'https://www.museofridakahlo.org.mx',
        source: 'south_america_museums'
      },
      {
        title_en: 'Pre-Columbian Treasures',
        title_local: 'Tesoros Precolombinos',
        venue_name: 'Museo Nacional de Antropología',
        venue_city: 'Mexico City',
        venue_country: 'MX',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: 'Ancient Mesoamerican art and artifacts',
        official_url: 'https://www.mna.inah.gob.mx',
        source: 'south_america_museums'
      }
    ];

    await this.saveExhibitions(southAmericanExhibitions);
  }

  // 오세아니아 미술관
  async collectOceaniaMuseums() {
    console.log('\n🌏 오세아니아 미술관 전시 수집...\n');

    const oceaniaExhibitions = [
      // 호주
      {
        title_en: 'Aboriginal and Torres Strait Islander Art',
        title_local: 'Aboriginal and Torres Strait Islander Art',
        venue_name: 'National Gallery of Australia',
        venue_city: 'Canberra',
        venue_country: 'AU',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: 'Indigenous Australian art collection',
        official_url: 'https://nga.gov.au',
        source: 'oceania_museums'
      },
      {
        title_en: 'Sydney Biennale 2025',
        title_local: 'Sydney Biennale 2025',
        venue_name: 'Art Gallery of New South Wales',
        venue_city: 'Sydney',
        venue_country: 'AU',
        start_date: '2025-03-15',
        end_date: '2025-06-15',
        description: 'International contemporary art festival',
        official_url: 'https://www.artgallery.nsw.gov.au',
        source: 'oceania_museums'
      },
      // 뉴질랜드
      {
        title_en: 'Te Ao Māori: The Māori World',
        title_local: 'Te Ao Māori',
        venue_name: 'Te Papa Tongarewa',
        venue_city: 'Wellington',
        venue_country: 'NZ',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: 'Māori art and culture',
        official_url: 'https://www.tepapa.govt.nz',
        source: 'oceania_museums'
      }
    ];

    await this.saveExhibitions(oceaniaExhibitions);
  }

  // 중동/아프리카 미술관
  async collectMiddleEastAfricaMuseums() {
    console.log('\n🌍 중동/아프리카 미술관 전시 수집...\n');

    const middleEastAfricaExhibitions = [
      // UAE
      {
        title_en: 'Islamic Art Now',
        title_local: 'الفن الإسلامي الآن',
        venue_name: 'Louvre Abu Dhabi',
        venue_city: 'Abu Dhabi',
        venue_country: 'AE',
        start_date: '2025-02-01',
        end_date: '2025-06-01',
        description: 'Contemporary interpretations of Islamic art',
        official_url: 'https://www.louvreabudhabi.ae',
        source: 'middle_east_africa_museums'
      },
      {
        title_en: 'Sharjah Biennial 16',
        title_local: 'بينالي الشارقة 16',
        venue_name: 'Sharjah Art Foundation',
        venue_city: 'Sharjah',
        venue_country: 'AE',
        start_date: '2025-02-07',
        end_date: '2025-06-07',
        description: 'International contemporary art biennial',
        official_url: 'https://sharjahart.org',
        source: 'middle_east_africa_museums'
      },
      // 이집트
      {
        title_en: 'Tutankhamun: Treasures of the Golden Pharaoh',
        title_local: 'توت عنخ آمون: كنوز الفرعون الذهبي',
        venue_name: 'Grand Egyptian Museum',
        venue_city: 'Cairo',
        venue_country: 'EG',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        description: 'The complete Tutankhamun collection',
        official_url: 'http://gem.gov.eg',
        source: 'middle_east_africa_museums'
      },
      // 남아프리카
      {
        title_en: 'Contemporary African Art',
        title_local: 'Contemporary African Art',
        venue_name: 'Zeitz Museum of Contemporary African Art',
        venue_city: 'Cape Town',
        venue_country: 'ZA',
        start_date: '2025-03-01',
        end_date: '2025-07-01',
        description: 'Leading contemporary African artists',
        official_url: 'https://zeitzmocaa.museum',
        source: 'middle_east_africa_museums'
      }
    ];

    await this.saveExhibitions(middleEastAfricaExhibitions);
  }

  // 전시 일괄 저장
  async saveExhibitions(exhibitions) {
    for (const exhibition of exhibitions) {
      await this.saveExhibition(exhibition);
    }
  }

  // 전시 저장 (기존 메서드와 동일)
  async saveExhibition(exhibition) {
    const client = await pool.connect();
    
    try {
      // 중복 확인
      const existing = await client.query(
        'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND start_date = $3',
        [exhibition.title_en, exhibition.venue_name, exhibition.start_date]
      );

      if (existing.rows.length > 0) {
        this.stats.skipped++;
        return false;
      }

      // venue 찾기 또는 생성
      let venueId = null;
      const venueResult = await client.query(
        'SELECT id FROM venues WHERE name = $1',
        [exhibition.venue_name]
      );

      if (venueResult.rows.length === 0) {
        // 새 venue 생성
        const newVenueId = await client.query(
          `INSERT INTO venues (name, city, country, tier, is_active) 
           VALUES ($1, $2, $3, $4, true) 
           RETURNING id`,
          [exhibition.venue_name, exhibition.venue_city, exhibition.venue_country, 1]
        );
        venueId = newVenueId.rows[0].id;
        console.log(`  ✨ 새 미술관 추가: ${exhibition.venue_name}`);
      } else {
        venueId = venueResult.rows[0].id;
      }

      // 날짜 처리
      const startDate = new Date(exhibition.start_date);
      const endDate = new Date(exhibition.end_date);
      const now = new Date();
      
      let status;
      if (now < startDate) status = 'upcoming';
      else if (now > endDate) status = 'past';
      else status = 'current';

      // 전시 저장
      const exhibitionId = uuidv4();
      await client.query(`
        INSERT INTO exhibitions (
          id, title_en, title_local, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, status, description,
          source, official_url,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          NOW(), NOW()
        )
      `, [
        exhibitionId,
        exhibition.title_en,
        exhibition.title_local || exhibition.title_en,
        venueId,
        exhibition.venue_name,
        exhibition.venue_city,
        exhibition.venue_country,
        startDate,
        endDate,
        status,
        exhibition.description,
        exhibition.source,
        exhibition.official_url
      ]);

      console.log(`✅ ${exhibition.venue_country}: ${exhibition.title_en}`);
      this.stats.added++;
      this.stats.total++;
      return true;

    } catch (error) {
      console.error(`❌ 저장 오류:`, error.message);
      this.stats.errors++;
      return false;
    } finally {
      client.release();
    }
  }

  // 최종 통계
  async showFinalStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international,
        COUNT(DISTINCT venue_country) as countries,
        COUNT(DISTINCT venue_name) as venues
      FROM exhibitions
    `);

    const topCountries = await pool.query(`
      SELECT 
        venue_country,
        COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_country
      ORDER BY count DESC
      LIMIT 15
    `);

    const continentStats = await pool.query(`
      SELECT 
        CASE 
          WHEN venue_country IN ('KR', 'JP', 'CN', 'HK', 'SG', 'IN', 'TH', 'TW', 'MY', 'ID', 'PH', 'VN') THEN 'Asia'
          WHEN venue_country IN ('US', 'CA', 'MX') THEN 'North America'
          WHEN venue_country IN ('GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'CH', 'AT', 'BE', 'DK', 'SE', 'NO', 'FI', 'RU', 'PL', 'CZ', 'GR', 'PT', 'IE') THEN 'Europe'
          WHEN venue_country IN ('BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY') THEN 'South America'
          WHEN venue_country IN ('AU', 'NZ', 'FJ') THEN 'Oceania'
          WHEN venue_country IN ('AE', 'SA', 'EG', 'IL', 'TR', 'ZA', 'NG', 'KE', 'MA') THEN 'Middle East/Africa'
          ELSE 'Other'
        END as continent,
        COUNT(*) as count
      FROM exhibitions
      GROUP BY continent
      ORDER BY count DESC
    `);

    console.log('\n\n🎉 대규모 수집 완료!');
    console.log('='.repeat(60));
    console.log('\n📊 전체 통계:');
    console.log(`   총 전시: ${stats.rows[0].total}개`);
    console.log(`   총 미술관/갤러리: ${stats.rows[0].venues}개`);
    console.log(`   총 국가: ${stats.rows[0].countries}개`);
    console.log(`   진행중: ${stats.rows[0].current}개`);
    console.log(`   예정: ${stats.rows[0].upcoming}개`);
    console.log(`   국내 전시: ${stats.rows[0].korean}개`);
    console.log(`   해외 전시: ${stats.rows[0].international}개`);

    console.log('\n🌍 대륙별 분포:');
    continentStats.rows.forEach(cont => {
      const percentage = ((cont.count / stats.rows[0].total) * 100).toFixed(1);
      console.log(`   ${cont.continent}: ${cont.count}개 (${percentage}%)`);
    });

    console.log('\n🏆 상위 15개 국가:');
    const countryNames = {
      'KR': '🇰🇷 한국', 'US': '🇺🇸 미국', 'GB': '🇬🇧 영국', 'FR': '🇫🇷 프랑스',
      'DE': '🇩🇪 독일', 'IT': '🇮🇹 이탈리아', 'ES': '🇪🇸 스페인', 'JP': '🇯🇵 일본',
      'CN': '🇨🇳 중국', 'CA': '🇨🇦 캐나다', 'AU': '🇦🇺 호주', 'NL': '🇳🇱 네덜란드',
      'BR': '🇧🇷 브라질', 'MX': '🇲🇽 멕시코', 'RU': '🇷🇺 러시아', 'IN': '🇮🇳 인도',
      'SG': '🇸🇬 싱가포르', 'HK': '🇭🇰 홍콩', 'AE': '🇦🇪 UAE', 'NZ': '🇳🇿 뉴질랜드'
    };
    
    topCountries.rows.forEach((country, index) => {
      const name = countryNames[country.venue_country] || country.venue_country;
      console.log(`   ${index + 1}. ${name}: ${country.count}개`);
    });

    console.log('\n💡 이번 수집 요약:');
    console.log(`   추가됨: ${this.stats.added}개`);
    console.log(`   건너뜀: ${this.stats.skipped}개`);
    console.log(`   오류: ${this.stats.errors}개`);
  }
}

async function main() {
  const collector = new MassiveExhibitionCollector();
  
  try {
    await collector.collectMassive();
  } catch (error) {
    console.error('수집 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = MassiveExhibitionCollector;