# SAYU 의존성 분석 리포트
*생성일: 2025. 7. 28. 오후 7:51:46*

## 🔄 순환 의존성
**발견된 순환**: 0개



## 📊 복잡한 모듈 (상위 10개)
1. `backend\src\server.js`
   - 내부 의존성: 73개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 146

2. `backend\src\routes\museums.js`
   - 내부 의존성: 12개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 24

3. `backend\src\routes\evaluation.js`
   - 내부 의존성: 12개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 24

4. `backend\src\routes\oauth.js`
   - 내부 의존성: 11개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 22

5. `backend\src\server.test.js`
   - 내부 의존성: 10개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 20

6. `backend\src\controllers\quizController.js`
   - 내부 의존성: 10개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 20

7. `frontend\components\art-pulse\ArtPulseViewer.tsx`
   - 내부 의존성: 9개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 18

8. `backend\src\routes\artistPortal.js`
   - 내부 의존성: 9개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 18

9. `backend\src\routes\aptRecommendationRoutes.js`
   - 내부 의존성: 9개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 18

10. `backend\src\controllers\quizController-supabase.js`
   - 내부 의존성: 9개
   - 참조하는 모듈: 0개
   - 복잡도 점수: 18


## 🏝️ 고립된 모듈
- `test-venue-api.js`
- `run-changelog.js`
- `run-changelog-fixed.js`
- `run-changelog-auth.js`
- `ecosystem.config.js`
- `CUsersSAMSUNGDocumentsGitHubSAYUfrontendappartist-portalpage.tsx`
- `check-tags.js`
- `check-tags-v2.js`
- `supabase\functions\_shared\cors.ts`
- `shared\validateSAYUIntegrity.js`

## 💡 권장사항
### 1. 복잡한 모듈 단순화 필요 (medium)
**분류**: complexity
**설명**: 4개의 모듈이 과도하게 복잡합니다.
**조치**: 단일 책임 원칙에 따라 모듈을 분할하고 의존성을 줄이세요
**영향받는 파일**: backend\src\server.js, backend\src\routes\museums.js, backend\src\routes\evaluation.js 외 1개

### 2. 사용되지 않는 모듈 정리 (low)
**분류**: unused-code
**설명**: 10개의 고립된 모듈이 발견되었습니다.
**조치**: 실제로 사용되지 않는다면 제거를 고려하세요
**영향받는 파일**: test-venue-api.js, run-changelog.js, run-changelog-fixed.js 외 7개


## 🎯 우선순위별 조치 계획
1. **긴급 (High)**: 0개 항목
2. **중요 (Medium)**: 1개 항목  
3. **보통 (Low)**: 1개 항목

---
*의존성 분석은 코드 개선의 첫 번째 단계입니다. 단계별로 차근차근 해결해 나가세요.*
