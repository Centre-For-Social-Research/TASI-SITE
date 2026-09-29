import { createHash } from 'node:crypto';
import { validateUploadedImageFile } from '@/lib/upload-validation';
import {
  createSpeakerBadge,
  findSpeakerBadgeByNameKey,
  getSpeakerBadgeForSend,
  recordSpeakerBadgeFile,
} from '@/lib/speaker-communications-db';
import {
  buildSpeakerBadgePath,
  removeSpeakerBadgeImages,
  uploadSpeakerBadgeImage,
} from '@/lib/speaker-badge-storage';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const {
  MAX_BADGE_BYTES,
  buildSpeakerNameKey,
  normalizeEdition,
  speakerNameFromFilename,
} = speakerCommunicationsUtils;

// One badge per call. The file name picks the speaker, unless the operator
// chose one explicitly; an unknown name adds a new speaker to the edition.
export async function uploadSpeakerBadgeFile({
  edition,
  file,
  speakerId,
  operator,
}) {
  const selectedEdition = normalizeEdition(edition);
  const image = await validateUploadedImageFile(file, {
    fieldName: 'Badge',
    maxBytes: MAX_BADGE_BYTES,
    minWidth: 300,
    minHeight: 300,
  });

  let speaker;
  let created = false;
  let previousPath = null;

  if (speakerId) {
    const current = await getSpeakerBadgeForSend(speakerId);
    speaker = current.speaker;
    previousPath = current.badgePath;
  } else {
    const name = speakerNameFromFilename(file.name);
    const nameKey = buildSpeakerNameKey(name);
    if (!nameKey) {
      throw new Error(
        'The file name must be the speaker name, for example "Yoel Roth.png".'
      );
    }
    speaker = await findSpeakerBadgeByNameKey({
      edition: selectedEdition,
      nameKey,
    });
    if (speaker) {
      previousPath = (await getSpeakerBadgeForSend(speaker.id)).badgePath;
    } else {
      speaker = await createSpeakerBadge({
        edition: selectedEdition,
        input: { name },
        operator,
      });
      created = true;
    }
  }

  if (speaker.status === 'sending') {
    throw new Error(
      `${speaker.name}'s badge cannot be replaced while a send is unresolved.`
    );
  }

  const badgePath = buildSpeakerBadgePath({
    edition: speaker.edition,
    id: speaker.id,
    extension: image.extension,
  });
  await uploadSpeakerBadgeImage({
    path: badgePath,
    buffer: image.buffer,
    contentType: image.contentType,
  });
  const updated = await recordSpeakerBadgeFile({
    id: speaker.id,
    badgePath,
    contentType: image.contentType,
    sha256: createHash('sha256').update(image.buffer).digest('hex'),
  });

  if (previousPath && previousPath !== badgePath) {
    try {
      await removeSpeakerBadgeImages([previousPath]);
    } catch (storageError) {
      console.error('Unable to remove a replaced badge file.', storageError);
    }
  }

  return {
    speaker: updated,
    created,
    replaced: Boolean(previousPath),
  };
}
