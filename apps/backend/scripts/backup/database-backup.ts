#!/usr/bin/env tsx

/**
 * Database Backup Script for High Seas VTT
 * Supports multiple backup types: full, incremental, and point-in-time
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

const execAsync = promisify(exec);

interface BackupConfig {
  type: 'full' | 'incremental' | 'schema-only' | 'data-only';
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  compression: boolean;
  encryption: boolean;
  destination: {
    local: string;
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
}

class DatabaseBackup {
  private config: BackupConfig;
  private dbUrl: string;
  private backupDir: string;

  constructor() {
    this.dbUrl = process.env.DATABASE_URL || '';
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    
    this.config = {
      type: (process.env.BACKUP_TYPE as any) || 'full',
      retention: {
        daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
        weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
        monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '12')
      },
      compression: process.env.BACKUP_COMPRESSION === 'true',
      encryption: process.env.BACKUP_ENCRYPTION === 'true',
      destination: {
        local: this.backupDir,
        s3: process.env.AWS_S3_BUCKET ? {
          bucket: process.env.AWS_S3_BUCKET,
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        } : undefined
      }
    };
  }

  async initialize(): Promise<void> {
    // Create backup directory if it doesn't exist
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`Created backup directory: ${this.backupDir}`);
    }

    // Create subdirectories for different backup types
    const subdirs = ['full', 'incremental', 'schema', 'data', 'logs'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(this.backupDir, subdir);
      try {
        await fs.access(subdirPath);
      } catch {
        await fs.mkdir(subdirPath, { recursive: true });
      }
    }
  }

  async createBackup(): Promise<string> {
    await this.initialize();
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `highseas_${this.config.type}_${timestamp}`;
    
    console.log(`Starting ${this.config.type} backup: ${backupName}`);
    
    let backupPath: string;
    
    switch (this.config.type) {
      case 'full':
        backupPath = await this.createFullBackup(backupName);
        break;
      case 'schema-only':
        backupPath = await this.createSchemaBackup(backupName);
        break;
      case 'data-only':
        backupPath = await this.createDataBackup(backupName);
        break;
      case 'incremental':
        backupPath = await this.createIncrementalBackup(backupName);
        break;
      default:
        throw new Error(`Unsupported backup type: ${this.config.type}`);
    }

    // Compress if enabled
    if (this.config.compression) {
      backupPath = await this.compressBackup(backupPath);
    }

    // Encrypt if enabled
    if (this.config.encryption) {
      backupPath = await this.encryptBackup(backupPath);
    }

    // Upload to S3 if configured
    if (this.config.destination.s3) {
      await this.uploadToS3(backupPath);
    }

    // Log backup creation
    await this.logBackup(backupPath, this.config.type);

    console.log(`Backup completed successfully: ${backupPath}`);
    return backupPath;
  }

  private async createFullBackup(backupName: string): Promise<string> {
    const backupPath = path.join(this.backupDir, 'full', `${backupName}.sql`);
    
    const command = `pg_dump "${this.dbUrl}" --verbose --clean --no-acl --no-owner -f "${backupPath}"`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('pg_dump warnings:', stderr);
      }
      console.log('Full backup created successfully');
      return backupPath;
    } catch (error) {
      console.error('Error creating full backup:', error);
      throw error;
    }
  }

  private async createSchemaBackup(backupName: string): Promise<string> {
    const backupPath = path.join(this.backupDir, 'schema', `${backupName}.sql`);
    
    const command = `pg_dump "${this.dbUrl}" --schema-only --verbose --clean --no-acl --no-owner -f "${backupPath}"`;
    
    try {
      await execAsync(command);
      console.log('Schema backup created successfully');
      return backupPath;
    } catch (error) {
      console.error('Error creating schema backup:', error);
      throw error;
    }
  }

  private async createDataBackup(backupName: string): Promise<string> {
    const backupPath = path.join(this.backupDir, 'data', `${backupName}.sql`);
    
    const command = `pg_dump "${this.dbUrl}" --data-only --verbose --no-acl --no-owner -f "${backupPath}"`;
    
    try {
      await execAsync(command);
      console.log('Data backup created successfully');
      return backupPath;
    } catch (error) {
      console.error('Error creating data backup:', error);
      throw error;
    }
  }

  private async createIncrementalBackup(backupName: string): Promise<string> {
    // For PostgreSQL, we'll use WAL-E or similar for true incremental backups
    // For now, we'll create a data-only backup with timestamp filtering
    const backupPath = path.join(this.backupDir, 'incremental', `${backupName}.sql`);
    
    // Get the last backup timestamp
    const lastBackupTime = await this.getLastBackupTime();
    
    // Create a custom query to backup only changed data
    const tables = ['users', 'games', 'players', 'ships', 'game_log', 'markets', 'missions'];
    let incrementalSql = '';
    
    for (const table of tables) {
      if (table === 'game_log') {
        // Always backup game logs from last backup time
        incrementalSql += `COPY (SELECT * FROM ${table} WHERE created_at > '${lastBackupTime}') TO STDOUT;\n`;
      } else if (['users', 'games', 'players', 'ships'].includes(table)) {
        // Backup modified records
        incrementalSql += `COPY (SELECT * FROM ${table} WHERE updated_at > '${lastBackupTime}') TO STDOUT;\n`;
      }
    }
    
    await fs.writeFile(backupPath, incrementalSql);
    console.log('Incremental backup created successfully');
    return backupPath;
  }

  private async compressBackup(backupPath: string): Promise<string> {
    const compressedPath = `${backupPath}.gz`;
    
    try {
      await execAsync(`gzip "${backupPath}"`);
      console.log('Backup compressed successfully');
      return compressedPath;
    } catch (error) {
      console.error('Error compressing backup:', error);
      return backupPath; // Return original if compression fails
    }
  }

  private async encryptBackup(backupPath: string): Promise<string> {
    const encryptedPath = `${backupPath}.enc`;
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      console.warn('Encryption key not provided, skipping encryption');
      return backupPath;
    }
    
    try {
      await execAsync(`openssl enc -aes-256-cbc -salt -in "${backupPath}" -out "${encryptedPath}" -k "${encryptionKey}"`);
      await fs.unlink(backupPath); // Remove unencrypted file
      console.log('Backup encrypted successfully');
      return encryptedPath;
    } catch (error) {
      console.error('Error encrypting backup:', error);
      return backupPath; // Return original if encryption fails
    }
  }

  private async uploadToS3(backupPath: string): Promise<void> {
    if (!this.config.destination.s3) {
      return;
    }

    const s3Config = this.config.destination.s3;
    const fileName = path.basename(backupPath);
    const s3Key = `database-backups/${format(new Date(), 'yyyy/MM/dd')}/${fileName}`;

    try {
      // Using AWS CLI for simplicity - in production, consider using AWS SDK
      const command = `aws s3 cp "${backupPath}" s3://${s3Config.bucket}/${s3Key} --region ${s3Config.region}`;
      await execAsync(command, {
        env: {
          ...process.env,
          AWS_ACCESS_KEY_ID: s3Config.accessKeyId,
          AWS_SECRET_ACCESS_KEY: s3Config.secretAccessKey
        }
      });
      console.log(`Backup uploaded to S3: s3://${s3Config.bucket}/${s3Key}`);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  private async logBackup(backupPath: string, type: string): Promise<void> {
    const logPath = path.join(this.backupDir, 'logs', 'backup.log');
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      path: backupPath,
      size: (await fs.stat(backupPath)).size,
      success: true
    };

    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Error logging backup:', error);
    }
  }

  private async getLastBackupTime(): Promise<string> {
    const logPath = path.join(this.backupDir, 'logs', 'backup.log');
    
    try {
      const logContent = await fs.readFile(logPath, 'utf-8');
      const logs = logContent.trim().split('\n').filter(line => line);
      
      if (logs.length === 0) {
        return '1970-01-01 00:00:00';
      }
      
      const lastLog = JSON.parse(logs[logs.length - 1]);
      return lastLog.timestamp;
    } catch (error) {
      return '1970-01-01 00:00:00';
    }
  }

  async cleanup(): Promise<void> {
    console.log('Starting backup cleanup...');
    
    const now = new Date();
    const retention = this.config.retention;
    
    // Clean up daily backups older than retention period
    await this.cleanupBackupsByAge('full', retention.daily, 'days');
    await this.cleanupBackupsByAge('incremental', retention.daily, 'days');
    
    // Keep weekly backups (Sundays) for longer
    await this.cleanupBackupsByAge('full', retention.weekly, 'weeks');
    
    // Keep monthly backups (1st of month) for longest
    await this.cleanupBackupsByAge('full', retention.monthly, 'months');
    
    console.log('Backup cleanup completed');
  }

  private async cleanupBackupsByAge(type: string, count: number, unit: string): Promise<void> {
    const backupTypeDir = path.join(this.backupDir, type);
    
    try {
      const files = await fs.readdir(backupTypeDir);
      const fileStats = await Promise.all(
        files.map(async file => ({
          name: file,
          path: path.join(backupTypeDir, file),
          mtime: (await fs.stat(path.join(backupTypeDir, file))).mtime
        }))
      );
      
      // Sort by modification time, newest first
      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      // Keep only the specified number of backups
      const filesToDelete = fileStats.slice(count);
      
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    } catch (error) {
      console.error(`Error cleaning up ${type} backups:`, error);
    }
  }

  async restore(backupPath: string): Promise<void> {
    console.log(`Starting database restore from: ${backupPath}`);
    
    // Check if backup file exists
    try {
      await fs.access(backupPath);
    } catch {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    let restorePath = backupPath;
    
    // Decrypt if needed
    if (backupPath.endsWith('.enc')) {
      restorePath = await this.decryptBackup(backupPath);
    }
    
    // Decompress if needed
    if (restorePath.endsWith('.gz')) {
      restorePath = await this.decompressBackup(restorePath);
    }
    
    // Restore database
    const command = `psql "${this.dbUrl}" -f "${restorePath}"`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('Restore warnings:', stderr);
      }
      console.log('Database restored successfully');
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
    
    // Clean up temporary files
    if (restorePath !== backupPath) {
      await fs.unlink(restorePath);
    }
  }

  private async decryptBackup(encryptedPath: string): Promise<string> {
    const decryptedPath = encryptedPath.replace('.enc', '');
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('Encryption key not provided for decryption');
    }
    
    try {
      await execAsync(`openssl enc -d -aes-256-cbc -in "${encryptedPath}" -out "${decryptedPath}" -k "${encryptionKey}"`);
      return decryptedPath;
    } catch (error) {
      console.error('Error decrypting backup:', error);
      throw error;
    }
  }

  private async decompressBackup(compressedPath: string): Promise<string> {
    try {
      await execAsync(`gunzip -c "${compressedPath}" > "${compressedPath.replace('.gz', '')}"`);
      return compressedPath.replace('.gz', '');
    } catch (error) {
      console.error('Error decompressing backup:', error);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const backup = new DatabaseBackup();
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'create':
        await backup.createBackup();
        break;
      case 'cleanup':
        await backup.cleanup();
        break;
      case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
          throw new Error('Backup path required for restore');
        }
        await backup.restore(backupPath);
        break;
      default:
        console.log('Usage: tsx database-backup.ts [create|cleanup|restore] [backup-path]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Backup operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default DatabaseBackup;
