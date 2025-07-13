# Artvee Crawler 프로젝트 현황

## 📋 프로젝트 개요
Artvee.com의 공개 도메인 예술 작품을 수집하여 SAYU 플랫폼에 통합하는 크롤러 프로젝트입니다.

## 🚀 현재까지 진행 상황

### 1. 프로젝트 구조 생성
```
SAYU/
└── artvee-crawler/
    ├── package.json
    ├── .env
    ├── README.md
    ├── collect-urls.js          # 기본 URL 수집 (시간순)
    ├── collect-urls-smart.js    # 스마트 URL 수집 (다양성 고려)
    ├── collect-urls-comprehensive.js  # 포괄적 수집
    ├── collect-all-urls.js      # 전체 스캔 (최종 버전)
    ├── crawler.js               # 메타데이터 크롤링
    ├── test-crawler.js          # 단일 페이지 테스트
    └── data/                    # 수집된 데이터 저장
```

### 2. 설치된 패키지
```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12",
    "csv-writer": "^1.6.0",
    "puppeteer": "^21.6.1",
    "xml2js": "^0.6.2",
    "dotenv": "^16.3.1",
    "p-limit": "^3.1.0"
  }
}
```

### 3. 현재 상태
- ✅ 프로젝트 구조 설정 완료
- ✅ 4가지 URL 수집 스크립트 작성
- ⏳ URL 수집 진행 중 (collect-all-urls.js 실행 대기)
- ❌ 크롤링 아직 시작 안함
- ❌ 이미지 다운로드 스크립트 미작성

## 🔧 노트북에서 이어서 작업하기

### 1. 코드 받기
```bash
cd ~/Documents/Github/SAYU
git pull
cd artvee-crawler
npm install
```

### 2. URL 수집 (아직 안했다면)
```bash
# 전체 스캔으로 1,000개 수집 (추천)
node collect-all-urls.js

# 또는 빠른 테스트용
node collect-urls.js 100
```

### 3. 크롤링 시작
```bash
# 10개 테스트
node crawler.js 10

# 100개 크롤링
node crawler.js 100

# 전체 1,000개
node crawler.js 1000
```

## 📝 다음 단계 작업

### 1. 이미지 다운로드 스크립트 작성
```javascript
// download-images.js
// - 크롤링된 데이터에서 이미지 URL 추출
// - 고화질 이미지 다운로드
// - 썸네일 생성
// - Cloudinary 업로드
```

### 2. DB 연동
```javascript
// db-import.js
// - PostgreSQL 연결
// - artworks 테이블에 삽입
// - 성격 유형 매칭 초기값 설정
```

### 3. SAYU 플랫폼 통합
- 프론트엔드에서 Artvee 작품 표시
- 필터링 및 검색 기능
- 성격 유형별 추천

## 🎯 목표
- 1,000개의 다양한 공개 도메인 예술 작품 수집
- 유명 작가 작품 우선
- 장르별 균형 잡힌 컬렉션
- SAYU 성격 유형과 매칭 가능한 메타데이터

## ⚠️ 주의사항
- robots.txt 준수 (2.5초 딜레이)
- 서버 부하 최소화
- 교육/문화 목적으로만 사용
- Artvee 출처 명시

## 🔑 환경변수 (.env)
```
DELAY_MS=2500
BATCH_SIZE=10
MAX_CONCURRENT=3
USER_AGENT=SAYU-Bot/1.0 (Educational Art Platform)
IMAGES_DIR=./images
DATA_DIR=./data
LOGS_DIR=./logs
DATABASE_URL=postgresql://postgres:ceqwpOAOTYwYHEMZSkZXbQtVGfyiHriW@tramway.proxy.rlwy.net:26410/railway
```

## 📊 수집 전략
1. **collect-all-urls.js** 사용 (최종 버전)
2. 전체 sitemap 자동 탐색
3. 10,000개 수집 후 1,000개 선별
4. 유명 작가 60명+ 검색
5. 10가지 장르 분류

---
작성일: 2024-01-13
마지막 업데이트: PowerShell 환경에서 작업 중