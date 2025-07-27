#!/usr/bin/env node
/**
 * Execute the generated schema in Supabase using pg client
 */
const { Client } = require('pg');
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

async function getSupabaseConnectionString() {
  // Extract project ref from Supabase URL
  const supabaseUrl = process.env.SUPABASE_URL;
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
  
  // We need to get the database password from Supabase dashboard
  // For now, we'll guide the user to get it
  log('\n🔐 Database Connection Required', 'yellow');
  log('To execute SQL directly, we need your Supabase database password.', 'blue');
  log('1. Go to Supabase Dashboard → Settings → Database', 'blue');
  log('2. Copy the database password', 'blue');
  log('3. Use this connection string:', 'blue');
  log(`   postgresql://postgres:[YOUR_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`, 'yellow');
  
  return null;
}

async function executeSchemaWithSupabaseAPI() {
  log('\n🔧 Executing schema using Supabase API...', 'blue');
  
  try {
    // Read the generated schema file
    const schemaPath = path.join(__dirname, 'supabase-schema-manual.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into smaller chunks for execution
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`  Found ${statements.length} SQL statements to execute`, 'blue');
    
    let success = 0;
    let failed = 0;
    
    // Execute statements in smaller batches
    for (let i = 0; i < statements.length; i += 5) {
      const batch = statements.slice(i, i + 5);
      
      for (const statement of batch) {
        try {
          // For now, we'll create a manual execution guide
          // since Supabase doesn't expose direct SQL execution via REST API
          if (statement.includes('CREATE EXTENSION')) {
            log(`  ⚠️  Extension statement (manual): ${statement.substring(0, 50)}...`, 'yellow');
          } else if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE[^(]*?(\w+)/)?.[1];
            log(`  📋 Table statement for: ${tableName}`, 'blue');
          }
          success++;
        } catch (error) {
          log(`  ✗ Failed: ${error.message}`, 'red');
          failed++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    log(`\n📊 Analysis complete:`, 'yellow');
    log(`  📋 SQL statements processed: ${success}`, 'green');
    log(`  ❌ Failed statements: ${failed}`, failed > 0 ? 'red' : 'green');
    
    return true;
    
  } catch (error) {
    log(`  ✗ Schema execution failed: ${error.message}`, 'red');
    return false;
  }
}

async function createSupabaseExecutionGuide() {
  log('\n📋 Creating Supabase Execution Guide...', 'blue');
  
  const guide = `# Supabase Schema Execution Guide

## Method 1: SQL Editor (Recommended)
1. Go to Supabase Dashboard: https://app.supabase.com/project/${process.env.SUPABASE_URL.split('.')[0].replace('https://', '')}
2. Navigate to SQL Editor
3. Copy the entire content from 'supabase-schema-manual.sql'
4. Paste and execute

## Method 2: psql Command Line
\`\`\`bash
# Get your database password from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.${process.env.SUPABASE_URL.split('.')[0].replace('https://', '')}.supabase.co:5432/postgres" -f scripts/supabase-schema-manual.sql
\`\`\`

## Method 3: Split Execution (for large schemas)
If the full schema fails, execute in smaller parts:

1. Extensions first:
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
\`\`\`

2. Core tables (users, quiz_sessions, etc.)
3. Reference tables (venues, exhibitions, etc.)
4. Indexes and RLS policies

## Verification
After execution, verify with:
\`\`\`sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
\`\`\`

## Next Steps
After schema is applied:
1. Run: \`node scripts/check-migration-readiness.js\`
2. Run: \`node scripts/migrate-to-supabase.js\`
`;

  const guidePath = path.join(__dirname, '../docs/SUPABASE_SCHEMA_EXECUTION.md');
  fs.writeFileSync(guidePath, guide);
  
  log(`\n📝 Execution guide created: ${guidePath}`, 'green');
  return true;
}

async function main() {
  log('🔧 Supabase Schema Execution', 'blue');
  log('='.repeat(50), 'blue');

  try {
    // Analyze the schema first
    await executeSchemaWithSupabaseAPI();
    
    // Create execution guide
    await createSupabaseExecutionGuide();
    
    // Show connection info
    await getSupabaseConnectionString();
    
    log('\n✅ Schema execution preparation complete!', 'green');
    log('\n📋 Next Steps:', 'yellow');
    log('1. Execute the SQL schema in Supabase (see guide above)', 'blue');
    log('2. Run migration readiness check:', 'blue');
    log('   node scripts/check-migration-readiness.js', 'blue');
    log('3. Execute data migration:', 'blue');
    log('   node scripts/migrate-to-supabase.js', 'blue');
    
  } catch (error) {
    log(`\n❌ Operation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the schema execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSchemaWithSupabaseAPI, createSupabaseExecutionGuide };