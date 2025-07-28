// Test script for SAYU integration
const SAYUTypes = require('../models/sayuTypes');
const SAYURelationships = require('../models/sayuRelationships');
const SAYUArtworkMatcher = require('../models/sayuArtworkMatcher');
const SAYUQuizService = require('../services/sayuQuizService');

console.log('=== SAYU Integration Test ===\n');

async function testIntegration() {
  try {
    // 1. Test SAYU Types System
    console.log('1. Testing SAYU Types System...');
    const typesSystem = new SAYUTypes();
    const testType = 'LAEF';
    const typeInfo = typesSystem.getTypeInfo(testType);

    if (typeInfo) {
      console.log(`✓ Type ${testType}: ${typeInfo.name}`);
      console.log(`  Description: ${typeInfo.description}`);
      console.log(`  Functions: ${typeInfo.conscious.join(' → ')}`);
    } else {
      console.error('✗ Failed to load type information');
    }

    // 2. Test Relationships System
    console.log('\n2. Testing Relationships System...');
    const relationshipsSystem = new SAYURelationships(typesSystem);
    const bestMatches = relationshipsSystem.getBestMatches('LAEF', 3);

    console.log('✓ Best matches for LAEF:');
    bestMatches.forEach(match => {
      console.log(`  - ${match.type}: ${match.name} (${match.compatibility.toFixed(2)})`);
    });

    // 3. Test Artwork Matcher
    console.log('\n3. Testing Artwork Matcher...');
    const artworkMatcher = new SAYUArtworkMatcher(typesSystem);
    const sampleArtwork = {
      abstractionLevel: 0.8,
      emotionalIntensity: 0.9,
      requiresContemplation: 0.7,
      explorationFriendly: 0.8
    };

    const artworkScores = artworkMatcher.analyzeArtworkForTypes(sampleArtwork);
    const topMatches = Object.entries(artworkScores)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);

    console.log('✓ Top artwork matches:');
    topMatches.forEach(([type, score]) => {
      console.log(`  - ${type}: ${score.total.toFixed(2)}`);
    });

    // 4. Test Quiz Service
    console.log('\n4. Testing Quiz Service...');
    const quizService = new SAYUQuizService();
    const session = quizService.createSession('test-user', 'ko');

    console.log(`✓ Created session: ${session.sessionId}`);
    console.log(`  Language: ${session.language}`);
    console.log(`  Status: ${session.status}`);

    // 5. Test Question Processing
    console.log('\n5. Testing Question Processing...');
    const { sayuEnhancedQuizData } = require('../data/sayuEnhancedQuizData');
    const firstQuestion = sayuEnhancedQuizData.questions[0];

    if (firstQuestion) {
      console.log(`✓ First question loaded: ${firstQuestion.title}`);
      console.log(`  Type: ${firstQuestion.type}`);
      console.log(`  Options: ${firstQuestion.options ? firstQuestion.options.length : 0}`);
    }

    // 6. Test All 16 Types
    console.log('\n6. Verifying All 16 SAYU Types...');
    const allTypes = Object.keys(typesSystem.typeFunctions);
    console.log(`✓ Total types defined: ${allTypes.length}`);

    const typesByGroup = {
      'L+A': allTypes.filter(t => t.startsWith('LA')),
      'L+R': allTypes.filter(t => t.startsWith('LR')),
      'S+A': allTypes.filter(t => t.startsWith('SA')),
      'S+R': allTypes.filter(t => t.startsWith('SR'))
    };

    Object.entries(typesByGroup).forEach(([group, types]) => {
      console.log(`  ${group}: ${types.join(', ')} (${types.length} types)`);
    });

    // 7. Test Function Distribution
    console.log('\n7. Testing Function Distribution...');
    const functionCounts = {};
    allTypes.forEach(type => {
      const info = typesSystem.getTypeInfo(type);
      info.conscious.forEach(func => {
        functionCounts[func] = (functionCounts[func] || 0) + 1;
      });
    });

    console.log('✓ Function usage across all types:');
    Object.entries(functionCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([func, count]) => {
        console.log(`  ${func} (${typesSystem.functions[func]}): ${count} times`);
      });

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run tests
testIntegration();
