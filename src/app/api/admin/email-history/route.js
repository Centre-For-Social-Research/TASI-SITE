import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getResendClient } from '@/lib/resend';
import { adminJson } from '@/lib/admin-api-cache';
import emailHistory from '@/lib/email-history.cjs';
import pagination from '@/lib/admin-pagination.cjs';

const { STATUS_GROUPS, countByStatus, filterEmails, mergeNewest } =
  emailHistory;
const { clampPage, totalPagesFor } = pagination;

export const maxDuration = 60;

const PAGE_SIZE = 25;
const RESEND_PAGE = 100;
// A full pass over the history at most this often; in between, only the
// newest emails are re-checked so new sends and fresh bounces still show.
const FULL_SCAN_MS = 5 * 60 * 1000;
const NEWEST_PAGES = 2;
const MAX_PAGES = 80;
const SCAN_BUDGET_MS = 40 * 1000;
// Resend allows a few requests a second; stay comfortably under it.
const REQUEST_GAP_MS = 550;

const VALID_STATUSES = new Set([
  'all',
  'problems',
  ...STATUS_GROUPS.map((group) => group.key),
]);

// Shared by requests on the same server instance.
const cache = {
  emails: [],
  fullScanAt: 0,
  complete: false,
  inFlight: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toEmail(email) {
  return {
    id: email.id,
    to: email.to,
    subject: email.subject,
    createdAt: email.created_at,
    lastEvent: email.last_event,
  };
}

async function listPage(resend, after) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await resend.emails.list({
      limit: RESEND_PAGE,
      ...(after ? { after } : {}),
    });
    if (!error) return data;
    const rateLimited =
      error.statusCode === 429 || /rate limit/i.test(error.message || '');
    if (!rateLimited) throw new Error(error.message);
    await sleep(1200);
  }
  throw new Error('Resend is rate limiting history requests. Try again.');
}

async function scan(resend, { maxPages }) {
  const startedAt = Date.now();
  const emails = [];
  let after = '';
  let complete = false;

  for (let page = 0; page < maxPages; page += 1) {
    if (page > 0) await sleep(REQUEST_GAP_MS);
    const data = await listPage(resend, after);
    const batch = (data?.data || []).map(toEmail);
    emails.push(...batch);
    if (!data?.has_more || !batch.length) {
      complete = true;
      break;
    }
    after = batch.at(-1).id;
    if (Date.now() - startedAt > SCAN_BUDGET_MS) break;
  }

  return { emails, complete };
}

async function loadHistory(resend, { force }) {
  if (cache.inFlight) return cache.inFlight;

  const stale = Date.now() - cache.fullScanAt > FULL_SCAN_MS;
  cache.inFlight = (async () => {
    if (force || stale || !cache.emails.length) {
      const result = await scan(resend, { maxPages: MAX_PAGES });
      cache.emails = result.emails;
      cache.complete = result.complete;
      cache.fullScanAt = Date.now();
    } else {
      const result = await scan(resend, { maxPages: NEWEST_PAGES });
      cache.emails = mergeNewest(cache.emails, result.emails);
    }
  })();

  try {
    await cache.inFlight;
  } finally {
    cache.inFlight = null;
  }
}

export async function GET(request) {
  const auth = await requireAuthorizedOperator({
    route: 'api.admin.email.history',
  });
  if (!auth.ok) return auth.response;

  const resend = getResendClient();
  if (!resend) {
    return adminJson({ error: 'Resend is not configured.' }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const status = params.get('status') || 'all';
  if (!VALID_STATUSES.has(status)) {
    return adminJson({ error: 'Unknown status filter.' }, { status: 400 });
  }
  const query = (params.get('q') || '').trim().slice(0, 120);

  try {
    await loadHistory(resend, { force: params.get('refresh') === '1' });

    const matching = filterEmails(cache.emails, { status, query });
    const totalPages = totalPagesFor(matching.length, PAGE_SIZE);
    const page = clampPage(params.get('page'), totalPages);
    const start = (page - 1) * PAGE_SIZE;

    return adminJson({
      emails: matching.slice(start, start + PAGE_SIZE),
      counts: countByStatus(cache.emails),
      page,
      pageSize: PAGE_SIZE,
      total: matching.length,
      totalPages,
      checkedAt: new Date(cache.fullScanAt).toISOString(),
      complete: cache.complete,
    });
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load email history.',
      },
      { status: 502 }
    );
  }
}
