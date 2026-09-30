import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { addReminderAttachment } from '@/lib/reminder-attachments';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { normalizeAttachmentRow, reminderErrorStatus } = reminderUtils;

// One file per request keeps each upload under the hosting body limit.
export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.attachments.add',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const [{ id }, form] = await Promise.all([
      context.params,
      request.formData(),
    ]);
    const row = await addReminderAttachment({
      campaignId: id,
      file: form.get('file'),
      operator: authResult.operator,
    });
    return adminJson(
      { success: true, attachment: normalizeAttachmentRow(row) },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to add attachment.';
    return adminJson(
      { error: message },
      { status: reminderErrorStatus(message) }
    );
  }
}
