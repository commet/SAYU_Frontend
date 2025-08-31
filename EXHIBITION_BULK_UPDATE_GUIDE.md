# 전시 일괄 업데이트 시스템 사용 가이드

## 개요

SAYU의 전시 일괄 업데이트 시스템을 사용하면 CSV나 JSON 형식으로 여러 전시 정보를 한번에 데이터베이스에 업데이트할 수 있습니다.

## 접근 방법

1. **관리자 계정으로 로그인**
2. **관리자 대시보드** (`/admin`) 접속
3. **"일괄 업데이트"** 탭 선택

## 지원 데이터 형식

### CSV 형식
```csv
title_ko,title_en,venue_name,start_date,end_date,description_ko,description_en,curator,genre,exhibition_type,ticket_price_adult,ticket_price_student,poster_url,website_url
김현식 개인전,Kim Hyun-sik Solo Exhibition,갤러리현대,2024-03-01,2024-03-30,현대미술가 김현식의 개인전,Solo exhibition by contemporary artist Kim Hyun-sik,박미진,contemporary,solo,15000,10000,https://example.com/poster.jpg,https://example.com
```

### JSON 형식
```json
[
  {
    "title_ko": "김현식 개인전",
    "title_en": "Kim Hyun-sik Solo Exhibition",
    "venue_name": "갤러리현대",
    "start_date": "2024-03-01",
    "end_date": "2024-03-30",
    "description_ko": "현대미술가 김현식의 개인전",
    "description_en": "Solo exhibition by contemporary artist Kim Hyun-sik",
    "curator": "박미진",
    "genre": "contemporary",
    "exhibition_type": "solo",
    "ticket_price_adult": 15000,
    "ticket_price_student": 10000,
    "poster_url": "https://example.com/poster.jpg",
    "website_url": "https://example.com"
  }
]
```

## 필드 설명

### 필수 필드 (Required)
- **title_ko**: 전시 제목 (한국어)
- **venue_name**: 미술관/갤러리명
- **start_date**: 시작일 (YYYY-MM-DD 형식)
- **end_date**: 종료일 (YYYY-MM-DD 형식)

### 선택 필드 (Optional)
- **title_en**: 영문 제목
- **description_ko**: 한국어 설명
- **description_en**: 영어 설명
- **curator**: 큐레이터명
- **genre**: 장르 (contemporary, painting, sculpture, photography, media, installation, craft, design)
- **exhibition_type**: 전시 유형 (solo, group, special, biennale, permanent)
- **ticket_price_adult**: 성인 입장료 (숫자, 기본값: 0)
- **ticket_price_student**: 학생 입장료 (숫자, 기본값: 0)
- **poster_url**: 포스터 이미지 URL
- **website_url**: 전시 웹사이트 URL

## 사용법

### 1. 템플릿 다운로드
- **CSV 템플릿 다운로드** 또는 **JSON 템플릿 다운로드** 버튼 클릭
- 다운로드된 템플릿 파일을 기반으로 데이터 작성

### 2. 데이터 입력
#### 방법 A: 파일 업로드
1. **파일 업로드** 버튼 클릭
2. CSV, JSON, TXT 파일 선택
3. 파일 내용이 텍스트 영역에 자동으로 로드됨

#### 방법 B: 직접 붙여넣기
1. 텍스트 영역에 CSV 또는 JSON 데이터를 직접 붙여넣기

### 3. 업데이트 실행
1. **CSV로 처리** 또는 **JSON으로 처리** 탭 선택
2. 해당하는 **일괄 업데이트** 버튼 클릭
3. 처리 진행상황 확인
4. 결과 리포트 검토

## 결과 리포트

업데이트 완료 후 다음 정보가 표시됩니다:
- **처리됨**: 총 처리된 전시 수
- **새로 추가**: 새로 삽입된 전시 수
- **업데이트**: 기존 전시에서 업데이트된 수
- **오류**: 처리 중 발생한 오류 수
- **새로 추가된 미술관/갤러리**: 자동으로 생성된 새 미술관 목록
- **오류 목록**: 발생한 오류들의 상세 내용

## 시스템 동작 원리

### 1. 데이터 검증
- 필수 필드 존재 여부 확인
- 날짜 형식 유효성 검사
- 시작일과 종료일의 논리적 관계 확인

### 2. 미술관/갤러리 처리
- 기존 미술관이 있으면 해당 ID 사용
- 새로운 미술관이면 자동으로 생성

### 3. 전시 데이터 처리
- **기존 전시 확인**: 같은 미술관의 같은 시작일로 기존 전시 검색
- **업데이트**: 기존 전시가 있으면 정보 업데이트
- **삽입**: 기존 전시가 없으면 새로 생성

### 4. 다국어 지원
- 마스터 테이블 (`exhibitions_master`)에 언어 중립적 정보 저장
- 번역 테이블 (`exhibitions_translations`)에 언어별 정보 저장
- 한국어는 자동으로 생성, 영어는 제공된 경우에만 생성

## 주의사항

1. **날짜 형식**: 반드시 YYYY-MM-DD 형식 사용 (예: 2024-03-15)
2. **중복 방지**: 같은 미술관의 같은 시작일인 전시는 업데이트됨
3. **자동 미술관 생성**: 존재하지 않는 미술관명을 입력하면 자동으로 새 미술관이 생성됨
4. **대량 처리**: 많은 데이터 처리시 시간이 걸릴 수 있음
5. **오류 처리**: 일부 데이터에 오류가 있어도 나머지 데이터는 정상 처리됨

## API 엔드포인트

### POST `/api/exhibitions/bulk-update`
전시 데이터 일괄 업데이트

**요청 바디:**
```json
{
  "data": "CSV 또는 JSON 문자열",
  "format": "csv" | "json"
}
```

**응답:**
```json
{
  "success": true,
  "processed": 5,
  "inserted": 3,
  "updated": 2,
  "errors": [],
  "details": {
    "exhibitions": [...],
    "newVenues": ["새 미술관 1", "새 미술관 2"]
  }
}
```

### GET `/api/exhibitions/bulk-update?format=csv|json`
템플릿 파일 다운로드

## 문제 해결

### 자주 발생하는 오류

1. **"올바른 시작일 형식이 아닙니다"**
   - 해결: 날짜를 YYYY-MM-DD 형식으로 수정

2. **"시작일이 종료일보다 늦습니다"**
   - 해결: 날짜 순서 확인 및 수정

3. **"제목(title_ko)이 필수입니다"**
   - 해결: 모든 행에 한국어 제목 입력

4. **"미술관명(venue_name)이 필수입니다"**
   - 해결: 모든 행에 미술관/갤러리명 입력

### 성능 최적화

- 한 번에 100개 이하의 전시 데이터 처리 권장
- 대량 데이터는 여러 번에 나누어 처리
- 네트워크 상태가 좋을 때 업로드

## 예제 데이터

실제 사용 가능한 예제 데이터는 템플릿 파일에서 확인할 수 있습니다:
- `/templates/exhibition_template.csv`
- `/templates/exhibition_template.json`

## 지원

문제가 발생하거나 추가 도움이 필요한 경우:
1. 오류 메시지와 처리하려던 데이터를 함께 기록
2. 시스템 관리자에게 문의
3. 필요시 템플릿을 다시 다운로드하여 형식 확인