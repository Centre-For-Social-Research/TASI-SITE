const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getOperatorRedirectTarget,
  getOperatorNavbarState,
} = require("../src/lib/operator-auth-ui.cjs");

test("falls back to /admin when no redirect target is provided", () => {
  assert.equal(getOperatorRedirectTarget(), "/admin");
});

test("preserves a valid relative redirect target", () => {
  assert.equal(getOperatorRedirectTarget("/admin/check-in"), "/admin/check-in");
});

test("rejects unsafe external-style redirect targets", () => {
  assert.equal(getOperatorRedirectTarget("//evil.example"), "/admin");
  assert.equal(getOperatorRedirectTarget("https://evil.example"), "/admin");
});

test("keeps the navbar free of login CTA for signed-out visitors", () => {
  assert.deepEqual(getOperatorNavbarState({ signedIn: false, authorized: false }), {
    showLogin: false,
  });
});

test("keeps the navbar free of admin dashboard CTA for authorized signed-in operators", () => {
  assert.deepEqual(getOperatorNavbarState({ signedIn: true, authorized: true }), {
    showLogin: false,
  });
});

test("keeps the navbar free of auth CTAs for unauthorized signed-in users", () => {
  assert.deepEqual(getOperatorNavbarState({ signedIn: true, authorized: false }), {
    showLogin: false,
  });
});
