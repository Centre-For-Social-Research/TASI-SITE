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
    'newsletter-subscribe',
    {
      windowMs: 10 * 60 * 1000,
      maxRequests: 8,
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
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const idempotencyKey = getIdempotencyKey(request, `newsletter:${email}`);
    const cached = await getCompletedIdempotentResponse('newsletter-subscribe', idempotencyKey);
    if (cached) {
      return Response.json(cached, { headers: protection.headers });
    }

    const { error } = await supabase.from('newsletter_subscribers').insert({
      email,
      status: 'active',
      source: 'site-footer',
      subscribed_at: new Date().toISOString(),
    });

    if (error) {
      // Treat existing subscribers as success to keep UX idempotent.
      const isDuplicate =
        error.code === '23505' ||
        error.details?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('duplicate');

      if (isDuplicate) {
        const response = { success: true, alreadySubscribed: true };
        await storeIdempotentResponse('newsletter-subscribe', idempotencyKey, response, email);
        return Response.json(response, { headers: protection.headers });
      }
      return Response.json(
        { error: error.message },
        { status: 500, headers: protection.headers }
      );
    }

    after(async () => {
      try {
        await sendInboundNotificationEmail({
        subject: 'New TASI newsletter subscriber',
        text: [
          'A new newsletter subscriber joined through the website.',
          `Source: site-footer`,
          `Email: ${email}`,
        ].join('\n'),
        replyTo: email,
      });
      } catch (emailError) {
        console.error(
          'Failed to send newsletter notification email.',
          emailError
        );
      }
    });

    const response = { success: true };
    await storeIdempotentResponse('newsletter-subscribe', idempotencyKey, response, email);
    return Response.json(response, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to process newsletter subscription.';
    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers }
    );
  }
}
