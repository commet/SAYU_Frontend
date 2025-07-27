#!/usr/bin/env node
/**
 * Simple Data Copy from Railway to Supabase
 * Handles type conversion and focuses on core data
 */
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function copyUsers() {
  log('\n📋 Copying Users...', 'blue');
  
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    await railwayClient.connect();
    
    // Get users from Railway
    const result = await railwayClient.query('SELECT * FROM users LIMIT 10');
    log(`  Found ${result.rows.length} users in Railway`, 'blue');
    
    if (result.rows.length === 0) {
      log('  No users to migrate', 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const user of result.rows) {
      try {
        // Convert Railway user to Supabase format
        const supabaseUser = {
          // Use Railway UUID as-is (they're already UUIDs)
          id: user.id,
          email: user.email,
          username: user.username,
          personality_type: user.personality_type,
          // Add default values for Supabase-specific fields
          auth_id: null, // Will be set when user signs up via Supabase Auth
          full_name: user.username, // Use username as fallback
          quiz_completed: !!user.personality_type,
          // Copy Railway-specific fields
          password_hash: user.password_hash,
          is_premium: user.is_premium,
          profile_image: user.profile_image,
          subscription_type: user.subscription_type,
          subscription_start_date: user.subscription_start_date,
          subscription_end_date: user.subscription_end_date,
          subscription_status: user.subscription_status,
          user_purpose: user.user_purpose,
          pioneer_number: user.pioneer_number,
          created_at: user.created_at,
          updated_at: user.updated_at
        };

        const { error } = await supabase
          .from('users')
          .insert(supabaseUser);

        if (error) {
          log(`    ✗ Failed to copy user ${user.email}: ${error.message}`, 'red');
          failed++;
        } else {
          log(`    ✓ Copied user: ${user.email}`, 'green');
          success++;
        }
      } catch (error) {
        log(`    ✗ Error processing user ${user.email}: ${error.message}`, 'red');
        failed++;
      }
    }

    await railwayClient.end();
    return { success, failed };
    
  } catch (error) {
    log(`  ✗ Failed to copy users: ${error.message}`, 'red');
    await railwayClient.end();
    return { success: 0, failed: 1 };
  }
}

async function copyVenues() {
  log('\n📋 Copying Venues...', 'blue');
  
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    await railwayClient.connect();
    
    // Get venues from Railway (limit for testing)
    const result = await railwayClient.query('SELECT * FROM venues LIMIT 50');
    log(`  Found ${result.rows.length} venues in Railway`, 'blue');

    if (result.rows.length === 0) {
      log('  No venues to migrate', 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const venue of result.rows) {
      try {
        // Convert Railway venue to Supabase format
        const supabaseVenue = {
          // Generate new UUID for Supabase (can't use integer)
          // Store original Railway ID in metadata
          name: venue.name,
          name_en: venue.name_en,
          city: venue.city,
          district: venue.district,
          country: venue.country || 'KR',
          type: venue.type,
          tier: venue.tier,
          website: venue.website,
          address: venue.address,
          instagram: venue.instagram,
          is_active: venue.is_active,
          latitude: venue.latitude,
          longitude: venue.longitude,
          phone: venue.phone,
          rating: venue.rating,
          review_count: venue.review_count,
          opening_hours: venue.opening_hours,
          admission_fee: venue.admission_fee,
          google_place_id: venue.google_place_id,
          data_completeness: venue.data_completeness,
          last_updated: venue.last_updated,
          created_at: venue.created_at,
          updated_at: venue.updated_at,
          // Store Railway ID for reference
          metadata: { railway_id: venue.id }
        };

        const { error } = await supabase
          .from('venues')
          .insert(supabaseVenue);

        if (error) {
          log(`    ✗ Failed to copy venue ${venue.name}: ${error.message}`, 'red');
          failed++;
        } else {
          log(`    ✓ Copied venue: ${venue.name}`, 'green');
          success++;
        }
      } catch (error) {
        log(`    ✗ Error processing venue ${venue.name}: ${error.message}`, 'red');
        failed++;
      }
    }

    await railwayClient.end();
    return { success, failed };
    
  } catch (error) {
    log(`  ✗ Failed to copy venues: ${error.message}`, 'red');
    await railwayClient.end();
    return { success: 0, failed: 1 };
  }
}

