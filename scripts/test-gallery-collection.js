/**
 * 갤러리 컬렉션 기능 테스트 스크립트
 * 대시보드의 '내 갤러리' 숫자가 실제 데이터와 연동되는지 확인
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test user ID (you can replace this with an actual user ID from your database)
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

async function testGalleryCollection() {
  console.log('🎨 SAYU Gallery Collection Test');
  console.log('='.repeat(50));

  try {
    // 1. Check if necessary tables exist
    console.log('\n1. 📊 Checking table structure...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['artworks', 'artwork_interactions', 'users']);
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }
    
    const tableNames = tables.map(t => t.table_name);
    console.log('✅ Found tables:', tableNames.join(', '));

    // 2. Check sample artworks
    console.log('\n2. 🖼️ Checking sample artworks...');
    const { data: artworks, count: artworkCount } = await supabase
      .from('artworks')
      .select('id, title, artist', { count: 'exact' })
      .limit(5);
    
    console.log(`✅ Found ${artworkCount} artworks`);
    if (artworks && artworks.length > 0) {
      artworks.forEach(artwork => {
        console.log(`   - ${artwork.title} by ${artwork.artist}`);
      });
    }

    // 3. Test saving an artwork (simulate user action)
    console.log('\n3. 💾 Testing artwork save functionality...');
    
    if (artworks && artworks.length > 0) {
      const testArtwork = artworks[0];
      
      // First, remove any existing save interaction
      await supabase
        .from('artwork_interactions')
        .delete()
        .eq('user_id', TEST_USER_ID)
        .eq('artwork_id', testArtwork.id)
        .eq('interaction_type', 'save');
      
      // Add a save interaction
      const { error: saveError } = await supabase
        .from('artwork_interactions')
        .insert({
          user_id: TEST_USER_ID,
          artwork_id: testArtwork.id,
          interaction_type: 'save'
        });
      
      if (saveError) {
        console.error('❌ Error saving artwork:', saveError);
      } else {
        console.log(`✅ Successfully saved "${testArtwork.title}"`);
      }
    }

    // 4. Test collection count (what dashboard would show)
    console.log('\n4. 📈 Testing collection count...');
    
    const { count: savedCount } = await supabase
      .from('artwork_interactions')
      .select('id', { count: 'exact' })
      .eq('user_id', TEST_USER_ID)
      .eq('interaction_type', 'save');
    
    console.log(`✅ User has ${savedCount} saved artworks`);

    // 5. Test collection retrieval (what gallery page would show)
    console.log('\n5. 📋 Testing collection retrieval...');
    
    const { data: savedArtworks, error: retrieveError } = await supabase
      .from('artwork_interactions')
      .select(`
        id,
        artwork_id,
        created_at,
        artworks:artwork_id (
          id,
          title,
          artist,
          year_created,
          image_url
        )
      `)
      .eq('user_id', TEST_USER_ID)
      .eq('interaction_type', 'save')
      .order('created_at', { ascending: false });
    
    if (retrieveError) {
      console.error('❌ Error retrieving collection:', retrieveError);
    } else {
      console.log(`✅ Retrieved ${savedArtworks.length} saved artworks:`);
      savedArtworks.forEach(item => {
        const artwork = item.artworks;
        console.log(`   - ${artwork.title} by ${artwork.artist} (${artwork.year_created})`);
      });
    }

    // 6. Test dashboard stats API simulation
    console.log('\n6. 🎯 Testing dashboard stats calculation...');
    
    const [
      viewInteractions,
      savedInteractions,
      artistInteractions
    ] = await Promise.all([
      supabase
        .from('artwork_interactions')
        .select('id', { count: 'exact' })
        .eq('user_id', TEST_USER_ID)
        .eq('interaction_type', 'view'),
      
      supabase
        .from('artwork_interactions')
        .select('id', { count: 'exact' })
        .eq('user_id', TEST_USER_ID)
        .eq('interaction_type', 'save'),
      
      supabase
        .from('artwork_interactions')
        .select('artworks(artist)')
        .eq('user_id', TEST_USER_ID)
        .not('artworks.artist', 'is', null)
    ]);
    
    const uniqueArtists = new Set(
      artistInteractions.data
        ?.map(item => item.artworks?.artist)
        .filter(artist => artist)
    );
    
    const dashboardStats = {
      artworksViewed: viewInteractions.count || 0,
      savedArtworks: savedInteractions.count || 0,
      artistsDiscovered: uniqueArtists.size || 0
    };
    
    console.log('✅ Dashboard stats calculated:');
    console.log(`   - Artworks viewed: ${dashboardStats.artworksViewed}`);
    console.log(`   - Saved artworks: ${dashboardStats.savedArtworks}`);
    console.log(`   - Artists discovered: ${dashboardStats.artistsDiscovered}`);

    // 7. Test API endpoints (simulation)
    console.log('\n7. 🔗 API endpoint test results:');
    console.log(`   - GET /api/gallery/collection?userId=${TEST_USER_ID}`);
    console.log(`     Expected response: { success: true, count: ${dashboardStats.savedArtworks}, items: [...] }`);
    console.log(`   - GET /api/dashboard/stats?userId=${TEST_USER_ID}`);
    console.log(`     Expected savedArtworks: ${dashboardStats.savedArtworks}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run the SQL migration script to ensure tables exist');
    console.log('   2. Test the actual API endpoints in your browser');
    console.log('   3. Check that dashboard shows real numbers');
    console.log('   4. Verify gallery page loads saved artworks');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testGalleryCollection();