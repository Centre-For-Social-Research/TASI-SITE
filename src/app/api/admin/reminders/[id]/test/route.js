import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendReminderTest } from '@/lib/reminder-send';
import reminderUtils from '@/lib/reminder-utils.cjs';

const { reminderErrorStatus } = reminderUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.reminders.test',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await sendReminderTest({
      campaignId: id,
      operator: authResult.operator,
      to: typeof body?.to === 'string' ? body.to : '',
    });
    return adminJson({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send test email.';
    const status = reminderErrorStatus(message);
    return adminJson(
      { error: message },
      { status: status === 500 ? 502 : status }
    );
  }
}
