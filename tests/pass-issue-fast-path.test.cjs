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
    Number,
  });
  return testModule.exports;
}

function loadService(overrides = {}) {
  const calls = { list: 0, create: [], issue: [], fetch: 0 };
  const service = loadModule('src/lib/pass-issue-job-service.js', {
    '@/lib/registration-job-utils.cjs': require('../src/lib/registration-job-utils.cjs'),
    '@/lib/registration-ops-db': {
      listRegistrationsForPassJob: async () => {
        calls.list += 1;
        return [{ id: 'filtered-1' }, { id: 'filtered-2' }];
      },
      createPassIssueEmailJobWithItems: async (args) => {
        calls.create.push(args);
        return { id: 'job-1', total_items: args.registrationIds.length };
      },
      getPassIssueEmailJob: async () => ({
        id: 'job-1',
        resend_existing: true,
      }),
      claimPassIssueEmailJobItems: async () => [
        { id: 'item-1', registration_id: 'reg-1', attempt_count: 1 },
      ],
      updatePassIssueEmailJobItem: async () => ({}),
      refreshPassIssueEmailJob: async () => ({ id: 'job-1' }),
    },
    '@/lib/registration-db': {
      getRegistrationById: async (id) => {
        calls.fetch += 1;
        return { id, status: 'confirmed', email: 'a@example.com' };
      },
      issuePassForRegistration: async (args) => {
        calls.issue.push(args);
        throw new Error('stop after issue');
      },
    },
    ...overrides,
  });
  return { service, calls };
}

test('a selected QR job goes straight to the one-transaction RPC', async () => {
  const { service, calls } = loadService();
  await service.createPassIssueEmailJob({
    registrationIds: ['reg-1'],
    operator: { userId: 'u', primaryEmail: 'admin@example.com' },
  });
  assert.equal(calls.list, 0);
  assert.equal(calls.create.length, 1);
  assert.deepEqual([...calls.create[0].registrationIds], ['reg-1']);
  assert.equal(calls.create[0].selection.selectionMode, 'selected');
});

test('a filtered QR job resolves ids once, then calls the RPC', async () => {
  const { service, calls } = loadService();
  await service.createPassIssueEmailJob({
    filters: { status: 'confirmed' },
    operator: { userId: 'u', primaryEmail: 'admin@example.com' },
  });
  assert.equal(calls.list, 1);
  assert.deepEqual(
    [...calls.create[0].registrationIds],
    ['filtered-1', 'filtered-2']
  );
});

test('the QR worker hands its loaded registration to issuePassForRegistration', async () => {
  const { service, calls } = loadService();
  await service.processPassIssueEmailJob({
    jobId: 'job-1',
    operator: { userId: 'system', primaryEmail: 'system@local' },
  });
  assert.equal(calls.fetch, 1);
  assert.equal(calls.issue.length, 1);
  assert.equal(calls.issue[0].registration.id, 'reg-1');
});

test('issuePassForRegistration only refetches when no matching row is given', () => {
  const source = fs.readFileSync('src/lib/registration-db.js', 'utf8');
  assert.match(
    source,
    /loadedRegistration\?\.id === registrationId\s*\?\s*loadedRegistration\s*:\s*await getRegistrationById\(registrationId\)/
  );
});

test('issuing one QR pass starts sending it after the response', async () => {
  const afterCallbacks = [];
  const processed = [];
  const route = loadModule(
    'src/app/api/admin/registrations/issue-pass/route.js',
    {
      'next/server': { after: (callback) => afterCallbacks.push(callback) },
      '@/lib/registration-auth': {
        requireAdminOperator: async () => ({
          ok: true,
          operator: { userId: 'u', primaryEmail: 'admin@example.com' },
        }),
      },
      '@/lib/registration-job-utils.cjs': { deriveJobProgress: () => ({}) },
      '@/lib/pass-issue-job-service': {
        createPassIssueEmailJob: async () => ({
          id: 'job-9',
          status: 'queued',
          total_items: 1,
          sent_items: 0,
          skipped_items: 0,
        }),
        processPassIssueEmailJob: async ({ jobId, chunkSize }) =>
          processed.push([jobId, chunkSize]),
      },
      '@/lib/admin-api-cache': {
        adminJson: (body, init) => Response.json(body, init),
      },
    }
  );

  const response = await route.POST({
    json: async () => ({ registrationId: 'reg-1' }),
  });
  assert.equal(response.status, 200);
  assert.equal(afterCallbacks.length, 1);
  await afterCallbacks[0]();
  assert.deepEqual(processed, [['job-9', 1]]);
});

test('QR job RPCs lock the job row and keep only confirmed registrations', () => {
  const migration = fs.readFileSync(
    'supabase/migrations/20261020150000_pass_issue_job_rpcs.sql',
    'utf8'
  );
  assert.match(
    migration,
    /from public\.pass_issue_email_jobs\s+where id = p_job_id\s+for update;/
  );
  assert.match(migration, /and r\.status = 'confirmed'/);
  assert.match(
    migration,
    /return query select \* from public\.refresh_pass_issue_email_job\(v_job_id\);/
  );
  assert.match(
    migration,
    /revoke all on function public\.create_pass_issue_email_job\([^)]*\) from public, anon, authenticated/
  );
});
