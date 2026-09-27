import { after } from 'next/server';
import { requireAdminOperator } from '@/lib/registration-auth';
import {
  StaleRegistrationUpdateError,
  getRegistrationReviewSnapshots,
  updateRegistrationStatus,
} from '@/lib/registration-db';
import {
  processRegistrationEmailJob,
  queueRegistrationEmailBatchJob,
} from '@/lib/registration-email-job-service';
import { normalizeRegistrationStatus } from '@/lib/registration-utils';
import { adminJson } from '@/lib/admin-api-cache';
import reviewEmail from '@/lib/registration-review-email.cjs';

const { getReviewEmailTemplate } = reviewEmail;

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

    const status = normalizeRegistrationStatus(body?.status);
    const reviewNotes =
      typeof body?.reviewNotes === 'string'
        ? body.reviewNotes.trim()
        : undefined;
    const speakerFlag =
      typeof body?.speakerFlag === 'boolean' ? body.speakerFlag : undefined;
    const vipFlag =
      typeof body?.vipFlag === 'boolean' ? body.vipFlag : undefined;
    const updatedRegistrations = [];
    const conflictIds = [];

    const idCounts = new Map();
    for (const update of updates) {
      idCounts.set(
        update.registrationId,
        (idCounts.get(update.registrationId) || 0) + 1
      );
    }
    const snapshots = await getRegistrationReviewSnapshots(
      updates
        .filter(
          (update) =>
            update.expectedUpdatedAt &&
            idCounts.get(update.registrationId) === 1
        )
        .map((update) => update.registrationId)
    );

    for (const update of updates) {
      try {
        updatedRegistrations.push(
          await updateRegistrationStatus({
            registrationId: update.registrationId,
            status,
            reviewNotes,
            speakerFlag,
            vipFlag,
            operator: authResult.operator,
            expectedUpdatedAt: update.expectedUpdatedAt,
            existingRegistration: snapshots.get(update.registrationId),
          })
        );
      } catch (error) {
        if (error instanceof StaleRegistrationUpdateError) {
          conflictIds.push(update.registrationId);
        } else {
          throw error;
        }
      }
    }

    const emailRegistrations = updatedRegistrations.filter((registration) =>
      getReviewEmailTemplate(registration.previousStatus, registration.status)
    );
    const templateType = emailRegistrations.length ? status : null;
    let queueResult = { queued: false, notRequired: true };
    if (templateType) {
      try {
        queueResult = await queueRegistrationEmailBatchJob({
          registrations: emailRegistrations,
          templateType,
          operator: authResult.operator,
        });
      } catch (error) {
        console.error(
          'Statuses saved but registration emails could not be queued.',
          error
        );
        queueResult = { queued: false, error: 'Emails could not be queued.' };
      }
    }

    if (
      updatedRegistrations.length &&
      queueResult.queued &&
      queueResult.jobId
    ) {
      after(async () => {
        try {
          await processRegistrationEmailJob({
            jobId: queueResult.jobId,
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
    }

    return adminJson(
      {
        success: true,
        updatedIds: updatedRegistrations.map((registration) => registration.id),
        conflictIds,
        registrations: updatedRegistrations,
        emailResult: {
          queued: Boolean(queueResult.queued),
          notRequired: Boolean(queueResult.notRequired),
          jobId: queueResult.jobId || null,
          totalItems: queueResult.totalItems || 0,
          error: queueResult.queued ? null : queueResult.error || null,
        },
      },
      { status: conflictIds.length ? 207 : 200 }
    );
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update registrations.',
      },
      { status: 500 }
    );
  }
}
