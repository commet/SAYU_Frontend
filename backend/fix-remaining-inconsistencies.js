require('dotenv').config();
const { Pool } = require('pg');

async function fixRemainingInconsistencies() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔧 추가 일관성 수정 작업\n');

        // 1. 남은 국가 코드 정리
        console.log('🌍 남은 국가 코드 정리...');
        
        const additionalCountryMappings = [
            { old: 'HK', new: 'Hong Kong' },
            { old: 'SG', new: 'Singapore' },
            { old: 'ES', new: 'Spain' },
            { old: 'IT', new: 'Italy' },
            { old: 'AE', new: 'United Arab Emirates' },
            { old: 'AU', new: 'Australia' },
            { old: 'BR', new: 'Brazil' },
            { old: 'CA', new: 'Canada' },
            { old: 'MX', new: 'Mexico' },
            { old: 'NZ', new: 'New Zealand' },
            { old: 'RU', new: 'Russia' },
            { old: 'TH', new: 'Thailand' },
            { old: 'ZA', new: 'South Africa' },
            { old: 'AT', new: 'Austria' },
            { old: 'AR', new: 'Argentina' },
            { old: 'EG', new: 'Egypt' },
            { old: 'IN', new: 'India' }
        ];

        for (const mapping of additionalCountryMappings) {
            const result = await client.query(
                'UPDATE global_venues SET country = $1 WHERE country = $2',
                [mapping.new, mapping.old]
            );
            if (result.rowCount > 0) {
                console.log(`  ✅ ${mapping.old} → ${mapping.new}: ${result.rowCount}개 업데이트`);
            }
        }

        // 2. 한국 도(Province) 데이터를 province 필드로 이동
        console.log('\n📍 한국 도 데이터 정리...');
        
        // province 필드가 없다면 추가
        await client.query(`
            ALTER TABLE global_venues 
            ADD COLUMN IF NOT EXISTS province VARCHAR(100)
        `);

        // 도 단위 데이터 처리
        const provinceUpdates = [
            { province: '경기도', cities: ['수원', '용인', '성남', '고양', '안양', '부천', '안산', '화성', '남양주', '의정부', '파주', '광명', '양주', '과천', '광주', '양평'] },
            { province: '경상남도', cities: ['창원', '김해', '진주', '거제', '통영', '사천', '밀양', '함안'] },
            { province: '경상북도', cities: ['포항', '경주', '안동', '구미', '영주', '상주', '경산'] },
            { province: '전라남도', cities: ['여수', '순천', '목포', '광양', '나주', '무안'] },
            { province: '전라북도', cities: ['전주', '익산', '군산', '정읍', '김제', '남원'] },
            { province: '충청남도', cities: ['천안', '아산', '서산', '당진', '공주', '보령'] },
            { province: '충청북도', cities: ['청주', '충주', '제천', '음성', '진천'] },
            { province: '강원도', cities: ['춘천', '원주', '강릉', '속초', '동해', '삼척', '양구'] },
            { province: '제주도', cities: ['제주', '서귀포'] }
        ];

        // 도 단위로 저장된 데이터의 city를 Unknown으로 변경하고 province 설정
        for (const update of provinceUpdates) {
            const result = await client.query(`
                UPDATE global_venues 
                SET province = $1, city = CASE WHEN city = $1 THEN 'Unknown' ELSE city END
                WHERE country = 'South Korea' AND (city = $1 OR city = ANY($2::text[]))
            `, [update.province, update.cities]);
            
            if (result.rowCount > 0) {
                console.log(`  ✅ ${update.province} 지역 업데이트: ${result.rowCount}개`);
            }
        }

        // 3. Unknown city 처리 - address에서 도시 추출
        console.log('\n🔍 Unknown 도시 데이터 처리...');
        
        const unknownVenues = await client.query(`
            SELECT id, name, address 
            FROM global_venues 
            WHERE city = 'Unknown' AND country = 'South Korea'
            LIMIT 20
        `);

        console.log(`Unknown 도시 ${unknownVenues.rows.length}개 샘플 확인...`);
        
        // address에서 도시 추출 로직
        for (const venue of unknownVenues.rows) {
            if (venue.address) {
                let extractedCity = null;
                
                // 주요 도시 패턴 매칭
                const cityPatterns = [
                    { pattern: /서울|서울시|서울특별시/, city: '서울' },
                    { pattern: /부산|부산시|부산광역시/, city: '부산' },
                    { pattern: /대구|대구시|대구광역시/, city: '대구' },
                    { pattern: /인천|인천시|인천광역시/, city: '인천' },
                    { pattern: /광주|광주시|광주광역시/, city: '광주' },
                    { pattern: /대전|대전시|대전광역시/, city: '대전' },
                    { pattern: /울산|울산시|울산광역시/, city: '울산' },
                    { pattern: /제주|제주시/, city: '제주' },
                    { pattern: /수원|수원시/, city: '수원' },
                    { pattern: /성남|성남시/, city: '성남' },
                    { pattern: /용인|용인시/, city: '용인' },
                    { pattern: /고양|고양시/, city: '고양' }
                ];

                for (const { pattern, city } of cityPatterns) {
                    if (pattern.test(venue.address)) {
                        extractedCity = city;
                        break;
                    }
                }

                if (extractedCity) {
                    await client.query(
                        'UPDATE global_venues SET city = $1 WHERE id = $2',
                        [extractedCity, venue.id]
                    );
                    console.log(`  📍 ${venue.name}: Unknown → ${extractedCity}`);
                }
            }
        }

        // 4. 영문 도시명 추가 (name_en_city 필드)
        console.log('\n🌐 영문 도시명 필드 추가...');
        
        await client.query(`
            ALTER TABLE global_venues 
            ADD COLUMN IF NOT EXISTS city_en VARCHAR(100)
        `);

        // 한국 주요 도시 영문명 매핑
        const cityEnMappings = [
            { ko: '서울', en: 'Seoul' },
            { ko: '부산', en: 'Busan' },
            { ko: '대구', en: 'Daegu' },
            { ko: '인천', en: 'Incheon' },
            { ko: '광주', en: 'Gwangju' },
            { ko: '대전', en: 'Daejeon' },
            { ko: '울산', en: 'Ulsan' },
            { ko: '제주', en: 'Jeju' },
            { ko: '수원', en: 'Suwon' },
            { ko: '성남', en: 'Seongnam' },
            { ko: '용인', en: 'Yongin' },
            { ko: '고양', en: 'Goyang' },
            { ko: '창원', en: 'Changwon' },
            { ko: '청주', en: 'Cheongju' },
            { ko: '전주', en: 'Jeonju' },
            { ko: '천안', en: 'Cheonan' },
            { ko: '포항', en: 'Pohang' },
            { ko: '원주', en: 'Wonju' },
            { ko: '춘천', en: 'Chuncheon' },
            { ko: '강릉', en: 'Gangneung' }
        ];

        for (const mapping of cityEnMappings) {
            await client.query(
                'UPDATE global_venues SET city_en = $1 WHERE city = $2 AND country = $3',
                [mapping.en, mapping.ko, 'South Korea']
            );
        }

        // 해외 도시는 city를 city_en으로 복사
        await client.query(`
            UPDATE global_venues 
            SET city_en = city 
            WHERE country != 'South Korea' AND city_en IS NULL
        `);

        // 5. 최종 통계
        console.log('\n📊 최종 정리 결과:\n');
        
        const finalStats = await client.query(`
            SELECT 
                country,
                COUNT(DISTINCT city) as cities,
                COUNT(*) as venues,
                COUNT(CASE WHEN city = 'Unknown' THEN 1 END) as unknown_cities
            FROM global_venues
            GROUP BY country
            ORDER BY venues DESC
            LIMIT 15
        `);

        console.log('국가'.padEnd(25), '도시수', '기관수', 'Unknown');
        console.log('-'.repeat(50));
        finalStats.rows.forEach(row => {
            console.log(
                row.country.padEnd(25),
                String(row.cities).padStart(6),
                String(row.venues).padStart(6),
                String(row.unknown_cities).padStart(7)
            );
        });

        // 한국 도시별 최종 분포
        const koreanCityFinal = await client.query(`
            SELECT 
                city,
                province,
                COUNT(*) as count,
                city_en
            FROM global_venues
            WHERE country = 'South Korea'
            GROUP BY city, province, city_en
            ORDER BY count DESC
            LIMIT 20
        `);

        console.log('\n🇰🇷 한국 도시별 최종 분포:');
        console.log('도시'.padEnd(15), '도'.padEnd(15), '영문명'.padEnd(15), '기관수');
        console.log('-'.repeat(60));
        koreanCityFinal.rows.forEach(row => {
            console.log(
                (row.city || '').padEnd(15),
                (row.province || '-').padEnd(15),
                (row.city_en || '-').padEnd(15),
                row.count
            );
        });

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixRemainingInconsistencies();