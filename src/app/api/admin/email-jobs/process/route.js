import { authorizeJobProcessorRequest } from '@/lib/job-processor-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import {
  processNextAvailableRegistrationEmailJob,
  processRegistrationEmailJob,
} from '@/lib/registration-email-job-service';

function serializeJob(job) {
  if (!job) {
    return null;
  }

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

export async function POST(request) {
  const authResult = await authorizeJobProcessorRequest(request, {
    route: 'api.admin.email.jobs.process',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const jobId = String(body?.jobId || '').trim();
    const chunkSize = Number(body?.chunkSize || 0) || undefined;
    const processedJob = jobId
      ? await processRegistrationEmailJob({
          jobId,
          operator: authResult.operator,
          chunkSize,
        })
      : await processNextAvailableRegistrationEmailJob({
          operator: authResult.operator,
          chunkSize,
        });

    return Response.json({
      success: true,
      job: serializeJob(processedJob),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to process registration email jobs.',
      },
      { status: 500 }
    );
  }
}
