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
    /<Tasi2026HighlightsVideoSection[\s\S]*<Tasi2026DayStoriesSection[\s\S]*<Tasi2026ChiefGuestSection[\s\S]*<Tasi2026LaunchesSection[\s\S]*<Tasi2026RecommendationsSection[\s\S]*<Tasi2026VoicesSection[\s\S]*<Tasi2026ArticleSection[\s\S]*<Tasi2026SpeakersWallSection[\s\S]*<Tasi2026Gallery/
  );
  assert.doesNotMatch(source, /Tasi2026SessionsSection/);
  assert.doesNotMatch(source, /GlobalCta/);
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

  assert.doesNotMatch(source, /From Naming Harms to Owning Them/);
  assert.doesNotMatch(source, /Five Things TASI 2026 Made Clear/);
  assert.match(source, /Introduced at TASI 2026/);
  assert.match(source, /What Leaders Said/);
  assert.doesNotMatch(source, /TASI returns in October 2027/);
  assert.match(source, /tasi2026ChiefGuest/);
  assert.doesNotMatch(source, /Explore the Conversations/);
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

test('TASI 2026 recap ships its public sizzler, captions and curated photos', async () => {
  const data = await importModule('src/data/tasi-2026-edition.js');
  assert.equal(
    data.tasi2026HighlightsVideoSrc,
    '/video/tasi-2026-highlights-v3.mp4'
  );
  const video = fs.statSync(
    absolutePath(`public${data.tasi2026HighlightsVideoSrc}`)
  );
  assert.ok(video.size > 0 && video.size < 25 * 1024 * 1024);
  const captions = readFile('public/video/tasi-2026-highlights-v3.en.vtt');
  assert.ok(captions.startsWith('WEBVTT'));
  assert.match(captions, /human-centric/);
  for (const src of [
    ...data.tasi2026Gallery.map((photo) => photo.src),
    ...data.tasi2026Ideas.map((idea) => idea.image),
  ]) {
    assert.ok(fs.existsSync(absolutePath(`public${src}`)), src);
  }
});

test('TASI 2026 chief guest, journey and speaker wall use real assets and profiles', async () => {
  const data = await importModule('src/data/tasi-2026-edition.js');
  const speakers = JSON.parse(readFile('src/data/speakers-2026.json'));
  const names = new Set(speakers.map((speaker) => speaker.name));

  assert.equal(data.tasi2026ChiefGuest.name, 'Jitin Prasada');
  assert.ok(
    fs.existsSync(absolutePath(`public${data.tasi2026ChiefGuest.photo}`))
  );
  assert.ok(names.has(data.tasi2026ChiefGuest.name));
  for (const name of data.tasi2026FeaturedSpeakers) {
    const speaker = speakers.find((entry) => entry.name === name);
    assert.ok(speaker, `${name} needs a 2026 profile`);
    assert.ok(
      fs.existsSync(absolutePath(`public${speaker.photo}`)),
      `${name} needs a photo`
    );
  }
});
