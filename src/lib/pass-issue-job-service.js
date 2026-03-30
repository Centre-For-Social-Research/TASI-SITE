import {
  createNotification,
  getRegistrationById,
  issuePassForRegistration,
  markNotificationDelivery,
} from '@/lib/registration-db';
import { buildPassAttachment } from '@/lib/registration-pass';
import { uploadPassQrImage } from '@/lib/registration-pass-assets';
import { deliverRegistrationEmail } from '@/lib/registration-email';
import {
  DEFAULT_JOB_CHUNK_SIZE,
  MAX_JOB_RETRIES,
  buildJobSelection,
  isQueueInfrastructureUnavailable,
  shouldSkipJobItem,
} from '@/lib/registration-job-utils.cjs';
import {
  claimPassIssueEmailJobItems,
  createPassIssueEmailJobRecord,
  getPassIssueEmailJob,
  insertPassIssueEmailJobItems,
  listPassIssueEmailJobItems,
  listPassIssueEmailJobs,
  listRegistrationsForPassJob,
  refreshPassIssueEmailJob,
  retryFailedPassIssueEmailJobItems,
  updatePassIssueEmailJobItem,
} from '@/lib/registration-ops-db';

async function sendPassEmail({ item, registration, operator, resendExisting }) {
  if (registration.status !== 'confirmed') {
    return updatePassIssueEmailJobItem(item.id, {
      status: 'skipped',
      failure_reason: 'Registration is no longer confirmed.',
    });
  }

  if (shouldSkipJobItem({ resendExisting, registration })) {
    return updatePassIssueEmailJobItem(item.id, {
      status: 'skipped',
      failure_reason: 'QR pass already issued and resend mode is disabled.',
    });
  }

  const issued = await issuePassForRegistration({
    registrationId: registration.id,
    operator,
  });

  const notificationId = await createNotification({
    registrationId: registration.id,
    templateType: 'qr_pass_issued',
    recipientEmail: registration.email,
    actorClerkId: operator.userId,
    actorEmail: operator.primaryEmail,
  });

  const attachment = await buildPassAttachment({
    token: issued.token,
    registration: {
      ...issued.registration,
      qr_token: issued.token,
    },
  });

  const qrImage = await uploadPassQrImage({
    passId: issued.passId,
    registrationId: issued.registration.id,
    token: issued.token,
  });

  const emailResult = await deliverRegistrationEmail({
    registration: issued.registration,
    templateType: 'qr_pass_issued',
    notificationId,
    db: { markNotificationDelivery },
    qrImageUrl: qrImage.publicUrl,
    pdfAttachment: {
      filename: attachment.filename,
      buffer: attachment.pdfBuffer,
    },
  });

  if (!emailResult.sent) {
    throw new Error(emailResult.error || 'Unable to deliver QR pass email.');
  }

  return updatePassIssueEmailJobItem(item.id, {
    status: 'sent',
    notification_id: notificationId,
    pass_id: issued.passId,
    token: issued.token,
    sent_at: new Date().toISOString(),
    failure_reason: null,
  });
}

async function deliverPassEmailDirect({
  registration,
  operator,
  resendExisting,
}) {
  if (registration.status !== 'confirmed') {
    return {
      skipped: true,
      reason: 'Registration is no longer confirmed.',
    };
  }

  if (shouldSkipJobItem({ resendExisting, registration })) {
    return {
      skipped: true,
      reason: 'QR pass already issued and resend mode is disabled.',
    };
  }

  const issued = await issuePassForRegistration({
    registrationId: registration.id,
    operator,
  });

  const notificationId = await createNotification({
    registrationId: registration.id,
    templateType: 'qr_pass_issued',
    recipientEmail: registration.email,
    actorClerkId: operator.userId,
    actorEmail: operator.primaryEmail,
  });

  const attachment = await buildPassAttachment({
    token: issued.token,
    registration: {
      ...issued.registration,
      qr_token: issued.token,
    },
  });

  const qrImage = await uploadPassQrImage({
    passId: issued.passId,
    registrationId: issued.registration.id,
    token: issued.token,
  });

  const emailResult = await deliverRegistrationEmail({
    registration: issued.registration,
    templateType: 'qr_pass_issued',
    notificationId,
    db: { markNotificationDelivery },
    qrImageUrl: qrImage.publicUrl,
    pdfAttachment: {
      filename: attachment.filename,
      buffer: attachment.pdfBuffer,
    },
  });

  if (!emailResult.sent) {
    throw new Error(emailResult.error || 'Unable to deliver QR pass email.');
  }

  return {
    skipped: false,
    issued,
    emailResult,
  };
}

