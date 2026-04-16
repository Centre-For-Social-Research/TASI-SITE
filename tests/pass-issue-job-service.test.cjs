const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('pass issue job service requires queue-backed bulk delivery and no longer returns legacy direct-send jobs', () => {
  const source = readSource('src/lib/pass-issue-job-service.js');

  assert.match(
    source,
    /Queue-backed QR delivery is required for bulk sends/
  );
  assert.doesNotMatch(source, /legacyDirect/);
  assert.doesNotMatch(source, /deliverPassEmailDirect/);
});
