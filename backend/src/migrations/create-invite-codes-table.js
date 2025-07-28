const { sequelize } = require('../config/database');

async function createInviteCodesTable() {
  try {
    console.log('Creating invite codes table...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        created_by UUID REFERENCES waitlists(id),
        used_by UUID REFERENCES waitlists(id),
        type VARCHAR(50) DEFAULT 'standard',
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP
      );
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_invite_code ON invite_codes(code);
      CREATE INDEX IF NOT EXISTS idx_invite_created_by ON invite_codes(created_by);
      CREATE INDEX IF NOT EXISTS idx_invite_type ON invite_codes(type);
      CREATE INDEX IF NOT EXISTS idx_invite_expires ON invite_codes(expires_at);
    `);

    // Add access level column to waitlists if not exists
    await sequelize.query(`
      ALTER TABLE waitlists 
      ADD COLUMN IF NOT EXISTS access_level VARCHAR(20);
    `).catch(() => {
      console.log('access_level column already exists');
    });

    console.log('✅ Invite codes table created successfully!');
  } catch (error) {
    console.error('Error creating invite codes table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createInviteCodesTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createInviteCodesTable };
