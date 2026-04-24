# Public App UI Review

**Audited:** 2026-04-22
**Baseline:** Abstract 6-pillar standards + project `DESIGN_RULES.md` (`10px` corner radius rule)
**Screenshots:** Not captured in-browser during this pass
**Scope:** Public-facing app surfaces under `src/app/**` and shared public UI in `src/components/home/**`, `src/components/ui/**`, `src/components/register/**`, `src/components/programme/**`, `src/components/speakers/**`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Strong, specific copy on registration; public information architecture is weakened by 2025/2026 messaging overlap |
| 2. Visuals | 2/4 | Energetic brand treatment, but several pages end abruptly because the shared footer is missing |
| 3. Color | 3/4 | Bold event palette is memorable; repeated hero gradients flatten page distinction and create sameness |
| 4. Typography | 2/4 | Good scale ambition, but the loaded font system is not actually expressed in the public shell |
| 5. Spacing | 3/4 | Most public sections use disciplined spacing; a few dense data views feel compressed on mobile/tablet |
| 6. Experience Design | 2/4 | Key task flows exist, but discoverability and continuity are hurt by missing global structure and interaction inconsistencies |

**Overall: 15/24**

---

## Top 3 Priority Fixes

1. **Restore a real global footer across the public site.** Impact: every public page currently ends without a closing navigation or trust layer because `HomeFooter` returns `null` in [`src/components/home/footer.jsx`](C:\Users\Media\Desktop\New folder\src\components\home\footer.jsx:1). That removes expected footer navigation, contact reassurance, partner/legal links, and the visual “landing” that users rely on after long-scrolling pages like home, programme, and registration.

2. **Resolve the public-year mismatch between TASI 2026 branding and TASI 2025 content framing.** Impact: the shell, metadata, and home hero present the product as TASI 2026, while the programme page headline is “TASI 2025 Agenda” and the speakers page is “Speakers from TASI 2025” in a live public flow. See [`src/app/programme/page.jsx`](C:\Users\Media\Desktop\New folder\src\app\programme\page.jsx:104) and [`src/app/speakers/page.jsx`](C:\Users\Media\Desktop\New folder\src\app\speakers\page.jsx:13). This is understandable if the archive content is intentional, but the current presentation reads as an unresolved state rather than a clearly signposted archive.

3. **Unify the public design system instead of letting shared CSS and component usage drift apart.** Impact: the repo explicitly requires `10px` boxed corners, but the shared tokens still define larger box radii in [`src/app/globals.css`](C:\Users\Media\Desktop\New folder\src\app\globals.css:159), and the agenda cards themselves use `0.5rem`/8px at [`src/app/globals.css`](C:\Users\Media\Desktop\New folder\src\app\globals.css:673). This makes the visual system feel improvised even where individual pages look polished.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Strengths**

- The registration flow explains the approval model clearly and repeatedly without sounding robotic. The three-step explanation and FAQ copy in [`src/app/register/page.jsx`](C:\Users\Media\Desktop\New folder\src\app\register\page.jsx:46) do a good job setting expectations.
- Form labels and helper copy in [`src/components/register/registration-form.jsx`](C:\Users\Media\Desktop\New folder\src\components\register\registration-form.jsx:137) are direct, plain-language, and user-centered.

**Issues**

- The site’s temporal framing is inconsistent. “TASI 2026” is the brand shell, but the programme and speaker surfaces foreground 2025 content without a clearer archive label or context banner. See [`src/app/programme/page.jsx`](C:\Users\Media\Desktop\New folder\src\app\programme\page.jsx:115) and [`src/app/speakers/page.jsx`](C:\Users\Media\Desktop\New folder\src\app\speakers\page.jsx:16).
- Some public sections read like internal event knowledge rather than audience guidance. Example: the programme page assumes users know why 2025 content is being shown in a 2026-branded experience.

### Pillar 2: Visuals (2/4)

**Strengths**

- The public brand has energy. The home hero layers photography, overlays, and motion in a way that feels event-like rather than generic. See [`src/components/home/hero.jsx`](C:\Users\Media\Desktop\New folder\src\components\home\hero.jsx:15).
- Registration and contact use card-based layouts that are readable and consistent with the site’s warm editorial tone.

**Issues**

- The missing footer is the single biggest visual break in the public experience. Long pages simply stop. See [`src/components/home/footer.jsx`](C:\Users\Media\Desktop\New folder\src\components\home\footer.jsx:1).
- The shared hero treatment is so dominant that several pages begin to feel visually interchangeable. The same saturated gradient + particle stack is reused in [`src/components/ui/branded-page-hero.jsx`](C:\Users\Media\Desktop\New folder\src\components\ui\branded-page-hero.jsx:10), which weakens page identity for programme, speakers, contact, and registration.

### Pillar 3: Color (3/4)

**Strengths**

- The purple/yellow/orange system is distinctive and memorable, especially on action surfaces and heroes.
- Neutral/warm content panels on registration and contact help keep informational content readable.

