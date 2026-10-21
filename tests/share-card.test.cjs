const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  CARD_CAPTION,
  cardFileName,
  fitFontSize,
  initialsFor,
  truncateToWidth,
  wrapLines,
} = require('../src/lib/share-card-utils.cjs');

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('the card template ships with the site', () => {
  assert.ok(
    fs.existsSync(
      path.join(
        process.cwd(),
        'public/img/share-card/tasi-2026-badge-card-bg.webp'
      )
    )
  );
});

test('the card is made in the browser and never uploads the photo', () => {
  const source = read('src/components/share-card/share-card-builder.jsx');
  assert.match(source, /URL\.createObjectURL\(file\)/);
  assert.doesNotMatch(source, /fetch\(|FormData|XMLHttpRequest|supabase/i);
});

test('initials, file names and caption', () => {
  assert.equal(initialsFor('Saquib Jamil'), 'SJ');
  assert.equal(initialsFor('  manoj '), 'M');
  assert.equal(initialsFor(''), '');
  assert.equal(
    cardFileName('Jarūnė Preikšaitė'),
    'tasi-2026-jarune-preiksaite.png'
  );
  assert.equal(cardFileName(''), 'tasi-2026-attending.png');
  assert.match(CARD_CAPTION, /#TASI2026/);
});

test('long names shrink and long lines wrap', () => {
  const measure = (text) => text.length * 10;
  assert.equal(
    fitFontSize((size) => size * 10, { max: 56, min: 34, maxWidth: 700 }),
    56
  );
  assert.equal(
    fitFontSize((size) => size * 20, { max: 56, min: 34, maxWidth: 700 }),
    34
  );
  assert.deepEqual(wrapLines('Head of Trust and Safety', measure, 120), [
    'Head of',
    'Trust and',
    'Safety',
  ]);
  assert.deepEqual(wrapLines('', measure, 120), []);
  assert.equal(truncateToWidth('Short', measure, 120), 'Short');
  assert.equal(
    truncateToWidth('A very long organisation name', measure, 120),
    'A very long…'
  );
});

test('the attending card closes once TASI 2026 is over', () => {
  const { isShareCardOpen } = require('../src/lib/share-card-utils.cjs');

  assert.equal(isShareCardOpen(new Date('2026-10-15T20:00:00+05:30')), true);
  assert.equal(isShareCardOpen(new Date('2026-10-16T00:00:00+05:30')), false);
});
