import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendSpeakerPhotos } from '@/lib/speaker-photos-send';

export async function POST(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-photos.retry',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const speaker = await sendSpeakerPhotos({
      id,
      operator: authResult.operator,
      retry: true,
    });
    return adminJson({ success: true, speaker });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to retry photo send.';
    return adminJson({ error: message }, { status: 409 });
  }
}
