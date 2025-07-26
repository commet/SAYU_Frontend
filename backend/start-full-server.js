// Start the full SAYU server with artvee support
require('dotenv').config();

// Set full mode
process.env.SAYU_MODE = 'full';
process.env.PORT = process.env.PORT || 3000;

console.log('🚀 Starting SAYU Backend in Full Mode...');
console.log(`📡 Port: ${process.env.PORT}`);
console.log(`🎨 Artvee support: Enabled`);
console.log('');

// Start the server
require('./src/server.js');