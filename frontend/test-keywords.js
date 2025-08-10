// Simple test to verify keywords are properly added to personality descriptions
const personalityDescriptions = require('./data/personality-descriptions.ts');

// Test LRMF has keywords
console.log('Testing LRMF keywords:');
if (personalityDescriptions.personalityDescriptions?.LRMF?.keywords) {
  console.log('✅ LRMF English keywords:', personalityDescriptions.personalityDescriptions.LRMF.keywords);
  console.log('✅ LRMF Korean keywords:', personalityDescriptions.personalityDescriptions.LRMF.keywords_ko);
} else {
  console.log('❌ LRMF keywords not found');
}

// Test SAEF has keywords
console.log('\nTesting SAEF keywords:');
if (personalityDescriptions.personalityDescriptions?.SAEF?.keywords) {
  console.log('✅ SAEF English keywords:', personalityDescriptions.personalityDescriptions.SAEF.keywords);
  console.log('✅ SAEF Korean keywords:', personalityDescriptions.personalityDescriptions.SAEF.keywords_ko);
} else {
  console.log('❌ SAEF keywords not found');
}