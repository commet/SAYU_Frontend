#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 확장된 전국 미술관/갤러리 데이터
const expandedVenues = [
  // === 서울 - 국공립 미술관 ===
  {
    name: '국립현대미술관 서울',
    name_en: 'MMCA Seoul',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.mmca.go.kr',
    address: '서울시 종로구 삼청로 30',
    instagram: '@mmcakorea'
  },
  {
    name: '국립현대미술관 덕수궁',
    name_en: 'MMCA Deoksugung',
    city: '서울',
    district: '중구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.mmca.go.kr',
    address: '서울시 중구 세종대로 99 덕수궁 내'
  },
  {
    name: '서울시립미술관',
    name_en: 'Seoul Museum of Art',
    city: '서울',
    district: '중구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://sema.seoul.go.kr',
    address: '서울시 중구 덕수궁길 61',
    instagram: '@seoulmuseumofart'
  },
  {
    name: '서울시립 북서울미술관',
    name_en: 'Buk Seoul Museum of Art',
    city: '서울',
    district: '노원구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://sema.seoul.go.kr',
    address: '서울시 노원구 동일로 1238'
  },
  {
    name: '서울시립 남서울미술관',
    name_en: 'Nam Seoul Museum of Art',
    city: '서울',
    district: '관악구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://sema.seoul.go.kr',
    address: '서울시 관악구 남부순환로 2076'
  },
  {
    name: '백남준아트센터',
    name_en: 'Nam June Paik Art Center',
    city: '용인',
    district: '기흥구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://njp.ggcf.kr',
    address: '경기도 용인시 기흥구 백남준로 10',
    instagram: '@namjunepaikartcenter'
  },
  {
    name: '국립중앙박물관',
    name_en: 'National Museum of Korea',
    city: '서울',
    district: '용산구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.museum.go.kr',
    address: '서울시 용산구 서빙고로 137'
  },
  
  // === 서울 - 사립 미술관 (대형) ===
  {
    name: '리움미술관',
    name_en: 'Leeum Museum of Art',
    city: '서울',
    district: '용산구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.leeum.org',
    address: '서울시 용산구 이태원로55길 60-16',
    instagram: '@leeummuseumofart'
  },
  {
    name: '아모레퍼시픽미술관',
    name_en: 'Amorepacific Museum of Art',
    city: '서울',
    district: '용산구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://museum.amorepacific.com',
    address: '서울시 용산구 한강대로 100',
    instagram: '@amorepacific_museum'
  },
  {
    name: '대림미술관',
    name_en: 'Daelim Museum',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.daelimmuseum.org',
    address: '서울시 종로구 자하문로4길 21',
    instagram: '@daelimmuseum'
  },
  {
    name: '디뮤지엄',
    name_en: 'D Museum',
    city: '서울',
    district: '성동구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.dmuseum.org',
    address: '서울시 성동구 왕십리로 83-21',
    instagram: '@d_museum'
  },
  {
    name: '호암미술관',
    name_en: 'Hoam Museum of Art',
    city: '용인',
    district: '처인구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://hoam.samsungfoundation.org',
    address: '경기도 용인시 처인구 에버랜드로 562번길 38'
  },
  {
    name: '송은아트스페이스',
    name_en: 'SongEun Art Space',
    city: '서울',
    district: '강남구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.songeunart.org',
    address: '서울시 강남구 압구정로75길 6',
    instagram: '@songeunartspace'
  },
  
  // === 서울 - 사립 미술관 (중형) ===
  {
    name: 'OCI미술관',
    name_en: 'OCI Museum of Art',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.ocimuseum.org',
    address: '서울시 종로구 우정국로 45-14'
  },
  {
    name: '일민미술관',
    name_en: 'Ilmin Museum of Art',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.ilmin.org',
    address: '서울시 종로구 세종대로 152',
    instagram: '@ilminmuseumofart'
  },
  {
    name: '환기미술관',
    name_en: 'Whanki Museum',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.whankimuseum.org',
    address: '서울시 종로구 자하문로40길 63',
    instagram: '@whankimuseum'
  },
  {
    name: '성곡미술관',
    name_en: 'Sungkok Art Museum',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.sungkokmuseum.org',
    address: '서울시 종로구 경희궁길 42'
  },
  {
    name: '아트센터나비',
    name_en: 'Art Center Nabi',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.nabi.or.kr',
    address: '서울시 종로구 종로26 SK빌딩'
  },
  {
    name: '사비나미술관',
    name_en: 'Savina Museum',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.savinamuseum.com',
    address: '서울시 종로구 율곡로 49-4'
  },
  {
    name: '대안공간 루프',
    name_en: 'Alternative Space Loop',
    city: '서울',
    district: '마포구',
    country: 'KR',
    type: 'gallery',
    tier: 3,
    website: 'https://www.altspaceloop.com',
    address: '서울시 마포구 와우산로29나길 20'
  },
  
  // === 서울 - 주요 갤러리 ===
  {
    name: '국제갤러리',
    name_en: 'Kukje Gallery',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.kukjegallery.com',
    address: '서울시 종로구 소격동 58-1',
    instagram: '@kukjegallery'
  },
  {
    name: '갤러리현대',
    name_en: 'Gallery Hyundai',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.galleryhyundai.com',
    address: '서울시 종로구 삼청로 14',
    instagram: '@galleryhyundai'
  },
  {
    name: '학고재갤러리',
    name_en: 'Hakgojae Gallery',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.hakgojae.com',
    address: '서울시 종로구 삼청로 50'
  },
  {
    name: '아라리오갤러리',
    name_en: 'Arario Gallery',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.arariogallery.com',
    address: '서울시 종로구 소격동 87',
    instagram: '@arariogallery'
  },
  {
    name: 'PKM갤러리',
    name_en: 'PKM Gallery',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.pkmgallery.com',
    address: '서울시 종로구 삼청로 40',
    instagram: '@pkmgallery'
  },
  {
    name: '페이스갤러리',
    name_en: 'Pace Gallery Seoul',
    city: '서울',
    district: '용산구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.pacegallery.com',
    address: '서울시 용산구 이태원로 262',
    instagram: '@pacegallery'
  },
  {
    name: '리안갤러리',
    name_en: 'Leeahn Gallery',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.leeahngallery.com',
    address: '서울시 종로구 창성동 122-9'
  },
  
  // === 서울 - 대안공간/소규모 갤러리 ===
  {
    name: '아트선재센터',
    name_en: 'Art Sonje Center',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.artsonje.org',
    address: '서울시 종로구 율곡로3길 87',
    instagram: '@artsonjecenter'
  },
  {
    name: '플랫폼엘',
    name_en: 'Platform-L',
    city: '서울',
    district: '강남구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.platform-l.org',
    address: '서울시 강남구 언주로133길 11',
    instagram: '@platforml_contemporary_art_center'
  },
  {
    name: '두산아트센터',
    name_en: 'Doosan Art Center',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.doosanartcenter.com',
    address: '서울시 종로구 종로33길 15'
  },
  {
    name: '금호미술관',
    name_en: 'Kumho Museum of Art',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.kumhomuseum.com',
    address: '서울시 종로구 삼청로 18'
  },
  {
    name: '토탈미술관',
    name_en: 'Total Museum of Art',
    city: '서울',
    district: '종로구',
    country: 'KR',
    type: 'museum',
    tier: 3,
    website: 'https://www.totalmuseum.org',
    address: '서울시 종로구 평창32길 8'
  },
  
  // === 예술의전당 내 미술관/갤러리 ===
  {
    name: '예술의전당 한가람미술관',
    name_en: 'Hangaram Art Museum',
    city: '서울',
    district: '서초구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.sac.or.kr',
    address: '서울시 서초구 남부순환로 2406',
    instagram: '@seoulartscenter'
  },
  {
    name: '예술의전당 서울서예박물관',
    name_en: 'Seoul Calligraphy Art Museum',
    city: '서울',
    district: '서초구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.sac.or.kr',
    address: '서울시 서초구 남부순환로 2406'
  },
  {
    name: '예술의전당 한가람디자인미술관',
    name_en: 'Hangaram Design Museum',
    city: '서울',
    district: '서초구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.sac.or.kr',
    address: '서울시 서초구 남부순환로 2406'
  },
  
  // === 경기도 주요 미술관 ===
  {
    name: '국립현대미술관 과천',
    name_en: 'MMCA Gwacheon',
    city: '과천',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.mmca.go.kr',
    address: '경기도 과천시 광명로 313'
  },
  {
    name: '경기도미술관',
    name_en: 'Gyeonggi Museum of Modern Art',
    city: '안산',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://gmoma.ggcf.kr',
    address: '경기도 안산시 단원구 동산로 268',
    instagram: '@gyeonggi_moma'
  },
  {
    name: '수원시립미술관',
    name_en: 'Suwon Museum of Art',
    city: '수원',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://suma.suwon.go.kr',
    address: '경기도 수원시 장안구 송정로 19'
  },
  {
    name: '클레이아크김해미술관',
    name_en: 'ClayArch Gimhae Museum',
    city: '김해',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.clayarch.org',
    address: '경상남도 김해시 진례면 진례로 275-51'
  },
  {
    name: '실학박물관',
    name_en: 'Silhak Museum',
    city: '남양주',
    country: 'KR',
    type: 'museum',
    tier: 3,
    website: 'https://silhak.ggcf.kr',
    address: '경기도 남양주시 조안면 다산로747번길 16'
  },
  {
    name: '한국민속촌',
    name_en: 'Korean Folk Village',
    city: '용인',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.koreanfolk.co.kr',
    address: '경기도 용인시 기흥구 민속촌로 90'
  },
  
  // === 부산 ===
  {
    name: '부산시립미술관',
    name_en: 'Busan Museum of Art',
    city: '부산',
    district: '해운대구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://art.busan.go.kr',
    address: '부산시 해운대구 APEC로 58',
    instagram: '@busanmuseumofart'
  },
  {
    name: '부산현대미술관',
    name_en: 'Museum of Contemporary Art Busan',
    city: '부산',
    district: '사하구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.busan.go.kr/moca',
    address: '부산시 사하구 낙동남로 1191',
    instagram: '@mocabusan'
  },
  {
    name: 'F1963',
    name_en: 'F1963',
    city: '부산',
    district: '수영구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.f1963.org',
    address: '부산시 수영구 구락로123번길 20',
    instagram: '@f1963_official'
  },
  {
    name: '고은사진미술관',
    name_en: 'GoEun Museum of Photography',
    city: '부산',
    district: '해운대구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.goeunmuseum.kr',
    address: '부산시 해운대구 해운대로452번길 16'
  },
  {
    name: '부산문화회관',
    name_en: 'Busan Cultural Center',
    city: '부산',
    district: '남구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.bscc.or.kr',
    address: '부산시 남구 유엔평화로 76번길 1'
  },
  
  // === 대구 ===
  {
    name: '대구미술관',
    name_en: 'Daegu Art Museum',
    city: '대구',
    district: '수성구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://artmuseum.daegu.go.kr',
    address: '대구시 수성구 미술관로 40',
    instagram: '@daeguartmuseum'
  },
  {
    name: '대구문화예술회관',
    name_en: 'Daegu Arts Center',
    city: '대구',
    district: '달서구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.daeguartscenter.or.kr',
    address: '대구시 달서구 공원순환로 201'
  },
  {
    name: '봉산문화회관',
    name_en: 'Bongsan Cultural Center',
    city: '대구',
    district: '중구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://bongsanart.jung.daegu.kr',
    address: '대구시 중구 봉산문화길 77'
  },
  
  // === 인천 ===
  {
    name: '인천아트플랫폼',
    name_en: 'Incheon Art Platform',
    city: '인천',
    district: '중구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.inartplatform.kr',
    address: '인천시 중구 제물량로218번길 3',
    instagram: '@incheon_art_platform'
  },
  {
    name: '송도트리플스트리트',
    name_en: 'Songdo Triple Street',
    city: '인천',
    district: '연수구',
    country: 'KR',
    type: 'gallery',
    tier: 3,
    website: 'https://www.triplestreet.com',
    address: '인천시 연수구 송도과학로16번길 33-4'
  },
  
  // === 광주 ===
  {
    name: '국립아시아문화전당',
    name_en: 'Asia Culture Center',
    city: '광주',
    district: '동구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.acc.go.kr',
    address: '광주시 동구 문화전당로 38',
    instagram: '@asiaculturecenter'
  },
  {
    name: '광주시립미술관',
    name_en: 'Gwangju Museum of Art',
    city: '광주',
    district: '북구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://artmuse.gwangju.go.kr',
    address: '광주시 북구 하서로 52',
    instagram: '@gwangjumuseumofart'
  },
  {
    name: '광주비엔날레전시관',
    name_en: 'Gwangju Biennale Hall',
    city: '광주',
    district: '북구',
    country: 'KR',
    type: 'gallery',
    tier: 1,
    website: 'https://www.gwangjubiennale.org',
    address: '광주시 북구 비엔날레로 111',
    instagram: '@gwangjubiennale'
  },
  {
    name: '의재미술관',
    name_en: 'Uijae Museum of Korean Art',
    city: '광주',
    district: '동구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://ujam.gwangju.go.kr',
    address: '광주시 동구 운림동 148-2'
  },
  
  // === 대전 ===
  {
    name: '대전시립미술관',
    name_en: 'Daejeon Museum of Art',
    city: '대전',
    district: '서구',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://dmma.daejeon.go.kr',
    address: '대전시 서구 둔산대로 157',
    instagram: '@daejeon_museum_of_art'
  },
  {
    name: '대전예술의전당',
    name_en: 'Daejeon Arts Center',
    city: '대전',
    district: '서구',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.daejeon.go.kr/djac',
    address: '대전시 서구 둔산대로 135'
  },
  {
    name: '이응노미술관',
    name_en: 'Lee Ungno Museum',
    city: '대전',
    district: '서구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.leeungnomuseum.or.kr',
    address: '대전시 서구 둔산대로 157',
    instagram: '@leeungnomuseum'
  },
  
  // === 울산 ===
  {
    name: '울산시립미술관',
    name_en: 'Ulsan Art Museum',
    city: '울산',
    district: '중구',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.ulsan.go.kr/uam',
    address: '울산시 중구 종가로 304',
    instagram: '@ulsanartmuseum'
  },
  
  // === 강원도 ===
  {
    name: '강릉시립미술관',
    name_en: 'Gangneung Museum of Art',
    city: '강릉',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.gn.go.kr/museum',
    address: '강원도 강릉시 화부산로 40번길 46'
  },
  {
    name: '원주역사박물관',
    name_en: 'Wonju History Museum',
    city: '원주',
    country: 'KR',
    type: 'museum',
    tier: 3,
    website: 'https://www.wonjumuseum.or.kr',
    address: '강원도 원주시 봉산로 134'
  },
  {
    name: '뮤지엄산',
    name_en: 'Museum SAN',
    city: '원주',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.museumsan.org',
    address: '강원도 원주시 지정면 오크밸리2길 260',
    instagram: '@museum_san'
  },
  
  // === 충청도 ===
  {
    name: '국립현대미술관 청주',
    name_en: 'MMCA Cheongju',
    city: '청주',
    country: 'KR',
    type: 'museum',
    tier: 1,
    website: 'https://www.mmca.go.kr',
    address: '충청북도 청주시 청원구 상당로 314'
  },
  {
    name: '청주시립미술관',
    name_en: 'Cheongju Museum of Art',
    city: '청주',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://cmoa.cheongju.go.kr',
    address: '충청북도 청주시 서원구 충대로 1'
  },
  {
    name: '천안예술의전당',
    name_en: 'Cheonan Arts Center',
    city: '천안',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.cheonanart.or.kr',
    address: '충청남도 천안시 동남구 성남면 종합휴양지로 185'
  },
  
  // === 전라도 ===
  {
    name: '전북도립미술관',
    name_en: 'Jeonbuk Museum of Art',
    city: '완주',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.jma.go.kr',
    address: '전라북도 완주군 구이면 모악산길 111-6'
  },
  {
    name: '전주한옥마을아트홀',
    name_en: 'Jeonju Hanok Village Art Hall',
    city: '전주',
    country: 'KR',
    type: 'gallery',
    tier: 3,
    website: 'https://www.jeonju.go.kr',
    address: '전라북도 전주시 완산구 태조로 15'
  },
  {
    name: '소리문화의전당',
    name_en: 'Sori Arts Center',
    city: '전주',
    country: 'KR',
    type: 'gallery',
    tier: 2,
    website: 'https://www.soriart.or.kr',
    address: '전라북도 전주시 덕진구 소리로 31'
  },
  {
    name: '목포문화예술회관',
    name_en: 'Mokpo Culture & Arts Center',
    city: '목포',
    country: 'KR',
    type: 'gallery',
    tier: 3,
    website: 'https://www.mokpo.go.kr/art',
    address: '전라남도 목포시 남농로 102'
  },
  
  // === 경상도 ===
  {
    name: '포항시립미술관',
    name_en: 'Pohang Museum of Steel Art',
    city: '포항',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://poma.pohang.go.kr',
    address: '경상북도 포항시 북구 환호공원길 10',
    instagram: '@pohangmuseum'
  },
  {
    name: '창원시립마산문신미술관',
    name_en: 'Moonshin Art Museum',
    city: '창원',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://moonshin.changwon.go.kr',
    address: '경상남도 창원시 마산합포구 문신길 147'
  },
  {
    name: '김해문화의전당',
    name_en: 'Gimhae Arts & Sports Center',
    city: '김해',
    country: 'KR',
    type: 'gallery',
    tier: 3,
    website: 'https://www.gasc.or.kr',
    address: '경상남도 김해시 김해대로 2060'
  },
  
  // === 제주 ===
  {
    name: '제주도립미술관',
    name_en: 'Jeju Museum of Art',
    city: '제주',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.jeju.go.kr/jejumuseum',
    address: '제주시 1100로 2894-78'
  },
  {
    name: '제주현대미술관',
    name_en: 'Jeju Museum of Contemporary Art',
    city: '제주',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.jejumuseum.go.kr',
    address: '제주시 한경면 저지14길 35'
  },
  {
    name: '본태박물관',
    name_en: 'Bonte Museum',
    city: '서귀포',
    country: 'KR',
    type: 'museum',
    tier: 2,
    website: 'https://www.bontemuseum.com',
    address: '제주 서귀포시 안덕면 산록남로762번길 69',
    instagram: '@bontemuseum'
  },
  {
    name: '유민미술관',
    name_en: 'Yumin Art Museum',
    city: '서귀포',
    country: 'KR',
    type: 'museum',
    tier: 3,
    website: 'https://www.yuminart.org',
    address: '제주 서귀포시 성산읍 삼달신풍로 107'
  }
];

