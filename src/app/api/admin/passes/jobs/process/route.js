import { authorizeJobProcessorRequest } from '@/lib/job-processor-auth';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import {
  processNextAvailablePassIssueEmailJob,
  processPassIssueEmailJob,
} from '@/lib/pass-issue-job-service';

// Each request handles a small chunk (about 5 s per pass), so this is a
// generous ceiling rather than an expected duration.
export const maxDuration = 300;

const MAX_CHUNK_SIZE = 20;

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
        sent: job.sent_items + job.skipped_items,
        failed: job.failed_items,
        retrying: job.retrying_items,
      },
    }),
  };
}

export async function POST(request) {
  const authResult = await authorizeJobProcessorRequest(request, {
    route: 'api.admin.passes.jobs.process',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const jobId = String(body?.jobId || '').trim();
    const requestedChunk = Number(body?.chunkSize || 0);
    const chunkSize =
      requestedChunk > 0
        ? Math.min(Math.floor(requestedChunk), MAX_CHUNK_SIZE)
        : undefined;
    const processedJob = jobId
      ? await processPassIssueEmailJob({
          jobId,
          operator: authResult.operator,
          chunkSize,
        })
      : await processNextAvailablePassIssueEmailJob({
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
            : 'Unable to process QR delivery jobs.',
      },
      { status: 500 }
    );
  }
}
