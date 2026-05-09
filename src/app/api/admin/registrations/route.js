import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { listRegistrationQueue } from '@/lib/registration-ops-db';
import operatorSession from '@/lib/operator-session.cjs';
import { adminJson } from '@/lib/admin-api-cache';

const { logOperatorEvent } = operatorSession;

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.registrations',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    logOperatorEvent(
      'admin.registrations.fetch',
      'api.admin.registrations',
      authResult.operator
    );
    const { searchParams } = new URL(request.url);
    const data = await listRegistrationQueue({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '50',
      filters: {
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || 'all',
        category: searchParams.get('category') || 'all',
        priorityTier: searchParams.get('priorityTier') || 'all',
        country: searchParams.get('country') || '',
        city: searchParams.get('city') || '',
        organization: searchParams.get('organization') || '',
        speakerFlag: searchParams.get('speakerFlag') || '',
        lateConfirmation: searchParams.get('lateConfirmation') || '',
      },
    });

    return adminJson({
      success: true,
      ...data,
      operator: {
        email: authResult.operator.primaryEmail,
        role: authResult.operator.role,
      },
    });
  } catch (error) {
    console.error('[admin.registrations.fetch.error]', error);
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to fetch registrations.',
      },
      { status: 500 }
    );
  }
}
