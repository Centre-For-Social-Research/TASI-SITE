const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getBatchStatusTone,
  buildDashboardQueryString,
  summarizeSelection,
  prioritizeRegistrationQueue,
  getQuickActionOptions,
} = require("../src/lib/admin-dashboard-utils.cjs");

test("buildDashboardQueryString omits empty filter values", () => {
  const query = buildDashboardQueryString({
    search: "india",
    status: "confirmed",
    category: "",
    priorityTier: "Purple Tier",
    country: "",
  });

  assert.equal(query, "search=india&status=confirmed&priorityTier=Purple+Tier");
});

test("summarizeSelection reports selected and matched counts for bulk actions", () => {
  assert.deepEqual(
    summarizeSelection({
      selectedCount: 12,
      matchedCount: 48,
    }),
    {
      selectedLabel: "12 selected",
      matchedLabel: "48 matched",
      actionScopeLabel: "Send to selected attendees",
    },
  );

  assert.deepEqual(
    summarizeSelection({
      selectedCount: 0,
      matchedCount: 48,
    }),
    {
      selectedLabel: "0 selected",
      matchedLabel: "48 matched",
      actionScopeLabel: "Send to all matched attendees",
    },
  );
});

test("getBatchStatusTone marks in-flight queue processing as warning", () => {
  assert.equal(getBatchStatusTone("Job queued for 40 attendees."), "warning");
  assert.equal(getBatchStatusTone("Retrying 3 failed sends."), "warning");
});

test("prioritizeRegistrationQueue brings pending and higher-priority registrants to the top", () => {
  const sorted = prioritizeRegistrationQueue([
    { id: "3", status: "confirmed", priority_tier: "Blue Tier", qr_pass_issued_at: "2026-01-01", created_at: "2026-03-01T10:00:00.000Z" },
    { id: "1", status: "pending", priority_tier: "Purple Tier", qr_pass_issued_at: null, created_at: "2026-03-02T10:00:00.000Z" },
    { id: "2", status: "pending", priority_tier: "Gold Tier", qr_pass_issued_at: null, created_at: "2026-03-01T10:00:00.000Z" },
    { id: "4", status: "confirmed", priority_tier: "Purple Tier", qr_pass_issued_at: null, created_at: "2026-03-03T10:00:00.000Z" },
  ]);

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["1", "2", "4", "3"],
  );
});

test("getQuickActionOptions adapts row actions to registrant state", () => {
  assert.deepEqual(
    getQuickActionOptions({
      status: "pending",
      qr_pass_issued_at: null,
    }).map((action) => action.key),
    ["confirm", "waitlist", "reject"],
  );

  assert.deepEqual(
    getQuickActionOptions({
      status: "confirmed",
      qr_pass_issued_at: null,
    }).map((action) => action.key),
    ["sendQr", "waitlist", "reject"],
  );

  assert.deepEqual(
    getQuickActionOptions({
      status: "confirmed",
      qr_pass_issued_at: "2026-03-01T10:00:00.000Z",
    }).map((action) => action.key),
    ["resendQr", "waitlist", "reject"],
  );
});
