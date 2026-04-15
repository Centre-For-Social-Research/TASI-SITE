# TASI 2025 Track Card Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add abstract premium illustrations to the TASI 2025 thematic track cards, splitting the grid between subtle monochrome cards and stronger accent-led cards for in-page comparison.

**Architecture:** Keep the existing `Seven Key Tracks` section in `src/components/editions/tasi-2025-page.jsx` and enrich the local `tracks` data so each card can render a dedicated illustration block. Use inline illustration metadata plus CSS utility classes so the comparison lives inside the existing component without adding new assets or new files to the runtime surface.

**Tech Stack:** Next.js, React JSX, Tailwind utility classes, Node test runner

---

### Task 1: Add failing regression coverage for the track-card illustration split

**Files:**
- Create: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Add a focused page-level regression test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('TASI 2025 thematic focus cards compare subtle and accent illustration treatments', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');

  assert.match(source, /Thematic Focus/);
  assert.match(source, /Seven Key Tracks/);
  assert.match(source, /tracks = \[/);
  assert.match(source, /illustrationVariant:\s*'subtle'/);
  assert.match(source, /illustrationVariant:\s*'accent'/);
  assert.match(source, /cardIllustration/);
  assert.match(source, /Monochrome Editorial/);
  assert.match(source, /Accent Graphic/);
});
```

- [ ] **Step 2: Run the new test to verify RED**

Run:

```bash
cmd /c node --test tests\tasi-2025-page.test.cjs
```

Expected: FAIL because the current track cards have no illustration metadata or rendered illustration block.

### Task 2: Implement the illustration-ready track data

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Replace the tuple-style `tracks` array with objects that carry illustration metadata**

Use a structure like:

```jsx
const tracks = [
  {
    title: 'AI Governance and Safety',
    description:
      'Building ethical, accountable, and inclusive AI frameworks rooted in transparency and global cooperation.',
    illustrationVariant: 'subtle',
    accentClassName: 'from-stone-300/70 via-stone-200/50 to-white',
    illustration: 'orbit',
  },
];
```

- [ ] **Step 2: Split the first half into subtle cards and the remaining cards into accent cards**

Use `illustrationVariant: 'subtle'` on the first three cards and `illustrationVariant: 'accent'` on the remaining three cards so the comparison is explicit and stable in code.

### Task 3: Render the card illustration block

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Add a local illustration renderer/helper inside the component file**

Add a small function such as:

```jsx
function renderTrackIllustration(track) {
  switch (track.illustration) {
    case 'orbit':
      return <div className="..." />;
    default:
      return <div className="..." />;
  }
}
```

Keep it in the same file. No new assets.

- [ ] **Step 2: Add the illustration container above each track title**

Render a card block with a dedicated illustration area, for example:

```jsx
<div className="mb-6 overflow-hidden rounded-[10px] border border-stone-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
  <div className="mb-3 flex items-center justify-between">
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
      {track.illustrationVariant === 'subtle' ? 'Monochrome Editorial' : 'Accent Graphic'}
    </p>
  </div>
  <div className="cardIllustration relative h-28 rounded-[10px]">
    {renderTrackIllustration(track)}
  </div>
</div>
```

- [ ] **Step 3: Preserve the existing copy hierarchy below the illustration**

Keep the title, accent rule, and description, but adapt spacing so the card feels intentionally composed instead of simply taller.

### Task 4: Verify green and regression stability

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`
- Create: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Run the new targeted regression test**

Run:

```bash
cmd /c node --test tests\tasi-2025-page.test.cjs
```

Expected: PASS

- [ ] **Step 2: Run the full suite**

Run:

```bash
cmd /c npm test
```

Expected: PASS with zero failures.

- [ ] **Step 3: Do a final code review of the card constraints**

Confirm directly in `src/components/editions/tasi-2025-page.jsx` that:

```jsx
rounded-[10px]
illustrationVariant: 'subtle'
illustrationVariant: 'accent'
```

are all present, and that the track card copy is unchanged.
