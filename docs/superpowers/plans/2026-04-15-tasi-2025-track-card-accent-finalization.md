# TASI 2025 Track Card Accent Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the TASI 2025 thematic track cards so all seven use the accent-graphic illustration treatment and the section no longer reads like an A/B comparison.

**Architecture:** Keep the current illustration system in `src/components/editions/tasi-2025-page.jsx`, but simplify the track data and rendering so every card resolves to the accent variant. Update the page-level regression test to require a unified accent treatment and to reject comparison-era copy.

**Tech Stack:** Next.js, React JSX, Tailwind utility classes, Node test runner

---

### Task 1: Update regression coverage to reflect the final unified direction

**Files:**
- Modify: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Replace the comparison-era assertions with final-state assertions**

Use:

```js
test('TASI 2025 thematic focus cards use the final accent illustration treatment across all tracks', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');

  assert.match(source, /Thematic Focus/);
  assert.match(source, /Seven Key Tracks/);
  assert.match(source, /const tracks = \[/);
  assert.doesNotMatch(source, /illustrationVariant:\s*'subtle'/);
  assert.match(source, /illustrationVariant:\s*'accent'/);
  assert.match(source, /cardIllustration/);
  assert.doesNotMatch(source, /Monochrome Editorial/);
  assert.doesNotMatch(source, /Accent Graphic/);
});
```

- [ ] **Step 2: Run the full suite to verify RED**

Run:

```bash
cmd /c npm test
```

Expected: FAIL on the TASI 2025 page test because the page still includes subtle variants and comparison labels.

### Task 2: Finalize the TASI 2025 track card implementation

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Change every track to the accent variant**

Update the `tracks` array so all objects use:

```jsx
illustrationVariant: 'accent'
```

- [ ] **Step 2: Remove comparison labels from the illustration shell**

Replace:

```jsx
{isSubtle ? 'Monochrome Editorial' : 'Accent Graphic'}
```

with a neutral final-state label such as:

```jsx
Thematic Illustration
```

or remove the comparison wording entirely if the illustration header remains readable without it.

- [ ] **Step 3: Simplify any style logic that only existed for the A/B split**

If branches exist only to support the removed comparison framing, collapse them so the final card system is clearer and easier to maintain while keeping the accent visuals intact.

### Task 3: Verify the final state

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`
- Modify: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Run the full suite**

Run:

```bash
cmd /c npm test
```

Expected: PASS with zero failures.

- [ ] **Step 2: Confirm the final page source reflects the unified design**

Check directly in `src/components/editions/tasi-2025-page.jsx` that:

```jsx
illustrationVariant: 'accent'
```

appears for all track objects, and that the old comparison wording no longer appears.
