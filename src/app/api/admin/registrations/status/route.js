import { after } from 'next/server';
import { requireAdminOperator } from '@/lib/registration-auth';
import {
  StaleRegistrationUpdateError,
  updateRegistrationStatus,
} from '@/lib/registration-db';
import {
  processNextAvailableRegistrationEmailJob,
  queueRegistrationEmailJob,
} from '@/lib/registration-email-job-service';
import { normalizeRegistrationStatus } from '@/lib/registration-utils';
import { adminJson } from '@/lib/admin-api-cache';

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
      return adminJson(
        { error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    const updatedRegistration = await updateRegistrationStatus({
      registrationId,
      status: normalizeRegistrationStatus(body?.status),
      reviewNotes:
        typeof body?.reviewNotes === 'string'
          ? body.reviewNotes.trim()
          : undefined,
      speakerFlag:
        typeof body?.speakerFlag === 'boolean' ? body.speakerFlag : undefined,
      vipFlag: typeof body?.vipFlag === 'boolean' ? body.vipFlag : undefined,
      operator: authResult.operator,
      expectedUpdatedAt: String(body?.expectedUpdatedAt || '').trim(),
    });

    const templateType = updatedRegistration.status;
    let queueResult;
    try {
      queueResult = await queueRegistrationEmailJob({
        registrationId: updatedRegistration.id,
        templateType,
        operator: authResult.operator,
      });
    } catch (error) {
      console.error(
        'Status saved but registration email could not be queued.',
        error
      );
      queueResult = { queued: false, error: 'Email could not be queued.' };
    }

    if (queueResult.queued)
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

    return adminJson({
      success: true,
      registration: updatedRegistration,
      emailResult: {
        queued: Boolean(queueResult.queued),
        sent: false,
        error: queueResult.queued ? null : queueResult.error || null,
      },
    });
  } catch (error) {
    if (error instanceof StaleRegistrationUpdateError) {
      return adminJson(
        {
          error:
            'This registration was changed by another operator. Refresh the attendee and try again.',
          code: error.code,
        },
        { status: 409 }
      );
    }

    console.error('Failed to update registration status.', error);
    return adminJson(
      { error: 'Unable to update registration.' },
      { status: 500 }
    );
  }
}
