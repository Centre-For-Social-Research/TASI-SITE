import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendGuestInvitation } from '@/lib/guest-invitation-send';

export async function POST(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.guest-invitations.retry',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const invitation = await sendGuestInvitation({
      id,
      operator: authResult.operator,
      retry: true,
    });
    return adminJson({ success: true, invitation });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to retry guest invitation.';
    return adminJson({ error: message }, { status: 409 });
  }
}
