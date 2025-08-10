const axios = require('axios');

async function checkCategories() {
  try {
    const response = await axios.get('http://localhost:3002/api/exhibitions?limit=788');
    const exhibitions = response.data.data;
    
    const categoryCount = {};
    exhibitions.forEach(ex => {
      categoryCount[ex.category] = (categoryCount[ex.category] || 0) + 1;
    });
    
    console.log('\n=== Category Distribution ===');
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = ((count / exhibitions.length) * 100).toFixed(1);
        console.log(`  ${category}: ${count} exhibitions (${percentage}%)`);
      });
    
    console.log(`\nTotal: ${exhibitions.length} exhibitions`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCategories();