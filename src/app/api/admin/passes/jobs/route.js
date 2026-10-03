import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  deriveJobProgress,
  isQueueInfrastructureUnavailable,
} from '@/lib/registration-job-utils.cjs';
import { after } from 'next/server';
import {
  createPassIssueEmailJob,
  processNextAvailablePassIssueEmailJob,
} from '@/lib/pass-issue-job-service';
import {
  AUTOMATIC_EMAIL_JOB_CUTOFF,
  getPassCoverage,
  listPassIssueEmailJobCounters,
  listPassIssueEmailJobsPage,
} from '@/lib/registration-ops-db';
import jobView from '@/lib/admin-job-view.cjs';
import pagination from '@/lib/admin-pagination.cjs';

const { summarizeJobs } = jobView;
const { clampPage } = pagination;

const PAGE_SIZE = 15;

export const maxDuration = 300;

const AFTER_CHUNK_SIZE = 5;
const AFTER_TIME_BUDGET_MS = 120 * 1000;

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

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.passes.jobs.list',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const page = clampPage(
      new URL(request.url).searchParams.get('page'),
      Number.MAX_SAFE_INTEGER
    );
    const scope = {
      createdAfter: AUTOMATIC_EMAIL_JOB_CUTOFF,
      includeCompletedBefore: true,
    };
    const [{ jobs, total }, counters, coverage] = await Promise.all([
      listPassIssueEmailJobsPage({ ...scope, page, pageSize: PAGE_SIZE }),
      listPassIssueEmailJobCounters(scope),
      // Coverage is a nice-to-have; the job list still loads without it.
      getPassCoverage().catch(() => null),
    ]);
    return Response.json({
      success: true,
      jobs: jobs.map(serializeJob),
      page,
      pageSize: PAGE_SIZE,
      total,
      summary: summarizeJobs(counters),
      coverage,
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
        // Small chunks inside a time budget, so this background kick-off ends
        // well before the function limit instead of being cut off mid-send.
        // The admin tab and the pass-week cron carry on from here.
        const startedAt = Date.now();
        while (Date.now() - startedAt < AFTER_TIME_BUDGET_MS) {
          const processed = await processNextAvailablePassIssueEmailJob({
            operator: bgOperator,
            chunkSize: AFTER_CHUNK_SIZE,
          });
          if (!processed) break;
          const remaining =
            Number(processed.queued_items || 0) +
            Number(processed.retrying_items || 0);
          if (remaining === 0) break;
        }
      } catch (error) {
        console.error(
          'Failed to process QR delivery jobs in background:',
          error
        );
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
