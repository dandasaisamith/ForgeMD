# Troubleshooting ForgeMD

If ForgeMD is not operating correctly, check these common failure scenarios and recovery steps.

## Viewing Logs

The most important step in troubleshooting is checking the logs.
- **Application Logs (Backend):**
  `sudo journalctl -u forgemd -f`
- **Reverse Proxy Logs (Caddy):**
  `sudo journalctl -u caddy -f`

## Common Issues

### 1. The application fails to start
- **Symptom:** `sudo systemctl status forgemd` shows `Failed` or `restarting`.
- **Cause:** Missing dependencies, syntax error in the code, or permission issues.
- **Solution:** 
  1. Check logs: `sudo journalctl -u forgemd -n 50`
  2. Verify that `/srv/forgemd/data` and other storage directories are owned by `forgemd:forgemd`.
  3. Ensure `/srv/forgemd/app/.env` exists and contains valid syntax.

### 2. "pdftotext not found" or "pandoc not found"
- **Symptom:** Document conversion fails or the `healthcheck.sh` script reports failures.
- **Cause:** System dependencies are not installed.
- **Solution:** Run `sudo apt-get install poppler-utils pandoc`.

### 3. Caddy fails to start or HTTPS doesn't work
- **Symptom:** You cannot access your DuckDNS domain via HTTPS.
- **Cause:** Caddy couldn't provision a TLS certificate, usually because port 80/443 is blocked or the DuckDNS IP is not pointing to your server.
- **Solution:** 
  1. Check DuckDNS cron updates: Run `sudo /usr/local/bin/update-duckdns.sh` manually.
  2. Ensure your server is accessible on ports 80 and 443 (check cloud provider firewall rules or router port forwarding).
  3. Note: If you are behind CGNAT, traditional port forwarding won't work. See the "CGNAT Limitations" section below.

### 4. High Resource Usage (OOM Kills)
- **Symptom:** The backend process dies unexpectedly while processing a large PDF.
- **Cause:** Exhausted memory.
- **Solution:** 
  - Ensure the server has at least 1GB of RAM.
  - Setup a swapfile:
    ```bash
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    ```

## CGNAT Limitations
If your ISP uses Carrier-Grade NAT (CGNAT), you cannot expose ports 80/443 directly to the internet via DuckDNS.
**Diagnosis:** Compare your router's WAN IP to the IP shown by `curl ifconfig.me`. If they differ, or if your WAN IP is in the `100.64.0.0/10` range, you are behind CGNAT.
**Fallback:** Use a tunneling service instead of Caddy + DuckDNS, such as Cloudflare Tunnels (cloudflared) or Tailscale.
