import { timingSafeEqual } from 'node:crypto';
import { processNextAvailablePassIssueEmailJob } from '@/lib/pass-issue-job-service';
import { processNextAvailableRegistrationEmailJob } from '@/lib/registration-email-job-service';

// A QR pass takes about 5 s, so a 20-pass chunk could outlast a 60 s limit
// and leave items stuck mid-send. QR chunks are kept small and the run stops
// starting new work well before the limit.
export const maxDuration = 300;

const MAX_DRAIN_PASSES = 6;
const QR_CHUNK_SIZE = 5;
const TIME_BUDGET_MS = 200 * 1000;

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

function buildSystemOperator() {
  return {
    userId: 'system-cron-processor',
    primaryEmail: 'system-cron-processor@local',
  };
}

export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const operator = buildSystemOperator();
  const results = {
    qrJobsProcessed: 0,
    registrationEmailJobsProcessed: 0,
  };

  const startedAt = Date.now();

  for (let attempt = 0; attempt < MAX_DRAIN_PASSES; attempt += 1) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;

    const [qrJob, registrationEmailJob] = await Promise.all([
      processNextAvailablePassIssueEmailJob({
        operator,
        chunkSize: QR_CHUNK_SIZE,
      }),
      processNextAvailableRegistrationEmailJob({ operator }),
    ]);

    if (qrJob) {
      results.qrJobsProcessed += 1;
    }

    if (registrationEmailJob) {
      results.registrationEmailJobsProcessed += 1;
    }

    if (!qrJob && !registrationEmailJob) {
      break;
    }
  }

  return Response.json({
    success: true,
    ...results,
  });
}
