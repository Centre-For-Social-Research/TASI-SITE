import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { listSpeakerPhotos } from '@/lib/speaker-photos-db';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';
import speakerPhotosUtils from '@/lib/speaker-photos-utils.cjs';

const { SPEAKER_EDITIONS, speakerErrorStatus } = speakerCommunicationsUtils;
const { summarizeSpeakerPhotos } = speakerPhotosUtils;

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-photos.list',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const edition = new URL(request.url).searchParams.get('edition');
    const speakers = await listSpeakerPhotos({ edition });
    return adminJson({
      success: true,
      speakers,
      summary: summarizeSpeakerPhotos(speakers),
      editions: Object.keys(SPEAKER_EDITIONS),
    });
  } catch (error) {
    console.error('Unable to list speaker photos.', error);
    const message =
      error instanceof Error ? error.message : 'Unable to load speakers.';
    const status = speakerErrorStatus(message);
    return adminJson(
      { error: status === 500 ? 'Unable to load speakers.' : message },
      { status }
    );
  }
}
