const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('package manifest does not mix legacy particles.js with tsParticles', () => {
  const manifest = JSON.parse(readSource('package.json'));

  assert.ok(manifest.dependencies['@tsparticles/engine']);
  assert.ok(manifest.dependencies['@tsparticles/react']);
  assert.equal(manifest.dependencies['particles.js'], undefined);
});

test('light hero particles component does not import legacy particles.js', () => {
  const source = readSource('src/components/ui/light-hero-particles.jsx');

  assert.doesNotMatch(source, /import\('particles\.js'\)/);
  assert.doesNotMatch(source, /window\.particlesJS/);
});
