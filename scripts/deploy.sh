#!/bin/bash
set -e

# ==============================================================================
# ForgeMD Safe Deployment Script
# ==============================================================================

if [ "$EUID" -eq 0 ]; then
  echo "Please do not run this script as root directly if possible."
  echo "It uses sudo for service restarts."
fi

APP_DIR="/srv/forgemd/app"
BACKUP_SCRIPT="$APP_DIR/scripts/backup.sh"
HEALTH_SCRIPT="$APP_DIR/scripts/healthcheck.sh"

echo "Starting ForgeMD Deployment..."

# 1. Verify environment
if [ ! -d "$APP_DIR" ]; then
    echo "Error: $APP_DIR does not exist. Ensure setup.sh has been run."
    exit 1
fi

# 2. Backup before deployment
if [ -x "$BACKUP_SCRIPT" ]; then
    echo "Running pre-deployment backup..."
    sudo $BACKUP_SCRIPT
else
    echo "Warning: backup.sh not found or not executable. Skipping backup."
fi

# 3. Pull latest code
echo "Pulling latest application code..."
cd $APP_DIR
# Assuming git is already configured and origin is set
git pull origin main || echo "Git pull failed, or not a git repository. Proceeding with existing files."

# 4. Install deterministic dependencies
echo "Installing Node.js dependencies..."
npm ci || npm install # ci prefers package-lock.json

# 5. Build application
echo "Building React frontend..."
npm run build

# 6. Verify Permissions
echo "Verifying permissions..."
sudo chown -R forgemd:forgemd /srv/forgemd/app
sudo chmod -R 750 /srv/forgemd/app

# 7. Restart Service
echo "Restarting ForgeMD service..."
sudo systemctl restart forgemd

# 8. Wait for readiness and Health check
echo "Waiting for service to become ready..."
sleep 5

if [ -x "$HEALTH_SCRIPT" ]; then
    if $HEALTH_SCRIPT; then
        echo "========================================="
        echo "Deployment Successful!"
        echo "========================================="
    else
        echo "========================================="
        echo "ERROR: Deployment health check failed."
        echo "Rollback guidance:"
        echo "1. Check logs: sudo journalctl -u forgemd -n 50"
        echo "2. Revert git commit: cd /srv/forgemd/app && git checkout HEAD~1"
        echo "3. Rerun deploy: ./scripts/deploy.sh"
        echo "4. Restore DB if corrupted: See docs/BACKUP.md"
        echo "========================================="
        exit 1
    fi
else
    echo "Deployment completed (Health check script missing)."
fi
