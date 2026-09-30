import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { listReminderRecipients } from '@/lib/reminder-db';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus, summarizeRecipients } = reminderUtils;

// Confirmed registrants, read live, with where each stands for this reminder.
export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.reminders.recipients',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const recipients = await listReminderRecipients(id);
    return adminJson({
      success: true,
      recipients,
      summary: summarizeRecipients(recipients),
    });
  } catch (error) {
    console.error('Unable to list reminder recipients.', error);
    const message =
      error instanceof Error ? error.message : 'Unable to load recipients.';
    const status = reminderErrorStatus(message);
    return adminJson(
      { error: status === 500 ? 'Unable to load recipients.' : message },
      { status }
    );
  }
}
