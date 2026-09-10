const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeSubmissionType,
  parseMessageFields,
  normalizeContactSubmission,
  normalizeStructuredSubmission,
  submissionToExportRow,
} = require('../src/lib/submission-utils.cjs');
const {
  buildSubmissionCsv,
  buildSubmissionExcel,
} = require('../src/lib/submission-export-utils.cjs');

test('speaker application fields and multiline pitch are parsed', () => {
  const item = normalizeContactSubmission(
    {
      id: 12,
      email: 'ada@example.com',
      source: 'speaker-application',
      created_at: '2026-09-10T10:00:00Z',
      message:
        'Speaker application for TASI 2026\nName: Ada Rao\nEmail: ada@example.com\nOrganization: Example Org\nSuggested topic: Safety\n\nPitch:\nFirst line\nSecond line',
    },
    'speaker'
  );
  assert.equal(item.name, 'Ada Rao');
  assert.equal(item.context, 'Example Org');
  assert.equal(
    item.fields.find(({ label }) => label === 'Pitch').value,
    'First line\nSecond line'
  );
});

test('media and exhibition labels are parsed without changing stored data', () => {
  const media = parseMessageFields(
    'Intro\nName: Dev Shah\nPublication: Newsroom\nBusiness email: dev@example.com\nIntends to cover: Both days'
  );
  assert.equal(
    media.find(({ label }) => label === 'Publication').value,
    'Newsroom'
  );
  const exhibition = normalizeContactSubmission(
    {
      id: 2,
      email: 'team@example.com',
      source: 'exhibition-enquiry',
      created_at: '2026-09-10T10:00:00Z',
      message:
        'Exhibition enquiry for TASI 2026\nName: Team Lead\nCompany: Acme\nEmail: team@example.com\n\nEnquiry details:\nNeed a booth',
    },
    'exhibition'
  );
  assert.equal(exhibition.context, 'Acme');
  assert.equal(exhibition.fields.at(-1).value, 'Need a booth');
});

test('structured newsletter rows and exports retain useful fields', async () => {
  const item = normalizeStructuredSubmission(
    {
      id: 9,
      email: 'reader@example.com',
      status: 'active',
      source: 'site-footer',
      subscribed_at: '2026-09-10T10:00:00Z',
    },
    'newsletter'
  );
  const row = submissionToExportRow(item);
  const csv = buildSubmissionCsv([row]);
  assert.match(csv, /Newsletter/);
  assert.match(csv, /reader@example\.com/);
  const workbook = await buildSubmissionExcel([row], 'Newsletter');
  assert.ok(Buffer.isBuffer(workbook));
  assert.ok(workbook.length > 1000);
});

test('unknown submission type safely defaults to speaker', () => {
  assert.equal(normalizeSubmissionType('anything'), 'speaker');
});
