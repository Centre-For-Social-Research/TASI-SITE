import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import { listRegistrationEmailJobs } from '@/lib/registration-ops-db';

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

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.email.jobs.list',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const jobs = await listRegistrationEmailJobs({ limit: 12 });
    return Response.json({
      success: true,
      jobs: jobs.map(serializeJob),
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
