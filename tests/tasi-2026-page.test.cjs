const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function absolutePath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function readFile(relativePath) {
  return fs.readFileSync(absolutePath(relativePath), 'utf8');
}

async function importModule(relativePath) {
  return import(pathToFileURL(absolutePath(relativePath)));
}

test('TASI 2026 route delegates to the tracked edition page component', () => {
  const source = readFile('src/app/tasi-2026/page.jsx');

  assert.match(
    source,
    /import Tasi2026Page from ['"]@\/components\/editions\/tasi-2026-page['"]/
  );
  assert.match(source, /return <Tasi2026Page \/>;/);
  assert.doesNotMatch(source, /components\/tasi-2026/);
  assert.doesNotMatch(source, /FormatGrid/);
  assert.doesNotMatch(source, /ThemesPreview/);
});

test('TASI 2026 page shell composes the post-event recap sections', () => {
  const source = readFile('src/components/editions/tasi-2026-page.jsx');

  assert.match(
    source,
    /Tasi2026NumbersBand[\s\S]*Tasi2026AboutSection[\s\S]*Tasi2026HighlightsVideoSection[\s\S]*Tasi2026IdeasSection[\s\S]*Tasi2026LaunchesSection[\s\S]*Tasi2026VoicesSection[\s\S]*Tasi2026SessionsSection[\s\S]*Tasi2026RecommendationsSection[\s\S]*Tasi2026GallerySection[\s\S]*Tasi2026LookingAheadSection/
  );
  assert.match(source, /<GlobalCta \/>/);
  assert.match(source, /tasi2026HeroPills/);
  assert.match(source, /tasi2026HeroActions/);
  assert.doesNotMatch(source, /Register For TASI 2026/);
});

test('TASI 2026 edition data holds the recap content', async () => {
  const data = await importModule('src/data/tasi-2026-edition.js');

  assert.deepEqual(data.tasi2026HeroPills, [
    '14-15 October 2026',
    'India International Centre, New Delhi',
    '500+ Participants',
  ]);
  assert.deepEqual(
    data.tasi2026HeroActions.map((action) => action.label),
    ['Watch the Highlights', 'Explore the Programme']
  );
  assert.equal(data.tasi2026Ideas.length, 5);
  assert.equal(data.tasi2026Launches.length, 6);
  assert.equal(data.tasi2026Recommendations.length, 8);
  assert.equal(data.tasi2026SessionRecaps.length, 12);
  assert.equal(data.tasi2026Stats.length, 6);
  for (const idea of data.tasi2026Ideas) {
    assert.ok(idea.stat.source, `${idea.title} credits its figure`);
    assert.ok(idea.sessions.length > 0, `${idea.title} links sessions`);
  }
});

test('TASI 2026 recap never cites Chatham House sessions', async () => {
  const data = await importModule('src/data/tasi-2026-edition.js');
  const chathamHouse = ['tasi26-60', 'tasi26-74', 'tasi26-83'];
  const linked = [
    ...data.tasi2026Ideas.flatMap((idea) => idea.sessions),
    ...data.tasi2026SessionRecaps.map((recap) => recap.id),
  ];

  for (const id of chathamHouse) {
    assert.equal(linked.includes(id), false, id);
  }
});

test('TASI 2026 sections render the recap content flow from data modules', () => {
  const source = readFile('src/components/editions/tasi-2026-sections.jsx');

  assert.match(source, /From Naming Harms to Owning Them/);
  assert.match(source, /Five Things TASI 2026 Made Clear/);
  assert.match(source, /Launched at TASI 2026/);
  assert.match(source, /What Leaders Said/);
  assert.match(source, /Looking Ahead to TASI 2027/);
  assert.match(source, /tasi2026Ideas/);
  assert.match(source, /tasi2026SessionRecaps/);
  assert.match(source, /getProgrammeSessionPath/);
  assert.doesNotMatch(source, /What to Expect at/);
});

test('old TASI 2026 component iteration files stay removed', () => {
  const removedFiles = [
    'src/components/tasi-2026/audience-section.jsx',
    'src/components/tasi-2026/format-grid.jsx',
    'src/components/tasi-2026/structure-section.jsx',
    'src/components/tasi-2026/themes-preview.jsx',
  ];

  for (const file of removedFiles) {
    assert.equal(fs.existsSync(absolutePath(file)), false, file);
  }
});
