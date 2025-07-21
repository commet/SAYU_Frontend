const { pool } = require('./src/config/database');

async function checkMatchingTables() {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'exhibition_matches', 
        'artwork_interactions', 
        'shared_collections',
        'collection_artworks',
        'gallery_sessions',
        'gallery_session_participants',
        'gallery_session_notes',
        'exhibition_checkins'
      )
      ORDER BY table_name
    `;
    
    const result = await pool.query(query);
    
    console.log('=== Matching System Tables Status ===');
    console.log(`Found ${result.rows.length} tables out of 8 expected tables:\n`);
    
    const expectedTables = [
      'exhibition_matches',
      'artwork_interactions', 
      'shared_collections',
      'collection_artworks',
      'gallery_sessions',
      'gallery_session_participants',
      'gallery_session_notes',
      'exhibition_checkins'
    ];
    
    const foundTables = result.rows.map(row => row.table_name);
    
    expectedTables.forEach(table => {
      const exists = foundTables.includes(table);
      console.log(`${exists ? '✅' : '❌'} ${table}`);
    });
    
    if (foundTables.length < expectedTables.length) {
      console.log('\n⚠️  Some tables are missing. Run the migration script:');
      console.log('   psql $DATABASE_URL -f src/migrations/create_matching_tables.sql');
    } else {
      console.log('\n✅ All matching system tables exist!');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkMatchingTables();