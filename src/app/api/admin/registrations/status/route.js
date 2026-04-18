import { after } from 'next/server';
import { requireAdminOperator } from '@/lib/registration-auth';
import { updateRegistrationStatus } from '@/lib/registration-db';
import {
  processNextAvailableRegistrationEmailJob,
  queueRegistrationEmailJob,
} from '@/lib/registration-email-job-service';
import { normalizeRegistrationStatus } from '@/lib/registration-utils';

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.registrations.status',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || '').trim();

    if (!registrationId) {
      return Response.json(
        { error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    const updatedRegistration = await updateRegistrationStatus({
      registrationId,
      status: normalizeRegistrationStatus(body?.status),
      reviewNotes: String(body?.reviewNotes || '').trim(),
      speakerFlag: Boolean(body?.speakerFlag),
      vipFlag: Boolean(body?.vipFlag),
      operator: authResult.operator,
    });

    const templateType = updatedRegistration.status;
    const queueResult = await queueRegistrationEmailJob({
      registrationId: updatedRegistration.id,
      templateType,
      operator: authResult.operator,
    });

    after(async () => {
      try {
        await processNextAvailableRegistrationEmailJob({
          operator: {
            userId: 'system-after-trigger',
            primaryEmail: 'system-after-trigger@local',
          },
        });
      } catch (error) {
        console.error(
          'Failed to process registration email job in background:',
          error
        );
      }
    });

    return Response.json({
      success: true,
      registration: updatedRegistration,
      emailResult: {
        queued: Boolean(queueResult.queued),
        sent: false,
        error: queueResult.queued ? null : queueResult.error || null,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update registration.',
      },
      { status: 500 }
    );
  }
}
