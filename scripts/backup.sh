#!/bin/bash
set -e

# ==============================================================================
# ForgeMD Backup Script
# ==============================================================================

BACKUP_DIR="/srv/forgemd/backups"
DATA_DIR="/srv/forgemd/data"
APP_DIR="/srv/forgemd/app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEST="$BACKUP_DIR/forgemd_backup_$TIMESTAMP.tar.gz"

# Number of backups to keep
KEEP=7

echo "Starting ForgeMD backup to $DEST..."

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"
chown forgemd:forgemd "$BACKUP_DIR"
chmod 770 "$BACKUP_DIR"

# Check if SQLite DB exists
if [ -f "$DATA_DIR/forgemd.sqlite" ]; then
    echo "Creating SQLite backup..."
    # Safe backup of SQLite db (online backup)
    sqlite3 "$DATA_DIR/forgemd.sqlite" ".backup '$BACKUP_DIR/forgemd_sqlite_tmp.db'"
else
    echo "No SQLite database found. Skipping DB backup."
fi

echo "Archiving files..."
# Tar the DB backup and the .env file
FILES_TO_BACKUP=""
if [ -f "$BACKUP_DIR/forgemd_sqlite_tmp.db" ]; then
    FILES_TO_BACKUP="$FILES_TO_BACKUP -C $BACKUP_DIR forgemd_sqlite_tmp.db"
fi
if [ -f "$APP_DIR/.env" ]; then
    FILES_TO_BACKUP="$FILES_TO_BACKUP -C $APP_DIR .env"
fi

if [ -n "$FILES_TO_BACKUP" ]; then
    # Use eval because of the string splitting for tar -C
    eval tar -czvf "$DEST" $FILES_TO_BACKUP
    
    # Clean up tmp db
    rm -f "$BACKUP_DIR/forgemd_sqlite_tmp.db"
    
    # Fix permissions
    chown forgemd:forgemd "$DEST"
    chmod 640 "$DEST"
    
    echo "Backup completed successfully."
else
    echo "No files to backup."
fi

# Rotate old backups
echo "Cleaning up old backups (keeping last $KEEP)..."
ls -tp "$BACKUP_DIR"/forgemd_backup_*.tar.gz | grep -v '/$' | tail -n +$((KEEP+1)) | xargs -I {} rm -- {}

echo "Backup process finished."
