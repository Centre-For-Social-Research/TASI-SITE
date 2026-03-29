let _resendClient = null;
let _resendApiKey = null;

export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function getResendClient() {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;

  if (_resendApiKey === apiKey && _resendClient) {
    return _resendClient;
  }

  const { Resend } = require("resend");
  _resendClient = new Resend(apiKey);
  _resendApiKey = apiKey;
  return _resendClient;
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || null;
}

export function getResendWebhookSecret() {
  return process.env.RESEND_WEBHOOK_SECRET?.trim() || null;
}

export function getResendSenderDiagnostics() {
  const fromEmail = getResendFromEmail();
  let domain = null;
  let senderMode = "unconfigured";
  const warnings = [];

  if (fromEmail) {
    const atIndex = fromEmail.lastIndexOf("@");
    if (atIndex !== -1) {
      domain = fromEmail.slice(atIndex + 1).toLowerCase();
    }

    if (domain === "resend.dev" || domain === "onboarding.resend.dev") {
      senderMode = "sandbox";
      warnings.push("Using Resend sandbox domain. Emails can only be sent to the account owner's address.");
    } else if (domain) {
      senderMode = "custom";
    }
  }

  if (!getResendApiKey()) {
    warnings.push("RESEND_API_KEY is not set. Email delivery is disabled.");
  }

  return { fromEmail, domain, senderMode, warnings };
}

export function getInboundNotificationRecipients() {
  const raw = process.env.RESEND_INBOUND_NOTIFICATION_EMAILS?.trim() || "";
  if (!raw) return [];
  return raw
    .split(/[,\n]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}
