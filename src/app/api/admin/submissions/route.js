import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { listSubmissions } from '@/lib/submission-db';

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.submissions',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const params = new URL(request.url).searchParams;
    const result = await listSubmissions({
      type: params.get('type'),
      page: params.get('page'),
      pageSize: params.get('pageSize'),
      search: params.get('search'),
      dateFrom: params.get('dateFrom'),
      dateTo: params.get('dateTo'),
    });
    return adminJson({ ok: true, ...result });
  } catch (error) {
    console.error('Unable to list admin submissions.', error);
    return adminJson(
      { ok: false, error: 'Unable to load submissions.' },
      { status: 500 }
    );
  }
}
