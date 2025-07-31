# High Seas VTT Database Backup Strategy

This document outlines the comprehensive database backup strategy implemented for the High Seas VTT project.

## Overview

The backup strategy is designed to ensure data integrity, minimize data loss, and provide quick recovery capabilities for the PostgreSQL database used by the High Seas VTT application.

## Backup Components

### 1. Backup Types

#### Full Backups
- **Frequency**: Daily at 2:00 AM
- **Retention**: 7 daily, 4 weekly, 12 monthly
- **Description**: Complete database dump including schema and data
- **Use Case**: Complete disaster recovery, major rollbacks

#### Incremental Backups
- **Frequency**: Hourly
- **Retention**: 24 hourly, 7 daily
- **Description**: Only changed data since last backup
- **Use Case**: Quick recovery from recent data loss

#### Schema-Only Backups
- **Frequency**: Weekly (Mondays at 3:00 AM)
- **Retention**: 8 weeks
- **Description**: Database structure without data
- **Use Case**: Development environment setup, structure comparison

#### Data-Only Backups
- **Frequency**: On-demand
- **Description**: Data without schema
- **Use Case**: Data migration, testing

### 2. Storage Locations

#### Local Storage
- **Primary Location**: `./backups/` directory
- **Organization**: Subdirectories by backup type (`full/`, `incremental/`, `schema/`, `data/`)
- **Compression**: Enabled by default (gzip/zip)
- **Encryption**: Optional (AES-256-CBC)

#### Cloud Storage (Optional)
- **AWS S3**: Configurable with lifecycle policies
- **Azure Blob Storage**: Cool tier for cost optimization
- **Google Cloud Storage**: Nearline storage class

### 3. Monitoring and Alerting

#### Health Checks
- **Database Connectivity**: Daily verification
- **Backup Integrity**: Checksum validation
- **Storage Space**: Disk usage monitoring
- **Backup Age**: Alert if backups are too old

#### Notification Channels
- **Email**: SMTP-based notifications
- **Slack**: Webhook integration
- **Discord**: Webhook integration
- **Custom Webhooks**: For integration with other systems

## Implementation

### Files Structure

```
apps/backend/scripts/backup/
├── database-backup.ts      # Core backup functionality
├── backup-scheduler.ts     # Automated scheduling
├── backup.ps1             # PowerShell script for Windows
├── backup-config.json     # Configuration file
└── README.md              # This documentation
```

### Dependencies

```json
{
  "node-cron": "^3.0.3",
  "date-fns": "^3.6.0",
  "axios": "^1.7.9",
  "nodemailer": "^6.9.17",
  "pg": "^8.13.1"
}
```

### Environment Variables

Key environment variables for backup configuration:

```bash
# Core Settings
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
BACKUP_DIR="./backups"
BACKUP_TYPE="full"
BACKUP_COMPRESSION="true"
BACKUP_ENCRYPTION="false"

# Retention Policies
BACKUP_RETENTION_DAILY="7"
BACKUP_RETENTION_WEEKLY="4"
BACKUP_RETENTION_MONTHLY="12"

# Schedules (cron format)
BACKUP_SCHEDULE_FULL="0 2 * * *"
BACKUP_SCHEDULE_INCREMENTAL="0 * * * *"
BACKUP_SCHEDULE_CLEANUP="0 3 * * 0"
```

## Usage

### Manual Operations

#### Create a Full Backup
```bash
npm run backup:create
# or
npm run backup:full
```

#### Create an Incremental Backup
```bash
BACKUP_TYPE=incremental npm run backup:create
# or
npm run backup:incremental
```

#### Restore from Backup
```bash
npm run backup:restore -- /path/to/backup.sql
```

#### Cleanup Old Backups
```bash
npm run backup:cleanup
```

#### Health Check
```bash
npm run backup:health
```

### Automated Operations

#### Start Backup Scheduler
```bash
npm run backup:schedule
```

#### Setup Windows Scheduled Tasks
```bash
npm run backup:setup-schedule
```

### PowerShell Commands (Windows)

#### Create Backup
```powershell
.\scripts\backup\backup.ps1 -Action create -BackupType full
```

#### Restore Database
```powershell
.\scripts\backup\backup.ps1 -Action restore -BackupPath "C:\path\to\backup.sql"
```

