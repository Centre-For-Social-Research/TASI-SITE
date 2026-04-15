const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const heroPath = path.join(
  process.cwd(),
  'src',
  'components',
  'home',
  'hero.jsx'
);

test('home hero applies SparklesText only to 2026 and Delhi', () => {
  const source = fs.readFileSync(heroPath, 'utf8');

  assert.match(
    source,
    /import SparklesText from ['"]@\/components\/ui\/sparkles-text['"]/
  );
  assert.match(source, /<SparklesText[^>]*>\s*2026\s*<\/SparklesText>/);
  assert.match(source, /<SparklesText[^>]*>\s*Delhi\s*<\/SparklesText>/);
  assert.doesNotMatch(source, /<SparklesText[^>]*>\s*TASI\s*<\/SparklesText>/);
});
