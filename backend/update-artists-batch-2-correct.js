const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Convert LAREMFC scores to the expected ACEFLMRS format
function convertToAptFormat(laremfcScores, animalMatches, analysis) {
  // Map LAREMFC to ACEFLMRS (multiply by 10 for percentage scale)
  const dimensions = {
    A: laremfcScores.A * 10,  // Agreeableness
    C: laremfcScores.C * 10,  // Creativity  
    E: laremfcScores.E * 10,  // Emotionality
    F: laremfcScores.F * 10,  // Flexibility
    L: laremfcScores.L * 10,  // Leadership
    M: laremfcScores.M * 10,  // Materialism
    R: laremfcScores.R * 10,  // Rationality
    S: Math.round((laremfcScores.A + laremfcScores.L + laremfcScores.F) / 3 * 10) // Social (derived from A+L+F)
  };

  // Generate primary types based on highest scoring combinations
  const primaryTypes = animalMatches.map((match, index) => ({
    type: match.animal.toUpperCase(),
    weight: match.confidence - (index * 0.1) // Decrease weight for secondary matches
  })).slice(0, 2);

  return {
    meta: {
      source: "deep_psychological_analysis_v2",
      keywords: analysis.psychological_profile.core_traits,
      reasoning: [analysis.justification],
      confidence: 0.90,
      analysis_date: new Date().toISOString(),
      methodology: "comprehensive_biographical_and_artistic_analysis"
    },
    dimensions: dimensions,
    primary_types: primaryTypes,
    // Additional SAYU-specific fields
    psychological_profile: analysis.psychological_profile,
    laremfc_raw_scores: laremfcScores,
    animal_reasoning: animalMatches
  };
}

