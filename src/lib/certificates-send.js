import fs from 'node:fs/promises';
import path from 'node:path';
import {
  claimCertificateSend,
  getCertificateById,
  markCertificateSendFailed,
  markCertificateSent,
  prepareCertificateSendRequest,
  rotateClaimToken,
} from '@/lib/certificates-db';
import {
  getResendClient,
  getResendFromEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import certificatesEmail from '@/lib/certificates-email.cjs';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';

const { CERTIFICATE_REPLY_TO, buildCertificateEmail } = certificatesEmail;
const { hashGuestEmailRequest } = guestSendAttempt;

function getSiteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

let cachedLogo = null;
async function logoAttachment() {
  if (!cachedLogo) {
    cachedLogo = await fs.readFile(
      path.join(
        process.cwd(),
        'public',
        'img',
        'email',
        'tasi-festival-logo.png'
      )
    );
  }
  return {
    filename: 'tasi-festival-logo.png',
    content: cachedLogo,
    contentId: 'tasi-logo',
  };
}

// Preview uses a placeholder token; it never creates a working link.
export async function previewCertificateEmail(id) {
  const certificate = await getCertificateById(id);
  const email = buildCertificateEmail({
    name: certificate.name,
    edition: certificate.edition,
    token: 'preview-link',
    siteUrl: getSiteUrl(),
  });
  return {
    subject: email.subject,
    text: email.text,
    html: email.html,
    to: [certificate.email],
  };
}

// A test goes to one address and uses a placeholder link, so it can never
// hand out a working download link for someone else's certificate.
export async function sendCertificateTest({ id, to }) {
  if (!getResendClient()) throw new Error('Resend is not configured.');
  const recipient = String(to || '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error('An email address is required for the test.');
  }
  const certificate = await getCertificateById(id);
  const email = buildCertificateEmail({
    name: certificate.name,
    edition: certificate.edition,
    token: 'test-link-not-valid',
    siteUrl: getSiteUrl(),
    test: true,
  });
  const delivery = await sendApplicantConfirmationEmail({
    to: recipient,
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: CERTIFICATE_REPLY_TO,
    attachments: [await logoAttachment()],
  });
  if (!delivery.sent)
    throw new Error(delivery.error || 'Resend did not accept the test email.');
  return { recipient };
}

// Sends the certificate email with a fresh personal link. Earlier links stop
// working. If the provider's answer is lost, the attempt is closed as failed
// with a note, so an organiser checks Resend before sending again.
export async function sendCertificateEmail({ id, operator, resend = false }) {
  if (!getResendClient()) throw new Error('Resend is not configured.');
  const certificate = await getCertificateById(id);
  if (certificate.status !== 'active')
    throw new Error('This certificate has been revoked.');
  if (certificate.emailStatus === 'sent' && !resend) {
    throw new Error(
      `${certificate.name} has already been sent their certificate. Use Resend to send it again.`
    );
  }

  const attempt = await claimCertificateSend({ certificate, operator });
  let providerContacted = false;
  try {
    const token = await rotateClaimToken(certificate.id);
    const email = buildCertificateEmail({
      name: certificate.name,
      edition: certificate.edition,
      token,
      siteUrl: getSiteUrl(),
    });
    const attachments = [await logoAttachment()];
    await prepareCertificateSendRequest(
      attempt.id,
      hashGuestEmailRequest({
        from: getResendFromEmail(),
        to: [certificate.email],
        subject: email.subject,
        text: email.text,
        html: email.html,
        replyTo: CERTIFICATE_REPLY_TO,
        attachments,
      })
    );
    providerContacted = true;
    const delivery = await sendApplicantConfirmationEmail({
      to: certificate.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: CERTIFICATE_REPLY_TO,
      attachments,
      idempotencyKey: `attendee-certificate/${attempt.id}`,
    });
    if (!delivery.sent || !delivery.providerMessageId) {
      throw new Error(delivery.error || 'Resend did not confirm a message ID.');
    }
    return await markCertificateSent({
      attemptId: attempt.id,
      providerMessageId: delivery.providerMessageId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Email was not sent.';
    try {
      await markCertificateSendFailed({
        attemptId: attempt.id,
        errorMessage: providerContacted
          ? `Outcome uncertain: ${message} Check Resend before sending again.`
          : message,
      });
    } catch (recordError) {
      console.error('Unable to close certificate send attempt.', recordError);
    }
    throw new Error(message);
  }
}