async function copyExhibitions() {
  log('\n📋 Copying Exhibitions...', 'blue');
  
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    await railwayClient.connect();
    
    // Get exhibitions from Railway (limit for testing)
    const result = await railwayClient.query('SELECT * FROM exhibitions LIMIT 30');
    log(`  Found ${result.rows.length} exhibitions in Railway`, 'blue');

    if (result.rows.length === 0) {
      log('  No exhibitions to migrate', 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const exhibition of result.rows) {
      try {
        // Convert Railway exhibition to Supabase format
        const supabaseExhibition = {
          // Use Railway UUID as-is
          id: exhibition.id,
          // Map Railway fields to Supabase
          title: exhibition.title_en, // Railway uses title_en
          title_en: exhibition.title_en,
          title_local: exhibition.title_local,
          subtitle: exhibition.subtitle,
          start_date: exhibition.start_date,
          end_date: exhibition.end_date,
          status: exhibition.status,
          description: exhibition.description,
          curator: exhibition.curator,
          artist: exhibition.artists ? exhibition.artists[0] : null, // Take first artist
          artists: exhibition.artists,
          artworks_count: exhibition.artworks_count,
          // Handle venue reference (will be null for now since we need to map IDs)
          venue_id: null,
          venue_id_int: exhibition.venue_id, // Store original ID
          venue_name: exhibition.venue_name,
          venue_city: exhibition.venue_city,
          venue_country: exhibition.venue_country,
          // Copy all other fields
          institution_id: exhibition.institution_id,
          ticket_price: exhibition.ticket_price,
          admission_fee: exhibition.admission_fee,
          official_url: exhibition.official_url,
          press_release_url: exhibition.press_release_url,
          virtual_tour_url: exhibition.virtual_tour_url,
          exhibition_type: exhibition.exhibition_type,
          genres: exhibition.genres,
          tags: exhibition.tags,
          view_count: exhibition.view_count,
          source: exhibition.source,
          source_url: exhibition.source_url,
          contact_info: exhibition.contact_info,
          collected_at: exhibition.collected_at,
          submission_id: exhibition.submission_id,
          ai_verified: exhibition.ai_verified,
          ai_confidence: exhibition.ai_confidence,
          website_url: exhibition.website_url,
          venue_address: exhibition.venue_address,
          phone_number: exhibition.phone_number,
          operating_hours: exhibition.operating_hours,
          created_at: exhibition.created_at,
          updated_at: exhibition.updated_at
        };

        const { error } = await supabase
          .from('exhibitions')
          .insert(supabaseExhibition);

        if (error) {
          log(`    ✗ Failed to copy exhibition ${exhibition.title_en}: ${error.message}`, 'red');
          failed++;
        } else {
          log(`    ✓ Copied exhibition: ${exhibition.title_en}`, 'green');
          success++;
        }
      } catch (error) {
        log(`    ✗ Error processing exhibition ${exhibition.title_en}: ${error.message}`, 'red');
        failed++;
      }
    }

    await railwayClient.end();
    return { success, failed };
    
  } catch (error) {
    log(`  ✗ Failed to copy exhibitions: ${error.message}`, 'red');
    await railwayClient.end();
    return { success: 0, failed: 1 };
  }
}

async function main() {
  log('🚀 Simple Data Copy from Railway to Supabase', 'blue');
  log('='.repeat(60), 'blue');

  try {
    // Test connections first
    log('\n🔌 Testing connections...', 'blue');
    
    const railwayClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await railwayClient.connect();
    await railwayClient.query('SELECT 1');
    await railwayClient.end();
    log('  ✓ Railway connection successful', 'green');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message.includes('Invalid API key')) {
      throw new Error('Supabase connection failed');
    }
    log('  ✓ Supabase connection successful', 'green');

    // Copy data
    const userResult = await copyUsers();
    const venueResult = await copyVenues(); 
    const exhibitionResult = await copyExhibitions();

    // Summary
    log('\n📊 Migration Summary', 'blue');
    log('='.repeat(60), 'blue');
    log(`Users:       ${userResult.success} successful, ${userResult.failed} failed`, userResult.failed > 0 ? 'yellow' : 'green');
    log(`Venues:      ${venueResult.success} successful, ${venueResult.failed} failed`, venueResult.failed > 0 ? 'yellow' : 'green');
    log(`Exhibitions: ${exhibitionResult.success} successful, ${exhibitionResult.failed} failed`, exhibitionResult.failed > 0 ? 'yellow' : 'green');

    const totalSuccess = userResult.success + venueResult.success + exhibitionResult.success;
    const totalFailed = userResult.failed + venueResult.failed + exhibitionResult.failed;

    log(`\nTotal: ${totalSuccess} successful, ${totalFailed} failed`, 'blue');

    if (totalFailed === 0) {
      log('\n✅ Migration completed successfully!', 'green');
    } else {
      log('\n⚠️  Migration completed with some errors', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { copyUsers, copyVenues, copyExhibitions };