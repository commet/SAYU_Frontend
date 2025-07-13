# 🌍 SAYU 글로벌 전시 DB 구축 가이드

## 📋 개요

글로벌 주요 도시의 미술관, 박물관, 갤러리의 전시 정보를 체계적으로 수집하고 관리하는 데이터베이스 구축 가이드입니다.

### 대상 지역
- **아시아**: 한국(서울, 부산, 대구, 광주), 일본(도쿄, 오사카), 중국/홍콩
- **미주**: 미국(뉴욕, 시카고, 워싱턴 DC, LA)
- **유럽**: 프랑스(파리), 영국(런던), 독일(베를린), 이탈리아(베니스, 밀라노)

## 🗂️ 데이터베이스 스키마

```sql
-- 기관 정보 테이블
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  name_en VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  type VARCHAR(50) NOT NULL, -- 'museum', 'gallery', 'art_center'
  category VARCHAR(50), -- 'national', 'private', 'commercial'
  
  -- 위치 정보
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  coordinates POINT,
  timezone VARCHAR(50),
  
  -- 운영 정보
  website VARCHAR(500),
  email VARCHAR(200),
  phone VARCHAR(50),
  opening_hours JSONB, -- 요일별 운영시간
  admission_info JSONB, -- 입장료 정보
  
  -- 추가 정보
  description TEXT,
  history TEXT,
  floor_plan_url VARCHAR(500),
  annual_visitors INTEGER,
  established_year INTEGER,
  
  -- 메타데이터
  data_source VARCHAR(100),
  verified_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전시 정보 테이블
CREATE TABLE exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  
  -- 기본 정보
  title_en VARCHAR(500) NOT NULL,
  title_local VARCHAR(500),
  subtitle VARCHAR(500),
  
  -- 일정
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming', -- 'ongoing', 'upcoming', 'past'
  
  -- 내용
  description TEXT,
  curator VARCHAR(200),
  artists TEXT[], -- 작가 목록
  artworks_count INTEGER,
  
  -- 가격 정보
  ticket_price JSONB, -- {adult: 15000, student: 10000, ...}
  
  -- 링크
  official_url VARCHAR(500),
  press_release_url VARCHAR(500),
  virtual_tour_url VARCHAR(500),
  
  -- 분류
  exhibition_type VARCHAR(100), -- 'permanent', 'temporary', 'special'
  genres TEXT[], -- ['contemporary', 'photography', ...]
  tags TEXT[],
  
  -- 메타데이터
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이미지 관리 테이블
CREATE TABLE exhibition_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id),
  
  -- 이미지 정보
  image_type VARCHAR(50), -- 'poster', 'installation', 'artwork'
  source_url TEXT,
  cdn_url TEXT,
  thumbnail_url TEXT,
  
  -- 저작권
  rights_status VARCHAR(50), -- 'cc0', 'fair_use', 'licensed'
  credit_line TEXT,
  license_info TEXT,
  
  -- 메타데이터
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작가 정보 테이블
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name_en VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  nationality VARCHAR(100),
  birth_year INTEGER,
  death_year INTEGER,
  
  biography TEXT,
  website VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전시-작가 연결 테이블
CREATE TABLE exhibition_artists (
  exhibition_id UUID REFERENCES exhibitions(id),
  artist_id UUID REFERENCES artists(id),
  role VARCHAR(50) DEFAULT 'artist', -- 'artist', 'curator', 'collaborator'
  PRIMARY KEY (exhibition_id, artist_id)
);

-- 인덱스
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_institution ON exhibitions(institution_id);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_institutions_location ON institutions(country, city);
```

## 📊 단계별 구축 전략

### Phase 1: MVP (2주)
핵심 도시의 주요 기관 45개 집중

```javascript
const phase1Plan = {
  week1: {
    // Day 1-2: 인프라 구축
    infrastructure: {
      tasks: [
        "Google Sheets 템플릿 생성",
        "데이터 수집 도구 설정",
        "자동화 스크립트 준비"
      ]
    },
    
    // Day 3-4: 서울 데이터 (20개 기관)
    seoul: {
      museums: [
        "국립현대미술관",
        "서울시립미술관",
        "리움미술관",
        "대림미술관",
        "아모레퍼시픽미술관"
      ],
      galleries: [
        "갤러리현대",
        "국제갤러리",
        "아라리오갤러리",
        "PKM갤러리",
        "페이스갤러리"
      ]
    },
    
    // Day 5-7: 뉴욕 데이터 (15개 기관)
    newYork: {
      museums: [
        "MoMA",
        "Metropolitan Museum",
        "Guggenheim",
        "Whitney Museum",
        "Brooklyn Museum"
      ],
      galleries: [
        "Gagosian",
        "David Zwirner",
        "Pace Gallery",
        "Hauser & Wirth"
      ]
    }
  },
  
  week2: {
    // Day 1-2: 파리 데이터 (10개 기관)
    paris: {
      museums: [
        "Louvre",
        "Musée d'Orsay",
        "Centre Pompidou",
        "Musée Rodin"
      ],
      galleries: [
        "Perrotin",
        "Kamel Mennour"
      ]
    },
    
    // Day 3-5: 데이터 검증 및 보강
    validation: [
      "날짜 정확성 검증",
      "번역 품질 확인",
      "이미지 저작권 확인"
    ],
    
    // Day 6-7: 시스템 통합
    integration: [
      "데이터베이스 임포트",
      "API 엔드포인트 구축",
      "프론트엔드 연동"
    ]
  }
};
```

