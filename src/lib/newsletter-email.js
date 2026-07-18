import { renderBrandedEmailHtml } from '@/lib/email-branding';
import { getResendClient, getResendFromEmail } from '@/lib/resend';

export const NEWSLETTER_WELCOME_COPY = {
  subject: "You're on the TASI 2026 mailing list",
  text: `Hi,

Thanks for subscribing to updates from the Trust and Safety India Festival.

We'll write when there is something worth your time: programme announcements, speaker news, and registration updates for TASI 2026, happening 14-15 October at the India International Centre, New Delhi.

If this wasn't you, reply to this email and we'll take you off the list.

Warm regards,
TASI Team`,
};

export async function sendNewsletterWelcomeEmail(email) {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false, skipped: true, error: 'Missing RESEND_API_KEY.' };
  }

  const { subject, text } = NEWSLETTER_WELCOME_COPY;
  const { data, error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [email],
    subject,
    text,
    html: renderBrandedEmailHtml(text),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email.');
  }

  return { sent: true, providerMessageId: data?.id || null };
}
