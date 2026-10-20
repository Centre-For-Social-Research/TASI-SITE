import { requireAdminOperator } from '@/lib/registration-auth';
import { applyRegistrationReviews } from '@/lib/registration-db';
import { scheduleRegistrationEmailJob } from '@/lib/registration-email-job-schedule';
import { MAX_JOB_RETRIES } from '@/lib/registration-job-utils.cjs';
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

    const result = await applyRegistrationReviews({
      updates: [
        {
          registrationId,
          expectedUpdatedAt: String(body?.expectedUpdatedAt || '').trim(),
        },
      ],
      status: normalizeRegistrationStatus(body?.status),
      reviewNotes:
        typeof body?.reviewNotes === 'string'
          ? body.reviewNotes.trim()
          : undefined,
      speakerFlag:
        typeof body?.speakerFlag === 'boolean' ? body.speakerFlag : undefined,
      vipFlag: typeof body?.vipFlag === 'boolean' ? body.vipFlag : undefined,
      operator: authResult.operator,
      maxEmailAttempts: MAX_JOB_RETRIES,
    });

    if (result.missingIds.length) {
      return adminJson({ error: 'Registration not found.' }, { status: 404 });
    }

    if (result.conflictIds.length) {
      return adminJson(
        {
          error:
            'This registration was changed by another operator. Refresh the attendee and try again.',
          code: 'STALE_REGISTRATION_UPDATE',
        },
        { status: 409 }
      );
    }

    scheduleRegistrationEmailJob(result.jobId);

    return adminJson({
      success: true,
      registration: result.registrations[0],
      emailResult: {
        queued: Boolean(result.jobId),
        notRequired: result.emailCount === 0,
        sent: false,
        error: null,
      },
    });
  } catch (error) {
    console.error('Failed to update registration status.', error);
    return adminJson(
      { error: 'Unable to update registration.' },
      { status: 500 }
    );
  }
}