#### Setup Scheduled Tasks
```powershell
.\scripts\backup\backup.ps1 -Action schedule
```

## Security Considerations

### Access Control
- Use dedicated backup user with minimal permissions
- Restrict access to backup directories
- Secure storage of encryption keys

### Encryption
- Optional AES-256-CBC encryption for sensitive data
- Separate encryption keys from backup files
- Key rotation policies for production environments

### Network Security
- Use SSL/TLS for database connections
- Secure transfer protocols for cloud storage
- VPN or private networks for backup transfers

## Recovery Procedures

### Complete System Recovery
1. Set up new database instance
2. Restore latest full backup
3. Apply any incremental backups if needed
4. Verify data integrity
5. Update application configuration

### Point-in-Time Recovery
1. Identify the desired recovery point
2. Restore full backup from before that time
3. Apply incremental backups up to the recovery point
4. Verify data consistency

### Partial Data Recovery
1. Create a temporary database
2. Restore backup to temporary database
3. Extract needed data using SQL queries
4. Import data to production database

## Monitoring and Maintenance

### Daily Tasks
- Verify backup completion
- Check storage space
- Review backup logs
- Validate notification systems

### Weekly Tasks
- Test backup restoration
- Clean up old backup files
- Review retention policies
- Update documentation

### Monthly Tasks
- Full disaster recovery test
- Review and update configurations
- Analyze backup performance metrics
- Update security credentials

## Troubleshooting

### Common Issues

#### Backup Fails with Permission Denied
```bash
# Check PostgreSQL user permissions
psql -c "\\du" $DATABASE_URL

# Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
```

#### Insufficient Disk Space
```bash
# Check disk usage
df -h

# Clean up old backups manually
npm run backup:cleanup

# Reduce retention periods
export BACKUP_RETENTION_DAILY=3
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check network connectivity
telnet hostname 5432
```

### Log Files

- **Backup Logs**: `./backups/logs/backup.log`
- **Failure Logs**: `./logs/backup-failures.log`
- **Application Logs**: `./combined.log`

### Performance Optimization

#### Large Databases
- Use parallel dump options: `--jobs=4`
- Compress backups to save space
- Use incremental backups more frequently
- Consider WAL-E for continuous archiving

#### Network Transfers
- Use compression for cloud uploads
- Implement retry mechanisms
- Monitor transfer speeds
- Use regional storage locations

## Configuration Examples

### Development Environment
```json
{
  "backup": {
    "types": {
      "full": {
        "schedule": "0 6 * * *",
        "retention": { "daily": 3 }
      },
      "incremental": {
        "enabled": false
      }
    },
    "destinations": {
      "local": { "enabled": true },
      "s3": { "enabled": false }
    }
  }
}
```

### Production Environment
```json
{
  "backup": {
    "types": {
      "full": {
        "schedule": "0 2 * * *",
        "compression": true,
        "encryption": true,
        "retention": { "daily": 7, "weekly": 4, "monthly": 12 }
      },
      "incremental": {
        "schedule": "0 * * * *",
        "retention": { "hourly": 24, "daily": 7 }
      }
    },
    "destinations": {
      "local": { "enabled": true },
      "s3": { "enabled": true, "encryption": true }
    },
    "monitoring": {
      "alerts": { "enabled": true },
      "healthChecks": { "enabled": true }
    }
  }
}
```

## Compliance and Best Practices

### Data Protection
- Follow GDPR requirements for data backup
- Implement data retention policies
- Secure deletion of expired backups
- Audit trail for backup operations

### Business Continuity
- Regular disaster recovery testing
- Documented recovery procedures
- Cross-trained personnel
- Alternative backup strategies

### Performance
- Monitor backup windows
- Optimize backup compression
- Use incremental backups effectively
- Plan for database growth

## Future Enhancements

### Planned Features
- Point-in-time recovery (PITR)
- Cross-region backup replication
- Automated backup testing
- Backup encryption key rotation
- Integration with monitoring systems

### Monitoring Integration
- Prometheus metrics export
- Grafana dashboard
- AlertManager integration
- Custom health check endpoints

This backup strategy ensures robust data protection for the High Seas VTT application while providing flexible recovery options and comprehensive monitoring capabilities.
