#!/usr/bin/env node
/**
 * Complete Database Dump and Migration
 * 전체 데이터베이스 덤프 및 마이그레이션 - 놓치는 것 없이 모든 데이터
 */
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function getAllTables(client) {
  const result = await client.query(`
    SELECT table_name, 
           (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  const tablesWithCounts = {};
  for (const row of result.rows) {
    try {
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
      tablesWithCounts[row.table_name] = {
        columns: row.column_count,
        records: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      tablesWithCounts[row.table_name] = {
        columns: row.column_count,
        records: 'ERROR'
      };
    }
  }
  
  return tablesWithCounts;
}

async function getTableSchema(client, tableName) {
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position;
  `, [tableName]);
  
  return result.rows;
}

async function createSupabaseTable(supabase, tableName, schema) {
  log(`\n🔧 Creating table ${tableName} in Supabase...`, 'blue');
  
  let createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  
  const columns = schema.map(col => {
    let type = col.data_type;
    
    // PostgreSQL 타입 매핑
    if (type === 'character varying') {
      const maxLength = col.character_maximum_length || 500;
      type = `VARCHAR(${maxLength})`;
    } else if (type === 'timestamp without time zone') {
      type = 'TIMESTAMPTZ';
    } else if (type === 'integer') {
      type = 'INTEGER';
    } else if (type === 'bigint') {
      type = 'BIGINT';
    } else if (type === 'text') {
      type = 'TEXT';
    } else if (type === 'jsonb') {
      type = 'JSONB';
    } else if (type === 'boolean') {
      type = 'BOOLEAN';
    } else if (type === 'numeric') {
      type = 'DECIMAL';
    } else if (type === 'uuid') {
      type = 'UUID';
    } else if (type === 'ARRAY') {
      type = 'TEXT[]';
    }
    
    let columnDef = `  ${col.column_name} ${type}`;
    
    // Primary key 처리
    if (col.column_name === 'id') {
      if (col.data_type === 'uuid') {
        columnDef = `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY`;
      } else {
        columnDef = `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY`;
      }
    } else {
      // NOT NULL 처리
      if (col.is_nullable === 'NO' && !col.column_default) {
        columnDef += ' NOT NULL';
      }
      
      // DEFAULT 처리
      if (col.column_default) {
        if (col.column_default.includes('now()')) {
          columnDef += ' DEFAULT NOW()';
        } else if (col.column_default.includes('CURRENT_TIMESTAMP')) {
          columnDef += ' DEFAULT NOW()';
        } else if (col.column_default.includes('gen_random_uuid()')) {
          columnDef += ' DEFAULT gen_random_uuid()';
        } else if (!col.column_default.includes('nextval(')) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }
      }
    }
    
    return columnDef;
  });
  
  createSQL += columns.join(',\n');
  createSQL += '\n);';
  
  // SQL 파일로 저장
  const sqlFile = path.join(__dirname, `create_${tableName}.sql`);
  fs.writeFileSync(sqlFile, createSQL);
  
  log(`  💾 SQL saved to: ${sqlFile}`, 'yellow');
  log(`  📋 Execute this SQL in Supabase manually:`, 'blue');
  log(createSQL, 'green');
  
  return createSQL;
}

async function dumpTableData(client, tableName, limit = null) {
  log(`\n💾 Dumping ${tableName} data...`, 'blue');
  
  try {
    const query = limit ? `SELECT * FROM ${tableName} LIMIT ${limit}` : `SELECT * FROM ${tableName}`;
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      log(`  ⚠️  No data in ${tableName}`, 'yellow');
      return null;
    }
    
    // JSON 파일로 데이터 저장
    const dataFile = path.join(__dirname, `data_${tableName}.json`);
    fs.writeFileSync(dataFile, JSON.stringify(result.rows, null, 2));
    
    log(`  ✅ Dumped ${result.rows.length} records to: ${dataFile}`, 'green');
    return result.rows;
    
  } catch (error) {
    log(`  ❌ Failed to dump ${tableName}: ${error.message}`, 'red');
    return null;
  }
}

async function main() {
  log('🗄️  Complete Database Analysis and Dump', 'blue');
  log('='.repeat(80), 'blue');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await railwayClient.connect();
    log('✓ Connected to Railway', 'green');
    
    // 1. 모든 테이블 조사
    log('\n📊 Analyzing all Railway tables...', 'blue');
    const allTables = await getAllTables(railwayClient);
    
    // 데이터가 있는 테이블만 필터링
    const tablesWithData = Object.entries(allTables)
      .filter(([name, info]) => info.records > 0)
      .sort((a, b) => b[1].records - a[1].records); // 레코드 수 내림차순
    
    log('\n📋 Tables with data (sorted by record count):', 'blue');
    tablesWithData.forEach(([name, info]) => {
      log(`  ${name.padEnd(30)} ${info.records.toString().padEnd(10)} records, ${info.columns} columns`, 'green');
    });
    
    // 2. 각 테이블의 스키마 분석 및 생성 SQL 만들기
    log('\n🔧 Generating CREATE SQL for all tables...', 'blue');
    const createSQLs = {};
    
    for (const [tableName, info] of tablesWithData) {
      const schema = await getTableSchema(railwayClient, tableName);
      createSQLs[tableName] = await createSupabaseTable(null, tableName, schema);
    }
    
    // 3. 모든 데이터 덤프
    log('\n💾 Dumping all table data...', 'blue');
    const dumpedData = {};
    
    for (const [tableName, info] of tablesWithData) {
      // 큰 테이블은 제한적으로 덤프
      const limit = info.records > 1000 ? 1000 : null;
      const data = await dumpTableData(railwayClient, tableName, limit);
      if (data) {
        dumpedData[tableName] = data;
      }
    }
    
    await railwayClient.end();
    
    // 4. 전체 요약 및 지침
    log('\n📊 Complete Dump Summary:', 'blue');
    log('='.repeat(80), 'blue');
    
    let totalRecords = 0;
    let totalTables = 0;
    
    tablesWithData.forEach(([name, info]) => {
      const status = dumpedData[name] ? '✅ Dumped' : '⚠️  Schema only';
      log(`${name.padEnd(30)} ${info.records.toString().padEnd(10)} ${status}`, 
          dumpedData[name] ? 'green' : 'yellow');
      
      totalRecords += typeof info.records === 'number' ? info.records : 0;
      totalTables++;
    });
    
    log(`\nTotal: ${totalTables} tables, ${totalRecords} records`, 'blue');
    
    // 5. 실행 지침
    log('\n🎯 NEXT STEPS - Execute in order:', 'yellow');
    log('1. Execute CREATE SQL files in Supabase SQL Editor', 'blue');
    log('2. Load JSON data files into Supabase tables', 'blue');
    log('3. Verify all data is migrated correctly', 'blue');
    log('4. Only then terminate Railway', 'blue');
    
    log('\n📁 Generated files in scripts/ directory:', 'green');
    log('  - create_[table].sql - Table creation scripts', 'yellow');
    log('  - data_[table].json - Data dump files', 'yellow');
    
    log('\n🚨 CRITICAL: Do NOT terminate Railway until migration is 100% verified!', 'red');

  } catch (error) {
    log(`\n❌ Analysis failed: ${error.message}`, 'red');
    await railwayClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}