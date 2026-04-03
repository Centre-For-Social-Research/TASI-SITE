import { getResendClient, getResendFromEmail } from "@/lib/resend";
import { EVENT_CONFIG } from "@/lib/registration-constants";
import { FESTIVAL_EVENT_COPY } from "@/lib/festival-ticketing-constants";
import {
  buildFestivalInvoicePdf,
  buildFestivalTicketPdf,
} from "@/lib/festival-ticketing-documents";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EMAIL_LOGO_URL = "https://jamsaq.in/img/tasi-csr-logo.png";

function renderTicketConfirmationEmailHtml({ ticket, user }) {
  const logoUrl = EMAIL_LOGO_URL;
  const firstName = escapeHtml(
    (user.full_name || "").split(" ")[0] || user.full_name || "Attendee"
  );
  const fullName = escapeHtml(user.full_name || "");
  const ticketNumber = escapeHtml(ticket.ticket_number || "—");
  const invoiceNumber = escapeHtml(ticket.invoice_number || "—");
  const ticketType = escapeHtml(
    ticket.ticket_type === "domestic" ? "Domestic" : "International"
  );

  const kv = (label, value) => `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;vertical-align:top;width:140px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0 8px 16px;color:#111827;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TASI 2026 — Registration Confirmed</title>
  </head>
  <body style="margin:0;padding:0;background:#f5efe4;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="overflow:hidden;border-radius:12px;background:#ffffff;box-shadow:0 20px 60px rgba(15,23,42,0.10);">

        <!-- ── Branded gradient header (same as registration confirmation email) ── -->
        <div style="background:linear-gradient(120deg,#55089e -7.06%,#9f0099 16.19%,#ff0080 39.45%,#ef5700 85.96%,#ffff00 109.21%);padding:24px 30px;">
          <img src="${logoUrl}" alt="${escapeHtml(EVENT_CONFIG.shortName)} logo" width="44" height="44"
               style="display:block;width:44px;height:44px;object-fit:contain;margin:0 0 14px;" />
          <p style="margin:0 0 8px;color:#fde68a;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(EVENT_CONFIG.shortName)}</p>
          <h1 style="margin:0 0 6px;color:#ffffff;font-size:26px;line-height:1.2;">${escapeHtml(FESTIVAL_EVENT_COPY.title)}</h1>
          <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;">${escapeHtml(FESTIVAL_EVENT_COPY.venue)} &nbsp;·&nbsp; ${escapeHtml(FESTIVAL_EVENT_COPY.datesLabel)}</p>
        </div>

        <!-- ── Body ── -->
        <div style="padding:30px;">

          <p style="margin:0 0 18px;color:#111827;font-size:16px;line-height:1.6;">
            Hello <strong>${firstName}</strong>,
          </p>
          <p style="margin:0 0 24px;color:#111827;font-size:16px;line-height:1.6;">
            Your registration for the <strong>${escapeHtml(FESTIVAL_EVENT_COPY.title)}</strong> is confirmed.
            Please find your <strong>ticket</strong> and <strong>tax invoice</strong>
            attached to this email. Your <strong>name badge</strong> will be shared one week before the event.
          </p>

          <!-- ── Registration details card ── -->
          <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <div style="background:#f8fafc;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#140f26;font-size:15px;font-weight:700;">Registration Details</p>
            </div>
            <div style="padding:6px 18px 14px;">
              <table style="width:100%;border-collapse:collapse;">
                ${kv("Attendee", escapeHtml(fullName))}
                ${kv("Ticket Number", `<strong style="font-family:monospace;font-size:15px;">${ticketNumber}</strong>`)}
                ${kv("Invoice Number", `<span style="font-family:monospace;">${invoiceNumber}</span>`)}
                ${kv("Pass Type", ticketType)}
                ${kv("Event", escapeHtml(FESTIVAL_EVENT_COPY.title))}
                ${kv("Dates", escapeHtml(FESTIVAL_EVENT_COPY.datesLabel))}
                ${kv("Venue", escapeHtml(FESTIVAL_EVENT_COPY.venue))}
              </table>
            </div>
          </div>

          <!-- ── Attachments notice ── -->
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#92400e;font-size:14px;font-weight:700;">📎 Attachments in this email</p>
            <ul style="margin:0;padding-left:18px;color:#78350f;font-size:13px;line-height:1.8;">
              <li><strong>${ticketNumber}.pdf</strong> — Entry ticket with QR code (present at the gate)</li>
              <li><strong>${invoiceNumber}.pdf</strong> — Tax invoice for your records</li>
            </ul>
          </div>

          <!-- ── What to bring ── -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#166534;font-size:14px;font-weight:700;">✅ What to bring on the day</p>
            <ul style="margin:0;padding-left:18px;color:#15803d;font-size:13px;line-height:1.8;">
              <li>Your ticket (PDF or screenshot on your phone is fine)</li>
              <li>A valid government-issued photo ID</li>
            </ul>
          </div>

          <p style="margin:0 0 6px;color:#6b7280;font-size:13px;line-height:1.6;">
            For any questions or support, please contact us at
            <a href="mailto:${escapeHtml(EVENT_CONFIG.contactEmail)}" style="color:#9f0099;">${escapeHtml(EVENT_CONFIG.contactEmail)}</a>.
          </p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
            We look forward to seeing you in New Delhi!
          </p>

        </div>

        <!-- ── Footer ── -->
        <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 30px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
            ${escapeHtml(EVENT_CONFIG.shortName)} &nbsp;·&nbsp; ${escapeHtml(FESTIVAL_EVENT_COPY.venue)} &nbsp;·&nbsp; ${escapeHtml(FESTIVAL_EVENT_COPY.datesLabel)}<br/>
            This email was sent to ${escapeHtml(user.email || "")} because you registered for the festival.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>`;
}

