const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function createWaitlistTable() {
  try {
    console.log('Creating waitlist table...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS waitlists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        referral_code VARCHAR(20) NOT NULL UNIQUE,
        referred_by UUID REFERENCES waitlists(id),
        referral_count INTEGER DEFAULT 0,
        apt_test_completed BOOLEAN DEFAULT FALSE,
        apt_score JSONB,
        position SERIAL,
        access_granted BOOLEAN DEFAULT FALSE,
        access_granted_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlists(email);
      CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlists(referral_code);
      CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlists(position);
      CREATE INDEX IF NOT EXISTS idx_waitlist_access_granted ON waitlists(access_granted);
      CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON waitlists(referred_by);
    `);

    console.log('✅ Waitlist table created successfully!');
  } catch (error) {
    console.error('Error creating waitlist table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createWaitlistTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createWaitlistTable };
