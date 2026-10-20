import { protectPublicPostRoute } from '@/lib/api-security';
import {
  LINK_STATE_MESSAGES,
  resolveCertificateLink,
} from '@/lib/certificate-access';
import { createCertificateEmailCode } from '@/lib/certificates-db';
import { sendApplicantConfirmationEmail } from '@/lib/resend';
import { logoAttachment } from '@/lib/certificates-send';
import certificatesEmail from '@/lib/certificates-email.cjs';
import certificateSession from '@/lib/certificate-session.cjs';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { CERTIFICATE_REPLY_TO, buildCertificateCodeEmail } = certificatesEmail;
const { maskEmail } = certificateSession;
const { buildClaimUrl } = certificateUtils;

function siteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

// Sends a one-time code to the email the certificate was issued to. The
// code, not the link alone, is what opens the certificate.
export async function POST(request, context) {
  const protection = await protectPublicPostRoute(request, 'certificate-code', {
    windowMs: 15 * 60 * 1000,
    maxRequests: 8,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  try {
    const link = await resolveCertificateLink(token);
    if (link.state !== 'ok') {
      return Response.json(
        { error: LINK_STATE_MESSAGES[link.state] },
        { status: 404, headers: protection.headers }
      );
    }
    const code = await createCertificateEmailCode(link.certificate.id);
    const email = buildCertificateCodeEmail({
      name: link.certificate.name,
      code,
      openUrl: `${buildClaimUrl({ siteUrl: siteUrl(), token })}?code=${code}`,
    });
    const delivery = await sendApplicantConfirmationEmail({
      to: link.certificate.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: CERTIFICATE_REPLY_TO,
      attachments: [await logoAttachment()],
    });
    if (!delivery.sent)
      throw new Error(
        'We could not send the code. Please try again in a few minutes.'
      );
    return Response.json(
      { ok: true, sentTo: maskEmail(link.certificate.email) },
      { headers: protection.headers }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send the code.';
    const status = /too many/i.test(message) ? 429 : 503;
    return Response.json(
      { error: message },
      { status, headers: protection.headers }
    );
  }
}
