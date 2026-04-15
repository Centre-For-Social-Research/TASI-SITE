const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('TASI 2025 thematic focus cards use the final accent illustration treatment across all tracks', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');
  const accentVariants = source.match(/illustrationVariant:\s*'accent'/g) ?? [];

  assert.match(source, /Thematic Focus/);
  assert.match(source, /Six Key Tracks/);
  assert.match(source, /const tracks = \[/);
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
  assert.doesNotMatch(source, /Information Integrity and Misinformation/);
  assert.doesNotMatch(source, /Thematic Illustration/);
});
