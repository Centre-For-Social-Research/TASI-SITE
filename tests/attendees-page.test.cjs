const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('attendees page artifacts exist and expose public directory content', () => {
  const pagePath = path.join(
    process.cwd(),
    'src',
    'app',
    'attendees',
    'page.jsx'
  );
  const componentPath = path.join(
    process.cwd(),
    'src',
    'components',
    'attendees',
    'attendees-directory.jsx'
  );
  const dataPath = path.join(process.cwd(), 'src', 'data', 'attendees.js');
  const utilsPath = path.join(process.cwd(), 'src', 'lib', 'attendees.js');
  const publicDataPath = path.join(
    process.cwd(),
    'src',
    'lib',
    'public-attendees.js'
  );
  const navbarPath = path.join(
    process.cwd(),
    'src',
    'components',
    'home',
    'navbar.jsx'
  );

  assert.ok(fs.existsSync(pagePath), 'Expected attendees page route to exist.');
  assert.ok(
    fs.existsSync(componentPath),
    'Expected attendees directory component to exist.'
  );
  assert.ok(
    fs.existsSync(dataPath),
    'Expected attendees data module to exist.'
  );
  assert.ok(
    fs.existsSync(utilsPath),
    'Expected attendee utility module to exist.'
  );
  assert.ok(
    fs.existsSync(publicDataPath),
    'Expected public attendee data module to exist.'
  );

  const pageSource = fs.readFileSync(pagePath, 'utf8');
  const componentSource = fs.readFileSync(componentPath, 'utf8');
  const dataSource = fs.readFileSync(dataPath, 'utf8');
  const publicDataSource = fs.readFileSync(publicDataPath, 'utf8');
  const navbarSource = fs.readFileSync(navbarPath, 'utf8');

  assert.match(pageSource, /publicAttendees/);
  assert.match(pageSource, /Public Attendees/);
  assert.match(componentSource, /Search attendees/);
  assert.match(componentSource, /View profile/);
  assert.match(componentSource, /AvatarFallback/);
  assert.match(componentSource, /getAttendeeInitials/);
  assert.match(componentSource, /All categories/);
  assert.match(componentSource, /EXCLUDED_CATEGORY_FILTERS/);
  assert.match(componentSource, /'Industry'/);
  assert.match(componentSource, /'GoI'/);
  assert.match(componentSource, /'ACTS'/);
  assert.match(componentSource, /'Panelist \/ Industry'/);
  assert.match(componentSource, /'NGO'/);
  assert.match(componentSource, /'Online Registrations'/);
  assert.match(componentSource, /'VIP\/GoI'/);
  assert.match(componentSource, /xl:grid-cols-4/);
  assert.match(componentSource, /Page \{activePage\} of \{totalPages\}/);
  assert.doesNotMatch(componentSource, /categories\.slice\(0, 8\)/);
  assert.doesNotMatch(componentSource, /Source lists/);
  assert.doesNotMatch(componentSource, /Copy email/);
  assert.doesNotMatch(componentSource, /Email attendee/);
  assert.doesNotMatch(componentSource, /Email not listed/);
  assert.doesNotMatch(componentSource, /\bPhone\b/);
  assert.match(dataSource, /export const attendees = \[/);
  assert.match(publicDataSource, /ATTENDEE_OVERRIDES/);
  assert.match(publicDataSource, /'yoel-roth-phd-463'/);
  assert.match(publicDataSource, /'meta-412'/);
  assert.match(publicDataSource, /'resolver-282'/);
  assert.match(publicDataSource, /'name-441'/);
  assert.match(
    publicDataSource,
    /const \{ email, phone, \.\.\.publicFields \} = curatedAttendee/
  );
  assert.match(
    publicDataSource,
    /\.filter\(\(attendee\) => attendee\.organisation \|\| attendee\.designation\)/
  );
  assert.match(navbarSource, /children:\s*\[[\s\S]*Attendees/);
});
