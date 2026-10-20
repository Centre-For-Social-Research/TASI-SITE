const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function loadModule(file, dependencies) {
  const { code } = transformSync(fs.readFileSync(file, 'utf8'), {
    format: 'cjs',
  });
  const testModule = { exports: {} };
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    require: (specifier) => dependencies[specifier] || {},
    Response,
    console,
  });
  return testModule.exports;
}

function routeDependencies({ batch = false, result }) {
  const scheduled = [];
  const calls = [];
  const dependencies = {
    '@/lib/registration-auth': {
      requireAdminOperator: async () => ({
        ok: true,
        operator: { userId: 'admin-1', primaryEmail: 'admin@example.com' },
      }),
    },
    '@/lib/registration-db': {
      applyRegistrationReviews: async (args) => {
        calls.push(args);
        return {
          registrations: args.updates.map((update) => ({
            id: update.registrationId,
            status: args.status,
            previousStatus: 'pending',
          })),
          conflictIds: [],
          missingIds: [],
          jobId: null,
          emailCount: 0,
          ...result,
        };
      },
    },
    '@/lib/registration-email-job-schedule': {
      scheduleRegistrationEmailJob: (jobId) => scheduled.push(jobId),
    },
    '@/lib/registration-job-utils.cjs': { MAX_JOB_RETRIES: 3 },
    '@/lib/registration-utils': {
      normalizeRegistrationStatus: (value) => value,
    },
    '@/lib/admin-api-cache': {
      adminJson: (body, init) => Response.json(body, init),
    },
  };
  const file = batch
    ? 'src/app/api/admin/registrations/status/batch/route.js'
    : 'src/app/api/admin/registrations/status/route.js';
  return { route: loadModule(file, dependencies), scheduled, calls };
}

test('single status change schedules only the job the RPC created', async () => {
  const { route, scheduled, calls } = routeDependencies({
    result: { jobId: 'fresh-job', emailCount: 1 },
  });
  const response = await route.POST({
    json: async () => ({
      registrationId: 'registration-1',
      status: 'confirmed',
      expectedUpdatedAt: '2026-10-01T00:00:00.000000+00:00',
      jobId: 'old-job-from-request',
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(scheduled, ['fresh-job']);
  assert.equal(body.emailResult.queued, true);
  assert.equal(
    calls[0].updates[0].expectedUpdatedAt.slice(0, 10),
    '2026-10-01'
  );
  assert.equal(calls[0].maxEmailAttempts, 3);
});

test('a stale single update returns 409', async () => {
  const { route } = routeDependencies({
    result: { registrations: [], conflictIds: ['registration-1'] },
  });
  const response = await route.POST({
    json: async () => ({
      registrationId: 'registration-1',
      status: 'rejected',
    }),
  });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'STALE_REGISTRATION_UPDATE');
});

test('a missing registration returns 404', async () => {
  const { route } = routeDependencies({
    result: { registrations: [], missingIds: ['registration-1'] },
  });
  const response = await route.POST({
    json: async () => ({
      registrationId: 'registration-1',
      status: 'rejected',
    }),
  });
  assert.equal(response.status, 404);
});

test('bulk status change reports conflicts and schedules its batch job', async () => {
  const { route, scheduled } = routeDependencies({
    batch: true,
    result: {
      jobId: 'fresh-batch-job',
      emailCount: 1,
      conflictIds: ['registration-2'],
      missingIds: ['registration-3'],
    },
  });
  const response = await route.POST({
    json: async () => ({
      status: 'rejected',
      updates: [{ registrationId: 'registration-1' }],
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 207);
  assert.deepEqual(body.conflictIds, ['registration-2', 'registration-3']);
  assert.equal(body.emailResult.totalItems, 1);
  assert.deepEqual(scheduled, ['fresh-batch-job']);
});

test('no email job means nothing is processed in the background', async () => {
  const afterCallbacks = [];
  const schedule = loadModule('src/lib/registration-email-job-schedule.js', {
    'next/server': { after: (callback) => afterCallbacks.push(callback) },
    '@/lib/registration-email-job-service': {
      processRegistrationEmailJob: async () => {},
    },
  });
  schedule.scheduleRegistrationEmailJob(null);
  assert.equal(afterCallbacks.length, 0);
  schedule.scheduleRegistrationEmailJob('job-1');
  assert.equal(afterCallbacks.length, 1);
});

test('counter refresh uses the serialized database function and excludes public roles', async () => {
  const dbSource = fs.readFileSync('src/lib/registration-ops-db.js', 'utf8');
  const migration = fs.readFileSync(
    'supabase/migrations/20260927195730_serialize_registration_email_job_refresh.sql',
    'utf8'
  );
  assert.match(
    dbSource,
    /\.rpc\('refresh_registration_email_job', \{ p_job_id: jobId \}\)/
  );
  assert.match(
    migration,
    /for update;[\s\S]+from public\.registration_email_job_items[\s\S]+update public\.registration_email_jobs/i
  );
  assert.match(migration, /security invoker/i);
  assert.match(
    migration,
    /revoke all on function public\.refresh_registration_email_job\(uuid\) from public, anon, authenticated/i
  );
  assert.match(
    migration,
    /grant execute on function public\.refresh_registration_email_job\(uuid\) to service_role/i
  );
  assert.match(dbSource, /\.rpc\('get_next_registration_email_job', \{/);
  assert.match(
    migration,
    /exists \([\s\S]+from public\.registration_email_job_items as item[\s\S]+item\.status in \('queued', 'retrying'\)/i
  );
});
