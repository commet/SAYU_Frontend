require('dotenv').config();
const { Pool } = require('pg');

async function testMultilingualQueries() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🧪 다국어 쿼리 테스트 시작...\n');

        // 1. 한국어 모드 - 서울 미술관
        console.log('1. 한국어 모드 - 서울 미술관:');
        const seoulMuseumsKo = await client.query(`
            SELECT 
                COALESCE(name_ko, name) as name,
                COALESCE(city_ko, city) as city,
                venue_type,
                rating
            FROM global_venues
            WHERE (city = '서울' OR city_ko = '서울')
            AND venue_type = 'museum'
            ORDER BY rating DESC NULLS LAST
            LIMIT 5
        `);
        
        seoulMuseumsKo.rows.forEach((venue, i) => {
            console.log(`  ${i+1}. ${venue.name} (${venue.city}) - ⭐ ${venue.rating || 'N/A'}`);
        });
        console.log('');

        // 2. 영어 모드 - 뉴욕 갤러리
        console.log('2. 영어 모드 - 뉴욕 갤러리:');
        const nycGalleriesEn = await client.query(`
            SELECT 
                COALESCE(name_en, name) as name,
                COALESCE(city_en, city) as city,
                venue_type,
                data_quality_score
            FROM global_venues
            WHERE city = 'New York'
            AND venue_type = 'gallery'
            ORDER BY data_quality_score DESC
            LIMIT 5
        `);
        
        nycGalleriesEn.rows.forEach((venue, i) => {
            console.log(`  ${i+1}. ${venue.name} (${venue.city}) - 품질: ${venue.data_quality_score}`);
        });
        console.log('');

        // 3. 한국어로 해외 미술관 보기
        console.log('3. 한국어로 파리 미술관 보기:');
        const parisMuseumsKo = await client.query(`
            SELECT 
                name,
                name_ko,
                COALESCE(name_ko, name) as display_name,
                COALESCE(city_ko, city) as display_city,
                venue_type
            FROM global_venues
            WHERE city = 'Paris'
            AND venue_type = 'museum'
            LIMIT 5
        `);
        
        parisMuseumsKo.rows.forEach((venue, i) => {
            console.log(`  ${i+1}. ${venue.display_name} (${venue.display_city})`);
            if (venue.name_ko && venue.name_ko !== venue.name) {
                console.log(`      원명: ${venue.name}`);
            }
        });
        console.log('');

        // 4. 다국어 검색 테스트
        console.log('4. "갤러리" 검색 테스트:');
        const searchGallery = await client.query(`
            SELECT 
                name,
                name_ko,
                COALESCE(name_ko, name) as display_name,
                COALESCE(city_ko, city) as display_city,
                country
            FROM global_venues
            WHERE (
                name ILIKE '%갤러리%' OR 
                name_ko ILIKE '%갤러리%' OR
                name ILIKE '%Gallery%'
            )
            ORDER BY 
                CASE 
                    WHEN name_ko ILIKE '%갤러리%' THEN 1
                    WHEN name ILIKE '%갤러리%' THEN 2
                    ELSE 3
                END,
                data_quality_score DESC
            LIMIT 8
        `);
        
        searchGallery.rows.forEach((venue, i) => {
            console.log(`  ${i+1}. ${venue.display_name} (${venue.display_city}, ${venue.country})`);
        });
        console.log('');

        // 5. 도시 번역 상태 확인
        console.log('5. 도시 번역 현황:');
        const cityTranslations = await client.query(`
            SELECT 
                city as original,
                city_ko,
                city_en,
                COUNT(*) as count
            FROM global_venues
            WHERE city_ko IS NOT NULL OR city_en IS NOT NULL
            GROUP BY city, city_ko, city_en
            ORDER BY count DESC
            LIMIT 10
        `);
        
        cityTranslations.rows.forEach((city, i) => {
            console.log(`  ${i+1}. ${city.original} | 한글: ${city.city_ko || 'N/A'} | 영어: ${city.city_en || 'N/A'} (${city.count}개)`);
        });
        console.log('');

        // 6. 국가별 번역 통계
        console.log('6. 국가별 번역 통계:');
        const translationStats = await client.query(`
            SELECT 
                country,
                COUNT(*) as total,
                COUNT(name_ko) as has_korean,
                COUNT(name_en) as has_english,
                ROUND(COUNT(name_ko)::numeric / COUNT(*)::numeric * 100, 1) as korean_percent,
                ROUND(COUNT(name_en)::numeric / COUNT(*)::numeric * 100, 1) as english_percent
            FROM global_venues
            GROUP BY country
            ORDER BY total DESC
            LIMIT 10
        `);
        
        console.log('국가'.padEnd(20), '총계', '한글명', '영문명', '한글%', '영문%');
        console.log('-'.repeat(60));
        translationStats.rows.forEach(stat => {
            console.log(
                stat.country.padEnd(20),
                String(stat.total).padStart(4),
                String(stat.has_korean).padStart(6),
                String(stat.has_english).padStart(6),
                String(stat.korean_percent).padStart(5) + '%',
                String(stat.english_percent).padStart(5) + '%'
            );
        });

        client.release();
        console.log('\n✅ 다국어 쿼리 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    } finally {
        await pool.end();
    }
}

testMultilingualQueries();