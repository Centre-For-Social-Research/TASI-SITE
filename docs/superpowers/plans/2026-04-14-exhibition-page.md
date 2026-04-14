# Exhibition Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `/exhibition` route that presents a premium, credibility-led exhibition page using the provided exhibition renders and an enquiry-first CTA.

**Architecture:** Add a self-contained App Router page at `src/app/exhibition/page.jsx` that reuses the site navbar and footer while composing bespoke sections for the hero, proof metrics, exhibition formats, strategic value, environment gallery, and final CTA. Keep the content inline for now because the page is static, uses local images, and does not warrant new CMS or data-layer abstractions.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Next `Image`, existing TASI shared components

---

### Task 1: Add the exhibition route and page metadata

**Files:**
- Create: `src/app/exhibition/page.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Create the page shell with metadata and shared chrome**

```jsx
import Image from 'next/image';
import HomeNavbar from '@/components/home/navbar';
import HomeFooter from '@/components/home/footer';

export const metadata = {
  title: 'Exhibition | TASI 2026',
  description:
    'Explore exhibition opportunities at TASI 2026 and enquire about showcasing your organisation inside India’s leading trust and safety gathering.',
};

export default function ExhibitionPage() {
  return (
    <>
      <HomeNavbar />
      <main>{/* sections here */}</main>
      <HomeFooter />
    </>
  );
}
```

- [ ] **Step 2: Run lint to confirm the new file is wired correctly**

Run: `npm run lint -- src/app/exhibition/page.jsx`
Expected: PASS with no lint errors from the new route file

### Task 2: Build the premium hero and credibility strip

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Add hero content with enquiry CTA and a featured render**

```jsx
const heroStats = [
  { value: 'Cross-Sector', label: 'Audience spanning policy, platforms, research, and civil society' },
  { value: 'Curated', label: 'An exhibition environment designed to reward substance and credibility' },
  { value: 'On Site', label: 'Presence integrated into the wider festival experience' },
];

<section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_45%,#0f766e_100%)] pt-28 text-white md:pt-36">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.18),transparent_35%)]" />
  <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-20">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">TASI 2026</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Exhibit at TASI 2026</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
        Join a curated exhibition environment designed for organisations shaping trust, safety,
        digital policy, and platform accountability.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="mailto:info1@csrindia.org?subject=Exhibition%20Enquiry%20%E2%80%94%20TASI%202026"
          className="inline-flex items-center justify-center rounded-[10px] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-900 transition hover:bg-white/90"
        >
          Send an Enquiry
        </a>
        <a
          href="#exhibition-formats"
          className="inline-flex items-center justify-center rounded-[10px] border border-white/25 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
        >
          Explore Formats
        </a>
      </div>
    </div>
    <div className="rounded-[10px] border border-white/10 bg-white/6 p-3 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.75)] backdrop-blur">
      <div className="overflow-hidden rounded-[10px] bg-black/20">
        <Image
          src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.12 PM.jpeg"
          alt="TASI exhibition forum stage render"
          width={1365}
          height={768}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add the credibility cards directly below the hero**

```jsx
<section className="bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] py-10 md:py-14">
  <div className="mx-auto grid max-w-6xl gap-4 px-4 md:px-6 md:grid-cols-3">
    {heroStats.map((item) => (
      <article
        key={item.label}
        className="rounded-[10px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]"
      >
        <p className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{item.value}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.label}</p>
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Run lint to verify the hero and proof strip**

Run: `npm run lint -- src/app/exhibition/page.jsx`
Expected: PASS with no JSX or import errors

### Task 3: Build the exhibition formats and value sections

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Define the static data arrays for formats and reasons**

```jsx
const exhibitionFormats = [
  {
    title: 'Branded Booth Presence',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.05 PM.jpeg',
    alt: 'Branded exhibition booth render',
    body: 'A focused footprint for organisations that want clear visibility, one-to-one engagement, and a polished branded presence.',
    bestFor: 'Best for product demonstrations, ecosystem conversations, and high-quality walk-up discovery.',
  },
  {
    title: 'Forum Or Lounge Activation',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.19 PM.jpeg',
    alt: 'Forum lounge exhibition render',
    body: 'A more open format that supports seated discussion, curated hosting, and a softer hospitality-led experience.',
    bestFor: 'Best for convening conversations, thought leadership, and relationship-building in a premium setting.',
  },
  {
    title: 'Stage-Adjacent Showcase',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.12 PM.jpeg',
    alt: 'Stage-adjacent showcase render',
    body: 'A presentation-forward format that connects brand presence with the wider programme environment.',
    bestFor: 'Best for organisations that want visibility near key sessions and a stronger narrative tie to the event.',
  },
];

