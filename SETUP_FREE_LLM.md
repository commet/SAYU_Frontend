# 무료 LLM API 설정 가이드

## 1. Groq API (가장 추천) 🔥

### 장점
- ✅ **완전 무료**: 분당 30 요청, 일일 14,400 요청
- ✅ **초고속**: 초당 500+ 토큰 생성
- ✅ **고품질 모델**: Llama 3, Mixtral 등 최신 오픈소스 모델
- ✅ **안정적**: 대기업 지원 서비스

### 설정 방법

1. **API 키 발급**
   - https://console.groq.com 방문
   - 무료 계정 생성
   - API Keys 섹션에서 키 생성

2. **패키지 설치**
   ```bash
   cd frontend
   npm install groq-sdk
   ```

3. **환경 변수 설정**
   ```env
   # frontend/.env.local
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   ```

4. **사용하기**
   - 기존 `/api/chatbot` 대신 `/api/chatbot-groq` 사용
   - 또는 기존 route를 Groq로 교체

## 2. Together AI

### 장점
- ✅ $25 무료 크레딧
- ✅ 다양한 모델 선택 가능
- ✅ 매우 저렴한 가격 ($0.0001/1K 토큰)

### 설정 방법

1. **API 키 발급**
   - https://api.together.xyz 방문
   - 계정 생성 후 $25 크레딧 자동 지급
   - API 키 생성

2. **패키지 설치**
   ```bash
   npm install together-ai
   ```

3. **환경 변수 설정**
   ```env
   TOGETHER_API_KEY=xxxxxxxxxxxxx
   ```

## 3. Cloudflare Workers AI

### 장점
- ✅ 일일 10,000 요청 무료
- ✅ Edge에서 실행 (빠른 응답)
- ✅ Cloudflare 인프라 활용

### 설정 방법

1. **Cloudflare 계정 설정**
   - https://dash.cloudflare.com 가입
   - Workers & Pages 생성
   - AI 섹션에서 API 토큰 생성

2. **사용하기**
   ```typescript
   const response = await fetch(
     'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct',
     {
       headers: { 'Authorization': 'Bearer {API_TOKEN}' },
       method: 'POST',
       body: JSON.stringify({ messages })
     }
   );
   ```

## 4. HuggingFace Inference API

### 장점
- ✅ 제한적 무료 사용
- ✅ 수천 개 모델 접근
- ✅ 커뮤니티 지원

### 설정 방법

1. **API 키 발급**
   - https://huggingface.co 가입
   - Settings > Access Tokens에서 생성

2. **패키지 설치**
   ```bash
   npm install @huggingface/inference
   ```

3. **사용하기**
   ```typescript
   import { HfInference } from '@huggingface/inference'
   const hf = new HfInference(process.env.HF_TOKEN)
   ```

## 비용 비교

| 서비스 | 무료 한도 | 이후 가격 | 속도 | 품질 |
|--------|----------|-----------|------|------|
| Groq | 14,400/일 | $0.05/M | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Together | $25 크레딧 | $0.0001/1K | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cloudflare | 10,000/일 | $0.01/1K | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| HuggingFace | 제한적 | Pay-as-you-go | ⭐⭐⭐ | ⭐⭐⭐ |
| Google Gemini | 60/분 | $0.075/M | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 추천 전략

1. **개발/테스트**: Groq API (완전 무료)
2. **프로덕션 초기**: Groq + Together AI 병행
3. **스케일업 시**: Together AI 또는 Cloudflare Workers AI
4. **엔터프라이즈**: 자체 모델 호스팅 고려

## 현재 SAYU 적용 방법

1. Groq API 키 발급
2. `frontend/.env.local`에 추가:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   ```
3. frontend에서 설치:
   ```bash
   npm install groq-sdk
   ```
4. 프론트엔드 API route 교체:
   - `/api/chatbot` → `/api/chatbot-groq`
   - 또는 기존 route 수정

이제 Gemini API 비용 걱정 없이 무료로 사용할 수 있습니다! 🎉