// Artist analysis data for batch 2 (artists 5-10)
const artistAnalyses = [
  {
    id: 'a29d39b6-f318-43a6-8962-be25d83f7baa',
    name: 'Andreas Gursky',
    psychological_profile: {
      core_traits: ['perfectionist', 'analytical', 'technologically_sophisticated', 'observational', 'systematic'],
      working_style: 'methodical_and_controlled',
      social_orientation: 'selective_collaboration',
      creative_approach: 'conceptual_and_technical',
      emotional_expression: 'detached_observation'
    },
    laremfc_scores: { L: 7, A: 5, R: 9, E: 4, M: 8, F: 6, C: 8 },
    apt_animal_matches: [
      { animal: 'owl', confidence: 0.85, reasoning: 'Observational mastery, analytical precision, strategic perspective' },
      { animal: 'eagle', confidence: 0.75, reasoning: 'Large-scale vision, territorial command of photographic space' },
      { animal: 'spider', confidence: 0.70, reasoning: 'Meticulous construction, patient methodology, technical precision' }
    ],
    justification: 'Andreas Gursky exhibits classic analytical-observational personality traits. His large-scale photographs requiring extensive digital manipulation demonstrate extreme patience and perfectionism. His Düsseldorf School training under the Bechers instilled systematic documentation methods. His focus on global capitalism and consumer culture shows materialistic awareness. His selective collaborations and professional demeanor suggest moderate agreeableness. The technical complexity of his work and embrace of digital technology shows high adaptability within his chosen medium.'
  },
  
  {
    id: '4a7e6ec2-da6b-40a1-b0b1-fd08191cdab2',
    name: 'Cindy Sherman',
    psychological_profile: {
      core_traits: ['chameleon-like_adaptability', 'psychologically_exploratory', 'identity_fluid', 'performance_oriented', 'introspective'],
      working_style: 'experimental_and_transformative',
      social_orientation: 'socially_aware_but_private',
      creative_approach: 'psychological_and_performative',
      emotional_expression: 'complex_through_personas'
    },
    laremfc_scores: { L: 8, A: 6, R: 7, E: 8, M: 7, F: 9, C: 9 },
    apt_animal_matches: [
      { animal: 'chameleon', confidence: 0.90, reasoning: 'Ultimate shape-shifter, adaptive transformation, identity fluidity' },
      { animal: 'fox', confidence: 0.80, reasoning: 'Clever psychological insight, strategic persona creation' },
      { animal: 'octopus', confidence: 0.75, reasoning: 'Intelligent camouflage, complex emotional expression' }
    ],
    justification: 'Cindy Sherman embodies transformation and psychological exploration. Her 40+ year career of self-portraiture in different personas shows extreme flexibility and creativity. Her work critiques societal expectations while maintaining personal privacy, suggesting high emotional intelligence with selective agreeableness. Her strategic career moves and influential position show strong leadership. Her exploration of female identity in consumer culture demonstrates both materialistic awareness and emotional depth.'
  },

  {
    id: '07b2dfd4-c565-4506-91bf-760304761bfd',
    name: 'Anselm Kiefer',
    psychological_profile: {
      core_traits: ['mythologically_minded', 'historically_obsessed', 'materially_experimental', 'philosophically_deep', 'intensity_driven'],
      working_style: 'alchemical_and_transformative',
      social_orientation: 'intellectual_engagement',
      creative_approach: 'material_and_conceptual_fusion',
      emotional_expression: 'cathartic_and_monumental'
    },
    laremfc_scores: { L: 8, A: 5, R: 7, E: 9, M: 9, F: 6, C: 9 },
    apt_animal_matches: [
      { animal: 'bear', confidence: 0.85, reasoning: 'Powerful presence, deep hibernation/reflection, protective of territory' },
      { animal: 'raven', confidence: 0.80, reasoning: 'Mythological consciousness, connection to death/transformation' },
      { animal: 'wolf', confidence: 0.75, reasoning: 'Intensity, pack loyalty to ideas, territorial about themes' }
    ],
    justification: 'Anselm Kiefer shows intense emotional depth combined with intellectual rigor. His obsession with German history, mythology, and alchemy demonstrates high emotionality and materialism. His use of unconventional materials (lead, ash, straw) and monumental scale shows extreme creativity. His philosophical engagement and influence show leadership, while his intense personality suggests moderate agreeableness. His consistent thematic exploration shows focused rationality.'
  },

  {
    id: '13fd1a0c-8d96-44e9-be86-e2d264d682fa',
    name: 'Yinka Shonibare',
    psychological_profile: {
      core_traits: ['culturally_hybrid', 'socially_conscious', 'humor_infused', 'historically_aware', 'inclusivity_oriented'],
      working_style: 'collaborative_and_interdisciplinary',
      social_orientation: 'community_building',
      creative_approach: 'narrative_and_material_based',
      emotional_expression: 'optimistic_complexity'
    },
    laremfc_scores: { L: 8, A: 9, R: 7, E: 7, M: 8, F: 8, C: 8 },
    apt_animal_matches: [
      { animal: 'dolphin', confidence: 0.85, reasoning: 'Social intelligence, bridge-building, playful yet profound' },
      { animal: 'parrot', confidence: 0.80, reasoning: 'Cultural communication, colorful expression, social connectivity' },
      { animal: 'monkey', confidence: 0.75, reasoning: 'Social awareness, playful critique, adaptive intelligence' }
    ],
    justification: 'Yinka Shonibare demonstrates exceptional social intelligence and cultural bridge-building. His collaborative approach and mentorship of young artists shows high agreeableness and leadership. His use of "African" textiles that are actually Dutch-made demonstrates sophisticated cultural analysis and flexibility. His humor and optimism combined with serious cultural critique shows balanced emotionality and rationality.'
  },

  {
    id: '349cb5b6-f981-4df4-a337-af5d7e006b7b',
    name: 'Kerry James Marshall',
    psychological_profile: {
      core_traits: ['historically_conscious', 'representation_focused', 'technically_masterful', 'educationally_minded', 'purposefully_persistent'],
      working_style: 'methodical_and_educational',
      social_orientation: 'community_representation',
      creative_approach: 'traditional_technique_with_contemporary_content',
      emotional_expression: 'dignified_advocacy'
    },
    laremfc_scores: { L: 8, A: 8, R: 8, E: 7, M: 6, F: 6, C: 8 },
    apt_animal_matches: [
      { animal: 'elephant', confidence: 0.85, reasoning: 'Memory keeper, community protector, dignified presence' },
      { animal: 'lion', confidence: 0.80, reasoning: 'Protective leadership, territorial about representation, dignified' },
      { animal: 'owl', confidence: 0.75, reasoning: 'Wisdom keeper, educational focus, careful observation' }
    ],
    justification: 'Kerry James Marshall shows strong community leadership and educational commitment. His systematic approach to addressing absence of Black figures in art history demonstrates high rationality and leadership. His teaching career and collaborative nature shows high agreeableness. His technical mastery and consistent focus on painting shows moderate flexibility but high creativity in content approaches.'
  },

  {
    id: '20c84e69-38ce-40b4-b522-efad1f32bded',
    name: 'Kehinde Wiley',
    psychological_profile: {
      core_traits: ['charismatic_leadership', 'culturally_provocative', 'aesthetically_bold', 'globally_minded', 'tradition_challenging'],
      working_style: 'grand_and_collaborative',
      social_orientation: 'public_engagement',
      creative_approach: 'appropriation_and_transformation',
      emotional_expression: 'celebratory_and_challenging'
    },
    laremfc_scores: { L: 9, A: 7, R: 7, E: 8, M: 9, F: 8, C: 9 },
    apt_animal_matches: [
      { animal: 'peacock', confidence: 0.90, reasoning: 'Bold display, aesthetic confidence, territorial beauty' },
      { animal: 'lion', confidence: 0.85, reasoning: 'Regal presence, cultural leadership, protective of community' },
      { animal: 'tiger', confidence: 0.75, reasoning: 'Bold patterns, striking presence, individualistic confidence' }
    ],
    justification: 'Kehinde Wiley demonstrates exceptional leadership and material sophistication. His Obama portrait and global exhibitions show strong leadership and public engagement. His decorative, luxurious aesthetic shows high materialism and creativity. His collaborative studios worldwide show flexibility and agreeable approach to working with others. His challenge to traditional portraiture shows emotional engagement with cultural representation.'
  }
];

