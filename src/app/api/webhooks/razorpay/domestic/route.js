import { sendFestivalTicketConfirmationEmail } from "@/lib/festival-ticketing-email";
import {
  confirmFestivalTicketPayment,
  findFestivalTicketByRazorpayOrderId,
  recordFestivalPaymentAudit,
} from "@/lib/festival-ticketing-db";
import { verifyFestivalRazorpayWebhookSignature } from "@/lib/razorpay";

async function handleWebhook(request, paymentStream) {
  const payload = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  const valid = verifyFestivalRazorpayWebhookSignature({
    payload,
    signature,
    paymentStream,
  });

  const parsed = JSON.parse(payload || "{}");
  const entity = parsed?.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id || "";
  const razorpayPaymentId = entity?.id || "";

  const ticket = razorpayOrderId
    ? await findFestivalTicketByRazorpayOrderId(razorpayOrderId)
    : null;

  await recordFestivalPaymentAudit({
    ticketId: ticket?.id || null,
    userId: ticket?.user?.id || null,
    eventType: valid ? "festival_webhook_received" : "festival_webhook_invalid",
    paymentStream,
    payload: parsed,
  });

  if (!valid) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (parsed?.event !== "payment.captured" || !ticket) {
    return Response.json({ success: true });
  }

  const confirmedTicket = await confirmFestivalTicketPayment({
    ticketId: ticket.id,
    razorpayOrderId,
    razorpayPaymentId,
  });

  await sendFestivalTicketConfirmationEmail({
    ticket: confirmedTicket,
    user: confirmedTicket.user,
  });

  return Response.json({ success: true });
}

export async function POST(request) {
  try {
    return await handleWebhook(request, "domestic");
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Webhook failed." },
      { status: 500 },
    );
  }
}
