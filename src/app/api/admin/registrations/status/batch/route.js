import { requireAdminOperator } from '@/lib/registration-auth';
import { applyRegistrationReviews } from '@/lib/registration-db';
import { scheduleRegistrationEmailJob } from '@/lib/registration-email-job-schedule';
import { MAX_JOB_RETRIES } from '@/lib/registration-job-utils.cjs';
import { normalizeRegistrationStatus } from '@/lib/registration-utils';
import { adminJson } from '@/lib/admin-api-cache';

const MAX_BATCH_SIZE = 100;

function normalizeUpdates(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      registrationId: String(item?.registrationId || '').trim(),
      expectedUpdatedAt: String(item?.expectedUpdatedAt || '').trim(),
    }))
    .filter((item) => item.registrationId)
    .slice(0, MAX_BATCH_SIZE);
}

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.registrations.status.batch',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const updates = normalizeUpdates(body?.updates);

    if (!updates.length) {
      return adminJson(
        { error: 'At least one registration update is required.' },
        { status: 400 }
      );
    }

    const result = await applyRegistrationReviews({
      updates,
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

    // A row that vanished counts as a conflict for the operator: refresh.
    const conflictIds = [...result.conflictIds, ...result.missingIds];
    scheduleRegistrationEmailJob(result.jobId);

    return adminJson(
      {
        success: true,
        updatedIds: result.registrations.map((registration) => registration.id),
        conflictIds,
        registrations: result.registrations,
        emailResult: {
          queued: Boolean(result.jobId),
          notRequired: result.emailCount === 0,
          jobId: result.jobId,
          totalItems: result.emailCount,
          error: null,
        },
      },
      { status: conflictIds.length ? 207 : 200 }
    );
  } catch (error) {
    console.error('Failed to update registrations.', error);
    return adminJson(
      { error: 'Unable to update registrations.' },
      { status: 500 }
    );
  }
}
