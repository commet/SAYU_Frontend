require('dotenv').config();
const ArtistEnrichmentService = require('./src/services/artistEnrichmentService');

async function main() {
  console.log('🎨 SAYU Artist Enrichment Process Starting...\n');

  const service = new ArtistEnrichmentService();

  // 명령줄 인자 확인
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'single' && args[1]) {
      // 단일 아티스트 처리
      const artistId = args[1];
      console.log(`Processing single artist: ${artistId}`);

      const result = await service.enrichArtist(artistId);
      console.log('\n✅ Enrichment Result:');
      console.log(JSON.stringify(result, null, 2));

    } else if (command === 'batch' || !command) {
      // 배치 처리 (기본값)
      console.log('Starting batch enrichment for artists...\n');

      const result = await service.enrichAllArtists();

      console.log('\n📊 Batch Processing Summary:');
      console.log(`Total artists processed: ${result.total}`);
      console.log(`Successfully enriched: ${result.succeeded}`);
      console.log(`Failed: ${result.failed}`);

      if (result.failed > 0) {
        console.log('\n❌ Failed artists:');
        result.results
          .filter(r => !r.success)
          .forEach(r => console.log(`- ${r.artistId}: ${r.error}`));
      }

    } else if (command === 'test') {
      // 테스트 모드 - 한 명의 아티스트로 테스트
      console.log('Running in test mode...\n');

      // Vincent van Gogh로 테스트
      const testArtistQuery = `
        SELECT id, name FROM artists 
        WHERE name LIKE '%Vincent van Gogh%' 
        LIMIT 1
      `;

      const { pool } = service;
      const result = await pool.query(testArtistQuery);

      if (result.rows.length > 0) {
        const artist = result.rows[0];
        console.log(`Testing with artist: ${artist.name}`);

        const enrichResult = await service.enrichArtist(artist.id);
        console.log('\n✅ Test Result:');
        console.log(JSON.stringify(enrichResult, null, 2));
      } else {
        console.log('No test artist found');
      }

    } else if (command === 'status') {
      // 현재 상태 확인
      const { pool } = service;

      const statusQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN emotional_profile != '{}' THEN 1 END) as enriched,
          COUNT(CASE WHEN emotional_profile = '{}' OR emotional_profile IS NULL THEN 1 END) as pending
        FROM artists
      `;

      const result = await pool.query(statusQuery);
      const status = result.rows[0];

      console.log('📊 Artist Enrichment Status:');
      console.log(`Total artists: ${status.total}`);
      console.log(`Enriched: ${status.enriched} (${Math.round(status.enriched / status.total * 100)}%)`);
      console.log(`Pending: ${status.pending} (${Math.round(status.pending / status.total * 100)}%)`);

      // 상위 5명의 미처리 아티스트 보기
      const pendingQuery = `
        SELECT id, name, follow_count
        FROM artists
        WHERE emotional_profile = '{}' OR emotional_profile IS NULL
        ORDER BY follow_count DESC
        LIMIT 5
      `;

      const pendingResult = await pool.query(pendingQuery);

      if (pendingResult.rows.length > 0) {
        console.log('\n📋 Top pending artists:');
        pendingResult.rows.forEach(artist => {
          console.log(`- ${artist.name} (${artist.follow_count} followers) [ID: ${artist.id}]`);
        });
      }

    } else if (command === 'help') {
      showHelp();
    } else {
      console.log('Invalid command. Use "help" to see available commands.');
      showHelp();
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
SAYU Artist Enrichment Tool

Usage: node enrich-artists.js [command] [options]

Commands:
  batch       Enrich multiple artists (default)
  single <id> Enrich a single artist by ID
  test        Test enrichment with Vincent van Gogh
  status      Show enrichment status
  help        Show this help message

Examples:
  node enrich-artists.js                    # Batch process artists
  node enrich-artists.js single abc-123     # Process single artist
  node enrich-artists.js test               # Run test
  node enrich-artists.js status             # Check status
  `);
}

// 실행
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
