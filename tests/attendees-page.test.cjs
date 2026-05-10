const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repoPath = (...segments) => path.join(process.cwd(), ...segments);
const read = (...segments) => fs.readFileSync(repoPath(...segments), 'utf8');

test('attendees route delegates to the tracked page shell', () => {
  const source = read('src', 'app', 'attendees', 'page.jsx');

  assert.match(source, /@\/components\/attendees\/attendees-page/);
  assert.match(source, /metadata = attendeesPageMetadata/);
  assert.match(source, /export const revalidate = 3600/);
  assert.match(source, /PageSeoJsonLd/);
  assert.match(source, /<AttendeesPage \/>/);
  assert.doesNotMatch(source, /HomeNavbar/);
  assert.doesNotMatch(source, /BrandedPageHero/);
  assert.doesNotMatch(source, /publicAttendees/);
});

test('attendees page shell composes the live hero and public directory data', () => {
  const source = read('src', 'components', 'attendees', 'attendees-page.jsx');

  assert.match(source, /attendeesHero/);
  assert.match(source, /publicAttendees/);
  assert.match(source, /<HomeNavbar \/>/);
  assert.match(source, /<BrandedPageHero/);
  assert.match(source, /<AttendeesDirectory attendees=\{publicAttendees\} \/>/);
  assert.doesNotMatch(source, /Meet the TASI community/);
  assert.doesNotMatch(source, /combined master, conference/);
});

test('attendees page data owns copy, filter config, and public curation lists', async () => {
  const moduleUrl = pathToFileURL(repoPath('src', 'data', 'attendees-page.js'));
  const data = await import(moduleUrl.href);

  assert.equal(
    data.attendeesPageMetadata.title,
    'Trust and Safety India Festival Attendees | TASI Community'
  );
  assert.equal(data.attendeesHero.eyebrow, 'Public Attendees');
  assert.match(
    data.attendeesDirectoryCopy.searchPlaceholder,
    /Search attendees/
  );
  assert.equal(data.attendeesDirectoryCopy.emptyTitle, 'No attendees found');
  assert.equal(data.attendeeDirectoryConfig.pageSize, 16);
  assert.ok(
    data.attendeeDirectoryConfig.hiddenCategoryFilters.includes('VIP/GoI')
  );
  assert.ok(data.hiddenPublicAttendeeIds.includes('meta-412'));
  assert.ok(data.hiddenPublicAttendeeIds.includes('resolver-282'));
  assert.equal(
    data.publicAttendeeOverrides['yoel-roth-phd-463'].name,
    'Yoel Roth'
  );
  assert.equal(
    data.publicAttendeeOverrides['snigdha-bhardwaj-1'].organisation,
    'Google'
  );
});

test('public attendee module applies shared curation and keeps private fields out', () => {
  const source = read('src', 'lib', 'public-attendees.js');

  assert.match(source, /hiddenPublicAttendeeIds/);
  assert.match(source, /publicAttendeeOverrides/);
  assert.match(source, /const hiddenPublicAttendees = new Set/);
  assert.match(
    source,
    /const \{ email, phone, \.\.\.publicFields \} = curatedAttendee/
  );
  assert.match(
    source,
    /\.filter\(\(attendee\) => attendee\.organisation \|\| attendee\.designation\)/
  );
  assert.doesNotMatch(source, /ATTENDEE_OVERRIDES/);
  assert.doesNotMatch(source, /HIDDEN_ATTENDEE_IDS/);
});

test('attendees directory delegates card and modal UI instead of owning stale iterations', () => {
  const source = read(
    'src',
    'components',
    'attendees',
    'attendees-directory.jsx'
  );

  assert.match(source, /attendeesDirectoryCopy/);
  assert.match(source, /attendeeDirectoryConfig/);
  assert.match(source, /AttendeeCard/);
  assert.match(source, /AttendeeProfileDialog/);
  assert.match(source, /xl:grid-cols-4/);
  assert.match(source, /Page \{activePage\} of \{totalPages\}/);
  assert.doesNotMatch(source, /EXCLUDED_CATEGORY_FILTERS/);
  assert.doesNotMatch(source, /categories\.slice\(0, 8\)/);
  assert.doesNotMatch(source, /Source lists/);
  assert.doesNotMatch(source, /Copy email/);
  assert.doesNotMatch(source, /Email attendee/);
  assert.doesNotMatch(source, /Email not listed/);
  assert.doesNotMatch(source, /\bPhone\b/);
});

test('attendee card and profile dialog own reusable profile UI', () => {
  const cardSource = read(
    'src',
    'components',
    'attendees',
    'attendee-card.jsx'
  );
  const dialogSource = read(
    'src',
    'components',
    'attendees',
    'attendee-profile-dialog.jsx'
  );

  assert.match(cardSource, /View profile/);
  assert.match(cardSource, /AvatarFallback/);
  assert.match(cardSource, /getAttendeeInitials/);
  assert.match(cardSource, /rounded-\[10px\]/);
  assert.match(dialogSource, /Close attendee profile/);
  assert.match(dialogSource, /ProfileField/);
  assert.match(dialogSource, /rounded-\[10px\]/);
});

test('attendees data and navigation stay wired while stale cleanup script is removed', () => {
  const navbarSource = read('src', 'components', 'home', 'navbar.jsx');
  const dataSource = read('src', 'data', 'attendees.js');

  assert.match(dataSource, /export const attendees = \[/);
  assert.match(navbarSource, /children:\s*\[[\s\S]*Attendees/);
  assert.equal(
    fs.existsSync(repoPath('scripts', 'clean-attendees.ps1')),
    false,
    'Expected unused attendee cleanup script to stay removed.'
  );
});
