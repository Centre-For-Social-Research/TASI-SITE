import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  deriveJobProgress,
  isQueueInfrastructureUnavailable,
} from '@/lib/registration-job-utils.cjs';
import { after } from 'next/server';
import { createPassIssueEmailJob, processNextAvailablePassIssueEmailJob } from '@/lib/pass-issue-job-service';
import { listPassIssueEmailJobs } from '@/lib/registration-ops-db';

function serializeJob(job) {
  return {
    ...job,
    progress: deriveJobProgress({
      status: job.status,
      totals: {
        total: job.total_items,
        queued: job.queued_items,
        processing: job.processing_items,
        sent: job.sent_items + job.skipped_items,
        failed: job.failed_items,
        retrying: job.retrying_items,
      },
    }),
  };
}

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.passes.jobs.list',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const jobs = await listPassIssueEmailJobs({ limit: 8 });
    return Response.json({
      success: true,
      jobs: jobs.map(serializeJob),
    });
  } catch (error) {
    if (isQueueInfrastructureUnavailable(error)) {
      return Response.json({
        success: true,
        jobs: [],
        queueUnavailable: true,
      });
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load QR delivery jobs.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.passes.jobs.create',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const job = await createPassIssueEmailJob({
      filters: body?.filters || {},
      registrationIds: Array.isArray(body?.registrationIds)
        ? body.registrationIds
        : [],
      resendExisting: Boolean(body?.resendExisting),
      operator: authResult.operator,
    });

    after(async () => {
      try {
        const bgOperator = {
          userId: 'system-after-trigger',
          primaryEmail: 'system-after-trigger@local',
        };
        for (let i = 0; i < 6; i++) {
          const processed = await processNextAvailablePassIssueEmailJob({ operator: bgOperator });
          if (!processed) break;
        }
      } catch (error) {
        console.error('Failed to process QR delivery jobs in background:', error);
      }
    });

    return Response.json({
      success: true,
      job: serializeJob(job),
      message: job.legacyDirect
        ? `Queue tables are not deployed yet, so ${job.sent_items} attendees were processed immediately${job.failed_items ? ` and ${job.failed_items} failed` : ''}.`
        : `Job queued for ${job.total_items} attendees.`,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to queue QR delivery job.',
      },
      { status: 500 }
    );
  }
}
