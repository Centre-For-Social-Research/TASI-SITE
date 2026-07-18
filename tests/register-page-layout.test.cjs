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
  assert.match(source, /PageSeoJsonLd/);
  assert.match(source, /<RegisterPage \/>/);
  assert.doesNotMatch(source, /const\s+(steps|faqs)\s*=/);
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

test('register page no longer renders the paid festival ticketing flow', async () => {
  const data = await loadModule('src/data/register-page.js');
  const source = readFile('src/components/register/register-page.jsx');

  assert.match(source, /<RegistrationForm \/>/);
  assert.doesNotMatch(source, /FestivalTicketingSection/);
  assert.doesNotMatch(source, /paidTicketingIntro/);
  assert.equal(data.paidTicketingIntro, undefined);
  assert.equal(
    fs.existsSync(
      path.join(
        process.cwd(),
        'src/components/register/festival-ticketing-section.jsx'
      )
    ),
    false,
    'festival-ticketing-section.jsx should stay removed'
  );
});
