# Admin Post-Login Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix post-login admin regressions so admin state is scoped to the signed-in operator, protected shell data failures do not masquerade as zero-state success, and leaving admin triggers session cleanup across navigation modes.

**Architecture:** Add a small runtime helper for admin-shell auth/data state decisions, move admin exit enforcement into a pathname-aware watcher mounted from the global app shell, and update the admin shell to use operator-scoped local storage keys and redirect on protected fetch auth failures.

**Tech Stack:** Next.js App Router, Clerk, React client components, Node test runner

---

### Task 1: Add regression tests for admin runtime helpers and route watcher wiring

**Files:**
- Create: `tests/admin-runtime-guards.test.cjs`
- Test: `src/lib/admin-runtime-guards.cjs`
- Test: `src/components/app-shell.jsx`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run the targeted test to verify it fails**
- [ ] **Step 3: Add the minimal helper implementation and route watcher wiring**
- [ ] **Step 4: Run the targeted test to verify it passes**

### Task 2: Harden AdminShell runtime behavior

**Files:**
- Modify: `src/components/admin/admin-shell.jsx`
- Test: `tests/admin-runtime-guards.test.cjs`

- [ ] **Step 1: Extend the test to assert operator-scoped storage keys and auth redirect decisions**
- [ ] **Step 2: Run the targeted test to verify it fails for the new cases**
- [ ] **Step 3: Update the shell to load/save per-operator notification state and redirect on protected auth failures**
- [ ] **Step 4: Run the targeted test to verify it passes**

### Task 3: Verify end state against existing admin checks

**Files:**
- Test: `tests/operator-auth-ui.test.cjs`
- Test: `tests/admin-exit-utils.test.cjs`
- Test: `tests/admin-shell-utils.test.cjs`

- [ ] **Step 1: Run the focused admin/auth regression suite**
- [ ] **Step 2: Run `next build`**
- [ ] **Step 3: Confirm no new admin/auth failures were introduced**
