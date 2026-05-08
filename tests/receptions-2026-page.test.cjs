const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const receptionComponentFiles = [
  'src/components/receptions/receptions-page.jsx',
  'src/components/receptions/reception-2025-content.jsx',
  'src/components/receptions/reception-2026-update.jsx',
  'src/components/receptions/reception-ui.jsx',
];

function absolutePath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function readFile(relativePath) {
  return fs.readFileSync(absolutePath(relativePath), 'utf8');
}

function readFiles(relativePaths) {
  return relativePaths.map(readFile).join('\n');
}

test('receptions 2026 page keeps only a short update notice below the hero', () => {
  const updateSource = readFile(
    'src/components/receptions/reception-2026-update.jsx'
  );
  const allSources = readFiles(receptionComponentFiles);

  assert.match(updateSource, /Reception details will be updated soon\./);
  assert.doesNotMatch(allSources, /Why These Receptions Matter/);
  assert.doesNotMatch(allSources, /Who Should Plan To Be In The Room/);
  assert.doesNotMatch(allSources, /How Access Works/);
  assert.doesNotMatch(allSources, /Begin delegate registration/);
});

test('receptions 2026 page removes the old placeholder-style cards', () => {
  const source = readFiles(receptionComponentFiles);

  assert.doesNotMatch(source, /Festival purchase flow moved/);
  assert.doesNotMatch(source, /Receptions stay visible/);
  assert.doesNotMatch(source, /Clearer site structure/);
  assert.doesNotMatch(source, /Festival purchase lives on \/register/);
});

test('receptions page is composed from tracked 2025, 2026, and shared UI modules', () => {
  const pageSource = readFile('src/components/receptions/receptions-page.jsx');

  assert.match(pageSource, /Reception2025Content/);
  assert.match(pageSource, /Reception2026Update/);
  assert.match(pageSource, /ReceptionModeToggle/);
  assert.equal(
    fs.existsSync(
      absolutePath('src/components/receptions/reception-ticketing-2026.jsx')
    ),
    false
  );
});

test('receptions data does not keep unused agenda item artifacts', () => {
  const source = readFile('src/data/receptions.js');

  assert.match(source, /featuredPeople/);
  assert.doesNotMatch(source, /agendaItems/);
  assert.doesNotMatch(source, /timeStart/);
  assert.doesNotMatch(source, /speakerName/);
});

test('receptions page avoids low-contrast dark-mode accent tokens and raw bg-white pills', () => {
  const source = readFiles(receptionComponentFiles);

  assert.doesNotMatch(source, /dark:text-rc-secondary/);
  assert.doesNotMatch(source, /'bg-white text-\[#140f26\]'/);
});

test('receptions page keeps embassy logos unchanged across light and dark mode', () => {
  const source = readFiles(receptionComponentFiles);

  assert.doesNotMatch(source, /dark:invert/);
  assert.doesNotMatch(source, /dark:brightness-200/);
});

test('receptions page keeps embassy logo circles white in dark mode', () => {
  const source = readFiles([
    'src/components/receptions/reception-2025-content.jsx',
    'src/components/receptions/reception-ui.jsx',
  ]);

  const matches =
    source.match(
      /className="relative flex h-(?:12|16) w-(?:12|16) items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-\[#fff\] dark:border-slate-700"/g
    ) || [];
  assert.equal(matches.length, 2);
});
