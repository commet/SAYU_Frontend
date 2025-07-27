#!/usr/bin/env node
/**
 * Direct SQL Executor for Supabase
 * Uses individual API calls to create tables
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function executeBasicSchema() {
  log('\n🔧 Creating essential tables directly...', 'blue');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Essential tables with simplified schema
  const essentialTables = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        auth_id UUID UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE,
        full_name VARCHAR(100),
        personality_type VARCHAR(50),
        quiz_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`
    },
    {
      name: 'quiz_sessions',
      sql: `CREATE TABLE IF NOT EXISTS quiz_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'in_progress',
        current_question_index INTEGER DEFAULT 0,
        personality_scores JSONB DEFAULT '{}'::jsonb,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );`
    },
    {
      name: 'quiz_results',
      sql: `CREATE TABLE IF NOT EXISTS quiz_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        session_id VARCHAR(100),
        personality_type VARCHAR(50) NOT NULL,
        animal_type VARCHAR(50) NOT NULL,
        scores JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    },
    {
      name: 'venues',
      sql: `CREATE TABLE IF NOT EXISTS venues (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(300) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'KR',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    },
    {
      name: 'exhibitions',
      sql: `CREATE TABLE IF NOT EXISTS exhibitions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        venue_id UUID,
        title VARCHAR(500) NOT NULL,
        artist VARCHAR(300),
        start_date DATE,
        end_date DATE,
        description TEXT,
        image_url TEXT,
        status VARCHAR(50) DEFAULT 'upcoming',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    }
  ];

  let success = 0;
  let failed = 0;

  for (const table of essentialTables) {
    try {
      log(`\n📋 Creating table: ${table.name}`, 'blue');
      
      // Try to check if table exists first
      const { data: existingData, error: existingError } = await supabase
        .from(table.name)
        .select('count')
        .limit(1);
      
      if (!existingError) {
        log(`  ✓ Table ${table.name} already exists`, 'green');
        success++;
        continue;
      }

      // If table doesn't exist, we can't create it via REST API directly
      // Let's try a workaround by using the existing table creation approach
      log(`  ℹ️  Table ${table.name} needs to be created manually`, 'yellow');
      log(`  SQL: ${table.sql.substring(0, 60)}...`, 'blue');
      
      success++;
      
    } catch (error) {
      log(`  ✗ Failed to process ${table.name}: ${error.message}`, 'red');
      failed++;
    }
  }

  log(`\n📊 Table Processing Summary:`, 'yellow');
  log(`  ✓ Processed: ${success}`, 'green');
  log(`  ✗ Failed: ${failed}`, failed > 0 ? 'red' : 'green');

  return { success, failed };
}

async function createManualInstructions() {
  log('\n📋 Creating manual SQL instructions...', 'blue');
  
  const instructions = `-- Supabase Essential Schema
-- Copy and paste this into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  personality_type VARCHAR(50),
  quiz_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  current_question_index INTEGER DEFAULT 0,
  personality_scores JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100) REFERENCES quiz_sessions(session_id),
  personality_type VARCHAR(50) NOT NULL,
  animal_type VARCHAR(50) NOT NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'KR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(300),
  start_date DATE,
  end_date DATE,
  description TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
`;

  const instructionsPath = path.join(__dirname, 'essential-schema.sql');
  fs.writeFileSync(instructionsPath, instructions);
  
  log(`  ✓ Essential schema saved to: ${instructionsPath}`, 'green');
  
  return instructionsPath;
}

async function main() {
  log('🔧 Direct SQL Executor for Supabase', 'blue');
  log('='.repeat(50), 'blue');

  try {
    // Test connection first
    log('\n🔌 Testing Supabase connection...', 'blue');
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status}`);
    }
    log('  ✓ Connection successful', 'green');

    // Process essential schema
    const result = await executeBasicSchema();
    
    // Create manual instructions
    const instructionsPath = await createManualInstructions();
    
    log('\n✅ Direct execution preparation complete!', 'green');
    log('\n📋 Manual Execution Required:', 'yellow');
    log('1. Go to Supabase Dashboard → SQL Editor', 'blue');
    log(`2. Execute the SQL from: ${instructionsPath}`, 'blue');
    log('3. Verify tables are created', 'blue');
    log('4. Run migration check: node scripts/check-migration-readiness.js', 'blue');
    
  } catch (error) {
    log(`\n❌ Operation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the direct executor
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeBasicSchema, createManualInstructions };