export async function createPassIssueEmailJob({
  filters = {},
  registrationIds = [],
  resendExisting = false,
  operator,
}) {
  const selection = buildJobSelection({
    filters,
    registrationIds,
    resendExisting,
  });

  const registrations = await listRegistrationsForPassJob({
    filters: selection.filters,
    registrationIds: selection.registrationIds,
  });

  try {
    const job = await createPassIssueEmailJobRecord({
      selection,
      operator,
    });

    await insertPassIssueEmailJobItems({
      jobId: job.id,
      registrations,
      maxAttempts: MAX_JOB_RETRIES,
    });

    return refreshPassIssueEmailJob(job.id);
  } catch (error) {
    if (!isQueueInfrastructureUnavailable(error)) {
      throw error;
    }

    const results = [];
    for (const registration of registrations) {
      try {
        const directResult = await deliverPassEmailDirect({
          registration: await getRegistrationById(registration.id),
          operator,
          resendExisting: selection.resendExisting,
        });

        results.push({
          registrationId: registration.id,
          status: directResult.skipped ? 'skipped' : 'sent',
          failure_reason: directResult.skipped ? directResult.reason : null,
        });
      } catch (directError) {
        results.push({
          registrationId: registration.id,
          status: 'failed',
          failure_reason:
            directError instanceof Error
              ? directError.message
              : 'Unable to deliver QR pass email.',
        });
      }
    }

    const sentCount = results.filter(
      (result) => result.status === 'sent'
    ).length;
    const skippedCount = results.filter(
      (result) => result.status === 'skipped'
    ).length;
    const failedCount = results.filter(
      (result) => result.status === 'failed'
    ).length;

    return {
      id: 'legacy-direct-send',
      status: failedCount > 0 ? 'failed' : 'completed',
      selection_mode: selection.selectionMode,
      filters: selection.filters,
      resend_existing: selection.resendExisting,
      total_items: results.length,
      queued_items: 0,
      processing_items: 0,
      sent_items: sentCount,
      skipped_items: skippedCount,
      failed_items: failedCount,
      retrying_items: 0,
      created_by_clerk_id: operator.userId,
      created_by_email: operator.primaryEmail,
      completed_at: new Date().toISOString(),
      last_processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      legacyDirect: true,
      results,
    };
  }
}

export async function processPassIssueEmailJob({
  jobId,
  operator,
  chunkSize = DEFAULT_JOB_CHUNK_SIZE,
}) {
  const job = await getPassIssueEmailJob(jobId);
  const items = await claimPassIssueEmailJobItems({
    jobId,
    limit: chunkSize,
  });

  for (const item of items) {
    try {
      const registration = await getRegistrationById(item.registration_id);
      await sendPassEmail({
        item,
        registration,
        operator,
        resendExisting: job.resend_existing,
      });
    } catch (error) {
      const attemptsRemaining =
        Number(item.max_attempts || MAX_JOB_RETRIES) -
        Number(item.attempt_count || 0);
      const nextStatus = attemptsRemaining > 0 ? 'retrying' : 'failed';

      await updatePassIssueEmailJobItem(item.id, {
        status: nextStatus,
        failure_reason:
          error instanceof Error
            ? error.message
            : 'Unable to send QR pass email.',
      });
    }
  }

  return refreshPassIssueEmailJob(jobId);
}

export async function processNextAvailablePassIssueEmailJob({
  operator,
  chunkSize,
} = {}) {
  const jobs = await listPassIssueEmailJobs({ limit: 20 });
  const activeJob = jobs.find((job) =>
    ['queued', 'processing'].includes(job.status)
  );

  if (!activeJob) {
    return null;
  }

  return processPassIssueEmailJob({
    jobId: activeJob.id,
    operator,
    chunkSize,
  });
}

export async function getPassIssueEmailJobDetail(jobId) {
  const job = await getPassIssueEmailJob(jobId);
  const items = await listPassIssueEmailJobItems({ jobId, limit: 50 });

  return {
    job,
    items,
  };
}

export async function retryPassIssueEmailJob(jobId) {
  await retryFailedPassIssueEmailJobItems(jobId);
  return refreshPassIssueEmailJob(jobId);
}
