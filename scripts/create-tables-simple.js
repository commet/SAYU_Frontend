const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createTablesSimple() {
  try {
    console.log('🚀 Creating exhibition tables using simple approach...');
    
    // 1. Create exhibition_artworks table
    console.log('\n📋 Creating exhibition_artworks table...');
    try {
      // Try to insert a dummy record to create table structure
      const { error: artworkError } = await supabase
        .from('exhibition_artworks')
        .insert([{
          exhibition_id: '00000000-0000-0000-0000-000000000000',
          title: 'test',
          year: 2024
        }]);
      
      if (artworkError) {
        console.log('❌ exhibition_artworks table needs to be created manually');
        console.log('   Error:', artworkError.message);
      } else {
        // Delete the test record
        await supabase
          .from('exhibition_artworks')
          .delete()
          .eq('title', 'test');
        console.log('✅ exhibition_artworks table exists');
      }
    } catch (err) {
      console.log('❌ exhibition_artworks table does not exist');
    }
    
    // 2. Check if we can create a simple table using JavaScript
    console.log('\n🔧 Alternative: Manual table creation instructions');
    
    const createTableSQL = `
-- Go to Supabase Dashboard > SQL Editor and run:

CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    title_ko VARCHAR(500),
    year INTEGER,
    medium VARCHAR(200),
    dimensions VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    artwork_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exhibition_press (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID,
    outlet_name VARCHAR(200) NOT NULL,
    outlet_country VARCHAR(2) DEFAULT 'KR',
    article_title VARCHAR(500),
    article_url VARCHAR(500),
    publication_date DATE,
    journalist_name VARCHAR(100),
    article_type VARCHAR(50) DEFAULT 'review',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artist_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_name VARCHAR(200) NOT NULL,
    artist_name_en VARCHAR(200),
    artist_name_ko VARCHAR(200),
    institution_name VARCHAR(300) NOT NULL,
    institution_name_en VARCHAR(300),
    institution_type VARCHAR(50) DEFAULT 'museum',
    country VARCHAR(2),
    city VARCHAR(100),
    artworks_count INTEGER DEFAULT 1,
    notable_works TEXT[],
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
    
    console.log(createTableSQL);
    
    // Write to file for manual execution
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, 'manual-table-creation.sql'), createTableSQL);
    console.log('\n💾 SQL saved to: scripts/manual-table-creation.sql');
    console.log('📋 Please execute this in Supabase Dashboard > SQL Editor');
    
    console.log('\n⚡ For now, let\'s proceed with enhanced data collection using existing schema!');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

// Run the script
createTablesSimple();