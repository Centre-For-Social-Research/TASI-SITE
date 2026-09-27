import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { adminJson } from '@/lib/admin-api-cache';

const PAGE_SIZE = 25;

export async function GET(request, context) {
  const auth = await requireAuthorizedOperator({
    route: 'api.admin.email.history.job.items',
  });
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const params = new URL(request.url).searchParams;
  const type = params.get('type') === 'pass' ? 'pass' : 'registration';
  const status = params.get('status') || 'all';
  const page = Math.min(
    Math.max(Number.parseInt(params.get('page') || '1', 10) || 1, 1),
    1000
  );
  if (
    ![
      'all',
      'issues',
      'queued',
      'processing',
      'retrying',
      'failed',
      'sent',
      'skipped',
    ].includes(status)
  ) {
    return adminJson({ error: 'Invalid item status filter.' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const jobTable =
    type === 'pass' ? 'pass_issue_email_jobs' : 'registration_email_jobs';
  const itemTable =
    type === 'pass'
      ? 'pass_issue_email_job_items'
      : 'registration_email_job_items';
  const jobResult = await supabase
    .from(jobTable)
    .select('id,status,total_items,sent_items,failed_items,created_at')
    .eq('id', id)
    .maybeSingle();
  if (jobResult.error)
    return adminJson({ error: jobResult.error.message }, { status: 500 });
  if (!jobResult.data)
    return adminJson({ error: 'Email job not found.' }, { status: 404 });

  let query = supabase
    .from(itemTable)
    .select(
      `id,registration_id,status,attempt_count,max_attempts,failure_reason,last_attempt_at,created_at,registration:event_registrations (registration_code,first_name,last_name,email)`,
      { count: 'exact' }
    )
    .eq('job_id', id);
  if (status === 'issues') query = query.in('status', ['failed', 'retrying']);
  else if (status !== 'all') query = query.eq('status', status);
  const { data, count, error } = await query
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) return adminJson({ error: error.message }, { status: 500 });
  return adminJson({
    job: jobResult.data,
    items: data || [],
    page,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  });
}
