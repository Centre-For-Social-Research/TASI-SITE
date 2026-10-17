import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson, ADMIN_NO_STORE_HEADERS } from '@/lib/admin-api-cache';
import {
  getSpeakerPhotoForSend,
  recordFeaturedPhoto,
} from '@/lib/speaker-photos-db';
import {
  buildFeaturedPhotoPath,
  downloadFeaturedPhoto,
  uploadFeaturedPhoto,
  validateFeaturedPhotoFile,
} from '@/lib/speaker-photos-storage';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

// The featured photo shown in this speaker's email.
export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-photos.photo',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const { featuredPhotoPath } = await getSpeakerPhotoForSend(id);
    if (!featuredPhotoPath) {
      return adminJson({ error: 'No photo chosen yet.' }, { status: 404 });
    }
    const image = await downloadFeaturedPhoto(featuredPhotoPath);
    return new Response(image, {
      headers: { ...ADMIN_NO_STORE_HEADERS, 'Content-Type': 'image/jpeg' },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load photo.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}

// Replace the featured photo with one the admin uploads.
export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-photos.photo.upload',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const [{ id }, form] = await Promise.all([
      context.params,
      request.formData(),
    ]);
    const { speaker } = await getSpeakerPhotoForSend(id);
    if (speaker.status === 'sending') {
      throw new Error(
        'This photo cannot be replaced while a send is unresolved.'
      );
    }
    const photo = await validateFeaturedPhotoFile(form.get('file'));
    const path = buildFeaturedPhotoPath({ edition: speaker.edition, id });
    await uploadFeaturedPhoto({ path, buffer: photo.buffer });
    const updated = await recordFeaturedPhoto({
      id,
      path,
      sha256: photo.sha256,
    });
    return adminJson({ success: true, speaker: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to upload photo.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}
