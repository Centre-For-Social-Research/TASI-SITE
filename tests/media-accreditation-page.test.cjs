const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (...segments) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

test('media accreditation has a dedicated public page without changing its API', () => {
  const route = read('src', 'app', 'media', 'accreditation', 'page.jsx');
  const page = read(
    'src',
    'components',
    'media',
    'media-accreditation-page.jsx'
  );
  const form = read(
    'src',
    'components',
    'media',
    'media-accreditation-section.jsx'
  );
  const api = read('src', 'app', 'api', 'media-accreditation', 'route.js');

  assert.match(route, /mediaAccreditationMetadata/);
  assert.match(route, /<MediaAccreditationPage \/>/);
  assert.match(page, /<MediaAccreditationSection \/>/);
  assert.match(page, /mediaAccreditationSteps\.map/);
  assert.match(form, /fetch\('\/api\/media-accreditation'/);
  assert.match(api, /from\('contact_messages'\)\.insert/);
  assert.match(api, /source: 'media-accreditation'/);
  assert.doesNotMatch(api, /event_registrations/);
});

test('media discovery links point to the dedicated accreditation page', () => {
  const mediaData = read('src', 'data', 'media-page.js');
  const involvementData = read('src', 'data', 'get-involved-page.js');
  const sitemap = read('src', 'app', 'sitemap.ts');

  assert.match(mediaData, /href: '\/media\/accreditation'/);
  assert.match(
    mediaData,
    /label: 'Apply for TASI 2026 Media Accreditation',[\s\S]*href: '\/media\/accreditation'/
  );
  assert.match(involvementData, /href: '\/media\/accreditation'/);
  assert.match(sitemap, /path: '\/media\/accreditation'/);
});
