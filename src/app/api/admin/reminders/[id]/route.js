import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  deleteReminderCampaign,
  getReminderCampaign,
  updateReminderCampaign,
} from '@/lib/reminder-db';
import { removeReminderAttachmentFiles } from '@/lib/reminder-attachments';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

function failure(error, fallback) {
  const message = error instanceof Error ? error.message : fallback;
  return adminJson(
    { error: message },
    { status: reminderErrorStatus(message) }
  );
}

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.reminders.detail',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    return adminJson({ success: true, ...(await getReminderCampaign(id)) });
  } catch (error) {
    return failure(error, 'Unable to load reminder.');
  }
}

export async function PATCH(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.update',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const campaign = await updateReminderCampaign({
      id,
      input: body,
      operator: authResult.operator,
    });
    return adminJson({ success: true, campaign });
  } catch (error) {
    return failure(error, 'Unable to save reminder.');
  }
}

export async function DELETE(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.delete',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const attachments = await deleteReminderCampaign(id);
    try {
      await removeReminderAttachmentFiles(
        attachments.map((row) => row.storage_path)
      );
    } catch (storageError) {
      console.error('Removed reminder, but not its files.', storageError);
    }
    return adminJson({ success: true });
  } catch (error) {
    return failure(error, 'Unable to remove reminder.');
  }
}
