# SAYU 데이터베이스 통합 계획 (2025.08)

## 현재 상황 분석

### 데이터 현황
1. **exhibitions 테이블**: 690개 레코드
   - venue_id 없음: 534개 (77%)
   - 한국 전시: 610개
   - venue_id 있음: 156개 (23%)

2. **venues 테이블**: 963개 레코드
   - 한국 베뉴: 661개

3. **global_exhibitions**: 10개 (거의 비어있음)
4. **global_venues**: 1088개 (venues보다 많음)

### 통합의 난이도: 중상 (7/10)

## 주요 도전 과제

### 1. venue_id 매칭 문제 (가장 어려움)
- 77%의 전시가 venue와 연결되지 않음
- venue_name은 있지만 venue_id가 없는 상태
- 이름으로 매칭해야 하는데 이름 형식이 일치하지 않을 수 있음

### 2. 중복 데이터 처리
- venues (963개) vs global_venues (1088개)
- 같은 장소가 다르게 표기되었을 가능성

### 3. 스키마 차이
- exhibitions vs global_exhibitions 컬럼 구조 차이
- 데이터 타입 불일치 가능성

### 4. 외래키 제약
- 현재 운영 중인 시스템의 FK 관계 유지
- 다른 테이블들이 exhibitions를 참조할 수 있음

## 단계별 통합 계획

### Phase 1: 준비 단계 (1시간)
1. **전체 백업**
   ```sql
   pg_dump -t exhibitions -t venues -t global_exhibitions -t global_venues > backup_$(date +%Y%m%d).sql
   ```

2. **의존성 확인**
   - exhibitions를 참조하는 모든 테이블 확인
   - 실행 중인 API 확인

3. **데이터 품질 분석**
   - venue_name 매칭 가능성 확인
   - 중복 데이터 식별

### Phase 2: 베뉴 통합 (2시간)
1. **venues_unified 생성**
   - 기존 스크립트 활용
   - 인덱스 생성

2. **데이터 마이그레이션**
   - venues → venues_unified
   - global_venues → venues_unified (중복 제거)

3. **이름 정규화**
   - 띄어쓰기, 특수문자 통일
   - 영문/한글 이름 매칭

### Phase 3: 전시 통합 (3시간)
1. **exhibitions_unified 생성**

2. **venue_id 복구 작업** (가장 중요!)
   ```sql
   -- venue_name으로 venue_id 찾기
   UPDATE exhibitions e
   SET venue_id = v.id
   FROM venues_unified v
   WHERE e.venue_id IS NULL
   AND (
     e.venue_name = v.name OR
     e.venue_name = v.name_en OR
     e.venue_name = v.name_ko
   );
   ```

3. **데이터 마이그레이션**
   - exhibitions → exhibitions_unified
   - global_exhibitions → exhibitions_unified

### Phase 4: 검증 및 전환 (1시간)
1. **데이터 정합성 검증**
   - 모든 전시가 이전되었는지
   - venue 연결 상태 확인

2. **뷰 생성** (기존 API 호환)
   ```sql
   CREATE VIEW exhibitions AS SELECT * FROM exhibitions_unified;
   CREATE VIEW venues AS SELECT * FROM venues_unified;
   ```

3. **점진적 전환**
   - 먼저 읽기만 새 테이블로
   - 문제없으면 쓰기도 전환

### Phase 5: 정리 (30분)
1. 구 테이블 이름 변경 (삭제하지 않음)
2. 통계 업데이트
3. 캐시 클리어

## 위험 요소 및 대응책

### 1. venue_id 매칭 실패
- **위험**: 많은 전시가 여전히 venue 없이 남을 수 있음
- **대응**: 
  - 수동 매칭 테이블 준비
  - AI 기반 이름 매칭 고려
  - 매칭 실패한 것은 "Unknown Venue"로 임시 처리

### 2. API 중단
- **위험**: 통합 중 서비스 장애
- **대응**: 
  - 뷰(View) 사용으로 무중단 전환
  - 새벽 시간 작업
  - 롤백 스크립트 준비

### 3. 데이터 손실
- **위험**: 마이그레이션 중 데이터 누락
- **대응**: 
  - 완전 백업 후 작업
  - 단계별 검증
  - 원본 테이블 보존

## 예상 소요 시간
- 준비: 1시간
- 실행: 6시간
- 검증: 1시간
- **총 8시간** (여유있게 잡음)

## 통합 후 이점
1. **단순한 구조**: 4개 → 2개 테이블
2. **성능 향상**: JOIN 감소, 인덱스 최적화
3. **데이터 일관성**: 중복 제거, venue 연결 개선
4. **확장성**: 새로운 기능 추가 용이

## 결론
통합은 **중간 정도의 난이도**이지만, venue_id 매칭 문제가 핵심입니다. 
단계별로 신중하게 진행하면 충분히 가능하며, 장기적으로 큰 이점을 가져올 것입니다.

## 다음 단계
1. venue_name 매칭 테스트 스크립트 작성
2. 이해관계자 동의 얻기
3. 백업 및 롤백 계획 수립
4. 테스트 환경에서 먼저 실행