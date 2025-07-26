require('dotenv').config();
const { Pool } = require('pg');

async function fixCountryCityConsistency() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔧 국가/도시명 일관성 수정 작업 시작\n');

        // 1. 현재 국가 코드 현황 확인
        const countryIssues = await client.query(`
            SELECT DISTINCT country, COUNT(*) as count
            FROM global_venues
            GROUP BY country
            ORDER BY country
        `);

        console.log('📊 현재 국가명 현황:');
        countryIssues.rows.forEach(row => {
            console.log(`  ${row.country}: ${row.count}개`);
        });

        // 2. 국가 코드 표준화
        console.log('\n🌍 국가명 표준화 시작...');
        
        const countryMappings = [
            // 한국 통일
            { old: 'KR', new: 'South Korea' },
            { old: 'Korea', new: 'South Korea' },
            { old: 'korea', new: 'South Korea' },
            // 미국 통일
            { old: 'US', new: 'United States' },
            { old: 'USA', new: 'United States' },
            // 중국 통일
            { old: 'CN', new: 'China' },
            { old: 'CHN', new: 'China' },
            // 일본 통일
            { old: 'JP', new: 'Japan' },
            { old: 'JPN', new: 'Japan' },
            // 독일 통일
            { old: 'DE', new: 'Germany' },
            { old: 'DEU', new: 'Germany' },
            // 영국 통일
            { old: 'UK', new: 'United Kingdom' },
            { old: 'GB', new: 'United Kingdom' },
            { old: 'England', new: 'United Kingdom' },
            // 프랑스 통일
            { old: 'FR', new: 'France' },
            { old: 'FRA', new: 'France' },
            // 네덜란드 통일
            { old: 'NL', new: 'Netherlands' },
            { old: 'NLD', new: 'Netherlands' },
            { old: 'Holland', new: 'Netherlands' }
        ];

        for (const mapping of countryMappings) {
            const result = await client.query(
                'UPDATE global_venues SET country = $1 WHERE country = $2',
                [mapping.new, mapping.old]
            );
            if (result.rowCount > 0) {
                console.log(`  ✅ ${mapping.old} → ${mapping.new}: ${result.rowCount}개 업데이트`);
            }
        }

        // 3. 한국 도시명 정리
        console.log('\n🏙️ 한국 도시명 정리...');
        
        const koreanCityMappings = [
            // 서울 통일
            { old: 'Seoul', new: '서울' },
            { old: 'seoul', new: '서울' },
            { old: '서울특별시', new: '서울' },
            { old: '서울시', new: '서울' },
            // 부산 통일
            { old: 'Busan', new: '부산' },
            { old: 'busan', new: '부산' },
            { old: '부산광역시', new: '부산' },
            { old: '부산시', new: '부산' },
            // 대구 통일
            { old: 'Daegu', new: '대구' },
            { old: 'daegu', new: '대구' },
            { old: '대구광역시', new: '대구' },
            // 인천 통일
            { old: 'Incheon', new: '인천' },
            { old: 'incheon', new: '인천' },
            { old: '인천광역시', new: '인천' },
            // 광주 통일
            { old: 'Gwangju', new: '광주' },
            { old: 'gwangju', new: '광주' },
            { old: '광주광역시', new: '광주' },
            // 대전 통일
            { old: 'Daejeon', new: '대전' },
            { old: 'daejeon', new: '대전' },
            { old: '대전광역시', new: '대전' },
            // 울산 통일
            { old: 'Ulsan', new: '울산' },
            { old: 'ulsan', new: '울산' },
            { old: '울산광역시', new: '울산' },
            // 제주 통일
            { old: 'Jeju', new: '제주' },
            { old: 'jeju', new: '제주' },
            { old: '제주시', new: '제주' },
            { old: '제주특별자치도', new: '제주도' }
        ];

        for (const mapping of koreanCityMappings) {
            const result = await client.query(
                'UPDATE global_venues SET city = $1 WHERE city = $2 AND country = $3',
                [mapping.new, mapping.old, 'South Korea']
            );
            if (result.rowCount > 0) {
                console.log(`  ✅ ${mapping.old} → ${mapping.new}: ${result.rowCount}개 업데이트`);
            }
        }

        // 4. 도(province) 레벨 데이터 처리
        console.log('\n📍 도(province) 레벨 데이터 처리...');
        
        // 도 단위 데이터는 별도 province 필드로 이동하거나 city를 구체화
        const provinceData = await client.query(`
            SELECT DISTINCT city, COUNT(*) as count
            FROM global_venues
            WHERE country = 'South Korea'
            AND city LIKE '%도'
            GROUP BY city
        `);

        console.log('도 단위 데이터 현황:');
        provinceData.rows.forEach(row => {
            console.log(`  ${row.city}: ${row.count}개`);
        });

        // 5. 해외 도시 영문 표준화
        console.log('\n🌏 해외 도시명 표준화...');
        
        const intlCityMappings = [
            { country: 'United States', old: 'NYC', new: 'New York' },
            { country: 'United States', old: 'new york', new: 'New York' },
            { country: 'United States', old: 'NEW YORK', new: 'New York' },
            { country: 'United Kingdom', old: 'london', new: 'London' },
            { country: 'United Kingdom', old: 'LONDON', new: 'London' },
            { country: 'France', old: 'paris', new: 'Paris' },
            { country: 'France', old: 'PARIS', new: 'Paris' },
            { country: 'Japan', old: 'tokyo', new: 'Tokyo' },
            { country: 'Japan', old: 'TOKYO', new: 'Tokyo' },
            { country: 'Germany', old: 'berlin', new: 'Berlin' },
            { country: 'Germany', old: 'BERLIN', new: 'Berlin' }
        ];

        for (const mapping of intlCityMappings) {
            const result = await client.query(
                'UPDATE global_venues SET city = $1 WHERE city = $2 AND country = $3',
                [mapping.new, mapping.old, mapping.country]
            );
            if (result.rowCount > 0) {
                console.log(`  ✅ ${mapping.old} → ${mapping.new} (${mapping.country}): ${result.rowCount}개`);
            }
        }

        // 6. 최종 검증
        console.log('\n✅ 수정 완료! 최종 국가/도시 분포:');
        
        const finalStats = await client.query(`
            SELECT 
                country,
                COUNT(DISTINCT city) as city_count,
                COUNT(*) as venue_count
            FROM global_venues
            GROUP BY country
            ORDER BY venue_count DESC
            LIMIT 20
        `);

        console.log('\n국가별 통계:');
        console.log('국가'.padEnd(20), '도시수', '기관수');
        console.log('-'.repeat(40));
        finalStats.rows.forEach(row => {
            console.log(row.country.padEnd(20), String(row.city_count).padStart(6), String(row.venue_count).padStart(6));
        });

        // 한국 도시 상세
        const koreanCities = await client.query(`
            SELECT city, COUNT(*) as count
            FROM global_venues
            WHERE country = 'South Korea'
            GROUP BY city
            ORDER BY count DESC
            LIMIT 15
        `);

        console.log('\n한국 주요 도시:');
        koreanCities.rows.forEach(row => {
            console.log(`  ${row.city}: ${row.count}개`);
        });

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixCountryCityConsistency();