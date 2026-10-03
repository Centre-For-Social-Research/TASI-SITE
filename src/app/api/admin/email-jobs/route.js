import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import {
  AUTOMATIC_EMAIL_JOB_CUTOFF,
  listRegistrationEmailJobCounters,
  listRegistrationEmailJobsPage,
} from '@/lib/registration-ops-db';
import jobView from '@/lib/admin-job-view.cjs';
import pagination from '@/lib/admin-pagination.cjs';

const { summarizeJobs } = jobView;
const { clampPage } = pagination;

const PAGE_SIZE = 15;

function serializeJob(job) {
  return {
    ...job,
    progress: deriveJobProgress({
      status: job.status,
      totals: {
        total: job.total_items,
        queued: job.queued_items,
        processing: job.processing_items,
        sent: job.sent_items,
        failed: job.failed_items,
        retrying: job.retrying_items,
      },
    }),
  };
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.email.jobs.list',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const page = clampPage(
      new URL(request.url).searchParams.get('page'),
      Number.MAX_SAFE_INTEGER
    );
    const scope = { createdAfter: AUTOMATIC_EMAIL_JOB_CUTOFF };
    const [{ jobs, total }, counters] = await Promise.all([
      listRegistrationEmailJobsPage({ ...scope, page, pageSize: PAGE_SIZE }),
      listRegistrationEmailJobCounters(scope),
    ]);
    return Response.json({
      success: true,
      jobs: jobs.map(serializeJob),
      page,
      pageSize: PAGE_SIZE,
      total,
      summary: summarizeJobs(counters),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load registration email jobs.',
      },
      { status: 500 }
    );
  }
}
