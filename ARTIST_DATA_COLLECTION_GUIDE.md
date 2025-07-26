# 🎨 SAYU 아티스트 데이터 수집 시스템 가이드

SAYU의 강력한 아티스트 정보 수집 및 관리 시스템입니다. Node.js와 Python을 결합하여 최고 품질의 아티스트 데이터를 수집합니다.

## 🚀 주요 기능

### 🔄 3가지 수집 방법
1. **Enhanced (Node.js)**: 빠른 다중 소스 수집 + AI 감정 분석
2. **Python**: Wikipedia-API 기반 정밀 수집
3. **Hybrid**: Node.js + Python 결합으로 최고 품질

### 📊 데이터 소스
- Wikipedia (영문/한글)
- Wikidata (구조화된 데이터)
- DBpedia (시맨틱 웹)
- Met Museum API
- Cleveland Museum API
- Rijksmuseum API

### 🎯 수집 정보
- 기본 정보 (이름, 생몰년도, 국적)
- 상세 전기 (영문/한글)
- 예술 사조 및 시대 분류
- 대표 작품 목록
- 이미지 및 초상화
- 저작권 상태 자동 판단
- AI 기반 감정 시그니처
- 16가지 성격 유형별 친화도

## 📦 설치 및 설정

### 1. Node.js 환경 설정
```bash
cd backend
npm install axios wikipedia-api psycopg2-binary openai
```

### 2. Python 환경 설정
```bash
# Python 3.7+ 필요
pip install wikipedia-api requests psycopg2-binary openai
```

### 3. 환경 변수 설정
```bash
# .env 파일에 추가
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your-openai-api-key  # 선택사항
```

### 4. 데이터베이스 마이그레이션
```bash
psql -d your_database -f migrations/create-artists-table.sql
psql -d your_database -f migrations/create-artist-collection-logs-table.sql
```

## 🎯 사용 방법

### API 엔드포인트

#### 1. 단일 아티스트 수집
```bash
POST /api/artist-data/collect-single
Content-Type: application/json
Authorization: Bearer your-token

{
  "artistName": "Pablo Picasso",
  "method": "hybrid",
  "forceUpdate": false
}
```

#### 2. 배치 아티스트 수집
```bash
POST /api/artist-data/collect-batch
Content-Type: application/json
Authorization: Bearer your-token

{
  "artistNames": ["Frida Kahlo", "Vincent van Gogh", "Georgia O'Keeffe"],
  "method": "enhanced",
  "batchSize": 10,
  "delay": 2000
}
```

#### 3. 아티스트 검색
```bash
GET /api/artist-data/search?query=Picasso&sortBy=relevance&limit=20
```

#### 4. 수집 통계 조회
```bash
GET /api/artist-data/stats?period=30
```

#### 5. 데이터 품질 리포트
```bash
GET /api/artist-data/quality-report
```

### 테스트 스크립트 사용법

```bash
# 단일 아티스트 테스트
node test-artist-collection.js --single "Pablo Picasso"

# 하이브리드 방법으로 수집
node test-artist-collection.js --method hybrid --single "Frida Kahlo"

# 전체 테스트 실행
node test-artist-collection.js --full --performance

# 통계만 조회
node test-artist-collection.js --stats
```

### Python 직접 사용법

```bash
# 단일 아티스트
python src/services/wikipediaArtistCollector.py --artist "Leonardo da Vinci"

# 배치 처리
python src/services/wikipediaArtistCollector.py --batch artists_list.txt

# 결과 파일 지정
python src/services/wikipediaArtistCollector.py --artist "Monet" --output my_results.json
```

## 📈 성능 및 품질

### 🚀 성능 최적화
- **병렬 처리**: 다중 소스 동시 수집
- **레이트 리미팅**: API 제한 준수
- **캐싱**: 중복 요청 방지
- **비동기 배치**: 대량 처리 시 백그라운드 실행

### 🎯 품질 관리
- **자동 품질 점수**: 0-100점 자동 계산
- **중복 제거**: 이름 기반 스마트 매칭
- **데이터 검증**: 필수 필드 및 형식 검사
- **소스 추적**: 모든 정보의 출처 기록

### 📊 품질 지표
- **완성도**: 필수 정보 보유율
- **정확성**: 데이터 일관성 검증
- **신선도**: 최근 업데이트 여부
- **다양성**: 다중 소스 활용도

