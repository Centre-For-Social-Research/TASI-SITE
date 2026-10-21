import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  getSpeakerPhotoDetail,
  updateSpeakerPhoto,
} from '@/lib/speaker-photos-db';
import { getResendClient } from '@/lib/resend';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

// Resend's latest event (delivered, bounced, opened) for the last accepted
// send. A failed lookup only hides the status.
async function getLastDeliveryEvent(providerMessageId) {
  const resend = getResendClient();
  if (!resend || !providerMessageId) return null;
  try {
    const { data } = await resend.emails.get(providerMessageId);
    return data?.last_event || null;
  } catch {
    return null;
  }
}

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.speaker-photos.detail',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const detail = await getSpeakerPhotoDetail(id);
    const lastEvent = await getLastDeliveryEvent(
      detail.speaker.lastProviderMessageId
    );
    return adminJson({ success: true, ...detail, lastEvent });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load speaker.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}

export async function PATCH(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-photos.update',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const speaker = await updateSpeakerPhoto({ id, input: body });
    return adminJson({ success: true, speaker });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update speaker.';
    return adminJson(
      { error: message },
      { status: speakerErrorStatus(message) }
    );
  }
}
