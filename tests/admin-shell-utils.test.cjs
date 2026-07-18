const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAdminNavigation } = require('../src/lib/admin-shell-utils.cjs');

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
