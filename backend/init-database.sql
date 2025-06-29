-- SAYU Database Initialization Script
-- Run this file to set up the complete database schema

-- First, run the main schema
\i schema.sql

-- Then run migrations in order
\i migrations/add-oauth-accounts.sql
\i migrations/add-user-roles.sql
\i migrations/add-community-features.sql
\i migrations/add-email-system.sql
\i migrations/performance-indexes.sql

-- Optional: Add sample data or initial configuration here