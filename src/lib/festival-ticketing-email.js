import { getResendClient, getResendFromEmail, renderBasicEmailHtml } from "@/lib/resend";
import {
  buildFestivalBadgePdf,
  buildFestivalInvoicePdf,
  buildFestivalTicketPdf,
} from "@/lib/festival-ticketing-documents";

export async function sendFestivalTicketConfirmationEmail({ ticket, user }) {
  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      skipped: true,
      error: "Missing RESEND_API_KEY.",
    };
  }

  const [ticketPdf, invoicePdf, badgePdf] = await Promise.all([
    buildFestivalTicketPdf({ ticket, user }),
    buildFestivalInvoicePdf({ ticket, user }),
    buildFestivalBadgePdf({ ticket, user }),
  ]);

  const subject = `Your TASI 2026 Registration is Confirmed — ${ticket.ticket_number}`;
  const text = [
    `Hello ${user.full_name},`,
    `Your TASI 2026 festival registration is confirmed.`,
    `Ticket number: ${ticket.ticket_number}`,
    `Invoice number: ${ticket.invoice_number}`,
  ].join("\n");

  const html = renderBasicEmailHtml(subject, text);

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
        {
          filename: `${ticket.badge_number || ticket.ticket_number}-badge.pdf`,
          content: badgePdf,
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
