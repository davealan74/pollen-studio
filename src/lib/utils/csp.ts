// Mirrors the production CSP header set on the Apache vhost (spec §8). Kept here
// so dev-mode <meta http-equiv> injection stays in lockstep with the deployed header.
export const CSP =
  "default-src 'self'; " +
  "connect-src 'self' https://*.pollinations.ai; " +
  "img-src 'self' data: blob: https://*.pollinations.ai; " +
  "media-src 'self' blob: https://*.pollinations.ai; " +
  "style-src 'self' 'unsafe-inline'; " +
  "script-src 'self'; " +
  "frame-ancestors 'none'";
