import { protectPublicPostRoute } from '@/lib/api-security';
import {
  createFestivalRazorpayOrder,
  getFestivalPublicRazorpayConfig,
} from '@/lib/razorpay';
import {
  createFestivalTicket,
  findFestivalTicketByUserId,
  findFestivalTicketByIdempotencyKey,
  recordFestivalPaymentAudit,
  setFestivalTicketRazorpayOrderId,
  upsertFestivalTicketUser,
} from '@/lib/festival-ticketing-db';
import { deriveFestivalTicketPurchaseDetails } from '@/lib/festival-ticketing-core';
import { festivalCreateOrderSchema } from '@/lib/festival-ticketing-validation';
import { sanitizeEmail } from '@/lib/input-sanitizers';
import crypto from 'node:crypto';

function buildIdempotencyKey(payload) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        email: sanitizeEmail(payload.email),
        country: payload.country,
      })
    )
    .digest('hex');
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'festival-ticket-create-order',
    {
      windowMs: 10 * 60 * 1000,
      maxRequests: 5,
    }
  );

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();
    const parsed = festivalCreateOrderSchema.parse(body);
    const purchase = deriveFestivalTicketPurchaseDetails({
      country: parsed.country,
    });
    const idempotencyKey = buildIdempotencyKey(parsed);
    let ticket = await findFestivalTicketByIdempotencyKey(idempotencyKey);

    if (ticket && ticket.status !== 'pending') {
      return Response.json(
        {
          error: 'A festival ticket already exists for this attendee.',
        },
        { status: 409, headers: protection.headers }
      );
    }

    if (!ticket) {
      const user = await upsertFestivalTicketUser(parsed);
      const existingForUser = await findFestivalTicketByUserId(user.id);
      if (existingForUser && existingForUser.status !== 'cancelled') {
        return Response.json(
          {
            error: 'A festival ticket already exists for this email address.',
          },
          { status: 409, headers: protection.headers }
        );
      }
      ticket = await createFestivalTicket({
        user,
        idempotencyKey,
      });
      await recordFestivalPaymentAudit({
        ticketId: ticket.id,
        userId: user.id,
        eventType: 'festival_ticket_created',
        paymentStream: purchase.paymentStream,
        payload: purchase,
      });
    }

    const razorpayOrder = await createFestivalRazorpayOrder({
      amountMinor: ticket.total_amount_minor,
      receipt: ticket.ticket_number,
      notes: {
        ticketId: ticket.id,
        ticketType: ticket.ticket_type,
      },
      currency: ticket.currency,
      paymentStream: ticket.payment_stream,
    });

    await setFestivalTicketRazorpayOrderId(ticket.id, razorpayOrder.id);
    await recordFestivalPaymentAudit({
      ticketId: ticket.id,
      userId: ticket.user?.id || ticket.user_id,
      eventType: 'festival_razorpay_order_created',
      paymentStream: ticket.payment_stream,
      payload: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return Response.json(
      {
        success: true,
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        paymentStream: ticket.payment_stream,
        ticketType: ticket.ticket_type,
        currency: ticket.currency,
        totalAmountMinor: ticket.total_amount_minor,
        displayPrice: purchase.displayPrice,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: getFestivalPublicRazorpayConfig(ticket.payment_stream)
          .keyId,
      },
      { headers: protection.headers }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create festival ticket order.',
      },
      { status: 400, headers: protection.headers }
    );
  }
}
