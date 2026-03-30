import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import { retryPassIssueEmailJob } from '@/lib/pass-issue-job-service';

export async function POST(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.passes.jobs.retry',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    const job = await retryPassIssueEmailJob(params.id);
    return Response.json({
      success: true,
      job: {
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
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to retry failed QR delivery items.',
      },
      { status: 500 }
    );
  }
}
