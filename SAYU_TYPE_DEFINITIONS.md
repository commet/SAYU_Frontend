# SAYU Type System - Authoritative Definitions

This is the **SINGLE SOURCE OF TRUTH** for all SAYU personality type definitions and animal mappings. All files in the project must reference this document to ensure consistency.

Last Updated: 2025-01-13

## SAYU Type System Overview

SAYU is an art personality assessment system based on 4 binary dimensions:

### Dimensions:
1. **L/S** - Viewing Preference
   - **L** = Lone (Individual, introspective, solitary) | 고독한 (개별적, 내성적, 혼자만의)
   - **S** = Social (Shared, interactive, collaborative) | 공유하는 (사회적, 상호작용, 협력적)

2. **A/R** - Perception Style  
   - **A** = Abstract (Atmospheric, impressionistic, symbolic) | 추상 (분위기적, 인상적, 상징적)
   - **R** = Representational (Realistic, concrete, figurative) | 구상 (현실적, 구체적, 구상적)

3. **E/M** - Reflection Type
   - **E** = Emotional (Affective, feeling-based, visceral) | 감정적 (정서적, 감정기반, 직감적)
   - **M** = Meaning-driven (Analytical, rational, interpretive) | 의미 추구 (분석적, 이성적, 해석적)

4. **F/C** - Exploration Style
   - **F** = Flow (Fluid, spontaneous, intuitive) | 흐름 (유동적, 자발적, 직관적)
   - **C** = Constructive (Structured, systematic, organized) | 구조적 (체계적, 조직적, 구성적)

## 16 Personality Types & Animal Mappings

### CORRECT Animal Mappings (DO NOT CHANGE):

| Type | Animal (EN) | Animal (KO) | Title (KO) | Emoji |
|------|-------------|-------------|------------|-------|
| LAEF | Fox | 여우 | 몽환적 방랑자 | 🦊 |
| LAEC | Cat | 고양이 | 감성 큐레이터 | 🐱 |
| LAMF | Owl | 올빼미 | 직관적 탐구자 | 🦉 |
| LAMC | Turtle | 거북이 | 철학적 수집가 | 🐢 |
| LREF | Chameleon | 카멜레온 | 고독한 관찰자 | 🦎 |
| LREC | Hedgehog | 고슴도치 | 섬세한 감정가 | 🦔 |
| LRMF | Octopus | 문어 | 디지털 탐험가 | 🐙 |
| LRMC | Beaver | 비버 | 학구적 연구자 | 🦫 |
| SAEF | Butterfly | 나비 | 감성 나눔이 | 🦋 |
| SAEC | Penguin | 펭귄 | 예술 네트워커 | 🐧 |
| SAMF | Parrot | 앵무새 | 영감 전도사 | 🦜 |
| SAMC | Deer | 사슴 | 문화 기획자 | 🦌 |
| SREF | Dog | 강아지 | 열정적 관람자 | 🐕 |
| SREC | Duck | 오리 | 따뜻한 안내자 | 🦆 |
| SRMF | Elephant | 코끼리 | 지식 멘토 | 🐘 |
| SRMC | Eagle | 독수리 | 체계적 교육자 | 🦅 |

## Image File Naming Convention

All image files should follow this pattern:
- Main images: `/images/personality-animals/main/{animal}-{type}.png`
- Avatars: `/images/personality-animals/avatars/{animal}-{type}-avatar.png`
- Illustrations: `/images/personality-animals/illustrations/{animal}-{type}-full.png`

Where:
- `{animal}` = lowercase English animal name
- `{type}` = lowercase SAYU type (e.g., laef, laec)

### Examples:
- LAEC (Cat): 
  - Main: `/images/personality-animals/main/cat-laec.png`
  - Avatar: `/images/personality-animals/avatars/cat-laec-avatar.png`
  - Illustration: `/images/personality-animals/illustrations/cat-laec-full.png`

## Common Mistakes to Avoid

1. **LAEC is Cat (고양이), NOT Swan** - This is the most common error
2. **LAMC is Turtle (거북이), NOT Elephant** - Elephant is SRMF
3. **LRMF is Octopus (문어), NOT Wolf** - Wolf is not used
4. **SAMC is Deer (사슴), NOT Bee** - Bee is not used
5. **Image paths should match the actual animal names**, not the wrong mappings

## Implementation Checklist

When implementing or updating SAYU types:

1. ✅ Always refer to this document first
2. ✅ Use the correct animal names in code
3. ✅ Ensure image file paths match the animal names
4. ✅ Keep Korean translations consistent
5. ✅ Update all related files simultaneously to avoid inconsistencies

## Files That Must Follow These Definitions

- `/frontend/data/personality-animals.ts`
- `/frontend/ANIMAL_CHARACTER_GUIDE.md`
- `/backend/src/data/sayuEnhancedQuizData.js`
- Any component that displays animal characters
- Any image files in `/public/images/personality-animals/`

---

**NOTE**: This document supersedes any conflicting information in other files. If you find inconsistencies, update those files to match this document, NOT the other way around.