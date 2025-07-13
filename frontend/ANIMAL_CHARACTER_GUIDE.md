# 🎨 동물 캐릭터 이미지 추가 가이드

> **IMPORTANT**: This guide follows the authoritative definitions in `/SAYU_TYPE_DEFINITIONS.md`. 
> Always refer to that document for the correct animal mappings.

## 📁 파일 구조

이미지들을 다음 구조로 `public/images/personality-animals/` 폴더에 넣어주세요:

```
frontend/public/images/personality-animals/
├── avatars/           # 작은 아바타 이미지 (128x128px)
│   ├── fox-laef-avatar.png
│   ├── swan-laec-avatar.png
│   ├── owl-lamf-avatar.png
│   └── ...
├── illustrations/     # 상세 일러스트 (300x300px)
│   ├── fox-laef-full.png
│   ├── swan-laec-full.png
│   ├── owl-lamf-full.png
│   └── ...
└── main/             # 기본 캐릭터 이미지 (200x200px)
    ├── fox-laef.png
    ├── swan-laec.png
    ├── owl-lamf.png
    └── ...
```

## 🦊 16가지 유형별 파일명

현재 각 유형에 할당된 동물들:

| 유형 | 동물 | 파일명 접두사 |
|------|------|---------------|
| LAEF | Fox (여우) | `fox-laef` |
| LAEC | Cat (고양이) | `cat-laec` |
| LAMF | Owl (올빼미) | `owl-lamf` |
| LAMC | Turtle (거북이) | `turtle-lamc` |
| LREF | Chameleon (카멜레온) | `chameleon-lref` |
| LREC | Hedgehog (고슴도치) | `hedgehog-lrec` |
| LRMF | Octopus (문어) | `octopus-lrmf` |
| LRMC | Beaver (비버) | `beaver-lrmc` |
| SAEF | Butterfly (나비) | `butterfly-saef` |
| SAEC | Penguin (펭귄) | `penguin-saec` |
| SAMF | Parrot (앵무새) | `parrot-samf` |
| SAMC | Deer (사슴) | `deer-samc` |
| SREF | Dog (강아지) | `dog-sref` |
| SREC | Duck (오리) | `duck-srec` |
| SRMF | Elephant (코끼리) | `elephant-srmf` |
| SRMC | Eagle (독수리) | `eagle-srmc` |

## 📐 이미지 규격

### 1. Avatar (아바타)
- **크기**: 128x128px
- **형식**: PNG (투명 배경 권장)
- **용도**: ID카드, 작은 프로필 표시
- **스타일**: 심플하고 귀여운 스타일

### 2. Main (기본)
- **크기**: 200x200px  
- **형식**: PNG (투명 배경 권장)
- **용도**: 기본 캐릭터 표시
- **스타일**: 적당한 디테일

### 3. Illustration (일러스트)
- **크기**: 300x300px
- **형식**: PNG (투명 배경 권장)
- **용도**: 퀴즈 결과 페이지의 메인 캐릭터
- **스타일**: 상세하고 예술적인 스타일

## 🎨 디자인 가이드라인

### 색상 팔레트
각 성격 유형별로 어울리는 색상을 사용하는 것을 권장합니다:

```css
/* 예시: LAEF (Fox) - 몽환적이고 신비로운 */
- Primary: #8B5A87 (보라빛 갈색)
- Secondary: #D4A574 (따뜻한 금색)
- Accent: #E8D5B7 (크림색)

/* SAEF (Rabbit) - 밝고 활기찬 */
- Primary: #FF6B6B (산호색)
- Secondary: #4ECDC4 (터콰이즈)
- Accent: #FFE66D (밝은 노랑)
```

### 스타일 가이드
1. **일관성**: 모든 캐릭터가 같은 아트 스타일을 유지
2. **표정**: 각 동물의 성격 특성을 반영한 표정
3. **포즈**: 동적이고 생동감 있는 포즈
4. **배경**: 투명 또는 심플한 그라데이션

## 🚀 파일 추가 후 할 일

### 1. 이미지 경로 업데이트

`frontend/data/personality-animals.ts` 파일에서 각 타입별로 이미지 경로를 추가:

```typescript
LAEF: {
  // ... 기존 속성들
  image: '/images/personality-animals/main/fox-laef.png',
  avatar: '/images/personality-animals/avatars/fox-laef-avatar.png',
  illustration: '/images/personality-animals/illustrations/fox-laef-full.png'
},
```

### 2. 빌드 및 테스트

```bash
# 로컬에서 테스트
npm run dev

# 이미지가 올바르게 로드되는지 확인
# - /results 페이지에서 동물 캐릭터 표시
# - 프로필 ID 카드에서 아바타 표시
# - 호환성 페이지에서 동물 이미지 표시
```

## 🔧 문제 해결

### 이미지가 안 보일 때
1. **파일 경로 확인**: `public/images/` 폴더 구조가 올바른지 확인
2. **파일명 확인**: 대소문자와 확장자가 정확한지 확인
3. **캐시 문제**: 브라우저 캐시를 지우고 새로고침
4. **빌드 재시작**: 개발 서버를 재시작

### 이미지 최적화
```bash
# 이미지 압축 (선택사항)
npm install -g imagemin-cli
imagemin public/images/personality-animals/**/*.png --out-dir=public/images/personality-animals/optimized --plugin=pngquant
```

## 💡 사용 예시

```tsx
// 결과 페이지에서
<PersonalityAnimalImage 
  animal={animalCharacter}
  variant="illustration"  // 큰 일러스트 사용
  size="xl"
  className="mx-auto shadow-2xl"
/>

// ID 카드에서
<PersonalityAnimalImage 
  animal={animal}
  variant="avatar"        // 작은 아바타 사용
  size="md"
  className="border-4 border-white/30"
/>

// 선택 화면에서
<AnimalImageGrid
  animals={allAnimals}
  variant="avatar"        // 그리드에서는 아바타 사용
  size="sm"
  onSelect={handleSelect}
/>
```

이제 이미지 파일들을 추가하고 위 가이드를 따라하면 멋진 동물 캐릭터들이 앱에 나타날 것입니다! 🎉