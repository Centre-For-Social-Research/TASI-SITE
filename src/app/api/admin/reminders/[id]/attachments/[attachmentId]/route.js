import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson, ADMIN_NO_STORE_HEADERS } from '@/lib/admin-api-cache';
import { getReminderAttachmentRow } from '@/lib/reminder-db';
import {
  downloadReminderAttachment,
  removeReminderAttachment,
} from '@/lib/reminder-attachments';
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
    route: 'api.admin.reminders.attachments.download',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id, attachmentId } = await context.params;
    const row = await getReminderAttachmentRow({
      campaignId: id,
      attachmentId,
    });
    const file = await downloadReminderAttachment(row.storage_path);
    // Headers must be ASCII, so non-Latin names (e.g. Hindi) go in filename*.
    const asciiName = row.filename.replace(/[^\x20-\x7e]|"/g, '_');
    return new Response(file, {
      headers: {
        ...ADMIN_NO_STORE_HEADERS,
        'Content-Type': row.content_type,
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(row.filename)}`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return failure(error, 'Unable to load attachment.');
  }
}

export async function DELETE(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.attachments.remove',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id, attachmentId } = await context.params;
    await removeReminderAttachment({
      campaignId: id,
      attachmentId,
      operator: authResult.operator,
    });
    return adminJson({ success: true });
  } catch (error) {
    return failure(error, 'Unable to remove attachment.');
  }
}
