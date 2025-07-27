#!/usr/bin/env node
/**
 * Analyze Railway schema for key tables
 * Railway의 핵심 테이블 스키마 분석
 */
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

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

async function analyzeTableSchema(client, tableName) {
  log(`\n📋 Analyzing ${tableName} schema:`, 'blue');
  
  try {
    // 테이블 구조 조회
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(schemaQuery, [tableName]);
    
    if (result.rows.length === 0) {
      log(`  ❌ Table ${tableName} does not exist`, 'red');
      return null;
    }
    
    log(`  Found ${result.rows.length} columns:`, 'green');
    
    const columns = [];
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      log(`    ${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${nullable}${defaultVal}`, 'yellow');
      columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default
      });
    });
    
    return columns;
    
  } catch (error) {
    log(`  ✗ Error analyzing ${tableName}: ${error.message}`, 'red');
    return null;
  }
}

async function generateCreateSQL(tableName, columns) {
  if (!columns) return null;
  
  log(`\n🔧 Generated CREATE SQL for ${tableName}:`, 'blue');
  
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  
  const columnDefs = columns.map(col => {
    let type = col.type;
    
    // PostgreSQL 타입을 Supabase 호환으로 변환
    if (type === 'integer') type = 'INTEGER';
    if (type === 'bigint') type = 'BIGINT';
    if (type === 'character varying') type = 'VARCHAR(500)';
    if (type === 'text') type = 'TEXT';
    if (type === 'jsonb') type = 'JSONB';
    if (type === 'timestamp with time zone') type = 'TIMESTAMPTZ';
    if (type === 'boolean') type = 'BOOLEAN';
    if (type === 'numeric') type = 'DECIMAL';
    if (type === 'uuid') type = 'UUID';
    
    let def = `  ${col.name} ${type}`;
    
    // Primary key 처리
    if (col.name === 'id' && col.default && col.default.includes('gen_random_uuid')) {
      def = `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY`;
    } else if (col.name === 'id') {
      def = `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY`;
    } else {
      // NULL 제약 조건
      if (!col.nullable && !col.default) {
        def += ' NOT NULL';
      }
      
      // DEFAULT 값
      if (col.default && !col.default.includes('nextval') && !col.default.includes('gen_random_uuid')) {
        if (col.default === 'now()') {
          def += ' DEFAULT NOW()';
        } else {
          def += ` DEFAULT ${col.default}`;
        }
      }
    }
    
    return def;
  });
  
  sql += columnDefs.join(',\n');
  sql += '\n);';
  
  log(sql, 'green');
  return sql;
}

async function main() {
  log('🔍 Railway Schema Analysis', 'blue');
  log('='.repeat(50), 'blue');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const criticalTables = [
    'artists',
    'global_venues', 
    'artvee_artworks',
    'apt_profiles'
  ];

  try {
    await client.connect();
    log('✓ Connected to Railway', 'green');
    
    const schemas = {};
    
    for (const tableName of criticalTables) {
      const columns = await analyzeTableSchema(client, tableName);
      if (columns) {
        schemas[tableName] = columns;
        await generateCreateSQL(tableName, columns);
      }
    }
    
    await client.end();
    
    log('\n📊 Schema Analysis Complete', 'blue');
    log('Copy the CREATE SQL statements above to Supabase SQL Editor', 'yellow');

  } catch (error) {
    log(`\n❌ Analysis failed: ${error.message}`, 'red');
    await client.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}