export async function sendFestivalTicketConfirmationEmail({ ticket, user }) {
  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      skipped: true,
      error: "Missing RESEND_API_KEY.",
    };
  }

  const [ticketPdf, invoicePdf] = await Promise.all([
    buildFestivalTicketPdf({ ticket, user }),
    buildFestivalInvoicePdf({ ticket, user }),
  ]);

  const subject = `Your TASI 2026 Registration is Confirmed — ${ticket.ticket_number}`;
  const text = [
    `Hello ${user.full_name},`,
    ``,
    `Your TASI 2026 festival registration is confirmed.`,
    ``,
    `Ticket Number: ${ticket.ticket_number}`,
    `Invoice Number: ${ticket.invoice_number}`,
    `Pass Type: ${ticket.ticket_type === "domestic" ? "Domestic" : "International"}`,
    `Event: ${FESTIVAL_EVENT_COPY.title}`,
    `Dates: ${FESTIVAL_EVENT_COPY.datesLabel}`,
    `Venue: ${FESTIVAL_EVENT_COPY.venue}`,
    ``,
    `Your ticket and tax invoice are attached to this email.`,
    `Your name badge will be shared one week before the event.`,
    `Please bring your ticket and a valid photo ID on the day.`,
    ``,
    `For support, contact: ${EVENT_CONFIG.contactEmail}`,
  ].join("\n");

  const html = renderTicketConfirmationEmailHtml({ ticket, user });

  try {
    const { data, error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [user.email],
      subject,
      text,
      html,
      attachments: [
        {
          filename: `${ticket.ticket_number}.pdf`,
          content: ticketPdf,
        },
        {
          filename: `${ticket.invoice_number || "invoice"}.pdf`,
          content: invoicePdf,
        },
      ],
    });

    if (error) {
      throw new Error(error.message || "Failed to send festival confirmation email.");
    }

    return {
      sent: true,
      providerMessageId: data?.id || null,
    };
  } catch (error) {
    return {
      sent: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send festival confirmation email.",
    };
  }
}
