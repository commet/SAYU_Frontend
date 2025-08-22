const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting gamification tables migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-gamification-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip pure comments
      if (statement.trim().startsWith('--')) continue;
      
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 50)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      }).catch(async (err) => {
        // If RPC doesn't exist, try direct execution via REST API
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql: statement })
        });
        
        if (!response.ok) {
          // Try using pg connection directly
          return { error: 'RPC not available, manual execution needed' };
        }
        
        return response.json();
      });
      
      if (error) {
        console.log(`⚠️  Warning: ${error.message || error}`);
        // Continue with next statement even if this one fails
        // (it might already exist)
      } else {
        console.log(`✅ Statement executed successfully`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📊 Verifying tables...');
    
    // Verify tables exist
    const tables = [
      'user_game_profiles',
      'point_transactions',
      'daily_activity_limits',
      'level_definitions',
      'point_rules'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: NOT FOUND`);
      } else {
        console.log(`✅ Table ${table}: EXISTS`);
      }
    }
    
    console.log('\n✨ Migration verification complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();