const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findMatchingArtists() {
  const targetArtists = [
    'South German',
    'Augsburg',
    'Raffaello Sanzio',
    'Raphael',
    'Alessandro Longhi',
    'Rosalba Carriera',
    'Gerard van Groeningen',
    'Apollonio di Giovanni',
    'Milan Marsyas Painter',
    'George Jakob Hunzinger',
    'Nicholas Dixon',
    'Rembrandt van Rijn',
    'Rembrandt'
  ];

  console.log('🔍 Searching for matching artists in database...\n');

  for (const artist of targetArtists) {
    const result = await pool.query(`
      SELECT name, name_ko, nationality, birth_year, death_year, apt_profile
      FROM artists 
      WHERE name ILIKE '%${artist}%' OR name_ko ILIKE '%${artist}%'
      LIMIT 3
    `);

    if (result.rows.length > 0) {
      console.log(`Found matches for '${artist}':`);
      result.rows.forEach(row => {
        console.log(`  - ${row.name} (${row.name_ko || 'No Korean'})`);
        console.log(`    Birth-Death: ${row.birth_year || '?'}-${row.death_year || 'present'}`);
        console.log(`    Nationality: ${row.nationality}`);
        if (row.apt_profile) {
          console.log(`    APT Profile: EXISTS`);
        } else {
          console.log(`    APT Profile: MISSING`);
        }
      });
      console.log('');
    }
  }

  // Check APT profile structure from existing data
  console.log('\n📊 Checking existing APT profile structure...');
  const aptExists = await pool.query(`
    SELECT name, apt_profile 
    FROM artists 
    WHERE apt_profile IS NOT NULL 
    LIMIT 5
  `);

  if (aptExists.rows.length > 0) {
    console.log('Found artists with APT profiles:');
    aptExists.rows.forEach(row => {
      console.log(`\n${row.name}:`);
      console.log(JSON.stringify(row.apt_profile, null, 2));
    });
  } else {
    console.log('No APT profiles found in database yet.');
  }

  await pool.end();
}

findMatchingArtists().catch(console.error);
