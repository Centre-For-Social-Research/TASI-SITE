# TASI 2025 Inaugural Keynote Image Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the TASI 2025 inaugural keynote image with the provided Dr. S. Jaishankar podium photo while preserving the existing click-through video behavior and layout.

**Architecture:** Keep the change narrowly scoped to the existing keynote media card. Add the provided image as a public asset in the same gallery directory used by the page, then update the keynote `Image` source to reference the new file and extend the existing TASI 2025 regression test so the asset swap is locked in.

**Tech Stack:** Next.js App Router, `next/image`, Node test runner, static public assets

---

### Task 1: Add the keynote asset and wire it into the TASI 2025 page

**Files:**
- Create: `public/img/home-gallery/tasi-2025-jaishankar-keynote.png`
- Modify: `src/components/editions/tasi-2025-page.jsx`
- Test: `tests/tasi-2025-page.test.cjs`

- [ ] **Step 1: Extend the TASI 2025 regression test with the failing keynote asset expectation**

```js
test('TASI 2025 thematic focus cards use the final accent illustration treatment across all tracks', () => {
  const source = readFile('src/components/editions/tasi-2025-page.jsx');
  const accentVariants = source.match(/illustrationVariant:\s*'accent'/g) ?? [];

  assert.match(source, /Thematic Focus/);
  assert.match(source, /Six Key Tracks/);
  assert.match(source, /const tracks = \[/);
  assert.doesNotMatch(source, /illustrationVariant:\s*'subtle'/);
  assert.equal(accentVariants.length, 6);
  assert.match(source, /cardIllustration/);
  assert.match(source, /tasi-2025-jaishankar-keynote\.png/);
  assert.doesNotMatch(source, /Information Integrity and Misinformation/);
  assert.doesNotMatch(source, /Thematic Illustration/);
});
```

- [ ] **Step 2: Run the full test suite to verify the new keynote asset expectation fails**

Run: `cmd /c npm test`
Expected: FAIL in `tests/tasi-2025-page.test.cjs` because the page still references `/img/home-gallery/7T7A0651.webp`.

- [ ] **Step 3: Copy the provided keynote image into the public gallery assets**

Run:

```powershell
Copy-Item "C:\Users\Media\Downloads\6805c859-5a49-4cfd-84d1-b58e05799f95.png" "C:\Users\Media\Desktop\New folder\public\img\home-gallery\tasi-2025-jaishankar-keynote.png" -Force
```

Expected: the new keynote image exists at `public/img/home-gallery/tasi-2025-jaishankar-keynote.png`.

- [ ] **Step 4: Update the keynote `Image` source to use the new file**

```jsx
<Image
  src="/img/home-gallery/tasi-2025-jaishankar-keynote.png"
  alt="Dr. S. Jaishankar speaking at TASI 2025"
  fill
  className="object-cover transition duration-300 group-hover:scale-[1.02]"
  sizes="(min-width: 768px) 33vw, 100vw"
/>
```

- [ ] **Step 5: Run the full test suite to verify the asset swap passes without regressions**

Run: `cmd /c npm test`
Expected: PASS with the existing suite green, including the updated TASI 2025 regression test.

- [ ] **Step 6: Commit**

```bash
git add public/img/home-gallery/tasi-2025-jaishankar-keynote.png src/components/editions/tasi-2025-page.jsx tests/tasi-2025-page.test.cjs docs/superpowers/plans/2026-04-15-tasi-2025-keynote-image-swap.md
git commit -m "feat: swap TASI 2025 keynote image"
```
