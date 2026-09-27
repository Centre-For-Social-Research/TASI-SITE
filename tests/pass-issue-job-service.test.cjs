const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('pass issue job service requires queue-backed bulk delivery and no longer returns legacy direct-send jobs', () => {
  const source = readSource('src/lib/pass-issue-job-service.js');

  assert.match(source, /Queue-backed QR delivery is required for bulk sends/);
  assert.doesNotMatch(source, /legacyDirect/);
  assert.doesNotMatch(source, /deliverPassEmailDirect/);
});

test('QR job history includes completed older jobs without exposing unfinished older jobs', async () => {
  const calls = [];
  const query = {
    select() {
      return query;
    },
    or(value) {
      calls.push(['or', value]);
      return query;
    },
    gte(field, value) {
      calls.push(['gte', field, value]);
      return query;
    },
    order() {
      return query;
    },
    limit(value, options) {
      if (!options) calls.push(['limit', value]);
      return query;
    },
    then(resolve) {
      return Promise.resolve({
        data: [{ id: 'older-completed' }],
        error: null,
      }).then(resolve);
    },
  };
  const { code } = transformSync(readSource('src/lib/registration-ops-db.js'), {
    format: 'cjs',
  });
  const testModule = { exports: {} };
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    require: (specifier) => {
      if (specifier === '@/lib/supabase-admin') {
        return { getSupabaseAdmin: () => ({ from: () => query }) };
      }
      if (specifier === '@/lib/registration-pass-utils.cjs') {
        return { normalizeRegistrationRecord: (value) => value };
      }
      return {};
    },
  });

  const cutoff = '2026-09-27T18:30:00.000Z';
  const jobs = await testModule.exports.listPassIssueEmailJobs({
    limit: 20,
    createdAfter: cutoff,
    includeCompletedBefore: true,
  });
  assert.equal(jobs[0].id, 'older-completed');
  assert.deepEqual(calls, [
    ['or', `created_at.gte.${cutoff},status.eq.completed`],
    ['limit', 20],
  ]);
  assert.match(
    readSource('src/lib/registration-ops-db.js'),
    /getNextPassIssueEmailJob[\s\S]+\.gte\('created_at', AUTOMATIC_EMAIL_JOB_CUTOFF\)/
  );
});

test('QR admin list requests completed history while keeping the recent cutoff', async () => {
  const options = [];
  const { code } = transformSync(
    readSource('src/app/api/admin/passes/jobs/route.js'),
    { format: 'cjs' }
  );
  const testModule = { exports: {} };
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    Response,
    require: (specifier) => {
      if (specifier === '@/lib/registration-auth') {
        return { requireAuthorizedOperator: async () => ({ ok: true }) };
      }
      if (specifier === '@/lib/registration-job-utils.cjs') {
        return {
          deriveJobProgress: () => ({}),
          isQueueInfrastructureUnavailable: () => false,
        };
      }
      if (specifier === '@/lib/registration-ops-db') {
        return {
          AUTOMATIC_EMAIL_JOB_CUTOFF: '2026-09-27T18:30:00.000Z',
          listPassIssueEmailJobs: async (value) => {
            options.push(value);
            return [];
          },
        };
      }
      return {};
    },
  });

  const response = await testModule.exports.GET();
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(options)), [
    {
      limit: 20,
      createdAfter: '2026-09-27T18:30:00.000Z',
      includeCompletedBefore: true,
    },
  ]);
});
