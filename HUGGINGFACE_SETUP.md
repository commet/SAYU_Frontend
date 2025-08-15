# Hugging Face AI 아트 프로필 설정 가이드 🎨

## 개요
실제로 작동하는 AI 아트 프로필 생성 기능을 위한 Hugging Face API 설정 방법입니다.

## 🚀 빠른 설정 (5분)

### 1. Hugging Face 가입 및 API 키 발급
1. [Hugging Face](https://huggingface.co/) 가입
2. 프로필 → Settings → Access Tokens 이동
3. "New token" 클릭 → "Read" 권한으로 토큰 생성
4. 토큰 복사 (예: `hf_xxxxxxxxxxxxxxxxxxxx`)

### 2. 환경 변수 설정
백엔드 루트 디렉토리에 `.env` 파일 생성:

```bash
# Hugging Face API
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx

# Cloudinary (이미지 저장용)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# 월간 크레딧 제한
ART_PROFILE_FREE_MONTHLY_LIMIT=5
ART_PROFILE_PREMIUM_MONTHLY_LIMIT=50
```

### 3. 서버 재시작
```bash
cd backend
npm restart
```

## 🎯 테스트 방법

### API 상태 확인
```bash
curl -X GET http://localhost:3001/api/art-profile/status \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 실제 이미지 생성 테스트
1. 프론트엔드에서 AI 프로필 페이지 접속
2. 이미지 업로드
3. 스타일 선택 (Van Gogh, Picasso 등)
4. "생성하기" 클릭
5. 30-60초 대기 후 결과 확인

## 📊 사용량 및 제한

### 무료 계정
- **월 1,000회** 무료 생성
- 평균 응답 시간: 10-30초
- 모델 로딩 시간: 최초 2-3분

### 비용 발생 시
- 추가 사용: $0.01-0.05/이미지
- 빠른 응답을 원하면 Dedicated Endpoint 고려

## 🎨 지원하는 스타일

1. **Van Gogh Style** - 소용돌이치는 붓터치
2. **Picasso Cubism** - 기하학적 형태
3. **Monet Impressionism** - 부드러운 색채
4. **Warhol Pop Art** - 대담한 색상
5. **Klimt Art Nouveau** - 황금빛 장식
6. **Studio Ghibli** - 마법적인 애니메이션 스타일
7. **Korean Webtoon** - 깔끔한 디지털 아트
8. **Pixel Art** - 8비트 레트로 스타일

## 🔧 최적화 팁

### 1. 이미지 품질 향상
- 입력 이미지: 512x512 권장
- 얼굴이 명확한 사진 사용
- 밝은 조명의 이미지 선호

### 2. 프롬프트 엔지니어링
각 스타일별로 최적화된 프롬프트가 자동 적용됩니다:

```javascript
// 예시: Van Gogh 스타일
{
  prompt: "oil painting in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, expressive texture",
  negative_prompt: "photograph, realistic, modern, digital art, cartoon",
  strength: 0.75
}
```

### 3. 에러 처리
- **모델 로딩 중**: 2-3분 대기 후 재시도
- **Rate Limit**: 잠시 후 재시도
- **NSFW 감지**: 다른 이미지로 시도

## 🚀 배포 시 고려사항

### Vercel/Netlify 배포
```bash
# 환경 변수 설정
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... 기타 설정
```

### 성능 모니터링
- 응답 시간 추적
- 성공/실패율 모니터링  
- 사용자 피드백 수집

## ❗ 중요 참고사항

1. **개인정보 보호**: 업로드된 이미지는 즉시 처리 후 삭제
2. **콘텐츠 정책**: NSFW 이미지는 자동 차단
3. **상업적 이용**: Hugging Face 이용약관 확인 필요
4. **백업 계획**: API 다운 시 Canvas 효과로 대체

## 🆘 문제 해결

### 자주 발생하는 오류

1. **"Invalid API key"**
   - API 키 재확인
   - 토큰 권한 확인 (Read 권한 필요)

2. **"Model is loading"**  
   - 2-3분 대기 후 재시도
   - 인기 모델은 로딩 시간 단축

3. **"Rate limit exceeded"**
   - 잠시 대기 후 재시도
   - 무료 계정 제한 확인

### 성능 이슈
- 첫 번째 요청은 느릴 수 있음 (모델 로딩)
- 같은 스타일 연속 사용 시 빨라짐
- 피크 시간대 (미국 시간 기준) 다소 느려질 수 있음

---

## 📞 지원

문제 발생 시:
1. 로그 확인: `backend/logs/`
2. API 상태 확인: [Hugging Face Status](https://status.huggingface.co/)
3. 이슈 리포트: GitHub Issues