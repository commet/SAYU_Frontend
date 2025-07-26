const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const exhibitions = [
  {
    "title_ko": "MMCA 다원예술 2025: 숲",
    "title_en": "MMCA Performing Arts 2025: Forest",
    "start_date": "2025-05-23",
    "end_date": "2026-01-16",
    "venue_name": "국립현대미술관 서울관",
    "venue_name_en": "National Museum of Modern and Contemporary Art, Seoul",
    "address": "서울특별시 종로구 삼청로 30",
    "opening_hours": "월, 화, 목, 금, 일 10:00-18:00 / 수, 토 10:00-21:00 / ※1월 1일, 설날, 추석 당일 휴관",
    "admission": "개별 프로그램 별 상이",
    "contact": "02-3701-9500",
    "website": "http://www.mmca.go.kr/",
    "category": "다원예술",
    "closed_days": "1월 1일, 설날, 추석 당일"
  },
  {
    "title_ko": "[공평도시유적전시관] 서울YMCA, 청년이 만든 시민의 역사",
    "title_en": "Seoul YMCA: The History of Citizens Created by Youth",
    "start_date": "2025-07-18",
    "end_date": "2026-02-08",
    "venue_name": "서울역사박물관 공평도시유적전시관",
    "venue_name_en": "Seoul Museum of History - Gongpyeong Historic Site",
    "address": "서울특별시 종로구 새문안로 55",
    "opening_hours": "09:00 - 18:00 (입장마감 17:30)",
    "admission": "무료",
    "contact": "02-724-0135",
    "website": "http://www.museum.seoul.kr/",
    "category": "역사"
  },
  {
    "title_ko": "마음_봄",
    "title_en": "Mind_Spring",
    "start_date": "2025-05-02",
    "end_date": "2026-02-27",
    "venue_name": "국립현대미술관 서울관",
    "venue_name_en": "National Museum of Modern and Contemporary Art, Seoul",
    "address": "서울특별시 종로구 삼청로 30",
    "opening_hours": "월, 화, 목, 금, 일 10:00-18:00 / 수, 토 10:00-21:00 / ※1월 1일, 설날, 추석 당일 휴관",
    "admission": "무료",
    "contact": "02-3701-9500",
    "website": "http://www.mmca.go.kr/",
    "category": "현대미술"
  },
  {
    "title_ko": "[도봉문화재단] 둘리뮤지엄 특별전 [K-라면과 구공탄]",
    "title_en": "Dooly Museum Special Exhibition: K-Ramen and Coal Briquettes",
    "start_date": "2025-05-20",
    "end_date": "2026-03-18",
    "venue_name": "둘리뮤지엄",
    "venue_name_en": "Dooly Museum",
    "address": "서울특별시 도봉구 시루봉로1길 6",
    "opening_hours": "화-일 10:00-18:00 / 월요일 휴관",
    "admission": "개인(24개월 이상~만65세 미만): 주중 4,000원 / 주말 및 공휴일 5,000원",
    "contact": "02-990-2200",
    "website": "http://www.doolymuseum.or.kr/",
    "category": "특별전",
    "closed_days": "월요일"
  },
  {
    "title_ko": "박노해 사진전 <산빛>",
    "title_en": "Park Nohae Photo Exhibition: Mountain Light",
    "start_date": "2025-07-04",
    "end_date": "2026-03-29",
    "venue_name": "라 카페 갤러리",
    "venue_name_en": "La Cafe Gallery",
    "address": "서울특별시 종로구 자하문로10길 28",
    "opening_hours": "화요일-목요일 11:00-18:00 / 금요일-일요일 11:00-21:00 / 매주 월요일 휴관",
    "admission": "무료",
    "contact": "02-379-1975",
    "website": "https://brunch.co.kr/@magazine-letter/10",
    "category": "사진전",
    "closed_days": "월요일"
  },
  {
    "title_ko": "MMCA 서울 상설전 《한국현대미술 하이라이트》",
    "title_en": "MMCA Seoul Permanent Exhibition: Korean Contemporary Art Highlights",
    "start_date": "2025-05-01",
    "end_date": "2026-05-03",
    "venue_name": "국립현대미술관 서울관",
    "venue_name_en": "National Museum of Modern and Contemporary Art, Seoul",
    "address": "서울특별시 종로구 삼청로 30",
    "opening_hours": "월, 화, 목, 금, 일 10:00-18:00 / 수, 토 10:00-21:00 / ※1월 1일, 설날, 추석 당일 휴관",
    "admission": "2,000원",
    "contact": "02-3701-9500",
    "website": "http://www.mmca.go.kr/",
    "category": "상설전"
  },
  {
    "title_ko": "《크리스찬 히다카: 하늘이 극장이 되고, 극장이 하늘에 있으니》",
    "title_en": "Christian Hidaka: Skies of the Theatre",
    "start_date": "2025-06-05",
    "end_date": "2026-05-10",
    "venue_name": "서울시립미술관 북서울미술관",
    "venue_name_en": "Seoul Museum of Art - Buk Seoul Museum of Art",
    "address": "서울특별시 노원구 동일로 1238",
    "opening_hours": "3월-10월 10:00-19:00 / 11월-2월 10:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "contact": "02-2124-5248, 9",
    "website": "https://sema.seoul.go.kr",
    "category": "전시",
    "closed_days": "월요일"
  },
  {
    "title_ko": "[서울식물원] 2025년 서울식물원 기획 전시 [우리들의 자연, 행성적 공존]",
    "title_en": "Seoul Botanic Park 2025 Special Exhibition: Our Nature, Planetary Coexistence",
    "start_date": "2025-05-27",
    "end_date": "2026-05-24",
    "venue_name": "서울식물원",
    "venue_name_en": "Seoul Botanic Park",
    "address": "서울특별시 강서구 마곡동로 161",
    "opening_hours": "3-10월 09:30-18:00(17:00 입장 마감) / 11-2월 09:30-17:00(16:00 입장 마감)",
    "admission": "입장료 성인 5,000원 / 청소년 3,000원 / 어린이 2,000원",
    "contact": "02-2104-9716",
    "website": "http://botanicpark.seoul.go.kr/",
    "category": "기획전시"
  },
  {
    "title_ko": "2025년 서울우리소리박물관 기획전 '한강, 소리로 흐르다'",
    "title_en": "2025 Seoul Museum of Traditional Music Special Exhibition: Hangang, Flowing with Folk Songs and Stories",
    "start_date": "2025-06-19",
    "end_date": "2026-05-28",
    "venue_name": "서울우리소리박물관",
    "venue_name_en": "Seoul Museum of Traditional Music",
    "address": "서울특별시 종로구 율곡로 96 1층",
    "opening_hours": "화-일 09:00-18:00 / 월요일 휴관",
    "admission": "무료",
    "contact": "02-742-2600",
    "website": "https://museum.seoul.go.kr/sekm/front/main.do",
    "category": "기획전",
    "closed_days": "월요일"
  },
  {
    "title_ko": "권기수 | Across The Universe",
    "title_en": "Kwon Kisoo | Across The Universe",
    "start_date": "2025-05-01",
    "end_date": "2026-05-31",
    "venue_name": "갤러리JJ",
    "venue_name_en": "Gallery JJ",
    "address": "서울특별시 강남구 압구정로30길 63",
    "opening_hours": "11:00-19:00",
    "admission": "무료",
    "contact": "02-322-3979",
    "website": "http://www.galleryjj.org",
    "category": "전시"
  },
  {
    "title_ko": "《생이 깃든 소나무》",
    "title_en": "Pine Tree with Life",
    "start_date": "2025-02-26",
    "end_date": "2026-06-30",
    "venue_name": "성북구립미술관",
    "venue_name_en": "Seongbuk Museum of Art",
    "address": "서울특별시 성북구 성북로 134",
    "opening_hours": "[기간 내 상시 운영]",
    "admission": "무료",
    "contact": "02-6925-5011",
    "website": "http://sma.sbculture.or.kr/",
    "category": "전시"
  },
  {
    "title_ko": "기록으로 산책하기_서울의 공원",
    "title_en": "Strolling through the Records: Seoul's Parks",
    "start_date": "2023-12-01",
    "end_date": "2026-09-29",
    "venue_name": "서울문화재단 본관",
    "venue_name_en": "Seoul Foundation for Arts and Culture",
    "address": "서울특별시 동대문구 청계천로 517",
    "opening_hours": "화요일-일요일 10:00-17:00, ※ 월요일, 1월 1일, 설날, 추석 당일 휴관(월요일이 휴일인 경우 정상개관)",
    "admission": "무료",
    "contact": "02-350-5600, 02-350-5605",
    "website": "http://www.sfac.or.kr/",
    "category": "전시",
    "closed_days": "월요일, 1월 1일, 설날, 추석 당일"
  },
  {
    "title_ko": "국립중앙박물관 기중관 재개관",
    "title_en": "National Museum of Korea Donated Collection Gallery Reopening",
    "start_date": "2024-01-12",
    "end_date": "2026-12-31",
    "venue_name": "국립중앙박물관",
    "venue_name_en": "National Museum of Korea",
    "address": "서울특별시 용산구 서빙고로 137",
    "opening_hours": "월, 화, 목, 금, 일 10:00-18:00 / 수, 토 10:00-21:00",
    "admission": "무료",
    "contact": "02-2077-9000",
    "website": "http://www.museum.go.kr",
    "category": "재개관"
  },
  {
    "title_ko": "선유담답 : 선유도의 시간 속 풍경을 담다",
    "title_en": "Seonyudam-dam: Time and Landscape of Seonyudo",
    "start_date": "2025-04-23",
    "end_date": "2027-04-22",
    "venue_name": "여의도 한강공원",
    "venue_name_en": "Yeouido Hangang Park",
    "address": "서울특별시 영등포구 여의도로 330",
    "opening_hours": "매일 06:00-24:00",
    "admission": "무료",
    "contact": "02-323-4505",
    "website": "http://hangang.seoul.go.kr/archives/3167",
    "category": "전시"
  },
  {
    "title_ko": "그리스가 로마에게, 로마가 그리스에게",
    "title_en": "Greece to Rome, Rome to Greece",
    "start_date": "2023-06-15",
    "end_date": "2027-05-30",
    "venue_name": "국립중앙박물관 대강당",
    "venue_name_en": "National Museum of Korea Main Hall",
    "address": "서울특별시 용산구 서빙고로 137",
    "opening_hours": "월, 화, 목, 금, 일요일 10:00-18:00 수, 토요일 10:00-21:00",
    "admission": "무료",
    "contact": "02-2077-9000",
    "website": "http://www.museum.go.kr",
    "category": "상설전"
  },
  {
    "title_ko": "[상설] 외규장각 의궤실 공개",
    "title_en": "Permanent Exhibition: Oegyujanggak Uigwe Gallery Opening",
    "start_date": "2024-11-15",
    "end_date": "2027-12-31",
    "venue_name": "국립중앙박물관",
    "venue_name_en": "National Museum of Korea",
    "address": "서울특별시 용산구 서빙고로 137",
    "opening_hours": "월, 화, 목, 금, 일 10:00-18:00 / 수, 토 10:00-21:00 / ※1월 1일, 설날, 추석 당일 휴관",
    "admission": "무료",
    "contact": "02-2077-9000",
    "website": "http://www.museum.go.kr",
    "category": "상설전"
  },
  {
    "title_ko": "어린이박물관 새단장 <쓸기 딸기 닦기 문화유산 속 마음>",
    "title_en": "Children's Museum Renewal: Sweeping Strawberry Cleaning, Hearts in Cultural Heritage",
    "start_date": "2024-11-19",
    "end_date": "2027-12-31",
    "venue_name": "국립중앙박물관 어린이박물관",
    "venue_name_en": "National Museum of Korea Children's Museum",
    "address": "서울특별시 용산구 서빙고로 137",
    "opening_hours": "10:00-17:50 / 하루 총 5회 관람",
    "admission": "무료",
    "contact": "02-2077-9000",
    "website": "https://www.museum.go.kr/site/child/home",
    "category": "어린이박물관"
  },
  {
    "title_ko": "[온라인 특별전] 막걸리, 거친 일상의 벗",
    "title_en": "Online Special Exhibition: Makgeolli, A Companion in the Bittersweet Life",
    "start_date": "2019-12-24",
    "end_date": "2099-12-31",
    "venue_name": "국립민속박물관",
    "venue_name_en": "National Folk Museum of Korea",
    "address": "서울특별시 종로구 삼청로 37",
    "opening_hours": "자유관람",
    "admission": "무료",
    "contact": "02-3704-3114",
    "website": "http://www.nfm.go.kr/",
    "category": "온라인 특별전",
    "note": "온라인"
  }
];

