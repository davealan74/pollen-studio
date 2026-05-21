# Deploying Pollen Studio

## Prerequisites (one-time)
1. SSH key authorised on `root@newhetzner3`.
2. Apache vhost in place at `/etc/httpd/conf.d/pollenstudio.cru2.net.conf` (+ `-le-ssl.conf` for HTTPS).
3. LE cert issued via DNS-01 (`certbot --dns-cloudflare --dns-cloudflare-credentials /root/.secrets/cloudflare.ini -d pollenstudio.cru2.net`). Cron renews automatically.
4. `pk_…` registered at `enter.pollinations.ai` with redirect URIs:
   - `https://pollenstudio.cru2.net/auth/callback`
   - `http://localhost:5173/auth/callback`

   `earningsEnabled: true`. Copy the client ID into `.env`:
   ```
   VITE_POLLINATIONS_CLIENT_ID=pk_xxx
   ```

## Apache vhost — required directives

`pollenstudio.cru2.net-le-ssl.conf` must include the SPA fallback rewrite and the CSP header:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /200.html [L]
</IfModule>

Header always set Content-Security-Policy "default-src 'self'; connect-src 'self' https://*.pollinations.ai; img-src 'self' data: blob: https://*.pollinations.ai; media-src 'self' blob: https://*.pollinations.ai; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'"
Header always set Referrer-Policy "no-referrer"
Header always set Permissions-Policy "interest-cohort=()"
```

## Deploy
```bash
./scripts/deploy.sh
```
This runs lint, tests, build, then rsyncs `build/` to the vhost root.

## Rollback
The previous build's files are overwritten by `rsync --delete`. Keep a backup of the previous `build/` (or commit-tag deploys) before promoting risky releases.
