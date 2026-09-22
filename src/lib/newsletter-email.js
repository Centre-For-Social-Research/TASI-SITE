import { getTasiEmailInlineAttachments } from '@/lib/qr-pass-email-assets';
import {
  getApplicationCommsEmail,
  getResendClient,
  getResendFromEmail,
} from '@/lib/resend';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';

const { buildNewsletterAcknowledgementEmail } = applicationAcknowledgementEmail;

export async function sendNewsletterWelcomeEmail(email) {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false, skipped: true, error: 'Missing RESEND_API_KEY.' };
  }

  const replyEmail = getApplicationCommsEmail();
  const { subject, text, html } = buildNewsletterAcknowledgementEmail({
    replyEmail,
  });
  const { data, error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [email],
    subject,
    text,
    html,
    replyTo: [replyEmail],
    attachments: await getTasiEmailInlineAttachments(),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email.');
  }

  return { sent: true, providerMessageId: data?.id || null };
}
