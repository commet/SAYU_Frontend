# 🖥️ 데스크톱 SAYU 프로젝트 설정 가이드

## 📋 준비물
- Git 설치 (https://git-scm.com/)
- Node.js 설치 (https://nodejs.org/)
- GitHub Desktop 설치 (선택사항)

## 🚀 초기 설정 (처음 한 번만)

### 1. 프로젝트 클론
```bash
# CMD 또는 PowerShell 열기
cd C:\Users\[사용자명]\Documents\GitHub
git clone git@github.com:commet/SAYU.git
```

### 2. SSH 키 설정 (이미 했다면 건너뛰기)
노트북의 SSH 키를 복사하거나 새로 생성:
```bash
# 새로 생성하는 경우
ssh-keygen -t ed25519 -C "your-email@example.com"

# GitHub에 공개키 추가
# ~/.ssh/id_ed25519.pub 내용을 GitHub Settings > SSH Keys에 추가
```

### 3. 환경 변수 파일 복사
**노트북에서 복사해올 파일들:**
- `SAYU/frontend/.env.local`
- `SAYU/backend/.env`

## 💻 개발 시작하기

### 방법 1: start-dev.bat 더블클릭 (추천!)
1. Windows 탐색기에서 SAYU 폴더 열기
2. `start-dev.bat` 더블클릭
3. 자동으로 모든 것이 실행됨!

### 방법 2: 수동 실행
```bash
# SAYU 폴더로 이동
cd C:\Users\[사용자명]\Documents\GitHub\SAYU

# 동기화
.\sync.bat

# 개발 서버 시작
.\start-dev.bat
```

## 📝 작업 후 저장하기

### GitHub Desktop 사용 (추천)
1. GitHub Desktop 열기
2. SAYU 프로젝트 선택
3. 변경사항 확인
4. 커밋 메시지 입력
5. "Commit to main" 클릭
6. "Push origin" 클릭

### 명령어 사용
```bash
git add .
git commit -m "변경사항 설명"
git push origin main
```

## ⚡ 바로가기 만들기

### 바탕화면에 바로가기 추가
1. `start-dev.bat` 우클릭
2. "바로 가기 만들기" 선택
3. 바탕화면으로 이동
4. 이름을 "SAYU 개발 시작"으로 변경

## 🔧 문제 해결

### "git이 인식되지 않습니다"
→ Git 설치 후 컴퓨터 재시작

### "npm이 인식되지 않습니다"
→ Node.js 설치 후 컴퓨터 재시작

### "Permission denied (publickey)"
→ SSH 키 설정 필요 (위의 SSH 키 설정 참조)

### 포트 사용 중 오류
→ 기존 실행 중인 서버 종료 또는 포트 변경

## 💡 팁

- **VS Code 통합 터미널 사용**: VS Code에서 프로젝트 열고 터미널에서 작업
- **Windows Terminal 사용**: 더 나은 터미널 경험
- **자동 시작**: Windows 시작 프로그램에 `start-dev.bat` 추가 가능