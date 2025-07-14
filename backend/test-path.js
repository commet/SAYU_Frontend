const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

const testPath = path.join(process.cwd(), '../artvee-crawler/data/famous-artists-artworks.json');
console.log('Testing path:', testPath);

try {
  const exists = fs.existsSync(testPath);
  console.log('File exists:', exists);
  
  if (exists) {
    const data = fs.readFileSync(testPath, 'utf8');
    const parsed = JSON.parse(data);
    console.log('Total artworks:', parsed.length);
    console.log('First artwork:', parsed[0]);
  }
} catch (error) {
  console.error('Error:', error.message);
}