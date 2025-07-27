// Full SAYU 서버 시작
process.env.SAYU_MODE = 'full';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting SAYU Full Server...');
console.log('📍 Mode:', process.env.SAYU_MODE);
console.log('📍 Environment:', process.env.NODE_ENV);

require('./src/server.js');