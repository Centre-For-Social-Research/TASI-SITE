const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function loadRoute(relativePath, dependencies) {
  const source = fs.readFileSync(relativePath, 'utf8');
  const { code } = transformSync(source, { format: 'cjs' });
  const testModule = { exports: {} };
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    require: (specifier) => dependencies[specifier],
    Buffer,
    URL,
    Response,
  });
  return testModule.exports;
}

function fakeDatabase(tables) {
  return {
    from(table) {
      const filters = [];
      let start = 0;
      let end = 0;
      const query = {
        select() {
          return query;
        },
        is(field) {
          filters.push((row) => row[field] == null);
          return query;
        },
        not(field) {
          filters.push((row) => row[field] != null);
          return query;
        },
        order() {
          return query;
        },
        range(from, to) {
          start = from;
          end = to;
          return query;
        },
        then(resolve) {
          const data = (tables[table] || [])
            .filter((row) => filters.every((filter) => filter(row)))
            .sort(
              (a, b) =>
                b.created_at.localeCompare(a.created_at) ||
                String(b.id).localeCompare(String(a.id))
            )
            .slice(start, end + 1);
          return Promise.resolve({ data, error: null }).then(resolve);
        },
      };
      return query;
    },
  };
}

test('audit cursor reaches older actions across all four sources without duplicates', async () => {
  const tables = {
    registration_status_history: Array.from({ length: 85 }, (_, index) => ({
      id: String(index),
      registration_id: `registration-${index}`,
      action_type: 'status_updated',
      actor_email: index % 2 ? 'operator@example.com' : null,
      created_at: new Date(
        Date.UTC(2026, 8, 28, 0, 0, 200 - index)
      ).toISOString(),
    })),
    registration_email_jobs: Array.from({ length: 30 }, (_, index) => ({
      id: `email-${index}`,
      status: 'failed',
      template_type: 'confirmed',
      failed_items: 1,
      created_by_email: null,
      created_at: new Date(
        Date.UTC(2026, 8, 28, 0, 0, 180 - index)
      ).toISOString(),
    })),
    pass_issue_email_jobs: [
      {
        id: 'pass-1',
        status: 'completed',
        created_by_email: null,
        created_at: '2026-09-27T00:00:00.000Z',
      },
    ],
    admin_email_overrides: [
      {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        added_by: 'operator@example.com',
        created_at: '2026-09-26T00:00:00.000Z',
      },
    ],
  };
  const route = loadRoute('src/app/api/admin/audit/route.js', {
    '@/lib/registration-auth': {
      requireAuthorizedOperator: async () => ({ ok: true }),
    },
    '@/lib/supabase-admin': { getSupabaseAdmin: () => fakeDatabase(tables) },
    '@/lib/admin-api-cache': {
      adminJson: (body, init) => Response.json(body, init),
    },
  });

  const found = [];
  let cursor = '';
  for (let page = 0; page < 5; page += 1) {
    const url = new URL('https://example.test/api/admin/audit?limit=30');
    if (cursor) url.searchParams.set('cursor', cursor);
    const response = await route.GET({ url: url.href });
    assert.equal(response.status, 200);
    const body = await response.json();
    found.push(...body.data.map((entry) => `${entry.kind}:${entry.ref}`));
    cursor = body.nextCursor || '';
    if (!body.hasMore) break;
  }
  assert.equal(found.length, 117);
  assert.equal(new Set(found).size, 117);
  assert.ok(found.includes('settings:admin@example.com'));
  assert.ok(found.includes('registration:registration-84'));
});

test('provider history reads email metadata and never sends messages', async () => {
  let sent = false;
  const route = loadRoute('src/app/api/admin/email-history/route.js', {
    '@/lib/registration-auth': {
      requireAuthorizedOperator: async () => ({ ok: true }),
    },
    '@/lib/resend': {
      getResendClient: () => ({
        emails: {
          list: async () => ({
            data: {
              has_more: false,
              data: [
                {
                  id: 'email-1',
                  to: ['person@example.com'],
                  from: 'site@example.com',
                  subject: 'Hello',
                  created_at: '2026-09-28T00:00:00Z',
                  last_event: 'delivered',
                },
              ],
            },
            error: null,
          }),
          send: () => {
            sent = true;
          },
        },
      }),
    },
    '@/lib/admin-api-cache': {
      adminJson: (body, init) => Response.json(body, init),
    },
  });
  const body = await (
    await route.GET({ url: 'https://example.test/api/admin/email-history' })
  ).json();
  assert.equal(body.emails[0].lastEvent, 'delivered');
  assert.equal(body.emails[0].subject, 'Hello');
  assert.equal(sent, false);
});

test('job archive includes retrying legacy attempts in its issues filter', async () => {
  let filter = '';
  const query = {
    select() {
      return query;
    },
    or(value) {
      filter = value;
      return query;
    },
    order() {
      return query;
    },
    range() {
      return Promise.resolve({
        data: [{ id: 'legacy-job', retrying_items: 1, failed_items: 0 }],
        count: 1,
        error: null,
      });
    },
  };
  const route = loadRoute('src/app/api/admin/email-history/jobs/route.js', {
    '@/lib/registration-auth': {
      requireAuthorizedOperator: async () => ({ ok: true }),
    },
    '@/lib/supabase-admin': { getSupabaseAdmin: () => ({ from: () => query }) },
    '@/lib/admin-api-cache': {
      adminJson: (body, init) => Response.json(body, init),
    },
  });
  const body = await (
    await route.GET({
      url: 'https://example.test/api/admin/email-history/jobs?status=issues',
    })
  ).json();
  assert.equal(filter, 'failed_items.gt.0,retrying_items.gt.0');
  assert.equal(body.jobs[0].id, 'legacy-job');
});
