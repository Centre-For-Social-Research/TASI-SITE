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
    assert.match(source, new RegExp(`return <${route.component} />;`));
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
  assert.equal(data.generalInfoItems.length, 10);
  assert.equal(data.airports.length, 4);
  assert.equal(data.railwayStations.length, 3);
  assert.equal(data.nearbyAttractions.length, 5);
  assert.equal(data.immigrationPoints.length, 6);
  assert.equal(data.visaPathways.length, 3);
  assert.equal(data.visaAdditionalSections.length, 2);
  assert.equal(data.hotels.length, 26);

  assert.equal(
    data.travelOverviewMetadata.title,
    'Plan Your Travel - TASI 2026'
  );
  assert.equal(
    data.accommodationMetadata.description.includes('26 premier hotels'),
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

test('local travel image assets referenced by data exist', async () => {
  const data = await loadModule('src', 'data', 'plan-your-travel-page.js');
  const localImages = [
    ...data.nearbyAttractions.map((attraction) => attraction.image),
    ...data.hotels.map((hotel) => hotel.photo),
  ].filter((image) => image.startsWith('/img/'));

  assert.equal(localImages.length > 0, true);

  for (const image of localImages) {
    assert.equal(
      fs.existsSync(repoPath('public', ...image.split('/').filter(Boolean))),
      true,
      `${image} should exist under public`
    );
  }
});
