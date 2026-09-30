import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendReminder } from '@/lib/reminder-send';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.retry',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const delivery = await sendReminder({
      campaignId: id,
      registrationId:
        typeof body?.registrationId === 'string' ? body.registrationId : '',
      operator: authResult.operator,
      retry: true,
    });
    return adminJson({ success: true, delivery });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to retry reminder.';
    const status = reminderErrorStatus(message);
    return adminJson(
      { error: message },
      { status: status === 500 ? 409 : status }
    );
  }
}
