# ForgeMD Security Audit and Findings

## Security Posture
ForgeMD employs a defense-in-depth approach tailored for a local-first / self-hosted document processing tool. 

## OS and System Level Security
- **Service Isolation**: The application runs under a dedicated, unprivileged `forgemd` user account.
- **Systemd Hardening**: The `forgemd.service` is locked down using:
  - `NoNewPrivileges=yes` (Prevents the process and its children from gaining new privileges).
  - `PrivateTmp=yes` (Isolates `/tmp` for the process).
  - `ProtectSystem=full` (Mounts `/usr`, `/boot`, and `/etc` as read-only).
  - `ProtectHome=yes` (Makes `/home`, `/root`, and `/run/user` inaccessible).
  - Explicit `ReadWritePaths` strictly limits write access to `/srv/forgemd/uploads`, `outputs`, `tmp`, and `data`.
- **Firewall**: UFW is configured to allow only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
- **Reverse Proxy**: Caddy handles TLS termination automatically, providing modern, secure HTTPS out of the box with `Strict-Transport-Security` and other security headers enabled.

## Application Level Security (Express + React)
- **Dependency Scanning**: Deterministic dependency resolution (`npm ci`) is used.
- **Path Traversal Protection**: Upload endpoints and storage access in Express must sanitize user inputs to prevent escaping the storage boundaries.
- **File Upload Attacks**: 
  - File types should be strictly validated (e.g., checking MIME types and extensions for PDFs/DOCX).
  - The API processes files asynchronously and saves them securely in `incoming/`, moving them to `outputs/`.
- **XSS / CSRF**: The React frontend mitigates standard XSS vulnerabilities through JSX escaping.
- **CORS**: `cors` middleware is implemented.

## Remaining Risks and Mitigations
1. **Unauthenticated Access**: ForgeMD currently assumes a single-tenant or trusted environment ("local-first"). If exposed directly to the public internet via DuckDNS, **anyone can access your API**. 
   - *Mitigation*: Ensure you only run this behind a trusted VPN, Tailscale, or implement API Key/JWT authentication in the Express routes before exposing it publicly.
2. **Denial of Service (DoS)**: A malicious user could upload thousands of massive PDFs, filling up `/srv/forgemd/uploads` or exhausting RAM during extraction.
   - *Mitigation*: Future updates should implement `express-rate-limit` and `multer` file size limits (e.g., `limits: { fileSize: 50 * 1024 * 1024 }`).
3. **Command Injection**: `pdftotext` and `pandoc` are executed via `child_process.exec` or `spawn`.
   - *Mitigation*: Ensure the backend uses `spawn` with an array of arguments rather than `exec` with a concatenated shell string, preventing command injection via malicious filenames.
