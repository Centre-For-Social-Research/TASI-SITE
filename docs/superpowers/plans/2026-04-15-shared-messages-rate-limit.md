# Shared Messages Rate Limit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten abuse protection on the shared `/api/messages` route, preserve clear user feedback in all callers, and fix related regressions in the shared message pipeline.

**Architecture:** Keep rate limiting server-side in `src/app/api/messages/route.js` using the existing `protectPublicPostRoute()` helper. Extend the shared route payload slightly so known callers can identify their source, then keep both the exhibition enquiry form and footer message form on the same endpoint while surfacing returned route errors unchanged.

**Tech Stack:** Next.js App Router, React client components, Node test runner, shared route protection utilities

---

### Task 1: Lock in the new shared-route behavior with failing tests

**Files:**
- Modify: `tests/exhibition-page.test.cjs`
- Create: `tests/messages-route.test.cjs`

- [ ] **Step 1: Add a new route-level regression test for `/api/messages`**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('shared messages route uses stricter abuse protection and caller-provided source metadata', () => {
  const source = readFile('src/app/api/messages/route.js');

  assert.match(source, /protectPublicPostRoute\(request, 'messages', \{/);
  assert.match(source, /windowMs:\s*15\s*\*\s*60\s*\*\s*1000/);
  assert.match(source, /maxRequests:\s*3/);
  assert.match(source, /const source = body\?\.source/);
  assert.match(source, /source:\s*source \|\| 'site-footer'/);
});
```

- [ ] **Step 2: Extend the existing exhibition page test to require the shared-source marker**

```js
assert.match(source, /source:\s*'exhibition-enquiry'/);
assert.match(source, /Request failed \(\$\{response\.status\}\)\. Please try again\./);
```

Add those assertions to the existing `exhibition enquiry form posts basic details through the shared messages pipeline` test in `tests/exhibition-page.test.cjs`.

- [ ] **Step 3: Add caller coverage for the footer quick-message form**

```js
test('footer quick message keeps using the shared messages route with footer source metadata', () => {
  const source = readFile('src/components/ui/footer-section.tsx');

  assert.match(source, /fetch\('\/api\/messages'/);
  assert.match(source, /source:\s*'site-footer'/);
  assert.match(source, /setMessageStatus\(data\?\.error \|\| `Request failed \(\$\{response\.status\}\)\.`\)/);
});
```

- [ ] **Step 4: Run the targeted tests to verify RED**

Run:

```bash
cmd /c node --test tests\messages-route.test.cjs tests\exhibition-page.test.cjs
```

Expected: FAIL because the route still uses `5` requests per `10` minutes and the callers do not yet send distinct source metadata.

### Task 2: Implement the shared route change minimally

**Files:**
- Modify: `src/app/api/messages/route.js`

- [ ] **Step 1: Tighten the shared route limit**

Update the protection call to:

```js
  const protection = await protectPublicPostRoute(request, 'messages', {
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
  });
```

- [ ] **Step 2: Read an optional caller-provided source and normalize it**

Add:

```js
    const source =
      typeof body?.source === 'string' && body.source.trim()
        ? body.source.trim()
        : 'site-footer';
```

immediately after parsing `body`.

- [ ] **Step 3: Store and notify with the normalized source**

Replace the hard-coded values with:

```js
      source,
```

and:

```js
          `Source: ${source}`,
```

This preserves current behavior for footer submissions while fixing incorrect source attribution for exhibition enquiries.

### Task 3: Update the known UI callers

**Files:**
- Modify: `src/components/exhibition/exhibition-enquiry-form.jsx`
- Modify: `src/components/ui/footer-section.tsx`

- [ ] **Step 1: Mark exhibition submissions with a distinct source**

Update the existing request body in `src/components/exhibition/exhibition-enquiry-form.jsx` to include:

```js
          source: 'exhibition-enquiry',
```

alongside `email` and `message`.

- [ ] **Step 2: Mark footer quick-message submissions explicitly**

Update the existing request body in `src/components/ui/footer-section.tsx` to include:

```ts
          source: 'site-footer',
```

alongside `email` and `message`.

- [ ] **Step 3: Leave existing error rendering intact unless the route response shape requires change**

Do not add new client-side rate-limit state. Both callers should continue rendering `data.error` from the route, which will cover `429` responses automatically.

### Task 4: Verify green and run regression checks

**Files:**
- Modify: `src/app/api/messages/route.js`
- Modify: `src/components/exhibition/exhibition-enquiry-form.jsx`
- Modify: `src/components/ui/footer-section.tsx`
- Modify: `tests/exhibition-page.test.cjs`
- Create: `tests/messages-route.test.cjs`

- [ ] **Step 1: Run the targeted shared-route tests**

Run:

```bash
cmd /c node --test tests\messages-route.test.cjs tests\exhibition-page.test.cjs
```

Expected: PASS

- [ ] **Step 2: Run the full regression suite**

Run:

```bash
cmd /c npm test
```

Expected: PASS with zero failures.

- [ ] **Step 3: Review the shared message route for direct regressions**

Confirm from the final source that:

```js
windowMs: 15 * 60 * 1000
maxRequests: 3
source
```

are all present in `src/app/api/messages/route.js`, and that both callers still post to `/api/messages`.
