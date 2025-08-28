# SAYU 보안 체크리스트 📋

## ✅ 완료된 보안 조치

### 1. API 키 보안
- [x] 모든 민감한 API 키 서버사이드로 이동
- [x] API Route 프록시 패턴 구현
- [x] 환경변수에서 NEXT_PUBLIC_ 제거
- [x] Vercel 환경변수 업데이트

### 2. Supabase RLS (Row Level Security)
- [x] profiles 테이블 - 사용자 본인만 수정 가능
- [x] art_profiles 테이블 - 소유자만 수정/삭제
- [x] quiz_results 테이블 - 개인 결과 보호
- [x] user_saved_exhibitions - 개인 저장 목록 보호
- [x] exhibition_visits - 방문 기록 보호

## ⚠️ 추가 검토 필요 사항

### 3. XSS (Cross-Site Scripting) 방어
- [ ] dangerouslySetInnerHTML 사용 최소화
  - frontend/app/page-broken.tsx:270
  - frontend/components/ui/FormattedEssence.tsx:52
- [ ] innerHTML 직접 사용 제거
  - frontend/components/share/ShareModal.tsx:403, 431, 465
  - frontend/app/profile/page.tsx:294

### 4. CORS 설정
- [ ] API Route에 적절한 CORS 헤더 설정
- [ ] 허용 도메인 화이트리스트 구현

### 5. Rate Limiting
- [ ] API Route별 rate limiting 구현
- [ ] Redis 캐싱 도입 검토
- [ ] IP 기반 제한 추가

### 6. CSP (Content Security Policy)
- [ ] next.config.js에 CSP 헤더 추가
- [ ] 인라인 스크립트 최소화

### 7. SQL Injection 방어
- [ ] Supabase 쿼리 파라미터 검증
- [ ] Prepared statements 사용 확인

### 8. 인증/세션 보안
- [ ] JWT 토큰 만료 시간 설정
- [ ] Refresh token rotation 구현
- [ ] 세션 하이재킹 방어

### 9. 파일 업로드 보안
- [ ] 파일 타입 검증
- [ ] 파일 크기 제한
- [ ] 악성 파일 스캔

### 10. 보안 헤더
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security

## 🚨 즉시 수정 필요

### innerHTML 사용 부분 (XSS 위험)
```javascript
// 위험한 코드 예시
toast.innerHTML = message.replace('\n', '<br>');  // XSS 위험!

// 안전한 대안
toast.textContent = message;  // 또는 React 컴포넌트 사용
```

## 📊 보안 점수
- **현재: 75/100**
- API 키 보안: ✅ 완료
- RLS: ✅ 설정됨
- XSS 방어: ⚠️ 부분적
- CORS: ⚠️ 미설정
- Rate Limiting: ⚠️ 기본만

## 🎯 다음 단계 권장사항

1. **즉시 (High Priority)**
   - innerHTML 사용 코드 모두 수정
   - CORS 헤더 설정

2. **단기 (Medium Priority)**
   - Rate limiting 강화
   - CSP 헤더 추가

3. **장기 (Low Priority)**
   - 보안 감사 도구 도입
   - 정기적인 의존성 업데이트