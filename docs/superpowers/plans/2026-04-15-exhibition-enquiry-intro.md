# Exhibition Enquiry Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Exhibition Enquiry intro block into a premium editorial lead that matches the exhibition page tone while preserving the existing form behavior and layout.

**Architecture:** Keep the current enquiry section structure and right-side form card intact, and update only the left-side content block in `src/app/exhibition/page.jsx`. Use a small local content array for the editorial support points so the section stays readable and the new visual hierarchy is easy to maintain.

**Tech Stack:** Next.js App Router, React JSX, Tailwind utility classes

---

### Task 1: Add Structured Editorial Content

**Files:**
- Modify: `src/app/exhibition/page.jsx`

- [ ] **Step 1: Add the left-column editorial support data near the other page content arrays**

```jsx
const enquiryEditorialPoints = [
  {
    title: 'Built for aligned organisations',
    body: 'This is for institutions, platforms, and mission-led teams that want their on-site presence to feel relevant to the room, not simply visible within it.',
  },
  {
    title: 'Shaped around the right format',
    body: 'Your enquiry helps the TASI team recommend the exhibition, branding, or custom visibility format that best matches your goals and audience.',
  },
  {
    title: 'Follow-up with context',
    body: 'Every submission is reviewed directly so the next conversation starts with fit, intent, and the kind of presence you want to build.',
  },
];
```

- [ ] **Step 2: Review the file for naming consistency**

Check that the new constant name is `enquiryEditorialPoints` everywhere it is used and that the object shape stays `title` + `body`.

### Task 2: Replace the Left Intro Block Markup

**Files:**
- Modify: `src/app/exhibition/page.jsx`

- [ ] **Step 1: Replace the current left-side enquiry copy block with an editorial structure**

```jsx
<div className="max-w-xl">
  <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-[#5c0f4f] dark:text-rc-secondary">
    Exhibition Enquiry
  </p>
  <h2 className="mt-4 max-w-lg text-display-lg font-black tracking-tight text-stone-900 dark:text-white">
    Start the conversation around a presence that belongs in the room.
  </h2>
  <p className="mt-6 max-w-xl text-body-md leading-relaxed text-stone-700 dark:text-stone-300">
    TASI exhibition participation is shaped for organisations that want more than surface visibility. Share a few details about your team, your intent, and the kind of presence you are considering, and we will guide the conversation toward the format that fits best.
  </p>

  <div className="mt-8 grid gap-4">
    {enquiryEditorialPoints.map((point) => (
      <article
        key={point.title}
        className="rounded-[10px] border border-stone-200/80 bg-white/70 p-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/40"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
          Editorial Note
        </p>
        <h3 className="mt-2 text-base font-bold tracking-tight text-stone-900 dark:text-white">
          {point.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {point.body}
        </p>
      </article>
    ))}
  </div>

  <p className="mt-6 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
    Prefer to reach out directly? Write to{' '}
    <a
      href="mailto:info1@csrindia.org"
      className="font-semibold text-[#5c0f4f] underline underline-offset-4 dark:text-rc-secondary"
    >
      info1@csrindia.org
    </a>{' '}
    and the team will route your enquiry with the same context.
  </p>
</div>
```

- [ ] **Step 2: Keep the right-side form card unchanged**

Check the `ExhibitionEnquiryForm` wrapper immediately beside the updated block and confirm its classes, spacing, and structure remain intact.

### Task 3: Verify Layout and Styling Constraints

**Files:**
- Modify: `src/app/exhibition/page.jsx`

- [ ] **Step 1: Confirm all new boxed elements use the allowed radius**

Search the updated enquiry section and verify any new boxed panels use `rounded-[10px]` only.

- [ ] **Step 2: Confirm the hierarchy stays balanced on mobile and desktop**

Run:

```bash
cmd /c npm test
```

Expected: Existing test suite still passes, confirming the page edit did not break unrelated behavior.

- [ ] **Step 3: Start the dev server and visually inspect the exhibition page**

Run:

```bash
cmd /c npm.cmd run dev
```

Expected: Next.js serves locally and the exhibition enquiry section shows a stronger left-column hierarchy without changing the form interactions.
