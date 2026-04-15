const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function importModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), relativePath)).href;
  return import(moduleUrl);
}

function createJsonRequest(body) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function createTextRequest(body, headers = {}) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers,
    body,
  });
}

test('verify handler rejects domestic payment verification when the submitted order does not match the stored ticket order', async () => {
  const { createFestivalVerifyPaymentHandler } = await importModule(
    'src/lib/festival-payment-route-handlers.mjs'
  );

  const audits = [];
  let confirmCalled = false;
  let emailCalled = false;
  let signatureChecked = false;

  const handler = createFestivalVerifyPaymentHandler({
    protectPublicPostRoute: async () => ({
      ok: true,
      headers: new Headers({ 'x-test': '1' }),
    }),
    festivalVerifyPaymentSchema: {
      parse(value) {
        return value;
      },
    },
    getFestivalTicketById: async () => ({
      id: 'ticket-1',
      payment_stream: 'domestic',
      razorpay_order_id: 'order_expected',
      user: {
        id: 'user-1',
      },
    }),
    verifyFestivalRazorpayCheckoutSignature: () => {
      signatureChecked = true;
      return true;
    },
    recordFestivalPaymentAudit: async (entry) => {
      audits.push(entry);
    },
    confirmFestivalTicketPayment: async () => {
      confirmCalled = true;
      throw new Error('should not confirm');
    },
    sendFestivalTicketConfirmationEmail: async () => {
      emailCalled = true;
    },
  });

  const response = await handler(
    createJsonRequest({
      ticketId: 'ticket-1',
      razorpayOrderId: 'order_other',
      razorpayPaymentId: 'pay_1',
      razorpaySignature: 'sig_1',
    })
  );

  assert.equal(response.status, 400);
  assert.equal(signatureChecked, false);
  assert.equal(confirmCalled, false);
  assert.equal(emailCalled, false);
  assert.equal(audits.length, 1);
  assert.equal(audits[0].eventType, 'festival_payment_order_mismatch');
  assert.equal(audits[0].payload.expectedRazorpayOrderId, 'order_expected');
  assert.equal(audits[0].payload.receivedRazorpayOrderId, 'order_other');
  assert.deepEqual(await response.json(), {
    error: 'Payment verification failed.',
  });
});

test('verify handler does not resend confirmation email when the domestic ticket is already confirmed', async () => {
  const { createFestivalVerifyPaymentHandler } = await importModule(
    'src/lib/festival-payment-route-handlers.mjs'
  );

  const audits = [];
  let emailCalled = false;

  const handler = createFestivalVerifyPaymentHandler({
    protectPublicPostRoute: async () => ({
      ok: true,
      headers: new Headers(),
    }),
    festivalVerifyPaymentSchema: {
      parse(value) {
        return value;
      },
    },
    getFestivalTicketById: async () => ({
      id: 'ticket-1',
      payment_stream: 'domestic',
      razorpay_order_id: 'order_live',
      user: {
        id: 'user-1',
      },
    }),
    verifyFestivalRazorpayCheckoutSignature: () => true,
    recordFestivalPaymentAudit: async (entry) => {
      audits.push(entry);
    },
    confirmFestivalTicketPayment: async () => ({
      alreadyConfirmed: true,
      ticket: {
        id: 'ticket-1',
        ticket_number: 'TASI-DOM-00001',
        invoice_number: 'INV-DOM-2026-00001',
        payment_stream: 'domestic',
        user: {
          id: 'user-1',
          email: 'attendee@example.com',
        },
      },
    }),
    sendFestivalTicketConfirmationEmail: async () => {
      emailCalled = true;
    },
  });

  const response = await handler(
    createJsonRequest({
      ticketId: 'ticket-1',
      razorpayOrderId: 'order_live',
      razorpayPaymentId: 'pay_1',
      razorpaySignature: 'sig_1',
    })
  );

  assert.equal(response.status, 200);
  assert.equal(emailCalled, false);
  assert.equal(audits.at(-1).eventType, 'festival_payment_confirmation_duplicate');
  assert.deepEqual(await response.json(), {
    success: true,
    ticketId: 'ticket-1',
    ticketNumber: 'TASI-DOM-00001',
    invoiceNumber: 'INV-DOM-2026-00001',
  });
});

