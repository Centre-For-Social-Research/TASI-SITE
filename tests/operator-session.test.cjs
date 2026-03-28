const test = require("node:test");
const assert = require("node:assert/strict");

const {
  toOperatorSession,
  buildOperatorLogContext,
} = require("../src/lib/operator-session.cjs");

test("toOperatorSession returns only serializable operator fields", () => {
  const input = {
    authorized: true,
    role: "admin",
    userId: "user_123",
    primaryEmail: "saquib@csrindia.org",
    displayName: "Saquib",
    accessMode: "both",
    user: {
      id: "user_123",
      unsafe: true,
    },
  };

  assert.deepEqual(toOperatorSession(input), {
    userId: "user_123",
    primaryEmail: "saquib@csrindia.org",
    displayName: "Saquib",
    role: "admin",
    accessMode: "both",
  });
});

test("buildOperatorLogContext summarizes operator state without raw user payload", () => {
  const input = {
    authorized: false,
    reason: "unauthorized",
    role: null,
    userId: "user_123",
    primaryEmail: "saquib@csrindia.org",
    accessMode: "both",
    sessionUserIdPresent: true,
    currentUserResolved: true,
    clerkConfig: {
      publishableKeyConfigured: true,
      secretKeyConfigured: true,
    },
    allowlistSource: "email_allowlist",
    user: { id: "user_123", privateStuff: "nope" },
  };

  assert.deepEqual(buildOperatorLogContext("admin.registrations.page", input), {
    route: "admin.registrations.page",
    authOutcome: "unauthorized",
    role: null,
    userId: "user_123",
    primaryEmail: "saquib@csrindia.org",
    accessMode: "both",
    sessionUserIdPresent: true,
    currentUserResolved: true,
    publishableKeyConfigured: true,
    secretKeyConfigured: true,
    allowlistSource: "email_allowlist",
  });
});
