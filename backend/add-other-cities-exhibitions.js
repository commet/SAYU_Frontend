const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const exhibitions = [
  {
    "title_korean": "유리상자 아트스타 II 류은미",
    "title_english": "RYU EUN MI",
    "start_date": "2025-04-25",
    "end_date": "2025-07-27",
    "venue_name": "봉산문화회관",
    "venue_city": "대구",
    "address": "대구광역시 중구 봉산문화길 77 봉산문화회관",
    "contact": "053-422-6200",
    "hours": "10:00 ~ 19:00",
    "admission": "무료",
    "website": "http://www.bongsanart.org/"
  },
  {
    "title_korean": "ICH, ME, NA",
    "title_english": "ICH, ME, NA",
    "start_date": "2025-07-15",
    "end_date": "2025-07-27",
    "venue_name": "갤러리제이원",
    "venue_city": "대구",
    "address": "대구광역시 중구 봉산문화길 60",
    "contact": "053-252-0614",
    "admission": "무료",
    "website": "http://www.galleryjone.com"
  },
  {
    "title_korean": "특별전시 '우당탕탕 운동회'",
    "title_english": null,
    "start_date": "2025-05-01",
    "end_date": "2025-07-31",
    "venue_name": "대구교육박물관",
    "venue_city": "대구",
    "address": "대구광역시 북구 대동로1길 40 대구교육박물관",
    "contact": "053-231-1752",
    "hours": "09:30 ~ 18:00",
    "admission": "무료",
    "website": "https://www.dge.go.kr/dme/main.do"
  },
  {
    "title_korean": "《션 스컬리: 수평과 수직》",
    "title_english": "SEAN SCULLY",
    "start_date": "2025-03-18",
    "end_date": "2025-08-17",
    "venue_name": "대구미술관",
    "venue_city": "대구",
    "address": "대구광역시 수성구 미술관로 40 대구미술관",
    "contact": "053-430-7500",
    "hours": "4월 10월 10:00-19:00 / 11월 3월 10:00-18:00 / 월요일 휴관",
    "admission": "특별전 5,000원",
    "website": "https://daeguartmuseum.or.kr/"
  },
  {
    "title_korean": "Void and Vibration",
    "title_english": "Void and Vibration",
    "start_date": "2025-06-12",
    "end_date": "2025-08-23",
    "venue_name": "021갤러리",
    "venue_city": "대구",
    "address": "대구광역시 수성구 달구벌대로 2435",
    "contact": "053-743-0217",
    "admission": "무료",
    "website": "http://021gallery.com/"
  },
  {
    "title_korean": "萬世不朽万歳不朽 - 돌에 새긴 영원",
    "title_english": null,
    "start_date": "2025-06-17",
    "end_date": "2025-08-31",
    "venue_name": "국립대구박물관",
    "venue_city": "대구",
    "address": "대구광역시 수성구 청호로 321 국립대구박물관",
    "contact": "053-760-8051",
    "hours": "화-일 09:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "website": "https://daegu.museum.go.kr/"
  },
  {
    "title_korean": "2025 레지던시 교류전 NOWHERE(Nowhere, Now here)-어디에도 없지만, 지금 이곳",
    "title_english": "NOWHERE (Nowhere, Now here)",
    "start_date": "2025-07-04",
    "end_date": "2025-08-31",
    "venue_name": "대구예술발전소",
    "venue_city": "대구",
    "address": "대구광역시 중구 달성로22길 31-12 대구예술발전소",
    "contact": "053-430-1289",
    "hours": "10:00-19:00(일찰마감18:30)",
    "admission": "성인 1,000원 / 어린이, 청소년, 군인 500원",
    "website": null
  },
  {
    "title_korean": "2025 다티스트 《장용근의 꿈터: 가장자리의 기둥》",
    "title_english": null,
    "start_date": "2025-07-15",
    "end_date": "2025-10-12",
    "venue_name": "대구미술관",
    "venue_city": "대구",
    "address": "대구광역시 수성구 미술관로 40 대구미술관",
    "contact": "053-803-7900",
    "hours": "화-일 10:00-19:00 / 월요일 휴관",
    "admission": "성인 1,000원 / 소년, 청년, 대학생, 군인 700원",
    "website": "https://daeguartmuseum.or.kr/"
  },
  {
    "title_korean": "계속 변화한다. 모든 것은 연결된다. 영원히 계속된다.",
    "title_english": "KEEP CHANGING, CONNECT EVERYTHING, CONTINUE FOREVER",
    "start_date": "2025-01-14",
    "end_date": "2026-01-25",
    "venue_name": "대구미술관",
    "venue_city": "대구",
    "address": "대구광역시 수성구 미술관로 40 대구미술관",
    "contact": "053-430-7500",
    "hours": "4월-10월 10:00-19:00 / 11월-3월 10:00-18:00 / 월요일 휴관",
    "admission": "성인 1,000원 / 소년, 청년, 대학생, 군인 700원",
    "website": "https://daeguartmuseum.or.kr/"
  },
  {
    "title_korean": "대구 근대 회화의 흐름",
    "title_english": "THE WAVE OF MODERN PAINTING IN DAEGU",
    "start_date": "2025-01-14",
    "end_date": "2028-02-29",
    "venue_name": "대구미술관",
    "venue_city": "대구",
    "address": "대구광역시 수성구 미술관로 40 대구미술관",
    "contact": "053-430-7500",
    "hours": "4월-10월 10:00-19:00 / 11월-3월 10:00-18:00 / 월요일 휴관",
    "admission": "성인 1,000원 / 소년, 청년, 대학생, 군인 700원",
    "website": "https://daeguartmuseum.or.kr/"
  },
  {
    "title_korean": "인천서구문화회관 재개관 기념 프로그램 <새로운 시작> 전",
    "title_english": null,
    "start_date": "2025-07-18",
    "end_date": "2025-07-27",
    "venue_name": "인천서구문화회관 아트갤러리",
    "venue_city": "인천",
    "address": "인천광역시 서구 서달로 190 서구문화회관",
    "contact": "032-510-6044",
    "hours": "10:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "website": "http://iscf.kr/new/html/centerIntro/schedule_view.php?idx=22"
  },
  {
    "title_korean": "피보탈 모먼트 : 예술의 정점에 서다",
    "title_english": "Pivotal Moment",
    "start_date": "2025-03-17",
    "end_date": "2025-07-31",
    "venue_name": "파라다이스시티",
    "venue_city": "인천",
    "address": "인천광역시 중구 영종해안남로321번길 186 파라다이스시티",
    "contact": "032-729-5116",
    "hours": "10:00 ~ 20:00",
    "admission": "성인: 25,000원 청소년: 22,000원 어린이: 20,000원",
    "website": "https://www.p-city.com/front/culturePark/overview?language=KO"
  },
  {
    "title_korean": "2025 기획특별전 <우리 박물관의 기구한 손님들>",
    "title_english": null,
    "start_date": "2025-06-10",
    "end_date": "2025-08-10",
    "venue_name": "인천광역시립박물관",
    "venue_city": "인천",
    "address": "인천광역시 연수구 청량로160번길 26 인천광역시립박물관",
    "contact": "032-440-6750",
    "hours": "09:00-18:00",
    "admission": "무료",
    "website": "https://www.incheon.go.kr/museum/index"
  },
  {
    "title_korean": "상상해, 귀스타브 도레가 만든 세계",
    "title_english": "Imagine",
    "start_date": "2025-05-02",
    "end_date": "2025-08-17",
    "venue_name": "국립세계문자박물관",
    "venue_city": "인천",
    "address": "인천 연수구 센트럴로 217 국립세계문자박물관",
    "contact": "032-290-2029",
    "hours": "화-일 10:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "website": "https://www.mow.or.kr/kor/"
  },
  {
    "title_korean": "광복 80주년 기념 2025년도 인천도시역사관 작가전 '되찾은 조국에서 Smile again'",
    "title_english": null,
    "start_date": "2025-06-17",
    "end_date": "2025-08-24",
    "venue_name": "인천도시역사관",
    "venue_city": "인천",
    "address": "인천광역시 연수구 인천타워대로 238 인천도시역사관",
    "contact": "032-850-6000",
    "hours": "09:00-18:00",
    "admission": "무료",
    "website": "https://www.incheon.go.kr/museum/MU050102"
  },
  {
    "title_korean": "동구문화체육센터 레플리카전 <거장의 팔레트 빛을 만나다>",
    "title_english": "Replica Exhibition",
    "start_date": "2025-06-10",
    "end_date": "2025-09-01",
    "venue_name": "인천동구문화체육센터",
    "venue_city": "인천",
    "address": "인천광역시 동구 솔빛로 82 인천동구청소년수련관",
    "contact": "032-772-7700",
    "hours": "월-토 09:00 ~ 18:00 *일요일 및 공휴일 휴관",
    "admission": "무료",
    "website": "https://cscenter.icdonggu.go.kr/"
  },
  {
    "title_korean": "강화자연사박물관 2025년 기획전시 『플라스틱 지구 : 해양쓰레기』",
    "title_english": null,
    "start_date": "2025-03-18",
    "end_date": "2025-09-14",
    "venue_name": "강화자연사박물관",
    "venue_city": "인천",
    "address": "인천광역시 강화군 하점면 강화대로 994-33 강화자연사박물관",
    "contact": "032-930-7090",
    "hours": "09:00 ~ 18:00",
    "admission": "어른 3,000원 | 어린이/청소년/군인 2,000원 | 유아/노인 무료",
    "website": "http://www.ganghwa.go.kr/open_content/museum_natural/"
  },
  {
    "title_korean": "트라이보울 기획전시 <인천 청년 작가전 2025-깨어 있는 자들의 꿈>",
    "title_english": "The Dream of The Awake",
    "start_date": "2025-07-05",
    "end_date": "2025-09-27",
    "venue_name": "트라이보울",
    "venue_city": "인천",
    "address": "인천광역시 연수구 인천타워대로 250 트라이보울",
    "contact": "032-832-7996",
    "hours": "화요일-일요일 12:00-17:30 (입장 마감 17:10, 매주 월요일 휴관)",
    "admission": "무료",
    "website": "http://www.tribowl.kr/"
  },
  {
    "title_korean": "상설 인천전시실 <인천의 근대문화를 읽는다>",
    "title_english": null,
    "start_date": "2023-09-27",
    "end_date": "2025-12-31",
    "venue_name": "한국근대문학관",
    "venue_city": "인천",
    "address": "인천광역시 중구 신포로15번길 76 한국근대문학관",
    "contact": "032-773-3801",
    "hours": "화-일 10:00-18:00, 월요일 휴관",
    "admission": "무료",
    "website": "http://lit.ifac.or.kr/index.php"
  },
  {
    "title_korean": "시골 쥐의 도시 여행",
    "title_english": null,
    "start_date": "2023-10-23",
    "end_date": "2025-12-31",
    "venue_name": "인천도시역사관",
    "venue_city": "인천",
    "address": "인천광역시 연수구 인천타워대로 238 인천도시역사관",
    "contact": "032-850-6000",
    "hours": "화-일 09:00-18:00, 월요일 휴관",
    "admission": "무료",
    "website": "https://www.incheon.go.kr/museum/MU050102"
  },
  {
    "title_korean": "2024 테마전 \"신진자동차 트리오\"",
    "title_english": null,
    "start_date": "2024-09-13",
    "end_date": "2025-12-31",
    "venue_name": "인천도시역사관",
    "venue_city": "인천",
    "address": "인천광역시 연수구 인천타워대로 238 인천도시역사관",
    "contact": "032-850-6031",
    "hours": "화-일 09:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "website": "https://www.incheon.go.kr/museum/MU050102"
  },
  {
    "title_korean": "2024 인천개항박물관 특별기획전 <경계와 경계>",
    "title_english": null,
    "start_date": "2024-11-27",
    "end_date": "2025-12-31",
    "venue_name": "인천개항박물관",
    "venue_city": "인천",
    "address": "인천광역시 중구 신포로23번길 77 인천개항박물관",
    "contact": "032-760-7549",
    "hours": "09:00-17:30",
    "admission": "500원",
    "website": "http://www.icjgss.or.kr/architecture/index.asp"
  },
  {
    "title_korean": "[검단선사박물관] 구석구석, 유물이의 세상 나들이 展",
    "title_english": null,
    "start_date": "2025-07-01",
    "end_date": "2026-05-10",
    "venue_name": "인천검단선사박물관",
    "venue_city": "인천",
    "address": "인천광역시 서구 고산후로12번길 7 검단선사박물관",
    "contact": "032-440-6790",
    "hours": "09:00 ~ 18:00 *매주 월요일(공휴일인 월요일은 제외), 1월 1일 휴관",
    "admission": "무료",
    "website": "https://www.incheon.go.kr/museum/MU030101"
  },
  {
    "title_korean": "이경욱 개인전 '자연별곡'",
    "title_english": null,
    "start_date": "2025-07-15",
    "end_date": "2025-07-27",
    "venue_name": "남도향토음식박물관",
    "venue_city": "광주",
    "address": "광주광역시 북구 설죽로 477 남도향토음식박물관",
    "contact": "062-574-0756",
    "hours": "화요일-일요일 : 09:00 ~ 18:00, 매주 월요일 휴관",
    "admission": "무료",
    "website": "http://bukgu.gwangju.kr/namdofood/"
  },
  {
    "title_korean": "공원 속 작은 전람회 「별밤미술관」 6-7월 작가초대전",
    "title_english": null,
    "start_date": "2025-06-03",
    "end_date": "2025-07-28",
    "venue_name": "별밤미술관 in 참다",
    "venue_city": "광주",
    "address": "광주광역시 광산구 첨단중앙로182번길 23 별밤미술관 in 참다",
    "contact": "062-960-3688",
    "hours": "18:00-24:00",
    "admission": "무료",
    "website": "https://naver.me/SwfNqSJZ"
  },
  {
    "title_korean": "2025 광주대구청년미술 작가회 「달-빛 교류展」",
    "title_english": null,
    "start_date": "2025-07-22",
    "end_date": "2025-07-30",
    "venue_name": "송정작은미술관",
    "venue_city": "광주",
    "address": "광주광역시 광산구 송정로30번길 25 송정작은미술관",
    "contact": "062-960-3686",
    "hours": "10:00 ~ 18:00 (매주 월요일 휴관)",
    "admission": "무료",
    "website": "https://naver.me/Gz5maAdy"
  },
  {
    "title_korean": "2025 어린이갤러리 기획전시 《디자인 스페이스 유니버스》",
    "title_english": "Design Space Universe",
    "start_date": "2025-06-27",
    "end_date": "2026-03-01",
    "venue_name": "광주시립미술관",
    "venue_city": "광주",
    "address": "광주광역시 북구 하서로 52 광주시립미술관",
    "contact": "062-713-7100",
    "hours": "평일, 주말, 공휴일: 10:00 ~ 18:00 , 1월 1일, 설(당일), 추석(당일), 매주 월요일 휴관",
    "admission": "무료",
    "website": "http://artmuse.gwangju.go.kr/"
  },
  {
    "title_korean": "증인: 국경을 넘어(Witness: Beyond Borders)",
    "title_english": "Witness: Beyond Borders",
    "start_date": "2025-05-02",
    "end_date": "2026-03-31",
    "venue_name": "전일빌딩245",
    "venue_city": "광주",
    "address": "광주광역시 동구 금남로 245 (금남로1가) 전일빌딩",
    "contact": "062-613-8204",
    "hours": "10:00-19:00",
    "admission": "무료",
    "website": null
  }
];

