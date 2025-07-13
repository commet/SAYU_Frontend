#!/bin/bash

echo "🚀 Railway 빠른 설정 도우미"
echo "=========================="
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# DATABASE_URL 형식 예시
echo -e "${YELLOW}DATABASE_URL 형식 예시:${NC}"
echo "postgresql://postgres:비밀번호@postgres-production-808c7.up.railway.app:포트/railway"
echo ""

# 현재 DATABASE_URL 확인
current_db_url=$(grep "^DATABASE_URL=" .env 2>/dev/null | cut -d'=' -f2-)
if [ ! -z "$current_db_url" ]; then
    echo -e "${YELLOW}현재 DATABASE_URL:${NC}"
    echo "$current_db_url"
    echo ""
fi

# 부분 URL 확인
if [[ "$current_db_url" == *"postgres-production-808c7.up.railway.app"* ]] && [[ "$current_db_url" != postgresql://* ]]; then
    echo -e "${RED}⚠️  DATABASE_URL이 불완전합니다!${NC}"
    echo "Railway 대시보드에서 전체 URL을 복사해주세요."
    echo ""
fi

# DATABASE_URL 입력
echo "Railway 대시보드에서 DATABASE_URL을 복사하세요:"
echo "1. PostgreSQL 서비스 → Variables 탭"
echo "2. DATABASE_URL 복사 (클릭하면 전체 선택됨)"
echo ""
read -p "DATABASE_URL: " new_db_url

# 입력 검증
if [[ ! "$new_db_url" =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ 올바른 DATABASE_URL 형식이 아닙니다${NC}"
    echo "postgresql://로 시작해야 합니다"
    exit 1
fi

# .env 백업
if [ -f .env ]; then
    cp .env .env.backup
    echo -e "${GREEN}✅ .env 파일 백업 완료 (.env.backup)${NC}"
fi

# DATABASE_URL 업데이트
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    sed -i.tmp "s|^DATABASE_URL=.*|DATABASE_URL=$new_db_url|" .env
    rm -f .env.tmp
else
    echo "" >> .env
    echo "# Railway Database" >> .env
    echo "DATABASE_URL=$new_db_url" >> .env
fi

echo -e "${GREEN}✅ DATABASE_URL 업데이트 완료${NC}"
echo ""

# 연결 테스트
echo "데이터베이스 연결을 테스트하시겠습니까? (y/n)"
read -p "> " test_connection

if [[ "$test_connection" == "y" || "$test_connection" == "Y" ]]; then
    echo "연결 테스트 중..."
    if command -v psql &> /dev/null; then
        psql "$new_db_url" -c "SELECT version();" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 데이터베이스 연결 성공!${NC}"
        else
            echo -e "${RED}❌ 데이터베이스 연결 실패${NC}"
            echo "URL이 올바른지 확인해주세요"
        fi
    else
        echo -e "${YELLOW}⚠️  psql이 설치되어 있지 않아 테스트를 건너뜁니다${NC}"
    fi
fi

# 마이그레이션 실행
echo ""
echo "아트 프로필 마이그레이션을 실행하시겠습니까? (y/n)"
read -p "> " run_migration

if [[ "$run_migration" == "y" || "$run_migration" == "Y" ]]; then
    if command -v psql &> /dev/null; then
        echo "마이그레이션 실행 중..."
        psql "$new_db_url" < migrations/art-profiles.sql
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 마이그레이션 완료!${NC}"
        else
            echo -e "${RED}❌ 마이그레이션 실패${NC}"
            echo ""
            echo -e "${YELLOW}대안: Railway Query 탭에서 직접 실행${NC}"
            echo "1. PostgreSQL 서비스 → Query 탭"
            echo "2. migrations/art-profiles.sql 내용 복사/붙여넣기"
            echo "3. Run Query 클릭"
        fi
    else
        echo -e "${YELLOW}psql이 설치되어 있지 않습니다${NC}"
        echo "Railway Query 탭에서 마이그레이션을 실행해주세요"
    fi
fi

# 환경 변수 안내
echo ""
echo -e "${YELLOW}다음 단계: Railway 환경 변수 추가${NC}"
echo "백엔드 서비스 → Variables 탭에서:"
echo ""
echo "REPLICATE_API_TOKEN=your-replicate-api-token"
echo "ART_PROFILE_FREE_MONTHLY_LIMIT=3"
echo "ART_PROFILE_PREMIUM_MONTHLY_LIMIT=30"
echo "JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo 'your-super-secret-jwt-key')"
echo ""
echo -e "${GREEN}✅ 설정 완료!${NC}"