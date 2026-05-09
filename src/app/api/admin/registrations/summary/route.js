import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getRegistrationQueueSummary } from '@/lib/registration-ops-db';
import { adminJson } from '@/lib/admin-api-cache';

function filtersFromSearchParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    priorityTier: searchParams.get('priorityTier') || 'all',
    country: searchParams.get('country') || '',
    city: searchParams.get('city') || '',
    organization: searchParams.get('organization') || '',
    speakerFlag: searchParams.get('speakerFlag') || '',
    lateConfirmation: searchParams.get('lateConfirmation') || '',
  };
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.registrations.summary',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const summary = await getRegistrationQueueSummary(
      filtersFromSearchParams(searchParams)
    );

    return adminJson({
      success: true,
      summary,
      operator: {
        email: authResult.operator.primaryEmail,
        role: authResult.operator.role,
      },
    });
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to fetch registration summary.',
      },
      { status: 500 }
    );
  }
}
