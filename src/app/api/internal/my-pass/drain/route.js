import { timingSafeEqual } from 'node:crypto';
import passLookupWindow from '@/lib/pass-lookup-window.cjs';
import { drainPassLookupJobs } from '@/lib/pass-lookup-service';

export const maxDuration = 60;

const { isPassLookupDrainActive } = passLookupWindow;

function isAuthorizedCronRequest(request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get('authorization') || '';

  if (!cronSecret) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const provided = Buffer.from(authorization);

  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

// Safety net for "Find my pass": sends only jobs created by the public page
// that are still queued or waiting for a retry. Admin bulk sends are never
// touched. Outside the festival window it does nothing.
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!isPassLookupDrainActive()) {
    return Response.json({ success: true, skipped: 'outside_window' });
  }

  try {
    const results = await drainPassLookupJobs();
    return Response.json({ success: true, results });
  } catch (error) {
    console.error('Pass lookup drain failed', error);
    return Response.json(
      { success: false, error: 'Drain failed' },
      { status: 500 }
    );
  }
}
