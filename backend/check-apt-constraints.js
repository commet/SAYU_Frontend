const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAptConstraints() {
  try {
    // Check for any constraints on apt_profile column
    const constraintsCheck = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'artists' 
        AND tc.constraint_type IN ('CHECK', 'FOREIGN KEY');
    `);
    
    console.log('Table constraints:');
    console.log(constraintsCheck.rows);
    
    // Check for triggers
    const triggersCheck = await pool.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'artists';
    `);
    
    console.log('\nTriggers:');
    console.log(triggersCheck.rows);
    
    // Check column definition
    const columnCheck = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'artists' 
        AND column_name = 'apt_profile';
    `);
    
    console.log('\nColumn definition:');
    console.log(columnCheck.rows);
    
    // Try to find where the validation error comes from
    console.log('\nTesting minimal JSON...');
    
    const minimalProfile = { test: "value" };
    
    try {
      const testResult = await pool.query(`
        UPDATE artists 
        SET apt_profile = $1
        WHERE name = 'Andreas Gursky'
        RETURNING name
      `, [JSON.stringify(minimalProfile)]);
      
      console.log('Minimal JSON succeeded:', testResult.rows);
      
      // Reset to null
      await pool.query(`
        UPDATE artists 
        SET apt_profile = NULL
        WHERE name = 'Andreas Gursky'
      `);
      
    } catch (minimalError) {
      console.log('Minimal JSON failed:', minimalError.message);
    }
    
  } catch (error) {
    console.error('Check error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAptConstraints();