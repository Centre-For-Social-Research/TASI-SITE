const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function absolutePath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function readFile(relativePath) {
  return fs.readFileSync(absolutePath(relativePath), 'utf8');
}

async function importModule(relativePath) {
  return import(pathToFileURL(absolutePath(relativePath)));
}

test('TASI 2026 route delegates to the tracked edition page component', () => {
  const source = readFile('src/app/tasi-2026/page.jsx');

  assert.match(
    source,
    /import Tasi2026Page from ['"]@\/components\/editions\/tasi-2026-page['"]/
  );
  assert.match(source, /return <Tasi2026Page \/>;/);
  assert.doesNotMatch(source, /components\/tasi-2026/);
  assert.doesNotMatch(source, /FormatGrid/);
  assert.doesNotMatch(source, /ThemesPreview/);
});

test('TASI 2026 page shell composes live sections from shared data', () => {
  const source = readFile('src/components/editions/tasi-2026-page.jsx');

  assert.match(source, /Tasi2026FormatSection/);
  assert.match(source, /Tasi2026StructureSection/);
  assert.match(source, /Tasi2026ThemesSection/);
  assert.match(source, /Tasi2026AudienceSection/);
  assert.match(source, /<GlobalCta \/>/);
  assert.match(source, /tasi2026HeroPills/);
  assert.match(source, /tasi2026HeroActions/);
  assert.doesNotMatch(source, /const formatItems = \[/);
  assert.doesNotMatch(source, /const audience = \[/);
  assert.doesNotMatch(source, /const stats = \[/);
  assert.doesNotMatch(source, /const formats = \[/);
});

test('TASI 2026 edition data keeps only live page datasets', async () => {
  const data = await importModule('src/data/tasi-2026-edition.js');

  assert.deepEqual(data.tasi2026HeroPills, [
    '14-15 October 2026',
    'New Delhi',
    'In person and online',
  ]);
  assert.deepEqual(
    data.tasi2026HeroActions.map((action) => action.label),
    ['Buy Festival Pass', 'Register For TASI 2026']
  );
  assert.equal(data.tasi2026FormatItems.length, 4);
  assert.equal(data.tasi2026StructureStats.length, 3);
  assert.equal(data.tasi2026StructureFormats.length, 6);
  assert.equal(data.tasi2026AudienceSegments.length, 4);
  assert.equal(
    data.tasi2026FormatItems.some((item) => item.title === 'Spotlights'),
    true
  );
});

test('TASI 2026 sections render the expected content flow from data modules', () => {
  const source = readFile('src/components/editions/tasi-2026-sections.jsx');

  assert.match(source, /What to Expect at/);
  assert.match(source, /Convening/);
  assert.match(source, /Strategic Focus/);
  assert.match(source, /Who Will You/);
  assert.match(
    source,
    /Tasi2026FormatSection[\s\S]*Tasi2026StructureSection[\s\S]*Tasi2026ThemesSection[\s\S]*Tasi2026AudienceSection/
  );
  assert.match(source, /tasi2026FormatItems/);
  assert.match(source, /tasi2026StructureStats/);
  assert.match(source, /tasi2026StructureFormats/);
  assert.match(source, /tasi2026AudienceSegments/);
  assert.match(source, /themes2026/);
  assert.match(source, /themeIconMap/);
});

test('old TASI 2026 component iteration files stay removed', () => {
  const removedFiles = [
    'src/components/tasi-2026/audience-section.jsx',
    'src/components/tasi-2026/format-grid.jsx',
    'src/components/tasi-2026/structure-section.jsx',
    'src/components/tasi-2026/themes-preview.jsx',
  ];

  for (const file of removedFiles) {
    assert.equal(fs.existsSync(absolutePath(file)), false, file);
  }
});
