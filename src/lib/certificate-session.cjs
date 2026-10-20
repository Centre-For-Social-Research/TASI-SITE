const {
  createHmac,
  createHash,
  randomInt,
  timingSafeEqual,
} = require('node:crypto');

// After the email code is entered, the browser holds a short-lived signed
// cookie bound to that certificate's current link. A new link (each email)
// invalidates older sessions automatically.
const SESSION_COOKIE = 'tasi_cert_session';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;
const LINK_TTL_DAYS = 30;

function sessionSecret() {
  const explicit = process.env.CERTIFICATE_SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error('Certificate sessions are not configured.');
  // Derived, so the service key itself is never used as an HMAC key.
  return createHmac('sha256', base)
    .update('tasi-certificate-session-v1')
    .digest('hex');
}

function sign(payload) {
  return createHmac('sha256', sessionSecret())
    .update(payload)
    .digest('base64url');
}

function createSessionValue({ certificateId, tokenHash, now = Date.now() }) {
  const payload = Buffer.from(
    JSON.stringify({
      c: certificateId,
      t: tokenHash.slice(0, 16),
      e: now + SESSION_TTL_MS,
    })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readSessionValue(
  value,
  { certificateId, tokenHash, now = Date.now() }
) {
  const [payload, signature] = String(value || '').split('.');
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return (
      data.c === certificateId &&
      data.t === tokenHash.slice(0, 16) &&
      data.e > now
    );
  } catch {
    return false;
  }
}

function newEmailCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0');
}

function hashEmailCode({ certificateId, code }) {
  return createHash('sha256')
    .update(`${certificateId}:${String(code).trim()}`)
    .digest('hex');
}

function maskEmail(email) {
  const [local = '', domain = ''] = String(email || '').split('@');
  if (!domain) return '';
  const shown = local.slice(0, Math.min(2, Math.max(1, local.length - 1)));
  return `${shown}${'•'.repeat(Math.max(3, local.length - shown.length))}@${domain}`;
}

function linkExpiryFrom(now = Date.now()) {
  return new Date(now + LINK_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function isLinkExpired(expiresAt, now = Date.now()) {
  return Boolean(expiresAt) && Date.parse(expiresAt) <= now;
}

module.exports = {
  CODE_TTL_MS,
  LINK_TTL_DAYS,
  MAX_CODE_ATTEMPTS,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionValue,
  hashEmailCode,
  isLinkExpired,
  linkExpiryFrom,
  maskEmail,
  newEmailCode,
  readSessionValue,
};
