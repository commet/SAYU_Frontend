# 🖥️ GitHub Desktop만으로 SAYU 작업하기

## 🚀 초기 설정

### 1. GitHub Desktop에서 클론하기
1. GitHub Desktop 실행
2. "Clone a repository" 클릭
3. URL 탭에서 `https://github.com/commet/SAYU.git` 입력
4. 저장할 폴더 선택 (예: `C:\Users\[사용자명]\Documents\GitHub\SAYU`)
5. "Clone" 클릭

### 2. 환경 변수 파일 설정
**노트북에서 복사해올 파일들:**
- `frontend/.env.local`
- `backend/.env`

**GitHub Desktop에서 파일 위치 열기:**
1. Repository → Show in Explorer
2. 해당 위치에 환경 변수 파일 붙여넣기

## 💻 개발 작업 흐름

### 1. 최신 코드 받기 (작업 시작 전)
- **Fetch origin** 버튼 클릭
- 변경사항이 있으면 **Pull origin** 클릭

### 2. 코드 수정
- VS Code나 원하는 에디터로 작업
- GitHub Desktop이 자동으로 변경사항 감지

### 3. 서버 실행
**GitHub Desktop에서 터미널 열기:**
1. Repository → Open in Command Prompt
2. 다음 명령어 실행:
```bash
# 동기화 및 서버 시작
start-dev.bat
```

또는 **탐색기에서 직접 실행:**
1. Repository → Show in Explorer
2. `start-dev.bat` 더블클릭

### 4. 변경사항 저장
1. GitHub Desktop에서 변경사항 확인
2. Summary에 커밋 메시지 입력
3. **Commit to main** 클릭
4. **Push origin** 클릭

## 🎯 GitHub Desktop 전용 팁

### 바로가기 설정
1. GitHub Desktop에서 SAYU 열기
2. Repository → Create shortcut on Desktop
3. 바탕화면에서 바로 접근 가능

### 브랜치 작업
1. Current branch → New branch
2. 작업 후 Create pull request

### 히스토리 확인
- History 탭에서 모든 커밋 내역 확인
- 특정 커밋으로 되돌리기 가능

## ⚡ 자주 사용하는 기능

### 변경사항 되돌리기
- Changes 탭에서 파일 우클릭 → Discard changes

### 특정 파일만 커밋
- 체크박스로 원하는 파일만 선택

### 커밋 수정
- History에서 최근 커밋 우클릭 → Amend commit

## 🔧 문제 해결

### "Unable to fetch" 오류
1. File → Options → Accounts
2. GitHub.com 다시 로그인

### 충돌(Conflict) 발생 시
1. GitHub Desktop이 충돌 파일 표시
2. 에디터에서 충돌 해결
3. 해결 후 커밋

### 동기화 문제
1. Branch → Update from main
2. 또는 새로 클론

## 💡 권장 설정

### GitHub Desktop 설정
1. File → Options → Advanced
2. External editor: VS Code 선택
3. Shell: PowerShell 또는 Git Bash 선택

### 알림 설정
- Options → Notifications → 모두 체크
- 중요한 변경사항 놓치지 않기