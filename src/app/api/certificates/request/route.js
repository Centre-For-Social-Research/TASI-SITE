import { after } from 'next/server';
import { protectPublicPostRoute } from '@/lib/api-security';
import { isValidEmail, sanitizeEmail } from '@/lib/input-sanitizers';
import {
  findActiveCertificatesByEmail,
  logCertificateEvent,
} from '@/lib/certificates-db';
import { sendCertificateEmail } from '@/lib/certificates-send';

// Same reply whether or not the email has a certificate, so this page can't
// be used to find out who attended.
const NEUTRAL_MESSAGE =
  'If this email has a TASI 2026 certificate, we have sent a new download link to it. Please check your inbox and spam folder.';
const RESEND_COOLDOWN_MS = 15 * 60 * 1000;

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'certificate-request',
    {
      windowMs: 10 * 60 * 1000,
      maxRequests: 10,
    }
  );
  if (!protection.ok) return protection.response;

  let email = '';
  try {
    email = sanitizeEmail((await request.json())?.email);
  } catch {
    email = '';
  }
  if (!isValidEmail(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400, headers: protection.headers }
    );
  }

  try {
    const certificates = await findActiveCertificatesByEmail({ email });
    const due = certificates.filter(
      (certificate) =>
        certificate.emailStatus !== 'sending' &&
        (!certificate.lastSentAt ||
          Date.now() - Date.parse(certificate.lastSentAt) > RESEND_COOLDOWN_MS)
    );
    if (due.length) {
      after(async () => {
        for (const certificate of due) {
          try {
            await sendCertificateEmail({
              id: certificate.id,
              operator: { primaryEmail: 'self-service' },
              resend: true,
            });
            await logCertificateEvent(certificate.id, 'link_reissued', {
              via: 'self-service',
            });
          } catch (error) {
            console.error('Certificate link request failed.', error);
          }
        }
      });
    }
  } catch (error) {
    console.error('Certificate link request failed.', error);
    return Response.json(
      {
        error:
          'We could not process this right now. Please try again in a few minutes.',
      },
      { status: 503, headers: protection.headers }
    );
  }
  return Response.json(
    { ok: true, message: NEUTRAL_MESSAGE },
    { headers: protection.headers }
  );
}
