const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function loadModule(relativePath) {
  return import(pathToFileURL(path.join(process.cwd(), relativePath)).href);
}

test('themes route delegates to the tracked page component and metadata', () => {
  const source = readFile('src/app/themes/page.jsx');

  assert.match(
    source,
    /import ThemesPage from '@\/components\/themes\/themes-page'/
  );
  assert.match(
    source,
    /import \{ themesPageMetadata \} from '@\/data\/themes-2026'/
  );
  assert.match(source, /export const metadata = themesPageMetadata;/);
  assert.match(source, /return <ThemesPage \/>;/);
  assert.doesNotMatch(source, /const\s+iconMap\s*=/);
  assert.doesNotMatch(source, /themes2026\.map/);
});

test('themes data owns page copy and all live theme records', async () => {
  const data = await loadModule('src/data/themes-2026.js');

  assert.equal(data.themes2026.length, 14);
  assert.equal(data.themesPageHero.stats.length, 4);
  assert.equal(data.themesPageHero.title, 'TASI 2026');
  assert.equal(data.themesPageHero.titleAccent, 'Themes');
  assert.equal(data.themesPageCta.href, '/register');
  assert.equal(data.themesPageMetadata.title, 'Themes | TASI 2026');
  assert.equal(data.themesPageMetadata.alternates.canonical, '/themes');
});

test('themes component consumes tracked data and icon registry', () => {
  const source = readFile('src/components/themes/themes-page.jsx');
  const iconSource = readFile('src/components/themes/theme-icons.jsx');

  assert.match(source, /themesPageHero/);
  assert.match(source, /themesPageIntro/);
  assert.match(source, /themesPageCta/);
  assert.match(source, /themes2026\.map/);
  assert.match(source, /themeIcons\[item\.iconKey\]/);
  assert.match(iconSource, /export const themeIcons/);
  assert.doesNotMatch(source, /const\s+iconMap\s*=/);
});
