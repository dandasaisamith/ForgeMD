# ForgeMD Backup and Restore

## Backup Strategy
ForgeMD backups are automated during the `deploy.sh` script, but can also be run manually.

Backups are stored in: `/srv/forgemd/backups/`
The backup script (`scripts/backup.sh`) backs up:
1. The SQLite database (`forgemd.sqlite`), safely using `.backup` to avoid corruption.
2. The environment configuration (`.env`).

### Note on Uploads and Outputs
By default, the backup script **does not** back up `/srv/forgemd/uploads/` or `/srv/forgemd/outputs/` because these directories can grow extremely large. If you need to back up media files, you must use an external tool (like `rsync` to an S3 bucket or a remote NAS).

### Retention Policy
The `backup.sh` script automatically rotates backups, keeping only the last 7 archives to prevent unlimited disk growth.

## Manual Backup
```bash
sudo /srv/forgemd/app/scripts/backup.sh
```

## Restore Procedure
If your database becomes corrupted or you are moving to a new server, follow these exact steps to restore.

**1. Stop the application**
```bash
sudo systemctl stop forgemd
```

**2. Locate the backup archive**
```bash
ls -l /srv/forgemd/backups/
```
Identify the correct `.tar.gz` file (e.g., `forgemd_backup_20260821_120000.tar.gz`).

**3. Extract the backup**
Extract the archive into a temporary folder:
```bash
mkdir -p /tmp/forgemd_restore
tar -xzvf /srv/forgemd/backups/forgemd_backup_20260821_120000.tar.gz -C /tmp/forgemd_restore
```

**4. Restore the Database**
Copy the recovered SQLite database back to the data directory:
```bash
sudo cp /tmp/forgemd_restore/srv/forgemd/backups/forgemd_sqlite_tmp.db /srv/forgemd/data/forgemd.sqlite
sudo chown forgemd:forgemd /srv/forgemd/data/forgemd.sqlite
sudo chmod 660 /srv/forgemd/data/forgemd.sqlite
```

**5. Restore the Configuration (If needed)**
```bash
sudo cp /tmp/forgemd_restore/srv/forgemd/app/.env /srv/forgemd/app/.env
sudo chown forgemd:forgemd /srv/forgemd/app/.env
sudo chmod 600 /srv/forgemd/app/.env
```

**6. Start the application**
```bash
sudo systemctl start forgemd
```

**7. Verify**
Run the health check to ensure everything is working:
```bash
/srv/forgemd/app/scripts/healthcheck.sh
```
