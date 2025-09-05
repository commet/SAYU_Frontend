# SAYU Exhibition Migration Status
## Last Updated: 2025-09-05

## ✅ Completed Tasks

### 1. Database Structure Cleanup
- **venues 테이블 정리 완료**
  - 963개 venue의 이상한 코드 제거 (예: "(fn10g)" 형태)
  - venues_simple 125개 데이터를 venues로 통합
  - exhibitions_master의 venue_id를 venues 테이블 참조로 업데이트
  - 총 148개 전시의 venue 연결 완료

### 2. Schema Updates
- **instagram_url 컬럼 추가 완료**
  ```sql
  ALTER TABLE exhibitions_master 
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;
  ```
- **기존 컬럼 확인**
  - source_url: 웹페이지 URL (이미 존재)
  - poster_url, thumbnail_url: 이미지 URL (이미 존재)

### 3. SQL Batch 시스템 구축
- 전시 데이터를 5개씩 나누어 관리
- exhibitions-sept-batch1.sql 생성 (1-5번 전시)

## 📝 현재 진행 상황

### Batch 1 (exhibitions-sept-batch1.sql)
1. ✅ **오수환: 천 개의 대화** (가나아트센터) - 완료
2. ⏳ 조주현 (페이토 갤러리) - 8/29~9/27 - 정보 대기중
3. ⏳ 백경호 (눈 컨템포러리) - 8/29~9/29 - 정보 대기중  
4. ⏳ 김형대 (금산갤러리) - 8/29~9/30 - 정보 대기중
5. ⏳ Nude: Flesh & Love (제이슨함) - 8/30~10/30 - 정보 대기중

## 🔄 다음 작업 목록

### 1. 전시 정보 수집 (2-29번)
각 전시별로 필요한 정보:
- **필수 정보**
  - venue_id (venues 테이블 참조)
  - start_date, end_date
  - ticket_price_adult, ticket_price_student
  - genre, exhibition_type
  - source_url (웹페이지)
  - instagram_url (인스타그램)

- **번역 정보 (한글/영문)**
  - exhibition_title
  - artists (배열)
  - description
  - venue_name
  - operating_hours
  - ticket_info
  - phone_number, address

### 2. SQL Batch 파일 생성
- Batch 2 (6-10번): exhibitions-sept-batch2.sql
- Batch 3 (11-15번): exhibitions-sept-batch3.sql
- Batch 4 (16-20번): exhibitions-sept-batch4.sql
- Batch 5 (21-25번): exhibitions-sept-batch5.sql
- Batch 6 (26-29번): exhibitions-sept-batch6.sql

### 3. 전시 목록 (9월 이후 시작)
총 29개 전시 대상:
1. 오수환: 천 개의 대화 (가나아트센터) ✅
2. 조주현 (페이토 갤러리)
3. 백경호 (눈 컨템포러리)
4. 김형대 (금산갤러리)
5. Nude: Flesh & Love (제이슨함)
6-29. [나머지 전시 정보 추가 필요]

## 💡 작업 재개 시 체크리스트

1. **현재 파일 위치**
   - `exhibitions-sept-batch1.sql` - 1번만 완료, 2-5번 대기
   - 나머지 batch 파일들은 아직 생성 안됨

2. **데이터베이스 상태**
   - venues 테이블: 정리 완료 ✅
   - exhibitions_master: instagram_url 컬럼 추가 완료 ✅
   - 외래키 제약: venues 테이블 참조로 업데이트 완료 ✅

3. **다음 단계**
   ```bash
   # 1. 전시 정보 수집
   # 2. exhibitions-sept-batch1.sql 완성 (2-5번 추가)
   # 3. 새 batch 파일 생성 및 작성
   # 4. 각 batch SQL 실행
   ```

## 📌 주의사항

- SQL 파일은 5개씩 나누어서 관리 (너무 길면 문제 발생)
- venue_id는 반드시 venues 테이블의 name으로 조회
- 모든 날짜는 'YYYY-MM-DD' 형식
- artists는 PostgreSQL 배열 형식 (ARRAY['아티스트명'])
- 없는 정보는 NULL 처리

## 🔗 관련 파일

- `exhibitions-sept-batch1.sql` - 첫 번째 배치 (1-5번)
- `batch-exhibitions-update-backup.sql` - 기존 데이터 참고용
- `fix-rls-and-migrate.sql` - venues 마이그레이션 SQL