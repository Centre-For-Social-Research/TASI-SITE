const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const schemaSql = fs.readFileSync(
  path.join(process.cwd(), 'supabase', 'schema.sql'),
  'utf8'
);

test('does not allow direct public inserts into contact and newsletter intake tables', () => {
  assert.doesNotMatch(schemaSql, /create policy "Allow newsletter insert"/);
  assert.doesNotMatch(schemaSql, /create policy "Allow message insert"/);
  assert.doesNotMatch(
    schemaSql,
    /create policy "Allow registration confirmation insert"/
  );
});
