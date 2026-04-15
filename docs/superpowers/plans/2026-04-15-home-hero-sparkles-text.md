# Home Hero Sparkles Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle local sparkles text treatment to the homepage hero for `2026` and `Delhi` only.

**Architecture:** Add a focused reusable `SparklesText` UI component under `src/components/ui`, then wire it into the existing homepage hero without changing the surrounding hero layout or CTA structure. Lock the integration with a lightweight source-level regression test that verifies only the approved hero tokens use the sparkle treatment.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Node test runner

---

### Task 1: Lock the hero sparkle integration contract

**Files:**
- Create: `C:/Users/Media/Desktop/New folder/tests/home-hero.test.cjs`
- Test: `C:/Users/Media/Desktop/New folder/tests/home-hero.test.cjs`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const heroPath = path.join(
  process.cwd(),
  'src',
  'components',
  'home',
  'hero.jsx'
);

test('home hero applies SparklesText only to 2026 and Delhi', () => {
  const source = fs.readFileSync(heroPath, 'utf8');

  assert.match(source, /import SparklesText from ['"]@\/components\/ui\/sparkles-text['"]/);
  assert.match(source, /<SparklesText[^>]*>\s*2026\s*<\/SparklesText>/);
  assert.match(source, /<SparklesText[^>]*>\s*Delhi\s*<\/SparklesText>/);
  assert.doesNotMatch(source, /<SparklesText[^>]*>\s*TASI\s*<\/SparklesText>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\home-hero.test.cjs`
Expected: FAIL because `hero.jsx` does not yet import or render `SparklesText`.

- [ ] **Step 3: Write minimal implementation**

Create a local sparkle component and update the hero so:

```jsx
<SparklesText className="text-[2.8rem] md:text-[4.2rem] font-black leading-[0.8] text-rc-secondary dark:text-white">
  2026
</SparklesText>
```

and:

```jsx
<SparklesText className="text-[2.5rem] md:text-[4rem] font-black leading-none mb-3 tracking-tight drop-shadow-sm text-rc-secondary dark:text-white">
  Delhi
</SparklesText>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\home-hero.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/home-hero.test.cjs src/components/home/hero.jsx src/components/ui/sparkles-text.jsx
git commit -m "feat: add sparkles text to home hero"
```

### Task 2: Verify repository health

**Files:**
- Modify: `C:/Users/Media/Desktop/New folder/src/components/ui/sparkles-text.jsx`
- Modify: `C:/Users/Media/Desktop/New folder/src/components/home/hero.jsx`
- Test: `C:/Users/Media/Desktop/New folder/tests/home-hero.test.cjs`

- [ ] **Step 1: Run targeted test**

Run: `cmd /c node --test tests\home-hero.test.cjs`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `cmd /c npm run lint`
Expected: PASS with zero warnings

- [ ] **Step 3: Run full test suite**

Run: `cmd /c npm test`
Expected: PASS with no regressions

- [ ] **Step 4: Commit**

```bash
git add tests/home-hero.test.cjs src/components/home/hero.jsx src/components/ui/sparkles-text.jsx
git commit -m "test: verify home hero sparkle integration"
```
