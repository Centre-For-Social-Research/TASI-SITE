import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendSpeakerBadge } from '@/lib/speaker-badge-send';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-communications.send',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const speaker = await sendSpeakerBadge({
      id,
      operator: authResult.operator,
      resend: body?.resend === true,
    });
    return adminJson({ success: true, speaker });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send badge.';
    const status = speakerErrorStatus(message);
    return adminJson(
      { error: message },
      { status: status === 500 ? 502 : status }
    );
  }
}
