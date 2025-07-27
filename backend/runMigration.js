// 마이그레이션 실행 스크립트

require('dotenv').config();
const { pool } = require('./src/config/database');
const fs = require('fs').promises;

async function runMigration(migrationFile) {
  console.log('🔧 마이그레이션 실행 중...');
  
  try {
    const sql = await fs.readFile(migrationFile || './src/migrations/add_external_data_column.sql', 'utf-8');
    
    // SQL 문을 개별적으로 실행
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('실행:', statement.trim().substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('✅ 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    await pool.end();
  }
}

runMigration(process.argv[2]);