async function addExhibitions() {
  const client = await pool.connect();
  
  try {
    let successCount = 0;
    let errorCount = 0;

    for (const exhibition of exhibitions) {
      try {
        // title 정리
        const cleanedTitle = exhibition.title_ko
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
          const venueInsert = await client.query(
            `INSERT INTO venues (name, address, latitude, longitude, website)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
              exhibition.venue_name,
              exhibition.address || null,
              37.566535,
              126.9779692,
              exhibition.website || null
            ]
          );
          venueId = venueInsert.rows[0].id;
          console.log(`새 장소 추가: ${exhibition.venue_name}`);
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
            exhibition.title_en || cleanedTitle,
            venueId,
            exhibition.venue_name,
            '서울',
            'KR',
            exhibition.start_date,
            exhibition.end_date || exhibition.start_date,
            `${exhibition.opening_hours || '정보 없음'}${exhibition.closed_days ? `\n휴관일: ${exhibition.closed_days}` : ''}`,
            null,
            exhibition.category || '전시',
            exhibition.admission || '정보 없음',
            exhibition.website || null,
            'culture_portal',
            null,
            'current'
          ]
        );

        console.log(`✓ 추가 완료: ${cleanedTitle}`);
        successCount++;

      } catch (error) {
        console.error(`오류 발생 (${exhibition.title_ko}):`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== 완료 ===`);
    console.log(`성공: ${successCount}개`);
    console.log(`오류: ${errorCount}개`);

  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addExhibitions().catch(console.error);