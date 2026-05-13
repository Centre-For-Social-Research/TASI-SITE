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

test('schema explicitly exposes server-side tables to the service role only', () => {
  assert.match(
    schemaSql,
    /grant select, insert, update, delete on all tables in schema public to service_role/
  );
  assert.match(
    schemaSql,
    /grant usage, select on all sequences in schema public to service_role/
  );
  assert.doesNotMatch(
    schemaSql,
    /grant select, insert, update, delete on all tables in schema public to (anon|authenticated)/
  );
});
