const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCameraStateMessage,
  isCheckInConfigError,
  getCheckInFeedbackTone,
} = require("../src/lib/check-in-panel-utils.cjs");

test("flags missing Supabase admin configuration as a check-in blocker", () => {
  assert.equal(
    isCheckInConfigError("Missing SUPABASE_URL for server-side Supabase admin client."),
    true,
  );
  assert.equal(
    isCheckInConfigError("Missing SUPABASE_SERVICE_ROLE_KEY for server-side Supabase admin client."),
    true,
  );
  assert.equal(isCheckInConfigError("Network error."), false);
});

test("returns camera guidance for unsupported and permission-denied states", () => {
  assert.match(getCameraStateMessage("unsupported"), /camera scanning is not supported/i);
  assert.match(getCameraStateMessage("permission_denied"), /camera access was denied/i);
});

test("returns success tone only for valid attendee check-in", () => {
  assert.equal(getCheckInFeedbackTone("valid"), "success");
  assert.equal(getCheckInFeedbackTone("already_checked_in"), "warning");
  assert.equal(getCheckInFeedbackTone("rejected"), "danger");
});
