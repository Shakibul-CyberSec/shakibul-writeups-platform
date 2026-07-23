import crypto from 'crypto';

let kv = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    const { Redis } = await import('@upstash/redis');
    kv = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  } catch (err) {
    kv = null;
  }
}

// Memory stores for rate limiting
const memoryAdminLimits = new Map();
const memoryCommentLimits = new Map();

/**
 * 1. Admin Login Rate Limiter (Max 5 attempts per 15 mins per IP/subnet)
 */
export async function checkAdminRateLimit(ip) {
  const cleanIp = (ip || '127.0.0.1').split(',')[0].trim();
  const key = `ratelimit:admin:${cleanIp}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  if (kv) {
    try {
      const attempts = await kv.incr(key);
      if (attempts === 1) await kv.pexpire(key, windowMs);
      if (attempts > 5) {
        const ttl = await kv.pttl(key);
        return { allowed: false, remainingSeconds: Math.ceil(ttl / 1000) };
      }
      return { allowed: true, remaining: 5 - attempts };
    } catch (e) {}
  }

  const record = memoryAdminLimits.get(cleanIp) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }
  memoryAdminLimits.set(cleanIp, record);

  if (record.count > 5) {
    return { allowed: false, remainingSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: 5 - record.count };
}

/**
 * 2. Comment Posting Rate Limiter (Max 3 comments per 5 mins per IP)
 */
export async function checkCommentRateLimit(ip) {
  const cleanIp = (ip || '127.0.0.1').split(',')[0].trim();
  const key = `ratelimit:comment:${cleanIp}`;
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;

  if (kv) {
    try {
      const attempts = await kv.incr(key);
      if (attempts === 1) await kv.pexpire(key, windowMs);
      if (attempts > 3) {
        const ttl = await kv.pttl(key);
        return { allowed: false, remainingSeconds: Math.ceil(ttl / 1000) };
      }
      return { allowed: true, remaining: 3 - attempts };
    } catch (e) {}
  }

  const record = memoryCommentLimits.get(cleanIp) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }
  memoryCommentLimits.set(cleanIp, record);

  if (record.count > 3) {
    return { allowed: false, remainingSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: 3 - record.count };
}

/**
 * 3. Constant-Time Password Comparison (Timing Attack Protection)
 */
export function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let mismatch = a.length === b.length ? 0 : 1;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * 4. HMAC-SHA256 Session Signature Generator & Verifier
 */
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'shakibul_cybersec_hmac_secret_key_2026';

export function generateSessionToken(payloadStr) {
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payloadStr);
  const hashHex = hmac.digest('hex');
  return `${payloadStr}.${hashHex}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const lastDot = token.lastIndexOf('.');
  const payloadStr = token.substring(0, lastDot);
  const hashHex = token.substring(lastDot + 1);

  const expectedToken = generateSessionToken(payloadStr);
  const expectedHash = expectedToken.substring(expectedToken.lastIndexOf('.') + 1);
  return timingSafeCompare(hashHex, expectedHash);
}

/**
 * 5. Strict HTML Entity Encoding (Anti Stored XSS / DOM XSS / HTML Injection)
 */
export function encodeHTMLEntities(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;');
}

/**
 * 6. Sanitize Markdown (Stripping Script & Inline Event Attributes)
 */
export function sanitizeMarkdown(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[REDACTED_SCRIPT]')
    .replace(/javascript:/gi, 'no-javascript:')
    .replace(/onerror\s*=/gi, 'no-onerror=')
    .replace(/onload\s*=/gi, 'no-onload=')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[REDACTED_IFRAME]');
}

/**
 * 7. Validate ID Slug (IDOR / Path Traversal Prevention)
 */
export function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-zA-Z0-9-]+$/.test(slug) && slug.length <= 100;
}
