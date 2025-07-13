#!/bin/bash

# WSL2에서 Next.js 개발 서버 시작 스크립트

echo "Starting Next.js development server for WSL2..."

# 기존 프로세스 종료
pkill -f "next dev" 2>/dev/null

# 환경 변수 설정
export HOSTNAME=0.0.0.0
export HOST=0.0.0.0

# Next.js 시작
echo "Starting on http://localhost:3000"
npm run dev -- --hostname 0.0.0.0 --port 3000