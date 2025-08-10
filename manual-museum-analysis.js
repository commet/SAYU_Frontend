// 한국 주요 미술관/갤러리 크롤링 적합성 수동 분석

const museumAnalysis = {
  "국공립 미술관": {
    "국립현대미술관 (MMCA)": {
      url: "https://www.mmca.go.kr",
      robotsTxt: "허용 (일부 제한)",
      structure: {
        exhibitionListPage: "/exhibitions/progressList.do",
        categories: ["현재전시", "예정전시", "과거전시"],
        jsRequired: true,
        dataFormat: "서버사이드 렌더링 + JavaScript"
      },
      dataQuality: {
        title: "한국어/영어 제공",
        dates: "정확한 기간 정보",
        artists: "상세 작가 정보",
        images: "고품질 이미지",
        description: "상세한 전시 설명"
      },
      crawlability: "중",
      score: 75,
      notes: "JavaScript 의존적이지만 구조화된 데이터"
    },
    
    "서울시립미술관": {
      url: "https://sema.seoul.go.kr",
      robotsTxt: "제한 없음",
      structure: {
        exhibitionListPage: "/kr/exhibition",
        categories: ["진행중", "예정", "종료"],
        jsRequired: true,
        dataFormat: "SPA (Single Page Application)"
      },
      dataQuality: {
        title: "한국어 중심",
        dates: "정확한 일정",
        artists: "작가 정보 제공",
        images: "양질의 전시 이미지",
        description: "기획 의도 포함"
      },
      crawlability: "중",
      score: 70,
      notes: "React 기반, API 호출 필요"
    },
    
    "대전시립미술관": {
      url: "https://dmma.daejeon.go.kr",
      robotsTxt: "확인 필요",
      structure: {
        exhibitionListPage: "/exhibition",
        jsRequired: false,
        dataFormat: "전통적인 서버 렌더링"
      },
      crawlability: "상",
      score: 80,
      notes: "단순한 구조, 크롤링 용이"
    },
    
    "부산시립미술관": {
      url: "https://art.busan.go.kr",
      robotsTxt: "확인 필요",
      crawlability: "중",
      score: 65,
      notes: "지역 미술관, 상대적으로 단순한 구조"
    }
  },
  
  "사립 미술관": {
    "리움미술관": {
      url: "https://www.leeum.org",
      status: "리뉴얼 중 또는 접근 제한",
      crawlability: "불가",
      score: 0,
      notes: "사이트 접근 불가"
    },
    
    "아모레퍼시픽미술관": {
      url: "https://www.apma.org",
      structure: {
        exhibitionListPage: "/exhibition",
        jsRequired: true,
        dataFormat: "모던 웹사이트"
      },
      crawlability: "중",
      score: 65,
      notes: "깔끔한 디자인, API 기반"
    },
    
    "일민미술관": {
      url: "https://www.ilmin.org",
      crawlability: "중",
      score: 60,
      notes: "중간 규모, 기본적인 구조"
    },
    
    "대림미술관": {
      url: "https://www.daelimmuseum.org",
      structure: {
        exhibitionListPage: "/exhibition",
        jsRequired: true,
        dataFormat: "WordPress 기반"
      },
      crawlability: "중",
      score: 70,
      notes: "잘 구조화된 컨텐츠"
    }
  },
  
  "상업 갤러리": {
    "가나아트갤러리": {
      url: "https://www.ganaart.com",
      robotsTxt: "WordPress 표준 (wp-admin 제외)",
      structure: {
        exhibitionListPage: "/exhibition/",
        categories: ["Current", "Upcoming", "Past"],
        jsRequired: false,
        dataFormat: "WordPress + 커스텀 포스트 타입"
      },
      dataQuality: {
        title: "한국어/영어 병기",
        dates: "명확한 기간",
        artists: "작가별 페이지 연결",
        images: "전문적인 작품 이미지",
        description: "큐레이터 텍스트"
      },
      crawlability: "상",
      score: 90,
      notes: "가장 크롤링하기 좋은 구조"
    },
    
    "학고재갤러리": {
      url: "https://www.hakgojae.com",
      structure: {
        exhibitionListPage: "/exhibitions",
        jsRequired: false,
        dataFormat: "정적 HTML"
      },
      crawlability: "상",
      score: 85,
      notes: "전통적인 갤러리, 명확한 구조"
    },
    
    "아라리오갤러리": {
      url: "https://www.arario.com",
      structure: {
        exhibitionListPage: "/exhibitions",
        jsRequired: true,
        dataFormat: "모던 웹앱"
      },
      crawlability: "중",
      score: 65,
      notes: "국제적인 갤러리, 복잡한 구조"
    },
    
    "페리지갤러리": {
      url: "https://www.perigee.co.kr",
      crawlability: "중",
      score: 60,
      notes: "중소 갤러리, 기본적인 구조"
    },
    
    "갤러리현대": {
      url: "https://www.galleryhyundai.com",
      robotsTxt: "제한 없음",
      structure: {
        exhibitionListPage: "/exhibitions",
        categories: ["Current", "Upcoming", "Past"],
        jsRequired: false,
        dataFormat: "서버사이드 렌더링"
      },
      dataQuality: {
        title: "한국어/영어 제공",
        dates: "정확한 일정",
        artists: "저명 작가 중심",
        images: "고품질 전시 이미지",
        description: "전문적인 전시 해설"
      },
      crawlability: "상",
      score: 95,
      notes: "최고의 크롤링 적합성"
    }
  }
};

