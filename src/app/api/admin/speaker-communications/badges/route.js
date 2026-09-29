import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { uploadSpeakerBadgeFile } from '@/lib/speaker-badge-upload';
import { UploadValidationError } from '@/lib/upload-validation';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { speakerErrorStatus } = speakerCommunicationsUtils;

// The panel uploads one file per request so each stays well under the
// hosting request-body limit, however many badges are selected.
export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-communications.upload',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const form = await request.formData();
    const result = await uploadSpeakerBadgeFile({
      edition: form.get('edition'),
      file: form.get('file'),
      speakerId: String(form.get('speakerId') || '').trim() || null,
      operator: authResult.operator,
    });
    return adminJson({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to upload badge.';
    const status =
      error instanceof UploadValidationError
        ? 400
        : speakerErrorStatus(message);
    return adminJson({ error: message }, { status });
  }
}
