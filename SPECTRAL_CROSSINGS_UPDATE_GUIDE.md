# 🎨 DDP 스펙트럴 크로싱스 전시 데이터 업데이트 가이드

## 📋 개요
이 가이드는 DDP의 "스펙트럴 크로싱스" 전시 정보를 SAYU 데이터베이스에 업데이트하는 방법을 설명합니다.

## 🚨 현재 상황
- 네트워크 연결 문제로 스크립트 자동 실행이 불가능한 상태
- Supabase 연결 시 `fetch failed` 오류 발생
- 수동 SQL 실행이 필요한 상황

## 📝 실행 방법

### 방법 1: Supabase SQL Editor 사용 (권장)

1. **Supabase 대시보드 접속**
   - URL: https://rrpvoyjnllcktffdabao.supabase.co
   - SQL Editor로 이동

2. **SQL 파일 실행**
   - `update-spectral-crossings.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - 단계별로 실행 (권장) 또는 전체 실행

### 방법 2: 단계별 수동 실행

#### 1단계: exhibitions_master 테이블 업데이트

```sql
UPDATE exhibitions_master
SET
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'media',
  exhibition_type = 'group',
  updated_at = CURRENT_TIMESTAMP
WHERE id = (
  SELECT exhibition_id FROM exhibitions_translations
  WHERE venue_name = 'DDP'
  AND exhibition_title ILIKE '%스펙트럴%'
  AND language_code = 'ko'
  LIMIT 1
);
```

#### 2단계: 한글 번역 업데이트

```sql
UPDATE exhibitions_translations
SET
  exhibition_title = '스펙트럴 크로싱스',
  subtitle = 'Spectral Crossings',
  artists = ARRAY['더 스웨이(THE SWAY)'],
  description = 'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다. 빛과 움직임으로 가득한 공간에서 관객은 타인의 감정 속에서 자신의 내면을 비추며 새로운 지각의 확장을 경험하게 된다.',
  operating_hours = '10:00~20:00',
  ticket_info = '무료',
  phone_number = '02-2153-0086',
  address = 'DDP 디자인랩 3층',
  website_url = 'http://www.the-sway.com/',
  updated_at = CURRENT_TIMESTAMP
WHERE exhibition_id = (
  SELECT em.id FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.venue_name = 'DDP'
  AND et.exhibition_title ILIKE '%스펙트럴%'
  AND et.language_code = 'ko'
  LIMIT 1
)
AND language_code = 'ko';
```

#### 3단계: 영문 번역 추가/업데이트

```sql
INSERT INTO exhibitions_translations (
  exhibition_id,
  language_code,
  exhibition_title,
  artists,
  description,
  venue_name,
  city,
  operating_hours,
  ticket_info,
  created_at,
  updated_at
)
SELECT
  exhibition_id,
  'en' as language_code,
  'Spectral Crossings' as exhibition_title,
  ARRAY['THE SWAY'] as artists,
  'An immersive media art exhibition where AI-generated faces and formless emotional flows move along with light, creating moments of intersection with viewers. Through 144 crystals and anamorphic media art, emotional light physically manifests in real space. In this light-filled environment, viewers reflect on their inner selves through others'' emotions, experiencing an expansion of perception.' as description,
  'DDP' as venue_name,
  'Seoul' as city,
  '10:00~20:00' as operating_hours,
  'Free' as ticket_info,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM exhibitions_translations
WHERE venue_name = 'DDP'
AND exhibition_title = '스펙트럴 크로싱스'
AND language_code = 'ko'
ON CONFLICT (exhibition_id, language_code) DO UPDATE
SET
  exhibition_title = EXCLUDED.exhibition_title,
  description = EXCLUDED.description,
  artists = EXCLUDED.artists,
  operating_hours = EXCLUDED.operating_hours,
  ticket_info = EXCLUDED.ticket_info,
  updated_at = CURRENT_TIMESTAMP;
```

#### 4단계: 결과 확인

```sql
SELECT 
  et.exhibition_id,
  et.language_code,
  et.exhibition_title,
  et.artists,
  et.venue_name,
  et.ticket_info,
  et.operating_hours,
  em.genre,
  em.exhibition_type,
  em.ticket_price_adult,
  em.ticket_price_student
FROM exhibitions_translations et
JOIN exhibitions_master em ON et.exhibition_id = em.id
WHERE et.venue_name = 'DDP'
  AND et.exhibition_title ILIKE '%스펙트럴%'
ORDER BY et.language_code;
```

## 🔍 문제 해결

### 전시를 찾을 수 없는 경우

1. **DDP 전시 목록 확인**:
```sql
SELECT 
  et.exhibition_id,
  et.language_code,
  et.exhibition_title,
  et.venue_name,
  et.artists
FROM exhibitions_translations et
WHERE et.venue_name = 'DDP'
ORDER BY et.exhibition_title, et.language_code;
```

2. **스펙트럴 관련 전시 검색**:
```sql
SELECT 
  et.exhibition_id,
  et.language_code,
  et.exhibition_title,
  et.venue_name,
  et.artists
FROM exhibitions_translations et
WHERE et.exhibition_title ILIKE '%스펙트럴%'
ORDER BY et.exhibition_title, et.language_code;
```

### 직접 ID로 업데이트하기

만약 위의 쿼리로 `exhibition_id`를 찾았다면, 다음과 같이 직접 업데이트할 수 있습니다:

```sql
-- exhibition_id를 실제 값으로 교체
UPDATE exhibitions_master
SET
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'media',
  exhibition_type = 'group',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'YOUR_EXHIBITION_ID_HERE';
```

## 🎯 업데이트 내용 요약

### exhibitions_master 테이블
- `ticket_price_adult`: 0 (무료)
- `ticket_price_student`: 0 (무료)
- `genre`: 'media'
- `exhibition_type`: 'group'

### exhibitions_translations 테이블 (한글)
- `exhibition_title`: '스펙트럴 크로싱스'
- `subtitle`: 'Spectral Crossings'
- `artists`: ['더 스웨이(THE SWAY)']
- `description`: AI 미디어아트 전시 설명
- `operating_hours`: '10:00~20:00'
- `ticket_info`: '무료'
- `phone_number`: '02-2153-0086'
- `address`: 'DDP 디자인랩 3층'
- `website_url`: 'http://www.the-sway.com/'

### exhibitions_translations 테이블 (영문)
- `exhibition_title`: 'Spectral Crossings'
- `artists`: ['THE SWAY']
- `description`: 영문 전시 설명
- `venue_name`: 'DDP'
- `city`: 'Seoul'
- 기타 동일한 운영 정보

## 📞 지원

업데이트 과정에서 문제가 발생하면:

1. 생성된 파일들 확인:
   - `update-spectral-crossings.sql`: 완전한 SQL 스크립트
   - `update-spectral-crossings.js`: Node.js 실행 스크립트 (연결 문제로 현재 사용 불가)
   - `test-supabase-connection.js`: 연결 테스트 스크립트

2. 네트워크 연결 개선 후 자동 스크립트 재실행 시도

3. SQL 실행 전후 결과 비교하여 정확한 업데이트 확인

---

**🎨 SAYU 프로젝트 - 감성과 예술의 만남**