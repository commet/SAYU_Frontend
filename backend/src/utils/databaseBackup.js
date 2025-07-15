const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { log } = require('../config/logger');

class DatabaseBackup {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this.backupDir = path.join(__dirname, '../../backups');
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async backupExhibitionData() {
    try {
      await this.ensureBackupDirectory();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `exhibition-backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);
      
      log.info('Starting exhibition data backup...');
      
      // Backup exhibitions
      const { data: exhibitions, error: exhibitionsError } = await this.supabase
        .from('exhibitions')
        .select('*');
      
      if (exhibitionsError) {
        throw new Error(`Failed to backup exhibitions: ${exhibitionsError.message}`);
      }
      
      // Backup venues
      const { data: venues, error: venuesError } = await this.supabase
        .from('venues')
        .select('*');
      
      if (venuesError) {
        throw new Error(`Failed to backup venues: ${venuesError.message}`);
      }
      
      // Backup exhibition submissions
      const { data: submissions, error: submissionsError } = await this.supabase
        .from('exhibition_submissions')
        .select('*');
      
      if (submissionsError) {
        throw new Error(`Failed to backup submissions: ${submissionsError.message}`);
      }
      
      // Backup exhibition likes
      const { data: likes, error: likesError } = await this.supabase
        .from('exhibition_likes')
        .select('*');
      
      if (likesError) {
        throw new Error(`Failed to backup likes: ${likesError.message}`);
      }
      
      // Backup exhibition views
      const { data: views, error: viewsError } = await this.supabase
        .from('exhibition_views')
        .select('*');
      
      if (viewsError) {
        throw new Error(`Failed to backup views: ${viewsError.message}`);
      }
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: {
          exhibitions: {
            count: exhibitions.length,
            data: exhibitions
          },
          venues: {
            count: venues.length,
            data: venues
          },
          exhibition_submissions: {
            count: submissions.length,
            data: submissions
          },
          exhibition_likes: {
            count: likes.length,
            data: likes
          },
          exhibition_views: {
            count: views.length,
            data: views
          }
        }
      };
      
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
      
      log.info('Exhibition data backup completed', {
        filename,
        exhibitionsCount: exhibitions.length,
        venuesCount: venues.length,
        submissionsCount: submissions.length,
        likesCount: likes.length,
        viewsCount: views.length
      });
      
      return { success: true, filename, filepath };
      
    } catch (error) {
      log.error('Database backup failed', { error: error.message });
      throw error;
    }
  }

  async restoreExhibitionData(backupPath) {
    try {
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
      
      log.info('Starting exhibition data restore...');
      
      // Restore venues first (foreign key dependency)
      if (backupData.tables.venues.data.length > 0) {
        const { error: venuesError } = await this.supabase
          .from('venues')
          .upsert(backupData.tables.venues.data);
        
        if (venuesError) {
          throw new Error(`Failed to restore venues: ${venuesError.message}`);
        }
      }
      
      // Restore exhibitions
      if (backupData.tables.exhibitions.data.length > 0) {
        const { error: exhibitionsError } = await this.supabase
          .from('exhibitions')
          .upsert(backupData.tables.exhibitions.data);
        
        if (exhibitionsError) {
          throw new Error(`Failed to restore exhibitions: ${exhibitionsError.message}`);
        }
      }
      
      // Restore submissions
      if (backupData.tables.exhibition_submissions.data.length > 0) {
        const { error: submissionsError } = await this.supabase
          .from('exhibition_submissions')
          .upsert(backupData.tables.exhibition_submissions.data);
        
        if (submissionsError) {
          throw new Error(`Failed to restore submissions: ${submissionsError.message}`);
        }
      }
      
      // Restore likes
      if (backupData.tables.exhibition_likes.data.length > 0) {
        const { error: likesError } = await this.supabase
          .from('exhibition_likes')
          .upsert(backupData.tables.exhibition_likes.data);
        
        if (likesError) {
          throw new Error(`Failed to restore likes: ${likesError.message}`);
        }
      }
      
      // Restore views
      if (backupData.tables.exhibition_views.data.length > 0) {
        const { error: viewsError } = await this.supabase
          .from('exhibition_views')
          .upsert(backupData.tables.exhibition_views.data);
        
        if (viewsError) {
          throw new Error(`Failed to restore views: ${viewsError.message}`);
        }
      }
      
      log.info('Exhibition data restore completed');
      return { success: true };
      
    } catch (error) {
      log.error('Database restore failed', { error: error.message });
      throw error;
    }
  }

  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      const files = await fs.readdir(this.backupDir);
      
      const backups = files
        .filter(file => file.startsWith('exhibition-backup-') && file.endsWith('.json'))
        .map(file => {
          const filepath = path.join(this.backupDir, file);
          return {
            filename: file,
            filepath,
            timestamp: file.replace('exhibition-backup-', '').replace('.json', '')
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      
      return backups;
    } catch (error) {
      log.error('Failed to list backups', { error: error.message });
      throw error;
    }
  }

  async cleanupOldBackups(keepDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      
      const toDelete = backups.filter(backup => {
        const backupDate = new Date(backup.timestamp.replace(/-/g, ':'));
        return backupDate < cutoffDate;
      });
      
      for (const backup of toDelete) {
        await fs.unlink(backup.filepath);
        log.info('Deleted old backup', { filename: backup.filename });
      }
      
      return { deletedCount: toDelete.length };
    } catch (error) {
      log.error('Failed to cleanup old backups', { error: error.message });
      throw error;
    }
  }

  async scheduleBackup() {
    // Schedule daily backup at 2 AM
    const scheduleNextBackup = () => {
      const now = new Date();
      const nextBackup = new Date();
      nextBackup.setDate(now.getDate() + 1);
      nextBackup.setHours(2, 0, 0, 0);
      
      const timeUntilNext = nextBackup.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          await this.backupExhibitionData();
          await this.cleanupOldBackups(30); // Keep 30 days
          scheduleNextBackup(); // Schedule next backup
        } catch (error) {
          log.error('Scheduled backup failed', { error: error.message });
          scheduleNextBackup(); // Continue scheduling even if backup fails
        }
      }, timeUntilNext);
      
      log.info('Next backup scheduled', { nextBackup: nextBackup.toISOString() });
    };
    
    scheduleNextBackup();
  }
}

module.exports = DatabaseBackup;