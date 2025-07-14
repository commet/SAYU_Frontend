const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createArtveeTable() {
  try {
    // Drop existing table if it has wrong schema
    await db.query('DROP TABLE IF EXISTS artvee_artworks CASCADE');
    console.log('🗑️ Dropped existing table');
    
    // Create table first
    const createTableQuery = `
      CREATE TABLE artvee_artworks (
        id SERIAL PRIMARY KEY,
        artvee_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        artist_slug VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        full_image_url TEXT,
        sayu_type VARCHAR(10) NOT NULL,
        personality_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        emotion_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        usage_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await db.query(createTableQuery);
    console.log('✅ Artvee table created successfully');
    
    // Create indexes separately
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_artvee_personality_tags ON artvee_artworks USING GIN (personality_tags)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_artvee_sayu_type ON artvee_artworks (sayu_type)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_artvee_artist ON artvee_artworks (artist)');
      console.log('✅ Indexes created successfully');
    } catch (indexError) {
      console.log('⚠️ Some indexes may already exist:', indexError.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
}

async function loadArtveeData() {
  try {
    const dataPath = path.join(__dirname, '..', 'artvee-crawler', 'data', 'famous-artists-artworks.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const artworks = JSON.parse(data);
    
    console.log(`📚 Loading ${artworks.length} artworks...`);
    
    for (const artwork of artworks) {
      try {
        const insertQuery = `
          INSERT INTO artvee_artworks (
            artvee_id, title, artist, artist_slug, url, sayu_type, personality_tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (artvee_id) DO UPDATE SET
            title = EXCLUDED.title,
            artist = EXCLUDED.artist,
            artist_slug = EXCLUDED.artist_slug,
            url = EXCLUDED.url,
            sayu_type = EXCLUDED.sayu_type,
            personality_tags = EXCLUDED.personality_tags,
            updated_at = NOW()
        `;
        
        await db.query(insertQuery, [
          artwork.artveeId,
          artwork.title,
          artwork.artist,
          artwork.artistSlug,
          artwork.url,
          artwork.sayuType,
          [artwork.sayuType] // personality_tags array
        ]);
        
      } catch (error) {
        console.error(`❌ Error inserting artwork ${artwork.artveeId}:`, error);
      }
    }
    
    const countResult = await db.query('SELECT COUNT(*) FROM artvee_artworks');
    console.log(`✅ Data loaded successfully. Total artworks: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Artvee data loading...');
    await createArtveeTable();
    await loadArtveeData();
    console.log('🎉 Artvee data loading completed!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createArtveeTable, loadArtveeData };