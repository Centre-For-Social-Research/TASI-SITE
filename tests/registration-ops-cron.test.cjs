const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('vercel cron is configured to drain registration ops queues through a dedicated route', () => {
  const config = JSON.parse(readSource('vercel.json'));

  assert.ok(Array.isArray(config.crons));
  assert.ok(
    config.crons.some(
      (cron) =>
        cron.path === '/api/internal/registration-ops/drain' &&
        cron.schedule === '* * * * *'
    )
  );
});

test('registration ops drain route secures cron execution with CRON_SECRET and processes both queues', () => {
  const source = readSource('src/app/api/internal/registration-ops/drain/route.js');

  assert.match(source, /processNextAvailablePassIssueEmailJob/);
  assert.match(source, /processNextAvailableRegistrationEmailJob/);
  assert.match(source, /authorization/);
  assert.match(source, /CRON_SECRET/);
});