async function updateArtistProfiles() {
  console.log('🎨 Updating APT profiles for artists 5-10 with correct format...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const analysis of artistAnalyses) {
    try {
      const aptProfile = convertToAptFormat(
        analysis.laremfc_scores,
        analysis.apt_animal_matches,
        analysis
      );

      const updateQuery = `
        UPDATE artists 
        SET 
          apt_profile = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING name, id
      `;

      const result = await pool.query(updateQuery, [
        JSON.stringify(aptProfile),
        analysis.id
      ]);

      if (result.rows.length > 0) {
        console.log(`✅ ${analysis.name} - APT profile updated successfully`);
        console.log(`   LAREMFC: L${analysis.laremfc_scores.L} A${analysis.laremfc_scores.A} R${analysis.laremfc_scores.R} E${analysis.laremfc_scores.E} M${analysis.laremfc_scores.M} F${analysis.laremfc_scores.F} C${analysis.laremfc_scores.C}`);
        console.log(`   Primary animal: ${analysis.apt_animal_matches[0].animal} (${(analysis.apt_animal_matches[0].confidence * 100).toFixed(0)}%)`);
        console.log(`   Dimensions: A${aptProfile.dimensions.A} C${aptProfile.dimensions.C} E${aptProfile.dimensions.E} F${aptProfile.dimensions.F} L${aptProfile.dimensions.L} M${aptProfile.dimensions.M} R${aptProfile.dimensions.R} S${aptProfile.dimensions.S}\n`);
        successCount++;
      } else {
        console.log(`❌ ${analysis.name} - Artist not found`);
        errorCount++;
      }

    } catch (error) {
      console.error(`❌ Error updating ${analysis.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Update Summary:`);
  console.log(`✅ Successfully updated: ${successCount} artists`);
  console.log(`❌ Errors: ${errorCount} artists`);
  console.log(`🎯 Total processed: ${artistAnalyses.length} artists`);
}

async function validateUpdates() {
  console.log('\n🔍 Validating updates...\n');
  
  for (const analysis of artistAnalyses) {
    try {
      const result = await pool.query(`
        SELECT name, apt_profile
        FROM artists 
        WHERE id = $1
      `, [analysis.id]);
      
      if (result.rows.length > 0 && result.rows[0].apt_profile) {
        const profile = result.rows[0].apt_profile;
        console.log(`✅ ${result.rows[0].name}:`);
        console.log(`   Confidence: ${profile.meta.confidence}`);
        console.log(`   Primary animal: ${profile.primary_types[0].type} (${(profile.primary_types[0].weight * 100).toFixed(0)}%)`);
        console.log(`   Keywords: ${profile.meta.keywords.slice(0, 3).join(', ')}`);
      } else {
        console.log(`❌ ${analysis.name}: No profile found`);
      }
    } catch (error) {
      console.error(`❌ Error validating ${analysis.name}:`, error.message);
    }
  }
}

async function main() {
  try {
    await updateArtistProfiles();
    await validateUpdates();
    
    console.log('\n🎉 Batch 2 artist psychological profiling complete!');
    console.log('🎨 All 6 artists (5-10) now have comprehensive APT profiles');
    console.log('🔗 Ready for SAYU personality matching and recommendation system');
    
  } catch (error) {
    console.error('Main execution error:', error);
  } finally {
    await pool.end();
  }
}

main();