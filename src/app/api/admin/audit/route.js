import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { adminJson } from '@/lib/admin-api-cache';

const SOURCES = [
  {
    table: 'registration_status_history',
    actor: 'actor_email',
    select:
      'id, registration_id, previous_status, next_status, action_type, notes, actor_email, created_at',
  },
  {
    table: 'registration_email_jobs',
    actor: 'created_by_email',
    select:
      'id, status, template_type, total_items, sent_items, failed_items, created_by_email, created_at',
  },
  {
    table: 'pass_issue_email_jobs',
    actor: 'created_by_email',
    select:
      'id, status, total_items, sent_items, failed_items, created_by_email, created_at',
  },
  {
    table: 'admin_email_overrides',
    actor: 'added_by',
    select: 'id, email, role, added_by, created_at',
  },
];

function readCursor(value) {
  if (!value) return [0, 0, 0, 0];
  const offsets = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  if (
    !Array.isArray(offsets) ||
    offsets.length !== SOURCES.length ||
    offsets.some((offset) => !Number.isSafeInteger(offset) || offset < 0)
  ) {
    throw new Error('Invalid audit cursor.');
  }
  return offsets;
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.audit',
  });
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1),
    100
  );
  const actorFilter = searchParams.get('actor') || 'all';
  if (!['all', 'system', 'operator'].includes(actorFilter)) {
    return adminJson({ error: 'Invalid actor filter.' }, { status: 400 });
  }
  let offsets;
  try {
    offsets = readCursor(searchParams.get('cursor'));
  } catch {
    return adminJson({ error: 'Invalid audit cursor.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const results = await Promise.all(
    SOURCES.map((source, index) => {
      let query = supabase.from(source.table).select(source.select);
      if (actorFilter === 'system') query = query.is(source.actor, null);
      if (actorFilter === 'operator')
        query = query.not(source.actor, 'is', null);
      return query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(offsets[index], offsets[index] + limit);
    })
  );
  const failure = results.find((result) => result.error);
  if (failure)
    return adminJson({ error: failure.error.message }, { status: 500 });
  const [
    statusHistoryResult,
    emailJobsResult,
    passJobsResult,
    emailOverridesResult,
  ] = results;

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

  if (!statusHistoryResult.error) {
    for (const r of statusHistoryResult.data || []) {
      const actor = r.actor_email || 'system';
      let action;
      if (r.previous_status && r.next_status) {
        action = `registration ${r.registration_id?.slice(0, 8)} · ${r.previous_status} → ${r.next_status}`;
      } else if (r.action_type === 'submitted') {
        action = `registration ${r.registration_id?.slice(0, 8)} submitted`;
      } else {
        action = `registration ${r.registration_id?.slice(0, 8)} · ${r.action_type || 'updated'}`;
      }
      entries.push({
        actor,
        action,
        ts: r.created_at,
        kind: 'registration',
        ref: r.registration_id,
        source: 0,
        rowId: r.id,
      });
    }
  }

  if (!emailJobsResult.error) {
    for (const j of emailJobsResult.data || []) {
      const actor = j.created_by_email || 'system';
      const when = j.created_at;
      const template = j.template_type || 'email';
      let action;
      if (j.status === 'completed') {
        action = `email job · ${template} · ${j.sent_items || 0}/${j.total_items || 0} sent`;
      } else if (j.status === 'failed') {
        action = `email job · ${template} · failed (${j.failed_items || 0} errors)`;
      } else {
        action = `email job · ${template} · ${j.status}`;
      }
      entries.push({
        actor,
        action,
        ts: when,
        kind: 'email_job',
        ref: j.id,
        source: 1,
        rowId: j.id,
      });
    }
  }

  if (!passJobsResult.error) {
    for (const j of passJobsResult.data || []) {
      const actor = j.created_by_email || 'system';
      const when = j.created_at;
      let action;
      if (j.status === 'completed') {
        action = `pass job · ${j.sent_items || 0}/${j.total_items || 0} issued`;
      } else if (j.status === 'failed') {
        action = `pass job · failed (${j.failed_items || 0} errors)`;
      } else {
        action = `pass job · ${j.status} · ${j.total_items || 0} queued`;
      }
      entries.push({
        actor,
        action,
        ts: when,
        kind: 'pass_job',
        ref: j.id,
        source: 2,
        rowId: j.id,
      });
    }
  }

  if (!emailOverridesResult.error) {
    for (const o of emailOverridesResult.data || []) {
      const actor = o.added_by || 'system';
      const action = `added ${o.email} as ${o.role}`;
      entries.push({
        actor,
        action,
        ts: o.created_at,
        kind: 'settings',
        ref: o.email,
        source: 3,
        rowId: o.id,
      });
    }
  }

  entries.sort(
    (a, b) =>
      b.ts.localeCompare(a.ts) ||
      b.source - a.source ||
      String(b.rowId).localeCompare(String(a.rowId))
  );
  const page = entries.slice(0, limit);
  const consumed = SOURCES.map(
    (_, source) => page.filter((entry) => entry.source === source).length
  );
  const nextOffsets = offsets.map(
    (offset, source) => offset + consumed[source]
  );
  const hasMore = results.some(
    (result, source) => (result.data || []).length > consumed[source]
  );
  return adminJson({
    ok: true,
    data: page.map(({ source, rowId, ...entry }) => ({
      ...entry,
      ago: relTime(entry.ts),
    })),
    hasMore,
    nextCursor: hasMore
      ? Buffer.from(JSON.stringify(nextOffsets)).toString('base64url')
      : null,
  });
}
