require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function applyMultilingualMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🌐 다국어 지원 마이그레이션 시작...\n');

        const client = await pool.connect();
        
        // SQL 파일 읽기
        const sqlPath = path.join(__dirname, 'src/migrations/add-multilingual-fields.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        
        // SQL 실행
        await client.query(sql);
        
        console.log('✅ 마이그레이션 완료!\n');
        
        // 결과 확인
        console.log('📊 번역 상태 확인:\n');
        const translationStatus = await client.query(`
            SELECT * FROM venue_translation_status 
            LIMIT 10
        `);
        
        console.log('국가'.padEnd(20), '총계', '영어명', '한글명', '영어%', '한글%');
        console.log('-'.repeat(60));
        
        translationStatus.rows.forEach(row => {
            console.log(
                row.country.padEnd(20),
                String(row.total_venues).padStart(4),
                String(row.has_name_en).padStart(6),
                String(row.has_name_ko).padStart(6),
                String(row.name_en_coverage).padStart(6) + '%',
                String(row.name_ko_coverage).padStart(6) + '%'
            );
        });
        
        // 도시 번역 샘플
        console.log('\n🏙️ 도시 번역 샘플:\n');
        const citySamples = await client.query(`
            SELECT DISTINCT 
                v.country,
                v.city as city_original,
                v.city_en,
                v.city_ko,
                ct.province_ko,
                ct.province_en
            FROM global_venues v
            LEFT JOIN city_translations ct 
                ON v.country = ct.country 
                AND (v.city = ct.city_original OR v.city = ct.city_en)
            WHERE v.city_ko IS NOT NULL OR v.city_en IS NOT NULL
            LIMIT 20
        `);
        
        console.log('국가'.padEnd(20), '원본'.padEnd(15), '영어'.padEnd(15), '한글'.padEnd(15), '도/주');
        console.log('-'.repeat(80));
        
        citySamples.rows.forEach(row => {
            console.log(
                row.country.padEnd(20),
                (row.city_original || '').padEnd(15),
                (row.city_en || '').padEnd(15),
                (row.city_ko || '').padEnd(15),
                row.province_ko || row.province_en || ''
            );
        });
        
        // 주요 미술관 번역 필요 목록
        console.log('\n📝 번역이 필요한 주요 미술관 (상위 20개):\n');
        const needsTranslation = await client.query(`
            SELECT 
                name,
                country,
                city,
                data_quality_score
            FROM global_venues
            WHERE name_ko IS NULL 
            AND country != 'South Korea'
            AND data_quality_score > 80
            ORDER BY data_quality_score DESC
            LIMIT 20
        `);
        
        console.log('미술관명'.padEnd(40), '국가'.padEnd(15), '도시'.padEnd(15), '품질');
        console.log('-'.repeat(80));
        
        needsTranslation.rows.forEach(row => {
            console.log(
                row.name.substring(0, 40).padEnd(40),
                row.country.padEnd(15),
                row.city.padEnd(15),
                row.data_quality_score
            );
        });
        
        client.release();
        
    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

applyMultilingualMigration();