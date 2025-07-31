#!/usr/bin/env tsx

/**
 * Backup Verification Script for High Seas VTT
 * Validates backup integrity and tests restoration capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

interface BackupVerificationResult {
  valid: boolean;
  checksum: string;
  size: number;
  canRestore: boolean;
  errors: string[];
  warnings: string[];
}

class BackupVerifier {
  private testDbUrl: string;
  private backupDir: string;

  constructor() {
    this.backupDir =
      process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

    // Create a test database URL for verification
    const originalUrl = process.env.DATABASE_URL || '';
    this.testDbUrl = originalUrl.replace(/\/[^/]+$/, '/test_verification_db');
  }

  async verifyBackup(backupPath: string): Promise<BackupVerificationResult> {
    const result: BackupVerificationResult = {
      valid: false,
      checksum: '',
      size: 0,
      canRestore: false,
      errors: [],
      warnings: [],
    };

    try {
      console.log(`Verifying backup: ${backupPath}`);

      // Check if file exists
      try {
        await fs.access(backupPath);
      } catch {
        result.errors.push('Backup file does not exist');
        return result;
      }

      // Get file size
      const stats = await fs.stat(backupPath);
      result.size = stats.size;

      if (result.size === 0) {
        result.errors.push('Backup file is empty');
        return result;
      }

      // Calculate checksum
      result.checksum = await this.calculateChecksum(backupPath);

      // Verify file format
      const formatValid = await this.verifyFileFormat(backupPath);
      if (!formatValid) {
        result.errors.push('Invalid backup file format');
        return result;
      }

      // Test restoration capability
      const canRestore = await this.testRestoration(backupPath);
      result.canRestore = canRestore;

      if (!canRestore) {
        result.errors.push('Backup cannot be restored successfully');
        return result;
      }

      result.valid = true;
      console.log('Backup verification completed successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Verification error: ${errorMessage}`);
    }

    return result;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const fileBuffer = await fs.readFile(filePath);
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

  private async verifyFileFormat(backupPath: string): Promise<boolean> {
    try {
      let command: string;

      if (backupPath.endsWith('.sql')) {
        // Check if it's a valid SQL file
        const content = await fs.readFile(backupPath, 'utf-8');
        const lines = content.split('\n').slice(0, 10); // Check first 10 lines

        // Look for common SQL backup patterns
        const hasValidPatterns = lines.some(
          line =>
            line.includes('PostgreSQL database dump') ||
            line.includes('CREATE TABLE') ||
            line.includes('INSERT INTO') ||
            line.includes('COPY') ||
            line.includes('--')
        );

        return hasValidPatterns;
      } else if (backupPath.endsWith('.gz')) {
        // Test gzip file integrity
        command = `gzip -t "${backupPath}"`;
        await execAsync(command);
        return true;
      } else if (backupPath.endsWith('.zip')) {
        // Test zip file integrity
        command = `7z t "${backupPath}"`;
        try {
          await execAsync(command);
          return true;
        } catch {
          // Fallback to basic zip test
          command = `unzip -t "${backupPath}"`;
          await execAsync(command);
          return true;
        }
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Format verification failed: ${errorMessage}`);
      return false;
    }
  }

  private async testRestoration(backupPath: string): Promise<boolean> {
    try {
      console.log('Testing backup restoration...');

      // Create test database
      await this.createTestDatabase();

      let restorePath = backupPath;

      // Handle compressed files
      if (backupPath.endsWith('.gz')) {
        restorePath = await this.decompressFile(backupPath, '.gz');
      } else if (backupPath.endsWith('.zip')) {
        restorePath = await this.decompressFile(backupPath, '.zip');
      }

      // Attempt restoration
      const command = `psql "${this.testDbUrl}" -f "${restorePath}" -q`;
      await execAsync(command);

      // Verify basic database structure
      const verifyCommand = `psql "${this.testDbUrl}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t`;
      const { stdout } = await execAsync(verifyCommand);

      const tableCount = parseInt(stdout.trim());

      // Clean up
      if (restorePath !== backupPath) {
        await fs.unlink(restorePath);
      }

      await this.dropTestDatabase();

      // Should have at least some tables
      return tableCount > 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Restoration test failed: ${errorMessage}`);

      // Clean up on failure
      try {
        await this.dropTestDatabase();
      } catch {
        // Ignore cleanup errors
      }

      return false;
    }
  }

  private async createTestDatabase(): Promise<void> {
    try {
      // Extract database name from test URL
      const dbName = this.testDbUrl.split('/').pop();
      const baseUrl = this.testDbUrl.replace(`/${dbName}`, '/postgres');

      const command = `psql "${baseUrl}" -c "DROP DATABASE IF EXISTS ${dbName}; CREATE DATABASE ${dbName};" -q`;
      await execAsync(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create test database: ${errorMessage}`);
    }
  }

  private async dropTestDatabase(): Promise<void> {
    try {
      const dbName = this.testDbUrl.split('/').pop();
      const baseUrl = this.testDbUrl.replace(`/${dbName}`, '/postgres');

      const command = `psql "${baseUrl}" -c "DROP DATABASE IF EXISTS ${dbName};" -q`;
      await execAsync(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Failed to drop test database: ${errorMessage}`);
    }
  }

  private async decompressFile(
    filePath: string,
    extension: string
  ): Promise<string> {
    const tempPath = filePath.replace(extension, '');

    try {
      if (extension === '.gz') {
        await execAsync(`gunzip -c "${filePath}" > "${tempPath}"`);
      } else if (extension === '.zip') {
        await execAsync(
          `unzip -o "${filePath}" -d "${path.dirname(tempPath)}"`
        );
        // Find the extracted SQL file
        const extractedFiles = await fs.readdir(path.dirname(tempPath));
        const sqlFile = extractedFiles.find(file => file.endsWith('.sql'));
        if (sqlFile) {
          return path.join(path.dirname(tempPath), sqlFile);
        }
      }

      return tempPath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to decompress file: ${errorMessage}`);
    }
  }

  async verifyAllBackups(): Promise<{
    [key: string]: BackupVerificationResult;
  }> {
    const results: { [key: string]: BackupVerificationResult } = {};

    const backupTypes = ['full', 'incremental', 'schema', 'data'];

    for (const type of backupTypes) {
      const typeDir = path.join(this.backupDir, type);

      try {
        const files = await fs.readdir(typeDir);
        const backupFiles = files.filter(
          file =>
            file.endsWith('.sql') ||
            file.endsWith('.gz') ||
            file.endsWith('.zip')
        );

        for (const file of backupFiles.slice(-3)) {
          // Verify last 3 backups
          const filePath = path.join(typeDir, file);
          const key = `${type}/${file}`;
          results[key] = await this.verifyBackup(filePath);
        }
      } catch {
        console.warn(`Cannot access backup directory: ${typeDir}`);
      }
    }

    return results;
  }

  async generateVerificationReport(): Promise<string> {
    const results = await this.verifyAllBackups();

    let report = '# Backup Verification Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    let totalBackups = 0;
    let validBackups = 0;
    let restorableBackups = 0;

    for (const [backupPath, result] of Object.entries(results)) {
      totalBackups++;
      if (result.valid) validBackups++;
      if (result.canRestore) restorableBackups++;

      report += `## ${backupPath}\n\n`;
      report += `- **Valid**: ${result.valid ? '✅' : '❌'}\n`;
      report += `- **Can Restore**: ${result.canRestore ? '✅' : '❌'}\n`;
      report += `- **Size**: ${(result.size / 1024 / 1024).toFixed(2)} MB\n`;
      report += `- **Checksum**: ${result.checksum.substring(0, 16)}...\n`;

      if (result.errors.length > 0) {
        report += `- **Errors**:\n`;
        result.errors.forEach(error => {
          report += `  - ${error}\n`;
        });
      }

      if (result.warnings.length > 0) {
        report += `- **Warnings**:\n`;
        result.warnings.forEach(warning => {
          report += `  - ${warning}\n`;
        });
      }

      report += '\n';
    }

    report += `## Summary\n\n`;
    report += `- **Total Backups**: ${totalBackups}\n`;
    report += `- **Valid Backups**: ${validBackups}\n`;
    report += `- **Restorable Backups**: ${restorableBackups}\n`;
    report += `- **Success Rate**: ${totalBackups > 0 ? ((validBackups / totalBackups) * 100).toFixed(2) : 0}%\n`;

    return report;
  }
}

// CLI execution
async function main() {
  const verifier = new BackupVerifier();
  const command = process.argv[2];
  const backupPath = process.argv[3];

  try {
    switch (command) {
      case 'verify': {
        if (!backupPath) {
          console.error('Backup path required for verify command');
          process.exit(1);
        }
        const result = await verifier.verifyBackup(backupPath);
        console.log('Verification Result:', JSON.stringify(result, null, 2));
        process.exit(result.valid ? 0 : 1);
        // Note: process.exit() prevents fallthrough, but ESLint requires explicit break
        break; // This line will never be reached but satisfies ESLint
      }

      case 'verify-all': {
        const allResults = await verifier.verifyAllBackups();
        console.log(
          'All Verification Results:',
          JSON.stringify(allResults, null, 2)
        );
        break;
      }

      case 'report': {
        const report = await verifier.generateVerificationReport();
        console.log(report);

        // Save report to file
        const reportPath = path.join(
          process.cwd(),
          'backup-verification-report.md'
        );
        await fs.writeFile(reportPath, report);
        console.log(`Report saved to: ${reportPath}`);
        break;
      }

      default:
        console.log(
          'Usage: tsx backup-verifier.ts [verify|verify-all|report] [backup-path]'
        );
        console.log('');
        console.log('Commands:');
        console.log('  verify <path>    Verify a specific backup file');
        console.log('  verify-all       Verify all recent backups');
        console.log('  report           Generate verification report');
        process.exit(1);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Verification failed:', errorMessage);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default BackupVerifier;
