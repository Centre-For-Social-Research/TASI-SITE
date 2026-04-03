import { protectPublicPostRoute } from "@/lib/api-security";
import { sendFestivalTicketConfirmationEmail } from "@/lib/festival-ticketing-email";
import {
  confirmFestivalTicketPayment,
  getFestivalTicketById,
  recordFestivalPaymentAudit,
} from "@/lib/festival-ticketing-db";
import { festivalVerifyPaymentSchema } from "@/lib/festival-ticketing-validation";
import { verifyFestivalRazorpayCheckoutSignature } from "@/lib/razorpay";

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    "festival-ticket-verify-payment",
    {
      windowMs: 10 * 60 * 1000,
      maxRequests: 10,
    },
  );
  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();
    const parsed = festivalVerifyPaymentSchema.parse(body);
    const ticket = await getFestivalTicketById(parsed.ticketId);

    const signatureValid = verifyFestivalRazorpayCheckoutSignature({
      razorpayOrderId: parsed.razorpayOrderId,
      razorpayPaymentId: parsed.razorpayPaymentId,
      razorpaySignature: parsed.razorpaySignature,
      paymentStream: ticket.payment_stream,
    });

    if (!signatureValid) {
      await recordFestivalPaymentAudit({
        ticketId: ticket.id,
        userId: ticket.user.id,
        eventType: "festival_payment_verify_failed",
        paymentStream: ticket.payment_stream,
        payload: {
          razorpayOrderId: parsed.razorpayOrderId,
        },
      });
      return Response.json(
        { error: "Payment verification failed." },
        { status: 400, headers: protection.headers },
      );
    }

    const confirmedTicket = await confirmFestivalTicketPayment({
      ticketId: ticket.id,
      razorpayOrderId: parsed.razorpayOrderId,
      razorpayPaymentId: parsed.razorpayPaymentId,
    });

    await recordFestivalPaymentAudit({
      ticketId: confirmedTicket.id,
      userId: confirmedTicket.user.id,
      eventType: "festival_payment_confirmed",
      paymentStream: confirmedTicket.payment_stream,
      payload: {
        razorpayPaymentId: parsed.razorpayPaymentId,
      },
    });

    await sendFestivalTicketConfirmationEmail({
      ticket: confirmedTicket,
      user: confirmedTicket.user,
    });

    return Response.json(
      {
        success: true,
        ticketId: confirmedTicket.id,
        ticketNumber: confirmedTicket.ticket_number,
        invoiceNumber: confirmedTicket.invoice_number,
      },
      { headers: protection.headers },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify festival payment.",
      },
      { status: 400, headers: protection.headers },
    );
  }
}
