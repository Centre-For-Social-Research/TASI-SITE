# TASI 2025 Keynote Video Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-card embedded keynote video section directly below the "About the Festival" section on the TASI 2025 page.

**Architecture:** Keep the change self-contained inside `src/components/editions/tasi-2025-page.jsx` by adding a small `featuredSessions` array near the existing page constants and mapping over it to render two responsive video cards. Insert the new section between the existing "About the Festival" and "Thematic Focus" sections so the page narrative flows from festival framing into standout sessions.

**Tech Stack:** Next.js App Router, React JSX, `next/image`, responsive iframes, Tailwind CSS, ESLint

---

### Task 1: Add featured session data to the TASI 2025 page

**Files:**

- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Add a local `featuredSessions` array near the other page constants**

Add:

```jsx
const featuredSessions = [
  {
    label: 'Featured Keynote',
    category: 'Keynote Address',
    title: 'Safety by Design in the Age of AI',
    description:
      'A keynote by Julie Inman Grant, eSafety Commissioner, Australia, on AI risks, global regulation, and the future of online safety.',
    src: 'https://player.mux.com/k100u1ANRTgJCpEhVqJBpNxdREzMvhQWs1mE6IlSGeTE?metadata-video-title=Julie+Inman+Grant+&video-title=Julie+Inman+Grant+',
    iframeTitle: 'Julie Inman Grant keynote at TASI 2025',
  },
  {
    label: 'Global Policy Address',
    category: 'Policy & Global Leadership',
    title:
      'Combating Technology-Facilitated Gender-Based Violence: A Global Call to Action',
    description:
      'A keynote by Delphine O, Ambassador-at-Large and Secretary General for the Generation Equality Forum, on global efforts to combat technology-facilitated gender-based violence.',
    src: 'https://player.mux.com/l6f94UXaZxMGhwpwVNhzI61C02uYEexTJH02REw1i024Os?metadata-video-title=DELPHINE+O&video-title=DELPHINE+O',
    iframeTitle: 'Delphine O keynote at TASI 2025',
  },
];
```

Expected: the page has one local source of truth for the two video cards and no repeated hard-coded card content later in the file.

### Task 2: Insert the new video section below "About the Festival"

**Files:**

- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Add the new section between the existing "About the Festival" and "Thematic Focus" sections**

Insert a new section with:

```jsx
<section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
  <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
        Featured Sessions
      </p>
      <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3rem]">
        Two Keynotes That Framed the Global Conversation
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-body-lg text-stone-700 dark:text-slate-300">
        These featured addresses brought international policy and safety
        leadership into the TASI 2025 programme, extending the festival&apos;s
        focus from national dialogue to urgent global questions.
      </p>
    </div>

    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      {featuredSessions.map((session) => (
        <article
          key={session.title}
          className="overflow-hidden rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-stone-200 px-6 pb-5 pt-6 dark:border-slate-800 md:px-7 md:pt-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
              {session.label}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-slate-400">
              {session.category}
            </p>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-stone-900 dark:text-white md:text-[2rem]">
              {session.title}
            </h3>
            <p className="mt-4 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
              {session.description}
            </p>
          </div>

          <div className="p-4 md:p-5">
            <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-black shadow-inner dark:border-slate-800">
              <iframe
                src={session.src}
                title={session.iframeTitle}
                className="w-full aspect-video border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

Expected: the new section sits directly below the festival overview and shows two cards side-by-side on desktop and stacked on smaller screens.

- [ ] **Step 2: Preserve the rest of the page order**

Verify in the diff that:

- the "About the Festival" section remains unchanged above
- the "Thematic Focus" section still follows immediately after the new video section
- no existing keynote, recommendation, or media blocks are moved

Expected: the change is additive and localized.

### Task 3: Verify the new section renders correctly in code

**Files:**

- Modify: `src/components/editions/tasi-2025-page.jsx`

- [ ] **Step 1: Run ESLint on the TASI 2025 page**

Run:

```powershell
npm exec eslint -- 'src/components/editions/tasi-2025-page.jsx'
```

Expected: exit code `0` with no lint errors.

- [ ] **Step 2: Confirm the new heading and both Mux URLs are present**

Run:

```powershell
rg -n --fixed-strings "Two Keynotes That Framed the Global Conversation" 'src/components/editions/tasi-2025-page.jsx'
rg -n --fixed-strings "k100u1ANRTgJCpEhVqJBpNxdREzMvhQWs1mE6IlSGeTE" 'src/components/editions/tasi-2025-page.jsx'
rg -n --fixed-strings "l6f94UXaZxMGhwpwVNhzI61C02uYEexTJH02REw1i024Os" 'src/components/editions/tasi-2025-page.jsx'
```

Expected: each command returns one matching line from the new section.
