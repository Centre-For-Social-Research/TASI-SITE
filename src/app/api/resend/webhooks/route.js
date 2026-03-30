import { Webhook } from 'svix';
import { updateNotificationFromWebhook } from '@/lib/registration-db';
import { getResendWebhookSecret } from '@/lib/resend';

function mapResendEventType(type) {
  if (type === 'email.delivered') return 'delivered';
  if (type === 'email.bounced') return 'bounced';
  if (type === 'email.complained') return 'complained';
  return 'sent';
}

export async function POST(request) {
  try {
    const secret = getResendWebhookSecret();
    if (!secret) {
      return Response.json(
        { error: 'Missing RESEND_WEBHOOK_SECRET.' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headers = {
      'svix-id': request.headers.get('svix-id'),
      'svix-timestamp': request.headers.get('svix-timestamp'),
      'svix-signature': request.headers.get('svix-signature'),
    };
    const webhook = new Webhook(secret);
    const payload = webhook.verify(body, headers);
    const providerMessageId = payload?.data?.email_id;

    if (!providerMessageId) {
      return Response.json(
        { error: 'Missing provider message id.' },
        { status: 400 }
      );
    }

    await updateNotificationFromWebhook({
      providerMessageId,
      deliveryStatus: mapResendEventType(payload.type),
      failureReason:
        payload.type === 'email.bounced'
          ? payload?.data?.bounce?.reason || 'Email bounced.'
          : null,
      providerPayload: payload,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to process webhook.',
      },
      { status: 400 }
    );
  }
}