// 데이터베이스에 venue 추가
async function seedExpandedVenues() {
  const client = await pool.connect();
  
  try {
    console.log('🎨 Starting expanded venue seeding...');
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const venue of expandedVenues) {
      try {
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM venues WHERE name = $1 AND city = $2',
          [venue.name, venue.city]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping existing venue: ${venue.name}`);
          skippedCount++;
          continue;
        }

        // 새 venue 추가
        await client.query(`
          INSERT INTO venues (
            name, name_en, city, district, country, type, tier, 
            website, address, instagram, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
        `, [
          venue.name,
          venue.name_en || venue.name,
          venue.city,
          venue.district || null,
          venue.country,
          venue.type,
          venue.tier,
          venue.website || null,
          venue.address || null,
          venue.instagram || null
        ]);

        console.log(`✅ Added: ${venue.name} (${venue.city})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${venue.name}:`, error.message);
        errorCount++;
      }
    }

    // 통계 출력
    console.log('\n📊 Seeding Summary:');
    console.log(`   Total venues processed: ${expandedVenues.length}`);
    console.log(`   ✅ Successfully added: ${addedCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // 전체 venue 통계
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'museum' THEN 1 END) as museums,
        COUNT(CASE WHEN type = 'gallery' THEN 1 END) as galleries,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN tier = 1 THEN 1 END) as tier1,
        COUNT(CASE WHEN tier = 2 THEN 1 END) as tier2,
        COUNT(CASE WHEN tier = 3 THEN 1 END) as tier3
      FROM venues
    `);

    const cityStats = await client.query(`
      SELECT city, COUNT(*) as count
      FROM venues
      WHERE country = 'KR'
      GROUP BY city
      ORDER BY count DESC
      LIMIT 15
    `);

    console.log('\n📈 Total Venue Statistics:');
    console.log(`   Total venues: ${stats.rows[0].total}`);
    console.log(`   Museums: ${stats.rows[0].museums}`);
    console.log(`   Galleries: ${stats.rows[0].galleries}`);
    console.log(`   Korean venues: ${stats.rows[0].korean}`);
    console.log(`   Tier 1: ${stats.rows[0].tier1}`);
    console.log(`   Tier 2: ${stats.rows[0].tier2}`);
    console.log(`   Tier 3: ${stats.rows[0].tier3}`);

    console.log('\n🏙️  Top Cities:');
    cityStats.rows.forEach(city => {
      console.log(`   ${city.city}: ${city.count} venues`);
    });

    console.log('\n🎉 Expanded venue seeding completed!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  try {
    await seedExpandedVenues();
  } catch (error) {
    console.error('Main error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { expandedVenues, seedExpandedVenues };