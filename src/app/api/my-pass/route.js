import { after } from 'next/server';
import { protectPublicPostRoute } from '@/lib/api-security';
import { isValidEmail, sanitizeEmail } from '@/lib/input-sanitizers';
import passLookupWindow from '@/lib/pass-lookup-window.cjs';
import {
  processPassLookupJob,
  requestPassLookup,
} from '@/lib/pass-lookup-service';

const { isPassLookupOpen } = passLookupWindow;

// Same reply whether or not the email is registered, so the page can't be
// used to check who is attending.
const NEUTRAL_MESSAGE =
  'If this email has a confirmed TASI 2026 registration, we have sent your QR pass to it. Please check your inbox and spam folder.';

export async function POST(request) {
  if (!isPassLookupOpen()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  // Generous per-IP limit: delegates at the venue share one Wi-Fi address.
  // The real per-person limit is enforced per registration in the service.
  const protection = await protectPublicPostRoute(request, 'my-pass', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 60,
  });
  if (!protection.ok) {
    return protection.response;
  }

  let email;
  try {
    const body = await request.json();
    email = sanitizeEmail(body?.email);
  } catch {
    email = '';
  }

  if (!isValidEmail(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400, headers: protection.headers }
    );
  }

  try {
    const result = await requestPassLookup(email);

    if (result.queued) {
      console.info('Pass lookup queued', {
        registrationId: result.registrationId,
        jobId: result.jobId,
      });

      after(async () => {
        try {
          await processPassLookupJob(result.jobId);
        } catch (error) {
          // The pass-lookup cron retries anything left queued.
          console.error('Pass lookup: immediate send failed', error);
        }
      });
    }
  } catch (error) {
    console.error('Pass lookup request failed', error);
    return Response.json(
      {
        error:
          'We could not process this right now. Please try again in a few minutes or visit the registration desk.',
      },
      { status: 503, headers: protection.headers }
    );
  }

  return Response.json(
    { ok: true, message: NEUTRAL_MESSAGE },
    { headers: protection.headers }
  );
}
