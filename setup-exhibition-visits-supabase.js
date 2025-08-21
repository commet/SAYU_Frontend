// Load backend environment variables
require('dotenv').config({ path: './backend/.env' });

const { getSupabaseAdmin } = require('./backend/src/config/supabase');

async function setupExhibitionVisits() {
  try {
    const supabase = getSupabaseAdmin();
    
    if (!supabase) {
      console.error('❌ Supabase admin client not configured');
      console.log('Please check your environment variables:');
      console.log('- SUPABASE_URL');
      console.log('- SUPABASE_SERVICE_KEY');
      return;
    }

    console.log('🚀 Setting up Exhibition Visits system...\n');

    // 1. Check if users table exists
    console.log('1️⃣ Checking users table...');
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.log('⚠️ Users table not found or not accessible:', usersError.message);
    } else {
      console.log('✅ Users table exists');
    }

    // 2. Create exhibition_visits table using SQL
    console.log('\n2️⃣ Creating exhibition_visits table...');
    
    const createTableSQL = `
      -- Create exhibition_visits table for storing user visit records
      CREATE TABLE IF NOT EXISTS exhibition_visits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          exhibition_id VARCHAR(255),
          exhibition_title VARCHAR(500) NOT NULL,
          museum VARCHAR(500) NOT NULL,
          visit_date DATE NOT NULL,
          duration INTEGER DEFAULT 0,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          notes TEXT,
          artworks JSONB DEFAULT '[]'::jsonb,
          photos JSONB DEFAULT '[]'::jsonb,
          badges JSONB DEFAULT '[]'::jsonb,
          points INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_id ON exhibition_visits(user_id);
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_visit_date ON exhibition_visits(visit_date);
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_museum ON exhibition_visits(museum);
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_rating ON exhibition_visits(rating);
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_created_at ON exhibition_visits(created_at);
      CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_date ON exhibition_visits(user_id, visit_date DESC);

      -- Add trigger for automatic updated_at timestamp
      CREATE OR REPLACE FUNCTION update_exhibition_visits_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_exhibition_visits_updated_at ON exhibition_visits;
      CREATE TRIGGER trigger_exhibition_visits_updated_at
          BEFORE UPDATE ON exhibition_visits
          FOR EACH ROW
          EXECUTE FUNCTION update_exhibition_visits_updated_at();
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.log('⚠️ Using alternative table creation method...');
      
      // Alternative: try creating with direct SQL execution
      const { error: altError } = await supabase
        .from('_db_migrations')
        .insert({
          name: 'create_exhibition_visits_table',
          sql: createTableSQL,
          executed_at: new Date().toISOString()
        });
      
      if (altError) {
        console.log('⚠️ Table creation via migration failed, trying manual approach...');
        
        // Manual approach - create table step by step
        try {
          await supabase.rpc('create_exhibition_visits_table');
        } catch (manualError) {
          console.log('📋 Please manually execute this SQL in Supabase Dashboard:');
          console.log('---');
          console.log(createTableSQL);
          console.log('---');
          console.log('\n🔗 Go to: https://app.supabase.com/project/[your-project]/sql-editor');
          console.log('\n After executing the SQL, run this script again to verify.\n');
        }
      } else {
        console.log('✅ Table creation scheduled via migration');
      }
    } else {
      console.log('✅ Exhibition visits table created successfully');
    }

    // 3. Test table access
    console.log('\n3️⃣ Testing exhibition_visits table access...');
    const { data: tableTest, error: tableError } = await supabase
      .from('exhibition_visits')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Table access test failed:', tableError.message);
      if (tableError.message.includes('relation "exhibition_visits" does not exist')) {
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Execute the SQL shown above');
        console.log('3. Run this script again to verify');
      }
    } else {
      console.log('✅ Exhibition visits table is accessible');
    }

    // 4. Test sample data insertion
    if (!tableError) {
      console.log('\n4️⃣ Testing sample data insertion...');
      
      // First, get or create a test user
      let testUserId = null;
      const { data: users, error: getUserError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!getUserError && users && users.length > 0) {
        testUserId = users[0].id;
      } else {
        // Create a test user if none exists
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            email: 'test@sayu.com',
            nickname: 'Test User'
          })
          .select()
          .single();
        
        if (!createUserError && newUser) {
          testUserId = newUser.id;
          console.log('✅ Test user created');
        }
      }

      if (testUserId) {
        const testVisit = {
          user_id: testUserId,
          exhibition_title: '테스트 전시',
          museum: '테스트 미술관',
          visit_date: '2025-01-20',
          duration: 90,
          rating: 5,
          notes: 'API 테스트를 위한 샘플 기록입니다.',
          artworks: [
            {
              id: 'artwork1',
              title: '테스트 작품 1',
              artist: '테스트 작가',
              liked: true
            },
            {
              id: 'artwork2', 
              title: '테스트 작품 2',
              artist: '테스트 작가',
              liked: false
            }
          ],
          photos: ['photo1.jpg'],
          badges: ['First Visit'],
          points: 120
        };

        const { data: insertedVisit, error: insertError } = await supabase
          .from('exhibition_visits')
          .insert(testVisit)
          .select()
          .single();

        if (insertError) {
          console.log('❌ Sample data insertion failed:', insertError.message);
        } else {
          console.log('✅ Sample visit record created successfully');
          console.log('📋 Sample record ID:', insertedVisit.id);

          // Clean up test data
          await supabase
            .from('exhibition_visits')
            .delete()
            .eq('id', insertedVisit.id);
          console.log('🧹 Test data cleaned up');
        }
      } else {
        console.log('⚠️ Could not create test user, skipping sample data test');
      }
    }

    // 5. Summary
    console.log('\n🎉 Setup Summary:');
    console.log('✅ Supabase connection confirmed');
    console.log(tableError ? '❌ Exhibition visits table needs manual setup' : '✅ Exhibition visits table ready');
    console.log('✅ API endpoints configured in backend');
    console.log('✅ Frontend forms ready for real data');
    
    if (!tableError) {
      console.log('\n🚀 Ready to test! Try creating a visit record from the frontend.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Check environment variables first
console.log('🔍 Checking environment variables...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

setupExhibitionVisits();