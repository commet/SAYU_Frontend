// Script to populate SAYU type relationships in database
const SAYUTypes = require('../models/sayuTypes');
const SAYURelationships = require('../models/sayuRelationships');
const { pool } = require('../config/database');

async function populateRelationships() {
  console.log('Starting SAYU relationships population...');
  
  try {
    // Initialize systems
    const typesSystem = new SAYUTypes();
    const relationshipsSystem = new SAYURelationships(typesSystem);
    
    // Get all type codes
    const typeCodes = Object.keys(typesSystem.typeFunctions);
    let insertCount = 0;
    
    // Begin transaction
    const client = await pool.connect();
    await client.query('BEGIN');
    
    try {
      // Clear existing relationships
      await client.query('DELETE FROM sayu_type_relationships');
      
      // Insert all relationships
      for (const type1 of typeCodes) {
        for (const type2 of typeCodes) {
          const relationship = relationshipsSystem.relationships[`${type1}-${type2}`];
          
          await client.query(
            `INSERT INTO sayu_type_relationships 
            (type1, type2, compatibility, growth_potential, conflict_potential, synergy_description)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              type1,
              type2,
              relationship.compatibility,
              relationship.growthPotential,
              relationship.conflictPotential,
              relationship.synergyDescription
            ]
          );
          insertCount++;
        }
      }
      
      await client.query('COMMIT');
      console.log(`Successfully inserted ${insertCount} relationships`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error populating relationships:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  populateRelationships();
}

module.exports = { populateRelationships };