# ForgeMD Deployment Guide

This document explains the production deployment procedure for ForgeMD on a Linux server. 

## Requirements
- A clean Linux distribution (e.g. Debian/Ubuntu).
- At least 1GB RAM, 1 CPU.
- Outbound internet access to DuckDNS, NPM, Github, and apt repositories.

## First-Boot Installation
If you are deploying on a completely fresh Linux machine, run the setup script as root.

```bash
git clone https://github.com/your-username/forgemd /srv/forgemd/app
cd /srv/forgemd/app
sudo ./scripts/setup.sh
```

**What it does:**
1. Installs Node.js, Caddy, Poppler, Pandoc.
2. Creates the `forgemd` user.
3. Sets up persistent storage directories in `/srv/forgemd/`.
4. Builds the frontend React app.
5. Installs the `forgemd` systemd service.
6. Installs a cron job for DuckDNS.
7. Opens ports 80/443 on UFW.

**Post-Installation:**
Open `/srv/forgemd/app/.env` and insert your DuckDNS domain and token. Then restart the services:
```bash
sudo systemctl restart forgemd
sudo systemctl restart caddy
```

## Update Procedure
To safely update a production deployment, use the `deploy.sh` script.

```bash
cd /srv/forgemd/app
sudo ./scripts/deploy.sh
```

**What it does:**
1. Creates a backup of the sqlite database and config.
2. Runs `git pull`.
3. Reinstalls NPM packages via `npm ci`.
4. Rebuilds the frontend.
5. Restarts the systemd service.
6. Waits 5 seconds and runs `healthcheck.sh`.

## Rollback Procedure
If the update fails, the `deploy.sh` script will alert you. Follow these steps to roll back:

1. **Check the logs** to understand the failure:
   ```bash
   sudo journalctl -u forgemd -n 100
   ```
2. **Revert the code** to the previous working commit:
   ```bash
   cd /srv/forgemd/app
   git checkout HEAD~1  # or git checkout <previous_commit_hash>
   ```
3. **Re-run deploy.sh** to build the previous code:
   ```bash
   sudo ./scripts/deploy.sh
   ```
4. **(If necessary) Restore the database** from the backup taken immediately before the upgrade. See [BACKUP.md](./BACKUP.md).

## Manual Health Check
To manually verify the application state, run:
```bash
/srv/forgemd/app/scripts/healthcheck.sh
```
This checks if `pdftotext` and `pandoc` are in the PATH and queries the local API health endpoint (`http://localhost:3000/api/health`).
