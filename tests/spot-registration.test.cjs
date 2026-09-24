const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');
const spotUtils = require('../src/lib/spot-registration-utils.cjs');
const emails = require('../src/lib/application-acknowledgement-email.cjs');
const rosterExport = require('../src/lib/admin-roster-export.cjs');

test('spot registration opens only on the two event dates in India time', () => {
  assert.equal(spotUtils.eventDayNow(new Date('2026-10-13T18:29:59Z')), null);
  assert.equal(
    spotUtils.eventDayNow(new Date('2026-10-13T18:30:00Z')).eventDay,
    1
  );
  assert.equal(
    spotUtils.eventDayNow(new Date('2026-10-14T18:30:00Z')).eventDay,
    2
  );
  assert.equal(spotUtils.eventDayNow(new Date('2026-10-15T18:30:00Z')), null);
});

test('spot registration normalizes attendee details and rejects invalid email', () => {
  assert.deepEqual(
    spotUtils.normalizeSpotInput({
      name: '  Saquib   Jamil ',
      email: ' Saquib@CSRIndia.org ',
      deskLabel: 'Main Desk',
    }),
    {
      fullName: 'Saquib Jamil',
      email: 'saquib@csrindia.org',
      designation: null,
      organization: null,
      deskLabel: 'Main Desk',
    }
  );
  assert.throws(
    () => spotUtils.normalizeSpotInput({ name: 'Guest', email: 'bad' }),
    /valid email/
  );
});

test('returning attendee does not receive a second confirmation email', () => {
  assert.equal(
    spotUtils.returningSpotEmailStatus({ email_status: 'sent' }),
    'not_required'
  );
  assert.equal(
    spotUtils.returningSpotEmailStatus({ email_status: 'needs_review' }),
    'needs_review'
  );
});

test('spot confirmation reflects the event day and creates no pass', () => {
  const email = emails.buildSpotRegistrationEmail({
    firstName: 'Saquib',
    eventDay: 1,
  });
  assert.match(email.subject, /on-site registration is confirmed/);
  assert.match(email.text, /14 October 2026/);
  assert.match(email.text, /checked?[- ]in|check-in/i);
  assert.match(email.text, /all set to join the festival today/i);
  assert.doesNotMatch(email.text, /preview|sample/i);
});

test('roster CSV and Excel exports neutralize spreadsheet formulas', async () => {
  const columns = [{ key: 'name', label: 'Name' }];
  const rows = [{ name: '=HYPERLINK("bad")' }];
  assert.match(rosterExport.buildRosterCsv(columns, rows), /'=HYPERLINK/);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(
    await rosterExport.buildRosterExcel(columns, rows, 'Test')
  );
  assert.equal(workbook.getWorksheet('Test').getCell('A2').value[0], "'");
});

test('spot and guest exports require operator auth and check-in export uses attendance rows', () => {
  const root = path.join(__dirname, '..', 'src', 'app', 'api', 'admin');
  for (const route of [
    'spot-registrations/export/route.js',
    'guest-invitations/export/route.js',
    'check-in/export/route.js',
  ]) {
    const source = fs.readFileSync(path.join(root, route), 'utf8');
    assert.match(source, /requireAuthorizedOperator/);
  }
  const checkIn = fs.readFileSync(
    path.join(root, 'check-in/export/route.js'),
    'utf8'
  );
  assert.match(checkIn, /listAllDailyCheckIns/);
  assert.match(checkIn, /listAllSpotRegistrations/);
  assert.doesNotMatch(checkIn, /listGuestInvitations/);
});

test('spot migration blocks duplicate day attendance and public table access', () => {
  const migration = fs.readFileSync(
    path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20260924064546_spot_registrations.sql'
    ),
    'utf8'
  );
  assert.match(migration, /unique index[^;]+lower\(email\), event_day/is);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all[^;]+from anon, authenticated/i);
  assert.doesNotMatch(migration, /alter table public\.event_registrations/i);
});
