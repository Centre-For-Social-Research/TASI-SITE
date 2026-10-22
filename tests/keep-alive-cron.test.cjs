const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('keep-alive route requires CRON_SECRET and makes one small read', () => {
  const source = readSource('src/app/api/internal/keep-alive/route.js');

  assert.match(source, /CRON_SECRET/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /\.from\('form_settings'\)/);
  assert.match(source, /\.limit\(1\)/);
});

test('vercel.json runs the keep-alive cron once a day', () => {
  const config = JSON.parse(readSource('vercel.json'));
  const cron = config.crons.find(
    (entry) => entry.path === '/api/internal/keep-alive'
  );

  assert.ok(cron, 'keep-alive cron is missing from vercel.json');
  // Five fields, fixed minute and hour, every day: the Hobby plan allows
  // daily crons only, and Supabase pauses after 7 days without activity.
  assert.match(cron.schedule, /^\d+ \d+ \* \* \*$/);
});
