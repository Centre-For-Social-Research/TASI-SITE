function withHeaders(init = {}, headers) {
  if (!headers) {
    return init;
  }

  return {
    ...init,
    headers,
  };
}

function paymentVerificationFailedResponse(headers) {
  return Response.json(
    { error: 'Payment verification failed.' },
    withHeaders({ status: 400 }, headers)
  );
}

export function createFestivalVerifyPaymentHandler({
  protectPublicPostRoute,
  festivalVerifyPaymentSchema,
  getFestivalTicketById,
  verifyFestivalRazorpayCheckoutSignature,
  recordFestivalPaymentAudit,
  confirmFestivalTicketPayment,
  sendFestivalTicketConfirmationEmail,
}) {
  return async function POST(request) {
    const protection = await protectPublicPostRoute(
      request,
      'festival-ticket-verify-payment',
      {
        windowMs: 10 * 60 * 1000,
        maxRequests: 10,
      }
    );
    if (!protection.ok) {
      return protection.response;
    }

    try {
      const body = await request.json();
      const parsed = festivalVerifyPaymentSchema.parse(body);
      const ticket = await getFestivalTicketById(parsed.ticketId);

      if (
        !ticket.razorpay_order_id ||
        ticket.razorpay_order_id !== parsed.razorpayOrderId
      ) {
        await recordFestivalPaymentAudit({
          ticketId: ticket.id,
          userId: ticket.user.id,
          eventType: 'festival_payment_order_mismatch',
          paymentStream: ticket.payment_stream,
          payload: {
            expectedRazorpayOrderId: ticket.razorpay_order_id || null,
            receivedRazorpayOrderId: parsed.razorpayOrderId,
          },
        });

        return paymentVerificationFailedResponse(protection.headers);
      }

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
          eventType: 'festival_payment_verify_failed',
          paymentStream: ticket.payment_stream,
          payload: {
            razorpayOrderId: parsed.razorpayOrderId,
          },
        });
        return paymentVerificationFailedResponse(protection.headers);
      }

      const confirmation = await confirmFestivalTicketPayment({
        ticketId: ticket.id,
        razorpayOrderId: parsed.razorpayOrderId,
        razorpayPaymentId: parsed.razorpayPaymentId,
      });

      await recordFestivalPaymentAudit({
        ticketId: confirmation.ticket.id,
        userId: confirmation.ticket.user.id,
        eventType: confirmation.alreadyConfirmed
          ? 'festival_payment_confirmation_duplicate'
          : 'festival_payment_confirmed',
        paymentStream: confirmation.ticket.payment_stream,
        payload: {
          razorpayPaymentId: parsed.razorpayPaymentId,
        },
      });

      if (!confirmation.alreadyConfirmed) {
        await sendFestivalTicketConfirmationEmail({
          ticket: confirmation.ticket,
          user: confirmation.ticket.user,
        });
      }

      return Response.json(
        {
          success: true,
          ticketId: confirmation.ticket.id,
          ticketNumber: confirmation.ticket.ticket_number,
          invoiceNumber: confirmation.ticket.invoice_number,
        },
        withHeaders({}, protection.headers)
      );
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Unable to verify festival payment.',
        },
        withHeaders({ status: 400 }, protection.headers)
      );
    }
  };
}

export function createFestivalWebhookHandler(
  paymentStream,
  {
    findFestivalTicketByRazorpayOrderId,
    verifyFestivalRazorpayWebhookSignature,
    recordFestivalPaymentAudit,
    confirmFestivalTicketPayment,
    sendFestivalTicketConfirmationEmail,
  }
) {
  return async function handleWebhook(request) {
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    const valid = verifyFestivalRazorpayWebhookSignature({
      payload,
      signature,
      paymentStream,
    });

    const parsed = JSON.parse(payload || '{}');
    const entity = parsed?.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id || '';
    const razorpayPaymentId = entity?.id || '';

    const ticket = razorpayOrderId
      ? await findFestivalTicketByRazorpayOrderId(razorpayOrderId)
      : null;

    await recordFestivalPaymentAudit({
      ticketId: ticket?.id || null,
      userId: ticket?.user?.id || null,
      eventType: valid ? 'festival_webhook_received' : 'festival_webhook_invalid',
      paymentStream,
      payload: parsed,
    });

    if (!valid) {
      return Response.json(
        { error: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    if (parsed?.event !== 'payment.captured' || !ticket) {
      return Response.json({ success: true });
    }

    const confirmation = await confirmFestivalTicketPayment({
      ticketId: ticket.id,
      razorpayOrderId,
      razorpayPaymentId,
    });

    await recordFestivalPaymentAudit({
      ticketId: confirmation.ticket.id,
      userId: confirmation.ticket.user.id,
      eventType: confirmation.alreadyConfirmed
        ? 'festival_webhook_confirmation_duplicate'
        : 'festival_webhook_confirmed',
      paymentStream,
      payload: {
        razorpayPaymentId,
      },
    });

    if (!confirmation.alreadyConfirmed) {
      await sendFestivalTicketConfirmationEmail({
        ticket: confirmation.ticket,
        user: confirmation.ticket.user,
      });
    }

    return Response.json({ success: true });
  };
}
