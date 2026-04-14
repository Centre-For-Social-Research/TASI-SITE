# Exhibition Page Rehaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/exhibition` into a more premium, enquiry-led page that sells both audience access and exhibition environment quality while staying fully consistent with the TASI theme and colors.

**Architecture:** Keep the route at `src/app/exhibition/page.jsx`, retain `HomeNavbar`, `HomeFooter`, and `BrandedPageHero`, and replace the current content sections with a stronger flagship-selling structure. Use a broader, better-staged mix of exhibition renders and update the existing source-level test so it guards the new layout language instead of the old one.

**Tech Stack:** Next.js App Router, React JSX, Next `Image`, Tailwind CSS, Node test runner, ESLint

---

### Task 1: Redesign the source-level route test around the new page structure

**Files:**
- Modify: `tests/exhibition-page.test.cjs`
- Test: `node --test tests/exhibition-page.test.cjs`

- [ ] **Step 1: Replace the old assertions with checks for the new flagship structure**

```js
const source = readFile('src/app/exhibition/page.jsx');

assert.match(source, /Flagship Pavilion/);
assert.match(source, /A premium exhibition story for organisations shaping digital trust/);
assert.match(source, /Why This Audience Matters/);
assert.match(source, /Participation Modes/);
assert.match(source, /Built like a pavilion, not a generic expo floor/);
assert.match(source, /Ready to shape your exhibition presence at TASI 2026/);
assert.doesNotMatch(source, /Cross-Sector/);
assert.doesNotMatch(source, /A premium showcase environment with multiple ways to participate/);
assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.08 PM\.jpeg/);
assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.16 PM\.jpeg/);
assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.17 PM\.jpeg/);
assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.18 PM\.jpeg/);
```

- [ ] **Step 2: Run the test to verify it fails before implementation**

Run: `node --test tests/exhibition-page.test.cjs`
Expected: FAIL because the current exhibition page does not yet contain the new section names and image set

### Task 2: Replace the current exhibition page data and story structure

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `node --test tests/exhibition-page.test.cjs`

- [ ] **Step 1: Replace the current arrays with the new rehaul content model**

```jsx
const proofPoints = [
  {
    title: 'A room with decision-makers in it',
    body: 'Position your organisation alongside policymakers, platforms, researchers, and public-interest leaders already engaged in live trust and safety dialogue.',
  },
  {
    title: 'A showcase that feels curated',
    body: 'Present inside a designed environment that feels premium, composed, and fully integrated into the event rather than set apart from it.',
  },
  {
    title: 'A presence with lasting recall',
    body: 'Use exhibition, hosting, and visibility moments to turn on-site presence into conversation, trust, and follow-up interest.',
  },
];

const participationModes = [
  {
    title: 'Showcase Pavilion',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.08 PM.jpeg',
    alt: 'Premium exhibition booth concepts for TASI 2026',
    body: 'A branded exhibition presence designed for clear visibility, sharper storytelling, and one-to-one engagement with a high-intent audience.',
    fit: 'Ideal for product platforms, ecosystem tools, and mission-led organisations that want a premium branded footprint.',
  },
  {
    title: 'Conversation Lounge',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.16 PM.jpeg',
    alt: 'Stage and lounge environment concept for TASI 2026',
    body: 'A softer hosted format for organisations that want to convene people, frame a point of view, or create a more hospitality-led interaction.',
    fit: 'Best for strategic dialogue, hosted meetings, and deeper ecosystem engagement.',
  },
  {
    title: 'Signature Display',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.18 PM.jpeg',
    alt: 'Premium partner wall concept for TASI 2026',
    body: 'A more architectural display presence that signals prestige, participation, and ecosystem alignment within the festival environment.',
    fit: 'Best for institutions, alliances, and brands seeking visible recognition in a highly curated context.',
  },
];

const audienceGroups = [
  'Policy and regulatory stakeholders',
  'Trust and safety product and operations teams',
  'Researchers, advocates, and ecosystem institutions',
  'Partners looking for meaningful visibility, not just footfall',
];
```

- [ ] **Step 2: Run the test again to confirm the page still fails until layout text is updated**

Run: `node --test tests/exhibition-page.test.cjs`
Expected: FAIL because the new arrays alone do not satisfy all updated assertions

### Task 3: Rebuild the page sections into the new flagship layout

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `node --test tests/exhibition-page.test.cjs`

- [ ] **Step 1: Replace the current body sections with the new page flow**

```jsx
<BrandedPageHero className="py-14 md:py-20">{/* shared hero */}</BrandedPageHero>

<section className="relative bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] text-white">
  {/* flagship pavilion selling section */}
</section>

<section className="bg-white">
  {/* proof + partner wall */}
</section>

<section className="bg-[linear-gradient(180deg,#fffaf2_0%,#f4ece2_100%)]">
  {/* participation modes */}
</section>

<section className="bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_48%,#15002b_100%)] text-white">
  {/* why this audience matters */}
</section>

<section className="bg-white">
  {/* environment story */}
</section>

<section className="bg-white">
  {/* final enquiry CTA */}
</section>
```

- [ ] **Step 2: Ensure the new body includes these exact section anchors and selling lines**

```jsx
<p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
  Flagship Pavilion
</p>
<h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
  A premium exhibition story for organisations shaping digital trust
</h2>
<h2 className="mt-3 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
  Participation Modes
</h2>
<h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
  Why This Audience Matters
</h2>
<h2 className="mt-3 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
  Built like a pavilion, not a generic expo floor
</h2>
<h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
  Ready to shape your exhibition presence at TASI 2026?
</h2>
```

- [ ] **Step 3: Run the test to verify the new route structure passes**

Run: `node --test tests/exhibition-page.test.cjs`
Expected: PASS

### Task 4: Refine layout quality, image composition, and CTA polish

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Test: `npx eslint src/app/exhibition/page.jsx tests/exhibition-page.test.cjs`

- [ ] **Step 1: Add a more interesting image composition and cleaner CTA rhythm**

```jsx
<div className="relative">
  <article className="overflow-hidden rounded-[10px] border border-white/10 bg-white/8 p-3 shadow-[0_30px_90px_-38px_rgba(15,23,42,0.7)] backdrop-blur">
    <Image
      src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.16 PM.jpeg"
      alt="Premium TASI stage and lounge environment"
      width={1365}
      height={768}
      className="h-full w-full rounded-[10px] object-cover"
      priority
    />
  </article>
  <article className="absolute -bottom-6 left-4 hidden w-[42%] overflow-hidden rounded-[10px] border border-white/12 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)] lg:block">
    <Image
      src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.08 PM.jpeg"
      alt="Exhibition booth concept"
      width={1365}
      height={768}
      className="h-full w-full object-cover"
    />
  </article>
</div>
```

- [ ] **Step 2: Run lint on the touched page and test file**

Run: `npx eslint src/app/exhibition/page.jsx tests/exhibition-page.test.cjs`
Expected: PASS

### Task 5: Verify the full app build with the rehauled page

**Files:**
- Modify: `src/app/exhibition/page.jsx`
- Modify: `tests/exhibition-page.test.cjs`
- Test: `npm run build`

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: PASS with `/exhibition` present in the generated routes output

- [ ] **Step 2: Commit the rehaul**

```bash
git add src/app/exhibition/page.jsx tests/exhibition-page.test.cjs docs/superpowers/plans/2026-04-14-exhibition-page-rehaul.md
git commit -m "feat: rehaul exhibition landing page"
```
