const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildAdminStatPills,
  buildAdminNavigation,
} = require('../src/lib/admin-shell-utils.cjs');

test('buildAdminStatPills derives qr queue and failed delivery counts', () => {
  const pills = buildAdminStatPills({
    summary: {
      pending: 18,
      confirmed: 64,
      qrIssued: 52,
      checkedIn: 27,
    },
    jobs: [{ failed_items: 2 }, { failed_items: 1 }],
  });

  assert.deepEqual(pills, [
    { key: 'pending', label: 'Pending', value: 18, tone: 'warning' },
    { key: 'qrQueue', label: 'QR Queue', value: 12, tone: 'accent' },
    { key: 'checkedIn', label: 'Checked In', value: 27, tone: 'success' },
    { key: 'failed', label: 'Failed', value: 3, tone: 'danger' },
  ]);
});

test('buildAdminNavigation marks the active route and hides zero-value delivery badge', () => {
  const sections = buildAdminNavigation({
    pathname: '/admin/check-in',
    summary: { pending: 9 },
    jobs: [{ failed_items: 0 }],
  });

  assert.equal(sections[0].items[0].active, false);
  assert.equal(sections[0].items[0].badgeCount, 9);
  assert.equal(sections[0].items[1].badgeCount, 0);
  assert.equal(sections[0].items[1].showBadge, false);
  assert.equal(sections[0].items[2].active, true);
});