async function addOtherCitiesExhibitions() {
  const client = await pool.connect();
  
  try {
    let successCount = 0;
    let errorCount = 0;

    // 도시별 좌표 정보
    const cityCoordinates = {
      '대구': { latitude: 35.8714354, longitude: 128.601445 },
      '인천': { latitude: 37.4562557, longitude: 126.7052062 },
      '광주': { latitude: 35.1595454, longitude: 126.8526012 }
    };

    for (const exhibition of exhibitions) {
      try {
        // title 정리
        const cleanedTitle = exhibition.title_korean
          .replace(/[\[\]]/g, '')
          .replace(/《|》/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [cleanedTitle, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length > 0) {
          console.log(`이미 존재: ${cleanedTitle}`);
          continue;
        }

        // 장소 처리
        let venueId = null;
        const venueCheck = await client.query(
          'SELECT id FROM venues WHERE name = $1',
          [exhibition.venue_name]
        );

        if (venueCheck.rows.length > 0) {
          venueId = venueCheck.rows[0].id;
        } else {
          const coords = cityCoordinates[exhibition.venue_city] || { latitude: 37.566535, longitude: 126.9779692 };
          
          const venueInsert = await client.query(
            `INSERT INTO venues (name, address, latitude, longitude, website)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
              exhibition.venue_name,
              exhibition.address || null,
              coords.latitude,
              coords.longitude,
              exhibition.website || null
            ]
          );
          venueId = venueInsert.rows[0].id;
          console.log(`새 장소 추가: ${exhibition.venue_name} (${exhibition.venue_city})`);
        }

        // 전시 정보 구성
        let description = exhibition.hours || '정보 없음';
        if (exhibition.contact) {
          description += `\n연락처: ${exhibition.contact}`;
        }

        // 전시 추가
        await client.query(
          `INSERT INTO exhibitions (
            title_local, title_en, venue_id, venue_name, venue_city, venue_country,
            start_date, end_date, description, artists, exhibition_type, 
            admission_fee, official_url, source, source_url, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )`,
          [
            cleanedTitle,
            exhibition.title_english || cleanedTitle,
            venueId,
            exhibition.venue_name,
            exhibition.venue_city,
            'KR',
            exhibition.start_date,
            exhibition.end_date || exhibition.start_date,
            description,
            null,
            '전시',
            exhibition.admission || '정보 없음',
            exhibition.website || null,
            'culture_portal',
            null,
            'current'
          ]
        );

        console.log(`✓ 추가 완료: ${cleanedTitle} (${exhibition.venue_city})`);
        successCount++;

      } catch (error) {
        console.error(`오류 발생 (${exhibition.title_korean}):`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== 완료 ===`);
    console.log(`총 ${exhibitions.length}개 전시 중:`);
    console.log(`성공: ${successCount}개`);
    console.log(`오류: ${errorCount}개`);

    // 도시별 통계
    const daeguCount = exhibitions.filter(e => e.venue_city === '대구').length;
    const incheonCount = exhibitions.filter(e => e.venue_city === '인천').length;
    const gwangjuCount = exhibitions.filter(e => e.venue_city === '광주').length;
    
    console.log(`\n=== 도시별 통계 ===`);
    console.log(`대구: ${daeguCount}개`);
    console.log(`인천: ${incheonCount}개`);
    console.log(`광주: ${gwangjuCount}개`);

  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addOtherCitiesExhibitions().catch(console.error);