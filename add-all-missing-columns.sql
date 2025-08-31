-- exhibitions_translations 테이블에 누락된 모든 컬럼 추가
ALTER TABLE exhibitions_translations 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS curator TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;