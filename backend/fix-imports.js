const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');

// Get all .js files in routes directory
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix auth imports
  if (content.includes("const { authenticateToken, optionalAuth } = require('../middleware/auth')")) {
    content = content.replace(
      "const { authenticateToken, optionalAuth } = require('../middleware/auth')",
      "const { authenticateToken, optionalAuth } = require('../middleware/authHelpers')"
    );
  }
  
  // Fix validation imports
  if (content.includes("const { validateRequest } = require('../middleware/validation')")) {
    content = content.replace(
      "const { validateRequest } = require('../middleware/validation')",
      "const validateRequest = require('../middleware/validateRequest')"
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed imports in ${file}`);
});

console.log('Done!');