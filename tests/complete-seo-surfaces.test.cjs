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

  assert.match(routeSource, /generateStaticParams/);
  assert.match(routeSource, /'@type': 'Event'/);
  assert.match(routeSource, /superEvent/);
  assert.match(routeSource, /performer/);
  assert.match(routeSource, /BreadcrumbJsonLd/);
  assert.match(routeSource, /Trust and Safety India Festival Programme/);
  assert.match(agendaSource, /getProgrammeSessionPath/);
  assert.match(agendaSource, /getSpeakerProfilePath/);
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
