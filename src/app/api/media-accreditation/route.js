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
  sanitizePhone,
  sanitizeShortText,
} from '@/lib/input-sanitizers';
import {
  MEDIA_COVERAGE_DAYS,
  MEDIA_OUTLET_TYPES,
} from '@/data/media-accreditation';
import {
  buildApplicantConfirmationEmail,
  buildTeamNotificationEmail,
} from '@/lib/media-accreditation-email';
import {
  sendApplicantConfirmationEmail,
  sendInboundNotificationEmail,
} from '@/lib/resend';
import { after } from 'next/server';

// Digits only, so "+91 98765 43210" and "098765-43210" both pass.
function hasEnoughDigits(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

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

    const name = sanitizeShortText(body?.name, {
      maxLength: 120,
      fieldName: 'Full name',
    });
    const publication = sanitizeShortText(body?.publication, {
      maxLength: 160,
      fieldName: 'Publication',
    });
    const outletType = sanitizeShortText(body?.outletType, {
      maxLength: 60,
      fieldName: 'Outlet type',
    });
    const email = sanitizeEmail(body?.email);
    const phone = sanitizePhone(body?.phone);
    const coverageDays = sanitizeShortText(body?.coverageDays, {
      maxLength: 60,
      fieldName: 'Coverage days',
      required: false,
    });

    if (!MEDIA_OUTLET_TYPES.includes(outletType)) {
      return Response.json(
        { error: 'Select a valid outlet type.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (coverageDays && !MEDIA_COVERAGE_DAYS.includes(coverageDays)) {
      return Response.json(
        { error: 'Select a valid coverage option.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Valid business email is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (!hasEnoughDigits(phone)) {
      return Response.json(
        { error: 'Valid contact number is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    const application = {
      name,
      publication,
      outletType,
      email,
      phone,
      coverageDays,
    };

    const supabase = getSupabaseAdmin();
    const teamEmail = buildTeamNotificationEmail(application);
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
      message: teamEmail.text,
      source: 'media-accreditation',
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500, headers: protection.headers }
      );
    }

    after(async () => {
      try {
        await sendInboundNotificationEmail({
          subject: teamEmail.subject,
          text: teamEmail.text,
          replyTo: email,
        });
      } catch (emailError) {
        console.error(
          'Failed to send media accreditation notification email.',
          emailError
        );
      }

      try {
        const applicantEmail = buildApplicantConfirmationEmail(application);
        await sendApplicantConfirmationEmail({
          to: email,
          subject: applicantEmail.subject,
          text: applicantEmail.text,
        });
      } catch (emailError) {
        console.error(
          'Failed to send media accreditation confirmation email.',
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
      { status: 400, headers: protection.headers }
    );
  }
}
