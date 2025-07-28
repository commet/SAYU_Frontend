const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function matchExistingFormat() {
  try {
    // Get an existing working profile
    const existingProfile = await pool.query(`
      SELECT apt_profile, name
      FROM artists 
      WHERE apt_profile IS NOT NULL 
      LIMIT 1
    `);

    if (existingProfile.rows.length > 0) {
      const workingProfile = existingProfile.rows[0].apt_profile;
      console.log('Working profile from:', existingProfile.rows[0].name);
      console.log('Structure:', JSON.stringify(workingProfile, null, 2));

      // Now try to create a similar structure for Andreas Gursky
      const newProfile = {
        meta: {
          source: 'deep_psychological_analysis',
          keywords: ['analytical', 'perfectionist', 'observational', 'systematic'],
          reasoning: ['Exhibits classic analytical-observational personality traits with systematic methodology'],
          confidence: 0.85
        },
        dimensions: {
          A: 50,  // Agreeableness (5/10 * 10)
          C: 80,  // Creativity (8/10 * 10)
          E: 40,  // Emotionality (4/10 * 10)
          F: 60,  // Flexibility (6/10 * 10)
          L: 70,  // Leadership (7/10 * 10)
          M: 80,  // Materialism (8/10 * 10)
          R: 90,  // Rationality (9/10 * 10)
          S: 60   // Social (calculated average)
        },
        primary_types: [
          {
            type: 'OWL',
            weight: 0.85
          },
          {
            type: 'EAGLE',
            weight: 0.75
          }
        ]
      };

      console.log('\nTrying to update Andreas Gursky with matched format...');

      const updateResult = await pool.query(`
        UPDATE artists 
        SET apt_profile = $1
        WHERE name = 'Andreas Gursky'
        RETURNING name
      `, [JSON.stringify(newProfile)]);

      if (updateResult.rows.length > 0) {
        console.log('✅ Successfully updated Andreas Gursky!');

        // Now let's try the others with the same format
        const otherArtists = [
          {
            name: 'Cindy Sherman',
            profile: {
              meta: {
                source: 'deep_psychological_analysis',
                keywords: ['transformative', 'adaptable', 'psychological', 'performative'],
                reasoning: ['Embodies transformation and psychological exploration through personas'],
                confidence: 0.90
              },
              dimensions: { A: 60, C: 90, E: 80, F: 90, L: 80, M: 70, R: 70, S: 77 },
              primary_types: [
                { type: 'CHAMELEON', weight: 0.90 },
                { type: 'FOX', weight: 0.80 }
              ]
            }
          },
          {
            name: 'Anselm Kiefer',
            profile: {
              meta: {
                source: 'deep_psychological_analysis',
                keywords: ['mythological', 'intense', 'material', 'philosophical'],
                reasoning: ['Shows intense emotional depth with intellectual rigor and material experimentation'],
                confidence: 0.85
              },
              dimensions: { A: 50, C: 90, E: 90, F: 60, L: 80, M: 90, R: 70, S: 63 },
              primary_types: [
                { type: 'BEAR', weight: 0.85 },
                { type: 'RAVEN', weight: 0.80 }
              ]
            }
          },
          {
            name: 'Yinka Shonibare',
            profile: {
              meta: {
                source: 'deep_psychological_analysis',
                keywords: ['collaborative', 'cultural', 'humorous', 'inclusive'],
                reasoning: ['Demonstrates exceptional social intelligence and cultural bridge-building'],
                confidence: 0.85
              },
              dimensions: { A: 90, C: 80, E: 70, F: 80, L: 80, M: 80, R: 70, S: 83 },
              primary_types: [
                { type: 'DOLPHIN', weight: 0.85 },
                { type: 'PARROT', weight: 0.80 }
              ]
            }
          },
          {
            name: 'Kerry James Marshall',
            profile: {
              meta: {
                source: 'deep_psychological_analysis',
                keywords: ['educational', 'historical', 'methodical', 'representative'],
                reasoning: ['Shows strong community leadership and educational commitment'],
                confidence: 0.85
              },
              dimensions: { A: 80, C: 80, E: 70, F: 60, L: 80, M: 60, R: 80, S: 73 },
              primary_types: [
                { type: 'ELEPHANT', weight: 0.85 },
                { type: 'LION', weight: 0.80 }
              ]
            }
          },
          {
            name: 'Kehinde Wiley',
            profile: {
              meta: {
                source: 'deep_psychological_analysis',
                keywords: ['charismatic', 'bold', 'global', 'decorative'],
                reasoning: ['Demonstrates exceptional leadership and material sophistication'],
                confidence: 0.90
              },
              dimensions: { A: 70, C: 90, E: 80, F: 80, L: 90, M: 90, R: 70, S: 80 },
              primary_types: [
                { type: 'PEACOCK', weight: 0.90 },
                { type: 'LION', weight: 0.85 }
              ]
            }
          }
        ];

        for (const artist of otherArtists) {
          try {
            const result = await pool.query(`
              UPDATE artists 
              SET apt_profile = $1
              WHERE name = $2
              RETURNING name
            `, [JSON.stringify(artist.profile), artist.name]);

            if (result.rows.length > 0) {
              console.log(`✅ Updated ${artist.name}`);
            } else {
              console.log(`❌ ${artist.name} not found`);
            }
          } catch (error) {
            console.log(`❌ Error updating ${artist.name}:`, error.message);
          }
        }

      } else {
        console.log('❌ No rows returned - update may have failed');
      }

    } else {
      console.log('No existing profiles found to match format');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

matchExistingFormat();
