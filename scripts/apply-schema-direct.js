#!/usr/bin/env node
/**
 * Direct Schema Application to Supabase
 * Uses Supabase SQL Editor approach via REST API
 */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function executeSQLDirect(sql, description) {
  log(`\n🔄 ${description}...`, 'blue');
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'X-HTTP-Method-Override': 'GET'
      }
    });

    // Alternative approach - use pg library for direct connection
    if (!response.ok) {
      log(`  ℹ️  REST API approach failed, trying alternative method...`, 'yellow');
      return false;
    }

    log(`  ✓ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

async function createSchemaWithPg() {
  log('\n🔧 Creating schema using direct PostgreSQL connection...', 'blue');
  
  // Extract connection details from DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log('❌ DATABASE_URL not found - need Railway connection for initial setup', 'red');
    return false;
  }

  const { Client } = require('pg');
  
  try {
    // Connect to Railway PostgreSQL first to get the schema
    const railwayClient = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    await railwayClient.connect();
    log('  ✓ Connected to Railway PostgreSQL', 'green');
    
    // Get schema from existing database
    const schemaQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `;
    
    const result = await railwayClient.query(schemaQuery);
    log(`  ✓ Found ${result.rows.length} columns in existing schema`, 'green');
    
    await railwayClient.end();
    
    // Now we'll create a SQL script that can be manually executed
    const sqlScript = generateSupabaseSchema(result.rows);
    
    // Save script to file
    const scriptPath = path.join(__dirname, 'supabase-schema-manual.sql');
    fs.writeFileSync(scriptPath, sqlScript);
    
    log(`\n📝 Schema script generated: ${scriptPath}`, 'green');
    log('\n📋 Manual Setup Instructions:', 'yellow');
    log('1. Go to Supabase Dashboard → SQL Editor', 'blue');
    log('2. Copy and paste the generated SQL script', 'blue');
    log('3. Execute the script to create all tables', 'blue');
    log(`4. Or run: psql "${getSupabaseConnectionString()}" -f "${scriptPath}"`, 'blue');
    
    return true;
    
  } catch (error) {
    log(`  ✗ Failed to generate schema: ${error.message}`, 'red');
    return false;
  }
}

function generateSupabaseSchema(columns) {
  // Group columns by table
  const tables = {};
  columns.forEach(col => {
    if (!tables[col.table_name]) {
      tables[col.table_name] = [];
    }
    tables[col.table_name].push(col);
  });

  let sql = `-- Supabase Schema Generated from Railway
-- Execute this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

`;

  // Generate CREATE TABLE statements
  Object.entries(tables).forEach(([tableName, cols]) => {
    sql += `-- Table: ${tableName}
CREATE TABLE IF NOT EXISTS ${tableName} (
`;
    
    const columnDefs = cols.map(col => {
      let def = `  ${col.column_name} ${col.data_type}`;
      
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`;
      }
      
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL';
      }
      
      return def;
    });
    
    sql += columnDefs.join(',\n');
    sql += `
);

`;
  });

  // Add basic indexes
  sql += `-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_likes ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY IF NOT EXISTS "Users can manage own likes" ON exhibition_likes FOR ALL USING (true);
`;

  return sql;
}

function getSupabaseConnectionString() {
  // This would need to be constructed from Supabase connection details
  // For now, return a placeholder
  return `postgresql://postgres:[password]@db.${process.env.SUPABASE_URL.split('.')[0].replace('https://', '')}.supabase.co:5432/postgres`;
}

async function main() {
  log('🚀 Direct Supabase Schema Application', 'blue');
  log('='.repeat(50), 'blue');

  // Validate environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    log('❌ Missing Supabase environment variables', 'red');
    process.exit(1);
  }

  try {
    // Test Supabase connection first
    log('\n🔌 Testing Supabase connection...', 'blue');
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase connection failed: ${response.status}`);
    }
    
    log('  ✓ Supabase connected successfully', 'green');

    // Generate schema from existing Railway database
    const success = await createSchemaWithPg();
    
    if (success) {
      log('\n✅ Schema preparation completed!', 'green');
      log('\nNext: Execute the generated SQL script in Supabase', 'yellow');
    } else {
      log('\n❌ Schema preparation failed', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Operation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the schema preparation
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createSchemaWithPg, generateSupabaseSchema };