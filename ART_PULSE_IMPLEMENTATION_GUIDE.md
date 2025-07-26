# Art Pulse 구현 가이드

## 개요
Art Pulse는 매일 저녁 7시부터 20분간 진행되는 실시간 예술 공명 경험입니다. Daily Challenge의 작품을 활용하여 사용자들이 동시에 접속해 예술 작품에 대한 즉각적인 반응을 공유합니다.

## 구현 완료 사항

### 1. 컴포넌트
- **ArtPulseSession.tsx**: 메인 세션 컴포넌트
  - 실시간 터치 히트맵
  - 공명 타입 선택 (감각적/감정적/인지적)
  - 참여자 수 표시
  - 세션 단계별 UI (대기/미리보기/활성/결과)

- **ArtPulseWidget.tsx**: 플로팅 위젯
  - 세션 시작 알림
  - 실시간 상태 표시
  - 클릭하여 세션 열기

### 2. API 통합
- **art-pulse.ts**: Art Pulse API 클라이언트
  - 세션 관리
  - 참여 기록
  - 분석 데이터 수집

### 3. 타입 정의
- **art-pulse.ts (types)**: TypeScript 타입 정의
  - 세션, 참여, 터치 데이터 등

### 4. Daily Challenge 통합
- Daily Challenge 카드에 Art Pulse 위젯 추가
- 같은 작품을 다른 방식으로 경험

### 5. 데이터베이스
- Supabase 마이그레이션 파일 생성
- Edge Function으로 세션 관리
- RLS 정책 설정

## 설정 방법

### 1. 환경 변수 설정
```env
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ENABLE_ART_PULSE=true
```

### 2. Supabase 설정
1. Supabase 프로젝트 생성
2. SQL 마이그레이션 실행: `supabase/migrations/010_art_pulse.sql`
3. Edge Function 배포: `supabase functions deploy manage-art-pulse`

### 3. 일일 세션 자동 생성
크론 작업 또는 스케줄러로 매일 실행:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/manage-art-pulse \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "create_daily_session"}'
```

## 주요 기능

### 1. 실시간 상호작용
- Supabase Broadcast Channel 사용
- 터치 포인트 실시간 공유
- 참여자 presence 추적

### 2. 시간 제한 세션
- 19:00-19:05: 미리보기
- 19:05-19:25: 활성 세션
- 19:25-19:30: 결과 확인

### 3. 데이터 수집
- 터치 히트맵
- 공명 타입 분포
- APT 타입별 참여율
- 평균 체류 시간

## 향후 개선 사항

1. **모바일 최적화**
   - 터치 제스처 개선
   - 반응형 캔버스

2. **고급 분석**
   - 실시간 감정 웨이브
   - APT 타입별 패턴 분석

3. **게임화 요소**
   - 연속 참여 배지
   - 공명 점수 시스템

4. **위젯 확장**
   - iOS/Android 네이티브 위젯
   - 데스크톱 알림

## 테스트 방법

1. 개발 서버 실행
```bash
cd frontend
npm run dev
```

2. Daily Challenge 페이지 접속
3. 시스템 시간을 19:00로 설정하거나 코드에서 시간 체크 부분 수정
4. Art Pulse 위젯 클릭하여 세션 참여

## 문제 해결

### Supabase 연결 오류
- 환경 변수 확인
- Supabase 프로젝트 URL과 키 재확인

### 실시간 업데이트 안됨
- Realtime이 활성화되어 있는지 확인
- 브라우저 콘솔에서 WebSocket 연결 확인

### 세션이 생성되지 않음
- Edge Function 로그 확인
- Daily Challenge가 존재하는지 확인