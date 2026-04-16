const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('branded hero uses shared light-only particles while preserving dark particles', () => {
  const hero = readFile('src/components/ui/branded-page-hero.jsx');
  const lightParticles = readFile(
    'src/components/ui/light-hero-particles.jsx'
  );
  const aboutPage = readFile('src/app/about/page.jsx');
  const packageJson = readFile('package.json');

  assert.match(
    hero,
    /import LightHeroParticles from ['"]@\/components\/ui\/light-hero-particles['"]/
  );
  assert.match(hero, /<LightHeroParticles \/>/);
  assert.match(hero, /<DarkHeroParticles \/>/);
  assert.match(lightParticles, /'use client';/);
  assert.match(lightParticles, /@tsparticles\/react/);
  assert.match(lightParticles, /loadSlim/);
  assert.match(lightParticles, /<Particles/);
  assert.match(lightParticles, /dark:hidden/);
  assert.match(lightParticles, /value:\s*'#ffe7a8'/);
  assert.match(
    aboutPage,
    /<BrandedPageHero[\s\S]*className="min-h-\[300px\] py-14 md:min-h-\[360px\] md:py-20"/
  );
  assert.doesNotMatch(aboutPage, /backgroundLayer=\{/);
  assert.doesNotMatch(packageJson, /"particles\.js":/);
});
