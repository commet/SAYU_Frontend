require('dotenv').config();
const { Pool } = require('pg');

async function addMuseumKoreanNames() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🏛️ 주요 미술관/갤러리 한글명 추가 작업 시작...\n');

        // 주요 미술관 한글명 매핑
        const museumTranslations = [
            // 미국 - 뉴욕
            { name: 'Metropolitan Museum of Art', name_ko: '메트로폴리탄 미술관' },
            { name: 'The Metropolitan Museum of Art', name_ko: '메트로폴리탄 미술관' },
            { name: 'Museum of Modern Art', name_ko: '현대미술관 (MoMA)' },
            { name: 'MoMA', name_ko: '현대미술관 (MoMA)' },
            { name: 'Solomon R. Guggenheim Museum', name_ko: '구겐하임 미술관' },
            { name: 'Whitney Museum of American Art', name_ko: '휘트니 미술관' },
            { name: 'American Museum of Natural History', name_ko: '미국 자연사 박물관' },
            { name: 'Brooklyn Museum', name_ko: '브루클린 미술관' },
            { name: 'The Morgan Library & Museum', name_ko: '모건 도서관 & 박물관' },
            { name: 'Frick Collection', name_ko: '프릭 컬렉션' },
            { name: 'The Frick Collection', name_ko: '프릭 컬렉션' },
            { name: 'New Museum', name_ko: '뉴 뮤지엄' },
            { name: 'Museum of Sex', name_ko: '섹스 박물관' },
            
            // 프랑스 - 파리
            { name: 'Louvre Museum', name_ko: '루브르 박물관' },
            { name: 'Musée du Louvre', name_ko: '루브르 박물관' },
            { name: "Musée d'Orsay", name_ko: '오르세 미술관' },
            { name: 'Centre Pompidou', name_ko: '퐁피두 센터' },
            { name: 'Musée Rodin', name_ko: '로댕 미술관' },
            { name: 'Musée Picasso', name_ko: '피카소 미술관' },
            { name: "Musée de l'Orangerie", name_ko: '오랑주리 미술관' },
            { name: 'Musée Marmottan Monet', name_ko: '마르모탕 모네 미술관' },
            { name: 'Grand Palais', name_ko: '그랑 팔레' },
            { name: 'Petit Palais', name_ko: '프티 팔레' },
            { name: 'Palais de Tokyo', name_ko: '팔레 드 도쿄' },
            { name: 'Fondation Louis Vuitton', name_ko: '루이비통 재단' },
            
            // 영국 - 런던
            { name: 'British Museum', name_ko: '대영박물관' },
            { name: 'The British Museum', name_ko: '대영박물관' },
            { name: 'National Gallery', name_ko: '내셔널 갤러리' },
            { name: 'The National Gallery', name_ko: '내셔널 갤러리' },
            { name: 'Tate Modern', name_ko: '테이트 모던' },
            { name: 'Tate Britain', name_ko: '테이트 브리튼' },
            { name: 'Victoria and Albert Museum', name_ko: '빅토리아 앤 앨버트 박물관' },
            { name: 'V&A Museum', name_ko: '빅토리아 앤 앨버트 박물관' },
            { name: 'National Portrait Gallery', name_ko: '국립 초상화 미술관' },
            { name: 'Saatchi Gallery', name_ko: '사치 갤러리' },
            { name: 'The Courtauld Gallery', name_ko: '코톨드 갤러리' },
            { name: 'Natural History Museum', name_ko: '자연사 박물관' },
            { name: 'Science Museum', name_ko: '과학 박물관' },
            
            // 일본 - 도쿄
            { name: 'Tokyo National Museum', name_ko: '도쿄 국립박물관' },
            { name: 'National Museum of Modern Art, Tokyo', name_ko: '도쿄 국립근대미술관' },
            { name: 'Mori Art Museum', name_ko: '모리 미술관' },
            { name: 'teamLab Borderless', name_ko: '팀랩 보더리스' },
            { name: 'teamLab Planets', name_ko: '팀랩 플래닛' },
            { name: '21_21 Design Sight', name_ko: '21_21 디자인 사이트' },
            { name: 'Tokyo Metropolitan Art Museum', name_ko: '도쿄도 미술관' },
            { name: 'National Art Center Tokyo', name_ko: '국립신미술관' },
            { name: 'Nezu Museum', name_ko: '네즈 미술관' },
            { name: 'Suntory Museum of Art', name_ko: '산토리 미술관' },
            
            // 독일 - 베를린
            { name: 'Pergamon Museum', name_ko: '페르가몬 박물관' },
            { name: 'Neues Museum', name_ko: '신박물관' },
            { name: 'Alte Nationalgalerie', name_ko: '구국립미술관' },
            { name: 'Hamburger Bahnhof', name_ko: '함부르거 반호프 현대미술관' },
            { name: 'Jewish Museum Berlin', name_ko: '베를린 유대인 박물관' },
            { name: 'DDR Museum', name_ko: 'DDR 박물관' },
            { name: 'Museum Island', name_ko: '박물관 섬' },
            
            // 이탈리아 - 밀라노/로마/피렌체
            { name: 'Pinacoteca di Brera', name_ko: '브레라 미술관' },
            { name: 'Palazzo Reale di Milano', name_ko: '밀라노 왕궁' },
            { name: 'Galleria Vittorio Emanuele II', name_ko: '비토리오 에마누엘레 2세 갤러리' },
            { name: 'Vatican Museums', name_ko: '바티칸 박물관' },
            { name: 'Galleria Borghese', name_ko: '보르게세 갤러리' },
            { name: 'Uffizi Gallery', name_ko: '우피치 미술관' },
            { name: 'Galleria degli Uffizi', name_ko: '우피치 미술관' },
            { name: "Galleria dell'Accademia", name_ko: '아카데미아 미술관' },
            
            // 스페인 - 마드리드/바르셀로나
            { name: 'Museo del Prado', name_ko: '프라도 미술관' },
            { name: 'Prado Museum', name_ko: '프라도 미술관' },
            { name: 'Museo Reina Sofía', name_ko: '레이나 소피아 미술관' },
            { name: 'Reina Sofia Museum', name_ko: '레이나 소피아 미술관' },
            { name: 'Museo Thyssen-Bornemisza', name_ko: '티센-보르네미사 미술관' },
            { name: 'Museu Picasso', name_ko: '피카소 미술관 (바르셀로나)' },
            { name: 'Fundació Joan Miró', name_ko: '호안 미로 재단' },
            { name: 'MACBA', name_ko: '바르셀로나 현대미술관' },
            { name: 'Guggenheim Museum Bilbao', name_ko: '구겐하임 빌바오' },
            
            // 네덜란드 - 암스테르담
            { name: 'Rijksmuseum', name_ko: '레이크스 미술관' },
            { name: 'Van Gogh Museum', name_ko: '반 고흐 미술관' },
            { name: 'Stedelijk Museum', name_ko: '스테델릭 현대미술관' },
            { name: 'Anne Frank House', name_ko: '안네 프랑크의 집' },
            { name: 'NEMO Science Museum', name_ko: '네모 과학 박물관' },
            { name: 'Moco Museum', name_ko: '모코 미술관' },
            
            // 홍콩
            { name: 'Hong Kong Museum of Art', name_ko: '홍콩 미술관' },
            { name: 'M+', name_ko: 'M+ 미술관' },
            { name: 'M+ Museum', name_ko: 'M+ 미술관' },
            { name: 'PMQ', name_ko: 'PMQ (폴리스 매리드 쿼터스)' },
            { name: 'Asia Society Hong Kong Center', name_ko: '아시아 소사이어티 홍콩' },
            
            // 기타 주요 도시
            { name: 'Art Institute of Chicago', name_ko: '시카고 미술관' },
            { name: 'National Gallery of Art', name_ko: '국립 미술관 (워싱턴)' },
            { name: 'Museum of Fine Arts, Boston', name_ko: '보스턴 미술관' },
            { name: 'Philadelphia Museum of Art', name_ko: '필라델피아 미술관' },
            { name: 'Los Angeles County Museum of Art', name_ko: '로스앤젤레스 카운티 미술관' },
            { name: 'LACMA', name_ko: '로스앤젤레스 카운티 미술관' },
            { name: 'Getty Center', name_ko: '게티 센터' },
            { name: 'J. Paul Getty Museum', name_ko: 'J. 폴 게티 미술관' },
            { name: 'SFMOMA', name_ko: '샌프란시스코 현대미술관' },
            { name: 'San Francisco Museum of Modern Art', name_ko: '샌프란시스코 현대미술관' },
            { name: 'National Gallery of Canada', name_ko: '캐나다 국립미술관' },
            { name: 'Art Gallery of Ontario', name_ko: '온타리오 미술관' },
            { name: 'National Gallery of Australia', name_ko: '호주 국립미술관' },
            { name: 'Art Gallery of New South Wales', name_ko: '뉴사우스웨일스 미술관' }
        ];

        // 한글명 업데이트
        let updateCount = 0;
        for (const translation of museumTranslations) {
            const result = await client.query(
                `UPDATE global_venues 
                 SET name_ko = $1 
                 WHERE name = $2 AND name_ko IS NULL`,
                [translation.name_ko, translation.name]
            );
            updateCount += result.rowCount;
        }

        console.log(`✅ ${updateCount}개 미술관/갤러리 한글명 추가 완료\n`);

        // 갤러리 타입별 일괄 번역 패턴
        console.log('🎨 갤러리 타입별 번역 패턴 적용...\n');
        
        // "Gallery" 패턴
        await client.query(`
            UPDATE global_venues 
            SET name_ko = REPLACE(name, 'Gallery', '갤러리')
            WHERE name LIKE '%Gallery%' 
            AND name_ko IS NULL
            AND venue_type = 'gallery'
        `);

        // "Museum" 패턴
        await client.query(`
            UPDATE global_venues 
            SET name_ko = REPLACE(name, 'Museum', '박물관')
            WHERE name LIKE '%Museum%' 
            AND name_ko IS NULL
            AND venue_type = 'museum'
        `);

        // "Art Center" 패턴
        await client.query(`
            UPDATE global_venues 
            SET name_ko = REPLACE(REPLACE(name, 'Art Center', '아트센터'), 'Art Centre', '아트센터')
            WHERE (name LIKE '%Art Center%' OR name LIKE '%Art Centre%')
            AND name_ko IS NULL
        `);

        // 업데이트 결과 확인
        const stats = await client.query(`
            SELECT 
                country,
                COUNT(*) as total,
                COUNT(name_ko) as has_korean,
                ROUND(COUNT(name_ko)::numeric / COUNT(*)::numeric * 100, 2) as percentage
            FROM global_venues
            WHERE country != 'South Korea'
            GROUP BY country
            ORDER BY total DESC
            LIMIT 15
        `);

        console.log('📊 국가별 한글명 번역 현황:\n');
        console.log('국가'.padEnd(20), '총계', '번역완료', '번역률');
        console.log('-'.repeat(45));
        
        stats.rows.forEach(row => {
            console.log(
                row.country.padEnd(20),
                String(row.total).padStart(4),
                String(row.has_korean).padStart(8),
                String(row.percentage).padStart(7) + '%'
            );
        });

        // 샘플 확인
        console.log('\n📝 번역 샘플 (20개):\n');
        const samples = await client.query(`
            SELECT name, name_ko, city, country
            FROM global_venues
            WHERE name_ko IS NOT NULL
            AND country != 'South Korea'
            ORDER BY data_quality_score DESC
            LIMIT 20
        `);

        samples.rows.forEach(row => {
            console.log(`${row.name} → ${row.name_ko} (${row.city}, ${row.country})`);
        });

        client.release();
        
    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
    } finally {
        await pool.end();
    }
}

addMuseumKoreanNames();