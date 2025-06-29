# 🔄 SAYU 멀티 디바이스 동기화 가이드

## 📋 체크리스트

### 새 기기에서 프로젝트 시작할 때:

1. **Git Clone & 설정**
   ```bash
   git clone git@github.com:commet/SAYU.git
   cd SAYU
   
   # Git 설정
   git config core.autocrlf false
   git config core.eol lf
   ```

2. **초기 설정 스크립트 실행**
   - **Mac/Linux**: `./setup.sh`
   - **Windows**: `setup.bat`

3. **환경 변수 설정**
   - `frontend/.env.local` 복사 또는 생성
   - `backend/.env` 복사 또는 생성

4. **VS Code 설정 동기화**
   - Settings Sync 활성화
   - 또는 `.vscode/settings.json` 복사

---

## 🔧 기기 전환 시 필수 작업

### 작업 종료 전 (현재 기기):
```bash
# 1. 모든 변경사항 커밋
git add -A
git commit -m "작업 내용"

# 2. 원격 저장소에 푸시
git push origin main

# 3. 현재 브랜치 확인
git status
```

### 새 기기에서 작업 시작:
```bash
# 1. 최신 변경사항 가져오기
git pull origin main

# 2. 의존성 동기화
cd frontend && npm ci && cd ..
cd backend && npm ci && cd ..

# 3. 환경 변수 확인
# .env 파일들이 최신인지 확인
```

---

## ⚠️ 주의사항

### 1. **package-lock.json 관리**
- 항상 `npm ci` 사용 (의존성 정확히 일치)
- `npm install`은 새 패키지 추가할 때만
- package-lock.json은 반드시 커밋

### 2. **줄 끝 문자 (Line Endings)**
- Windows ↔ Mac/Linux 전환 시 문제 발생 가능
- `.gitattributes` 파일이 자동 처리
- VS Code 설정: `"files.eol": "\n"`

### 3. **환경 변수**
- `.env` 파일은 Git에 포함 안 됨
- 안전한 방법으로 별도 관리
- 1Password, Bitwarden 등 활용

---

## 🚀 자동화 도구

### Git Aliases 설정
```bash
# ~/.gitconfig에 추가
[alias]
    sync = !git pull origin main && cd frontend && npm ci && cd ../backend && npm ci && cd ..
    save = !git add -A && git commit -m
    publish = !git push origin main
```

사용 예:
```bash
git sync         # 최신 상태로 동기화
git save "작업 내용"  # 빠른 저장
git publish      # 원격 저장소에 푸시
```

### VS Code Tasks
`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Sync Project",
      "type": "shell",
      "command": "git pull && cd frontend && npm ci && cd ../backend && npm ci",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Frontend", "Start Backend"],
      "group": "build"
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "cd frontend && npm run dev",
      "group": "build"
    },
    {
      "label": "Start Backend", 
      "type": "shell",
      "command": "cd backend && npm run dev",
      "group": "build"
    }
  ]
}
```

---

## 🔍 문제 해결

### 1. "Cannot find module" 에러
```bash
# 의존성 완전 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. Git Merge Conflicts
```bash
# package-lock.json 충돌 시
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: resolve package-lock conflicts"
```

### 3. 환경 변수 누락
- `.env.local.example` 참고하여 필수 변수 확인
- 팀원에게 최신 환경 변수 요청

---

## 📱 모바일 개발 (추가 팁)

### GitHub Codespaces 활용
1. GitHub에서 `.` 키 누르기
2. 웹 기반 VS Code에서 개발
3. 모든 환경 자동 설정

### Remote Development
1. 데스크톱을 서버로 설정
2. 노트북에서 VS Code Remote SSH 연결
3. 한 곳에서만 환경 관리

---

## 🎯 베스트 프랙티스

1. **작은 단위로 자주 커밋**
2. **작업 전 항상 pull**
3. **의존성 변경 시 팀에 공유**
4. **환경 변수 변경 시 문서 업데이트**
5. **브랜치 전략 활용** (feature/브랜치명)