# Artvee Crawler for SAYU

Artvee.com의 공개 도메인 예술 작품을 수집하는 크롤러입니다.

## 🚀 시작하기

### 1. 설치
```bash
cd artvee-crawler
npm install
```

### 2. 단계별 실행

#### Step 1: URL 수집 (Sitemap에서)
```bash
node collect-urls.js
```
- Sitemap에서 1,000개의 작품 URL을 수집합니다
- 결과: `data/artvee-urls.json`, `data/artvee-urls.csv`

#### Step 2: 테스트 (선택사항)
```bash
node test-crawler.js
```
- 단일 작품 페이지로 크롤러를 테스트합니다

#### Step 3: 메타데이터 크롤링
```bash
# 10개만 테스트
node crawler.js 10

# 100개 크롤링
node crawler.js 100

# 전체 1,000개 (시간 소요)
node crawler.js 1000
```

### 3. 결과 파일
- `data/artworks-{timestamp}.json` - 작품 메타데이터
- `data/artworks-{timestamp}.csv` - CSV 형식
- `logs/errors-{timestamp}.json` - 에러 로그

## 📊 데이터 구조
```json
{
  "url": "https://artvee.com/dl/artwork-name/",
  "title": "작품 제목",
  "artist": "작가명",
  "date": "제작년도",
  "museum": "소장처",
  "category": "카테고리",
  "tags": "태그1, 태그2",
  "imageUrl": "이미지 URL",
  "downloadUrl": "다운로드 URL",
  "crawledAt": "2024-01-13T..."
}
```

## ⚙️ 설정 (.env)
- `DELAY_MS=2500` - 요청 간 딜레이 (밀리초)
- `BATCH_SIZE=10` - 배치 크기
- `USER_AGENT` - User-Agent 헤더

## 📝 주의사항
- 서버 부하를 고려하여 2.5초 딜레이를 유지합니다
- robots.txt를 준수합니다
- 교육/문화 목적으로만 사용합니다

## 🔄 다음 단계
1. 이미지 다운로드 스크립트 (download-images.js)
2. PostgreSQL DB 연동
3. Cloudinary 업로드
4. SAYU 플랫폼과 통합