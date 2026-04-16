const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('registration create route queues confirmation email work instead of sending inline', () => {
  const source = readSource('src/app/api/registrations/create/route.js');

  assert.match(source, /queueRegistrationEmailJob/);
  assert.doesNotMatch(source, /deliverRegistrationEmail/);
  assert.match(source, /emailQueued: Boolean\(emailResult\.queued\)/);
});
