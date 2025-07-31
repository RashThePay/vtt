# High Seas VTT Database Backup Script for Windows
# PowerShell script for managing PostgreSQL backups

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("create", "restore", "cleanup", "schedule", "health-check")]
    [string]$Action,
    
    [string]$BackupPath,
    [string]$BackupType = "full",
    [string]$ConfigFile = "backup-config.json"
)

# Configuration
$ErrorActionPreference = "Stop"
$BackupDir = $env:BACKUP_DIR ?? (Join-Path $PSScriptRoot "..\..\backups")
$DatabaseUrl = $env:DATABASE_URL
$LogFile = Join-Path $BackupDir "logs\backup.log"

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

# Ensure subdirectories exist
$SubDirs = @("full", "incremental", "schema", "data", "logs")
foreach ($subdir in $SubDirs) {
    $subdirPath = Join-Path $BackupDir $subdir
    if (-not (Test-Path $subdirPath)) {
        New-Item -ItemType Directory -Path $subdirPath -Force | Out-Null
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Host $logEntry
    
    if (Test-Path (Split-Path $LogFile)) {
        Add-Content -Path $LogFile -Value $logEntry
    }
}

function Get-DatabaseConnection {
    if (-not $DatabaseUrl) {
        throw "DATABASE_URL environment variable is not set"
    }
    
    # Parse PostgreSQL connection string
    if ($DatabaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        return @{
            Username = $Matches[1]
            Password = $Matches[2]
            Host = $Matches[3]
            Port = $Matches[4]
            Database = $Matches[5]
        }
    } else {
        throw "Invalid DATABASE_URL format"
    }
}

function Test-PostgreSQLTools {
    $tools = @("pg_dump", "psql", "pg_restore")
    
    foreach ($tool in $tools) {
        try {
            & $tool --version 2>$null | Out-Null
        } catch {
            throw "PostgreSQL tool '$tool' not found. Please ensure PostgreSQL client tools are installed and in PATH."
        }
    }
    
    Write-Log "PostgreSQL tools verified successfully"
}

function New-DatabaseBackup {
    param([string]$Type = "full")
    
    Test-PostgreSQLTools
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupName = "highseas_${Type}_${timestamp}"
    
    Write-Log "Starting $Type backup: $backupName"
    
    switch ($Type) {
        "full" {
            $backupPath = Join-Path $BackupDir "full\$backupName.sql"
            $pgDumpArgs = @(
                $DatabaseUrl,
                "--verbose",
                "--clean",
                "--no-acl",
                "--no-owner",
                "-f", $backupPath
            )
        }
        "schema-only" {
            $backupPath = Join-Path $BackupDir "schema\$backupName.sql"
            $pgDumpArgs = @(
                $DatabaseUrl,
                "--schema-only",
                "--verbose",
                "--clean",
                "--no-acl",
                "--no-owner",
                "-f", $backupPath
            )
        }
        "data-only" {
            $backupPath = Join-Path $BackupDir "data\$backupName.sql"
            $pgDumpArgs = @(
                $DatabaseUrl,
                "--data-only",
                "--verbose",
                "--no-acl",
                "--no-owner",
                "-f", $backupPath
            )
        }
        default {
            throw "Unsupported backup type: $Type"
        }
    }
    
    try {
        & pg_dump @pgDumpArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "pg_dump failed with exit code $LASTEXITCODE"
        }
        
        $fileSize = (Get-Item $backupPath).Length
        Write-Log "$Type backup created successfully: $backupPath (Size: $([math]::Round($fileSize/1MB, 2)) MB)"
        
        # Compress backup if enabled
        if ($env:BACKUP_COMPRESSION -eq "true") {
            $compressedPath = Compress-Backup $backupPath
            $backupPath = $compressedPath
        }
        
        # Log backup creation
        $logEntry = @{
            timestamp = (Get-Date).ToString("o")
            type = $Type
            path = $backupPath
            size = $fileSize
            success = $true
        } | ConvertTo-Json -Compress
        
        $backupLogPath = Join-Path $BackupDir "logs\backup.log"
        Add-Content -Path $backupLogPath -Value $logEntry
        
        return $backupPath
    } catch {
        Write-Log "Error creating $Type backup: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Compress-Backup {
    param([string]$BackupPath)
    
    Write-Log "Compressing backup: $BackupPath"
    
    try {
        $compressedPath = "$BackupPath.zip"
        Compress-Archive -Path $BackupPath -DestinationPath $compressedPath -Force
        Remove-Item $BackupPath -Force
        
        Write-Log "Backup compressed successfully: $compressedPath"
        return $compressedPath
    } catch {
        Write-Log "Error compressing backup: $($_.Exception.Message)" "ERROR"
        return $BackupPath
    }
}

function Restore-DatabaseBackup {
    param([string]$BackupPath)
    
    if (-not (Test-Path $BackupPath)) {
        throw "Backup file not found: $BackupPath"
    }
    
    Write-Log "Starting database restore from: $BackupPath"
    
    $restorePath = $BackupPath
    
    # Decompress if needed
    if ($BackupPath.EndsWith(".zip")) {
        $extractDir = Join-Path $env:TEMP "backup_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
        
        Expand-Archive -Path $BackupPath -DestinationPath $extractDir -Force
        $restorePath = Get-ChildItem -Path $extractDir -Filter "*.sql" | Select-Object -First 1 -ExpandProperty FullName
        
        if (-not $restorePath) {
            throw "No SQL file found in backup archive"
        }
    }
    
    try {
        Test-PostgreSQLTools
        
        $psqlArgs = @(
            $DatabaseUrl,
            "-f", $restorePath
        )
        
        & psql @psqlArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "psql failed with exit code $LASTEXITCODE"
        }
        
        Write-Log "Database restored successfully from: $BackupPath"
    } catch {
        Write-Log "Error restoring database: $($_.Exception.Message)" "ERROR"
        throw
    } finally {
        # Clean up temporary files
        if ($restorePath -ne $BackupPath -and (Test-Path (Split-Path $restorePath))) {
            Remove-Item (Split-Path $restorePath) -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Remove-OldBackups {
    Write-Log "Starting backup cleanup..."
    
    $retentionDays = [int]($env:BACKUP_RETENTION_DAILY ?? "7")
    $cutoffDate = (Get-Date).AddDays(-$retentionDays)
    
    $backupTypes = @("full", "incremental", "schema", "data")
    
    foreach ($type in $backupTypes) {
        $typeDir = Join-Path $BackupDir $type
        
        if (Test-Path $typeDir) {
            $oldFiles = Get-ChildItem -Path $typeDir -File | Where-Object { $_.LastWriteTime -lt $cutoffDate }
            
            foreach ($file in $oldFiles) {
                try {
                    Remove-Item $file.FullName -Force
                    Write-Log "Deleted old backup: $($file.Name)"
                } catch {
                    Write-Log "Failed to delete $($file.Name): $($_.Exception.Message)" "ERROR"
                }
            }
        }
    }
    
    Write-Log "Backup cleanup completed"
}

function Test-DatabaseHealth {
    Write-Log "Starting database health check..."
    
    try {
        Test-PostgreSQLTools
        
        # Test database connection
        $testQuery = "SELECT NOW() as current_time, version() as db_version;"
        $psqlArgs = @(
            $DatabaseUrl,
            "-c", $testQuery,
            "-t"
        )
        
        $result = & psql @psqlArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "Database connection test failed"
        }
        
        Write-Log "Database connection test passed"
        
        # Check backup directory accessibility
        if (-not (Test-Path $BackupDir)) {
            throw "Backup directory not accessible: $BackupDir"
        }
        
        Write-Log "Backup directory accessible: $BackupDir"
        
        # Check available disk space
        $drive = Split-Path $BackupDir -Qualifier
        $freeSpace = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$drive'" | Select-Object -ExpandProperty FreeSpace
        $freeSpaceGB = [math]::Round($freeSpace / 1GB, 2)
        
        Write-Log "Available disk space: $freeSpaceGB GB"
        
        if ($freeSpaceGB -lt 1) {
            Write-Log "WARNING: Low disk space available for backups" "WARN"
        }
        
        Write-Log "Database health check completed successfully"
    } catch {
        Write-Log "Database health check failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function New-BackupSchedule {
    Write-Log "Setting up backup schedule..."
    
    # Create scheduled task for full backups (daily at 2 AM)
    $fullBackupAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$PSScriptRoot\backup.ps1`" -Action create -BackupType full"
    $fullBackupTrigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    $fullBackupSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2)
    
    try {
        Register-ScheduledTask -TaskName "HighSeasVTT-FullBackup" -Action $fullBackupAction -Trigger $fullBackupTrigger -Settings $fullBackupSettings -Force
        Write-Log "Full backup scheduled task created (daily at 2 AM)"
    } catch {
        Write-Log "Failed to create full backup scheduled task: $($_.Exception.Message)" "ERROR"
    }
    
    # Create scheduled task for cleanup (weekly on Sunday at 3 AM)
    $cleanupAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$PSScriptRoot\backup.ps1`" -Action cleanup"
    $cleanupTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
    $cleanupSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1)
    
    try {
        Register-ScheduledTask -TaskName "HighSeasVTT-BackupCleanup" -Action $cleanupAction -Trigger $cleanupTrigger -Settings $cleanupSettings -Force
        Write-Log "Backup cleanup scheduled task created (weekly on Sunday at 3 AM)"
    } catch {
        Write-Log "Failed to create backup cleanup scheduled task: $($_.Exception.Message)" "ERROR"
    }
    
    # Create scheduled task for health checks (daily at 1 AM)
    $healthAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$PSScriptRoot\backup.ps1`" -Action health-check"
    $healthTrigger = New-ScheduledTaskTrigger -Daily -At "01:00"
    $healthSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1)
    
    try {
        Register-ScheduledTask -TaskName "HighSeasVTT-HealthCheck" -Action $healthAction -Trigger $healthTrigger -Settings $healthSettings -Force
        Write-Log "Health check scheduled task created (daily at 1 AM)"
    } catch {
        Write-Log "Failed to create health check scheduled task: $($_.Exception.Message)" "ERROR"
    }
    
    Write-Log "Backup schedule setup completed"
    Write-Log "To view scheduled tasks, run: Get-ScheduledTask -TaskName 'HighSeasVTT-*'"
    Write-Log "To remove scheduled tasks, run: Unregister-ScheduledTask -TaskName 'HighSeasVTT-*' -Confirm:`$false"
}

# Main execution
try {
    switch ($Action) {
        "create" {
            $backupPath = New-DatabaseBackup -Type $BackupType
            Write-Host "Backup created successfully: $backupPath"
        }
        "restore" {
            if (-not $BackupPath) {
                throw "BackupPath parameter is required for restore action"
            }
            Restore-DatabaseBackup -BackupPath $BackupPath
            Write-Host "Database restored successfully from: $BackupPath"
        }
        "cleanup" {
            Remove-OldBackups
            Write-Host "Backup cleanup completed"
        }
        "health-check" {
            Test-DatabaseHealth
            Write-Host "Database health check completed"
        }
        "schedule" {
            New-BackupSchedule
            Write-Host "Backup schedule configured"
        }
    }
} catch {
    Write-Log "Operation failed: $($_.Exception.Message)" "ERROR"
    Write-Error $_.Exception.Message
    exit 1
}
