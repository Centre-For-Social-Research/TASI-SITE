import { sendFestivalTicketConfirmationEmail } from '@/lib/festival-ticketing-email';
import { createFestivalWebhookHandler } from '@/lib/festival-payment-route-handlers.mjs';
import {
  confirmFestivalTicketPayment,
  findFestivalTicketByRazorpayOrderId,
  recordFestivalPaymentAudit,
} from '@/lib/festival-ticketing-db';
import { verifyFestivalRazorpayWebhookSignature } from '@/lib/razorpay';

const handleWebhook = createFestivalWebhookHandler('domestic', {
  findFestivalTicketByRazorpayOrderId,
  verifyFestivalRazorpayWebhookSignature,
  recordFestivalPaymentAudit,
  confirmFestivalTicketPayment,
  sendFestivalTicketConfirmationEmail,
});

export async function POST(request) {
  try {
    return await handleWebhook(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Webhook failed.' },
      { status: 500 }
    );
  }
}
