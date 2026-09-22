import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  createGuestInvitation,
  listGuestInvitations,
} from '@/lib/guest-invitation-db';

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.guest-invitations.list',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const params = new URL(request.url).searchParams;
    const result = await listGuestInvitations({
      page: params.get('page'),
      pageSize: params.get('pageSize'),
      search: params.get('search'),
      status: params.get('status'),
    });
    return adminJson({ success: true, ...result });
  } catch (error) {
    console.error('Unable to list guest invitations.', error);
    return adminJson(
      { error: 'Unable to load guest invitations.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.guest-invitations.create',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const invitation = await createGuestInvitation({
      input: body,
      operator: authResult.operator,
    });
    return adminJson({ success: true, invitation }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create guest invitation.';
    const status = /required|valid|characters|already exists/i.test(message)
      ? 400
      : 500;
    return adminJson({ error: message }, { status });
  }
}
