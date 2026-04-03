import { getFestivalTicketById } from "@/lib/festival-ticketing-db";
import { sendFestivalTicketConfirmationEmail } from "@/lib/festival-ticketing-email";

const DEV_SECRET = process.env.DEV_TEST_SECRET || "";

export async function POST(request) {
  if (process.env.NODE_ENV !== "development" || !DEV_SECRET) {
    return Response.json({ error: "Not available." }, { status: 404 });
  }
  const authHeader = request.headers.get("x-dev-secret") || "";
  if (authHeader !== DEV_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { ticketId } = await request.json();
    if (!ticketId) {
      return Response.json({ error: "ticketId is required." }, { status: 400 });
    }

    const rawTicket = await getFestivalTicketById(ticketId);
    if (!rawTicket) {
      return Response.json({ error: "Ticket not found." }, { status: 404 });
    }

    // Patch fields so the email + PDF generators have valid data even for pending tickets
    const ticket = {
      ...rawTicket,
      status: "confirmed",
      invoice_number: rawTicket.invoice_number || `TEST-INV-${rawTicket.ticket_number}`,
      razorpay_payment_id: rawTicket.razorpay_payment_id || "pay_TEST000000001",
    };

    const result = await sendFestivalTicketConfirmationEmail({
      ticket,
      user: rawTicket.user,
    });

    if (result.sent) {
      return Response.json({
        success: true,
        providerMessageId: result.providerMessageId,
        sentTo: rawTicket.user.email,
      });
    }

    return Response.json(
      { error: result.error || "Failed to send email." },
      { status: 500 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
