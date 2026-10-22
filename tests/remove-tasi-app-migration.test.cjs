const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    'supabase/migrations/20261022165816_remove_tasi_app.sql'
  ),
  'utf8'
);

test('TASi-App triggers on event_registrations go before the tables they write to', () => {
  const dropTriggers = migration.indexOf(
    'drop trigger if exists event_registrations_push_confirmed'
  );
  const dropRoleSync = migration.indexOf(
    'drop trigger if exists event_registrations_role_sync'
  );
  const dropTables = migration.indexOf('drop table if exists');

  assert.ok(dropTriggers >= 0 && dropRoleSync >= 0);
  assert.ok(dropTriggers < dropTables && dropRoleSync < dropTables);
});

test('TASi-App removal keeps every table the website uses', () => {
  const dropped = migration
    .slice(migration.indexOf('drop table if exists'))
    .split(';')[0];

  for (const table of [
    'app_idempotency_keys',
    'event_registrations',
    'entry_passes',
    'form_settings',
    'attendee_certificates',
  ]) {
    assert.doesNotMatch(dropped, new RegExp(`public\\.${table}\\b`));
  }
});
