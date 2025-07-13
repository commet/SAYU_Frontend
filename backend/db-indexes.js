const { execSync } = require('child_process');
const path = require('path');

// Cross-platform database index creation script
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sqlFilePath = path.join(__dirname, 'migrations', 'performance-indexes.sql');

try {
  console.log('Creating database indexes...');
  execSync(`psql "${databaseUrl}" -f "${sqlFilePath}"`, { stdio: 'inherit' });
  console.log('Database indexes created successfully');
} catch (error) {
  console.error('Error creating database indexes:', error.message);
  process.exit(1);
}