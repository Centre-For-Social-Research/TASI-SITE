# Exhibition Enquiry Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an embedded exhibition enquiry form to `/exhibition` that reuses the existing `/api/messages` pipeline and collects basic lead details.

**Architecture:** Keep the exhibition page as the route shell and move the interactive submission logic into a dedicated client component. Reuse the existing generic messages API by formatting the exhibition lead details into the stored message body, so no new backend route or database schema is required.

**Tech Stack:** Next.js App Router, React client component, existing UI inputs/button/textarea, Node source-level tests

---

### Task 1: Lock the form contract with a failing page test

**Files:**
- Modify: `tests/exhibition-page.test.cjs`
- Test: `tests/exhibition-page.test.cjs`

- [ ] **Step 1: Add assertions for the embedded exhibition enquiry form**
- [ ] **Step 2: Run `node --test tests/exhibition-page.test.cjs` and confirm the new assertions fail**

### Task 2: Build the exhibition enquiry form component

**Files:**
- Create: `src/components/exhibition/exhibition-enquiry-form.jsx`
- Modify: `src/app/exhibition/page.jsx`
- Test: `tests/exhibition-page.test.cjs`

- [ ] **Step 1: Create a client component with basic field state, submit state, and fetch to `/api/messages`**
- [ ] **Step 2: Replace the current CTA-only closeout on `/exhibition` with the embedded form section**
- [ ] **Step 3: Run `node --test tests/exhibition-page.test.cjs` and confirm the page test passes**

### Task 3: Verify touched code quality

**Files:**
- Modify: `src/components/exhibition/exhibition-enquiry-form.jsx`
- Modify: `src/app/exhibition/page.jsx`
- Modify: `tests/exhibition-page.test.cjs`

- [ ] **Step 1: Run `npx eslint src/app/exhibition/page.jsx src/components/exhibition/exhibition-enquiry-form.jsx tests/exhibition-page.test.cjs`**
- [ ] **Step 2: Fix any reported issues and rerun the same command until it passes**
