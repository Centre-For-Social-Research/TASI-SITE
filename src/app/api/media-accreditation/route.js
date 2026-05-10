import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { protectPublicPostRoute } from '@/lib/api-security';
import {
  getCompletedIdempotentResponse,
  getIdempotencyKey,
  storeIdempotentResponse,
} from '@/lib/api-idempotency';
import { isValidEmail, sanitizeEmail } from '@/lib/input-sanitizers';
import { sendInboundNotificationEmail } from '@/lib/resend';
import { after } from 'next/server';

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'media-accreditation',
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
    const email = sanitizeEmail(body?.email);

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Valid business email is required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const message = [
      'Media accreditation request for TASI 2026',
      `Business email: ${email}`,
    ].join('\n');
    const idempotencyKey = getIdempotencyKey(
      request,
      `media-accreditation:${email}`
    );
    const cached = await getCompletedIdempotentResponse(
      'media-accreditation',
      idempotencyKey
    );
    if (cached) {
      return Response.json(cached, { headers: protection.headers });
    }

    const { error } = await supabase.from('contact_messages').insert({
      email,
      message,
      source: 'media-accreditation',
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    after(async () => {
      try {
        await sendInboundNotificationEmail({
          subject: 'New media accreditation request',
          text: message,
          replyTo: email,
        });
      } catch (emailError) {
        console.error(
          'Failed to send media accreditation notification email.',
          emailError
        );
      }
    });

    const response = { success: true };
    await storeIdempotentResponse(
      'media-accreditation',
      idempotencyKey,
      response,
      email
    );
    return Response.json(response, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to submit media accreditation request.';
    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers }
    );
  }
}
