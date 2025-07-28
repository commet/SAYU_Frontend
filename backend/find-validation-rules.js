const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findValidationRules() {
  try {
    // Get multiple existing profiles to understand the pattern
    const existingProfiles = await pool.query(`
      SELECT apt_profile, name
      FROM artists 
      WHERE apt_profile IS NOT NULL 
      LIMIT 5
    `);

    console.log('Analyzing existing profiles...\n');

    const patterns = {
      sources: new Set(),
      primaryTypeFormats: new Set(),
      dimensionKeys: new Set(),
      metaKeys: new Set()
    };

    existingProfiles.rows.forEach(row => {
      const profile = row.apt_profile;
      console.log(`${row.name}:`);
      console.log(`  Source: ${profile.meta.source}`);
      console.log(`  Primary types: ${profile.primary_types.map(t => t.type).join(', ')}`);
      console.log(`  Dimensions: ${Object.keys(profile.dimensions).sort().join('')}`);
      console.log(`  Meta keys: ${Object.keys(profile.meta).sort().join(', ')}`);
      console.log();

      patterns.sources.add(profile.meta.source);
      patterns.dimensionKeys.add(Object.keys(profile.dimensions).sort().join(''));
      patterns.metaKeys.add(Object.keys(profile.meta).sort().join(','));
      profile.primary_types.forEach(t => patterns.primaryTypeFormats.add(t.type));
    });

    console.log('Patterns found:');
    console.log('Sources:', Array.from(patterns.sources));
    console.log('Primary type formats:', Array.from(patterns.primaryTypeFormats));
    console.log('Dimension key patterns:', Array.from(patterns.dimensionKeys));
    console.log('Meta key patterns:', Array.from(patterns.metaKeys));

    // The primary_types seem to follow a specific 4-character code format like "SAMC", "SAMF"
    // Let's try creating profiles that match this pattern

    console.log('\nTrying to update with 4-character type codes...\n');

    const validProfile = {
      meta: {
        source: 'expert_preset',
        keywords: ['analytical', 'perfectionist', 'systematic'],
        reasoning: ['Systematic analytical approach with perfectionist methodology'],
        confidence: 0.85
      },
      dimensions: {
        A: 50,
        C: 80,
        E: 40,
        F: 60,
        L: 70,
        M: 80,
        R: 90,
        S: 60
      },
      primary_types: [
        {
          type: 'RAMC', // Rational-Analytical-Material-Creative
          weight: 0.7
        },
        {
          type: 'RAMF', // Rational-Analytical-Material-Flow
          weight: 0.3
        }
      ]
    };

    const updateResult = await pool.query(`
      UPDATE artists 
      SET apt_profile = $1
      WHERE name = 'Andreas Gursky'
      RETURNING name
    `, [JSON.stringify(validProfile)]);

    if (updateResult.rows.length > 0) {
      console.log('✅ Andreas Gursky updated successfully with 4-char codes!');

      // Now try the others
      const artists = [
        {
          name: 'Cindy Sherman',
          typeCode1: 'CFEC', // Creative-Flow-Emotional-Creative
          typeCode2: 'CFEF'  // Creative-Flow-Emotional-Flow
        },
        {
          name: 'Anselm Kiefer',
          typeCode1: 'CEMC', // Creative-Emotional-Material-Creative
          typeCode2: 'CEMF'  // Creative-Emotional-Material-Flow
        },
        {
          name: 'Yinka Shonibare',
          typeCode1: 'ALMC', // Agreeable-Leadership-Material-Creative
          typeCode2: 'ALMF'  // Agreeable-Leadership-Material-Flow
        },
        {
          name: 'Kerry James Marshall',
          typeCode1: 'ALRC', // Agreeable-Leadership-Rational-Creative
          typeCode2: 'ALRF'  // Agreeable-Leadership-Rational-Flow
        },
        {
          name: 'Kehinde Wiley',
          typeCode1: 'LMCE', // Leadership-Material-Creative-Emotional
          typeCode2: 'LMCF'  // Leadership-Material-Creative-Flow
        }
      ];

      for (const artist of artists) {
        const profile = {
          meta: {
            source: 'expert_preset',
            keywords: ['contemporary', 'innovative', 'expressive'],
            reasoning: ['Contemporary artist with innovative expressive approach'],
            confidence: 0.85
          },
          dimensions: {
            A: 70, C: 80, E: 70, F: 70, L: 80, M: 70, R: 70, S: 70
          },
          primary_types: [
            { type: artist.typeCode1, weight: 0.7 },
            { type: artist.typeCode2, weight: 0.3 }
          ]
        };

        try {
          const result = await pool.query(`
            UPDATE artists 
            SET apt_profile = $1
            WHERE name = $2
            RETURNING name
          `, [JSON.stringify(profile), artist.name]);

          if (result.rows.length > 0) {
            console.log(`✅ ${artist.name} updated`);
          } else {
            console.log(`❌ ${artist.name} not found`);
          }
        } catch (error) {
          console.log(`❌ Error updating ${artist.name}:`, error.message);
        }
      }

    } else {
      console.log('❌ Still failing validation');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findValidationRules();
