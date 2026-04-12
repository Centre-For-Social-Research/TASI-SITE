const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('speakers directory supports absolute image paths for homepage-only speakers', () => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'components',
    'speakers',
    'directory.jsx'
  );
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /speaker\.photo\.startsWith\('\/'\)\s*\?\s*speaker\.photo/,
    'Expected speaker photo paths to support absolute homepage highlight image URLs'
  );
});
