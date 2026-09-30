import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { releaseReminderAttempt } from '@/lib/reminder-send';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.release',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const delivery = await releaseReminderAttempt({
      campaignId: id,
      registrationId:
        typeof body?.registrationId === 'string' ? body.registrationId : '',
    });
    return adminJson({ success: true, delivery });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to release this send.';
    return adminJson(
      { error: message },
      { status: reminderErrorStatus(message) }
    );
  }
}
