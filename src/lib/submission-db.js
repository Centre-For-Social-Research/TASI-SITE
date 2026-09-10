import { getSupabaseAdmin } from '@/lib/supabase-admin';
import submissionUtils from '@/lib/submission-utils.cjs';

const {
  SUBMISSION_TYPES,
  normalizeSubmissionType,
  normalizeContactSubmission,
  normalizeStructuredSubmission,
} = submissionUtils;

function safeSearch(value) {
  return String(value || '')
    .replace(/[%_,()'"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function applyFilters(query, { type, search, dateFrom, dateTo }) {
  const dateColumn =
    type === 'newsletter'
      ? 'subscribed_at'
      : type === 'confirmation'
        ? 'requested_at'
        : 'created_at';
  if (dateFrom) query = query.gte(dateColumn, `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte(dateColumn, `${dateTo}T23:59:59.999Z`);
  if (search) {
    const value = safeSearch(search);
    if (value) {
      query =
        type === 'newsletter' || type === 'confirmation'
          ? query.ilike('email', `%${value}%`)
          : query.or(`email.ilike.%${value}%,message.ilike.%${value}%`);
    }
  }
  return query;
}

export async function listSubmissions({
  type: rawType,
  page = 1,
  pageSize = 50,
  search = '',
  dateFrom = '',
  dateTo = '',
} = {}) {
  const type = normalizeSubmissionType(rawType);
  const definition = SUBMISSION_TYPES[type];
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const from = (safePage - 1) * safePageSize;
  const supabase = getSupabaseAdmin();
  let query;

  if (type === 'newsletter') {
    query = supabase
      .from(definition.table)
      .select('id,email,status,source,subscribed_at', { count: 'exact' });
  } else if (type === 'confirmation') {
    query = supabase
      .from(definition.table)
      .select('id,email,source,requested_at', { count: 'exact' });
  } else {
    query = supabase
      .from('contact_messages')
      .select('id,email,message,source,created_at', { count: 'exact' })
      .eq('source', definition.source);
  }

  const dateColumn =
    type === 'newsletter'
      ? 'subscribed_at'
      : type === 'confirmation'
        ? 'requested_at'
        : 'created_at';
  query = applyFilters(query, { type, search, dateFrom, dateTo })
    .order(dateColumn, { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + safePageSize - 1);
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  const normalize =
    type === 'newsletter' || type === 'confirmation'
      ? normalizeStructuredSubmission
      : normalizeContactSubmission;
  return {
    data: (data || []).map((row) => normalize(row, type)),
    meta: {
      type,
      page: safePage,
      pageSize: safePageSize,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / safePageSize)),
    },
  };
}

export async function listAllSubmissions(filters = {}) {
  const rows = [];
  let page = 1;
  while (rows.length < 10000) {
    const result = await listSubmissions({ ...filters, page, pageSize: 100 });
    rows.push(...result.data);
    if (page >= result.meta.totalPages) break;
    page += 1;
  }
  return rows;
}
