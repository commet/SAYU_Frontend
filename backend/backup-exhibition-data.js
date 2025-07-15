#!/usr/bin/env node

const DatabaseBackup = require('./src/utils/databaseBackup');
require('dotenv').config();

async function main() {
  const command = process.argv[2];
  const backup = new DatabaseBackup();
  
  try {
    switch (command) {
      case 'backup':
        console.log('📦 Starting exhibition data backup...');
        const result = await backup.backupExhibitionData();
        console.log('✅ Backup completed:', result.filename);
        break;
        
      case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
          console.error('❌ Please provide backup file path');
          process.exit(1);
        }
        console.log('🔄 Starting exhibition data restore...');
        await backup.restoreExhibitionData(backupPath);
        console.log('✅ Restore completed');
        break;
        
      case 'list':
        console.log('📋 Available backups:');
        const backups = await backup.listBackups();
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          backups.forEach(b => {
            console.log(`  ${b.filename} (${b.timestamp})`);
          });
        }
        break;
        
      case 'cleanup':
        const keepDays = parseInt(process.argv[3]) || 30;
        console.log(`🧹 Cleaning up backups older than ${keepDays} days...`);
        const cleaned = await backup.cleanupOldBackups(keepDays);
        console.log(`✅ Deleted ${cleaned.deletedCount} old backups`);
        break;
        
      case 'schedule':
        console.log('⏰ Starting backup scheduler...');
        await backup.scheduleBackup();
        console.log('✅ Backup scheduler started');
        // Keep the process alive
        setInterval(() => {}, 1000);
        break;
        
      default:
        console.log('Usage: node backup-exhibition-data.js [backup|restore|list|cleanup|schedule]');
        console.log('  backup                    - Create a new backup');
        console.log('  restore <backup-file>     - Restore from backup file');
        console.log('  list                      - List available backups');
        console.log('  cleanup [days]            - Clean up old backups (default: 30 days)');
        console.log('  schedule                  - Start backup scheduler');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseBackup };