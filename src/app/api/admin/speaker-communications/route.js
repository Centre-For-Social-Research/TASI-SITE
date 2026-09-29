import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  createSpeakerBadge,
  listSpeakerBadges,
} from '@/lib/speaker-communications-db';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { SPEAKER_EDITIONS, speakerErrorStatus, summarizeSpeakerBadges } =
  speakerCommunicationsUtils;

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-communications.list',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const edition = new URL(request.url).searchParams.get('edition');
    const speakers = await listSpeakerBadges({ edition });
    return adminJson({
      success: true,
      speakers,
      summary: summarizeSpeakerBadges(speakers),
      editions: Object.keys(SPEAKER_EDITIONS),
    });
  } catch (error) {
    console.error('Unable to list speaker badges.', error);
    const message =
      error instanceof Error ? error.message : 'Unable to load speakers.';
    const status = speakerErrorStatus(message);
    return adminJson(
      { error: status === 500 ? 'Unable to load speakers.' : message },
      { status }
    );
  }
}

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-communications.create',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const speaker = await createSpeakerBadge({
      edition: body.edition,
      input: body,
      operator: authResult.operator,
    });
    return adminJson({ success: true, speaker }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to add speaker.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}
