import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { listSpotRegistrations } from '@/lib/spot-registration-db';
import { registerSpotAttendee } from '@/lib/spot-registration-service';

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.spot-registrations.list',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const params = new URL(request.url).searchParams;
    const result = await listSpotRegistrations({
      page: params.get('page'),
      search: params.get('search'),
      eventDay: params.get('eventDay'),
    });
    return adminJson({ success: true, ...result });
  } catch (error) {
    console.error('Unable to list spot registrations.', error);
    return adminJson(
      { error: 'Unable to load spot registrations.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.spot-registrations.create',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const registration = await registerSpotAttendee({
      input: await request.json(),
      operator: authResult.operator,
    });
    return adminJson({ success: true, registration }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to register attendee.';
    const status = /already checked in|advance registration/i.test(message)
      ? 409
      : /opens on|closes after/i.test(message)
        ? 403
        : /not configured/i.test(message)
          ? 503
          : /required|valid|characters/i.test(message)
            ? 400
            : 500;
    if (status === 500) console.error('Spot registration failed.', error);
    return adminJson({ error: message }, { status });
  }
}
