const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Artist analysis data for batch 2 (artists 5-10)
const artistAnalyses = [
  {
    // Andreas Gursky - The Analytical Architect
    id: 'a29d39b6-f318-43a6-8962-be25d83f7baa',
    name: 'Andreas Gursky',
    psychological_profile: {
      // Based on his large-scale photography and meticulous digital manipulation
      core_traits: [
        'perfectionist',
        'analytical',
        'technologically_sophisticated',
        'observational',
        'systematic'
      ],
      working_style: 'methodical_and_controlled',
      social_orientation: 'selective_collaboration',
      creative_approach: 'conceptual_and_technical',
      emotional_expression: 'detached_observation'
    },
    laremfc_scores: {
      // Leadership (7/10) - Established unique visual language in contemporary photography
      L: 7,
      // Agreeableness (5/10) - Professional but maintains distance, selective in collaborations
      A: 5, 
      // Rationality (9/10) - Highly analytical, systematic approach to art-making
      R: 9,
      // Emotionality (4/10) - Controlled emotional expression, maintains distance
      E: 4,
      // Materialism (8/10) - Focus on consumer culture, capitalism, global commerce
      M: 8,
      // Flexibility (6/10) - Adaptable with technology but maintains consistent vision
      F: 6,
      // Creativity (8/10) - Innovative use of digital manipulation and scale
      C: 8
    },
    apt_animal_matches: [
      { animal: 'owl', confidence: 0.85, reasoning: 'Observational mastery, analytical precision, strategic perspective' },
      { animal: 'eagle', confidence: 0.75, reasoning: 'Large-scale vision, territorial command of photographic space' },
      { animal: 'spider', confidence: 0.70, reasoning: 'Meticulous construction, patient methodology, technical precision' }
    ],
    justification: `Andreas Gursky exhibits classic analytical-observational personality traits. His large-scale photographs requiring extensive digital manipulation demonstrate extreme patience and perfectionism. His Düsseldorf School training under the Bechers instilled systematic documentation methods. His focus on global capitalism and consumer culture shows materialistic awareness. His selective collaborations and professional demeanor suggest moderate agreeableness. The technical complexity of his work and embrace of digital technology shows high adaptability within his chosen medium.`
  },
  
  {
    // Cindy Sherman - The Shape-Shifting Performer  
    id: '4a7e6ec2-da6b-40a1-b0b1-fd08191cdab2',
    name: 'Cindy Sherman',
    psychological_profile: {
      core_traits: [
        'chameleon-like_adaptability',
        'psychologically_exploratory', 
        'identity_fluid',
        'performance_oriented',
        'introspective'
      ],
      working_style: 'experimental_and_transformative',
      social_orientation: 'socially_aware_but_private',
      creative_approach: 'psychological_and_performative',
      emotional_expression: 'complex_through_personas'
    },
    laremfc_scores: {
      // Leadership (8/10) - Pioneer of conceptual photography, major influence
      L: 8,
      // Agreeableness (6/10) - Collaborative but maintains privacy, selectively social
      A: 6,
      // Rationality (7/10) - Strategic about career and artistic development
      R: 7,
      // Emotionality (8/10) - Deep exploration of psychological states through characters
      E: 8,
      // Materialism (7/10) - Critiques consumer culture, fashion, beauty standards
      M: 7,
      // Flexibility (9/10) - Extreme adaptability, constant transformation
      F: 9,
      // Creativity (9/10) - Innovative conceptual approach, endless reinvention
      C: 9
    },
    apt_animal_matches: [
      { animal: 'chameleon', confidence: 0.90, reasoning: 'Ultimate shape-shifter, adaptive transformation, identity fluidity' },
      { animal: 'fox', confidence: 0.80, reasoning: 'Clever psychological insight, strategic persona creation' },
      { animal: 'octopus', confidence: 0.75, reasoning: 'Intelligent camouflage, complex emotional expression' }
    ],
    justification: `Cindy Sherman embodies transformation and psychological exploration. Her 40+ year career of self-portraiture in different personas shows extreme flexibility and creativity. Her work critiques societal expectations while maintaining personal privacy, suggesting high emotional intelligence with selective agreeableness. Her strategic career moves and influential position show strong leadership. Her exploration of female identity in consumer culture demonstrates both materialistic awareness and emotional depth.`
  },

  {
    // Anselm Kiefer - The Mythological Alchemist
    id: '07b2dfd4-c565-4506-91bf-760304761bfd', 
    name: 'Anselm Kiefer',
    psychological_profile: {
      core_traits: [
        'mythologically_minded',
        'historically_obsessed',
        'materially_experimental',
        'philosophically_deep',
        'intensity_driven'
      ],
      working_style: 'alchemical_and_transformative',
      social_orientation: 'intellectual_engagement',
      creative_approach: 'material_and_conceptual_fusion',
      emotional_expression: 'cathartic_and_monumental'
    },
    laremfc_scores: {
      // Leadership (8/10) - Major influence on contemporary painting and installation
      L: 8,
      // Agreeableness (5/10) - Intellectually engaging but can be intense and demanding
      A: 5,
      // Rationality (7/10) - Systematic exploration of themes, well-read and philosophical  
      R: 7,
      // Emotionality (9/10) - Deeply emotional engagement with history, trauma, mythology
      E: 9,
      // Materialism (9/10) - Extensive use of unconventional materials (lead, ash, straw, etc.)
      M: 9,
      // Flexibility (6/10) - Adaptable materials but consistent thematic obsessions
      F: 6,
      // Creativity (9/10) - Innovative material use, monumental scale, conceptual depth
      C: 9
    },
    apt_animal_matches: [
      { animal: 'bear', confidence: 0.85, reasoning: 'Powerful presence, deep hibernation/reflection, protective of territory' },
      { animal: 'raven', confidence: 0.80, reasoning: 'Mythological consciousness, connection to death/transformation' },
      { animal: 'wolf', confidence: 0.75, reasoning: 'Intensity, pack loyalty to ideas, territorial about themes' }
    ],
    justification: `Anselm Kiefer shows intense emotional depth combined with intellectual rigor. His obsession with German history, mythology, and alchemy demonstrates high emotionality and materialism. His use of unconventional materials (lead, ash, straw) and monumental scale shows extreme creativity. His philosophical engagement and influence show leadership, while his intense personality suggests moderate agreeableness. His consistent thematic exploration shows focused rationality.`
  },

  {
    // Yinka Shonibare - The Cultural Bridge-Builder
    id: '13fd1a0c-8d96-44e9-be86-e2d264d682fa',
    name: 'Yinka Shonibare',
    psychological_profile: {
      core_traits: [
        'culturally_hybrid',
        'socially_conscious',
        'humor_infused',
        'historically_aware',
        'inclusivity_oriented'
      ],
      working_style: 'collaborative_and_interdisciplinary',
      social_orientation: 'community_building',
      creative_approach: 'narrative_and_material_based',
      emotional_expression: 'optimistic_complexity'
    },
    laremfc_scores: {
      // Leadership (8/10) - Strong advocacy for diversity, mentorship, institutional presence
      L: 8,
      // Agreeableness (9/10) - Highly collaborative, community-focused, mentoring approach
      A: 9,
      // Rationality (7/10) - Strategic about representation and institutional critique
      R: 7,
      // Emotionality (7/10) - Emotional engagement with cultural identity and history
      E: 7,
      // Materialism (8/10) - Fascination with textiles, objects, consumer culture
      M: 8,
      // Flexibility (8/10) - Works across media, adapts to different cultural contexts
      F: 8,
      // Creativity (8/10) - Innovative use of materials and cultural references
      C: 8
    },
    apt_animal_matches: [
      { animal: 'dolphin', confidence: 0.85, reasoning: 'Social intelligence, bridge-building, playful yet profound' },
      { animal: 'parrot', confidence: 0.80, reasoning: 'Cultural communication, colorful expression, social connectivity' },
      { animal: 'monkey', confidence: 0.75, reasoning: 'Social awareness, playful critique, adaptive intelligence' }
    ],
    justification: `Yinka Shonibare demonstrates exceptional social intelligence and cultural bridge-building. His collaborative approach and mentorship of young artists shows high agreeableness and leadership. His use of "African" textiles that are actually Dutch-made demonstrates sophisticated cultural analysis and flexibility. His humor and optimism combined with serious cultural critique shows balanced emotionality and rationality.`
  },

  {
    // Kerry James Marshall - The Cultural Historian
    id: '349cb5b6-f981-4df4-a337-af5d7e006b7b',
    name: 'Kerry James Marshall',
    psychological_profile: {
      core_traits: [
        'historically_conscious',
        'representation_focused',
        'technically_masterful',
        'educationally_minded',
        'purposefully_persistent'
      ],
      working_style: 'methodical_and_educational',
      social_orientation: 'community_representation',
      creative_approach: 'traditional_technique_with_contemporary_content',
      emotional_expression: 'dignified_advocacy'
    },
    laremfc_scores: {
      // Leadership (8/10) - Major influence on representation in art, teaching leadership
      L: 8,
      // Agreeableness (8/10) - Strong teaching commitment, community focus, collaborative
      A: 8,
      // Rationality (8/10) - Systematic approach to addressing representation gaps
      R: 8,
      // Emotionality (7/10) - Deep emotional connection to Black experience and dignity
      E: 7,
      // Materialism (6/10) - Focus on traditional painting materials and techniques
      M: 6,
      // Flexibility (6/10) - Consistent medium focus but adaptable in scale and content
      F: 6,
      // Creativity (8/10) - Innovative approaches to traditional painting
      C: 8
    },
    apt_animal_matches: [
      { animal: 'elephant', confidence: 0.85, reasoning: 'Memory keeper, community protector, dignified presence' },
      { animal: 'lion', confidence: 0.80, reasoning: 'Protective leadership, territorial about representation, dignified' },
      { animal: 'owl', confidence: 0.75, reasoning: 'Wisdom keeper, educational focus, careful observation' }
    ],
    justification: `Kerry James Marshall shows strong community leadership and educational commitment. His systematic approach to addressing absence of Black figures in art history demonstrates high rationality and leadership. His teaching career and collaborative nature shows high agreeableness. His technical mastery and consistent focus on painting shows moderate flexibility but high creativity in content approaches.`
  },

  {
    // Kehinde Wiley - The Regal Revolutionist  
    id: '20c84e69-38ce-40b4-b522-efad1f32bded',
    name: 'Kehinde Wiley',
    psychological_profile: {
      core_traits: [
        'charismatic_leadership',
        'culturally_provocative',
        'aesthetically_bold',
        'globally_minded',
        'tradition_challenging'
      ],
      working_style: 'grand_and_collaborative',
      social_orientation: 'public_engagement',
      creative_approach: 'appropriation_and_transformation',
      emotional_expression: 'celebratory_and_challenging'
    },
    laremfc_scores: {
      // Leadership (9/10) - Major public commissions, global presence, institutional influence
      L: 9,
      // Agreeableness (7/10) - Charismatic and collaborative but can be challenging
      A: 7,
      // Rationality (7/10) - Strategic about career and cultural impact
      R: 7,
      // Emotionality (8/10) - Emotional engagement with representation and beauty
      E: 8,
      // Materialism (9/10) - Fascination with luxury, decoration, material excess
      M: 9,
      // Flexibility (8/10) - Adapts across scales, locations, and cultural contexts
      F: 8,
      // Creativity (9/10) - Bold innovative approach to portraiture and public art
      C: 9
    },
    apt_animal_matches: [
      { animal: 'peacock', confidence: 0.90, reasoning: 'Bold display, aesthetic confidence, territorial beauty' },
      { animal: 'lion', confidence: 0.85, reasoning: 'Regal presence, cultural leadership, protective of community' },
      { animal: 'tiger', confidence: 0.75, reasoning: 'Bold patterns, striking presence, individualistic confidence' }
    ],
    justification: `Kehinde Wiley demonstrates exceptional leadership and material sophistication. His Obama portrait and global exhibitions show strong leadership and public engagement. His decorative, luxurious aesthetic shows high materialism and creativity. His collaborative studios worldwide show flexibility and agreeable approach to working with others. His challenge to traditional portraiture shows emotional engagement with cultural representation.`
  }
];

