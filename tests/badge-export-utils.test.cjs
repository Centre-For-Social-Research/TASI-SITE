const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let badgeExportUtils;

test('badge export utils module loads', async () => {
  badgeExportUtils = require('../src/lib/badge-export-utils.cjs');
  assert.ok(badgeExportUtils);
});

test('buildCsvExport serializes rows with a header row', async () => {
  if (!badgeExportUtils) {
    badgeExportUtils = require('../src/lib/badge-export-utils.cjs');
  }

  const csv = badgeExportUtils.buildCsvExport([
    {
      registration_code: 'TASI-001',
      first_name: 'Ada',
      organization: 'Trust, Safety & Co',
    },
  ]);

  assert.match(csv, /registration_code,first_name,organization/);
  assert.match(csv, /TASI-001,Ada,"Trust, Safety & Co"/);
});

test('buildExcelExport returns an xlsx buffer', async () => {
  if (!badgeExportUtils) {
    badgeExportUtils = require('../src/lib/badge-export-utils.cjs');
  }

  const buffer = await badgeExportUtils.buildExcelExport([
    {
      registration_code: 'TASI-001',
      first_name: 'Ada',
      status: 'confirmed',
    },
  ]);

  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 2).toString(), 'PK');
});

test('combined PDF export is rejected while individual QR email PDF remains', () => {
  const exportRoute = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/admin/badges/export/route.js'),
    'utf8'
  );
  const pass = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/registration-pass.js'),
    'utf8'
  );
  const delivery = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/pass-issue-job-service.js'),
    'utf8'
  );

  assert.match(exportRoute, /format !== 'csv' && format !== 'xlsx'/);
  assert.doesNotMatch(exportRoute, /buildPdfMergeExport/);
  assert.match(pass, /entry-pass\.pdf/);
  assert.match(delivery, /pdfAttachment/);
});
