import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendSpeakerBadge } from '@/lib/speaker-badge-send';

export async function POST(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.speaker-communications.retry',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const speaker = await sendSpeakerBadge({
      id,
      operator: authResult.operator,
      retry: true,
    });
    return adminJson({ success: true, speaker });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to retry badge send.';
    return adminJson({ error: message }, { status: 409 });
  }
}
