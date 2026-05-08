const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function loadModule(relativePath) {
  return import(pathToFileURL(path.join(process.cwd(), relativePath)).href);
}

test('partners routes delegate to tracked list and detail components', () => {
  const listRoute = readFile('src/app/partners/page.jsx');
  const detailRoute = readFile('src/app/partners/[slug]/page.jsx');

  assert.match(
    listRoute,
    /import PartnersPage from '@\/components\/partners\/partners-page'/
  );
  assert.match(listRoute, /export const metadata = partnersPageMetadata;/);
  assert.match(listRoute, /return <PartnersPage \/>;/);

  assert.match(
    detailRoute,
    /import PartnerDetailPage from '@\/components\/partners\/partner-detail-page'/
  );
  assert.match(detailRoute, /getPartnerStaticParams/);
  assert.match(detailRoute, /getPartnerMetadata/);
  assert.match(detailRoute, /getPartnerBySlug/);
  assert.match(
    detailRoute,
    /return <PartnerDetailPage partner=\{partner\} \/>;/
  );
  assert.doesNotMatch(
    detailRoute,
    /function\s+(LinkedInIcon|InstagramIcon|XIcon|YouTubeIcon)/
  );
});

test('partners page data owns metadata, copy, and route helpers', async () => {
  const partnersData = await loadModule('src/data/partners.js');
  const pageData = await loadModule('src/data/partners-page.js');

  assert.equal(pageData.partnersPageMetadata.title, 'Partners | TASI 2026');
  assert.equal(pageData.partnersPageHero.title, 'Our Partners');
  assert.equal(
    pageData.getPartnerStaticParams().length,
    partnersData.partners.length
  );
  assert.equal(pageData.getPartnerBySlug('booking-com').name, 'Booking.com');
  assert.equal(
    pageData.getPartnerMetadata('booking-com').title,
    'Booking.com | Partners | TASI 2026'
  );
  assert.equal(pageData.getPartnerNavigation('booking-com').previous, null);
  assert.equal(
    pageData.buildPartnerSocialLinks(partnersData.partners[0]).length,
    4
  );
});

test('partners components consume tracked data and lucide icon registry', () => {
  const listSource = readFile('src/components/partners/partners-page.jsx');
  const detailSource = readFile(
    'src/components/partners/partner-detail-page.jsx'
  );
  const iconSource = readFile('src/components/partners/partner-icons.jsx');

  assert.match(listSource, /partnersPageHero/);
  assert.match(listSource, /partnersPageCta/);
  assert.match(listSource, /partners\.map/);
  assert.match(detailSource, /buildPartnerSocialLinks/);
  assert.match(detailSource, /getPartnerNavigation/);
  assert.match(iconSource, /from 'lucide-react'/);
  assert.match(iconSource, /Linkedin/);
  assert.doesNotMatch(detailSource, /<svg/);
});
