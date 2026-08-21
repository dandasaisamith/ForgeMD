# ForgeMD Architecture

## High-Level Architecture

ForgeMD is a modular monolith application designed to be lightweight, resource-efficient, and easily deployable.

```
Public Git Repository
        │
        │ git pull
        ▼
/srv/forgemd/app (Application Code)
        │
        │
   ForgeMD Systemd Service (Node.js Backend)
        │ 
        ├── /srv/forgemd/uploads (Incoming documents)
        ├── /srv/forgemd/outputs (Generated files)
        ├── /srv/forgemd/data    (SQLite database)
        ├── /srv/forgemd/logs    (System logs)
        ├── /srv/forgemd/tmp     (Temporary processing cache)
        └── /srv/forgemd/backups (Automated DB Backups)
        │
        ▼
   Caddy Server (Reverse Proxy)
        │ HTTPS (Port 443)
        ▼
<subdomain>.duckdns.org
```

## Storage Architecture
ForgeMD strictly separates application source code from runtime data.
- **Source Code**: `/srv/forgemd/app`. This is a clean checkout of the Git repository. It contains no secrets, user data, or database files.
- **Runtime Data**: Configured via environment variables (`STORAGE_UPLOADS`, `STORAGE_DATA`, etc.) to point to directories outside the git repository (e.g., `/srv/forgemd/*`). This makes backups easy and git pulls safe.

## Backend Stack
- **Node.js + Express**: The core API server, communicating on port 3000 by default.
- **SQLite (better-sqlite3)**: Relational database stored at `/srv/forgemd/data/forgemd.sqlite`. Chosen for minimal memory footprint and zero external dependencies.
- **External Binaries**:
  - `pdftotext` (poppler-utils) - Extracting text from PDFs.
  - `pandoc` - Document format conversions.

## Frontend Stack
- **React + Vite**: Compiles down to static files. In production, the Node.js API serves these static files from `/srv/forgemd/app/apps/web/dist`, eliminating the need for a separate frontend web server container.

## Networking and Security
- **Reverse Proxy**: Caddy handles incoming traffic on ports 80 and 443. It requests and automatically renews HTTPS certificates via Let's Encrypt / ZeroSSL for the configured DuckDNS domain.
- **Systemd Hardening**: The `forgemd` service runs as a non-root user (`forgemd`). Systemd protections (`NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`) lock down what the application can touch, restricting read/write access to explicitly allowed paths (`/srv/forgemd/*`).
