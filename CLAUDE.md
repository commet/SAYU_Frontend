# SAYU Project Context for Claude

## Project Philosophy & Core Values
SAYU는 단순한 예술 추천 플랫폼이 아닌, 사용자의 내면과 예술을 연결하는 관계 중심 플랫폼입니다. 모든 기능은 사용자의 존엄성과 공감을 최우선으로 설계되어야 합니다.

### 핵심 설계 원칙
- **다층적 감정 모델**: 단순 긍정/부정이 아닌 복잡하고 미묘한 감정 상태 반영
- **16가지 개성 존중**: 각 APT 유형별 고유한 UX/UI와 인터랙션 패턴 구현
- **관계의 깊이**: 표면적 매칭이 아닌 의미 있는 연결 형성
- **공동 창작**: 사용자가 플랫폼과 함께 성장하는 참여적 설계

### 개발 철학
- **완전한 구현**: "TODO" 나 placeholder 없는 실제 동작하는 코드
- **적응적 설계**: 사용자 유형과 상황에 따라 변화하는 인터페이스
- **분산 자율성**: 중앙집중식이 아닌 사용자 주도의 경험 설계
- **Always solve for the MVP instead of feature rich solutions**
- **Prefer quick, working solutions over perfect code**
- **Don't add features I didn't ask for**

### Project Constraints
- All projects are for personal use only, so keep implementations simple

### 버그 수정 원칙
- **리버스 엔지니어링 접근**: 버그 수정할 때는 디버그 로그를 보며 리버스 엔지니어링으로 근본적인 원인을 찾아내
- **상세한 디버깅**: 실마리가 부족할 때는 더 상세한 디버그 로그를 추가해
- **근본적 해결**: 원인을 찾아내서 솔루션을 적용할 때는 원인을 가장 근본적으로 해결할 수 있는 방법을 적용
- **대기 및 보고**: 근본적 해결이 곤란할 때는 일단 상황을 보고하고 대기하며 다음 지시를 기다려
- **임시 방편 금지**: 임시 방편은 절대 NEVER NEVER 사용하지마
- **기존 코드 우선**: "원래 있었다"는 피드백이 있으면 새로 만들지 말고 grep으로 기존 컴포넌트를 찾아 연결
- **import 체인 확인**: 컴포넌트가 정의되어 있어도 실제 import/사용되는지 먼저 확인