### Phase 2: 확장 (1개월)
추가 도시 및 기관 확대

## 🛠️ 데이터 수집 Workflow

### 1. 자동화 도구 설정

```javascript
// 웹 스크래핑 설정 (Puppeteer)
const scrapingConfig = {
  selectors: {
    moma: {
      title: 'h1.exhibition-title',
      dates: '.exhibition-dates',
      description: '.exhibition-description',
      image: '.hero-image img'
    },
    // 각 사이트별 셀렉터
  },
  
  // 스크래핑 함수
  async scrapeExhibition(url, selectors) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    const data = {
      title: await page.$eval(selectors.title, el => el.textContent),
      dates: await page.$eval(selectors.dates, el => el.textContent),
      description: await page.$eval(selectors.description, el => el.textContent),
      image: await page.$eval(selectors.image, el => el.src)
    };
    
    await browser.close();
    return data;
  }
};
```

### 2. Google Sheets 템플릿

```javascript
// Google Apps Script
function createDataTemplate() {
  const ss = SpreadsheetApp.create('SAYU Exhibition Database');
  
  // Sheet 1: 기관 정보
  const institutionSheet = ss.insertSheet('Institutions');
  institutionSheet.getRange(1, 1, 1, 15).setValues([[
    'ID', 'Name_EN', 'Name_Local', 'Type', 'Country', 'City',
    'Address', 'Latitude', 'Longitude', 'Website', 'Hours',
    'Admission', 'Description', 'Verified_Date', 'Notes'
  ]]);
  
  // Sheet 2: 전시 정보
  const exhibitionSheet = ss.insertSheet('Exhibitions');
  exhibitionSheet.getRange(1, 1, 1, 18).setValues([[
    'ID', 'Institution_ID', 'Title_EN', 'Title_Local',
    'Start_Date', 'End_Date', 'Status', 'Artists',
    'Curator', 'Description', 'Ticket_Price', 'Official_URL',
    'Image_URL', 'Image_Rights', 'Genres', 'Tags',
    'Last_Updated', 'Notes'
  ]]);
  
  // 데이터 검증 규칙 추가
  addValidationRules(institutionSheet, exhibitionSheet);
}
```

### 3. 반자동 데이터 수집

```javascript
// Chrome Extension manifest.json
{
  "manifest_version": 3,
  "name": "SAYU Exhibition Collector",
  "permissions": ["activeTab", "storage"],
  "content_scripts": [{
    "matches": ["*://*.museum.org/*", "*://*.gallery.com/*"],
    "js": ["content.js"]
  }]
}

// content.js
function extractExhibitionData() {
  const data = {
    title: document.querySelector('h1')?.textContent,
    dates: extractDates(),
    artists: extractArtists(),
    description: document.querySelector('.description')?.textContent,
    images: Array.from(document.querySelectorAll('.gallery img'))
      .map(img => ({
        url: img.src,
        alt: img.alt
      }))
  };
  
  // CSV로 변환하여 클립보드에 복사
  copyToClipboard(convertToCSV(data));
}
```

## 📸 이미지 관리 전략

### 저작권 안전 가이드

```javascript
const imageRightsStrategy = {
  // 1순위: 공식 제공 이미지
  official: {
    sources: [
      "기관 Press Kit",
      "공식 API",
      "Media 섹션"
    ],
    usage: "Terms에 따라 사용"
  },
  
  // 2순위: Creative Commons
  creativeCommons: {
    sources: [
      "Wikimedia Commons",
      "Flickr (CC 라이선스)",
      "Museums' CC Collections"
    ],
    licenses: ["CC0", "CC BY", "CC BY-SA"]
  },
  
  // 3순위: Fair Use
  fairUse: {
    conditions: [
      "교육/정보 목적",
      "작은 해상도 (max 400px)",
      "출처 명시",
      "원본 링크 제공"
    ]
  },
  
  // 이미지 처리 파이프라인
  processing: async (imageUrl) => {
    const processed = await sharp(imageUrl)
      .resize(800, 600, { fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer();
      
    const cdn = await uploadToCDN(processed);
    
    return {
      original: imageUrl,
      cdn: cdn.url,
      thumbnail: cdn.thumbnailUrl
    };
  }
};
```

