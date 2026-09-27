import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { adminJson } from '@/lib/admin-api-cache';

const PAGE_SIZE = 25;

export async function GET(request) {
  const auth = await requireAuthorizedOperator({
    route: 'api.admin.email.history.jobs',
  });
  if (!auth.ok) return auth.response;

  const params = new URL(request.url).searchParams;
  const type = params.get('type') === 'pass' ? 'pass' : 'registration';
  const status = params.get('status') || 'issues';
  const page = Math.min(
    Math.max(Number.parseInt(params.get('page') || '1', 10) || 1, 1),
    1000
  );
  const table =
    type === 'pass' ? 'pass_issue_email_jobs' : 'registration_email_jobs';
  if (
    !['all', 'issues', 'queued', 'processing', 'completed', 'failed'].includes(
      status
    )
  ) {
    return adminJson({ error: 'Invalid job status filter.' }, { status: 400 });
  }

  let query = getSupabaseAdmin()
    .from(table)
    .select(
      `id,status,${type === 'registration' ? 'template_type,' : ''}total_items,queued_items,processing_items,sent_items,failed_items,retrying_items,created_at,updated_at`,
      { count: 'exact' }
    );
  if (status === 'issues')
    query = query.or('failed_items.gt.0,retrying_items.gt.0');
  else if (status !== 'all') query = query.eq('status', status);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) return adminJson({ error: error.message }, { status: 500 });

  return adminJson({
    jobs: data || [],
    page,
    pageSize: PAGE_SIZE,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  });
}
