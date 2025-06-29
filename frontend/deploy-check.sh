#!/bin/bash

echo "🔍 Vercel 배포 상태 확인 스크립트"
echo "=================================="

# 1. Git 상태 확인
echo "1️⃣ Git 상태:"
git status --short
echo ""

# 2. 최신 커밋 확인
echo "2️⃣ 최신 커밋:"
git log --oneline -1
echo ""

# 3. Remote 상태 확인
echo "3️⃣ Remote 상태:"
git remote -v
echo ""

# 4. Push 상태 확인
echo "4️⃣ Push 필요 여부:"
git status --porcelain --branch
echo ""

echo "📌 Vercel 자동 배포 조건:"
echo "- GitHub main 브랜치에 push ✓"
echo "- Vercel Git Integration 활성화 ✓"
echo "- Build 오류 없음 ✓"
echo ""
echo "🚀 수동 배포: npx vercel --prod"