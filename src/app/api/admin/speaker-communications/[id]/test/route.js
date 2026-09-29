import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendSpeakerBadgeTest } from '@/lib/speaker-badge-send';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-communications.test',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await sendSpeakerBadgeTest({
      id,
      operator: authResult.operator,
      to: typeof body?.to === 'string' ? body.to : '',
    });
    return adminJson({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send test email.';
    const status = speakerErrorStatus(message);
    return adminJson(
      { error: message },
      { status: status === 500 ? 502 : status }
    );
  }
}
