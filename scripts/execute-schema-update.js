const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSchemaUpdate() {
  console.log('🔧 exhibitions 테이블 스키마 업데이트 실행 중...\n');
  
  try {
    // SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, 'add-exhibitions-columns.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // SQL을 세미콜론으로 분할하여 각각 실행
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement.length > 0) {
        try {
          console.log(`📝 실행 중: ${trimmedStatement.substring(0, 50)}...`);
          await pool.query(trimmedStatement);
          console.log('✅ 완료');
        } catch (error) {
          console.log(`⚠️  경고: ${error.message}`);
          // 컬럼이 이미 존재하는 경우는 무시
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }
    
    console.log('\n🎉 스키마 업데이트 완료!');
    
    // 업데이트된 스키마 확인
    console.log('\n📊 현재 테이블 구조 확인:');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' 
      ORDER BY ordinal_position;
    `);
    
    console.log('컬럼 목록:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });
    
  } catch (error) {
    console.error('❌ 스키마 업데이트 중 오류 발생:', error.message);
    if (error.detail) console.error('세부사항:', error.detail);
    if (error.hint) console.error('힌트:', error.hint);
  } finally {
    await pool.end();
  }
}

// 실행
executeSchemaUpdate();