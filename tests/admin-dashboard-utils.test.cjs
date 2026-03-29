const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getBatchStatusTone,
  buildDashboardQueryString,
  summarizeSelection,
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