**Issues**

- The hero gradient is used so broadly that accent color stops behaving like emphasis and starts behaving like default wallpaper. This makes the palette feel louder than it needs to.
- The site still carries “RightsCon Theme Variables” in the main global token file at [`src/app/globals.css`](C:\Users\Media\Desktop\New folder\src\app\globals.css:38), which suggests the public theme layer has evolved by accumulation rather than by a clean TASI-specific system.

### Pillar 4: Typography (2/4)

**Strengths**

- Display sizes are appropriately bold for an event brand.
- Key public pages generally maintain a consistent headline scale.

**Issues**

- The app loads multiple families in [`src/app/layout.tsx`](C:\Users\Media\Desktop\New folder\src\app\layout.tsx:11), including `Outfit` and `Fraunces`, but the global public shell still forces `Inter` for body and headings in [`src/app/globals.css`](C:\Users\Media\Desktop\New folder\src\app\globals.css:180) and [`src/app/globals.css`](C:\Users\Media\Desktop\New folder\src\app\globals.css:199). That means the intended brand typography is mostly not showing up in the default experience.
- Many public surfaces lean heavily on `font-black` uppercase labels and large bold headlines. The result is strong, but not nuanced. Contact, registration, speakers, and the branded heroes all compete with similarly heavy headline treatment.

### Pillar 5: Spacing (3/4)

**Strengths**

- Registration and contact maintain clean container widths and comfortable vertical spacing.
- The agenda view is structured clearly, with good use of sticky controls and sectional grouping.

**Issues**

- The programme page is information-dense and the session cards pack venue, time, type, actions, and speaker metadata into a relatively tight card body. See [`src/components/programme/programme-agenda-client.jsx`](C:\Users\Media\Desktop\New folder\src\components\programme\programme-agenda-client.jsx:366). It is functional, but visually busy.
- Speaker cards are fixed-height (`h-96`) and rely on a flip interaction; longer bios are pushed into nested scrolling inside the card. See [`src/components/speakers/directory.jsx`](C:\Users\Media\Desktop\New folder\src\components\speakers\directory.jsx:53) and [`src/components/speakers/directory.jsx`](C:\Users\Media\Desktop\New folder\src\components\speakers\directory.jsx:182). That compresses content rather than letting the page breathe.

### Pillar 6: Experience Design (2/4)

**Strengths**

- The registration flow is thoughtfully designed from an expectation-setting perspective.
- Search, filtering, pagination, and “add to calendar” affordances on the programme page are useful and meaningful.

**Issues**

- `ThemeToggle` is implemented as a clickable `div` with `role="button"` rather than a native button in [`src/components/ui/theme-toggle.tsx`](C:\Users\Media\Desktop\New folder\src\components\ui\theme-toggle.tsx:38). It is keyboard-handled, but this is still a weaker accessibility and semantics choice than necessary.
- The speaker cards advertise clickability with a `cursor-pointer` on the card container, but the actual flip trigger is only the avatar button. See [`src/components/speakers/directory.jsx`](C:\Users\Media\Desktop\New folder\src\components\speakers\directory.jsx:60) and [`src/components/speakers/directory.jsx`](C:\Users\Media\Desktop\New folder\src\components\speakers\directory.jsx:73). That mismatch creates small interaction friction.
- Global trust/completion scaffolding is incomplete because the footer is absent, so task completion pages do not offer a strong next step or reassurance layer.

---

## Files Audited

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.jsx`
- `src/app/register/page.jsx`
- `src/app/programme/page.jsx`
- `src/app/speakers/page.jsx`
- `src/app/contact/page.jsx`
- `src/components/home/navbar.jsx`
- `src/components/home/hero.jsx`
- `src/components/home/footer.jsx`
- `src/components/ui/branded-page-hero.jsx`
- `src/components/ui/theme-toggle.tsx`
- `src/components/register/registration-form.jsx`
- `src/components/programme/programme-agenda-client.jsx`
- `src/components/speakers/directory.jsx`
- `CLAUDE.md`
- `DESIGN_RULES.md`

---

## UI REVIEW COMPLETE

```json
{
  "phase": "public-app",
  "overall_score": 15,
  "scores": {
    "copywriting": 3,
    "visuals": 2,
    "color": 3,
    "typography": 2,
    "spacing": 3,
    "experience_design": 2
  },
  "screenshots_captured": false,
  "top_fixes": [
    "Implement a real public footer and restore end-of-page navigation/trust scaffolding across the site.",
    "Resolve TASI 2026 vs TASI 2025 framing so archive content is intentionally labeled instead of feeling unfinished.",
    "Normalize the public design system around the repo's 10px corner rule and remove conflicting larger-radius tokens/usages.",
    "Make the loaded public typography system real in the shell instead of defaulting most headings/body copy back to Inter.",
    "Tighten interaction semantics on theme toggle and speaker flip cards so visual affordance matches actual behavior."
  ]
}
```
