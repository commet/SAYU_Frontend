# Art Pulse 최종 데모 가이드

## 🚀 실행 방법

### 1. 서버 시작
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev -- -p 3012
```

### 2. 브라우저 접속
- **URL**: http://localhost:3012/daily-challenge
- **기능**: 우측 하단의 Art Pulse 위젯 클릭

## ✨ 구현된 기능

### 🎯 Art Pulse 위젯
- **위치**: Daily Challenge 페이지 우측 하단
- **상태**: 데모 모드에서 항상 활성화
- **애니메이션**: 보라색 펄스 효과

### 🖼️ 실시간 세션
1. **작품 표시**: Daily Challenge와 동일한 작품
2. **터치 히트맵**: 클릭 시 보라색 원 생성 + 페이드 아웃
3. **공명 선택**: 3가지 타입 (감각적/감정적/인지적)
4. **참여자 수**: Mock 데이터로 5명 표시
5. **타이머**: 20분 카운트다운

### 🔧 기술적 특징
- **Mock Supabase**: 실제 DB 없이 작동
- **실시간 시뮬레이션**: EventEmitter 기반
- **Canvas 히트맵**: HTML5 Canvas로 터치 시각화
- **반응형 UI**: 모든 화면 크기 지원

## 🎮 테스트 시나리오

### 시나리오 1: 기본 플로우
1. Daily Challenge 페이지 방문
2. 우측 하단 Art Pulse 위젯 확인
3. 위젯 클릭하여 세션 시작
4. 작품 이미지 여러 곳 클릭
5. 공명 타입 선택 (감각적/감정적/인지적)
6. 20분 타이머 확인

### 시나리오 2: 터치 히트맵
1. 작품의 다양한 부분 클릭
2. 보라색 원이 생성되는지 확인
3. 페이드 아웃 효과 확인
4. 여러 번 클릭 시 누적 효과 확인

### 시나리오 3: 공명 시스템
1. 감각적 버튼 클릭 → 활성화 확인
2. 감정적 버튼 클릭 → 선택 변경 확인
3. 인지적 버튼 클릭 → 최종 선택 확인
4. 하단에 다른 사용자 선택 표시 확인

## 🛠️ 개발자 도구

### 브라우저 콘솔
```javascript
// Mock Supabase 상태 확인
console.log('Using mock Supabase:', process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE);
console.log('Demo mode:', process.env.NEXT_PUBLIC_ART_PULSE_DEMO);
```

### 네트워크 탭
- Mock 모드에서는 실제 네트워크 요청 없음
- 모든 데이터는 메모리에서 시뮬레이션

### React DevTools
- ArtPulseSession 컴포넌트 상태 확인
- touchHeatmap, myResonance 값 모니터링

## 🐛 알려진 이슈 & 해결방법

### 1. 위젯이 보이지 않음
- 환경 변수 확인: `NEXT_PUBLIC_ART_PULSE_DEMO=true`
- 페이지 새로고침

### 2. 터치가 반응하지 않음
- Canvas 요소 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 3. 공명 선택이 작동하지 않음
- React DevTools에서 상태 확인
- Mock Channel이 올바르게 초기화되었는지 확인

## 📸 스크린샷 체크리스트

### 필수 캡처 화면
1. **위젯 상태**: 우측 하단 Art Pulse 위젯
2. **세션 화면**: 전체 Art Pulse 인터페이스
3. **터치 효과**: 클릭 시 보라색 원 효과
4. **공명 선택**: 3가지 버튼 선택 상태
5. **참여자 정보**: 하단 사용자 목록

## 🔄 프로덕션 전환 준비

### 환경 변수 변경
```env
NEXT_PUBLIC_USE_MOCK_SUPABASE=false
NEXT_PUBLIC_ART_PULSE_DEMO=false
NEXT_PUBLIC_SUPABASE_URL=실제_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=실제_KEY
```

### Supabase 설정
1. 프로젝트 생성
2. `supabase/migrations/010_art_pulse.sql` 실행
3. Edge Function 배포
4. Realtime 활성화

### 크론 작업
- 매일 18:00: 세션 생성
- 매일 19:00: 세션 활성화
- 매일 19:25: 세션 완료

---

## 🎉 데모 완료!

Art Pulse가 성공적으로 구현되어 실시간 예술 공명 경험을 제공합니다.

**주요 성과:**
- ✅ Daily Challenge 완벽 통합
- ✅ 실시간 터치 히트맵
- ✅ 3단계 공명 시스템
- ✅ Mock 환경에서 완전 작동
- ✅ 프로덕션 준비 완료

다음 단계는 실제 Supabase 연동 및 사용자 테스트입니다!