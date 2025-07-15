const Venue = require('../models/venue');

const venueSeeder = {
  async seedVenues() {
    console.log('Starting venue seeding...');
    
    const venues = [
      // Seoul - Tier 1 (Major Museums)
      {
        name: '국립현대미술관 서울관',
        nameEn: 'MMCA Seoul',
        type: 'museum',
        tier: '1',
        address: '서울특별시 종로구 삼청로 30',
        city: '서울',
        country: 'KR',
        website: 'https://www.mmca.go.kr',
        instagram: '@mmcakorea',
        crawlUrl: 'https://www.mmca.go.kr/exhibitions/exhibitionsList.do',
        crawlFrequency: 'daily'
      },
      {
        name: '서울시립미술관',
        nameEn: 'Seoul Museum of Art',
        type: 'museum',
        tier: '1',
        address: '서울특별시 중구 덕수궁길 61',
        city: '서울',
        country: 'KR',
        website: 'https://sema.seoul.go.kr',
        instagram: '@seoulmuseumofart',
        crawlFrequency: 'daily'
      },
      {
        name: '리움미술관',
        nameEn: 'Leeum Museum of Art',
        type: 'museum',
        tier: '1',
        address: '서울특별시 용산구 이태원로55길 60',
        city: '서울',
        country: 'KR',
        website: 'https://www.leeum.org',
        instagram: '@leeummuseumofart',
        crawlFrequency: 'daily'
      },
      {
        name: '아모레퍼시픽미술관',
        nameEn: 'Amorepacific Museum of Art',
        type: 'museum',
        tier: '1',
        address: '서울특별시 용산구 한강대로 100',
        city: '서울',
        country: 'KR',
        website: 'https://museum.amorepacific.com',
        instagram: '@amorepacific.museum.of.art',
        crawlFrequency: 'daily'
      },
      
      // Seoul - Tier 1 (Major Galleries)
      {
        name: '갤러리현대',
        nameEn: 'Gallery Hyundai',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 종로구 삼청로 14',
        city: '서울',
        country: 'KR',
        website: 'https://www.galleryhyundai.com',
        instagram: '@galleryhyundai',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '국제갤러리',
        nameEn: 'Kukje Gallery',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 종로구 소격동 58-1',
        city: '서울',
        country: 'KR',
        website: 'https://www.kukjegallery.com',
        instagram: '@kukjegallery',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: 'PKM갤러리',
        nameEn: 'PKM Gallery',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 종로구 삼청로7길 40',
        city: '서울',
        country: 'KR',
        website: 'https://www.pkmgallery.com',
        instagram: '@pkmgallery',
        crawlFrequency: 'twice_weekly'
      },
      
      // Seoul - Tier 2 (Important Spaces)
      {
        name: '대림미술관',
        nameEn: 'Daelim Museum',
        type: 'museum',
        tier: '2',
        address: '서울특별시 종로구 자하문로4길 21',
        city: '서울',
        country: 'KR',
        website: 'https://daelimmuseum.org',
        instagram: '@daelimmuseum',
        crawlFrequency: 'weekly'
      },
      {
        name: '서울미술관',
        nameEn: 'Seoul Museum',
        type: 'museum',
        tier: '2',
        address: '서울특별시 종로구 평창30길 28',
        city: '서울',
        country: 'KR',
        website: 'https://seoulmuseum.org',
        instagram: '@seoul_museum',
        crawlFrequency: 'weekly'
      },
      {
        name: '아트선재센터',
        nameEn: 'Art Sonje Center',
        type: 'alternative_space',
        tier: '2',
        address: '서울특별시 종로구 율곡로3길 87',
        city: '서울',
        country: 'KR',
        website: 'https://artsonje.org',
        instagram: '@artsonjecenter',
        crawlFrequency: 'weekly'
      },
      {
        name: '그라운드시소 서촌',
        nameEn: 'Groundseesaw Seochon',
        type: 'alternative_space',
        tier: '2',
        address: '서울특별시 종로구 자하문로6길 18-8',
        city: '서울',
        country: 'KR',
        website: 'https://groundseesaw.com',
        instagram: '@groundseesaw',
        crawlFrequency: 'weekly'
      },
      {
        name: '페이스갤러리 서울',
        nameEn: 'Pace Gallery Seoul',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 용산구 이태원로 262',
        city: '서울',
        country: 'KR',
        website: 'https://www.pacegallery.com',
        instagram: '@pacegallery',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '타데우스 로팍 서울',
        nameEn: 'Thaddaeus Ropac Seoul',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 용산구 독서당로 122-1',
        city: '서울',
        country: 'KR',
        website: 'https://www.ropac.net',
        instagram: '@thaddaeusropac',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '송은',
        nameEn: 'SongEun',
        type: 'gallery',
        tier: '2',
        address: '서울특별시 강남구 압구정로75길 6',
        city: '서울',
        country: 'KR',
        website: 'https://www.songeun.or.kr',
        instagram: '@songeunartspace',
        crawlFrequency: 'weekly'
      },
      {
        name: 'K현대미술관',
        nameEn: 'K Museum of Contemporary Art',
        type: 'museum',
        tier: '2',
        address: '서울특별시 강남구 언주로 807',
        city: '서울',
        country: 'KR',
        website: 'https://www.kmcamuseum.org',
        instagram: '@kmcamuseum',
        crawlFrequency: 'weekly'
      },
      {
        name: '페로탱 서울',
        nameEn: 'Perrotin Seoul',
        type: 'gallery',
        tier: '1',
        address: '서울특별시 강남구 도산대로45길 5',
        city: '서울',
        country: 'KR',
        website: 'https://www.perrotin.com',
        instagram: '@perrotin',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '디뮤지엄',
        nameEn: 'D Museum',
        type: 'museum',
        tier: '2',
        address: '서울특별시 성동구 왕십리로 83-21',
        city: '서울',
        country: 'KR',
        website: 'https://dmuseum.org',
        instagram: '@d_museum',
        crawlFrequency: 'weekly'
      },
      {
        name: '일민미술관',
        nameEn: 'Ilmin Museum of Art',
        type: 'museum',
        tier: '2',
        address: '서울특별시 중구 세종대로 152',
        city: '서울',
        country: 'KR',
        website: 'https://ilmin.org',
        instagram: '@ilminmuseumofart',
        crawlFrequency: 'weekly'
      },
      {
        name: '플랫폼엘',
        nameEn: 'Platform-L',
        type: 'art_center',
        tier: '2',
        address: '서울특별시 강남구 언주로133길 11',
        city: '서울',
        country: 'KR',
        website: 'https://platform-l.org',
        instagram: '@platform_l_',
        crawlFrequency: 'weekly'
      },
      
      // Gyeonggi-do
      {
        name: '국립현대미술관 과천관',
        nameEn: 'MMCA Gwacheon',
        type: 'museum',
        tier: '1',
        address: '경기도 과천시 광명로 313',
        city: '과천',
        country: 'KR',
        website: 'https://www.mmca.go.kr',
        instagram: '@mmcakorea',
        crawlFrequency: 'daily'
      },
      {
        name: '백남준아트센터',
        nameEn: 'Nam June Paik Art Center',
        type: 'museum',
        tier: '1',
        address: '경기도 용인시 기흥구 백남준로 10',
        city: '용인',
        country: 'KR',
        website: 'https://njp.ggcf.kr',
        instagram: '@namjunepaikartcenter',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '경기도미술관',
        nameEn: 'Gyeonggi Museum of Modern Art',
        type: 'museum',
        tier: '2',
        address: '경기도 안산시 단원구 초지동 677-1',
        city: '안산',
        country: 'KR',
        website: 'https://gmoma.ggcf.kr',
        instagram: '@gyeonggi_moma',
        crawlFrequency: 'weekly'
      },
      
      // Busan
      {
        name: '부산시립미술관',
        nameEn: 'Busan Museum of Art',
        type: 'museum',
        tier: '1',
        address: '부산광역시 해운대구 APEC로 58',
        city: '부산',
        country: 'KR',
        website: 'https://art.busan.go.kr',
        instagram: '@busanmuseumofart',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '부산현대미술관',
        nameEn: 'Museum of Contemporary Art Busan',
        type: 'museum',
        tier: '1',
        address: '부산광역시 사하구 낙동남로 1191',
        city: '부산',
        country: 'KR',
        website: 'https://www.busan.go.kr/moca',
        instagram: '@mocabusan',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: 'F1963',
        nameEn: 'F1963',
        type: 'art_center',
        tier: '2',
        address: '부산광역시 수영구 구락로123번길 20',
        city: '부산',
        country: 'KR',
        website: 'https://www.f1963.org',
        instagram: '@f1963_official',
        crawlFrequency: 'weekly'
      },
      
      // Daegu
      {
        name: '대구미술관',
        nameEn: 'Daegu Art Museum',
        type: 'museum',
        tier: '1',
        address: '대구광역시 수성구 미술관로 40',
        city: '대구',
        country: 'KR',
        website: 'https://daeguartmuseum.or.kr',
        instagram: '@daeguartmuseum',
        crawlFrequency: 'twice_weekly'
      },
      
      // Gwangju
      {
        name: '광주시립미술관',
        nameEn: 'Gwangju Museum of Art',
        type: 'museum',
        tier: '1',
        address: '광주광역시 북구 하서로 55',
        city: '광주',
        country: 'KR',
        website: 'https://artmuse.gwangju.go.kr',
        instagram: '@gwangjumuseumofart',
        crawlFrequency: 'twice_weekly'
      },
      {
        name: '국립아시아문화전당',
        nameEn: 'Asia Culture Center',
        type: 'art_center',
        tier: '1',
        address: '광주광역시 동구 문화전당로 38',
        city: '광주',
        country: 'KR',
        website: 'https://www.acc.go.kr',
        instagram: '@asiaculturecenter',
        crawlFrequency: 'twice_weekly'
      },
      
      // Jeju
      {
        name: '제주도립미술관',
        nameEn: 'Jeju Museum of Art',
        type: 'museum',
        tier: '2',
        address: '제주특별자치도 제주시 한경면 저지14길 35',
        city: '제주',
        country: 'KR',
        website: 'https://jmoa.jeju.go.kr',
        instagram: '@jejumuseumofart',
        crawlFrequency: 'weekly'
      },
      {
        name: '제주현대미술관',
        nameEn: 'Jeju Museum of Contemporary Art',
        type: 'museum',
        tier: '2',
        address: '제주특별자치도 제주시 한경면 저지14길 35',
        city: '제주',
        country: 'KR',
        website: 'https://www.jejumuseum.go.kr',
        crawlFrequency: 'weekly'
      },
      
      // International - New York
      {
        name: 'The Metropolitan Museum of Art',
        nameEn: 'The Met',
        type: 'museum',
        tier: '1',
        address: '1000 Fifth Avenue, New York, NY 10028',
        city: 'New York',
        country: 'US',
        website: 'https://www.metmuseum.org',
        instagram: '@metmuseum',
        crawlFrequency: 'daily'
      },
      {
        name: 'Museum of Modern Art',
        nameEn: 'MoMA',
        type: 'museum',
        tier: '1',
        address: '11 West 53 Street, New York, NY 10019',
        city: 'New York',
        country: 'US',
        website: 'https://www.moma.org',
        instagram: '@themuseumofmodernart',
        crawlFrequency: 'daily'
      },
      
      // International - London
      {
        name: 'Tate Modern',
        nameEn: 'Tate Modern',
        type: 'museum',
        tier: '1',
        address: 'Bankside, London SE1 9TG',
        city: 'London',
        country: 'GB',
        website: 'https://www.tate.org.uk',
        instagram: '@tate',
        crawlFrequency: 'daily'
      },
      
      // International - Paris
      {
        name: 'Centre Pompidou',
        nameEn: 'Centre Pompidou',
        type: 'museum',
        tier: '1',
        address: 'Place Georges-Pompidou, 75004 Paris',
        city: 'Paris',
        country: 'FR',
        website: 'https://www.centrepompidou.fr',
        instagram: '@centrepompidou',
        crawlFrequency: 'daily'
      },
      
      // International - Tokyo
      {
        name: '森美術館',
        nameEn: 'Mori Art Museum',
        type: 'museum',
        tier: '1',
        address: 'Roppongi Hills Mori Tower, 6-10-1 Roppongi, Minato',
        city: 'Tokyo',
        country: 'JP',
        website: 'https://www.mori.art.museum',
        instagram: '@moriartmuseum',
        crawlFrequency: 'daily'
      }
    ];
    
    try {
      for (const venueData of venues) {
        const existing = await Venue.findOne({ where: { name: venueData.name } });
        if (!existing) {
          await Venue.create(venueData);
          console.log(`Created venue: ${venueData.name}`);
        } else {
          console.log(`Venue already exists: ${venueData.name}`);
        }
      }
      
      console.log('Venue seeding completed!');
    } catch (error) {
      console.error('Error seeding venues:', error);
      throw error;
    }
  }
};

// Run seeder if called directly
if (require.main === module) {
  const sequelize = require('../config/database');
  
  (async () => {
    try {
      await sequelize.sync();
      await venueSeeder.seedVenues();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = venueSeeder;