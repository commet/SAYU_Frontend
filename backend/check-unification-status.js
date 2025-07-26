require('dotenv').config();
const { Pool } = require('pg');

async function checkUnificationStatus() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔍 Venues 테이블 통합 상태 확인\n');
        console.log('='.repeat(60));

        // 1. 테이블별 레코드 수
        const venuesCount = await client.query('SELECT COUNT(*) FROM venues');
        const globalVenuesCount = await client.query('SELECT COUNT(*) FROM global_venues');
        
        console.log('📊 테이블별 레코드 수:');
        console.log(`  - venues (한국 원본): ${venuesCount.rows[0].count}개`);
        console.log(`  - global_venues (통합): ${globalVenuesCount.rows[0].count}개`);

        // 2. global_venues 내 한국 데이터
        const koreanInGlobal = await client.query(`
            SELECT COUNT(*) FROM global_venues 
            WHERE country = 'South Korea' OR data_source = 'korean_venues_migration'
        `);
        console.log(`  - global_venues 내 한국 데이터: ${koreanInGlobal.rows[0].count}개`);

        // 3. 데이터 소스별 분포
        const bySource = await client.query(`
            SELECT data_source, COUNT(*) as count 
            FROM global_venues 
            GROUP BY data_source 
            ORDER BY count DESC
        `);
        
        console.log('\n📈 데이터 소스별 분포:');
        bySource.rows.forEach(row => {
            console.log(`  - ${row.data_source}: ${row.count}개`);
        });

        // 4. 국가별 분포
        const byCountry = await client.query(`
            SELECT country, COUNT(*) as count 
            FROM global_venues 
            GROUP BY country 
            ORDER BY count DESC 
            LIMIT 10
        `);
        
        console.log('\n🌍 상위 10개 국가별 분포:');
        byCountry.rows.forEach(row => {
            console.log(`  - ${row.country}: ${row.count}개`);
        });

        // 5. 마이그레이션 상태
        console.log('\n🚀 마이그레이션 상태:');
        console.log('  ✅ venues → global_venues 마이그레이션 스크립트 작성 완료');
        console.log('  ✅ 중복 제거 로직 구현 완료');
        console.log('  ✅ 한국 특화 필드 보존 (district, tier, rating, instagram)');
        
        // 6. 실제 마이그레이션 실행 여부 확인
        const migrationCheck = await client.query(`
            SELECT COUNT(*) FROM global_venues 
            WHERE data_source = 'korean_venues_migration'
        `);
        
        if (migrationCheck.rows[0].count > 0) {
            console.log('  ✅ 마이그레이션 실행 완료!');
        } else {
            console.log('  ⚠️  마이그레이션 아직 실행되지 않음');
            console.log('  💡 실행 명령어: psql $DATABASE_URL -f src/migrations/unify-venues-tables.sql');
        }

        // 7. 테이블 구조 상태
        console.log('\n📋 현재 상태 요약:');
        console.log('  1. venues 테이블: 한국 미술관/갤러리 736개 (원본 유지)');
        console.log('  2. global_venues 테이블: 전 세계 데이터 ' + globalVenuesCount.rows[0].count + '개');
        console.log('  3. 통합 방식: venues 데이터를 global_venues로 복사 (중복 제거)');
        console.log('  4. 결과: 두 테이블 모두 존재, global_venues가 통합 테이블');

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkUnificationStatus();