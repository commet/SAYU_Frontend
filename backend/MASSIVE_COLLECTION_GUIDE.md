# 🎨 SAYU ArtMap 대량 수집 가이드

## 📋 개요
ArtMap.com에서 해외 주요 도시의 전시 정보를 대량으로 수집하는 시스템입니다.

### 🎯 수집 목표
- **40+ 도시**: 뉴욕, 런던, 파리, 베를린, 도쿄, 서울 등 전 세계 주요 예술 도시
- **3,000+ 전시**: 현재 진행 중인 전시와 예정된 전시
- **1,000+ 장소**: 미술관, 갤러리, 대안공간 등
- **상세 정보**: 아티스트, 큐레이터, GPS 좌표, 연락처 등

## 🚀 빠른 시작

### 1️⃣ 환경 설정
```bash
# 환경 변수 확인
echo $DATABASE_URL  # PostgreSQL 연결 문자열 필요

# 의존성 설치 (이미 설치되어 있음)
cd backend
npm install
```

### 2️⃣ 시스템 테스트
```bash
# 전체 시스템 테스트
npm run massive:test

# 빠른 연결 테스트만
node test-massive-collection.js --connection
```

### 3️⃣ 수집 시작
```bash
# 표준 수집 (6-8시간 소요)
npm run massive:collect

# 빠른 수집 (2-3시간 소요, 적은 데이터)
npm run massive:collect:quick

# 안전 모드 (8-10시간 소요, 더 안정적)
npm run massive:collect:safe
```

### 4️⃣ 진행 상황 모니터링
```bash
# 새 터미널에서 실시간 모니터링
node collection-monitor.js

# 수집 요약 보고서
node collection-monitor.js --summary
```

## 📊 수집 옵션 비교

| 모드 | 도시당 Venue 수 | 예상 시간 | 예상 데이터 | 안정성 |
|------|----------------|-----------|-------------|--------|
| **빠른 수집** | 30개 | 2-3시간 | 1,500+ 전시 | 보통 |
| **표준 수집** | 50개 | 6-8시간 | 3,000+ 전시 | 좋음 |
| **안전 모드** | 50개 | 8-10시간 | 3,000+ 전시 | 최고 |

## 🏙️ 수집 대상 도시

### Tier 1 (우선순위 최고)
- **북미**: 뉴욕, 로스앤젤레스
- **유럽**: 런던, 파리, 베를린, 암스테르담
- **아시아**: 도쿄, 서울
- **기타**: 취리히, 바젤

### Tier 2 (중요 도시)
- 시카고, 마이애미, 바르셀로나, 로마, 밀라노
- 홍콩, 상하이, 싱가포르
- 비엔나, 마드리드 등

### Tier 3 & 4 (지역 허브)
- 토론토, 몬트리올, 시드니, 멜버른
- 브뤼셀, 코펜하겐, 스톡홀름
- 두바이, 텔아비브 등

## 📁 수집 결과 저장 위치

### 데이터베이스
- **exhibitions** 테이블: 전시 정보
- **venues** 테이블: 장소 정보 (GPS 좌표 포함)

### JSON 백업
```
backend/
├── collection_results/          # 최종 결과
│   ├── massive_collection_full_*.json
│   └── massive_collection_summary_*.json
├── collection_logs/             # 실행 로그
│   └── massive_collection_*.log
└── src/services/artmap-crawler/
    └── backups/                 # 도시별 백업
        ├── newyork_*.json
        ├── london_*.json
        └── ...
```

## 🔧 고급 사용법

### 맞춤 설정으로 실행
```bash
node run-massive-collection.js --start --quick --force
```

### 특정 도시만 수집
```bash
node src/services/artmap-crawler/batch-crawl-artmap.js --tier1
```

### 진행 상황 확인
```bash
# 실시간 모니터링
node collection-monitor.js

# 특정 도시 로그 확인
ls src/services/artmap-crawler/logs/
```

## 📊 예상 결과

### 수집 데이터량
- **전시 정보**: 3,000-5,000개
- **장소 정보**: 1,000-1,500개
- **GPS 좌표**: 70-80% 수집 성공률
- **이미지 URL**: 60-70% 수집 성공률

### 데이터 품질
- **중복 제거**: 자동 처리
- **데이터 검증**: 필수 필드 확인
- **오류 처리**: 상세 로그 기록

## ⚠️ 주의사항

### 시스템 요구사항
- **메모리**: 최소 2GB 여유 공간
- **디스크**: 최소 5GB 여유 공간  
- **네트워크**: 안정적인 인터넷 연결
- **시간**: 중단 없는 6-8시간

### 서버 부하 고려사항
- 요청 간격: 1.5-3초 (설정에 따라)
- 동시 연결: 1개 (순차 처리)
- 재시도: 3회까지 자동 재시도
- 중단점: 도시별/Venue별 저장

### 오류 대응
```bash
# 연결 오류시
node test-massive-collection.js --connection

# 데이터베이스 오류시  
node test-massive-collection.js --database

# 파싱 오류시
node test-massive-collection.js --parsing
```

## 🆘 문제 해결

### 자주 발생하는 문제

1. **"Database connection failed"**
   ```bash
   # 환경변수 확인
   echo $DATABASE_URL
   # Railway 서비스 상태 확인
   ```

2. **"Network connection failed"**
   ```bash
   # ArtMap 접근 테스트
   curl -I https://artmap.com
   ```

3. **"Memory usage high"**
   ```bash
   # 메모리 정리 후 재시작
   node --max-old-space-size=4096 run-massive-collection.js
   ```

### 수집 중단 및 재시작
```bash
# Ctrl+C로 중단 후 재시작하면 자동으로 이어서 진행
npm run massive:collect
```

## 📈 성능 최적화

### 빠른 수집을 위한 설정
```javascript
// massive-artmap-collector.js 수정
this.config = {
  maxVenuesPerType: 30,        // 기본값: 50
  requestDelay: 1000,          // 기본값: 1500ms  
  batchSize: 5,                // 기본값: 5
  saveInterval: 5              // 기본값: 10
};
```

### 안정성을 위한 설정
```javascript
this.config = {
  maxVenuesPerType: 100,       // 더 많은 venue
  requestDelay: 3000,          // 더 긴 대기시간
  batchSize: 3,                // 작은 배치 크기
  saveInterval: 3              // 자주 저장
};
```

## 📞 지원

수집 과정에서 문제가 발생하면:

1. **로그 확인**: `collection_logs/` 폴더
2. **모니터링**: `node collection-monitor.js`
3. **요약 보고서**: `node collection-monitor.js --summary`
4. **테스트 재실행**: `npm run massive:test`

---

**🎉 성공적인 수집을 위해 이 가이드를 따라 진행하세요!**