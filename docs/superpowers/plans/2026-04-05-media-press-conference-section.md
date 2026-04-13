# Media Press Conference Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new editorial press-conference section directly below the media page hero using a curated set of photos and concise pre-festival context.

**Architecture:** Keep the implementation local to the existing media page so the new section follows the page's established editorial layout patterns. Add three selected press-conference images under `public/img/media-coverage/` and render them through a small local data structure plus one new JSX section in `src/app/media/page.jsx`.

**Tech Stack:** Next.js App Router, React JSX, `next/image`, Tailwind CSS, ESLint

---

### Task 1: Add curated press-conference image assets

**Files:**

- Create: `public/img/media-coverage/press-conference/gcv-06833.jpg`
- Create: `public/img/media-coverage/press-conference/gcv-06902.jpg`
- Create: `public/img/media-coverage/press-conference/gcv-07089.jpg`

- [ ] **Step 1: Copy the three approved images into the public media-coverage folder**

Run:

```powershell
New-Item -ItemType Directory -Force 'public/img/media-coverage/press-conference'
Copy-Item 'D:\100MSDCF\GCV06833.JPG' 'public/img/media-coverage/press-conference/gcv-06833.jpg'
Copy-Item 'D:\100MSDCF\GCV06902.JPG' 'public/img/media-coverage/press-conference/gcv-06902.jpg'
Copy-Item 'D:\100MSDCF\GCV07089.JPG' 'public/img/media-coverage/press-conference/gcv-07089.jpg'
```

Expected: the destination directory exists and contains exactly the three renamed JPEG files.

- [ ] **Step 2: Verify the copied files exist**

Run:

```powershell
Get-Item 'public/img/media-coverage/press-conference/gcv-06833.jpg','public/img/media-coverage/press-conference/gcv-06902.jpg','public/img/media-coverage/press-conference/gcv-07089.jpg' | Select-Object FullName,Length
```

Expected: all three files are listed with non-zero sizes.

### Task 2: Add press-conference section data and markup to the media page

**Files:**

- Modify: `src/app/media/page.jsx`

- [ ] **Step 1: Add a local data object for the press-conference section**

Add:

```jsx
const pressConferenceHighlights = [
  {
    title: 'Before The Festival',
    description:
      'A pre-festival media briefing that introduced the TASI 2025 agenda and set the tone for the wider coverage cycle.',
  },
  {
    title: 'Media Briefing',
    description:
      'The session gave journalists early context on the event, its themes, and the trust and safety issues shaping the conversation.',
  },
  {
    title: 'Shared Momentum',
    description:
      'Organizers, speakers, and media stakeholders came together ahead of the festival to build public attention around the gathering.',
  },
];
```

Expected: the data sits near the other page-level constants and is ready to map into cards.

- [ ] **Step 2: Insert the new editorial section immediately after the hero**

Add a new section with:

```jsx
<section className="bg-[linear-gradient(180deg,#fff8ef_0%,#f5ece1_100%)] py-14 dark:bg-[linear-gradient(180deg,#171717_0%,#0f172a_100%)] md:py-20">
  <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-[1.05fr_0.95fr] md:px-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="relative min-h-[320px] overflow-hidden rounded-[10px] sm:col-span-2">
        <Image
          src="/img/media-coverage/press-conference/gcv-06833.jpg"
          alt="Speaker addressing the press conference before TASI 2025"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </article>
      <article className="relative min-h-[220px] overflow-hidden rounded-[10px]">
        <Image
          src="/img/media-coverage/press-conference/gcv-06902.jpg"
          alt="Press interaction during the TASI 2025 pre-festival media briefing"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 25vw, 100vw"
        />
      </article>
      <article className="relative min-h-[220px] overflow-hidden rounded-[10px]">
        <Image
          src="/img/media-coverage/press-conference/gcv-07089.jpg"
          alt="Interview moment captured at the TASI 2025 press conference"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 25vw, 100vw"
        />
      </article>
    </div>

    <div className="flex flex-col justify-center">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
        Press Conference
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 dark:text-white md:text-5xl">
        The Media Briefing That Set Up TASI 2025
      </h2>
      <p className="mt-5 text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-base">
        Ahead of the festival itself, TASI 2025 opened its media cycle with a
        press conference that introduced the event, framed its trust and safety
        agenda, and helped bring journalists into the wider conversation before
        delegates convened.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-base">
        The session served as an early editorial moment for the festival, giving
        the press a clearer view of the issues, voices, and public-interest
        stakes that would define the gathering in New Delhi.
      </p>

      <div className="mt-8 grid gap-3">
        {pressConferenceHighlights.map((item) => (
          <article
            key={item.title}
            className="rounded-[10px] border border-stone-200 bg-white/90 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-stone-900 dark:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>
```

Expected: the new section appears directly below the hero and above the current coverage list section.

- [ ] **Step 3: Keep the implementation scoped and avoid changing later media sections**

Verify in the diff that the coverage list, logo wall, resources, and accreditation sections stay in their current order.

Expected: only the new section and its local constant are added, without unrelated structural refactors.

### Task 3: Verify the page update

**Files:**

- Modify: `src/app/media/page.jsx`
- Verify: `public/img/media-coverage/press-conference/gcv-06833.jpg`
- Verify: `public/img/media-coverage/press-conference/gcv-06902.jpg`
- Verify: `public/img/media-coverage/press-conference/gcv-07089.jpg`

- [ ] **Step 1: Run ESLint on the media page**

Run:

```powershell
npm exec eslint -- 'src/app/media/page.jsx'
```

Expected: exit code `0` with no lint errors.

- [ ] **Step 2: Confirm the new section headline and image paths are present**

Run:

```powershell
rg -n --fixed-strings "The Media Briefing That Set Up TASI 2025" 'src/app/media/page.jsx'
rg -n --fixed-strings "/img/media-coverage/press-conference/gcv-06833.jpg" 'src/app/media/page.jsx'
rg -n --fixed-strings "/img/media-coverage/press-conference/gcv-06902.jpg" 'src/app/media/page.jsx'
rg -n --fixed-strings "/img/media-coverage/press-conference/gcv-07089.jpg" 'src/app/media/page.jsx'
```

Expected: each search returns one matching line.