test('domestic webhook handler does not resend the confirmation email for duplicate payment callbacks', async () => {
  const { createFestivalWebhookHandler } = await importModule(
    'src/lib/festival-payment-route-handlers.mjs'
  );

  const audits = [];
  let emailCalled = false;

  const handler = createFestivalWebhookHandler('domestic', {
    findFestivalTicketByRazorpayOrderId: async () => ({
      id: 'ticket-1',
      payment_stream: 'domestic',
      user: {
        id: 'user-1',
        email: 'attendee@example.com',
      },
    }),
    verifyFestivalRazorpayWebhookSignature: () => true,
    recordFestivalPaymentAudit: async (entry) => {
      audits.push(entry);
    },
    confirmFestivalTicketPayment: async () => ({
      alreadyConfirmed: true,
      ticket: {
        id: 'ticket-1',
        payment_stream: 'domestic',
        user: {
          id: 'user-1',
          email: 'attendee@example.com',
        },
      },
    }),
    sendFestivalTicketConfirmationEmail: async () => {
      emailCalled = true;
    },
  });

  const response = await handler(
    createTextRequest(
      JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_1',
              order_id: 'order_live',
            },
          },
        },
      }),
      {
        'x-razorpay-signature': 'valid',
      }
    )
  );

  assert.equal(response.status, 200);
  assert.equal(emailCalled, false);
  assert.equal(audits.at(-1).eventType, 'festival_webhook_confirmation_duplicate');
  assert.deepEqual(await response.json(), { success: true });
});

test('domestic webhook handler returns 400 instead of throwing when the signature length is malformed', async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET_DOMESTIC = 'domestic-webhook-secret';

  const { createFestivalWebhookHandler } = await importModule(
    'src/lib/festival-payment-route-handlers.mjs'
  );
  const { verifyFestivalRazorpayWebhookSignature } = await importModule(
    'src/lib/razorpay.js'
  );

  const audits = [];

  const handler = createFestivalWebhookHandler('domestic', {
    findFestivalTicketByRazorpayOrderId: async () => ({
      id: 'ticket-1',
      payment_stream: 'domestic',
      user: {
        id: 'user-1',
      },
    }),
    verifyFestivalRazorpayWebhookSignature,
    recordFestivalPaymentAudit: async (entry) => {
      audits.push(entry);
    },
    confirmFestivalTicketPayment: async () => {
      throw new Error('should not confirm invalid webhook');
    },
    sendFestivalTicketConfirmationEmail: async () => {
      throw new Error('should not email invalid webhook');
    },
  });

  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_1',
          order_id: 'order_live',
        },
      },
    },
  });

  const response = await handler(
    createTextRequest(payload, {
      'x-razorpay-signature': 'short',
    })
  );

  assert.equal(response.status, 400);
  assert.equal(audits.length, 1);
  assert.equal(audits[0].eventType, 'festival_webhook_invalid');
  assert.deepEqual(await response.json(), {
    error: 'Invalid webhook signature.',
  });
});

test('festival webhook signature verification returns false for malformed signature lengths', async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET_DOMESTIC = 'domestic-webhook-secret';

  const { verifyFestivalRazorpayWebhookSignature } = await importModule(
    'src/lib/razorpay.js'
  );

  const payload = JSON.stringify({
    event: 'payment.captured',
  });
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET_DOMESTIC)
    .update(payload)
    .digest('hex');

  assert.equal(
    verifyFestivalRazorpayWebhookSignature({
      payload,
      signature: validSignature.slice(0, -2),
      paymentStream: 'domestic',
    }),
    false
  );
});
