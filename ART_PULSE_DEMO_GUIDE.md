# Art Pulse 데모 실행 가이드

## 빠른 시작

1. **환경 설정**
   ```bash
   cd frontend
   # .env.local 파일이 이미 생성되어 있음
   # NEXT_PUBLIC_USE_MOCK_SUPABASE=true (Mock 사용)
   # NEXT_PUBLIC_ART_PULSE_DEMO=true (시간 제한 없음)
   ```

2. **서버 실행**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev -- -p 3011
   ```

3. **브라우저에서 확인**
   - http://localhost:3011/daily-challenge 접속
   - 우측 하단에 Art Pulse 위젯 확인
   - 위젯 클릭하여 세션 시작

## 데모 모드 특징

### 1. Mock Supabase
- 실제 Supabase 연결 없이 로컬에서 작동
- 메모리 기반 실시간 동기화 시뮬레이션
- 테스트용 데이터 자동 생성

### 2. 시간 제한 해제
- 원래: 매일 19:00-19:25만 활성화
- 데모: 언제든지 테스트 가능
- 20분 타이머는 그대로 작동

### 3. 인증 간소화
- 로그인 없이 데모 유저로 자동 참여
- APT 타입: LAEF (여우)로 기본 설정

## 주요 기능 테스트

### 1. 터치 히트맵
- 작품 이미지를 클릭하면 보라색 원이 나타남
- 다른 사용자의 터치도 실시간으로 표시 (Mock에서는 시뮬레이션)

### 2. 공명 타입 선택
- 감각적 / 감정적 / 인지적 중 선택
- 선택한 타입이 하단에 표시됨

### 3. 실시간 참여자 수
- Mock 모드에서는 5명으로 고정
- 실제 환경에서는 동적으로 변경

### 4. 세션 단계
- 활성: 터치 및 공명 선택 가능
- 결과: 통계 및 분석 표시

## 문제 해결

### 포트 충돌
```bash
# 다른 포트 사용
npm run dev -- -p 3012
```

### 환경 변수 확인
```bash
# frontend/.env.local
NEXT_PUBLIC_USE_MOCK_SUPABASE=true
NEXT_PUBLIC_ART_PULSE_DEMO=true
```

### 캐시 문제
```bash
# Next.js 캐시 삭제
rm -rf .next
npm run dev
```

## 프로덕션 전환

1. **Supabase 설정**
   - 프로젝트 생성
   - 마이그레이션 실행
   - 환경 변수 업데이트

2. **환경 변수 변경**
   ```env
   NEXT_PUBLIC_USE_MOCK_SUPABASE=false
   NEXT_PUBLIC_ART_PULSE_DEMO=false
   NEXT_PUBLIC_SUPABASE_URL=실제_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=실제_KEY
   ```

3. **Edge Function 배포**
   ```bash
   supabase functions deploy manage-art-pulse
   ```

4. **크론 작업 설정**
   - 매일 18:00에 세션 생성
   - 19:00, 19:25에 상태 업데이트

## 스크린샷 위치

테스트 중 캡처한 스크린샷은 다음 위치에 저장:
- `/screenshots/art-pulse-widget.png`
- `/screenshots/art-pulse-session.png`
- `/screenshots/art-pulse-results.png`