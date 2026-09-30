import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendReminder } from '@/lib/reminder-send';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.send',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const registrationId =
      typeof body?.registrationId === 'string' ? body.registrationId : '';
    if (!registrationId) {
      return adminJson({ error: 'A registrant is required.' }, { status: 400 });
    }
    const delivery = await sendReminder({
      campaignId: id,
      registrationId,
      operator: authResult.operator,
      expectedContentVersion: Number.isInteger(body?.contentVersion)
        ? body.contentVersion
        : null,
      resend: body?.resend === true,
    });
    return adminJson({ success: true, delivery });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send reminder.';
    const status = reminderErrorStatus(message);
    return adminJson(
      { error: message },
      { status: status === 500 ? 502 : status }
    );
  }
}
