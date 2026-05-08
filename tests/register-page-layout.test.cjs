const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function loadModule(relativePath) {
  return import(pathToFileURL(path.join(process.cwd(), relativePath)).href);
}

test('register route delegates to the tracked register page component', () => {
  const source = readFile('src/app/register/page.jsx');

  assert.match(
    source,
    /import RegisterPage from '@\/components\/register\/register-page'/
  );
  assert.match(
    source,
    /import \{ registerPageMetadata \} from '@\/data\/register-page'/
  );
  assert.match(source, /export const metadata = registerPageMetadata;/);
  assert.match(source, /return <RegisterPage \/>;/);
  assert.doesNotMatch(source, /const\s+(steps|faqs)\s*=/);
});

test('register page renders festival ticketing below the approval-based registration flow', () => {
  const source = readFile('src/components/register/register-page.jsx');
  const registrationFormIndex = source.indexOf('<RegistrationForm />');
  const skipWaitIndex = source.indexOf('paidTicketingIntro.title');
  const festivalSectionIndex = source.indexOf('<FestivalTicketingSection />');

  assert.notEqual(registrationFormIndex, -1);
  assert.notEqual(skipWaitIndex, -1);
  assert.notEqual(festivalSectionIndex, -1);
  assert.ok(
    skipWaitIndex > registrationFormIndex,
    'Skip-the-wait divider should appear after the application form.'
  );
  assert.ok(
    festivalSectionIndex > skipWaitIndex,
    'Festival ticketing section should appear after the skip-the-wait divider.'
  );
});

test('register page data owns the updated general access intro copy', async () => {
  const data = await loadModule('src/data/register-page.js');
  const source = readFile('src/components/register/register-page.jsx');

  assert.equal(data.generalAccessIntro.eyebrow, 'Apply for General Access');
  assert.equal(
    data.generalAccessIntro.description,
    'This is a manual review process. Submit your application and our team will review your details. You will receive a confirmation if selected.'
  );
  assert.match(source, /generalAccessIntro/);
  assert.doesNotMatch(source, /Delegate Applications/);
  assert.doesNotMatch(
    source,
    /Approval-based registration remains available below/
  );
});

test('register page includes the OR divider before paid ticketing', async () => {
  const data = await loadModule('src/data/register-page.js');
  const source = readFile('src/components/register/register-page.jsx');

  assert.equal(data.paidTicketingIntro.dividerLabel, 'OR');
  assert.equal(
    data.paidTicketingIntro.title,
    'Skip the wait. Get full access to the festival.'
  );
  assert.match(source, /paidTicketingIntro\.dividerLabel/);
  assert.match(source, /paidTicketingIntro\.title/);
  assert.match(
    source,
    /bg-gradient-to-br from-\[#5c0f4f\] via-\[#360454\] to-\[#15002b\]/
  );
});

test('festival ticketing cards use the legacy footer label', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(source, /absolute bottom-6 left-7/);
  assert.match(source, /TASI\s*<br \/>\s*2026/);
  assert.match(source, /TASI 2026/);
});

test('festival ticketing cards use the redesigned centered ticket layout', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(source, /Choose your ticket/);
  assert.match(source, /Payments paused/);
  assert.match(source, /FESTIVAL_PAYMENTS_ENABLED/);
  assert.match(
    source,
    /absolute inset-x-0 top-1\/2 -translate-y-1\/2 px-6 text-center/
  );
  assert.match(source, /max-w-\[220px\] text-\[2\.35rem\]/);
});

test('festival ticketing modal stays hidden until a card is selected', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(
    source,
    /const \[ticketModalOpen, setTicketModalOpen\] = useState\(false\)/
  );
  assert.match(source, /ticketModalOpen \? \(/);
});

test('festival ticketing cards are not wrapped in a white boxed container', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.doesNotMatch(
    source,
    /<div className="rounded-\[10px\] border border-slate-200 bg-white p-6 shadow-\[0_24px_80px_rgba\(15,23,42,0\.08\)\] dark:border-slate-800 dark:bg-slate-900 md:p-8">/
  );
});

test('festival ticketing includes the new free-vs-paid comparison section', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(source, /Free Pass/);
  assert.match(source, /\(Application-Based\)/);
  assert.match(source, /Paid Pass/);
  assert.match(source, /Recommended/);
  assert.match(source, /Everything in Free Pass/);
  assert.match(source, /Access Comparison/);
  assert.match(source, /Conference Access \(Day 1 & Day 2\)/);
  assert.match(source, /Reserved seating \(front or priority zones\)/);
  assert.doesNotMatch(source, /Attendee directory \(opt-in\)/);
  assert.doesNotMatch(
    source,
    /Private roundtable with industry experts, CSOs, and government officials/
  );
  assert.doesNotMatch(
    source,
    /Personal introduction by organizers to key stakeholders/
  );
  assert.doesNotMatch(source, /Select roundtables and speaker interaction/);
  assert.doesNotMatch(
    source,
    /International Add-on: Ecosystem briefing & intros/
  );
  assert.doesNotMatch(source, /International Bonus/);
});
