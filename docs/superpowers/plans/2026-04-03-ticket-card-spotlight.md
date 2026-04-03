# Ticket Card Spotlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a reusable pointer-tracked spotlight glow effect to the two festival ticket selection cards on the registration page only.

**Architecture:** Add a standalone `GlowCard` UI primitive in `src/components/ui/spotlight-card.tsx` and wrap the existing domestic and international ticket card shells with it. Keep the existing ticket content, selection behavior, and downstream form flow unchanged so the visual enhancement remains isolated to the selector cards.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, TypeScript, Node test runner

---

### Task 1: Lock in integration expectations

**Files:**
- Create: `tests/festival-ticketing-spotlight.test.cjs`
- Modify: `src/components/register/festival-ticketing-section.jsx`
- Create: `src/components/ui/spotlight-card.tsx`

- [ ] **Step 1: Write the failing test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function readFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

test("festival ticket cards use the reusable GlowCard wrapper", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(source, /import\s+\{\s*GlowCard\s*\}\s+from\s+"@\/components\/ui\/spotlight-card"/);
  assert.match(source, /<GlowCard/);
  assert.match(source, /glowColor=\{option\.country === "IN" \? "orange" : "purple"\}/);
});

test("spotlight card component exists as a reusable UI primitive", () => {
  const source = readFile("src/components/ui/spotlight-card.tsx");

  assert.match(source, /export\s+\{\s*GlowCard\s*\}/);
  assert.match(source, /data-glow/);
  assert.match(source, /document\.addEventListener\("pointermove"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/festival-ticketing-spotlight.test.cjs`
Expected: FAIL because `src/components/ui/spotlight-card.tsx` does not exist and the festival ticketing section does not import or render `GlowCard`.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/ui/spotlight-card.tsx` with a client-side `GlowCard` component adapted to the repo's `src/components/ui` layout and TypeScript support. Update `src/components/register/festival-ticketing-section.jsx` to import `GlowCard` and wrap only the two selector cards while preserving current buttons, content, and selected-state classes.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/festival-ticketing-spotlight.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-03-ticket-card-spotlight.md tests/festival-ticketing-spotlight.test.cjs src/components/ui/spotlight-card.tsx src/components/register/festival-ticketing-section.jsx
git commit -m "feat: add spotlight effect to festival ticket cards"
```

### Task 2: Verify existing layout still holds

**Files:**
- Test: `tests/register-page-layout.test.cjs`

- [ ] **Step 1: Run the existing registration layout regression**

Run: `node --test tests/register-page-layout.test.cjs`
Expected: PASS and confirm the ticket section still exposes the expected headings and content after the wrapper change.

- [ ] **Step 2: Run the combined regression set**

Run: `npm test`
Expected: PASS with the new spotlight wrapper test and existing registration layout checks green.
