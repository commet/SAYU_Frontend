require('dotenv').config();
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupEmailSystem() {
  try {
    console.log('🚀 Setting up SAYU Email System...\n');
    
    // 1. Run email system migration
    console.log('📧 Creating email system tables...');
    const migrationPath = path.join(__dirname, '../migrations/add-email-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    console.log('✅ Email system tables created successfully\n');
    
    // 2. Verify email templates exist
    console.log('📝 Checking email templates...');
    const templatesDir = path.join(__dirname, '../src/templates/emails');
    const requiredTemplates = [
      'welcome.html',
      'weekly-insights.html',
      'achievement.html',
      'nudge.html',
      'profile-reminder.html'
    ];
    
    let templatesOk = true;
    for (const template of requiredTemplates) {
      const templatePath = path.join(templatesDir, template);
      if (fs.existsSync(templatePath)) {
        console.log(`  ✅ ${template}`);
      } else {
        console.log(`  ❌ ${template} - MISSING`);
        templatesOk = false;
      }
    }
    
    if (!templatesOk) {
      console.log('\n⚠️  Some email templates are missing. Please ensure all templates are in place.');
    } else {
      console.log('✅ All email templates found\n');
    }
    
    // 3. Test email service configuration
    console.log('🔧 Testing email service configuration...');
    try {
      const emailService = require('../src/services/emailService');
      console.log('✅ Email service loaded successfully');
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Development mode: Using Ethereal for email testing');
      } else {
        console.log('📧 Production mode: Using configured email service');
      }
    } catch (error) {
      console.log('❌ Email service configuration error:', error.message);
    }
    
    // 4. Check environment variables
    console.log('\n🔍 Checking environment configuration...');
    const requiredEnvVars = {
      'FRONTEND_URL': process.env.FRONTEND_URL,
      'EMAIL_FROM': process.env.EMAIL_FROM
    };
    
    const optionalEnvVars = {
      'EMAIL_SERVICE': process.env.EMAIL_SERVICE,
      'EMAIL_USER': process.env.EMAIL_USER,
      'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
      'ENABLE_EMAIL_AUTOMATION': process.env.ENABLE_EMAIL_AUTOMATION
    };
    
    console.log('Required variables:');
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (value) {
        console.log(`  ✅ ${key}: ${value}`);
      } else {
        console.log(`  ❌ ${key}: NOT SET`);
      }
    }
    
    console.log('\nOptional variables:');
    for (const [key, value] of Object.entries(optionalEnvVars)) {
      if (value) {
        console.log(`  ✅ ${key}: ${value}`);
      } else {
        console.log(`  ⚪ ${key}: Not set (using defaults)`);
      }
    }
    
    // 5. Database verification
    console.log('\n🗄️  Verifying database setup...');
    
    const tableChecks = [
      'email_logs',
      'email_preferences', 
      'user_artwork_interactions',
      'agent_conversations',
      'email_verification_tokens',
      'password_reset_tokens'
    ];
    
    for (const table of tableChecks) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table]);
        
        if (result.rows[0].exists) {
          console.log(`  ✅ Table '${table}' exists`);
        } else {
          console.log(`  ❌ Table '${table}' missing`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking table '${table}': ${error.message}`);
      }
    }
    
    // 6. Create test email preferences for existing users
    console.log('\n👥 Setting up email preferences for existing users...');
    try {
      const result = await pool.query(`
        INSERT INTO email_preferences (user_id)
        SELECT id FROM users 
        WHERE id NOT IN (SELECT user_id FROM email_preferences)
        ON CONFLICT (user_id) DO NOTHING
        RETURNING user_id
      `);
      
      console.log(`✅ Email preferences created for ${result.rows.length} existing users`);
    } catch (error) {
      console.log(`❌ Error setting up email preferences: ${error.message}`);
    }
    
    // 7. Email automation status
    console.log('\n🤖 Email automation status...');
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL_AUTOMATION === 'true') {
      console.log('✅ Email automation will be ENABLED');
      console.log('📅 Scheduled jobs:');
      console.log('   - Weekly insights: Sundays at 9 AM UTC');
      console.log('   - Re-engagement: Daily at 10 AM UTC');
      console.log('   - Profile reminders: Daily at 2 PM UTC');
      console.log('   - Curator\'s pick: Monthly on 1st at 8 AM UTC');
    } else {
      console.log('⚪ Email automation is DISABLED');
      console.log('   Set ENABLE_EMAIL_AUTOMATION=true to enable in development');
    }
    
    // 8. API endpoints summary
    console.log('\n🌐 Available API endpoints:');
    console.log('   GET  /api/email/preferences - Get user email preferences');
    console.log('   PUT  /api/email/preferences - Update email preferences');
    console.log('   POST /api/email/unsubscribe - Unsubscribe from emails');
    console.log('   POST /api/email/verify - Verify email address');
    console.log('   GET  /api/email/analytics - Email analytics (admin only)');
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('   POST /api/email/test - Send test email (dev only)');
    }
    
    // 9. Next steps
    console.log('\n🎯 Next Steps:');
    console.log('1. Configure your email service credentials (SendGrid, Mailgun, etc.)');
    console.log('2. Set up proper domain authentication (SPF, DKIM, DMARC)');
    console.log('3. Test email delivery with the /api/email/test endpoint');
    console.log('4. Enable email automation in production');
    console.log('5. Monitor email analytics and optimize campaigns');
    
    console.log('\n🎉 SAYU Email System setup completed!\n');
    
  } catch (error) {
    console.error('❌ Email system setup failed:', error);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
  } finally {
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEmailSystem();
}

module.exports = setupEmailSystem;