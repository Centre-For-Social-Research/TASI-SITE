import { timingSafeEqual } from 'node:crypto';
import { processNextAvailablePassIssueEmailJob } from '@/lib/pass-issue-job-service';

// Pass-week safety net for the QR pass mail-out: keeps an admin-started QR
// job moving even if the admin console tab is closed. It only finishes QR
// pass jobs that already exist; it never creates one and never touches other
// email queues. Scheduled every 2 minutes during pass week (see vercel.json).
export const maxDuration = 300;

const QR_CHUNK_SIZE = 5;
// Stops starting new chunks before the next run is due, so runs rarely
// overlap. Overlap would still be safe: each item is claimed only once.
const TIME_BUDGET_MS = 90 * 1000;

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

export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const operator = {
    userId: 'system-pass-week-drain',
    primaryEmail: 'system-pass-week-drain@local',
  };
  const startedAt = Date.now();
  let chunksProcessed = 0;

  try {
    while (Date.now() - startedAt < TIME_BUDGET_MS) {
      const job = await processNextAvailablePassIssueEmailJob({
        operator,
        chunkSize: QR_CHUNK_SIZE,
      });
      if (!job) break;
      chunksProcessed += 1;
      // Nothing left to claim right now (the rest is mid-send elsewhere or
      // done): stop instead of polling the same job until the budget ends.
      const remaining =
        Number(job.queued_items || 0) + Number(job.retrying_items || 0);
      if (remaining === 0) break;
    }
  } catch (error) {
    console.error('Pass-week QR drain failed', error);
    return Response.json(
      { success: false, error: 'Drain failed', chunksProcessed },
      { status: 500 }
    );
  }

  return Response.json({ success: true, chunksProcessed });
}
