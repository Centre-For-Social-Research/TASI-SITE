import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({ route: 'api.admin.audit' });
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
  const actorFilter = searchParams.get('actor') || 'all';

  const supabase = getSupabaseAdmin();

  const [statusHistoryResult, emailJobsResult, passJobsResult, paymentAuditResult, emailOverridesResult] =
    await Promise.allSettled([
      supabase
        .from('registration_status_history')
        .select('id, registration_id, previous_status, next_status, action_type, notes, actor_email, created_at')
        .order('created_at', { ascending: false })
        .limit(60),

      supabase
        .from('registration_email_jobs')
        .select('id, status, template_type, total_items, sent_items, failed_items, created_by_email, completed_at, created_at')
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('pass_issue_email_jobs')
        .select('id, status, total_items, sent_items, failed_items, created_by_email, completed_at, created_at')
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('festival_payment_audit_log')
        .select('id, event_type, payment_stream, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('admin_email_overrides')
        .select('email, role, added_by, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  const entries = [];
  const now = Date.now();

  function relTime(ts) {
    if (!ts) return null;
    const diff = now - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  if (statusHistoryResult.status === 'fulfilled' && !statusHistoryResult.value.error) {
    for (const r of statusHistoryResult.value.data || []) {
      const actor = r.actor_email || 'system';
      let action;
      if (r.previous_status && r.next_status) {
        action = `registration ${r.registration_id?.slice(0, 8)} · ${r.previous_status} → ${r.next_status}`;
      } else if (r.action_type === 'submitted') {
        action = `registration ${r.registration_id?.slice(0, 8)} submitted`;
      } else {
        action = `registration ${r.registration_id?.slice(0, 8)} · ${r.action_type || 'updated'}`;
      }
      entries.push({ actor, action, ts: r.created_at, kind: 'registration', ref: r.registration_id });
    }
  }

  if (emailJobsResult.status === 'fulfilled' && !emailJobsResult.value.error) {
    for (const j of emailJobsResult.value.data || []) {
      const actor = j.created_by_email || 'system';
      const when = j.completed_at || j.created_at;
      const template = j.template_type || 'email';
      let action;
      if (j.status === 'completed') {
        action = `email job · ${template} · ${j.sent_items || 0}/${j.total_items || 0} sent`;
      } else if (j.status === 'failed') {
        action = `email job · ${template} · failed (${j.failed_items || 0} errors)`;
      } else {
        action = `email job · ${template} · ${j.status}`;
      }
      entries.push({ actor, action, ts: when, kind: 'email_job', ref: j.id });
    }
  }

  if (passJobsResult.status === 'fulfilled' && !passJobsResult.value.error) {
    for (const j of passJobsResult.value.data || []) {
      const actor = j.created_by_email || 'system';
      const when = j.completed_at || j.created_at;
      let action;
      if (j.status === 'completed') {
        action = `pass job · ${j.sent_items || 0}/${j.total_items || 0} issued`;
      } else if (j.status === 'failed') {
        action = `pass job · failed (${j.failed_items || 0} errors)`;
      } else {
        action = `pass job · ${j.status} · ${j.total_items || 0} queued`;
      }
      entries.push({ actor, action, ts: when, kind: 'pass_job', ref: j.id });
    }
  }

  if (paymentAuditResult.status === 'fulfilled' && !paymentAuditResult.value.error) {
    for (const p of paymentAuditResult.value.data || []) {
      const stream = p.payment_stream ? ` · ${p.payment_stream}` : '';
      const action = `razorpay · ${p.event_type || 'event'}${stream}`;
      entries.push({ actor: 'system', action, ts: p.created_at, kind: 'payment', ref: p.id });
    }
  }

  if (emailOverridesResult.status === 'fulfilled' && !emailOverridesResult.value.error) {
    for (const o of emailOverridesResult.value.data || []) {
      const actor = o.added_by || 'system';
      const action = `added ${o.email} as ${o.role}`;
      entries.push({ actor, action, ts: o.created_at, kind: 'settings', ref: o.email });
    }
  }

  entries.sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0));

  const filtered =
    actorFilter === 'all' ? entries
    : actorFilter === 'system' ? entries.filter((e) => e.actor === 'system')
    : entries.filter((e) => e.actor !== 'system');

  const result = filtered.slice(0, limit).map((e) => ({ ...e, ago: relTime(e.ts) }));

  return Response.json({ ok: true, data: result, total: result.length });
}
