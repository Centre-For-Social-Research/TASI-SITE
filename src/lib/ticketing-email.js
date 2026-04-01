import { getResendClient, getResendFromEmail } from "@/lib/resend";
import { buildTicketQrDataUrl } from "@/lib/ticketing-qr";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendTicketConfirmationEmail({ order, event, tickets }) {
  const resend = getResendClient();

  if (!resend) {
    return {
      sent: false,
      skipped: true,
      error: "Missing RESEND_API_KEY.",
    };
  }

  const ticketBlocks = await Promise.all(
    tickets.map(async (ticket) => {
      const qrDataUrl = await buildTicketQrDataUrl(ticket);
      return `
        <div style="margin:0 0 22px;padding:18px;border:1px solid #e5e7eb;border-radius:10px;background:#fffdf8;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a5b00;">${escapeHtml(ticket.ticket_type_name || "Reception Ticket")}</p>
          <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#140f26;">${escapeHtml(ticket.attendee_name)}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#475569;">Ticket code: ${escapeHtml(ticket.ticket_code)}</p>
          <p style="margin:0 0 12px;font-size:13px;color:#475569;">${escapeHtml(ticket.attendee_email)} · ${escapeHtml(ticket.attendee_phone)}</p>
          <img src="${qrDataUrl}" alt="QR code for ${escapeHtml(ticket.ticket_code)}" width="180" height="180" style="display:block;width:180px;height:180px;border-radius:10px;border:1px solid #e5e7eb;background:#ffffff;padding:8px;" />
        </div>
      `;
    }),
  );

  const html = `<!doctype html>
  <html>
    <body style="margin:0;padding:24px;background:#f5efe4;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:24px 28px;background:linear-gradient(120deg,#55089e -7.06%,#9f0099 16.19%,#ff0080 39.45%,#ef5700 85.96%,#ffff00 109.21%);">
          <p style="margin:0;color:#fde68a;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">TASI 2026</p>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Reception booking confirmed</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#111827;">Thank you for booking your reception tickets for ${escapeHtml(event.title)}.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Order reference: ${escapeHtml(order.public_order_code)}<br/>Venue: ${escapeHtml(event.venue || "TASI 2026 Reception")}<br/>Start: ${escapeHtml(event.starts_at || "")}</p>
          ${ticketBlocks.join("")}
        </div>
      </div>
    </body>
  </html>`;

  const text = [
    `Your booking for ${event.title} is confirmed.`,
    `Order reference: ${order.public_order_code}`,
    ...tickets.map((ticket) => `${ticket.ticket_code} - ${ticket.attendee_name}`),
  ].join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [order.buyer_email],
      subject: `TASI 2026 reception booking confirmed — ${event.title}`,
      text,
      html,
    });

    if (error) {
      throw new Error(
        error.message || "Failed to send ticket confirmation email.",
      );
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
          : "Failed to send ticket confirmation email.",
    };
  }
}
