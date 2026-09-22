import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { protectPublicPostRoute } from '@/lib/api-security';
import {
  getCompletedIdempotentResponse,
  getIdempotencyKey,
  storeIdempotentResponse,
} from '@/lib/api-idempotency';
import {
  isValidEmail,
  sanitizeEmail,
  sanitizeMessage,
} from '@/lib/input-sanitizers';
import {
  getApplicationCommsEmail,
  sendApplicantConfirmationEmail,
  sendInboundNotificationEmail,
} from '@/lib/resend';
import { getTasiEmailInlineAttachments } from '@/lib/qr-pass-email-assets';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';
import { after } from 'next/server';

const { buildExhibitionAcknowledgementEmail } = applicationAcknowledgementEmail;

function getExhibitionApplicantDetails(message) {
  const fields = Object.fromEntries(
    message
      .split('\n')
      .map((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) return null;
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim(),
        ];
      })
      .filter(Boolean)
  );
  const firstName = fields.Name?.split(/\s+/)[0] || 'there';

  return {
    firstName,
    company: fields.Company || 'your organisation',
  };
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(request, 'messages', {
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();
    const source = body?.source;
    const email = sanitizeEmail(body?.email);
    const message = sanitizeMessage(body?.message);
    const normalizedSource =
      typeof source === 'string' && source.trim()
        ? source.trim()
        : 'site-footer';

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return Response.json(
        { error: 'Message must be at least 10 characters.' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return Response.json(
        { error: 'Message must be 5000 characters or less.' },
        { status: 400 }
      );
    }

    const idempotencyKey = getIdempotencyKey(
      request,
      `${email}:${normalizedSource}:${message}`
    );
    const cached = await getCompletedIdempotentResponse(
      'contact-message',
      idempotencyKey
    );
    if (cached) {
      return Response.json(cached, { headers: protection.headers });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('contact_messages').insert({
      email,
      message,
      source: normalizedSource,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    after(async () => {
      try {
        await sendInboundNotificationEmail({
          subject: 'New TASI contact message',
          text: [
            'A new contact message was submitted on the website.',
            `Source: ${normalizedSource}`,
            `Email: ${email}`,
            '',
            'Message:',
            message,
          ].join('\n'),
          replyTo: email,
        });
      } catch (emailError) {
        console.error('Failed to send contact notification email.', emailError);
      }

      if (normalizedSource === 'exhibition-enquiry') {
        try {
          const replyEmail = getApplicationCommsEmail();
          const applicant = getExhibitionApplicantDetails(message);
          const acknowledgement = buildExhibitionAcknowledgementEmail({
            ...applicant,
            replyEmail,
          });
          await sendApplicantConfirmationEmail({
            to: email,
            subject: acknowledgement.subject,
            text: acknowledgement.text,
            html: acknowledgement.html,
            replyTo: replyEmail,
            attachments: await getTasiEmailInlineAttachments(),
          });
        } catch (emailError) {
          console.error(
            'Failed to send exhibition enquiry acknowledgement email.',
            emailError
          );
        }
      }
    });

    const response = { success: true };
    await storeIdempotentResponse(
      'contact-message',
      idempotencyKey,
      response,
      email
    );
    return Response.json(response, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit message.';
    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers }
    );
  }
}
