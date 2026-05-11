const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const schemaSql = fs.readFileSync(
  path.join(process.cwd(), 'supabase', 'schema.sql'),
  'utf8'
);

test('schema stores registration check-ins separately for each event day', () => {
  assert.match(
    schemaSql,
    /create table if not exists public\.registration_daily_check_ins/
  );
  assert.match(
    schemaSql,
    /event_day smallint not null check \(event_day in \(1, 2\)\)/
  );
  assert.match(schemaSql, /unique \(registration_id, event_day\)/);
  assert.match(schemaSql, /idx_registration_daily_check_ins_day_checked/);
  assert.match(
    schemaSql,
    /alter table public\.registration_daily_check_ins enable row level security/
  );
});

test('schema stores festival ticket check-ins separately for each event day', () => {
  assert.match(
    schemaSql,
    /create table if not exists public\.festival_ticket_daily_check_ins/
  );
  assert.match(schemaSql, /unique \(ticket_id, event_day\)/);
  assert.match(schemaSql, /idx_festival_ticket_daily_check_ins_day_checked/);
  assert.match(
    schemaSql,
    /alter table public\.festival_ticket_daily_check_ins enable row level security/
  );
});

test('scan log records the selected event day for separate activity datasets', () => {
  assert.match(
    schemaSql,
    /add column if not exists event_day smallint not null default 1/
  );
  assert.match(schemaSql, /idx_entry_scans_event_day_created/);
});
