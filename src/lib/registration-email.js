import { EVENT_CONFIG, REGISTRATION_EMAIL_COPY } from "@/lib/registration-constants";
import { getResendClient, getResendFromEmail } from "@/lib/resend";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEmailLogoUrl() {
  const siteUrl = process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jamsaq.in";
  const normalizedBase = siteUrl.replace(/\/+$/, "");
  return `${normalizedBase}/img/tasi-csr-logo.png`;
}

function renderEmailHtml(text, { qrDataUrl, registrationCode } = {}) {
  const paragraphs = text.split("\n").filter(Boolean);
  const body = paragraphs.map((line) => `<p style="margin:0 0 14px;color:#111827;font-size:16px;line-height:1.6;">${escapeHtml(line)}</p>`).join("");
  const logoUrl = getEmailLogoUrl();
  const qrBlock = qrDataUrl
    ? `<div style="margin:24px 0 18px;padding:18px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;text-align:center;">
        <img src="${qrDataUrl}" alt="TASI 2026 QR pass" width="220" height="220" style="display:block;margin:0 auto 12px;border-radius:10px;background:#ffffff;padding:8px;" />
        <p style="margin:0;color:#475569;font-size:14px;line-height:1.5;">Registration ID: ${escapeHtml(registrationCode)}</p>
      </div>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5efe4;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="overflow:hidden;border-radius:10px;background:#ffffff;box-shadow:0 20px 60px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(120deg,#55089e -7.06%,#9f0099 16.19%,#ff0080 39.45%,#ef5700 85.96%,#ffff00 109.21%);padding:24px 30px;">
          <div style="text-align:left;">
            <img src="${logoUrl}" alt="${escapeHtml(EVENT_CONFIG.shortName)} logo" width="44" height="44" style="display:block;width:44px;height:44px;object-fit:contain;margin:0 0 14px 0;" />
            <p style="margin:0 0 8px;color:#fde68a;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(EVENT_CONFIG.shortName)}</p>
            <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Trust and Safety India Festival 2026</h1>
          </div>
        </div>
        <div style="padding:28px 30px;">
          ${body}
          ${qrBlock}
          <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">For registration support, contact ${escapeHtml(EVENT_CONFIG.contactEmail)}.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export async function deliverRegistrationEmail({
  registration,
  templateType,
  notificationId,
  db,
  qrDataUrl,
  pdfAttachment,
}) {
  const templateFactory = REGISTRATION_EMAIL_COPY[templateType];

  if (!templateFactory) {
    throw new Error(`Unsupported email template: ${templateType}`);
  }

  const { subject, text } = templateFactory({
    firstName: registration.first_name,
  });
  const resend = getResendClient();

  if (!resend) {
    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: "failed",
        failure_reason: "Missing RESEND_API_KEY.",
      });
    }

    return {
      sent: false,
      skipped: true,
      error: "Missing RESEND_API_KEY.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [registration.email],
      subject,
      text,
      html: renderEmailHtml(text, {
        qrDataUrl,
        registrationCode: registration.registration_code,
      }),
      attachments: pdfAttachment
        ? [
            {
              filename: pdfAttachment.filename,
              content: pdfAttachment.buffer,
            },
          ]
        : undefined,
    });

    if (error) {
      throw new Error(error.message || "Failed to send email.");
    }

    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: "sent",
        provider_message_id: data?.id || null,
      });
    }

    return { sent: true, providerMessageId: data?.id || null };
  } catch (error) {
    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: "failed",
        failure_reason: error instanceof Error ? error.message : "Failed to send email.",
      });
    }

    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email.",
    };
  }
}
