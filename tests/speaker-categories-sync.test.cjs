const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ExcelJS = require('exceljs');

const REVIEW_SHEET_PATH = path.join(
  process.cwd(),
  'speaker-category-review-v2-2026-04-12.xlsx'
);

test('speaker profile categories match the reviewed Excel sheet', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(REVIEW_SHEET_PATH);

  const sheet = workbook.getWorksheet('Speaker Category Review');
  assert.ok(sheet, 'Expected "Speaker Category Review" worksheet to exist');

  const reviewedCategories = new Map();
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const name = sheet.getCell(`A${rowIndex}`).text.trim();
    const category = sheet.getCell(`C${rowIndex}`).text.trim();
    if (name) reviewedCategories.set(name, category);
  }

  const speakersModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/speakers.js')
  ).href;
  const { speakers } = await import(speakersModuleUrl);

  assert.equal(
    reviewedCategories.size,
    speakers.length,
    'Workbook and speaker data should contain the same number of profiles'
  );

  const mismatches = speakers
    .map((speaker) => {
      const expected = reviewedCategories.get(speaker.name);
      return {
        name: speaker.name,
        expected,
        actual: speaker.category,
      };
    })
    .filter(({ expected, actual }) => expected !== actual);

  assert.deepEqual(
    mismatches,
    [],
    `Expected categories to match reviewed sheet, found mismatches for: ${mismatches
      .map((item) => item.name)
      .join(', ')}`
  );
});
