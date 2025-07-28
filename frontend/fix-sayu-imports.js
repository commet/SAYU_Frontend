const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: __dirname,
  ignore: ['node_modules/**', '.next/**', 'out/**'],
  absolute: true
});

let totalFixed = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('@sayu/shared')) {
    // Calculate relative path from this file to shared directory
    const fromDir = path.dirname(file);
    const toDir = path.join(__dirname, '..', 'shared');
    let relativePath = path.relative(fromDir, toDir);
    
    // Convert Windows path separators to forward slashes
    relativePath = relativePath.replace(/\\/g, '/');
    
    // Ensure it starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Replace @sayu/shared with the relative path
    const newContent = content.replace(
      /from ['"]@sayu\/shared([^'"]*)['"]/g,
      `from '${relativePath}$1'`
    );
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Fixed: ${path.relative(__dirname, file)}`);
      totalFixed++;
    }
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);