#!/usr/bin/env tsx

/**
 * Backup Scheduler for High Seas VTT
 * Manages automated backup scheduling using cron-like syntax
 */

import cron from 'node-cron';
import DatabaseBackup from './database-backup';
import { format } from 'date-fns';

interface ScheduleConfig {
  full: string;      // Daily full backups
  incremental: string; // Hourly incremental backups
  cleanup: string;   // Weekly cleanup
  healthCheck: string; // Daily health checks
}

class BackupScheduler {
  private backup: DatabaseBackup;
  private schedules: ScheduleConfig;

  constructor() {
    this.backup = new DatabaseBackup();
    
    // Default schedule configuration
    this.schedules = {
      full: process.env.BACKUP_SCHEDULE_FULL || '0 2 * * *',        // 2 AM daily
      incremental: process.env.BACKUP_SCHEDULE_INCREMENTAL || '0 * * * *', // Every hour
      cleanup: process.env.BACKUP_SCHEDULE_CLEANUP || '0 3 * * 0',  // 3 AM Sunday
      healthCheck: process.env.BACKUP_SCHEDULE_HEALTH || '0 1 * * *' // 1 AM daily
    };
  }

  start(): void {
    console.log('Starting backup scheduler...');
    console.log('Schedules:');
    console.log(`  Full backup: ${this.schedules.full}`);
    console.log(`  Incremental backup: ${this.schedules.incremental}`);
    console.log(`  Cleanup: ${this.schedules.cleanup}`);
    console.log(`  Health check: ${this.schedules.healthCheck}`);

    // Schedule full backups
    cron.schedule(this.schedules.full, async () => {
      console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Starting scheduled full backup...`);
      
      try {
        // Set backup type to full
        process.env.BACKUP_TYPE = 'full';
        await this.backup.createBackup();
        console.log('Scheduled full backup completed successfully');
      } catch (error) {
        console.error('Scheduled full backup failed:', error);
        await this.notifyBackupFailure('full', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    // Schedule incremental backups
    cron.schedule(this.schedules.incremental, async () => {
      console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Starting scheduled incremental backup...`);
      
      try {
        // Set backup type to incremental
        process.env.BACKUP_TYPE = 'incremental';
        await this.backup.createBackup();
        console.log('Scheduled incremental backup completed successfully');
      } catch (error) {
        console.error('Scheduled incremental backup failed:', error);
        await this.notifyBackupFailure('incremental', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    // Schedule cleanup
    cron.schedule(this.schedules.cleanup, async () => {
      console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Starting scheduled cleanup...`);
      
      try {
        await this.backup.cleanup();
        console.log('Scheduled cleanup completed successfully');
      } catch (error) {
        console.error('Scheduled cleanup failed:', error);
        await this.notifyBackupFailure('cleanup', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    // Schedule health checks
    cron.schedule(this.schedules.healthCheck, async () => {
      console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Starting scheduled health check...`);
      
      try {
        await this.performHealthCheck();
        console.log('Scheduled health check completed successfully');
      } catch (error) {
        console.error('Scheduled health check failed:', error);
        await this.notifyBackupFailure('health-check', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    console.log('Backup scheduler started successfully');
  }

  stop(): void {
    cron.destroy();
    console.log('Backup scheduler stopped');
  }

  private async performHealthCheck(): Promise<void> {
    // Check database connectivity
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    try {
      // Test database connection
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      console.log('Database health check passed:', result.rows[0]);

      // Check backup directory accessibility
      const fs = require('fs/promises');
      const path = require('path');
      const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
      
      await fs.access(backupDir);
      console.log('Backup directory accessible:', backupDir);

      // Check available disk space
      const { execSync } = require('child_process');
      try {
        let diskUsage;
        if (process.platform === 'win32') {
          // Windows
          diskUsage = execSync(`dir /-c "${backupDir}"`, { encoding: 'utf8' });
        } else {
          // Unix/Linux
          diskUsage = execSync(`df -h "${backupDir}"`, { encoding: 'utf8' });
        }
        console.log('Disk usage check completed');
      } catch (error) {
        console.warn('Could not check disk usage:', error.message);
      }

    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    } finally {
      await pool.end();
    }
  }

  private async notifyBackupFailure(type: string, error: any): Promise<void> {
    const notification = {
      timestamp: new Date().toISOString(),
      type: 'backup-failure',
      backupType: type,
      error: error.message,
      details: error.stack
    };

    // Log to file
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const logDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, 'backup-failures.log');
      await fs.appendFile(logFile, JSON.stringify(notification) + '\n');
    } catch (logError) {
      console.error('Failed to log backup failure:', logError);
    }

    // Send email notification if configured
    if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL) {
      await this.sendEmailNotification(notification);
    }

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackNotification(notification);
    }

    // Send Discord notification if configured
    if (process.env.DISCORD_WEBHOOK_URL) {
      await this.sendDiscordNotification(notification);
    }
  }

  private async sendEmailNotification(notification: any): Promise<void> {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `[High Seas VTT] Backup Failure - ${notification.backupType}`,
        html: `
          <h2>Backup Failure Alert</h2>
          <p><strong>Backup Type:</strong> ${notification.backupType}</p>
          <p><strong>Time:</strong> ${notification.timestamp}</p>
          <p><strong>Error:</strong> ${notification.error}</p>
          <p><strong>Details:</strong></p>
          <pre>${notification.details}</pre>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSlackNotification(notification: any): Promise<void> {
    try {
      const axios = require('axios');
      
      const payload = {
        text: `🚨 High Seas VTT Backup Failure`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 Database Backup Failure'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Backup Type:*\n${notification.backupType}`
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${notification.timestamp}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:*\n\`\`\`${notification.error}\`\`\``
            }
          }
        ]
      };

      await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
      console.log('Slack notification sent successfully');
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  private async sendDiscordNotification(notification: any): Promise<void> {
    try {
      const axios = require('axios');
      
      const payload = {
        embeds: [
          {
            title: '🚨 Database Backup Failure',
            color: 0xff0000, // Red
            fields: [
              {
                name: 'Backup Type',
                value: notification.backupType,
                inline: true
              },
              {
                name: 'Time',
                value: notification.timestamp,
                inline: true
              },
              {
                name: 'Error',
                value: `\`\`\`${notification.error}\`\`\``,
                inline: false
              }
            ],
            timestamp: notification.timestamp
          }
        ]
      };

      await axios.post(process.env.DISCORD_WEBHOOK_URL, payload);
      console.log('Discord notification sent successfully');
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  // Manual backup triggers
  async triggerFullBackup(): Promise<void> {
    console.log('Manually triggering full backup...');
    process.env.BACKUP_TYPE = 'full';
    await this.backup.createBackup();
  }

  async triggerIncrementalBackup(): Promise<void> {
    console.log('Manually triggering incremental backup...');
    process.env.BACKUP_TYPE = 'incremental';
    await this.backup.createBackup();
  }

  async triggerCleanup(): Promise<void> {
    console.log('Manually triggering cleanup...');
    await this.backup.cleanup();
  }
}

// CLI execution
async function main() {
  const scheduler = new BackupScheduler();
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'start':
        scheduler.start();
        
        // Keep process running
        process.on('SIGINT', () => {
          console.log('\nReceived SIGINT, stopping scheduler...');
          scheduler.stop();
          process.exit(0);
        });
        
        process.on('SIGTERM', () => {
          console.log('\nReceived SIGTERM, stopping scheduler...');
          scheduler.stop();
          process.exit(0);
        });
        
        // Keep the process alive
        setInterval(() => {}, 1000);
        break;
        
      case 'trigger-full':
        await scheduler.triggerFullBackup();
        break;
        
      case 'trigger-incremental':
        await scheduler.triggerIncrementalBackup();
        break;
        
      case 'trigger-cleanup':
        await scheduler.triggerCleanup();
        break;
        
      default:
        console.log('Usage: tsx backup-scheduler.ts [start|trigger-full|trigger-incremental|trigger-cleanup]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Scheduler operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default BackupScheduler;
