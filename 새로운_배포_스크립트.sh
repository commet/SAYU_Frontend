#!/bin/bash

echo "🚀 SAYU 새로운 프로덕션 배포 스크립트"
echo "===================================="
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ SAYU 프로젝트 루트 디렉토리에서 실행해주세요${NC}"
    exit 1
fi

echo -e "${BLUE}📋 배포 준비 중...${NC}"

# 1. 기존 Railway 연결 해제
echo -e "${YELLOW}🔄 기존 Railway 연결 해제 중...${NC}"
rm -f .railway.json
rm -f backend/.railway.json
rm -f frontend/.railway.json

# 2. Railway 로그인 확인
echo -e "${YELLOW}🔐 Railway 로그인 확인 중...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Railway에 로그인되어 있지 않습니다${NC}"
    echo -e "${BLUE}다음 명령어로 로그인해주세요: railway login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Railway 로그인 확인됨${NC}"

# 3. 새 프로젝트 생성 안내
echo ""
echo -e "${BLUE}📝 다음 단계를 수행해주세요:${NC}"
echo ""
echo -e "${YELLOW}1. 새 Railway 프로젝트 생성:${NC}"
echo "   railway create \"SAYU-New\""
echo ""
echo -e "${YELLOW}2. 백엔드 배포:${NC}"
echo "   cd backend"
echo "   railway up"
echo ""
echo -e "${YELLOW}3. Railway 대시보드에서 다음 서비스들 추가:${NC}"
echo "   - PostgreSQL 데이터베이스"
echo "   - Redis (선택사항)"
echo "   - Frontend 서비스 (GitHub에서 배포)"
echo ""
echo -e "${YELLOW}4. 환경변수 설정:${NC}"
echo "   아래 파일들을 참고하세요:"
echo "   - 새로운_SAYU_배포_가이드.md"
echo "   - ENV_TEMPLATES.md"
echo ""

# 생성된 시크릿 키 표시
echo -e "${GREEN}🔐 새로 생성된 시크릿 키들:${NC}"
echo "=================================="
echo "NEXTAUTH_SECRET=l6dNJw6ZbezjJLXArO4gbw0ttQ/Z+1nkiWKecnWllOE="
echo "JWT_SECRET=Zt9AcbmG/9/U5wJNQbJvR9338SpxfLYQ9zbamKn657I="
echo "SESSION_SECRET=5DST9H9NTuluxIUTlmHsdR4jWWIcqmpDDzAUkN85aE0="
echo ""
echo -e "${RED}⚠️  이 키들을 안전한 곳에 복사해서 저장해주세요!${NC}"
echo ""

# 체크리스트 표시
echo -e "${BLUE}📋 배포 체크리스트:${NC}"
echo "==================="
echo "[ ] 1. railway create \"SAYU-New\" 실행"
echo "[ ] 2. PostgreSQL 서비스 추가"
echo "[ ] 3. Redis 서비스 추가 (선택사항)"
echo "[ ] 4. 백엔드 배포 (cd backend && railway up)"
echo "[ ] 5. 프론트엔드 서비스 생성 (대시보드에서)"
echo "[ ] 6. 백엔드 환경변수 설정"
echo "[ ] 7. 프론트엔드 환경변수 설정"
echo "[ ] 8. 데이터베이스 스키마 생성"
echo "[ ] 9. URL 상호 참조 업데이트"
echo "[ ] 10. 기능 테스트"
echo ""

echo -e "${GREEN}🎉 준비 완료! 위 체크리스트를 따라 진행해주세요.${NC}"
echo -e "${BLUE}📖 자세한 설명은 '새로운_SAYU_배포_가이드.md' 파일을 참고하세요.${NC}"