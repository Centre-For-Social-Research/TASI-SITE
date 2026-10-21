const test = require('node:test');
const assert = require('node:assert/strict');

const { safeCell, escapeCsv } = require('../src/lib/csv-cell.cjs');
const {
  buildSubmissionCsv,
} = require('../src/lib/submission-export-utils.cjs');
const { buildCsvExport } = require('../src/lib/badge-export-utils.cjs');

test('safeCell neutralises formula-leading cells', () => {
  for (const value of [
    '=HYPERLINK("x")',
    '+1',
    '-1',
    '@SUM(A1)',
    ' =1',
    '\t=1',
  ]) {
    assert.equal(safeCell(value), `'${value}`);
  }
  assert.equal(safeCell('Ada Lovelace'), 'Ada Lovelace');
  assert.equal(safeCell(null), '');
});

test('escapeCsv quotes after neutralising', () => {
  assert.equal(escapeCsv('=1,2'), `"'=1,2"`);
  assert.equal(escapeCsv('say "hi"'), '"say ""hi"""');
});

test('submission and badge CSV exports neutralise formulas', () => {
  const rows = [{ name: '=cmd|"/c calc"!A1', organization: 'TASI' }];
  assert.match(buildSubmissionCsv(rows), /"'=cmd\|""\/c calc""!A1"/);
  assert.match(buildCsvExport(rows), /"'=cmd\|""\/c calc""!A1"/);
});
