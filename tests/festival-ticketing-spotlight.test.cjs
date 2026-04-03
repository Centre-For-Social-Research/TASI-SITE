const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function readFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

test("festival ticket cards use the reusable GlowCard wrapper", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(
    source,
    /import\s+\{\s*GlowCard\s*\}\s+from\s+"@\/components\/ui\/spotlight-card"/,
  );
  assert.match(source, /<GlowCard/);
  assert.match(
    source,
    /glowColor=\{option\.country === "IN" \? "orange" : "purple"\}/,
  );
});

test("spotlight card component exists as a reusable UI primitive", () => {
  const source = readFile("src/components/ui/spotlight-card.tsx");

  assert.match(source, /export\s+\{\s*GlowCard\s*\}/);
  assert.match(source, /data-glow/);
  assert.match(source, /overflow-visible/);
  assert.match(source, /overflow-hidden rounded-\[inherit\]/);
  assert.match(source, /boxShadow:\s*"0 1rem 2rem -1rem rgba\(0,0,0,0\.85\)"/);
});
