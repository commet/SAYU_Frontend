# 🎨 SAYU Backend API

> **AI 미적 정체성 발견 플랫폼 백엔드**

## ✨ 기능

### 🎯 **퀴즈 API**
- **시나리오 퀴즈**: 황혼의 미술관, 신비한 갤러리
- **성격 분석**: 8축 성격 분석 (L,S,A,R,M,E,F,C)
- **결과 제공**: 개인화된 미적 성향 및 추천

### 🔗 **엔드포인트**
```
GET  /                    # 서비스 정보
GET  /api/health         # 헬스 체크
POST /api/quiz/start     # 퀴즈 시작
POST /api/quiz/answer    # 답변 처리
```

## 🚀 **배포**

### **Railway 배포**
1. **GitHub 리포지토리** 연결
2. **환경변수 설정**:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://sayu-frontend.vercel.app
   ```
3. **자동 배포** 활성화

### **로컬 개발**
```bash
npm install
npm run dev
```

## 🎯 **API 사용법**

### **퀴즈 시작**
```javascript
POST /api/quiz/start
{
  "userPreferences": {}
}
```

### **답변 제출**
```javascript
POST /api/quiz/answer
{
  "sessionId": "quiz_123...",
  "questionId": "twilight_doors",
  "choiceId": "A",
  "choiceText": "소리가 들리는 문"
}
```

## 🔧 **기술 스택**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Utils**: UUID, dotenv

## 📱 **프론트엔드 연결**
- **Vercel**: `https://sayu-frontend.vercel.app`
- **CORS**: 자동 허용 설정
- **API 호출**: `/api/*` 엔드포인트

---

**🎉 완전히 새로운 SAYU 백엔드 - 안정적이고 확장 가능한 구조!**