const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('receptions 2026 page keeps only a short update notice below the hero', () => {
  const source = readFile('src/components/receptions/receptions-page.jsx');

  assert.match(source, /Reception details will be updated soon\./);
  assert.doesNotMatch(source, /Why These Receptions Matter/);
  assert.doesNotMatch(source, /Who Should Plan To Be In The Room/);
  assert.doesNotMatch(source, /How Access Works/);
  assert.doesNotMatch(source, /Begin delegate registration/);
});

test('receptions 2026 page removes the old placeholder-style cards', () => {
  const source = readFile('src/components/receptions/receptions-page.jsx');

  assert.doesNotMatch(source, /Festival purchase flow moved/);
  assert.doesNotMatch(source, /Receptions stay visible/);
  assert.doesNotMatch(source, /Clearer site structure/);
  assert.doesNotMatch(source, /Festival purchase lives on \/register/);
});
