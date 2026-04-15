const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('TASI 2025 thematic focus cards use the final accent illustration treatment across all tracks', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');
  const timelineSource = readFile(
    'src/components/editions/radial-orbital-timeline.tsx'
  );
  const accentVariants = source.match(/illustrationVariant:\s*'accent'/g) ?? [];

  assert.match(source, /Thematic Focus/);
  assert.match(source, /Six Key Tracks/);
  assert.match(source, /const tracks = \[/);
  assert.match(
    source,
    /import RadialOrbitalTimeline from ['"]@\/components\/editions\/radial-orbital-timeline['"]/
  );
  assert.match(
    source,
    /<RadialOrbitalTimeline\s+timelineData=\{festivalJourneyTimeline\}\s+variant="compact"\s+\/>/
  );
  assert.match(source, /const festivalJourneyTimeline = \[/);
  assert.match(source, /const festivalJourneyEditorialNotes = \[/);
  assert.doesNotMatch(source, /illustrationVariant:\s*'subtle'/);
  assert.equal(accentVariants.length, 6);
  assert.match(source, /cardIllustration/);
  assert.match(source, /tasi-2025-jaishankar-keynote\.png/);
  assert.match(source, /md:items-stretch/);
  assert.match(source, /md:h-full/);
  assert.match(
    source,
    /aspect-\[3\/2\] md:h-full md:min-h-\[100%\] md:aspect-auto/
  );
  assert.doesNotMatch(
    source,
    /<div className="relative aspect-\[4\/5\] md:aspect-\[4\/4\.5\]">/
  );
  assert.match(source, /Festival Journey/);
  assert.match(source, /The edition in one connected arc/);
  assert.match(
    source,
    /md:grid-cols-\[0\.94fr_1\.06fr\] md:items-stretch/
  );
  assert.match(source, /className="flex h-full flex-col justify-between pt-8 md:pt-10"/);
  assert.match(source, /md:min-h-\[30rem\]/);
  assert.match(source, /Arc \{String\(index \+ 1\)\.padStart\(2, '0'\)\}/);
  assert.match(source, /<GlobalCta \/>/);
  assert.match(
    source,
    /About the Festival[\s\S]*Festival Journey[\s\S]*The edition in one connected arc[\s\S]*<RadialOrbitalTimeline[\s\S]*Featured Session/
  );
  assert.doesNotMatch(source, /Information Integrity and Misinformation/);
  assert.doesNotMatch(source, /Thematic Illustration/);
  assert.match(timelineSource, /const \[viewMode, setViewMode\] = useState<"orbital">\("orbital"\);/);
  assert.match(timelineSource, /ArrowRight,/);
  assert.match(timelineSource, /ArrowUpRight,/);
  assert.match(timelineSource, /Building2,/);
  assert.match(timelineSource, /Lightbulb,/);
  assert.match(timelineSource, /Link,/);
  assert.match(timelineSource, /Mic2,/);
  assert.match(timelineSource, /Orbit,/);
  assert.doesNotMatch(timelineSource, /Zap,/);
  assert.match(timelineSource, /const iconMap = \{/);
  assert.match(timelineSource, /icon: keyof typeof iconMap;/);
  assert.match(timelineSource, /variant\?: "immersive" \| "compact";/);
  assert.match(timelineSource, /const isCompact = variant === "compact";/);
  assert.match(timelineSource, /const radius = isCompact \? 132 : 272;/);
  assert.match(timelineSource, /flex w-full items-center justify-center rounded-\[10px\] border border-white\/65 bg-\[radial-gradient/);
  assert.match(
    timelineSource,
    /relative flex w-full items-center justify-center py-12 md:py-14 lg:py-16/
  );
  assert.match(
    timelineSource,
    /absolute inset-0 flex items-center justify-center/
  );
  assert.match(timelineSource, /h-\[28rem\] w-\[28rem\] border border-white\/80/);
  assert.doesNotMatch(timelineSource, /Energy Level/);
  assert.match(timelineSource, /Connected Nodes/);
  assert.match(source, /Opening Convening/);
  assert.doesNotMatch(source, /Arrival in New Delhi/);
  assert.match(source, /Keynote Moments/);
  assert.match(source, /Six Key Tracks/);
  assert.match(source, /Core Takeaways/);
  assert.match(source, /TASI 2026/);
});
