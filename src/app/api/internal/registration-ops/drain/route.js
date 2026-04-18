import { processNextAvailablePassIssueEmailJob } from '@/lib/pass-issue-job-service';
import { processNextAvailableRegistrationEmailJob } from '@/lib/registration-email-job-service';

export const maxDuration = 60;

const MAX_DRAIN_PASSES = 6;

function isAuthorizedCronRequest(request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get('authorization');

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
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

  for (let attempt = 0; attempt < MAX_DRAIN_PASSES; attempt += 1) {
    const [qrJob, registrationEmailJob] = await Promise.all([
      processNextAvailablePassIssueEmailJob({ operator }),
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
