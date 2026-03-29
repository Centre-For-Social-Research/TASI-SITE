import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { deriveJobProgress } from "@/lib/registration-job-utils.cjs";
import { createPassIssueEmailJob } from "@/lib/pass-issue-job-service";

export async function POST() {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.passes.issue-batch" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const job = await createPassIssueEmailJob({
      operator: authResult.operator,
    });

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
      total: job.total_items,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to issue QR passes." },
      { status: 500 }
    );
  }
}
