# 🎯 SAYU 초간단 작업 가이드

## 🔥 가장 간단한 방법 (추천!)

### 1️⃣ 작업 시작할 때
**`start-dev.bat` 더블클릭** → 끝!
- 자동으로 최신 코드 받아옴
- 의존성 자동 설치
- 서버 자동 실행

### 2️⃣ 작업 끝날 때
**GitHub Desktop 사용:**
1. 변경사항 확인
2. 커밋 메시지 입력
3. "Commit to main" 클릭
4. "Push origin" 클릭

---

## 🛠️ 초기 설정 (처음 한 번만)

### 데스크톱에서:
```bash
# 1. 프로젝트 클론
git clone https://github.com/commet/SAYU.git

# 2. 환경 변수 파일 복사
# 노트북에서 이 파일들 복사해오기:
# - frontend/.env.local
# - backend/.env
```

### 그 다음부터는:
- **작업 시작**: `start-dev.bat` 더블클릭
- **작업 종료**: GitHub Desktop으로 커밋 & 푸시

---

## 💡 더 간단한 대안들

### 옵션 1: VS Code 사용
1. VS Code에서 프로젝트 열기
2. 터미널에서 `npm run sync` (별칭 설정 후)
3. Source Control 탭에서 커밋 & 푸시

### 옵션 2: 단축키 설정
Windows PowerShell에 별칭 추가:
```powershell
# $PROFILE 파일에 추가
function sayu { cd C:\Users\YourName\Documents\GitHub\SAYU; .\start-dev.bat }
```
그러면 `sayu` 입력만으로 시작!

---

## ⚡ 문제 해결

### "module not found" 에러?
→ `sync.bat` 더블클릭

### 코드가 최신이 아님?
→ GitHub Desktop에서 "Fetch origin" → "Pull origin"

### 서버가 안 켜짐?
→ 포트 확인 (3000, 5000번 사용 중인지)

---

## 🎮 원클릭 설정 (고급)

### Windows 작업 스케줄러 활용:
1. 작업 스케줄러 열기
2. "기본 작업 만들기"
3. 트리거: "로그온할 때"
4. 동작: `C:\...\SAYU\start-dev.bat`

→ 컴퓨터 켜면 자동으로 SAYU 개발환경 시작!