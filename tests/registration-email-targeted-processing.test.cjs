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

function routeDependencies({ batch = false, queueResult }) {
  const afterCallbacks = [];
  const processed = [];
  const dependencies = {
    'next/server': { after: (callback) => afterCallbacks.push(callback) },
    '@/lib/registration-auth': {
      requireAdminOperator: async () => ({
        ok: true,
        operator: { userId: 'admin-1', primaryEmail: 'admin@example.com' },
      }),
    },
    '@/lib/registration-db': {
      StaleRegistrationUpdateError: class extends Error {},
      getRegistrationReviewSnapshots: async () => new Map(),
      updateRegistrationStatus: async ({ registrationId, status }) => ({
        id: registrationId,
        email: 'recipient@example.com',
        previousStatus: 'pending',
        status,
      }),
    },
    '@/lib/registration-email-job-service': {
      queueRegistrationEmailJob: async () => queueResult,
      queueRegistrationEmailBatchJob: async () => queueResult,
      processRegistrationEmailJob: async ({ jobId }) => processed.push(jobId),
      processNextAvailableRegistrationEmailJob: async () => {
        throw new Error('The status route must process its newly queued job.');
      },
    },
    '@/lib/registration-utils': {
      normalizeRegistrationStatus: (value) => value,
    },
    '@/lib/admin-api-cache': {
      adminJson: (body, init) => Response.json(body, init),
    },
    '@/lib/registration-review-email.cjs': {
      getReviewEmailTemplate: (_before, after) => after,
    },
  };
  const file = batch
    ? 'src/app/api/admin/registrations/status/batch/route.js'
    : 'src/app/api/admin/registrations/status/route.js';
  return { route: loadModule(file, dependencies), afterCallbacks, processed };
}

test('single status change processes only the fresh server-created email job', async () => {
  const { route, afterCallbacks, processed } = routeDependencies({
    queueResult: { queued: true, jobId: 'fresh-job' },
  });
  const response = await route.POST({
    json: async () => ({
      registrationId: 'registration-1',
      status: 'confirmed',
      jobId: 'old-job-from-request',
    }),
  });
  assert.equal(response.status, 200);
  assert.equal(afterCallbacks.length, 1);
  await afterCallbacks[0]();
  assert.deepEqual(processed, ['fresh-job']);
});

test('bulk status change processes its newly queued batch job', async () => {
  const { route, afterCallbacks, processed } = routeDependencies({
    batch: true,
    queueResult: { queued: true, jobId: 'fresh-batch-job' },
  });
  const response = await route.POST({
    json: async () => ({
      status: 'rejected',
      updates: [{ registrationId: 'registration-1' }],
    }),
  });
  assert.equal(response.status, 200);
  assert.equal(afterCallbacks.length, 1);
  await afterCallbacks[0]();
  assert.deepEqual(processed, ['fresh-batch-job']);
});

test('a queue failure never starts background email processing', async () => {
  const { route, afterCallbacks } = routeDependencies({
    queueResult: { queued: false },
  });
  await route.POST({
    json: async () => ({
      registrationId: 'registration-1',
      status: 'waitlisted',
    }),
  });
  assert.equal(afterCallbacks.length, 0);
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
