require('dotenv').config();
const GlobalVenueModel = require('./src/models/globalVenueModel');

async function testGlobalVenueModel() {
    console.log('🧪 Testing GlobalVenueModel...\n');

    try {
        // 1. 통계 조회
        console.log('📊 전체 통계:');
        const stats = await GlobalVenueModel.getStatistics();
        console.log(stats);
        console.log('');

        // 2. 한국 미술관 조회
        console.log('🇰🇷 한국 미술관 샘플 (5개):');
        const koreanVenues = await GlobalVenueModel.find(
            { country: 'South Korea' },
            { limit: 5 }
        );
        koreanVenues.forEach(v => {
            console.log(`  - ${v.name} (${v.city}, ${v.district || 'N/A'})`);
        });
        console.log('');

        // 3. 서울 갤러리 조회
        console.log('🏛️ 서울 갤러리:');
        const seoulGalleries = await GlobalVenueModel.find(
            { city: '서울', type: 'gallery' },
            { limit: 5 }
        );
        seoulGalleries.forEach(v => {
            console.log(`  - ${v.name} (Tier: ${v.tier}, Score: ${v.data_quality_score})`);
        });
        console.log('');

        // 4. 해외 미술관 조회
        console.log('🌍 해외 미술관 샘플:');
        const internationalVenues = await GlobalVenueModel.find(
            { country: 'France' },
            { limit: 3 }
        );
        internationalVenues.forEach(v => {
            console.log(`  - ${v.name} (${v.city}, ${v.country})`);
        });
        console.log('');

        // 5. 검색 테스트
        console.log('🔍 검색 테스트 (\"museum\"):');
        const searchResults = await GlobalVenueModel.find(
            { search: 'museum' },
            { limit: 3 }
        );
        searchResults.forEach(v => {
            console.log(`  - ${v.name} (${v.city}, ${v.country})`);
        });

        console.log('\n✅ GlobalVenueModel 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
    }

    process.exit(0);
}

testGlobalVenueModel();