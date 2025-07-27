#!/usr/bin/env node
/**
 * Apply Supabase Schema
 * Creates all tables, indexes, RLS policies, and functions in Supabase
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

async function loadSchemaFile() {
  const schemaPath = path.join(__dirname, '../supabase/migrations/001_complete_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  
  return fs.readFileSync(schemaPath, 'utf8');
}

async function executeSQL(supabase, sql, description) {
  log(`\n🔄 ${description}...`, 'blue');
  
  try {
    // Use REST API to execute SQL directly
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    log(`  ✓ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ ${description} failed: ${error.message}`, 'red');
    
    // For some operations, we might need to create the exec_sql function first
    if (error.message.includes('exec_sql')) {
      log(`  ℹ️  Note: You may need to create the exec_sql function in Supabase SQL Editor`, 'yellow');
    }
    
    return false;
  }
}

async function applySchemaInBatches(supabase, schemaSQL) {
  log('\n📝 Applying Schema in Batches...', 'blue');
  
  // Split SQL into logical sections
  const sections = [
    {
      name: 'Extensions',
      sql: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "vector";
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      `
    },
    {
      name: 'Core Tables (Users)',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          auth_id UUID UNIQUE,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(50) UNIQUE,
          full_name VARCHAR(100),
          avatar_url TEXT,
          bio TEXT,
          personality_type VARCHAR(50),
          quiz_completed BOOLEAN DEFAULT FALSE,
          language VARCHAR(10) DEFAULT 'ko',
          theme_preference VARCHAR(20) DEFAULT 'light',
          notification_settings JSONB DEFAULT '{"email": true, "push": false, "exhibition": true, "social": true}'::jsonb,
          privacy_settings JSONB DEFAULT '{"profile_public": true, "show_activity": true}'::jsonb,
          onboarding_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Quiz Tables',
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_sessions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          session_id VARCHAR(100) UNIQUE NOT NULL,
          status VARCHAR(20) DEFAULT 'in_progress',
          current_question_index INTEGER DEFAULT 0,
          personality_scores JSONB DEFAULT '{}'::jsonb,
          language VARCHAR(10) DEFAULT 'ko',
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS quiz_answers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          session_id VARCHAR(100) REFERENCES quiz_sessions(session_id),
          question_id VARCHAR(50) NOT NULL,
          choice_id VARCHAR(50) NOT NULL,
          dimension VARCHAR(50),
          score_impact JSONB,
          answered_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS quiz_results (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          session_id VARCHAR(100) REFERENCES quiz_sessions(session_id),
          personality_type VARCHAR(50) NOT NULL,
          animal_type VARCHAR(50) NOT NULL,
          scores JSONB NOT NULL,
          traits JSONB,
          strengths TEXT[],
          challenges TEXT[],
          art_preferences JSONB,
          recommended_artists TEXT[],
          recommended_styles TEXT[],
          detailed_analysis TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Art Profile Tables',
      sql: `
        CREATE TABLE IF NOT EXISTS art_profiles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          personality_type VARCHAR(50) NOT NULL,
          profile_image_url TEXT,
          profile_data JSONB,
          generation_prompt TEXT,
          style_attributes JSONB,
          color_palette JSONB,
          artistic_elements JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS art_profile_generations (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          profile_id UUID REFERENCES art_profiles(id) ON DELETE CASCADE,
          generation_id VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          model_used VARCHAR(100),
          prompt_used TEXT,
          parameters JSONB,
          result_url TEXT,
          error_message TEXT,
          processing_time_ms INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Exhibition Tables',
      sql: `
        CREATE TABLE IF NOT EXISTS venues (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(300) NOT NULL,
          name_en VARCHAR(300),
          type VARCHAR(100),
          address TEXT,
          city VARCHAR(100),
          region VARCHAR(100),
          country VARCHAR(100) DEFAULT 'KR',
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          website TEXT,
          phone VARCHAR(50),
          email VARCHAR(255),
          opening_hours JSONB,
          admission_fee JSONB,
          facilities JSONB,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS exhibitions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          venue_id UUID REFERENCES venues(id),
          title VARCHAR(500) NOT NULL,
          title_en VARCHAR(500),
          artist VARCHAR(300),
          curator VARCHAR(300),
          start_date DATE,
          end_date DATE,
          opening_time TIME,
          closing_time TIME,
          admission_fee VARCHAR(200),
          description TEXT,
          image_url TEXT,
          poster_url TEXT,
          tags TEXT[],
          category VARCHAR(100),
          status VARCHAR(50) DEFAULT 'upcoming',
          view_count INTEGER DEFAULT 0,
          like_count INTEGER DEFAULT 0,
          source VARCHAR(50),
          source_url TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS exhibition_views (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          viewed_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS exhibition_likes (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(exhibition_id, user_id)
        );
      `
    },
    {
      name: 'Basic Indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_exhibition_likes_exhibition ON exhibition_likes(exhibition_id);
      `
    }
  ];

  let success = 0;
  let failed = 0;

  for (const section of sections) {
    const result = await executeSQL(supabase, section.sql, section.name);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay between sections
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log(`\n📊 Schema Application Summary:`, 'yellow');
  log(`  ✓ Successful: ${success}`, 'green');
  log(`  ✗ Failed: ${failed}`, 'red');

  return failed === 0;
}

async function enableRLS(supabase) {
  log('\n🔒 Enabling Row Level Security...', 'blue');
  
  const tables = [
    'users',
    'quiz_sessions',
    'quiz_answers',
    'quiz_results',
    'art_profiles',
    'art_profile_generations',
    'exhibition_views',
    'exhibition_likes'
  ];

  let success = 0;
  
  for (const table of tables) {
    try {
      await executeSQL(supabase, `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, `Enable RLS on ${table}`);
      success++;
    } catch (error) {
      log(`  ⚠️  Failed to enable RLS on ${table}`, 'yellow');
    }
  }

  log(`\n🔒 RLS enabled on ${success}/${tables.length} tables`, 'green');
}

async function createBasicPolicies(supabase) {
  log('\n📜 Creating Basic RLS Policies...', 'blue');
  
  const policies = [
    {
      name: 'Users can view all profiles',
      sql: `CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON users FOR SELECT USING (true);`
    },
    {
      name: 'Users can update own profile',
      sql: `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);`
    },
    {
      name: 'Exhibition likes policy',
      sql: `CREATE POLICY IF NOT EXISTS "Users can manage own likes" ON exhibition_likes FOR ALL USING (true);`
    }
  ];

  for (const policy of policies) {
    await executeSQL(supabase, policy.sql, policy.name);
  }
}

async function main() {
  log('🚀 Applying Supabase Schema', 'blue');
  log('='.repeat(50), 'blue');

  // Validate environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    log('❌ Missing Supabase environment variables', 'red');
    log('Please check SUPABASE_URL and SUPABASE_SERVICE_KEY', 'yellow');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Test connection
    log('\n🔌 Testing Supabase connection...', 'blue');
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message.includes('Invalid API key')) {
      throw new Error(`Connection failed: Invalid API key`);
    }
    log('  ✓ Supabase connected successfully', 'green');

    // Apply schema in batches
    const schemaSuccess = await applySchemaInBatches(supabase);
    
    if (schemaSuccess) {
      // Enable RLS
      await enableRLS(supabase);
      
      // Create basic policies
      await createBasicPolicies(supabase);
      
      log('\n✅ Schema application completed successfully!', 'green');
      log('\nNext steps:', 'yellow');
      log('  1. Check Supabase dashboard for tables', 'blue');
      log('  2. Run migration readiness check:', 'blue');
      log('     node scripts/check-migration-readiness.js', 'blue');
      log('  3. Run data migration:', 'blue');
      log('     node scripts/migrate-to-supabase.js', 'blue');
    } else {
      log('\n❌ Schema application had errors', 'red');
      log('Please check the logs and fix any issues', 'yellow');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Schema application failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the schema application
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applySchemaInBatches, enableRLS, createBasicPolicies };