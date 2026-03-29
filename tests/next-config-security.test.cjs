const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test("site permissions policy allows the app to request camera access", async () => {
  const configUrl = pathToFileURL(path.join(process.cwd(), "next.config.mjs")).href;
  const { default: nextConfig } = await import(configUrl);
  const headers = await nextConfig.headers();
  const siteHeaders = headers.find((entry) => entry.source === "/((?!studio).*)");
  const permissionsPolicy = siteHeaders.headers.find((header) => header.key === "Permissions-Policy");

  assert.equal(permissionsPolicy.value, "camera=(self), microphone=(), geolocation=()");
});
