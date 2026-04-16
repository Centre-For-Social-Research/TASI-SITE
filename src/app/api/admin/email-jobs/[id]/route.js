import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import { getRegistrationEmailJobDetail } from '@/lib/registration-email-job-service';

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.email.jobs.detail',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    const detail = await getRegistrationEmailJobDetail(params.id);
    return Response.json({
      success: true,
      job: {
        ...detail.job,
        progress: deriveJobProgress({
          status: detail.job.status,
          totals: {
            total: detail.job.total_items,
            queued: detail.job.queued_items,
            processing: detail.job.processing_items,
            sent: detail.job.sent_items,
            failed: detail.job.failed_items,
            retrying: detail.job.retrying_items,
          },
        }),
      },
      items: detail.items,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load registration email job.',
      },
      { status: 500 }
    );
  }
}
