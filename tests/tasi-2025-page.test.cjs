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

test('TASI 2025 page shell delegates the edition sections instead of owning stale iterations', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');

  assert.match(source, /Tasi2025AboutSection/);
  assert.match(source, /Tasi2025JourneySection/);
  assert.match(source, /Tasi2025KeynotesSection/);
  assert.match(source, /Tasi2025TracksSection/);
  assert.match(source, /Tasi2025InauguralKeynoteSection/);
  assert.match(source, /Tasi2025ResearchSpotlightsSection/);
  assert.match(source, /Tasi2025RecommendationsSection/);
  assert.match(source, /Tasi2025LookingAheadSection/);
  assert.match(source, /Tasi2025Quotes/);
  assert.match(source, /<GlobalCta \/>/);
  assert.match(source, /tasi2025HeroPills/);
  assert.doesNotMatch(source, /const tracks = \[/);
  assert.doesNotMatch(source, /function TrackIllustration/);
});

test('TASI 2025 edition data keeps only the fields consumed by the live page', async () => {
  const data = await importModule('src/data/tasi-2025-edition.js');

  assert.equal(data.tasi2025Tracks.length, 6);
  assert.deepEqual(
    data.tasi2025Tracks.map((track) => track.illustration),
    ['orbit', 'shield', 'signal', 'support', 'foundation', 'network']
  );
  assert.equal(
    data.tasi2025Tracks.some((track) => 'illustrationVariant' in track),
    false
  );
  assert.equal(
    data.tasi2025JourneyTimeline.some((item) => 'category' in item),
    false
  );
  assert.equal(data.tasi2025JourneyTimeline.length, 5);
  assert.equal(data.tasi2025KeynoteVideos.length, 2);
  assert.equal(data.tasi2025Quotes.length, 3);
});

test('TASI 2025 sections preserve the reviewed content flow and key media', () => {
  const source = readFile('src/components/editions/tasi-2025-sections.jsx');

  assert.match(source, /About the Festival/);
  assert.match(source, /Festival Journey/);
  assert.match(source, /The edition in one connected arc/);
  assert.match(source, /Featured Session/);
  assert.match(source, /Thematic Focus/);
  assert.match(source, /Six Key Tracks/);
  assert.match(
    source,
    /About the Festival[\s\S]*Festival Journey[\s\S]*The edition in one connected arc[\s\S]*<RadialOrbitalTimeline[\s\S]*Featured Session/
  );
  assert.match(
    source,
    /<RadialOrbitalTimeline\s+timelineData=\{tasi2025JourneyTimeline\}\s+variant="compact"\s+\/>/
  );
  assert.match(source, /tasi-2025-jaishankar-keynote\.png/);
  assert.match(source, /md:grid-cols-\[0\.94fr_1\.06fr\] md:items-stretch/);
  assert.match(
    source,
    /className="flex h-full flex-col justify-between pt-8 md:pt-10"/
  );
  assert.match(source, /md:min-h-\[30rem\]/);
  assert.match(source, /Arc \{String\(index \+ 1\)\.padStart\(2, '0'\)\}/);
  assert.match(
    source,
    /aspect-\[3\/2\] md:h-full md:min-h-\[100%\] md:aspect-auto/
  );
  assert.doesNotMatch(source, /Information Integrity and Misinformation/);
  assert.doesNotMatch(source, /Thematic Illustration/);
});

test('TASI 2025 track illustration is the final accent treatment only', () => {
  const source = readFile(
    'src/components/editions/tasi-2025-track-illustration.jsx'
  );

  assert.match(source, /cardIllustration/);
  assert.match(source, /rgba\(53,2,101,0\.92\)/);
  assert.match(source, /rgba\(255,105,0,0\.78\)/);
  assert.doesNotMatch(source, /illustrationVariant/);
  assert.doesNotMatch(source, /isSubtle/);
  assert.doesNotMatch(source, /subtle/);
});

test('radial timeline keeps the compact journey implementation and removes stale controls', () => {
  const source = readFile(
    'src/components/editions/radial-orbital-timeline.tsx'
  );

  assert.match(source, /ArrowUpRight,/);
  assert.match(source, /Building2,/);
  assert.match(source, /Lightbulb,/);
  assert.match(source, /Mic2,/);
  assert.match(source, /Orbit,/);
  assert.match(source, /const iconMap = \{/);
  assert.match(source, /icon: keyof typeof iconMap;/);
  assert.match(source, /variant\?: ['"]immersive['"] \| ['"]compact['"];/);
  assert.match(source, /const isCompact = variant === ['"]compact['"];/);
  assert.match(source, /const radius = isCompact \? 132 : 272;/);
  assert.match(
    source,
    /flex w-full items-center justify-center rounded-\[10px\] border border-white\/65 bg-\[radial-gradient/
  );
  assert.match(
    source,
    /relative flex w-full items-center justify-center py-12 md:py-14 lg:py-16/
  );
  assert.match(source, /h-\[28rem\] w-\[28rem\] border border-white\/80/);
  assert.match(source, /Connected Nodes/);
  assert.doesNotMatch(source, /\bArrowRight\b/);
  assert.doesNotMatch(source, /\bLink\b/);
  assert.doesNotMatch(source, /\bButton\b/);
  assert.doesNotMatch(source, /setViewMode/);
  assert.doesNotMatch(source, /viewMode/);
  assert.doesNotMatch(source, /category: string/);
  assert.doesNotMatch(source, /Energy Level/);
  assert.doesNotMatch(source, /Zap,/);
});
