import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { deriveJobProgress } from "@/lib/registration-job-utils.cjs";
import { processNextAvailablePassIssueEmailJob, processPassIssueEmailJob } from "@/lib/pass-issue-job-service";

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
  const authResult = await requireAuthorizedOperator({ route: "api.admin.passes.jobs.process" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const jobId = String(body?.jobId || "").trim();
    const processedJob = jobId
      ? await processPassIssueEmailJob({ jobId, operator: authResult.operator })
      : await processNextAvailablePassIssueEmailJob({ operator: authResult.operator });

    return Response.json({
      success: true,
      job: serializeJob(processedJob),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to process QR delivery jobs." },
      { status: 500 },
    );
  }
}
