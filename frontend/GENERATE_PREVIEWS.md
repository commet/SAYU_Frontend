# 🎨 AI Art Style Preview 생성 가이드

## 🚀 빠른 시작

### 1. 간단한 버전 (권장)
```bash
npm run generate-previews:simple
```

### 2. 고품질 버전 (Replicate API 필요)
```bash
# 환경변수 설정
export REPLICATE_API_TOKEN=your_token_here

# 실행
npm run generate-previews
```

## 📋 체크리스트

### 생성 전 준비사항
- [ ] Node.js 18+ 설치
- [ ] 프로젝트 의존성 설치 (`npm install`)
- [ ] `public/samples/` 폴더 존재 확인

### 생성 후 확인사항
- [ ] `public/samples/base-portrait.jpg` 파일 존재
- [ ] 8개 스타일 프리뷰 이미지 존재
- [ ] 각 이미지 크기 약 300x300px
- [ ] 브라우저에서 이미지 로딩 확인

## 🔧 문제 해결

### 에러: "canvas 모듈을 찾을 수 없습니다"
```bash
npm install canvas
```

### 에러: "REPLICATE_API_TOKEN이 없습니다"
```bash
# Linux/Mac
export REPLICATE_API_TOKEN=your_token

# Windows
set REPLICATE_API_TOKEN=your_token
```

### 에러: "이미지 생성 실패"
1. 인터넷 연결 확인
2. API 토큰 유효성 확인
3. 간단한 버전 사용: `npm run generate-previews:simple`

## 🎯 결과 확인

생성 완료 후 다음 위치에서 확인:
- 파일: `public/samples/preview-*.jpg`
- 브라우저: `http://localhost:3000/samples/preview-monet.jpg`
- 컴포넌트: `StylePreviewGrid`에서 자동 사용

## 💡 팁

1. **개발 중**: 간단한 버전 사용
2. **프로덕션**: 고품질 버전 사용
3. **업데이트**: 새 스타일 추가 시 재생성
4. **백업**: 생성된 이미지를 Git에 커밋

---

생성 완료 후 AI 아트 프로필 기능이 완전히 동작합니다! 🎉