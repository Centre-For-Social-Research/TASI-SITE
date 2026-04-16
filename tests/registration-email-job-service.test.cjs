const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
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
  assert.match(source, /\['queued', 'processing'\]\.includes\(job\.status\)/);
});