const reasons = [
  {
    title: 'Meet the right stakeholders',
    body: 'Reach policymakers, platform teams, researchers, and civil society leaders already engaged in trust and safety work.',
  },
  {
    title: 'Show up with credibility',
    body: 'Exhibit within a setting built around serious dialogue, not generic expo noise or vanity visibility.',
  },
  {
    title: 'Turn presence into conversation',
    body: 'Use the exhibition space as a bridge to informal discussion, partnership building, and deeper programme engagement.',
  },
];
```

- [ ] **Step 2: Add the formats gallery and reasons grid**

```jsx
<section id="exhibition-formats" className="bg-white py-14 md:py-20">
  <div className="mx-auto max-w-6xl px-4 md:px-6">
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Exhibition Formats</p>
      <h2 className="mt-3 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
        A premium showcase environment with multiple ways to participate
      </h2>
      <p className="mt-5 text-base leading-relaxed text-stone-600 md:text-lg">
        The exhibition at TASI is designed to feel curated and considered, with formats that support visibility,
        dialogue, and a strong on-site presence.
      </p>
    </div>

    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      {exhibitionFormats.map((format) => (
        <article key={format.title} className="overflow-hidden rounded-[10px] border border-stone-200 bg-stone-50 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.4)]">
          <div className="aspect-[4/3] overflow-hidden">
            <Image
              src={format.image}
              alt={format.alt}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Format</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-stone-900">{format.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 md:text-base">{format.body}</p>
            <p className="mt-4 border-t border-stone-200 pt-4 text-sm font-semibold leading-relaxed text-cyan-800">
              {format.bestFor}
            </p>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

<section className="bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] py-14 text-white md:py-20">
  <div className="mx-auto max-w-6xl px-4 md:px-6">
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Why Exhibit At TASI</p>
      <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
        Built for organisations that want relevance, not just visibility
      </h2>
    </div>
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {reasons.map((reason, index) => (
        <article key={reason.title} className="rounded-[10px] border border-white/10 bg-white/8 p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Reason {String(index + 1).padStart(2, '0')}</p>
          <h3 className="mt-4 text-2xl font-black tracking-tight">{reason.title}</h3>
          <p className="mt-4 text-sm leading-relaxed text-white/78 md:text-base">{reason.body}</p>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Run lint to verify the new data structures and sections**

Run: `npm run lint -- src/app/exhibition/page.jsx`
Expected: PASS with no unused variables or formatting-related lint errors

### Task 4: Add the environment gallery and close with the enquiry CTA

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Add the final gallery mosaic and CTA block**

```jsx
<section className="bg-[linear-gradient(180deg,#fffbf5_0%,#f5ede2_100%)] py-14 md:py-20">
  <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">The Environment</p>
      <h2 className="mt-3 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
        A composed exhibition setting integrated into the wider festival
      </h2>
      <p className="mt-5 text-base leading-relaxed text-stone-700 md:text-lg">
        The exhibition language for TASI prioritises clean staging, warm materiality, and clear signage so that
        brands and institutions can show up with confidence in a setting that feels deliberate and credible.
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="sm:col-span-2 overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.35)]">
        <Image src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.12 PM.jpeg" alt="Main TASI exhibition stage render" width={1365} height={768} className="h-full w-full object-cover" />
      </article>
      <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.32)]">
        <Image src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.05 PM.jpeg" alt="Exhibition booth concept" width={1060} height={683} className="h-full w-full object-cover" />
      </article>
      <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.32)]">
        <Image src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.19 PM.jpeg" alt="Exhibition lounge concept" width={1365} height={768} className="h-full w-full object-cover" />
      </article>
    </div>
  </div>
</section>

<section className="bg-white pb-16 pt-4 md:pb-24">
  <div className="mx-auto max-w-5xl px-4 md:px-6">
    <div className="rounded-[10px] bg-[linear-gradient(135deg,#082f49_0%,#155e75_52%,#164e63_100%)] p-8 text-white shadow-[0_30px_90px_-36px_rgba(8,47,73,0.6)] md:p-10">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Exhibition Enquiries</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
        Start the conversation about exhibiting at TASI 2026
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/82">
        If your organisation would like to explore exhibition participation, branded presence, or a more tailored
        activation, we would be glad to discuss the right fit.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="mailto:info1@csrindia.org?subject=Exhibition%20Enquiry%20%E2%80%94%20TASI%202026"
          className="inline-flex items-center justify-center rounded-[10px] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-900 transition hover:bg-white/90"
        >
          Send an Enquiry
        </a>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-[10px] border border-white/25 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
        >
          View Contact Details
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Run lint for the complete page**

Run: `npm run lint -- src/app/exhibition/page.jsx`
Expected: PASS with the full page structure in place

### Task 5: Verify the route in the app and commit

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Run the full lint command to ensure touched files are clean**

Run: `npm run lint`
Expected: PASS, or PASS for touched files if unrelated existing issues remain elsewhere

- [ ] **Step 2: Review the finished route in the browser**

Run: `npm run dev`
Expected: Next.js dev server starts and `/exhibition` renders with the hero, formats gallery, environment imagery, and enquiry CTA working on desktop and mobile widths

- [ ] **Step 3: Commit the implementation**

```bash
git add src/app/exhibition/page.jsx
git commit -m "feat: add exhibition landing page"
```
