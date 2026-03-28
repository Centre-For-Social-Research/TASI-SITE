import {
  getInboundNotificationRecipients,
  getResendApiKey,
  getResendSenderDiagnostics,
  getResendFromEmail,
  getResendWebhookSecret,
} from "@/lib/resend";

export async function GET() {
  const resendApiKeyConfigured = Boolean(getResendApiKey());
  const resendWebhookSecretConfigured = Boolean(getResendWebhookSecret());
  const resendFromEmail = getResendFromEmail();
  const resendSenderDiagnostics = getResendSenderDiagnostics();
  const inboundNotificationRecipients = getInboundNotificationRecipients();

  return Response.json({
    status: "ok",
    services: {
      resend: {
        apiKeyConfigured: resendApiKeyConfigured,
        fromEmailConfigured: Boolean(resendFromEmail),
        fromEmail: resendSenderDiagnostics.fromEmail,
        senderDomain: resendSenderDiagnostics.domain,
        senderMode: resendSenderDiagnostics.senderMode,
        warnings: resendSenderDiagnostics.warnings,
        webhookSecretConfigured: resendWebhookSecretConfigured,
        inboundNotificationRecipientsConfigured: inboundNotificationRecipients.length > 0,
        inboundNotificationRecipientsCount: inboundNotificationRecipients.length,
      },
    },
  });
}
