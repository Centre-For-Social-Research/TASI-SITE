import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { previewSpeakerBadgeEmail } from '@/lib/speaker-badge-send';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-communications.preview',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const email = await previewSpeakerBadgeEmail(id);
    return adminJson({ success: true, email });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to preview email.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}
