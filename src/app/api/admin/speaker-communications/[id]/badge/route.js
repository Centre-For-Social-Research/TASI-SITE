import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson, ADMIN_NO_STORE_HEADERS } from '@/lib/admin-api-cache';
import { getSpeakerBadgeForSend } from '@/lib/speaker-communications-db';
import { downloadSpeakerBadgeImage } from '@/lib/speaker-badge-storage';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-communications.badge',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const { badgePath, badgeContentType } = await getSpeakerBadgeForSend(id);
    if (!badgePath) {
      return adminJson({ error: 'No badge uploaded yet.' }, { status: 404 });
    }
    const image = await downloadSpeakerBadgeImage(badgePath);
    return new Response(image, {
      headers: {
        ...ADMIN_NO_STORE_HEADERS,
        'Content-Type': badgeContentType || 'image/png',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load badge.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}
