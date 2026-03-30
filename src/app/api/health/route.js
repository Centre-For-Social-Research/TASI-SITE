import {
  getInboundNotificationRecipients,
  getResendApiKey,
  getResendSenderDiagnostics,
  getResendFromEmail,
  getResendWebhookSecret,
} from "@/lib/resend";
import { isSanityConfigured, projectId, dataset, apiVersion, studioPreviewUrl } from "@/sanity/env";
import { getAuthorizedOperator } from "@/lib/registration-auth";

export async function GET(request) {
  // Public callers only get a simple status response
  let isAuthorized = false;
  try {
    const operator = await getAuthorizedOperator();
    isAuthorized = operator?.authorized === true;
  } catch {
    // Not authorized — return minimal response
  }

  if (!isAuthorized) {
    return Response.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  // Authorized operators get full diagnostics
  const clerkPublishableKeyConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
  const clerkSecretKeyConfigured = Boolean(process.env.CLERK_SECRET_KEY?.trim());
  const clerkAccessMode = String(process.env.CLERK_ACCESS_MODE || "both").trim().toLowerCase();
  const clerkAdminEmails = String(process.env.CLERK_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const clerkReviewerEmails = String(process.env.CLERK_REVIEWER_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const supabaseUrlConfigured = Boolean(process.env.SUPABASE_URL?.trim());
  const supabaseServiceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const siteUrl = process.env.SITE_URL?.trim() || "";
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  const resendApiKeyConfigured = Boolean(getResendApiKey());
  const resendWebhookSecretConfigured = Boolean(getResendWebhookSecret());
  const resendFromEmail = getResendFromEmail();
  const resendSenderDiagnostics = getResendSenderDiagnostics();
  const inboundNotificationRecipients = getInboundNotificationRecipients();

  return Response.json({
    status: "ok",
    services: {
      clerk: {
        publishableKeyConfigured: clerkPublishableKeyConfigured,
        secretKeyConfigured: clerkSecretKeyConfigured,
        accessMode: clerkAccessMode,
        adminEmailsConfigured: clerkAdminEmails.length > 0,
        adminEmailsCount: clerkAdminEmails.length,
        reviewerEmailsConfigured: clerkReviewerEmails.length > 0,
        reviewerEmailsCount: clerkReviewerEmails.length,
      },
      supabase: {
        urlConfigured: supabaseUrlConfigured,
        serviceRoleConfigured: supabaseServiceRoleConfigured,
      },
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
      sanity: {
        configured: isSanityConfigured,
        projectId,
        dataset,
        apiVersion,
        studioPreviewUrl,
      },
      site: {
        siteUrlConfigured: Boolean(siteUrl),
        siteUrl: siteUrl || null,
        publicSiteUrlConfigured: Boolean(publicSiteUrl),
        publicSiteUrl: publicSiteUrl || null,
      },
    },
  });
}
