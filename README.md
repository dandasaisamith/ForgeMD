# ForgeMD

ForgeMD is a resource-efficient, local-first document converter and processing pipeline. It provides a React frontend and a Node.js/SQLite backend for converting, analyzing, and storing documents (PDFs, DOCX, etc.).

## Documentation

Comprehensive documentation for deploying and managing ForgeMD in production can be found in the `docs/` directory:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - High-level system architecture and storage layout.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - First-boot installation, update, and rollback procedures.
- [SECURITY.md](docs/SECURITY.md) - Security audit findings and OS-level hardening.
- [BACKUP.md](docs/BACKUP.md) - How to backup and restore your database and configuration.
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common failure scenarios, health checks, and log analysis.

## Local Development

Ensure you have Node.js 20.x installed.

### Setup

```bash
git clone https://github.com/your-username/forgemd
cd forgemd
npm install
```

### Running

To start both the frontend and backend in development mode:

```bash
npm run dev
```
- The React application will be available at `http://localhost:5173`
- The Express API will be available at `http://localhost:3000`

### Prerequisites

For document processing to work locally, you must install:
- `poppler-utils` (for `pdftotext`)
- `pandoc`

**Ubuntu/Debian:**
```bash
sudo apt-get install poppler-utils pandoc
```
**MacOS:**
```bash
brew install poppler pandoc
```

## Production Deployment

ForgeMD is designed to be deployed cleanly, separating application code from persistent runtime data.

**Quickstart on a fresh Ubuntu/Debian server:**
```bash
git clone https://github.com/your-username/forgemd /srv/forgemd/app
cd /srv/forgemd/app
sudo ./scripts/setup.sh
```

Then edit `/srv/forgemd/app/.env` to configure your DuckDNS domain and restart the services. See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.
