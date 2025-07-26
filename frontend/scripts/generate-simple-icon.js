const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#FF6B6B');
  gradient.addColorStop(1, '#8E2DE2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw SAYU text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAYU', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(outputDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${size}x${size} icon`);
}

// Generate all icons
sizes.forEach(size => generateIcon(size));
console.log('All PWA icons generated successfully!');