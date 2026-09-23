import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { protectPublicPostRoute } from '@/lib/api-security';
import { storeIdempotentResponse } from '@/lib/api-idempotency';
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
import volunteerDedupe from '@/lib/volunteer-application-dedupe.cjs';

const { buildVolunteerAcknowledgementEmail } = applicationAcknowledgementEmail;
const {
  CLAIM_SCOPE,
  reserveVolunteerApplication,
  releaseVolunteerApplicationClaim,
} = volunteerDedupe;

function sanitizeShortText(
  value,
  maxLength,
  fieldName,
  { required = true } = {}
) {
  const sanitized = sanitizeMessage(value).replace(/\n+/g, ' ').trim();

  if (!sanitized) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return '';
  }

  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less.`);
  }

  return sanitized;
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'volunteer-application',
    {
      windowMs: 15 * 60 * 1000,
      maxRequests: 3,
    }
  );

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();

    const firstName = sanitizeShortText(body?.firstName, 80, 'First name');
    const lastName = sanitizeShortText(body?.lastName, 80, 'Last name');
    const email = sanitizeEmail(body?.email);
    const phone = sanitizeShortText(body?.phone, 40, 'Phone number');
    const organization = sanitizeShortText(
      body?.organization,
      160,
      'Organization',
      { required: false }
    );
    const city = sanitizeShortText(body?.city, 120, 'City');
    const availability = sanitizeShortText(
      body?.availability,
      160,
      'Availability'
    );
    const interestArea = sanitizeShortText(
      body?.interestArea,
      160,
      'Area of interest'
    );
    const motivation = sanitizeMessage(body?.motivation);

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    if (!motivation || motivation.length < 40) {
      return Response.json(
        { error: 'Volunteer motivation must be at least 40 characters.' },
        { status: 400 }
      );
    }

    if (motivation.length > 5000) {
      return Response.json(
        { error: 'Volunteer motivation must be 5000 characters or less.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const message = [
      'Volunteer application for TASI 2026',
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Organization: ${organization || 'Not provided'}`,
      `City: ${city}`,
      `Availability: ${availability}`,
      `Area of interest: ${interestArea}`,
      '',
      'Motivation:',
      motivation,
    ].join('\n');

    const reservation = await reserveVolunteerApplication(supabase, email);
    if (reservation.state === 'existing') {
      return Response.json(
        { success: true, alreadySubmitted: true },
        { headers: protection.headers }
      );
    }
    if (reservation.state === 'processing') {
      return Response.json(
        { error: 'This volunteer application is being processed.' },
        { status: 409, headers: protection.headers }
      );
    }

    const { error } = await supabase.from('contact_messages').insert({
      email,
      message,
      source: 'volunteer-application',
      created_at: new Date().toISOString(),
    });

    if (error) {
      await releaseVolunteerApplicationClaim(supabase, reservation.key);
      return Response.json({ error: error.message }, { status: 500 });
    }

    await storeIdempotentResponse(
      CLAIM_SCOPE,
      reservation.key,
      { success: true },
      email
    );

    try {
      await sendInboundNotificationEmail({
        subject: 'New volunteer application',
        text: message,
        replyTo: email,
      });
    } catch (emailError) {
      console.error(
        'Failed to send volunteer application notification email.',
        emailError
      );
    }

    try {
      const replyEmail = getApplicationCommsEmail();
      const acknowledgement = buildVolunteerAcknowledgementEmail({
        firstName,
        interestArea,
        availability,
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
        'Failed to send volunteer application acknowledgement email.',
        emailError
      );
    }

    return Response.json({ success: true }, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to submit volunteer application.';
    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers }
    );
  }
}
