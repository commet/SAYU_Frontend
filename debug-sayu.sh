#!/bin/bash

# SAYU 시스템 헬스체크 및 디버깅 스크립트
# 사용법: ./debug-sayu.sh [--frontend|--backend|--full|--fix]

echo "🎨 SAYU Debug Master v1.0"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 헬스체크 함수들
check_frontend() {
    echo -e "${BLUE}🖥️  Frontend Check${NC}"
    
    # Next.js 서버 상태
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "✅ Frontend (3000): ${GREEN}ONLINE${NC}"
    elif curl -s http://localhost:3001 >/dev/null 2>&1; then
        echo -e "✅ Frontend (3001): ${GREEN}ONLINE${NC}"
    else
        echo -e "❌ Frontend: ${RED}OFFLINE${NC}"
        return 1
    fi
    
    # Node modules 체크
    if [ -d "frontend/node_modules" ]; then
        echo -e "✅ Node modules: ${GREEN}EXISTS${NC}"
    else
        echo -e "❌ Node modules: ${RED}MISSING${NC}"
        return 1
    fi
    
    # .next 폴더 체크
    if [ -d "frontend/.next" ]; then
        echo -e "✅ Build cache: ${GREEN}EXISTS${NC}"
    else
        echo -e "⚠️  Build cache: ${YELLOW}MISSING${NC}"
    fi
}

check_backend() {
    echo -e "${BLUE}⚙️  Backend Check${NC}"
    
    # Living Mode 서버 상태
    health_response=$(curl -s http://localhost:3005/api/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "✅ Living Mode (3005): ${GREEN}ONLINE${NC}"
        echo "   Response: $health_response"
    else
        echo -e "❌ Living Mode: ${RED}OFFLINE${NC}"
        return 1
    fi
    
    # Artvee API 테스트
    artvee_response=$(curl -s "http://localhost:3005/api/artvee/random?limit=1" 2>/dev/null)
    if echo "$artvee_response" | grep -q "cloudinary"; then
        echo -e "✅ Artvee API: ${GREEN}WORKING${NC}"
        cloudinary_count=$(echo "$artvee_response" | grep -o "cloudinary" | wc -l)
        echo "   Cloudinary URLs: $cloudinary_count"
    else
        echo -e "❌ Artvee API: ${RED}FAILED${NC}"
        return 1
    fi
}

check_database() {
    echo -e "${BLUE}🗄️  Database Check${NC}"
    
    if [ -n "$DATABASE_URL" ]; then
        echo -e "✅ DATABASE_URL: ${GREEN}SET${NC}"
    else
        echo -e "❌ DATABASE_URL: ${RED}NOT SET${NC}"
        return 1
    fi
}

check_ports() {
    echo -e "${BLUE}🌐 Port Check${NC}"
    
    # 포트 3000, 3001 체크
    if netstat -an 2>/dev/null | grep -q ":3000"; then
        echo -e "✅ Port 3000: ${GREEN}IN USE${NC}"
    else
        echo -e "⚠️  Port 3000: ${YELLOW}FREE${NC}"
    fi
    
    if netstat -an 2>/dev/null | grep -q ":3001"; then
        echo -e "✅ Port 3001: ${GREEN}IN USE${NC}"
    else
        echo -e "⚠️  Port 3001: ${YELLOW}FREE${NC}"
    fi
    
    # 포트 3005 체크 (Living Mode)
    if netstat -an 2>/dev/null | grep -q ":3005"; then
        echo -e "✅ Port 3005: ${GREEN}IN USE${NC}"
    else
        echo -e "❌ Port 3005: ${RED}FREE${NC}"
        return 1
    fi
}

fix_common_issues() {
    echo -e "${YELLOW}🔧 Fixing Common Issues...${NC}"
    
    # 1. Frontend ChunkLoadError 수정
    echo "Clearing Next.js cache..."
    cd frontend 2>/dev/null && rm -rf .next node_modules/.cache
    
    # 2. Node modules 재설치
    echo "Reinstalling dependencies..."
    cd frontend 2>/dev/null && npm install --legacy-peer-deps --silent
    
    # 3. 포트 충돌 해결
    echo "Checking for port conflicts..."
    if command -v pkill >/dev/null 2>&1; then
        pkill -f "node.*3005" 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Common fixes applied${NC}"
}

# 메인 로직
case "${1:-}" in
    "--frontend")
        check_frontend
        ;;
    "--backend")
        check_backend
        ;;
    "--database")
        check_database
        ;;
    "--ports")
        check_ports
        ;;
    "--fix")
        fix_common_issues
        ;;
    "--full"|"")
        echo "Running full system check..."
        echo ""
        
        check_frontend
        echo ""
        check_backend
        echo ""
        check_database
        echo ""
        check_ports
        echo ""
        
        echo -e "${BLUE}📊 Summary${NC}"
        if check_frontend >/dev/null 2>&1 && check_backend >/dev/null 2>&1; then
            echo -e "🎉 SAYU System: ${GREEN}HEALTHY${NC}"
        else
            echo -e "⚠️  SAYU System: ${YELLOW}NEEDS ATTENTION${NC}"
            echo ""
            echo -e "💡 Quick fix: ${BLUE}./debug-sayu.sh --fix${NC}"
        fi
        ;;
    *)
        echo "Usage: $0 [--frontend|--backend|--database|--ports|--fix|--full]"
        echo ""
        echo "Options:"
        echo "  --frontend   Check Next.js frontend only"
        echo "  --backend    Check Living Mode backend only"
        echo "  --database   Check database connection"
        echo "  --ports      Check port usage"
        echo "  --fix        Apply common fixes"
        echo "  --full       Full system check (default)"
        ;;
esac