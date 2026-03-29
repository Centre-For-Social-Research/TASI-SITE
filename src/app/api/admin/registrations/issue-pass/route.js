import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { deriveJobProgress } from "@/lib/registration-job-utils.cjs";
import { createPassIssueEmailJob } from "@/lib/pass-issue-job-service";

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations.issue-pass" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || "").trim();

    if (!registrationId) {
      return Response.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const job = await createPassIssueEmailJob({
      registrationIds: [registrationId],
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
      created: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate and send the QR pass.";
    const status = message.includes("Only confirmed attendees can receive a QR pass.") ? 400 : 500;

    return Response.json({ error: message }, { status });
  }
}