## 🔧 관리 기능

### 관리자 전용 API
```bash
# 검색 인덱스 재구성
POST /api/artist-data/admin/rebuild-index

# 중복 아티스트 정리
POST /api/artist-data/admin/cleanup-duplicates

# 수집 로그 조회
GET /api/artist-data/admin/collection-logs?limit=50
```

### 대시보드 뷰
```sql
SELECT * FROM artist_collection_dashboard;
```

## 🎨 사용 예시

### 1. 유명 아티스트 일괄 수집
```javascript
const artists = [
  'Pablo Picasso', 'Vincent van Gogh', 'Leonardo da Vinci',
  'Frida Kahlo', 'Claude Monet', 'Salvador Dalí',
  'Andy Warhol', 'Georgia O\'Keeffe', 'Jackson Pollock'
];

// 하이브리드 방법으로 고품질 수집
await fetch('/api/artist-data/collect-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    artistNames: artists,
    method: 'hybrid',
    delay: 3000  // 3초 간격
  })
});
```

### 2. 검색 및 필터링
```javascript
// 인상주의 화가 검색
const impressionists = await fetch(
  '/api/artist-data/search?query=impressionism&era=Impressionism&limit=50'
).then(r => r.json());

// 한국 아티스트 검색
const koreanArtists = await fetch(
  '/api/artist-data/search?nationality=Korean&sortBy=popularity'
).then(r => r.json());
```

### 3. 품질 개선 모니터링
```javascript
const qualityReport = await fetch('/api/artist-data/quality-report')
  .then(r => r.json());

console.log(`평균 품질 점수: ${qualityReport.overview.averageQualityScore}`);
console.log(`개선 권장사항:`, qualityReport.recommendations);
```

## 🚧 문제 해결

### Python 환경 오류
```bash
# 패키지 재설치
pip uninstall wikipedia-api
pip install wikipedia-api

# 권한 문제 (Windows)
pip install --user wikipedia-api
```

### 데이터베이스 연결 오류
```bash
# 연결 테스트
psql "postgresql://user:password@host:port/database" -c "SELECT 1;"

# 권한 확인
GRANT ALL PRIVILEGES ON TABLE artists TO your_user;
```

### API 제한 초과
```javascript
// 지연 시간 늘리기
{
  "delay": 5000,  // 5초로 증가
  "batchSize": 5  // 배치 크기 줄이기
}
```

## 📝 로그 및 모니터링

### 로그 파일 위치
- `artist_collection.log`: Python 수집 로그
- `test-results/`: 테스트 결과 저장
- Database: `artist_collection_logs` 테이블

### 모니터링 쿼리
```sql
-- 최근 수집 현황
SELECT method, COUNT(*), AVG(success_count::float/artist_count) as success_rate
FROM artist_collection_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY method;

-- 품질 분포
SELECT 
  CASE 
    WHEN overall_score >= 80 THEN 'High'
    WHEN overall_score >= 60 THEN 'Medium'
    ELSE 'Low'
  END as quality_tier,
  COUNT(*) as artist_count
FROM artist_data_quality
GROUP BY quality_tier;
```

## 🔮 확장 계획

### Phase 2: 고급 기능
- [ ] 실시간 위키피디아 변경사항 추적
- [ ] 머신러닝 기반 아티스트 분류
- [ ] 소셜 미디어 정보 통합
- [ ] 전시 이력 자동 수집

### Phase 3: AI 강화
- [ ] GPT-4를 통한 전기 요약
- [ ] 이미지 인식으로 작품 스타일 분석
- [ ] 감정 벡터 고도화
- [ ] 개인화된 아티스트 추천

## 🤝 기여하기

새로운 데이터 소스나 개선사항이 있다면:

1. Issue 생성 또는 PR 제출
2. 새로운 수집기는 `services/` 디렉토리에 추가
3. 테스트 케이스 포함 필수
4. 문서 업데이트

## 📞 지원

문제가 발생하면:
- GitHub Issues에 버그 리포트
- 로그 파일과 함께 상세한 설명 제공
- 사용 환경 정보 (Node.js/Python 버전, OS 등)

---

**SAYU 아티스트 데이터 수집 시스템으로 예술의 세계를 데이터로 연결하세요!** 🎨✨