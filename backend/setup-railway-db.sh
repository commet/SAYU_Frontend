#!/bin/bash

echo "🚀 Railway 데이터베이스 설정 도우미"
echo "=================================="
echo ""
echo "1. Railway 대시보드 (https://railway.app) 에서:"
echo "   - PostgreSQL 서비스 클릭"
echo "   - Variables 탭에서 DATABASE_URL 복사"
echo ""
echo "2. 복사한 DATABASE_URL을 입력하세요:"
read -p "DATABASE_URL: " db_url

# .env 파일 백업
cp .env .env.backup 2>/dev/null

# DATABASE_URL 업데이트
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    # 기존 DATABASE_URL 교체
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$db_url|" .env
else
    # DATABASE_URL 추가
    echo "" >> .env
    echo "# Railway Database" >> .env
    echo "DATABASE_URL=$db_url" >> .env
fi

echo ""
echo "✅ DATABASE_URL이 .env 파일에 설정되었습니다"
echo ""
echo "3. 데이터베이스 마이그레이션 실행하시겠습니까? (y/n)"
read -p "> " run_migration

if [[ $run_migration == "y" || $run_migration == "Y" ]]; then
    echo "📊 마이그레이션 실행 중..."
    psql "$db_url" < migrations/art-profiles.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ 마이그레이션 완료!"
    else
        echo "❌ 마이그레이션 실패. PostgreSQL 클라이언트가 설치되어 있는지 확인하세요."
        echo ""
        echo "대안: Railway 대시보드의 Query 탭에서 직접 실행하세요:"
        echo "1. PostgreSQL 서비스 → Query 탭"
        echo "2. migrations/art-profiles.sql 내용 복사/붙여넣기"
        echo "3. Run Query 클릭"
    fi
fi

echo ""
echo "4. Railway 대시보드에서 환경 변수 추가:"
echo "   - 백엔드 서비스 → Variables 탭"
echo "   - 다음 변수들 추가:"
echo "     REPLICATE_API_TOKEN = your-replicate-api-token"
echo "     ART_PROFILE_FREE_MONTHLY_LIMIT = 3"
echo "     ART_PROFILE_PREMIUM_MONTHLY_LIMIT = 30"