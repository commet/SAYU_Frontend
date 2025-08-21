// Test script for progressive engagement features
// Run this in browser console to simulate guest interactions

console.log('🎨 Testing SAYU Progressive Engagement Features');

// Test 1: Guest Storage Functionality
console.log('\n1. Testing Guest Storage...');
const { GuestStorage } = window;

if (!GuestStorage) {
  console.error('❌ GuestStorage not available');
} else {
  // Clear previous data
  GuestStorage.clearData();
  
  // Test basic functionality
  console.log('✅ Guest ID:', GuestStorage.getGuestId());
  
  // Test artwork saving
  GuestStorage.addSavedArtwork('artwork-1');
  GuestStorage.addSavedArtwork('artwork-2');
  GuestStorage.addSavedArtwork('artwork-3');
  
  const data = GuestStorage.getData();
  console.log('✅ Saved artworks:', data.savedArtworks);
  console.log('✅ Milestones:', data.milestones);
  
  // Test export for migration
  const exportData = GuestStorage.exportForUser();
  console.log('✅ Export data:', exportData);
}

// Test 2: Guest Tracking Hook Simulation
console.log('\n2. Testing Guest Tracking...');

// Simulate interaction tracking
const simulateGuestInteractions = () => {
  console.log('Simulating guest interactions...');
  
  // Track various interactions
  const interactions = [
    { type: 'artwork_click', data: { artworkId: 'art-1', category: 'paintings' } },
    { type: 'like', data: { artworkId: 'art-1' } },
    { type: 'save', data: { artworkId: 'art-1' } },
    { type: 'category_change', data: { category: 'sculpture' } },
    { type: 'artwork_click', data: { artworkId: 'art-2', category: 'sculpture' } },
    { type: 'save', data: { artworkId: 'art-2' } },
  ];
  
  // Simulate progressive interaction buildup
  interactions.forEach((interaction, index) => {
    setTimeout(() => {
      console.log(`📊 Interaction ${index + 1}:`, interaction.type, interaction.data);
      
      // Store in localStorage (simulating useGuestTracking)
      const stored = JSON.parse(localStorage.getItem('sayu_guest_interactions') || '[]');
      stored.push({
        type: interaction.type,
        timestamp: Date.now(),
        data: interaction.data
      });
      localStorage.setItem('sayu_guest_interactions', JSON.stringify(stored));
      
      // Check thresholds
      if (stored.length === 3) {
        console.log('🎯 Threshold reached: Show subtle prompt');
      } else if (stored.length === 5) {
        console.log('🎯 Threshold reached: Show signup prompt');
        window.dispatchEvent(new CustomEvent('guest-milestone', { 
          detail: { milestone: 'high_engagement', interactionCount: stored.length }
        }));
      }
    }, index * 1000);
  });
};

simulateGuestInteractions();

// Test 3: Migration API (mock)
console.log('\n3. Testing Migration Flow...');

const testMigration = async () => {
  console.log('Testing migration logic...');
  
  // Simulate user data
  const mockUserId = 'test-user-123';
  const mockGuestData = {
    personalityType: 'SREF',
    personalityData: { E: 0.6, A: 0.8, C: 0.5, N: 0.3, O: 0.7 },
    savedArtworks: ['art-1', 'art-2', 'art-3'],
    preferences: {
      styles: ['impressionism', 'post-impressionism'],
      moods: ['peaceful', 'inspiring'],
      themes: ['nature', 'portraits']
    },
    analytics: {
      viewedArtworks: ['art-1', 'art-2', 'art-3', 'art-4'],
      milestones: {
        quizCompleted: true,
        firstArtworkSaved: true,
        threeArtworksSaved: true
      }
    }
  };
  
  console.log('📤 Mock migration data:', mockGuestData);
  console.log('✅ Migration would migrate:', {
    artworks: mockGuestData.savedArtworks.length,
    personalityType: mockGuestData.personalityType,
    preferences: Object.keys(mockGuestData.preferences).length
  });
};

testMigration();

// Test 4: Collection Page Functionality
console.log('\n4. Testing Collection Page Features...');

const testCollectionFeatures = () => {
  console.log('Testing collection page logic...');
  
  // Simulate guest limitations
  const mockSavedArtworks = [
    'art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-7'
  ];
  
  const isGuest = true;
  const previewLimit = 5;
  
  const displayArtworks = isGuest 
    ? mockSavedArtworks.slice(0, previewLimit)
    : mockSavedArtworks;
  
  const hiddenCount = isGuest && mockSavedArtworks.length > previewLimit 
    ? mockSavedArtworks.length - previewLimit 
    : 0;
  
  console.log('📊 Guest collection test:');
  console.log('  - Total artworks:', mockSavedArtworks.length);
  console.log('  - Displayed artworks:', displayArtworks.length);
  console.log('  - Hidden artworks:', hiddenCount);
  console.log('  - Should show upgrade prompt:', hiddenCount > 0);
};

testCollectionFeatures();

// Test 5: Progressive Prompt Logic
console.log('\n5. Testing Progressive Prompt Logic...');

const testProgressivePrompts = () => {
  const scenarios = [
    {
      name: 'First-time visitor',
      interactions: 2,
      savedArtworks: 0,
      sessionTime: 60,
      expected: 'No prompt'
    },
    {
      name: 'Engaged explorer',
      interactions: 5,
      savedArtworks: 1,
      sessionTime: 180,
      expected: 'Gentle prompt'
    },
    {
      name: 'Active collector',
      interactions: 8,
      savedArtworks: 3,
      sessionTime: 300,
      expected: 'Strong prompt'
    },
    {
      name: 'Power user',
      interactions: 15,
      savedArtworks: 7,
      sessionTime: 600,
      expected: 'Urgent prompt'
    }
  ];
  
  scenarios.forEach(scenario => {
    const shouldPrompt = scenario.interactions >= 5 || 
                        scenario.savedArtworks >= 2 || 
                        scenario.sessionTime >= 300;
    
    const urgency = scenario.savedArtworks >= 5 ? 'high' : 
                   scenario.interactions >= 10 ? 'medium' : 'low';
    
    console.log(`📋 ${scenario.name}:`);
    console.log(`  - Should show prompt: ${shouldPrompt}`);
    console.log(`  - Urgency level: ${urgency}`);
    console.log(`  - Expected: ${scenario.expected}`);
  });
};

testProgressivePrompts();

// Test 6: Event Listeners
console.log('\n6. Testing Event System...');

// Set up listeners
window.addEventListener('guest-milestone', (event) => {
  console.log('🎉 Guest milestone event:', event.detail);
});

// Trigger test events
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('guest-milestone', { 
    detail: { milestone: 'first_save', interactionCount: 1 }
  }));
}, 2000);

setTimeout(() => {
  window.dispatchEvent(new CustomEvent('guest-milestone', { 
    detail: { milestone: 'collection_started', interactionCount: 3 }
  }));
}, 3000);

setTimeout(() => {
  window.dispatchEvent(new CustomEvent('guest-milestone', { 
    detail: { milestone: 'high_engagement', interactionCount: 10 }
  }));
}, 4000);

console.log('\n✅ All tests initiated. Check console output over the next 5 seconds.');
console.log('🎯 To test manually:');
console.log('   1. Go to /gallery as guest');
console.log('   2. Save some artworks');
console.log('   3. Browse different categories');
console.log('   4. Visit /gallery/collection');
console.log('   5. Watch for progressive signup prompts');