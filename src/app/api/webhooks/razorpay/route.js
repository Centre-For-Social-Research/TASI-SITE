import { sendTicketConfirmationEmail } from '@/lib/ticketing-email';
import {
  createOrUpdateTicketPayment,
  getTicketOrderByProviderOrderId,
  issueTicketsForOrder,
  markTicketOrderFailed,
  recordWebhookEvent,
} from '@/lib/ticketing-db';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { buildWebhookDedupeKey } from '@/lib/ticketing-utils';

export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';

  try {
    const signatureValid = verifyRazorpayWebhookSignature({
      payload,
      signature,
    });
    const parsed = JSON.parse(payload);
    const providerEventId =
      parsed?.payload?.payment?.entity?.id || parsed?.created_at || null;
    const dedupeKey = buildWebhookDedupeKey('razorpay', payload);

    await recordWebhookEvent({
      dedupeKey,
      providerEventId,
      eventType: parsed?.event || 'unknown',
      payload: parsed,
      signatureValid,
    });

    if (!signatureValid) {
      return Response.json(
        { error: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    const paymentEntity = parsed?.payload?.payment?.entity;
    if (!paymentEntity?.order_id) {
      return Response.json({ success: true, skipped: true });
    }

    const order = await getTicketOrderByProviderOrderId(paymentEntity.order_id);
    if (!order) {
      return Response.json({ success: true, skipped: true });
    }

    if (
      parsed.event === 'payment.captured' ||
      parsed.event === 'payment.authorized'
    ) {
      await createOrUpdateTicketPayment({
        orderId: order.id,
        providerOrderId: paymentEntity.order_id,
        providerPaymentId: paymentEntity.id,
        providerSignature: signature,
        amountPaise: paymentEntity.amount,
        status: 'webhook_confirmed',
        payload: parsed,
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
    }

    if (parsed.event === 'payment.failed') {
      await markTicketOrderFailed(order.id, {
        providerEvent: parsed.event,
        errorCode: paymentEntity.error_code || null,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook processing failed.',
      },
      { status: 500 }
    );
  }
}
