import { Resend } from 'resend';
import { EVENT_CONFIG } from '@/lib/registration-constants';

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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderBasicEmailHtml(title, text) {
  const paragraphs = String(text || '')
    .split('\n')
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 14px;color:#111827;font-size:15px;line-height:1.6;">${escapeHtml(line)}</p>`
    )
    .join('');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <div style="padding:22px 24px;background:#0f172a;">
        <p style="margin:0;color:#cbd5e1;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(EVENT_CONFIG.shortName)}</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:24px;">
        ${paragraphs}
      </div>
    </div>
  </body>
</html>`;
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
    html: renderBasicEmailHtml(subject, text),
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
