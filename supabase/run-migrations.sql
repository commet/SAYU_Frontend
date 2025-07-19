-- SAYU Supabase 마이그레이션 실행 스크립트
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블이 있다면 삭제 (개발 환경에서만 사용)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. 필요한 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. 마이그레이션 실행 로그 테이블
CREATE TABLE IF NOT EXISTS migration_log (
  id serial PRIMARY KEY,
  migration_name text NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'success'
);

-- 마이그레이션 시작
BEGIN;

-- 001_matching_system.sql
-- 매칭 시스템 기본 테이블은 이미 생성됨
INSERT INTO migration_log (migration_name) VALUES ('001_matching_system.sql');

-- 002_chat_system.sql (간단한 채팅)
-- 채팅 시스템 테이블은 이미 생성됨
INSERT INTO migration_log (migration_name) VALUES ('002_chat_system.sql');

-- 003_art_collections.sql
-- 이미 존재하는지 확인 후 생성
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'art_collections') THEN
    -- 003_art_collections.sql 내용을 여기에 포함
    -- (실제 구현 시 각 파일 내용을 포함)
  END IF;
END $$;

INSERT INTO migration_log (migration_name) VALUES ('003_art_collections.sql');

-- 이후 마이그레이션들도 동일한 패턴으로 추가...

COMMIT;

-- 마이그레이션 결과 확인
SELECT * FROM migration_log ORDER BY executed_at DESC;