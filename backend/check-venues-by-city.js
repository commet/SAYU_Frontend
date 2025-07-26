require('dotenv').config();
const { Pool } = require('pg');

async function checkVenuesByCity() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🌍 도시별 기관 수 분석\n');
        console.log('='.repeat(60));

        // 1. 전체 도시별 통계
        const cityStats = await client.query(`
            SELECT 
                city, 
                country, 
                COUNT(*) as venue_count,
                COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museums,
                COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as galleries,
                COUNT(CASE WHEN venue_type = 'art_center' THEN 1 END) as art_centers,
                COUNT(CASE WHEN venue_type = 'cultural_center' THEN 1 END) as cultural_centers
            FROM global_venues
            GROUP BY city, country
            ORDER BY venue_count DESC
        `);

        console.log('📊 상위 30개 도시:\n');
        console.log('도시'.padEnd(20), '국가'.padEnd(15), '총계', '박물관', '갤러리', '아트센터', '문화센터');
        console.log('-'.repeat(80));
        
        cityStats.rows.slice(0, 30).forEach(row => {
            console.log(
                row.city.padEnd(20),
                row.country.padEnd(15),
                String(row.venue_count).padStart(4),
                String(row.museums).padStart(7),
                String(row.galleries).padStart(7),
                String(row.art_centers).padStart(8),
                String(row.cultural_centers).padStart(8)
            );
        });

        // 2. 한국 도시별 통계
        const koreanCities = await client.query(`
            SELECT 
                city,
                COUNT(*) as venue_count,
                COUNT(DISTINCT district) as district_count,
                COUNT(CASE WHEN tier = 1 THEN 1 END) as tier1,
                COUNT(CASE WHEN tier = 2 THEN 1 END) as tier2,
                COUNT(CASE WHEN tier >= 3 THEN 1 END) as tier3plus
            FROM global_venues
            WHERE country IN ('South Korea', 'KR')
            GROUP BY city
            ORDER BY venue_count DESC
        `);

        console.log('\n\n🇰🇷 한국 도시별 상세:\n');
        console.log('도시'.padEnd(15), '총계', '구/군', 'Tier1', 'Tier2', 'Tier3+');
        console.log('-'.repeat(60));
        
        koreanCities.rows.forEach(row => {
            console.log(
                row.city.padEnd(15),
                String(row.venue_count).padStart(4),
                String(row.district_count).padStart(5),
                String(row.tier1).padStart(6),
                String(row.tier2).padStart(6),
                String(row.tier3plus).padStart(6)
            );
        });

        // 3. 주요 국제 도시
        const majorCities = ['New York', 'Paris', 'London', 'Tokyo', 'Hong Kong', 'Berlin', 'Amsterdam'];
        console.log('\n\n🌏 주요 국제 도시 상세:\n');
        
        for (const city of majorCities) {
            const details = await client.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museums,
                    COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as galleries,
                    MIN(data_quality_score) as min_score,
                    MAX(data_quality_score) as max_score,
                    AVG(data_quality_score)::NUMERIC(5,2) as avg_score
                FROM global_venues
                WHERE city = $1
            `, [city]);
            
            const row = details.rows[0];
            if (row.total > 0) {
                console.log(`${city}:`.padEnd(15), 
                    `총 ${row.total}개 (박물관: ${row.museums}, 갤러리: ${row.galleries})`,
                    `품질점수: ${row.min_score}-${row.max_score} (평균: ${row.avg_score})`
                );
            }
        }

        // 4. 국가별 도시 분포
        const countryStats = await client.query(`
            SELECT 
                country,
                COUNT(DISTINCT city) as city_count,
                COUNT(*) as venue_count
            FROM global_venues
            GROUP BY country
            ORDER BY venue_count DESC
            LIMIT 15
        `);

        console.log('\n\n🌐 국가별 도시 분포 (상위 15개국):\n');
        console.log('국가'.padEnd(20), '도시수', '기관수');
        console.log('-'.repeat(40));
        
        countryStats.rows.forEach(row => {
            console.log(
                row.country.padEnd(20),
                String(row.city_count).padStart(6),
                String(row.venue_count).padStart(6)
            );
        });

        // 5. 데이터 품질별 분포
        const qualityDist = await client.query(`
            SELECT 
                CASE 
                    WHEN data_quality_score >= 80 THEN '우수 (80+)'
                    WHEN data_quality_score >= 60 THEN '양호 (60-79)'
                    WHEN data_quality_score >= 40 THEN '보통 (40-59)'
                    WHEN data_quality_score >= 20 THEN '미흡 (20-39)'
                    ELSE '부족 (0-19)'
                END as quality_level,
                COUNT(*) as count
            FROM global_venues
            GROUP BY quality_level
            ORDER BY 
                CASE quality_level
                    WHEN '우수 (80+)' THEN 1
                    WHEN '양호 (60-79)' THEN 2
                    WHEN '보통 (40-59)' THEN 3
                    WHEN '미흡 (20-39)' THEN 4
                    ELSE 5
                END
        `);

        console.log('\n\n📈 데이터 품질 분포:\n');
        qualityDist.rows.forEach(row => {
            console.log(`${row.quality_level}: ${row.count}개`);
        });

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkVenuesByCity();