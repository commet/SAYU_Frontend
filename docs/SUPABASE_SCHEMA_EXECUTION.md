# Supabase Schema Execution Guide

## Method 1: SQL Editor (Recommended)
1. Go to Supabase Dashboard: https://app.supabase.com/project/hgltvdshuyfffskvjmst
2. Navigate to SQL Editor
3. Copy the entire content from 'supabase-schema-manual.sql'
4. Paste and execute

## Method 2: psql Command Line
```bash
# Get your database password from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.hgltvdshuyfffskvjmst.supabase.co:5432/postgres" -f scripts/supabase-schema-manual.sql
```

## Method 3: Split Execution (for large schemas)
If the full schema fails, execute in smaller parts:

1. Extensions first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

2. Core tables (users, quiz_sessions, etc.)
3. Reference tables (venues, exhibitions, etc.)
4. Indexes and RLS policies

## Verification
After execution, verify with:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## Next Steps
After schema is applied:
1. Run: `node scripts/check-migration-readiness.js`
2. Run: `node scripts/migrate-to-supabase.js`
