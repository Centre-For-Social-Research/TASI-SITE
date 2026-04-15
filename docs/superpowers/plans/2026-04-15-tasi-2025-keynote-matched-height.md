# TASI 2025 Keynote Matched Height Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the TASI 2025 inaugural keynote image column stretch down to align with the bottom of the `Key Message` box on desktop while preserving mobile behavior and existing interactions.

**Architecture:** Keep the change local to the keynote section in `src/components/editions/tasi-2025-page.jsx`. Update the desktop grid and media wrappers to use full-height behavior, preserve a ratio-based image frame on mobile, and extend the regression test so the matched-height layout contract is covered in source.

**Tech Stack:** Next.js App Router, React JSX, Tailwind utility classes, Node test runner

---

### Task 1: Apply the matched-height keynote layout

**Files:**
- Modify: `src/components/editions/tasi-2025-page.jsx`
- Modify: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Add failing regression coverage for the matched-height keynote wrappers**

```js
assert.match(source, /md:items-stretch/);
assert.match(source, /md:h-full/);
assert.match(source, /aspect-\[3\/2\] md:h-full md:min-h-\[100%\] md:aspect-auto/);
```

- [ ] **Step 2: Run the full suite to verify the new layout assertions fail**

Run: `cmd /c npm test`
Expected: FAIL in `tests/tasi-2025-page.test.cjs` because the keynote section still uses `items-center` and the image wrapper does not yet stretch on desktop.

- [ ] **Step 3: Update the keynote grid and media wrappers for matched-height desktop behavior**

```jsx
<div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 md:items-stretch md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-16">
  <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-orange-100/60 md:h-full">
    <a
      href="https://www.youtube.com/live/_s_16oiTqpI?si=vc0sW-zIJeGFnukv"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch Dr. S. Jaishankar's TASI 2025 keynote on YouTube"
      className="group block md:h-full"
    >
      <div className="relative aspect-[3/2] md:h-full md:min-h-[100%] md:aspect-auto">
        <Image
          src="/img/home-gallery/tasi-2025-jaishankar-keynote.png"
          alt="Dr. S. Jaishankar speaking at TASI 2025"
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
```

- [ ] **Step 4: Run the full suite to verify the matched-height layout passes**

Run: `cmd /c npm test`
Expected: PASS with the updated keynote layout assertions and the rest of the suite green.

- [ ] **Step 5: Commit**

```bash
git add src/components/editions/tasi-2025-page.jsx tests/tasi-2025-page.test.cjs docs/superpowers/specs/2026-04-15-tasi-2025-keynote-matched-height-design.md docs/superpowers/plans/2026-04-15-tasi-2025-keynote-matched-height.md
git commit -m "fix: match TASI 2025 keynote image height to content"
```