async function updateArtistProfiles() {
  console.log('🎨 Updating APT profiles for artists 5-10...\n');
  
  for (const analysis of artistAnalyses) {
    try {
      const aptProfile = {
        psychological_profile: analysis.psychological_profile,
        laremfc_scores: analysis.laremfc_scores,
        apt_animal_matches: analysis.apt_animal_matches,
        justification: analysis.justification,
        analysis_date: new Date().toISOString(),
        analysis_version: 'v2.0_deep_psychological',
        confidence_level: 'high',
        methodology: 'comprehensive_biographical_and_artistic_analysis'
      };

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
        console.log(`✅ ${analysis.name} - APT profile updated`);
        console.log(`   LAREMFC: L${analysis.laremfc_scores.L} A${analysis.laremfc_scores.A} R${analysis.laremfc_scores.R} E${analysis.laremfc_scores.E} M${analysis.laremfc_scores.M} F${analysis.laremfc_scores.F} C${analysis.laremfc_scores.C}`);
        console.log(`   Primary animal: ${analysis.apt_animal_matches[0].animal} (${analysis.apt_animal_matches[0].confidence})`);
        console.log(`   Secondary: ${analysis.apt_animal_matches[1].animal} (${analysis.apt_animal_matches[1].confidence})\n`);
      } else {
        console.log(`❌ ${analysis.name} - Artist not found`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${analysis.name}:`, error.message);
    }
  }
}

async function generateReport() {
  console.log('\n📊 COMPREHENSIVE ANALYSIS REPORT - BATCH 2 (Artists 5-10)\n');
  console.log('=' .repeat(70));
  
  for (const analysis of artistAnalyses) {
    console.log(`\n🎨 ${analysis.name.toUpperCase()}`);
    console.log('-'.repeat(50));
    
    console.log('🧠 PSYCHOLOGICAL PROFILE:');
    console.log(`   Core Traits: ${analysis.psychological_profile.core_traits.join(', ')}`);
    console.log(`   Working Style: ${analysis.psychological_profile.working_style}`);
    console.log(`   Social Orientation: ${analysis.psychological_profile.social_orientation}`);
    console.log(`   Creative Approach: ${analysis.psychological_profile.creative_approach}`);
    console.log(`   Emotional Expression: ${analysis.psychological_profile.emotional_expression}`);
    
    console.log('\n📏 LAREMFC DIMENSIONAL SCORES:');
    const scores = analysis.laremfc_scores;
    console.log(`   Leadership (L): ${scores.L}/10`);
    console.log(`   Agreeableness (A): ${scores.A}/10`);
    console.log(`   Rationality (R): ${scores.R}/10`);
    console.log(`   Emotionality (E): ${scores.E}/10`);
    console.log(`   Materialism (M): ${scores.M}/10`);
    console.log(`   Flexibility (F): ${scores.F}/10`);
    console.log(`   Creativity (C): ${scores.C}/10`);
    
    console.log('\n🐾 APT ANIMAL MATCHES:');
    analysis.apt_animal_matches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.animal.toUpperCase()} (${(match.confidence * 100).toFixed(0)}%)`);
      console.log(`      Reasoning: ${match.reasoning}`);
    });
    
    console.log('\n💭 PSYCHOLOGICAL JUSTIFICATION:');
    console.log(`   ${analysis.justification}`);
  }
  
  console.log('\n\n🔍 BATCH ANALYSIS SUMMARY:');
  console.log('=' .repeat(70));
  
  // Calculate average scores
  const avgScores = {
    L: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  };
  
  artistAnalyses.forEach(analysis => {
    Object.keys(avgScores).forEach(key => {
      avgScores[key] += analysis.laremfc_scores[key];
    });
  });
  
  Object.keys(avgScores).forEach(key => {
    avgScores[key] = (avgScores[key] / artistAnalyses.length).toFixed(1);
  });
  
  console.log('📊 Average LAREMFC Scores for Batch 2:');
  console.log(`   Leadership: ${avgScores.L}/10`);
  console.log(`   Agreeableness: ${avgScores.A}/10`); 
  console.log(`   Rationality: ${avgScores.R}/10`);
  console.log(`   Emotionality: ${avgScores.E}/10`);
  console.log(`   Materialism: ${avgScores.M}/10`);
  console.log(`   Flexibility: ${avgScores.F}/10`);
  console.log(`   Creativity: ${avgScores.C}/10`);
  
  // Animal distribution
  const animalCounts = {};
  artistAnalyses.forEach(analysis => {
    analysis.apt_animal_matches.forEach(match => {
      animalCounts[match.animal] = (animalCounts[match.animal] || 0) + 1;
    });
  });
  
  console.log('\n🐾 Animal Type Distribution:');
  Object.entries(animalCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([animal, count]) => {
      console.log(`   ${animal}: ${count} matches`);
    });
    
  console.log('\n✅ Batch 2 analysis complete - 6 artists profiled');
  console.log('🎯 Ready for SAYU personality matching system integration');
}

async function main() {
  try {
    await updateArtistProfiles();
    await generateReport();
  } catch (error) {
    console.error('Error in analysis:', error);
  } finally {
    await pool.end();
  }
}

main();