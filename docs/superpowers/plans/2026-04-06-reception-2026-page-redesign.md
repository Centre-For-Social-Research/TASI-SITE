# Reception 2026 Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder-style 2026 receptions content with a stronger editorial landing page that explains value, audience, access, and registration flow.

**Architecture:** Keep the shared `ReceptionsPage` component intact for the 2025 experience and redesign only the `PreMode` branch used by `/receptions/2026`. Add a source-based regression test that locks in the new section headings and removes the old placeholder copy.

**Tech Stack:** Next.js App Router, React JSX, Tailwind CSS, Node test runner

---

### Task 1: Lock the 2026 page contract with a regression test

**Files:**
- Create: `tests/receptions-2026-page.test.cjs`
- Modify: `src/components/receptions/receptions-page.jsx`

- [ ] **Step 1: Write the failing test**

```js
const source = readFile("src/components/receptions/receptions-page.jsx");

assert.match(source, /Why These Receptions Matter/);
assert.match(source, /Who Should Plan To Be In The Room/);
assert.match(source, /How Access Works/);
assert.doesNotMatch(source, /Festival purchase flow moved/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/receptions-2026-page.test.cjs`
Expected: FAIL because the new headings are not in the component yet.

- [ ] **Step 3: Write minimal implementation**

Update the `PreMode` branch in `src/components/receptions/receptions-page.jsx` so it includes:

```jsx
<p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
  Why These Receptions Matter
</p>
```

and removes the old placeholder card titles:

```jsx
{
  title: 'Festival purchase flow moved',
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/receptions-2026-page.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/receptions-2026-page.test.cjs src/components/receptions/receptions-page.jsx docs/superpowers/plans/2026-04-06-reception-2026-page-redesign.md
git commit -m "feat: redesign receptions 2026 landing page"
```

### Task 2: Reshape the 2026 page into the approved hybrid layout

**Files:**
- Modify: `src/components/receptions/receptions-page.jsx`
- Test: `tests/receptions-2026-page.test.cjs`

- [ ] **Step 1: Replace the old hero support copy with stronger 2026 framing**

```jsx
{is2025
  ? 'One diplomatic arc for digital safety.'
  : 'Diplomatic hospitality for the conversations that continue after the main stage.'}
```

- [ ] **Step 2: Add the value-led 2026 sections**

```jsx
[
  'Why These Receptions Matter',
  'Who Should Plan To Be In The Room',
  'How Access Works',
]
```

- [ ] **Step 3: Add the practical registration call-to-action**

```jsx
<a href="/register">
  Begin delegate registration
</a>
```

- [ ] **Step 4: Run the targeted tests**

Run: `node --test tests/receptions-2026-page.test.cjs tests/register-page-layout.test.cjs`
Expected: PASS

- [ ] **Step 5: Run lint for the touched file set**

Run: `npm run lint`
Expected: PASS
