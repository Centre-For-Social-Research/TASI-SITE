import { protectPublicPostRoute } from '@/lib/api-security';
import { createRazorpayOrder, getPublicRazorpayConfig } from '@/lib/razorpay';
import { sendTicketConfirmationEmail } from '@/lib/ticketing-email';
import {
  createTicketOrder,
  findOrderByIdempotencyKey,
  getOrCreateTicketCustomer,
  getTicketEventForCheckout,
  getTicketOrder,
  issueTicketsForOrder,
  setOrderProviderOrderId,
} from '@/lib/ticketing-db';
import { buildOrderPricing } from '@/lib/ticketing-pricing';
import { buildOrderIdempotencyKey } from '@/lib/ticketing-utils';
import { createTicketOrderSchema } from '@/lib/ticketing-validation';

function toPublicTicketEvent(event) {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    venue: event.venue,
    startsAt: event.starts_at,
    currency: event.currency,
  };
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'ticket-orders-create',
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
    const parsed = createTicketOrderSchema.parse(body);
    const event = await getTicketEventForCheckout(parsed.eventId);

    if (event.status !== 'published') {
      return Response.json(
        { error: 'This event is not accepting bookings right now.' },
        { status: 400, headers: protection.headers }
      );
    }

    const ticketTypeMap = new Map(
      (event.ticket_types || []).map((ticketType) => [
        ticketType.id,
        ticketType,
      ])
    );
    const pricingSelections = parsed.ticketSelections.map((selection) => {
      const ticketType = ticketTypeMap.get(selection.ticketTypeId);
      if (!ticketType) {
        throw new Error('One or more ticket types are invalid.');
      }

      if (!ticketType.is_on_sale) {
        throw new Error(`${ticketType.name} is not on sale right now.`);
      }

      if (selection.quantity > ticketType.per_order_limit) {
        throw new Error(
          `${ticketType.name} allows a maximum of ${ticketType.per_order_limit} per order.`
        );
      }

      if (
        (ticketType.availability?.availableQuantity || 0) < selection.quantity
      ) {
        throw new Error(
          `${ticketType.name} does not have enough tickets remaining.`
        );
      }

      return {
        ticketType,
        quantity: selection.quantity,
        donationAmountInr: selection.donationAmountInr,
      };
    });

    const pricing = buildOrderPricing({
      ticketSelections: pricingSelections,
    });

    const idempotencyKey = buildOrderIdempotencyKey({
      eventId: parsed.eventId,
      buyerEmail: parsed.buyer.email,
      buyerPhone: parsed.buyer.phone,
      ticketSelections: parsed.ticketSelections,
    });

    const existingOrder = await findOrderByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      if (existingOrder.total_paise > 0 && !existingOrder.provider_order_id) {
        const razorpayOrder = await createRazorpayOrder({
          amountPaise: existingOrder.total_paise,
          receipt: existingOrder.public_order_code,
          notes: {
            internalOrderId: existingOrder.id,
            eventSlug: event.slug,
          },
          currency: existingOrder.currency || 'INR',
        });

        await setOrderProviderOrderId(existingOrder.id, razorpayOrder.id);

        return Response.json(
          {
            success: true,
            orderId: existingOrder.id,
            orderCode: existingOrder.public_order_code,
            status: existingOrder.status,
            amountPaise: existingOrder.total_paise,
            razorpayKeyId: getPublicRazorpayConfig().keyId,
            razorpayOrderId: razorpayOrder.id,
            currency: existingOrder.currency || 'INR',
            event: toPublicTicketEvent(event),
          },
          { headers: protection.headers }
        );
      }

      return Response.json(
        {
          success: true,
          orderId: existingOrder.id,
          orderCode: existingOrder.public_order_code,
          status: existingOrder.status,
          amountPaise: existingOrder.total_paise,
          razorpayKeyId: getPublicRazorpayConfig().keyId,
          razorpayOrderId: existingOrder.provider_order_id,
          event: toPublicTicketEvent(event),
        },
        { headers: protection.headers }
      );
    }

    const customer = await getOrCreateTicketCustomer(parsed.buyer);
    const order = await createTicketOrder({
      event,
      buyer: parsed.buyer,
      customer,
      pricing,
      ticketSelections: parsed.ticketSelections,
      idempotencyKey,
    });

    if (pricing.totalPaise === 0) {
      const tickets = await issueTicketsForOrder(order.id);
      await sendTicketConfirmationEmail({
        order: { ...order, buyer_email: parsed.buyer.email },
        event,
        tickets,
      });

      return Response.json(
        {
          success: true,
          orderId: order.id,
          orderCode: order.public_order_code,
          status: 'paid',
          amountPaise: 0,
          freeOrder: true,
          tickets,
          event: toPublicTicketEvent(event),
        },
        { headers: protection.headers }
      );
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: pricing.totalPaise,
      receipt: order.public_order_code,
      notes: {
        internalOrderId: order.id,
        eventSlug: event.slug,
      },
      currency: event.currency || 'INR',
    });

    await setOrderProviderOrderId(order.id, razorpayOrder.id);
    const updatedOrder = await getTicketOrder(order.id);

    return Response.json(
      {
        success: true,
        orderId: updatedOrder.id,
        orderCode: updatedOrder.public_order_code,
        status: updatedOrder.status,
        amountPaise: updatedOrder.total_paise,
        razorpayKeyId: getPublicRazorpayConfig().keyId,
        razorpayOrderId: razorpayOrder.id,
        currency: updatedOrder.currency,
        buyer: parsed.buyer,
        event: toPublicTicketEvent(event),
      },
      { headers: protection.headers }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create ticket order.',
      },
      { status: 400, headers: protection.headers }
    );
  }
}