// 추가 조사할 곳들
const additionalTargets = {
  "추가 조사 대상": {
    "국립박물관": {
      url: "https://www.museum.go.kr",
      type: "박물관",
      expectedScore: 70,
      notes: "문화재 전시 중심"
    },
    
    "예술의전당": {
      url: "https://www.sac.or.kr",
      type: "복합문화시설",
      expectedScore: 75,
      notes: "공연 + 전시"
    },
    
    "금호미술관": {
      url: "https://www.kumhomuseum.com",
      type: "기업미술관",
      expectedScore: 65
    },
    
    "토탈미술관": {
      url: "https://www.totalmuseum.org",
      type: "사립미술관",
      expectedScore: 60
    },
    
    "갤러리바톤": {
      url: "https://www.gallerybaton.com",
      type: "상업갤러리",
      expectedScore: 70
    }
  }
};

// 최종 추천 순위 (크롤링 적합성 기준)
const recommendations = [
  {
    rank: 1,
    name: "갤러리현대",
    score: 95,
    reason: "완벽한 구조화, JavaScript 불필요, 풍부한 데이터"
  },
  {
    rank: 2,
    name: "가나아트갤러리", 
    score: 90,
    reason: "WordPress 기반으로 예측 가능한 구조, 영어 지원"
  },
  {
    rank: 3,
    name: "학고재갤러리",
    score: 85,
    reason: "전통적인 HTML 구조, 안정적인 크롤링"
  },
  {
    rank: 4,
    name: "대전시립미술관",
    score: 80,
    reason: "서버사이드 렌더링, 단순한 구조"
  },
  {
    rank: 5,
    name: "국립현대미술관",
    score: 75,
    reason: "데이터 품질 우수, JavaScript 처리 필요"
  },
  {
    rank: 6,
    name: "예술의전당",
    score: 75,
    reason: "대규모 전시 정보, 복합적 컨텐츠"
  },
  {
    rank: 7,
    name: "대림미술관",
    score: 70,
    reason: "WordPress 기반, 잘 정리된 컨텐츠"
  }
];

console.log("=== 한국 미술관/갤러리 크롤링 적합성 분석 ===\n");

console.log("🏆 최종 추천 순위:");
recommendations.forEach(rec => {
  console.log(`${rec.rank}위. ${rec.name} (${rec.score}점)`);
  console.log(`    이유: ${rec.reason}\n`);
});

console.log("\n📊 크롤링 난이도별 분류:");
console.log("상급 (JavaScript 불필요, 구조 명확): 갤러리현대, 가나아트, 학고재");
console.log("중급 (일부 JavaScript 필요): 국립현대미술관, 서울시립미술관, 대림미술관");  
console.log("하급 (복잡한 SPA 구조): 아라리오갤러리");
console.log("불가 (접근 제한): 리움미술관");

console.log("\n🎯 즉시 구현 가능한 크롤러 대상:");
console.log("1. 갤러리현대 - 전시 목록 및 상세 정보");
console.log("2. 가나아트갤러리 - WordPress REST API 활용");
console.log("3. 학고재갤러리 - 전통적인 HTML 파싱");

module.exports = { museumAnalysis, recommendations };