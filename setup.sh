#!/bin/bash

echo "🚀 SAYU 프로젝트 설정 시작..."
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 운영체제 감지
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "mac"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)
echo -e "${GREEN}✓ 운영체제: $OS${NC}"

# Node.js 버전 확인
echo -e "\n${YELLOW}Node.js 버전 확인...${NC}"
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js 버전: $NODE_VERSION${NC}"
    
    # 버전 호환성 체크
    REQUIRED_NODE_VERSION="18"
    CURRENT_NODE_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    
    if [ $CURRENT_NODE_VERSION -lt $REQUIRED_NODE_VERSION ]; then
        echo -e "${RED}⚠️  Node.js 버전 $REQUIRED_NODE_VERSION 이상이 필요합니다!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다!${NC}"
    exit 1
fi

# Git 설정
echo -e "\n${YELLOW}Git 설정...${NC}"

# 줄 끝 처리 설정 (중요!)
git config core.autocrlf false
git config core.eol lf
echo -e "${GREEN}✓ Git 줄 끝 처리 설정 완료${NC}"

# Git hooks 설정
if [ -d ".git" ]; then
    echo -e "${GREEN}✓ Git 저장소 확인됨${NC}"
else
    echo -e "${RED}❌ Git 저장소가 아닙니다!${NC}"
    exit 1
fi

# 의존성 정리 및 재설치
echo -e "\n${YELLOW}의존성 정리 중...${NC}"

# Frontend 설정
if [ -d "frontend" ]; then
    echo -e "\n${YELLOW}Frontend 설정...${NC}"
    cd frontend
    
    # 기존 의존성 정리
    rm -rf node_modules package-lock.json
    echo -e "${GREEN}✓ 기존 의존성 제거 완료${NC}"
    
    # 캐시 정리
    npm cache clean --force
    echo -e "${GREEN}✓ npm 캐시 정리 완료${NC}"
    
    # 의존성 설치
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend 의존성 설치 완료${NC}"
    else
        echo -e "${RED}❌ Frontend 의존성 설치 실패${NC}"
        exit 1
    fi
    
    # 환경 변수 설정
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            echo -e "${YELLOW}⚠️  .env.local 파일이 생성되었습니다. 환경 변수를 설정해주세요.${NC}"
        fi
    else
        echo -e "${GREEN}✓ 환경 변수 파일 존재${NC}"
    fi
    
    cd ..
fi

# Backend 설정
if [ -d "backend" ]; then
    echo -e "\n${YELLOW}Backend 설정...${NC}"
    cd backend
    
    # 기존 의존성 정리
    rm -rf node_modules package-lock.json
    echo -e "${GREEN}✓ 기존 의존성 제거 완료${NC}"
    
    # 의존성 설치
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend 의존성 설치 완료${NC}"
    else
        echo -e "${RED}❌ Backend 의존성 설치 실패${NC}"
        exit 1
    fi
    
    # 환경 변수 설정
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠️  .env 파일이 생성되었습니다. 환경 변수를 설정해주세요.${NC}"
        fi
    else
        echo -e "${GREEN}✓ 환경 변수 파일 존재${NC}"
    fi
    
    cd ..
fi

# VS Code 설정
echo -e "\n${YELLOW}VS Code 설정...${NC}"
if [ ! -d ".vscode" ]; then
    mkdir -p .vscode
fi

# 완료 메시지
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SAYU 프로젝트 설정 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n다음 명령어로 개발을 시작하세요:"
echo -e "${YELLOW}Frontend:${NC} cd frontend && npm run dev"
echo -e "${YELLOW}Backend:${NC} cd backend && npm run dev"
echo -e "\n${YELLOW}중요: 환경 변수 파일을 확인하고 필요한 값을 설정하세요!${NC}"