const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('delivery jobs panel still surfaces queue-unavailable state and drives bounded processing through polling', () => {
  const source = readSource('src/components/admin/delivery-jobs-panel.jsx');

  assert.match(source, /queueUnavailable/);
  assert.match(source, /setInterval/);
  assert.match(source, /Unable to process QR delivery job right now/);
});
