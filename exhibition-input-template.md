# 전시 데이터 입력 가이드

## 🎯 입력 전략

### 1단계: 핵심 정보만 (필수)
- exhibition_title
- venue_name  
- start_date
- end_date

### 2단계: 기본 정보 추가
- artists
- exhibition_type (solo/group/special/biennale)
- genre (contemporary/painting/photography/craft/design/media)
- city (기본값: 서울)

### 3단계: 상세 정보 보완
- description (2-3문장)
- ticket_price
- address
- operating_hours
- website_url

## 📝 빠른 입력 템플릿

```javascript
{
  exhibition_title: "",
  venue_name: "",
  start_date: "2025-",
  end_date: "2025-",
  status: "ongoing", // 자동 계산 가능
  exhibition_type: "", // solo/group/special/biennale
  genre: "", // contemporary/painting/photography 등
  priority_order: 50,
  artists: [],
  city: "서울"
}
```

## 🏢 주요 미술관/갤러리 목록 (복사용)

### 국공립
- 국립현대미술관 서울
- 국립현대미술관 과천
- 국립현대미술관 덕수궁
- 서울시립미술관
- 서울시립 북서울미술관
- 서울시립 남서울미술관

### 주요 사립
- 리움미술관
- 아모레퍼시픽미술관
- 대림미술관
- 아트선재센터
- 일민미술관
- 송은
- 호암미술관

### 대형 전시공간
- 예술의전당 한가람미술관
- DDP (동대문디자인플라자)
- 코엑스

### 주요 갤러리
- 국제갤러리
- 갤러리현대
- PKM갤러리
- 페이스갤러리
- 타데우스 로팍
- 페로탕
- 글래드스톤갤러리
- 리만머핀
- 에스더쉬퍼
- 박여숙화랑
- 가나아트센터
- 화이트스톤갤러리

## 🗓️ 날짜별 전시 정리 (144개)

### 8월 종료 (45개)
이미 종료된 전시들 - 우선순위 낮음

### 진행중/9월 시작 주요 전시 (우선 입력)

#### 국립현대미술관
1. 김창열 회고전 (8.22-12.21)
2. 올해의 작가상 2025 (8.29-2026.2.1)

#### 리움미술관
3. 이불: 1998년 이후 (9.4-2026.1.4)

#### 예술의전당
4. 마르크 샤갈 특별전 (-9.21)
5. 앤서니 브라운 (-9.24)
6. 오랑주리-오르세 특별전 (9.20-2026.1.25)

#### DDP
7. 톰 삭스 (-9.7)
8. 스펙트럴 크로싱스 (8.14-11.16)
9. 장 미셸 바스키아 (9.23-2026.1.31)

#### 아트페어
10. Frieze Seoul (9.3-9.6)
11. Kiaf 서울 (9.3-9.7)

## 💡 입력 팁

1. **우선순위 설정**
   - 1-10: 국립/시립 미술관 주요 전시
   - 11-20: 블록버스터 전시, 아트페어
   - 21-30: 주요 갤러리 전시
   - 31-50: 일반 갤러리 전시
   - 51+: 기타

2. **genre 분류**
   - contemporary: 현대미술 일반
   - painting: 회화
   - photography: 사진
   - media: 미디어아트, 영상
   - sculpture: 조각
   - installation: 설치
   - craft: 공예
   - design: 디자인

3. **exhibition_type**
   - solo: 개인전
   - group: 그룹전
   - special: 특별전 (해외 미술관 소장품 등)
   - biennale: 비엔날레
   - permanent: 상설전

## 🔧 Supabase 직접 입력 방법

1. Supabase 대시보드 > Table Editor
2. exhibitions_clean 테이블 선택
3. Insert Row 클릭
4. 필수 필드만 먼저 입력
5. Save

또는 SQL Editor에서:

```sql
INSERT INTO exhibitions_clean (
  exhibition_title,
  venue_name,
  start_date,
  end_date,
  exhibition_type,
  genre,
  priority_order
) VALUES 
('김창열 회고전', '국립현대미술관 서울', '2025-08-22', '2025-12-21', 'solo', 'contemporary', 1),
('올해의 작가상 2025', '국립현대미술관 서울', '2025-08-29', '2026-02-01', 'group', 'contemporary', 2);
```