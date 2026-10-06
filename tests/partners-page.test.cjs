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
  assert.match(listRoute, /PageSeoJsonLd/);
  assert.match(listRoute, /<PartnersPage initialYear=\{initialYear\} \/>/);
  assert.match(listRoute, /year === '2025' \? '2025' : '2026'/);

  assert.match(
    detailRoute,
    /import PartnerDetailPage from '@\/components\/partners\/partner-detail-page'/
  );
  assert.match(detailRoute, /getPartnerStaticParams/);
  assert.match(detailRoute, /getPartnerMetadata/);
  assert.match(detailRoute, /getPartnerBySlug/);
  assert.match(detailRoute, /JsonLdScript/);
  assert.match(detailRoute, /BreadcrumbJsonLd/);
  assert.match(detailRoute, /<PartnerDetailPage partner=\{partner\} \/>/);
  assert.doesNotMatch(
    detailRoute,
    /function\s+(LinkedInIcon|InstagramIcon|XIcon|YouTubeIcon)/
  );
});

test('partners page data owns metadata, copy, and route helpers', async () => {
  const partnersData = await loadModule('src/data/partners.js');
  const pageData = await loadModule('src/data/partners-page.js');

  assert.equal(
    pageData.partnersPageMetadata.title,
    'Trust and Safety India Festival Partners | TASI Organizations'
  );
  assert.equal(pageData.partnersPageHero.title, 'Our Partners');
  assert.equal(
    pageData.getPartnerStaticParams().length,
    partnersData.partners.length
  );
  assert.equal(pageData.getPartnerBySlug('booking-com').name, 'Booking.com');
  assert.equal(
    pageData.getPartnerMetadata('booking-com').title,
    'Booking.com | Trust and Safety India Festival Partner'
  );
  assert.equal(
    pageData.getPartnerMetadata('booking-com').alternates.canonical,
    '/partners/booking-com'
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
  assert.match(listSource, /getPartnersForEdition/);
  assert.match(listSource, /PartnersEditionView/);
  assert.match(
    readFile('src/components/partners/partners-edition-view.jsx'),
    /EditionYearToggle/
  );
  assert.match(detailSource, /buildPartnerSocialLinks/);
  assert.match(detailSource, /getPartnerNavigation/);
  assert.match(iconSource, /from 'lucide-react'/);
  assert.match(iconSource, /Linkedin/);
  assert.doesNotMatch(detailSource, /<svg/);
});

test('TASI 2026 partner list is ordered and shown on the homepage strip and sponsor page', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { pathToFileURL } = require('node:url');
  const { tasi2026Partners, tasi2026PartnerSlugs } = await import(
    pathToFileURL(path.join(process.cwd(), 'src/data/partners-2026.js'))
  );
  assert.equal(tasi2026Partners.length, 22);
  assert.deepEqual(tasi2026PartnerSlugs.slice(0, 7), [
    'google',
    'netflix',
    'teleperformance',
    'meta',
    'snapchat',
    'booking-com',
    'obhan-mason',
  ]);
  for (const removed of [
    'youtube',
    'truecaller',
    'gsma',
    'x',
    'resolver',
    'vys-vyanams-strategies',
    'obhan-associates',
    'dhirubhai-ambani-university',
    'the-asia-foundation',
    'safetipin',
    'inhope',
    'cor-sandbox',
    'un-women',
    'embassy-of-sweden-in-india',
    'australian-high-commission-india',
    'high-commission-of-canada-in-india',
  ]) {
    assert.ok(!tasi2026PartnerSlugs.includes(removed), removed);
  }
  for (const partner of tasi2026Partners) {
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', partner.logo)),
      `${partner.name} logo exists`
    );
  }

  const read = (file) =>
    fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  const strip = read('src/components/home/sponsors-strip-carousel.jsx');
  assert.match(strip, /from '@\/data\/partners-2026'/);
  assert.match(strip, /Partners of TASI 2026/);
  const sponsor = read('src/components/sponsor/sponsor-page.jsx');
  assert.match(sponsor, /partners=\{tasi2026Partners\}/);
  assert.match(
    read('next.config.mjs'),
    /source: '\/partners\/obhan-associates',\s*destination: '\/partners\/obhan-mason'/
  );
});

test('partners page splits TASI 2026 and TASI 2025 editions', async () => {
  const pageData = await loadModule('src/data/partners-page.js');
  assert.deepEqual(pageData.PARTNER_EDITIONS, ['2025', '2026']);
  assert.equal(pageData.DEFAULT_PARTNER_EDITION, '2026');
  assert.equal(
    pageData.partnersPageHero.editions['2026'].title,
    'Partners of TASI 2026'
  );
  assert.equal(
    pageData.partnersPageHero.editions['2025'].title,
    'Partners of TASI 2025'
  );

  const edition2026 = pageData.getPartnersForEdition('2026');
  const edition2025 = pageData.getPartnersForEdition('2025');
  assert.equal(edition2026.length, 22);
  assert.equal(edition2026[0].slug, 'google');
  assert.equal(edition2025.length, 32);
  assert.ok(edition2025.some((partner) => partner.slug === 'youtube'));
  assert.ok(!edition2025.some((partner) => partner.slug === 'google'));
  for (const partner of [...edition2026, ...edition2025]) {
    assert.ok(pageData.getPartnerBySlug(partner.slug), partner.slug);
    assert.ok(partner.category, `${partner.slug} has a category`);
  }
});

test('TASI 2026 session partners have their own list, separate from sponsors', async () => {
  const {
    tasi2026PartnerSlugs,
    tasi2026SessionPartners,
    tasi2026SessionPartnerSlugs,
  } = await loadModule('src/data/partners-2026.js');
  const pageData = await loadModule('src/data/partners-page.js');

  assert.ok(tasi2026SessionPartners.length > 0);
  for (const slug of tasi2026SessionPartnerSlugs) {
    assert.ok(
      !tasi2026PartnerSlugs.includes(slug),
      `${slug} is listed as both a sponsor and a session partner`
    );
  }
  for (const partner of tasi2026SessionPartners) {
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', partner.logo)),
      `${partner.slug}: logo file is missing`
    );
  }
  assert.equal(pageData.getSessionPartnersForEdition('2025').length, 0);
  assert.equal(
    pageData.getSessionPartnersForEdition('2026'),
    tasi2026SessionPartners
  );
});
