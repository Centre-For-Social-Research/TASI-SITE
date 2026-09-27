const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function loadProcessorFactory() {
  const { code } = transformSync(
    readSource('src/lib/registration-email-job-service.js'),
    { format: 'cjs' }
  );
  const testModule = { exports: {} };
  const noOpDeps = new Proxy({}, { get: () => () => {} });
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    console,
    require: (specifier) => {
      if (specifier === './registration-constants.js') {
        return { REGISTRATION_EMAIL_COPY: { confirmed: () => ({}) } };
      }
      if (specifier === './registration-job-utils.cjs') {
        return {
          DEFAULT_JOB_CHUNK_SIZE: 20,
          MAX_JOB_RETRIES: 3,
          isQueueInfrastructureUnavailable: () => false,
        };
      }
      return noOpDeps;
    },
  });
  return testModule.exports.createRegistrationEmailJobProcessor;
}

test('registration email job service queues durable work and reports queue-unavailable submissions clearly', () => {
  const source = readSource('src/lib/registration-email-job-service.js');

  assert.match(source, /createRegistrationEmailJobProcessor/);
  assert.match(source, /createRegistrationNotification/);
  assert.match(source, /createJobRecord/);
  assert.match(source, /insertJobItems/);
  assert.match(source, /refreshJob/);
  assert.match(source, /queued: true/);
  assert.match(
    source,
    /Registration confirmation email queue is unavailable\. Submission was saved but confirmation email was not queued\./
  );
});

test('registration email job service processes claimed items through the queued worker path', () => {
  const source = readSource('src/lib/registration-email-job-service.js');

  assert.match(source, /claimJobItems/);
  assert.match(source, /sendRegistrationEmail/);
  assert.match(source, /status: 'sent'/);
  assert.match(source, /status: nextStatus/);
  assert.match(source, /getNextJob\(\)/);
});

test('automatic worker gets an eligible job directly and does not process a missing job', async () => {
  const createProcessor = loadProcessorFactory();
  const processed = [];
  const processor = createProcessor({
    getNextJob: async () => null,
    getJob: async (id) => ({ id }),
    claimJobItems: async ({ jobId }) => {
      processed.push(jobId);
      return [];
    },
    refreshJob: async (id) => ({ id }),
  });
  assert.equal(
    await processor.processNextAvailableRegistrationEmailJob(),
    null
  );
  assert.deepEqual(processed, []);
});

test('automatic queue lookup uses child item state after the pre-event backlog cutoff', () => {
  const source = readSource('src/lib/registration-ops-db.js');
  const migration = readSource(
    'supabase/migrations/20260927195730_serialize_registration_email_job_refresh.sql'
  );
  assert.match(
    source,
    /getNextRegistrationEmailJob[\s\S]+\.rpc\('get_next_registration_email_job', \{[\s\S]+p_created_after: AUTOMATIC_EMAIL_JOB_CUTOFF/
  );
  assert.match(migration, /job\.created_at >= p_created_after/);
  assert.match(migration, /item\.status in \('queued', 'retrying'\)/);
  assert.doesNotMatch(migration, /job\.status in \('queued', 'processing'\)/);
});

test('status email queue reuses the saved email and preserves the lookup fallback', async () => {
  const createProcessor = loadProcessorFactory();
  const notifications = [];
  let lookupCount = 0;
  const processor = createProcessor({
    getRegistration: async () => {
      lookupCount += 1;
      return { email: 'looked-up@example.com' };
    },
    createRegistrationNotification: async (notification) => {
      notifications.push(notification);
      return `notification-${notifications.length}`;
    },
    createJobRecord: async () => ({ id: 'job-1' }),
    insertJobItems: async () => [],
    refreshJob: async () => ({ id: 'job-1' }),
  });

  await processor.queueRegistrationEmailJob({
    registrationId: 'registration-1',
    templateType: 'confirmed',
    recipientEmail: 'saved@example.com',
  });
  assert.equal(lookupCount, 0);
  assert.equal(notifications[0].recipientEmail, 'saved@example.com');

  await processor.queueRegistrationEmailJob({
    registrationId: 'registration-2',
    templateType: 'confirmed',
  });
  assert.equal(lookupCount, 1);
  assert.equal(notifications[1].recipientEmail, 'looked-up@example.com');

  await processor.queueRegistrationEmailJob({
    registrationId: 'registration-3',
    templateType: 'confirmed',
    notificationId: 'existing-notification',
  });
  assert.equal(lookupCount, 1);
  assert.equal(notifications.length, 2);
});
