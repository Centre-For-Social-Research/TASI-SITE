const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('programme session pages expose crawlable event SEO surfaces', () => {
  const routeSource = readSource('src/app/programme/session/[slug]/page.jsx');
  const agendaSource = readSource(
    'src/components/programme/programme-agenda-client.jsx'
  );
  const programmePageSource = readSource('src/app/programme/page.jsx');
  const detailSource = readSource('src/data/programme-session-details.js');

  assert.match(routeSource, /generateStaticParams/);
  assert.match(routeSource, /'@type': 'Event'/);
  assert.match(routeSource, /superEvent/);
  assert.match(routeSource, /performer/);
  assert.match(routeSource, /BreadcrumbJsonLd/);
  assert.match(routeSource, /programmeSessionDetailDescriptions/);
  assert.match(routeSource, /Trust and Safety India Festival Programme/);
  assert.match(agendaSource, /getProgrammeSessionPath/);
  assert.match(agendaSource, /getSpeakerProfilePath/);
  assert.doesNotMatch(
    programmePageSource,
    /programmeSessionDetailDescriptions/
  );
  assert.match(detailSource, /global AI ecosystem/);
  assert.match(detailSource, /AI-generated child sexual abuse material/);
});

test('blog post pages emit Article schema and breadcrumbs', () => {
  const source = readSource('src/app/blog/[slug]/page.jsx');

  assert.match(source, /'@type': 'Article'/);
  assert.match(source, /mainEntityOfPage/);
  assert.match(source, /BreadcrumbJsonLd/);
  assert.match(source, /alternates/);
  assert.match(source, /AI governance India/);
});

test('partner pages emit Organization schema for sponsor and partner search', () => {
  const source = readSource('src/app/partners/[slug]/page.jsx');

  assert.match(source, /'@type': 'Organization'/);
  assert.match(source, /memberOf/);
  assert.match(source, /Trust and Safety India Festival partner/);
  assert.match(source, /BreadcrumbJsonLd/);
});

test('about page exposes TASI organizer and team SEO schema', () => {
  const source = readSource('src/app/about/page.jsx');

  assert.match(source, /About Trust and Safety India Festival/);
  assert.match(source, /teamMembers/);
  assert.match(source, /'@type': 'AboutPage'/);
  assert.match(source, /Trust and Safety India Festival organizing team/);
  assert.match(source, /BreadcrumbJsonLd/);
});

test('remaining public pages expose reusable SEO JSON-LD surfaces', () => {
  const routes = [
    'src/app/register/page.jsx',
    'src/app/sponsor/page.jsx',
    'src/app/media/page.jsx',
    'src/app/media/press-kit/page.jsx',
    'src/app/media/press-releases/page.jsx',
    'src/app/get-involved/page.jsx',
    'src/app/volunteer-application/page.jsx',
    'src/app/speaker-application/page.jsx',
    'src/app/attendees/page.jsx',
    'src/app/blog/page.jsx',
    'src/app/plan-your-travel/page.jsx',
  ];

  for (const route of routes) {
    const source = readSource(route);
    assert.match(source, /PageSeoJsonLd|JsonLdScript/);
    assert.match(source, /Trust and Safety India Festival|TASI/);
  }
});

test('registration page no longer displays public ticket prices', () => {
  const source = readSource(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.doesNotMatch(source, /INR 11,800/);
  assert.doesNotMatch(source, /USD 200/);
  assert.doesNotMatch(source, /Total Payable/);
  assert.doesNotMatch(source, /Base Price/);
  assert.match(source, /Payment Channel/);
  assert.match(source, /Invoice Treatment/);
});
