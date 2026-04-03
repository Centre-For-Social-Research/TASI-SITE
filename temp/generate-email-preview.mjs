/**
 * Generates temp/email-preview.html — a standalone preview of the confirmation
 * email sent to a ticket buyer after successful payment.
 * Run: node temp/generate-email-preview.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// ── Inline constants (mirrors registration-constants.js & festival-ticketing-constants.js) ──
const EVENT_CONFIG = {
  shortName: "TASI 2026",
  contactEmail: "info1@csrindia.org",
};
const FESTIVAL_EVENT_COPY = {
  title: "Trust and Safety India Festival 2026",
  description: "Full Access Pass (2 Days + 3 Receptions)",
  venue: "New Delhi, India",
  datesLabel: "13-14 October 2026",
};

// ── Sample ticket / user for preview ──
const ticket = {
  ticket_number: "TASI-DOM-00001",
  invoice_number: "INV-DOM-2026-00001",
  ticket_type: "domestic",
};
const user = {
  full_name: "Aditi Rao",
  email: "aditi@example.com",
};

// ── Embed logo as base64 so the preview works as a standalone file ──
let logoSrc = "";
try {
  const buf = readFileSync(path.join(root, "public", "img", "tasi-csr-logo.png"));
  logoSrc = `data:image/png;base64,${buf.toString("base64")}`;
} catch {
  logoSrc = "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderEmail({ ticket, user }) {
  const firstName = escapeHtml((user.full_name || "").split(" ")[0] || "Attendee");
  const fullName = escapeHtml(user.full_name || "");
  const ticketNumber = escapeHtml(ticket.ticket_number || "—");
  const invoiceNumber = escapeHtml(ticket.invoice_number || "—");
  const ticketType = escapeHtml(ticket.ticket_type === "domestic" ? "Domestic" : "International");

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

        <!-- ── Branded gradient header ── -->
        <div style="background:linear-gradient(120deg,#55089e -7.06%,#9f0099 16.19%,#ff0080 39.45%,#ef5700 85.96%,#ffff00 109.21%);padding:24px 30px;">
          ${logoSrc ? `<img src="${logoSrc}" alt="${escapeHtml(EVENT_CONFIG.shortName)} logo" width="44" height="44" style="display:block;width:44px;height:44px;object-fit:contain;margin:0 0 14px;" />` : ""}
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
            Please find your <strong>ticket</strong>, <strong>tax invoice</strong>, and <strong>name badge</strong>
            attached to this email.
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
              <li>Name badge PDF — Print or save for on-site registration</li>
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

const html = renderEmail({ ticket, user });
writeFileSync(path.join(__dirname, "email-preview.html"), html, "utf-8");
console.log("WROTE_EMAIL_PREVIEW");
