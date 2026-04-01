import { protectPublicPostRoute } from "@/lib/api-security";
import { verifyRazorpayCheckoutSignature } from "@/lib/razorpay";
import { sendTicketConfirmationEmail } from "@/lib/ticketing-email";
import {
  createOrUpdateTicketPayment,
  getTicketOrder,
  issueTicketsForOrder,
} from "@/lib/ticketing-db";
import { verifyTicketPaymentSchema } from "@/lib/ticketing-validation";

export async function POST(request) {
  const protection = await protectPublicPostRoute(request, "ticket-payments-verify", {
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();
    const parsed = verifyTicketPaymentSchema.parse(body);
    const order = await getTicketOrder(parsed.orderId);

    if (!order.provider_order_id || order.provider_order_id !== parsed.razorpayOrderId) {
      return Response.json({ error: "Payment order mismatch." }, { status: 400, headers: protection.headers });
    }

    const signatureValid = verifyRazorpayCheckoutSignature({
      razorpayOrderId: parsed.razorpayOrderId,
      razorpayPaymentId: parsed.razorpayPaymentId,
      razorpaySignature: parsed.razorpaySignature,
    });

    if (!signatureValid) {
      return Response.json({ error: "Invalid payment signature." }, { status: 400, headers: protection.headers });
    }

    await createOrUpdateTicketPayment({
      orderId: order.id,
      providerOrderId: parsed.razorpayOrderId,
      providerPaymentId: parsed.razorpayPaymentId,
      providerSignature: parsed.razorpaySignature,
      amountPaise: order.total_paise,
      status: "captured",
      payload: body,
    });

    const shouldSendEmail = (order.tickets || []).length === 0;
    const tickets = await issueTicketsForOrder(order.id);

    if (shouldSendEmail) {
      await sendTicketConfirmationEmail({
        order,
        event: order.ticket_events,
        tickets,
      });
    }

    return Response.json(
      {
        success: true,
        orderId: order.id,
        orderCode: order.public_order_code,
        tickets,
      },
      { headers: protection.headers },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 400, headers: protection.headers },
    );
  }
}
