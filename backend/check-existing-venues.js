require('dotenv').config();
const { Pool } = require('pg');

async function checkExistingVenues() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔍 Checking existing venue/exhibition tables...\n');

        // Find all relevant tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (
                table_name LIKE '%venue%' 
                OR table_name LIKE '%exhibition%' 
                OR table_name LIKE '%museum%' 
                OR table_name LIKE '%gallery%'
                OR table_name LIKE '%artist%'
            )
            ORDER BY table_name
        `;
        
        const tables = await client.query(tablesQuery);
        
        console.log(`Found ${tables.rows.length} relevant tables:\n`);
        
        // Check each table
        for (const { table_name } of tables.rows) {
            try {
                // Get row count
                const countResult = await client.query(`SELECT COUNT(*) FROM ${table_name}`);
                const count = parseInt(countResult.rows[0].count);
                
                // Get sample data if table has records
                let sampleData = null;
                if (count > 0) {
                    const sampleQuery = `SELECT * FROM ${table_name} LIMIT 3`;
                    const sampleResult = await client.query(sampleQuery);
                    sampleData = sampleResult.rows;
                }
                
                // Get column information
                const columnsQuery = `
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position
                `;
                const columns = await client.query(columnsQuery, [table_name]);
                
                console.log(`📊 ${table_name}: ${count} records`);
                console.log(`   Columns: ${columns.rows.map(c => c.column_name).join(', ')}`);
                
                if (sampleData && sampleData.length > 0) {
                    console.log(`   Sample record:`);
                    const sample = sampleData[0];
                    Object.keys(sample).slice(0, 5).forEach(key => {
                        console.log(`     - ${key}: ${JSON.stringify(sample[key])}`);
                    });
                }
                console.log('');
                
            } catch (error) {
                console.log(`   ❌ Error reading ${table_name}: ${error.message}\n`);
            }
        }
        
        // Special check for Korean exhibition data
        console.log('🇰🇷 Checking Korean venues specifically...\n');
        
        const koreanVenuesQuery = `
            SELECT COUNT(*) as count, data_source 
            FROM global_venues 
            WHERE country IN ('South Korea', 'Korea', '대한민국', '한국')
            GROUP BY data_source
        `;
        
        try {
            const koreanVenues = await client.query(koreanVenuesQuery);
            if (koreanVenues.rows.length > 0) {
                console.log('Korean venues by source:');
                koreanVenues.rows.forEach(row => {
                    console.log(`  - ${row.data_source}: ${row.count} venues`);
                });
            } else {
                console.log('No Korean venues found in global_venues table');
            }
        } catch (error) {
            console.log('global_venues table might not exist yet');
        }
        
        client.release();
        
    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        await pool.end();
    }
}

checkExistingVenues();