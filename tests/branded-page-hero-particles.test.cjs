const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('branded hero mounts only the particles for the current theme', () => {
  const hero = readFile('src/components/ui/branded-page-hero.jsx');
  const heroParticles = readFile('src/components/ui/hero-particles.jsx');
  const lightParticles = readFile('src/components/ui/light-hero-particles.jsx');
  const aboutPage = readFile('src/app/about/page.jsx');
  const packageJson = readFile('package.json');

  // The hero mounts one shared component that picks the light or dark field
  // for the current theme, so only one particle loop runs at a time.
  assert.match(
    hero,
    /import HeroParticles from ['"]@\/components\/ui\/hero-particles['"]/
  );
  assert.match(hero, /<HeroParticles \/>/);
  assert.match(
    heroParticles,
    /import LightHeroParticles from ['"]@\/components\/ui\/light-hero-particles['"]/
  );
  assert.match(heroParticles, /<LightHeroParticles \/>/);
  assert.match(heroParticles, /<DarkHeroParticles \/>/);
  assert.match(heroParticles, /resolvedTheme === 'dark'/);
  assert.match(heroParticles, /prefers-reduced-motion: reduce/);
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
