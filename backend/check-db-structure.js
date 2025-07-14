const { pool } = require('./src/config/database');

async function checkDatabaseStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 현재 데이터베이스 구조 확인...\n');

    // 1. 모든 테이블 목록
    const tablesQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await client.query(tablesQuery);
    console.log('📋 사용 가능한 테이블들:');
    tables.rows.forEach(table => {
      console.log(`   ${table.table_name} (${table.table_type})`);
    });

    // 2. pgvector 확장 상태
    const extensionQuery = `
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector';
    `;
    
    const extension = await client.query(extensionQuery);
    console.log('\n🧩 pgvector 확장:');
    if (extension.rows.length > 0) {
      console.log(`   ✅ 설치됨 (버전: ${extension.rows[0].extversion})`);
    } else {
      console.log('   ❌ 설치되지 않음');
    }

    // 3. 벡터 컬럼이 있는 테이블 확인
    const vectorColumnsQuery = `
      SELECT 
        table_name, 
        column_name, 
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (data_type = 'USER-DEFINED' AND udt_name = 'vector')
      ORDER BY table_name, column_name;
    `;
    
    const vectorColumns = await client.query(vectorColumnsQuery);
    console.log('\n🔢 벡터 컬럼들:');
    if (vectorColumns.rows.length > 0) {
      vectorColumns.rows.forEach(col => {
        console.log(`   ${col.table_name}.${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('   ❌ 벡터 컬럼 없음');
    }

    // 4. 벡터 인덱스 확인
    const indexQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE indexname LIKE '%vector%' OR indexdef LIKE '%vector%'
      ORDER BY tablename, indexname;
    `;
    
    const indexes = await client.query(indexQuery);
    console.log('\n📊 벡터 인덱스들:');
    if (indexes.rows.length > 0) {
      indexes.rows.forEach(idx => {
        console.log(`   ${idx.tablename}.${idx.indexname}`);
      });
    } else {
      console.log('   ❌ 벡터 인덱스 없음');
    }

    // 5. 실제 필요한 테이블들 확인
    const requiredTables = ['users', 'user_profiles', 'quiz_results', 'artworks', 'artvee_artworks'];
    console.log('\n🎯 필요한 테이블 확인:');
    
    for (const tableName of requiredTables) {
      const checkQuery = `
        SELECT COUNT(*) as exists 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1;
      `;
      
      const result = await client.query(checkQuery, [tableName]);
      const exists = result.rows[0].exists > 0;
      console.log(`   ${tableName}: ${exists ? '✅' : '❌'}`);
      
      if (exists) {
        // 컬럼 정보도 출력
        const columnsQuery = `
          SELECT column_name, data_type, udt_name
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `;
        
        const columns = await client.query(columnsQuery, [tableName]);
        console.log(`     컬럼들: ${columns.rows.map(col => col.column_name).join(', ')}`);
      }
    }

  } catch (error) {
    console.error('❌ 데이터베이스 구조 확인 실패:', error.message);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  checkDatabaseStructure()
    .then(() => {
      console.log('\n✅ 데이터베이스 구조 확인 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 확인 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStructure };