#!/bin/bash
set -e

# ==============================================================================
# ForgeMD First-Boot Setup Script
# Run as root or with sudo.
# ==============================================================================

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (e.g. sudo ./setup.sh)"
  exit 1
fi

echo "Starting ForgeMD Setup..."

# 1. Update and install prerequisites
echo "[1/10] Installing system dependencies..."
apt-get update
apt-get install -y curl tar git build-essential poppler-utils pandoc sqlite3 ufw cron

# Install Node.js (20.x)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install Caddy
if ! command -v caddy &> /dev/null; then
    echo "Installing Caddy server..."
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update
    apt-get install -y caddy
fi

# 2. Setup user and directories
echo "[2/10] Configuring service user and directories..."
if ! id "forgemd" &>/dev/null; then
    useradd -r -s /bin/false -d /srv/forgemd forgemd
fi

mkdir -p /srv/forgemd/{app,data,uploads,outputs,logs,tmp,backups}

# If the repo wasn't cloned into /srv/forgemd/app, copy it there.
# Assuming this script is run from the repo root or scripts dir.
REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
if [ "$REPO_DIR" != "/srv/forgemd/app" ]; then
    echo "Copying application to /srv/forgemd/app..."
    rsync -a --exclude='.git' --exclude='node_modules' --exclude='dist' "$REPO_DIR/" /srv/forgemd/app/
fi

# Set permissions
chown -R forgemd:forgemd /srv/forgemd
chmod 750 /srv/forgemd
chmod 770 /srv/forgemd/{data,uploads,outputs,tmp}

# 3. Environment configuration
echo "[3/10] Setting up environment configuration..."
if [ ! -f "/srv/forgemd/app/.env" ]; then
    cp /srv/forgemd/app/.env.example /srv/forgemd/app/.env
    echo "Please configure /srv/forgemd/app/.env after setup completes."
fi
chown forgemd:forgemd /srv/forgemd/app/.env
chmod 600 /srv/forgemd/app/.env

# 4. Build application
echo "[4/10] Building application..."
cd /srv/forgemd/app
sudo -u forgemd bash -c "npm install"
sudo -u forgemd bash -c "npm run build"

# 5. Service Installation
echo "[5/10] Installing systemd service..."
cp /srv/forgemd/app/deploy/systemd/forgemd.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable forgemd

# 6. Caddy Configuration
echo "[6/10] Configuring Caddy (Reverse Proxy)..."
cp /srv/forgemd/app/deploy/caddy/Caddyfile /etc/caddy/Caddyfile
systemctl enable caddy

# 7. DuckDNS setup (Cron)
echo "[7/10] Configuring DuckDNS Updater..."
cp /srv/forgemd/app/scripts/update-duckdns.sh /usr/local/bin/update-duckdns.sh
chmod +x /usr/local/bin/update-duckdns.sh
# Add to crontab if not present
if ! crontab -l 2>/dev/null | grep -q "update-duckdns.sh"; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/update-duckdns.sh >/dev/null 2>&1") | crontab -
fi

# 8. Firewall
echo "[8/10] Configuring firewall (UFW)..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp # ensure SSH stays open
# Only enable if not already active
if ufw status | grep -q "Status: inactive"; then
    echo "y" | ufw enable
fi

# 9. Start Services
echo "[9/10] Starting services..."
systemctl restart forgemd
systemctl restart caddy

# 10. Healthcheck
echo "[10/10] Running healthcheck..."
sleep 5
if curl -s http://localhost:3000/api/health | grep -q "status"; then
    echo "Setup Complete! ForgeMD is running."
else
    echo "WARNING: Healthcheck failed. Please check the logs:"
    echo "journalctl -u forgemd -n 50"
fi

echo "======================================================="
echo "Action Required: Edit /srv/forgemd/app/.env to set your"
echo "DuckDNS domain and token, then restart services."
echo "======================================================="
