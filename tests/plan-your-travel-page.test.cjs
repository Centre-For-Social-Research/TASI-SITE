const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const staleDatasetPattern =
  /const\s+(sections|quickFacts|quickStats|infoItems|airports|railwayStations|nearbyAttractions|immigrationPoints|pathways|additionalSections|hotels)\s*=/;
const mojibakePattern = /[\u00c2\u00c3\u00e2]/;

function repoPath(...segments) {
  return path.join(process.cwd(), ...segments);
}

function readSource(...segments) {
  return fs.readFileSync(repoPath(...segments), 'utf8');
}

async function loadModule(...segments) {
  return import(pathToFileURL(repoPath(...segments)).href);
}

function assertNoMojibake(source, label) {
  assert.equal(
    mojibakePattern.test(source),
    false,
    `${label} should not contain mojibake from old page iterations`
  );
}

test('plan-your-travel routes delegate to tracked page components', () => {
  const routes = [
    {
      file: ['src', 'app', 'plan-your-travel', 'page.jsx'],
      component: 'PlanTravelOverviewPage',
      metadata: 'travelOverviewMetadata',
    },
    {
      file: ['src', 'app', 'plan-your-travel', 'general-info', 'page.jsx'],
      component: 'GeneralInfoPage',
      metadata: 'generalInfoMetadata',
    },
    {
      file: ['src', 'app', 'plan-your-travel', 'how-to-reach', 'page.jsx'],
      component: 'HowToReachPage',
      metadata: 'howToReachMetadata',
    },
    {
      file: ['src', 'app', 'plan-your-travel', 'visa-information', 'page.jsx'],
      component: 'VisaInformationPage',
      metadata: 'visaInformationMetadata',
    },
    {
      file: ['src', 'app', 'plan-your-travel', 'accommodation', 'page.jsx'],
      component: 'AccommodationPage',
      metadata: 'accommodationMetadata',
    },
  ];

  for (const route of routes) {
    const source = readSource(...route.file);

    assert.match(source, new RegExp(`import ${route.component} from `));
    assert.match(source, new RegExp(`import \\{ ${route.metadata} \\}`));
    assert.match(
      source,
      new RegExp(`export const metadata = ${route.metadata};`)
    );
    assert.match(source, /PageSeoJsonLd/);
    assert.match(source, new RegExp(`<${route.component} />`));
    assert.doesNotMatch(source, staleDatasetPattern);
    assertNoMojibake(source, route.file.join('/'));
  }
});

test('plan-your-travel shared data owns all live route datasets', async () => {
  const data = await loadModule('src', 'data', 'plan-your-travel-page.js');

  assert.equal(data.travelTabs.length, 5);
  assert.equal(data.travelOverviewSections.length, 4);
  assert.equal(data.travelQuickFacts.length, 4);
  assert.equal(data.generalQuickStats.length, 6);
  assert.equal(data.generalInfoItems.length, 8);
  assert.equal(data.airports.length, 2);
  assert.equal(data.railwayStations.length, 3);
  assert.equal(data.metroStations.length, 2);
  assert.equal(data.nearbyPlaces.length, 5);
  assert.equal(data.visaSteps.length, 3);
  assert.equal(data.hotels.length, 11);

  assert.equal(
    data.travelOverviewMetadata.title,
    'Plan Travel for Trust and Safety India Festival | TASI 2026'
  );
  assert.equal(
    data.accommodationMetadata.description.includes(
      'Trust and Safety India Festival venue'
    ),
    true
  );

  assertNoMojibake(
    readSource('src', 'data', 'plan-your-travel-page.js'),
    'plan-your-travel-page data'
  );
});

test('travel shell and tab navigation consume the shared travel copy', () => {
  const shell = readSource('src', 'components', 'travel', 'travel-shell.jsx');
  const nav = readSource('src', 'components', 'travel', 'travel-tab-nav.jsx');

  assert.match(shell, /travelShellCopy/);
  assert.match(nav, /travelTabs/);
  assert.match(nav, /usePathname/);
  assert.doesNotMatch(nav, /const\s+tabs\s*=/);
  assertNoMojibake(shell, 'travel shell');
  assertNoMojibake(nav, 'travel tab nav');
});

test('travel page components consume tracked data instead of stale inline datasets', () => {
  const componentFiles = [
    ['src', 'components', 'travel', 'plan-travel-overview-page.jsx'],
    ['src', 'components', 'travel', 'general-info-page.jsx'],
    ['src', 'components', 'travel', 'how-to-reach-page.jsx'],
    ['src', 'components', 'travel', 'visa-information-page.jsx'],
    ['src', 'components', 'travel', 'accommodation-page.jsx'],
  ];

  for (const file of componentFiles) {
    const source = readSource(...file);

    assert.match(source, /@\/data\/plan-your-travel-page/);
    assert.match(source, /\.map\(/);
    assert.doesNotMatch(source, staleDatasetPattern);
    assertNoMojibake(source, file.join('/'));
  }
});

test('travel content is about TASI at IIC, not another venue or event', async () => {
  const data = await loadModule('src', 'data', 'plan-your-travel-page.js');
  const source = readSource('src', 'data', 'plan-your-travel-page.js');
  const components = [
    'plan-travel-overview-page.jsx',
    'general-info-page.jsx',
    'how-to-reach-page.jsx',
    'visa-information-page.jsx',
    'accommodation-page.jsx',
  ].map((file) => readSource('src', 'components', 'travel', file));

  assert.match(data.travelVenue.address, /Max Mueller Marg, Lodhi Estate/);
  assert.deepEqual(
    data.metroStations.map((station) => station.name),
    ['Jor Bagh', 'Khan Market']
  );

  for (const text of [source, ...components]) {
    assert.doesNotMatch(
      text,
      /Summit|Secretariat|Supreme Court Metro|Akshardham|Note Verbale|gratis|Aerocity/i
    );
  }

  for (const hotel of data.hotels) {
    assert.match(hotel.url, /^https?:\/\//);
    assert.match(
      hotel.photo,
      /^\/img\/travel\/hotels\/.+\.webp$/,
      `${hotel.name} should use a locally hosted photo`
    );
    assert.equal(
      fs.existsSync(
        repoPath('public', ...hotel.photo.split('/').filter(Boolean))
      ),
      true,
      `${hotel.photo} should exist under public`
    );
  }
});
