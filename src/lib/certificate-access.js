import { cookies } from 'next/headers';
import { getCertificateByToken, hashClaimToken } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';
import certificateSession from '@/lib/certificate-session.cjs';

const { isValidClaimToken } = certificateUtils;
const {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionValue,
  isLinkExpired,
  readSessionValue,
} = certificateSession;

// Resolves a download link to its certificate. state is one of 'ok',
// 'not_found', 'expired' or 'revoked'; only 'ok' carries the certificate.
export async function resolveCertificateLink(token) {
  if (!isValidClaimToken(token)) return { state: 'not_found' };
  const certificate = await getCertificateByToken(token);
  if (!certificate) return { state: 'not_found' };
  if (certificate.status !== 'active') return { state: 'revoked' };
  if (isLinkExpired(certificate.tokenExpiresAt)) return { state: 'expired' };
  return { state: 'ok', certificate, tokenHash: hashClaimToken(token) };
}

export async function hasCertificateSession({ certificate, tokenHash }) {
  const store = await cookies();
  return readSessionValue(store.get(SESSION_COOKIE)?.value, {
    certificateId: certificate.id,
    tokenHash,
  });
}

// Lax, not strict: opening the emailed link is a navigation from another
// site, and a strict cookie is left off it, so a verified attendee was shown
// the code step until they refreshed. Lax still keeps the cookie off
// cross-site POSTs, and those routes also check the request origin.
export async function startCertificateSession({ certificate, tokenHash }) {
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    createSessionValue({ certificateId: certificate.id, tokenHash }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    }
  );
}

export const LINK_STATE_MESSAGES = {
  not_found: 'This link is not valid.',
  expired: 'This link has expired.',
  revoked: 'This certificate is no longer active.',
};
