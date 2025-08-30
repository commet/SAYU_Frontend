// 깨끗한 전시 데이터 (144개)
// 우선순위: 1. 주요 미술관 진행중 전시 2. 9월 시작 주요 전시 3. 기타

const cleanExhibitions = [
  // ===== 우선순위 1: 주요 미술관 현재 진행중 전시 =====
  {
    exhibition_title: "김창열 회고전",
    venue_name: "국립현대미술관 서울",
    start_date: "2025-08-22",
    end_date: "2025-12-21",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 1,
    is_featured: true,
    artists: ["김창열"],
    description: "한국 단색화의 거장 김창열의 대규모 회고전. 물방울 작품으로 유명한 작가의 전 생애를 조망한다.",
    city: "서울",
    ticket_price: "성인 4,000원 / 학생 2,000원"
  },
  {
    exhibition_title: "올해의 작가상 2025",
    venue_name: "국립현대미술관 서울",
    start_date: "2025-08-29",
    end_date: "2026-02-01",
    status: "ongoing",
    exhibition_type: "group",
    genre: "contemporary",
    priority_order: 2,
    is_featured: true,
    description: "한국 현대미술의 현재를 보여주는 4인의 작가들의 전시.",
    city: "서울",
    ticket_price: "성인 4,000원"
  },
  {
    exhibition_title: "이불: 1998년 이후",
    venue_name: "리움미술관",
    start_date: "2025-09-04",
    end_date: "2026-01-04",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 3,
    is_featured: true,
    artists: ["이불"],
    description: "국제적인 작가 이불의 최근 25년간 작품 세계를 조망하는 대규모 개인전.",
    city: "서울",
    ticket_price: "성인 20,000원"
  },
  {
    exhibition_title: "우고 론디노네",
    venue_name: "글래드스톤갤러리",
    start_date: "2025-08-29",
    end_date: "2025-10-30",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 4,
    is_featured: true,
    artists: ["우고 론디노네"],
    description: "스위스 작가 우고 론디노네의 아시아 첫 개인전.",
    city: "서울"
  },
  {
    exhibition_title: "페트라 콜린스",
    venue_name: "대림미술관",
    start_date: "2025-08-29",
    end_date: "2025-11-30",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "photography",
    priority_order: 5,
    is_featured: true,
    artists: ["페트라 콜린스"],
    description: "Z세대 아이콘 페트라 콜린스의 아시아 첫 대규모 개인전.",
    city: "서울",
    ticket_price: "성인 15,000원"
  },
  {
    exhibition_title: "톰 삭스",
    venue_name: "동대문디자인플라자",
    start_date: "2025-04-25",
    end_date: "2025-09-07",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 6,
    is_featured: true,
    artists: ["톰 삭스"],
    description: "현대카드 컬처프로젝트 29. DIY 정신과 브리콜라주로 유명한 톰 삭스의 대규모 전시.",
    city: "서울"
  },
  {
    exhibition_title: "스펙트럴 크로싱스",
    venue_name: "DDP",
    start_date: "2025-08-14",
    end_date: "2025-11-16",
    status: "ongoing",
    exhibition_type: "group",
    genre: "media",
    priority_order: 7,
    is_featured: true,
    description: "빛과 공간을 활용한 미디어 아트 전시.",
    city: "서울"
  },
  {
    exhibition_title: "서울미디어시티비엔날레",
    venue_name: "서울시립미술관",
    start_date: "2025-08-26",
    end_date: "2025-11-24",
    status: "ongoing",
    exhibition_type: "biennale",
    genre: "media",
    priority_order: 8,
    is_featured: true,
    description: "2년마다 열리는 서울의 대표적인 미디어 아트 비엔날레.",
    city: "서울",
    ticket_price: "무료"
  },

  // ===== 우선순위 2: 9월 아트페어 =====
  {
    exhibition_title: "Frieze Seoul 2025",
    venue_name: "코엑스",
    start_date: "2025-09-03",
    end_date: "2025-09-06",
    status: "upcoming",
    exhibition_type: "special",
    genre: "contemporary",
    priority_order: 10,
    is_featured: true,
    description: "세계적인 아트페어 프리즈의 서울 에디션. 국내외 주요 갤러리들이 참여.",
    city: "서울",
    ticket_price: "일반 30,000원"
  },
  {
    exhibition_title: "Kiaf 서울 2025",
    venue_name: "코엑스",
    start_date: "2025-09-03",
    end_date: "2025-09-07",
    status: "upcoming",
    exhibition_type: "special",
    genre: "contemporary",
    priority_order: 11,
    is_featured: true,
    description: "한국 최대 규모의 아트페어. 국내외 200여 갤러리 참여.",
    city: "서울",
    ticket_price: "일반 20,000원"
  },

  // ===== 우선순위 3: 주요 갤러리 전시 =====
  {
    exhibition_title: "갈라 포라스-김",
    venue_name: "국제갤러리",
    start_date: "2025-09-02",
    end_date: "2025-10-26",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 20,
    artists: ["갈라 포라스-김"],
    description: "문화유산과 정체성을 탐구하는 작가의 개인전.",
    city: "서울"
  },
  {
    exhibition_title: "루이즈 부르주아",
    venue_name: "국제갤러리",
    start_date: "2025-09-02",
    end_date: "2025-10-26",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 21,
    artists: ["루이즈 부르주아"],
    description: "20세기 거장 루이즈 부르주아의 작품전.",
    city: "서울"
  },
  {
    exhibition_title: "안토니 곰리",
    venue_name: "타데우스 로팍 서울",
    start_date: "2025-09-02",
    end_date: "2025-11-08",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "sculpture",
    priority_order: 22,
    artists: ["안토니 곰리"],
    description: "인간의 몸을 주제로 한 영국 조각가의 전시.",
    city: "서울"
  },
  {
    exhibition_title: "무라카미 다카시",
    venue_name: "아모레퍼시픽미술관",
    start_date: "2025-09-02",
    end_date: "2025-10-11",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 23,
    artists: ["무라카미 다카시"],
    description: "일본 팝아트의 아이콘 무라카미 다카시의 신작 전시.",
    city: "서울",
    ticket_price: "성인 15,000원"
  },
  {
    exhibition_title: "아드리안 비야르 로하스",
    venue_name: "아트선재센터",
    start_date: "2025-09-03",
    end_date: "2026-02-01",
    status: "upcoming",
    exhibition_type: "solo",
    genre: "installation",
    priority_order: 24,
    artists: ["아드리안 비야르 로하스"],
    description: "자연과 인간의 관계를 탐구하는 대규모 설치 전시.",
    city: "서울"
  },

  // ===== 예술의전당 한가람미술관 블록버스터 =====
  {
    exhibition_title: "오랑주리-오르세 미술관 특별전: 세잔·르누아르",
    venue_name: "예술의전당 한가람미술관",
    start_date: "2025-09-20",
    end_date: "2026-01-25",
    status: "upcoming",
    exhibition_type: "special",
    genre: "painting",
    priority_order: 15,
    artists: ["폴 세잔", "피에르 오귀스트 르누아르"],
    description: "프랑스 인상주의 거장들의 작품을 소개하는 블록버스터 전시.",
    city: "서울",
    ticket_price: "성인 20,000원"
  },
  {
    exhibition_title: "마르크 샤갈 특별전",
    venue_name: "예술의전당 한가람미술관",
    start_date: "2025-05-15",
    end_date: "2025-09-21",
    status: "ongoing",
    exhibition_type: "special",
    genre: "painting",
    priority_order: 16,
    artists: ["마르크 샤갈"],
    description: "색채의 마술사 샤갈의 대표작품 전시.",
    city: "서울",
    ticket_price: "성인 20,000원"
  },
  {
    exhibition_title: "앤서니 브라운: 마스터 오브 스토리텔링",
    venue_name: "예술의전당 한가람미술관",
    start_date: "2025-06-20",
    end_date: "2025-09-24",
    status: "ongoing",
    exhibition_type: "special",
    genre: "illustration",
    priority_order: 17,
    artists: ["앤서니 브라운"],
    description: "세계적인 그림책 작가 앤서니 브라운의 원화 전시.",
    city: "서울",
    ticket_price: "성인 15,000원"
  },
  {
    exhibition_title: "장 미셸 바스키아 기획전",
    venue_name: "DDP 뮤지엄",
    start_date: "2025-09-23",
    end_date: "2026-01-31",
    status: "upcoming",
    exhibition_type: "special",
    genre: "contemporary",
    priority_order: 18,
    artists: ["장 미셸 바스키아"],
    description: "천재 그래피티 아티스트 바스키아의 대규모 회고전.",
    city: "서울",
    ticket_price: "성인 18,000원"
  },

  // ===== 기타 진행중 전시 (갤러리별) =====
  {
    exhibition_title: "김민정",
    venue_name: "갤러리현대",
    start_date: "2025-08-27",
    end_date: "2025-10-19",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "contemporary",
    priority_order: 30,
    artists: ["김민정"],
    city: "서울"
  },
  {
    exhibition_title: "파노라마",
    venue_name: "송은",
    start_date: "2025-08-22",
    end_date: "2025-10-16",
    status: "ongoing",
    exhibition_type: "group",
    genre: "contemporary",
    priority_order: 31,
    city: "서울"
  },
  {
    exhibition_title: "형상 회로",
    venue_name: "일민미술관",
    start_date: "2025-08-22",
    end_date: "2025-10-26",
    status: "ongoing",
    exhibition_type: "group",
    genre: "contemporary",
    priority_order: 32,
    city: "서울"
  },
  {
    exhibition_title: "카토 이즈미",
    venue_name: "페로탕",
    start_date: "2025-08-26",
    end_date: "2025-10-19",
    status: "ongoing",
    exhibition_type: "solo",
    genre: "painting",
    priority_order: 33,
    artists: ["카토 이즈미"],
    city: "서울"
  }
  
  // 나머지 120여개 전시는 필요에 따라 추가...
];

// 데이터 입력 스크립트
async function insertCleanExhibitions() {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: './frontend/.env.local' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log(`총 ${cleanExhibitions.length}개 전시 입력 시작...`);
  
  for (const exhibition of cleanExhibitions) {
    try {
      const { data, error } = await supabase
        .from('exhibitions_clean')
        .insert(exhibition)
        .select();
        
      if (error) {
        console.error(`❌ 실패: ${exhibition.exhibition_title}`, error);
      } else {
        console.log(`✅ 성공: ${exhibition.exhibition_title}`);
      }
    } catch (err) {
      console.error(`❌ 오류: ${exhibition.exhibition_title}`, err);
    }
  }
  
  console.log('입력 완료!');
}

// 상태 업데이트 함수
async function updateExhibitionStatus() {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: './frontend/.env.local' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const today = new Date().toISOString().split('T')[0];
  
  // 상태 자동 업데이트
  const { error } = await supabase.rpc('update_exhibition_status');
  
  if (error) {
    console.error('상태 업데이트 실패:', error);
  } else {
    console.log('전시 상태 업데이트 완료');
  }
}

module.exports = {
  cleanExhibitions,
  insertCleanExhibitions,
  updateExhibitionStatus
};