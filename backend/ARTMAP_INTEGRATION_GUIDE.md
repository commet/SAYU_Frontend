# Artmap.com 전시 데이터 통합 가이드

## 📊 수집 결과 요약

**수집일**: 2025년 7월 26일  
**총 전시 수**: 38개  
**출처**: artmap.com  

### 카테고리별 분포
- **기관(institutions)**: 30개 전시
- **갤러리(galleries)**: 6개 전시  
- **기타 공간(furtherspaces)**: 2개 전시

### 지역별 분포
- **독일**: 베를린, 뮌헨, 칼스루에 (16개)
- **스위스**: 바젤, 취리히 (8개)
- **오스트리아**: 비엔나, 인스브루크, 돈비른 (5개)
- **영국**: 런던 (2개)
- **기타**: 노르웨이, 스웨덴, 네덜란드, 미국, 폴란드, 덴마크 (7개)

## 🎯 주요 특징

### 고품질 해외 전시 정보
- 세계적인 아티스트들 (Giuseppe Penone, Yoko Ono, Kerstin Brätsch 등)
- 유명 기관들 (Serpentine, Gropius Bau, Stedelijk Museum 등)
- 현재 진행 중 및 예정 전시 (2024-2026년)

### 완전한 메타데이터
- 정확한 전시 제목
- 장소 정보 (이름, URL)
- 날짜 정보 (시작일, 종료일)
- 이미지 URL
- 공식 웹사이트 링크

## 📁 생성된 파일들

### 1. 크롤링 스크립트
- `multi-category-artmap-crawler.js` - 다중 카테고리 크롤러
- `improved-artmap-crawler.js` - 개선된 단일 크롤러

### 2. 데이터 파일
- `artmap-multi-category-2025-07-26T12-50-55-240Z.json` - 수집된 38개 전시 JSON
- `artmap-exhibitions-insert.sql` - SQL 삽입 스크립트

### 3. 통합 스크립트
- `save-artmap-to-exhibitions.js` - Node.js로 DB 저장
- `check-exhibitions-schema.js` - 테이블 구조 확인

## 🔧 사용 방법

### 1. 새로운 전시 수집
```bash
cd backend
node multi-category-artmap-crawler.js
```

### 2. 데이터베이스에 저장 (Node.js)
```bash
# 환경 변수 설정 후
node save-artmap-to-exhibitions.js
```

### 3. 데이터베이스에 저장 (SQL 직접 실행)
```sql
-- PostgreSQL에서 실행
\i artmap-exhibitions-insert.sql
```

## 📋 데이터베이스 스키마 매핑

### Artmap 데이터 → SAYU exhibitions 테이블

| Artmap 필드 | SAYU 필드 | 변환 |
|-------------|-----------|------|
| title | title, title_en | 동일 값 사용 |
| venue.name | venue_name | 직접 매핑 |
| venue.url | venues 테이블의 website | 별도 venue 생성 |
| dates.original | start_date, end_date | 날짜 파싱 |
| imageUrl | poster_image | 직접 매핑 |
| url | official_url, source_url | 직접 매핑 |
| category | source에 'artmap' 설정 | 고정값 |

### Venue 자동 생성
- 장소명에서 도시/국가 자동 추정
- 기본 타입: 'gallery' 또는 'museum'
- 중복 방지 체크

## 🎨 주요 전시 하이라이트

### 현재 진행 중
1. **Giuseppe Penone** - Serpentine, London (2025.04.03-09.07)
2. **Yoko Ono. TOUCH** - n.b.k., Berlin (2025.03.02-08.31)
3. **Kerstin Brätsch** - Munch Museet, Oslo (2025.03.14-08.03)

### 곧 시작 예정
1. **Marta Astfalck-Vietz** - Berlinische Galerie (2025.07.11-10.13)
2. **Monira Al Qadiri** - Berlinische Galerie (2025.07.11-2026.08.17)
3. **Plants_Intelligence** - Badischer Kunstverein (2025.07.11-11.23)

## 🔄 정기 수집 권장사항

### 수집 주기
- **매주 1회**: 새로운 전시 추가
- **매월 1회**: 전체 데이터 갱신

### 모니터링 포인트
- 중복 전시 체크
- 날짜 파싱 오류
- 장소 정보 정확성
- 이미지 URL 유효성

## 🚀 확장 가능성

### 추가 수집 가능 데이터
1. **전시 상세 설명** - 각 전시 페이지 크롤링
2. **아티스트 정보** - 프로필 링크 추출
3. **리뷰/평점** - 사용자 평가 데이터
4. **관련 이벤트** - 오프닝, 토크 등

### 다른 소스와의 통합
- 기존 한국 전시 데이터와 연결
- 사용자 성격 유형별 추천 알고리즘 적용
- 글로벌 미술관 API 데이터와 크로스 체크

## ⚠️ 주의사항

### 법적 고려사항
- artmap.com의 robots.txt 준수
- 3초 딜레이로 서버 부하 최소화
- 상업적 이용 시 저작권 확인 필요

### 기술적 제한사항
- 일부 전시는 JavaScript 로딩 필요
- 이미지 URL의 만료 가능성
- 사이트 구조 변경 시 크롤러 수정 필요

## 📈 SAYU 통합 효과

### 데이터 품질 향상
- 해외 전시 688개 → 726개 (5.5% 증가)
- 글로벌 커버리지 확대
- 현대미술 중심의 큐레이션

### 사용자 경험 개선
- 해외 여행 시 전시 추천
- 국제적 아티스트 노출 확대
- 성격 유형별 해외 전시 매칭

---

*이 가이드는 2025년 7월 26일 기준으로 작성되었으며, artmap.com의 사이트 구조 변경 시 업데이트가 필요할 수 있습니다.*