# TASI 2025 Keynote Frame Ratio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the TASI 2025 inaugural keynote media frame to a `3:2` ratio so it matches the keynote image proportions while preserving behavior and layout.

**Architecture:** Keep the change narrowly scoped to the keynote media wrapper in `src/components/editions/tasi-2025-page.jsx`. Add a regression assertion for the new aspect utility, verify it fails, then update the wrapper classes to `aspect-[3/2]` and rerun the full suite.

**Tech Stack:** Next.js App Router, React JSX, Tailwind utility classes, Node test runner

---

### Task 1: Update the keynote media frame ratio

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`
- Modify: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Add a failing regression assertion for the keynote `3:2` frame**

```js
assert.match(source, /aspect-\[3\/2\]/);
assert.doesNotMatch(source, /aspect-\[4\/5\]/);
assert.doesNotMatch(source, /aspect-\[4\/4\.5\]/);
```

- [ ] **Step 2: Run the full suite to verify the new ratio assertion fails**

Run: `cmd /c npm test`
Expected: FAIL in `tests/tasi-2025-page.test.cjs` because the keynote wrapper still uses `aspect-[4/5] md:aspect-[4/4.5]`.

- [ ] **Step 3: Update the keynote media wrapper to use the new ratio**

```jsx
<div className="relative aspect-[3/2]">
  <Image
    src="/img/home-gallery/tasi-2025-jaishankar-keynote.png"
    alt="Dr. S. Jaishankar speaking at TASI 2025"
    fill
    className="object-cover transition duration-300 group-hover:scale-[1.02]"
    sizes="(min-width: 768px) 33vw, 100vw"
  />
```

- [ ] **Step 4: Run the full suite to verify the ratio update passes**

Run: `cmd /c npm test`
Expected: PASS with the updated TASI 2025 regression test and the rest of the suite green.

- [ ] **Step 5: Commit**

```bash
git add src/components/editions/tasi-2025-page.jsx tests/tasi-2025-page.test.cjs docs/superpowers/specs/2026-04-15-tasi-2025-keynote-frame-ratio-design.md docs/superpowers/plans/2026-04-15-tasi-2025-keynote-frame-ratio.md
git commit -m "fix: match TASI 2025 keynote frame to image ratio"
```
