#!/bin/bash

# Art Profiles 데이터베이스 마이그레이션 스크립트

echo "🎨 Starting Art Profiles Database Migration..."

# 환경 변수 로드
source .env

# 마이그레이션 실행
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set in .env file"
    exit 1
fi

echo "📊 Running migration..."
psql $DATABASE_URL < migrations/art-profiles.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed. Please check your database connection."
    exit 1
fi