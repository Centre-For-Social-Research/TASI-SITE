const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  createMemoryCache,
  applyRegistrationListCache,
  readRegistrationListCache,
  applyRegistrationDetailCache,
  readRegistrationDetailCache,
  invalidateRegistrationCaches,
} = require('../src/lib/admin-registration-cache.cjs');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('admin registration memory cache honors ttl, force bypass callers, and invalidation', () => {
  let now = 1_000;
  const getNow = () => now;
  const listCache = createMemoryCache({ ttlMs: 60_000, getNow });
  const detailCache = createMemoryCache({ ttlMs: 120_000, getNow });

  applyRegistrationListCache(listCache, 'status=pending', {
    registrations: [{ id: 'r1' }],
  });
  applyRegistrationDetailCache(detailCache, 'r1', {
    registration: { id: 'r1' },
  });

  assert.deepEqual(readRegistrationListCache(listCache, 'status=pending'), {
    registrations: [{ id: 'r1' }],
  });
  assert.deepEqual(readRegistrationDetailCache(detailCache, 'r1'), {
    registration: { id: 'r1' },
  });

  now += 61_000;
  assert.equal(readRegistrationListCache(listCache, 'status=pending'), null);
  assert.deepEqual(readRegistrationDetailCache(detailCache, 'r1'), {
    registration: { id: 'r1' },
  });

  invalidateRegistrationCaches({
    listCache,
    detailCache,
    registrationIds: ['r1'],
  });

  assert.equal(readRegistrationDetailCache(detailCache, 'r1'), null);
});

test('admin registration client keeps attendee cache in memory only', () => {
  const source = readSource(
    'src/components/admin/registrations-admin-panel.jsx'
  );

  assert.match(source, /createMemoryCache/);
  assert.match(source, /readRegistrationListCache/);
  assert.match(source, /readRegistrationDetailCache/);
  assert.doesNotMatch(source, /localStorage/);
  assert.doesNotMatch(source, /sessionStorage/);
});

test('admin shell and dashboard use summary endpoint instead of heavy list polling', () => {
  const shell = readSource('src/components/admin/admin-shell.jsx');
  const dashboard = readSource('src/components/admin/admin-dashboard.jsx');

  assert.match(shell, /\/api\/admin\/registrations\/summary/);
  assert.match(dashboard, /\/api\/admin\/registrations\/summary/);
  assert.doesNotMatch(shell, /\/api\/admin\/registrations\?pageSize=1/);
  assert.doesNotMatch(dashboard, /\/api\/admin\/registrations\?pageSize=1/);
  assert.match(dashboard, /useAdminShellData/);
});

test('admin registration APIs use no-store private cache headers', () => {
  const cacheHelper = readSource('src/lib/admin-api-cache.js');
  const listRoute = readSource('src/app/api/admin/registrations/route.js');
  const detailRoute = readSource(
    'src/app/api/admin/registrations/[id]/route.js'
  );
  const summaryRoute = readSource(
    'src/app/api/admin/registrations/summary/route.js'
  );
  const batchRoute = readSource(
    'src/app/api/admin/registrations/status/batch/route.js'
  );

  assert.match(cacheHelper, /no-store, max-age=0/);
  for (const source of [listRoute, detailRoute, summaryRoute, batchRoute]) {
    assert.match(source, /adminJson/);
  }
});

test('batch status route replaces client-side request storms and supports stale conflicts', () => {
  const panel = readSource(
    'src/components/admin/registrations-admin-panel.jsx'
  );
  const batchRoute = readSource(
    'src/app/api/admin/registrations/status/batch/route.js'
  );
  const statusRoute = readSource(
    'src/app/api/admin/registrations/status/route.js'
  );
  const registrationDb = readSource('src/lib/registration-db.js');

  assert.match(panel, /\/api\/admin\/registrations\/status\/batch/);
  assert.doesNotMatch(
    panel,
    /selectedIds\.map\(\(registrationId\) =>\s*updateRegistrationStatus/s
  );
  assert.match(batchRoute, /conflictIds/);
  assert.match(batchRoute, /queueRegistrationEmailBatchJob/);
  assert.match(statusRoute, /status: 409/);
  assert.match(registrationDb, /expectedUpdatedAt/);
  assert.match(registrationDb, /StaleRegistrationUpdateError/);
});

test('registration schema adds safe summary function and search indexes', () => {
  const schema = readSource('supabase/schema.sql');

  assert.match(schema, /create extension if not exists pg_trgm/);
  assert.match(schema, /get_registration_queue_summary/);
  assert.match(schema, /security invoker/);
  assert.doesNotMatch(schema, /security definer/i);
  assert.match(
    schema,
    /revoke all on function public\.get_registration_queue_summary/
  );
  assert.match(
    schema,
    /grant execute on function public\.get_registration_queue_summary[\s\S]+to service_role/
  );
  assert.match(schema, /gin_trgm_ops/);
  assert.match(schema, /idx_event_registrations_country/);
  assert.match(schema, /idx_event_registrations_city/);
  assert.match(schema, /idx_event_registrations_organization/);
});

test('vercel cron remains hobby-safe and unchanged', () => {
  const config = JSON.parse(readSource('vercel.json'));

  assert.equal(config.crons.length, 1);
  assert.deepEqual(config.crons[0], {
    path: '/api/internal/registration-ops/drain',
    schedule: '0 0 * * *',
  });
});
