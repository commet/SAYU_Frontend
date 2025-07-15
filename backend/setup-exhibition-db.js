#!/usr/bin/env node

const { pool } = require('./src/config/database');
const fs = require('fs').promises;
const path = require('path');

async function setupExhibitionDatabase() {
  let client;
  
  try {
    console.log('🔧 Setting up exhibition database...');
    
    // Read SQL schema
    const schemaPath = path.join(__dirname, 'src', 'database', 'exhibitionSchema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute schema
    console.log('📋 Creating exhibition tables...');
    await client.query(schema);
    
    console.log('✅ Exhibition database setup complete!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('venues', 'exhibitions', 'exhibition_submissions')
    `);
    
    console.log('📊 Created tables:', result.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Error setting up exhibition database:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupExhibitionDatabase()
    .then(() => {
      console.log('✨ Exhibition database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupExhibitionDatabase };