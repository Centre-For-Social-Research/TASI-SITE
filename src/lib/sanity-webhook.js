import crypto from 'node:crypto';

/**
 * Verify a Sanity webhook signature.
 *
 * Sanity signs each webhook with the `sanity-webhook-signature` header in the
 * form `t=<timestamp>,v1=<signature>`, where `<signature>` is the base64url
 * HMAC-SHA256 of `${timestamp}.${rawBody}` keyed with the webhook secret.
 *
 * @param {object} args
 * @param {string} args.payload   Raw request body (exact bytes, unparsed).
 * @param {string} args.signature Value of the `sanity-webhook-signature` header.
 * @param {string} args.secret    Shared secret configured on the Sanity webhook.
 * @returns {boolean}
 */
export function verifySanityWebhookSignature({ payload, signature, secret }) {
  if (!payload || !signature || !secret) {
    return false;
  }

  const parts = Object.fromEntries(
    signature.split(',').map((segment) => {
      const idx = segment.indexOf('=');
      return [segment.slice(0, idx).trim(), segment.slice(idx + 1).trim()];
    })
  );

  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('base64url');

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}
