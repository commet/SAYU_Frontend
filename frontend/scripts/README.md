# AI Art Style Preview Generator

AI 아트 프로필 스타일 선택에 사용할 예시 이미지들을 생성하는 스크립트입니다.

## 🎯 목적

사용자가 AI 아트 프로필 스타일을 선택할 때, 동일한 인물 사진이 각 스타일로 어떻게 변환되는지 미리 볼 수 있도록 예시 이미지를 제공합니다.

## 🔧 두 가지 방법

### 1. 간단한 버전 (CSS 필터 기반)
빠르게 테스트용 이미지를 생성할 수 있습니다.

```bash
# 의존성 설치
npm install canvas

# 스크립트 실행
node scripts/simple-preview-generator.js
```

**장점:**
- 빠른 생성 (1-2분)
- 무료
- 즉시 사용 가능

**단점:**
- 단순한 필터 효과
- 실제 AI 변환과 차이

### 2. 고품질 버전 (Replicate API)
실제 AI 모델을 사용하여 고품질 변환 이미지를 생성합니다.

```bash
# 환경변수 설정
export REPLICATE_API_TOKEN=your_replicate_token

# 의존성 설치
npm install replicate

# 스크립트 실행
node scripts/generate-style-previews.js
```

**장점:**
- 실제 AI 모델 사용
- 고품질 변환 결과
- 정확한 스타일 표현

**단점:**
- 비용 발생 (약 $0.1-0.2 per image)
- 느린 생성 (10-15분)
- API 토큰 필요

## 📂 생성되는 파일들

스크립트 실행 후 `public/samples/` 폴더에 다음 파일들이 생성됩니다:

```
public/samples/
├── base-portrait.jpg          # 원본 인물 사진
├── preview-monet.jpg         # 모네 스타일 변환
├── preview-picasso.jpg       # 피카소 스타일 변환
├── preview-vangogh.jpg       # 반 고흐 스타일 변환
├── preview-warhol.jpg        # 워홀 스타일 변환
├── preview-pixel.jpg         # 픽셀 아트 스타일 변환
├── preview-minhwa.jpg        # 한국 민화 스타일 변환
├── preview-klimt.jpg         # 클림트 스타일 변환
└── preview-mondrian.jpg      # 몬드리안 스타일 변환
```

## 🚀 사용법

1. **개발 초기**: 간단한 버전으로 UI 테스트
2. **프로덕션**: 고품질 버전으로 실제 이미지 생성
3. **업데이트**: 새로운 스타일 추가 시 다시 생성

## 🎨 스타일 추가하기

새로운 스타일을 추가하려면:

1. `stylePrompts` (고품질) 또는 `styleFilters` (간단)에 설정 추가
2. `predefinedStyles` 배열에 스타일 정의 추가
3. 스크립트 재실행

## 📊 비용 계산

Replicate API 사용 시:
- 모델당 약 $0.1-0.2
- 8개 스타일 × $0.15 = 약 $1.2
- 월 1-2회 업데이트 시 연간 약 $15-30

## 🔄 자동화

GitHub Actions를 사용하여 자동 생성:

```yaml
# .github/workflows/generate-previews.yml
name: Generate Style Previews
on:
  schedule:
    - cron: '0 2 * * 1'  # 매주 월요일 오전 2시
  workflow_dispatch:     # 수동 실행

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install replicate
      - name: Generate previews
        env:
          REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}
        run: node scripts/generate-style-previews.js
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/samples/
          git commit -m "Update style preview images" || exit 0
          git push
```

## 🎯 다음 단계

1. 스크립트 실행하여 이미지 생성
2. `StylePreviewGrid` 컴포넌트에서 이미지 확인
3. 필요시 스타일 프롬프트 조정
4. 프로덕션 배포