import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  getGuestInvitationDetail,
  updateGuestInvitation,
} from '@/lib/guest-invitation-db';

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.guest-invitations.detail',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const detail = await getGuestInvitationDetail(id);
    return adminJson({ success: true, ...detail });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to load guest invitation.';
    const status = /not found/i.test(message) ? 404 : 500;
    return adminJson({ error: message }, { status });
  }
}

export async function PATCH(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.guest-invitations.update',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const invitation = await updateGuestInvitation({ id, input: body });
    return adminJson({ success: true, invitation });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update guest invitation.';
    const status = /required|valid|characters|already exists/i.test(message)
      ? 400
      : /not found/i.test(message)
        ? 404
        : /already being sent/i.test(message)
          ? 409
          : 500;
    return adminJson({ error: message }, { status });
  }
}
