import { requireAdminOperator } from '@/lib/registration-auth';
import {
  createNotification,
  getRegistrationById,
  markNotificationDelivery,
} from '@/lib/registration-db';
import { deriveJobProgress } from '@/lib/registration-job-utils.cjs';
import { deliverRegistrationEmail } from '@/lib/registration-email';
import { createPassIssueEmailJob } from '@/lib/pass-issue-job-service';

const ALLOWED_TEMPLATES = new Set([
  'submission_received',
  'confirmed',
  'waitlisted',
  'rejected',
  'qr_pass_issued',
]);

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.registrations.resend',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || '').trim();
    const templateType = String(body?.templateType || '').trim();

    if (!registrationId || !ALLOWED_TEMPLATES.has(templateType)) {
      return Response.json(
        { error: 'Registration ID and valid template type are required.' },
        { status: 400 }
      );
    }

    if (templateType === 'qr_pass_issued') {
      const job = await createPassIssueEmailJob({
        registrationIds: [registrationId],
        resendExisting: true,
        operator: authResult.operator,
      });

      return Response.json({
        success: true,
        result: {
          queued: true,
          sent: false,
        },
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
    }

    const registration = await getRegistrationById(registrationId);
    const notificationId = await createNotification({
      registrationId: registration.id,
      templateType,
      recipientEmail: registration.email,
      actorClerkId: authResult.operator.userId,
      actorEmail: authResult.operator.primaryEmail,
    });
    const result = await deliverRegistrationEmail({
      registration,
      templateType,
      notificationId,
      db: { markNotificationDelivery },
    });

    if (result.sent) {
      await markNotificationDelivery(notificationId, {
        delivery_status: 'resent',
      });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to resend email.',
      },
      { status: 500 }
    );
  }
}
