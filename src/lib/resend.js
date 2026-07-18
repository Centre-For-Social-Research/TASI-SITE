import { Resend } from 'resend';
import { EVENT_CONFIG } from '@/lib/registration-constants';
import { renderBrandedEmailHtml } from '@/lib/email-branding';

let resendClient = null;

function parseEmailList(value) {
  return Array.from(
    new Set(
      String(value || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  );
}

export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || '';
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || EVENT_CONFIG.senderEmail;
}

export function getResendSenderDiagnostics() {
  const fromEmail = getResendFromEmail();
  const normalizedFromEmail = fromEmail.toLowerCase();
  const domain = normalizedFromEmail.split('@')[1] || '';
  const warnings = [];
  let senderMode = 'custom';

  if (!normalizedFromEmail) {
    senderMode = 'missing';
    warnings.push('RESEND_FROM_EMAIL is not configured.');
  } else if (domain === 'resend.dev') {
    senderMode = 'test';
    warnings.push(
      "Using a Resend test sender. This only delivers to the Resend account owner's email address. Verify the trustandsafetyindia.org domain in Resend and switch RESEND_FROM_EMAIL to noreply@trustandsafetyindia.org for registration emails."
    );
  }

  return {
    fromEmail,
    domain: domain || null,
    senderMode,
    warnings,
  };
}

export function getResendWebhookSecret() {
  return process.env.RESEND_WEBHOOK_SECRET?.trim() || '';
}

export function getInboundNotificationRecipients() {
  const configured = parseEmailList(process.env.INBOUND_NOTIFICATION_EMAILS);
  return configured.length ? configured : [EVENT_CONFIG.contactEmail];
}

export function getResendClient() {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendInboundNotificationEmail({ subject, text, replyTo }) {
  const resend = getResendClient();
  const recipients = getInboundNotificationRecipients();

  if (!resend || !recipients.length) {
    return {
      sent: false,
      skipped: true,
      error: !resend
        ? 'Missing RESEND_API_KEY.'
        : 'Missing notification recipients.',
    };
  }

  const { data, error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: recipients,
    subject,
    text,
    html: renderBrandedEmailHtml(text),
    replyTo: replyTo ? [replyTo] : undefined,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email.');
  }

  return {
    sent: true,
    providerMessageId: data?.id || null,
  };
}