## 🔄 데이터 파이프라인

### ETL 프로세스

```javascript
// Extract-Transform-Load
class ExhibitionETL {
  // 1. Extract (추출)
  async extract() {
    const sources = [
      this.scrapeWebsites(),
      this.fetchAPIs(),
      this.readGoogleSheets()
    ];
    
    return Promise.all(sources);
  }
  
  // 2. Transform (변환)
  async transform(rawData) {
    return rawData.map(item => ({
      // 표준화
      title: this.normalizeTitle(item.title),
      dates: this.parseDates(item.dateString),
      
      // 번역
      titleKo: await this.translate(item.title, 'ko'),
      
      // 보강
      genres: this.categorizeGenres(item),
      tags: this.generateTags(item),
      
      // 검증
      validated: this.validate(item)
    }));
  }
  
  // 3. Load (적재)
  async load(transformedData) {
    // 데이터베이스 삽입
    const results = await db.transaction(async trx => {
      const institutions = await trx('institutions')
        .insert(transformedData.institutions)
        .returning('*');
        
      const exhibitions = await trx('exhibitions')
        .insert(transformedData.exhibitions)
        .returning('*');
        
      return { institutions, exhibitions };
    });
    
    // 캐시 업데이트
    await this.updateCache(results);
    
    // 검색 인덱스 업데이트
    await this.updateSearchIndex(results);
  }
}
```

## 📅 운영 및 유지보수

### 자동화 스케줄

```javascript
// Cron Jobs
const maintenanceSchedule = {
  // 매일
  daily: {
    time: '02:00',
    tasks: [
      'updateExhibitionStatus', // ongoing → past
      'checkBrokenLinks',
      'generateDailyReport'
    ]
  },
  
  // 매주
  weekly: {
    time: 'Monday 09:00',
    tasks: [
      'scrapeNewExhibitions',
      'updateInstitutionInfo',
      'cleanupOldData'
    ]
  },
  
  // 매월
  monthly: {
    time: '1st day 10:00',
    tasks: [
      'fullDataValidation',
      'generateMonthlyStats',
      'backupDatabase'
    ]
  }
};

// 모니터링 대시보드
const monitoring = {
  metrics: {
    totalInstitutions: "SELECT COUNT(*) FROM institutions",
    totalExhibitions: "SELECT COUNT(*) FROM exhibitions",
    upcomingExhibitions: "SELECT COUNT(*) FROM exhibitions WHERE status = 'upcoming'",
    dataCompleteness: "SELECT AVG(completeness_score) FROM exhibitions",
    lastUpdate: "SELECT MAX(updated_at) FROM exhibitions"
  },
  
  alerts: {
    staleData: "No updates in 7 days",
    lowCompleteness: "Completeness < 70%",
    brokenLinks: "More than 5% broken"
  }
};
```

## 🎯 품질 관리

### 데이터 품질 점수

```javascript
function calculateQualityScore(exhibition) {
  const weights = {
    required: 0.5,    // 필수 필드
    important: 0.3,   // 중요 필드
    optional: 0.2     // 선택 필드
  };
  
  const scores = {
    required: checkRequired(exhibition),
    important: checkImportant(exhibition),
    optional: checkOptional(exhibition)
  };
  
  const totalScore = 
    scores.required * weights.required +
    scores.important * weights.important +
    scores.optional * weights.optional;
    
  return {
    score: Math.round(totalScore * 100),
    details: scores,
    missing: getMissingFields(exhibition)
  };
}

// 필수 필드 체크
function checkRequired(exhibition) {
  const required = ['title', 'start_date', 'end_date', 'institution_id'];
  const present = required.filter(field => exhibition[field]);
  return present.length / required.length;
}
```

## 🚀 2주 MVP 실행 계획

### Week 1: 데이터 수집
- **Day 1-2**: 템플릿 및 도구 준비
- **Day 3-4**: 서울 20개 기관 데이터
- **Day 5-6**: 뉴욕 15개 기관 데이터
- **Day 7**: 주간 검증 및 정리

### Week 2: 시스템 구축
- **Day 1-2**: 파리 10개 기관 + 추가 데이터
- **Day 3**: 이미지 수집 및 처리
- **Day 4**: 데이터베이스 구축
- **Day 5**: API 개발
- **Day 6**: 프론트엔드 통합
- **Day 7**: 테스트 및 배포

## 📈 확장 계획

### Phase 3: 글로벌 확장
- 아시아: 도쿄, 베이징, 홍콩, 싱가포르
- 미주: 시카고, LA, 워싱턴 DC
- 유럽: 런던, 베를린, 베니스

### Phase 4: 기능 고도화
- AI 기반 전시 추천
- 다국어 자동 번역
- 사용자 제보 시스템
- 실시간 업데이트