const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isSupabaseAdminConfigError,
  getBatchStatusTone,
} = require("../src/lib/admin-dashboard-utils.cjs");

test("detects missing Supabase admin URL errors", () => {
  assert.equal(
    isSupabaseAdminConfigError("Missing SUPABASE_URL for server-side Supabase admin client."),
    true
  );
});

test("detects missing Supabase service role errors", () => {
  assert.equal(
    isSupabaseAdminConfigError("Missing SUPABASE_SERVICE_ROLE_KEY for server-side Supabase admin client."),
    true
  );
});

test("does not classify unrelated dashboard errors as config failures", () => {
  assert.equal(isSupabaseAdminConfigError("Network error while issuing QR passes."), false);
});

test("marks Supabase config failures as danger batch status", () => {
  assert.equal(
    getBatchStatusTone("Missing SUPABASE_URL for server-side Supabase admin client."),
    "danger"
  );
});

test("marks processed QR batches as success batch status", () => {
  assert.equal(
    getBatchStatusTone("Processed 12 confirmed attendees for QR issuance."),
    "success"
  );
});
