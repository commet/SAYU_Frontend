require('dotenv').config();
const { Pool } = require('pg');

async function compareVenueStructures() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        
        console.log('🔍 Comparing venue table structures...\n');

        // Get columns for both tables
        const venuesColumns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'venues' 
            ORDER BY ordinal_position
        `);

        const globalVenuesColumns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'global_venues' 
            ORDER BY ordinal_position
        `);

        console.log('📊 VENUES table (Korean data - 736 records):');
        console.log('=' .repeat(50));
        venuesColumns.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(20)} ${col.data_type}`);
        });

        console.log('\n📊 GLOBAL_VENUES table (International data - 360 records):');
        console.log('=' .repeat(50));
        globalVenuesColumns.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(25)} ${col.data_type}`);
        });

        // Analyze overlapping fields
        const venuesFields = new Set(venuesColumns.rows.map(r => r.column_name));
        const globalFields = new Set(globalVenuesColumns.rows.map(r => r.column_name));
        
        const commonFields = [...venuesFields].filter(f => globalFields.has(f));
        const venuesOnlyFields = [...venuesFields].filter(f => !globalFields.has(f));
        const globalOnlyFields = [...globalFields].filter(f => !venuesFields.has(f));

        console.log('\n🔄 Field Analysis:');
        console.log('=' .repeat(50));
        console.log(`Common fields (${commonFields.length}):`, commonFields.join(', '));
        console.log(`\nVenues-only fields (${venuesOnlyFields.length}):`, venuesOnlyFields.join(', '));
        console.log(`\nGlobal-only fields (${globalOnlyFields.length}):`, globalOnlyFields.join(', '));

        // Sample data comparison
        console.log('\n📝 Sample Data Comparison:');
        console.log('=' .repeat(50));
        
        const koreanSample = await client.query(`
            SELECT * FROM venues 
            WHERE city IN ('서울', 'Seoul', 'seoul') 
            LIMIT 2
        `);

        const globalSample = await client.query(`
            SELECT * FROM global_venues 
            WHERE country = 'South Korea' 
            LIMIT 2
        `);

        console.log('\nKorean venue sample:');
        if (koreanSample.rows.length > 0) {
            const sample = koreanSample.rows[0];
            console.log(`  Name: ${sample.name} (${sample.name_en})`);
            console.log(`  Location: ${sample.city}, ${sample.district}`);
            console.log(`  Type: ${sample.type}, Tier: ${sample.tier}`);
            console.log(`  Instagram: ${sample.instagram || 'N/A'}`);
            console.log(`  Rating: ${sample.rating || 'N/A'}`);
        }

        console.log('\nGlobal venue sample:');
        if (globalSample.rows.length > 0) {
            const sample = globalSample.rows[0];
            console.log(`  Name: ${sample.name}`);
            console.log(`  Location: ${sample.city}, ${sample.country}`);
            console.log(`  Type: ${sample.venue_type}, Category: ${sample.venue_category}`);
            console.log(`  Quality Score: ${sample.data_quality_score}`);
        }

        // Migration strategy
        console.log('\n🚀 Migration Strategy:');
        console.log('=' .repeat(50));
        console.log('1. Global_venues has a more comprehensive structure');
        console.log('2. Korean venues have unique fields: district, tier, instagram, rating');
        console.log('3. Recommendation: Migrate Korean data to global_venues structure');
        console.log('4. Add missing fields to global_venues: district, tier, instagram, rating, review_count');
        console.log('5. Use social_media JSONB field for Instagram and other social platforms');

        client.release();
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

compareVenueStructures();