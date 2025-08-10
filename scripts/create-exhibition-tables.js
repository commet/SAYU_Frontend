const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createExhibitionTables() {
  try {
    console.log('🚀 Creating additional exhibition tables...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'add-exhibition-tables.sql'), 
      'utf8'
    );
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      // If exec_sql RPC doesn't exist, try alternative approach
      console.log('Trying alternative approach...');
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`Executing ${statements.length} SQL statements...`);
      
      for (const [index, statement] of statements.entries()) {
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || statement.includes('ALTER TABLE') || statement.includes('CREATE POLICY') || statement.includes('COMMENT ON')) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql: statement + ';'
            });
            
            if (stmtError) {
              console.warn(`⚠️  Statement ${index + 1} warning:`, stmtError.message);
            } else {
              console.log(`✅ Statement ${index + 1} executed successfully`);
            }
          } catch (err) {
            console.warn(`⚠️  Statement ${index + 1} failed:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ All tables created successfully!');
    }
    
    // Verify tables were created
    console.log('\n📋 Verifying table creation...');
    
    const tablesToCheck = [
      'exhibition_artworks',
      'exhibition_press', 
      'artist_collections',
      'exhibition_relations',
      'exhibition_images',
      'exhibition_events'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.log(`❌ Table ${tableName}: ${tableError.message}`);
        } else {
          console.log(`✅ Table ${tableName}: Ready`);
        }
      } catch (err) {
        console.log(`❌ Table ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Exhibition tables setup complete!');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
  }
}

// Run the script
createExhibitionTables();