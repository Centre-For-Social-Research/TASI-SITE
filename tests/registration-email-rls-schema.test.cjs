const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('schema adds explicit deny policies for registration email queue tables', () => {
  const source = readSource('supabase/schema.sql');

  assert.match(
    source,
    /create policy "Deny registration email jobs api access"/
  );
  assert.match(
    source,
    /create policy "Deny registration email job items api access"/
  );
  assert.match(source, /on public\.registration_email_jobs/);
  assert.match(source, /on public\.registration_email_job_items/);
  assert.match(source, /to anon, authenticated/);
  assert.match(source, /using \(false\)/);
  assert.match(source, /with check \(false\)/);
});
