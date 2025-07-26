require('dotenv').config();
const { Pool } = require('pg');

async function checkDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔍 Checking for duplicate Google Place IDs...\n');

        // Check duplicates in venues table
        const duplicatesInVenues = await client.query(`
            SELECT google_place_id, COUNT(*) as count, array_agg(name) as names
            FROM venues
            WHERE google_place_id IS NOT NULL
            GROUP BY google_place_id
            HAVING COUNT(*) > 1
        `);

        if (duplicatesInVenues.rows.length > 0) {
            console.log('Duplicates in venues table:');
            duplicatesInVenues.rows.forEach(row => {
                console.log(`  - ${row.google_place_id}: ${row.count} times (${row.names.join(', ')})`);
            });
        }

        // Check overlap between venues and global_venues
        const overlapping = await client.query(`
            SELECT 
                v.name as venue_name,
                v.google_place_id,
                gv.name as global_name,
                v.city,
                gv.city as global_city
            FROM venues v
            INNER JOIN global_venues gv ON v.google_place_id = gv.google_place_id
            WHERE v.google_place_id IS NOT NULL
        `);

        console.log(`\n📊 Found ${overlapping.rows.length} overlapping Google Place IDs between tables:`);
        overlapping.rows.forEach(row => {
            console.log(`  - ${row.venue_name} (${row.city}) = ${row.global_name} (${row.global_city})`);
            console.log(`    Place ID: ${row.google_place_id}`);
        });

        // Check venues without Google Place ID
        const withoutPlaceId = await client.query(`
            SELECT COUNT(*) FROM venues WHERE google_place_id IS NULL
        `);
        console.log(`\n📈 Venues without Google Place ID: ${withoutPlaceId.rows[0].count}`);

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDuplicates();