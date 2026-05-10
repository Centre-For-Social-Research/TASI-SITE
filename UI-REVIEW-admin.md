# Admin Console — UI Review

**Audited:** 2026-04-18
**Baseline:** Abstract 6-pillar standards + project DESIGN_RULES.md (`10px` corner radius rule)
**Screenshots:** Not captured (no dev server detected at :3000)
**Scope:** `src/app/admin/**` + `src/components/admin/**`

---

## Pillar Scores

| Pillar               | Score | Key Finding                                                                                                                                                                    |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Copywriting       | 3/4   | Mostly specific and contextual; minor generic labels ("Search", "Process") and awkward empty states                                                                            |
| 2. Visuals           | 3/4   | Clear hierarchy, good iconography; cluttered hero section duplicates sidebar stats                                                                                             |
| 3. Color             | 3/4   | Coherent indigo/violet accent system; `check-in` + `email-jobs` inconsistently use `amber-600` as primary accent                                                               |
| 4. Typography        | 3/4   | Consistent scale; heavy mix of `font-bold`/`font-extrabold`/`font-black` dilutes emphasis                                                                                      |
| 5. Spacing           | 3/4   | Standard Tailwind scale used throughout; no arbitrary pixel gaps                                                                                                               |
| 6. Experience Design | 2/4   | **Widespread `rounded-2xl`/`rounded-xl`/`rounded-lg` violations of the 10px corner radius rule** (34 × `rounded-2xl`, plus `rounded-xl` and `rounded-lg` on non-button panels) |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Enforce the 10px corner-radius rule on every box/card/panel/input in the admin console.** Impact: visible design-system drift on every page an operator uses. Current state: 34 `rounded-2xl` (16px) occurrences on cards and inputs, `rounded-xl` (12px) on the stat-card icon wells and drawer close button, and `rounded-lg` (8px) on at least one filter button and the skeleton rows. Fix: replace all `rounded-2xl` / `rounded-xl` on panels, cards, stat tiles, inputs, textareas, and selects with `rounded-[10px]`. Keep `rounded-full` only on avatars, dots, status pills, and buttons (buttons are explicitly exempt per DESIGN_RULES line 6). Concrete hotspots: `registrations-admin-panel.jsx` lines 437, 464, 472, 480, 488, 499, 524, 532, 545, 569, 606, 638, 1315–1367; `check-in-panel.jsx` lines 32, 466, 490, 506, 590; `delivery-jobs-panel.jsx` lines 457, 465, 473, 481, 495; `email-jobs-panel.jsx` lines 443, 451, 459, 473; `ticketing-admin-panel.jsx` lines 239, 267; `admin-ui.jsx` lines 127 (`rounded-xl` on stat-card icon), 215 (drawer close), 268 (`rounded-lg` on skeleton); `admin-charts.jsx` line 271 (`rounded-lg` badge). Sign-in fallbacks on all five subpages (`registrations/page.jsx:12`, `tickets/page.jsx:12`, `email-jobs/page.jsx:12`, `delivery/page.jsx:12`, `check-in/page.jsx:12`) use `rounded-[28px]` — reduce to `rounded-[10px]`.

2. **Deduplicate the hero / stat bar on the Review Queue, which is the highest-traffic surface.** Impact: `admin-shell.jsx` renders a giant "Operations Overview" hero (lines 517–560) with three stat tiles (Pending Review, Open Alerts, Signed In) directly above the registrations table — but the top header already shows the same pill values (lines 446–455), and the sidebar shows the same pending count as a badge (line 371). Three places for the same number dilute focal point and push the actual queue below the fold. Fix: collapse the hero to a single row eyebrow + title (drop the three tiles), or hide the top-header pills on `/admin/registrations` where the hero tiles are visible.

3. **Align the check-in and email-jobs primary accent with the rest of the console.** Impact: the shell, registrations, delivery, and tickets panels use `indigo-500`/`violet-500` as the accent, but `check-in-panel.jsx` (lines 426, 442, 480, 496) and `email-jobs-panel.jsx` (lines 314, 364, 389, 424) render section eyebrows, progress bars, and the primary CTA in `amber-600`. Amber reads as a warning tone elsewhere in the same UI (`AdminStatusBadge tone="warning"`), which is cognitively confusing during live check-in. Fix: recolor section eyebrows and the "Start Camera Scan" / "Process" buttons to `indigo-600`; reserve `amber-*` for actual warning states.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Strengths:** Empty states are mostly contextual — `registrations-admin-panel.jsx:1418` "No registrations match the current filters", `email-jobs-panel.jsx:416` "No registration email jobs yet", `delivery-jobs-panel.jsx:429` "Queue-backed jobs are unavailable in this environment...". Loading labels are specific: "Validating...", "Searching..." (`check-in-panel.jsx:474, 498`).
**Minor issues:**

- `admin-shell.jsx:332` — placeholder "Search..." with no scoping hint (search what?). Should read "Search registrations, jobs, tokens".
- `check-in-panel.jsx:496` button label is just "Search" — prefer "Find Attendee".
- `email-jobs-panel.jsx:391` button labelled "Process" is ambiguous outside context; "Run Job" or "Dispatch" is clearer.
- `registrations-admin-panel.jsx:886` — "Network error during export. Please try again." borders on the generic "try again" pattern. Acceptable but could guide action ("Retry export in 30s or check Sentry").
- `admin-shell.jsx:526–530` hero paragraph reads marketing-flavoured ("Review queue health, delivery progress, and check-in status from one central admin workspace...") — not actionable on the review-queue page.

### Pillar 2: Visuals (3/4)

- Icon + label pairing is consistent throughout the sidebar; every icon-only button (theme toggle, notifications, log-out) has `aria-label` and `title`. Good.
- The stat cards (`AdminStatCard`) have a readable hierarchy (eyebrow → big number → detail + icon).
- **Hero duplication:** see Priority Fix #2. The notification bell dot (`admin-shell.jsx:467`) and the "Open Alerts" tile restate the same count.
- `admin-ui.jsx:257–278` (`LoadingRows`) uses randomized widths — nice. But `rounded-lg` inside the shimmer breaks the 10px rule for box-like elements.
- Dark-mode class `dark:bg-white/[0.06]/60` (e.g. `email-jobs-panel.jsx:324, 340`) contains a double opacity suffix (`/0.06]/60`) — this is an invalid Tailwind class and will silently drop the overlay in dark mode. Repeated across ~25 locations in registrations, delivery, email-jobs panels. Visual bug.

### Pillar 3: Color (3/4)

- Primary accent: indigo/violet in shell + registrations + tickets. Coherent.
- Hardcoded hex usage is localised: `admin-shell.jsx:313, 408`, the access-fallback cards on each subpage (`#0b0c0f`, `#edf0f6`, `#23262d`, `#111318`, `#f5f6f8`, `#9ca3b5`, `#8d93a5`), and `admin-charts.jsx` (chart palette — acceptable, Recharts needs hex). The fallback-card hex set is not on the same scale as the authenticated console (which uses slate/indigo Tailwind tokens), so unauthenticated operators see a jarringly different brand.
- Accent/warning overlap: amber is used both as a "warning" tone in `AdminStatusBadge` and as the primary accent on check-in and email-jobs pages. See Priority Fix #3.
- 98 tone-keyword hits (indigo/violet/cyan/sky/emerald/amber/rose) — within range, but the palette is wide; a consolidation pass would help.

### Pillar 4: Typography (3/4)

- Size scale: nine distinct Tailwind sizes (`xs`–`5xl`) across admin components plus bracket sizes `text-[10px]` and `text-[11px]` for eyebrows. That is 11 sizes total — at the edge of acceptable for a dense admin UI.
- Weight scale: `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`, `font-black` all appear (102 matches across 9 files). `font-black` on stat pills and section eyebrows (`ticketing-admin-panel.jsx:29, 68, 300`) is heavier than the h1 hero (which is `font-black` on `admin-shell.jsx:523`) — when an 11px uppercase eyebrow visually out-weights the 3xl page title in local contrast, hierarchy suffers. Recommend: eyebrows at `font-bold` max, reserve `font-black` for the page h1 only.
- Good use of `tabular-nums` on numerics (stat pills, stat cards).

### Pillar 5: Spacing (3/4)

- Spacing uses the standard Tailwind scale (`p-3`, `p-4`, `p-5`, `p-8`, `gap-2`, `gap-3`, `gap-5`, `space-y-3`, `space-y-4`). No arbitrary px spacing in the admin components.
- Grid breakpoints are sensible: `xl:grid-cols-[minmax(0,1fr)_380px]` for the jobs/detail split (`email-jobs-panel.jsx:311`), `lg:grid-cols-[272px_minmax(0,1fr)]` for shell.
- Minor: stat-card grid at `sm:grid-cols-3` (`admin-shell.jsx:532`) becomes cramped on tablets around 640–780px; consider `md:grid-cols-3` with `sm:grid-cols-2`.

### Pillar 6: Experience Design (2/4)

The 2/4 score is driven almost entirely by systematic violation of the project's single hard design rule (10px corner radius). Absent that, the experience pillars are solid:

- **Loading states:** `LoadingRows` skeleton is used in email-jobs, delivery, registrations. `scanSubmitting`/`lookupLoading` pending labels in check-in. Good.
- **Error states:** `AdminAlert` + `AdminToast` components; `configWarning` displayed in check-in; runtime `degraded` banner on the shell (`admin-shell.jsx:512–516`); auto-reauth on 401 and redirect on 403 (`admin-shell.jsx:236–249`). Strong.
- **Empty states:** covered (see Pillar 1).
- **Disabled states:** all critical buttons have `disabled:cursor-not-allowed disabled:opacity-60` pattern and actual disabled conditions (`check-in-panel.jsx:471, 495, 537`). Good.
- **Destructive confirmation:** the export/resend/retry buttons in registrations and email-jobs-panel fire on single click with only a toast afterwards. For bulk actions that email users (e.g. `retryJob`, bulk resend), recommend a confirm modal or an undo toast.
- **Corner radius rule violations (the disqualifier):** 34 `rounded-2xl`, 2 `rounded-xl`, 3 `rounded-lg` on box-style elements — see Priority Fix #1. This is a direct contract violation with CLAUDE.md + DESIGN_RULES.md.
- **Dark-mode class bug:** `dark:bg-white/[0.06]/60` is malformed (double opacity modifier) and appears ~25 times across panels — filters out to no background in dark mode.

---

## Files Audited

- `src/app/admin/layout.jsx`
- `src/app/admin/page.jsx`
- `src/app/admin/registrations/page.jsx`
- `src/app/admin/check-in/page.jsx`
- `src/app/admin/delivery/page.jsx`
- `src/app/admin/email-jobs/page.jsx`
- `src/app/admin/tickets/page.jsx`
- `src/components/admin/admin-shell.jsx`
- `src/components/admin/admin-ui.jsx`
- `src/components/admin/admin-page-intro.jsx`
- `src/components/admin/admin-charts.jsx`
- `src/components/admin/admin-exit-guard.jsx` (not read; referenced from layout)
- `src/components/admin/registrations-admin-panel.jsx`
- `src/components/admin/check-in-panel.jsx`
- `src/components/admin/delivery-jobs-panel.jsx`
- `src/components/admin/email-jobs-panel.jsx`
- `src/components/admin/ticketing-admin-panel.jsx`
- `CLAUDE.md`, `DESIGN_RULES.md` (design contract reference)

---

## UI REVIEW COMPLETE

```json
{
  "phase": "admin",
  "overall_score": 17,
  "scores": {
    "copywriting": 3,
    "visuals": 3,
    "color": 3,
    "typography": 3,
    "spacing": 3,
    "experience_design": 2
  },
  "screenshots_captured": false,
  "top_fixes": [
    "Replace all rounded-2xl / rounded-xl / rounded-lg on boxed elements with rounded-[10px] to comply with DESIGN_RULES.md (34 rounded-2xl violations in admin panels; rounded-xl on admin-ui.jsx:127,215; rounded-[28px] on all five unauthenticated fallback cards).",
    "Deduplicate the hero stat block on /admin/registrations — the three hero tiles in admin-shell.jsx:532-558 restate values already shown in the header pills and sidebar badge.",
    "Unify check-in and email-jobs accent from amber-600 to indigo-600 so amber can stay reserved for AdminStatusBadge 'warning' tones (check-in-panel.jsx:426,442,480,496; email-jobs-panel.jsx:314,364,389,424).",
    "Fix malformed dark:bg-white/[0.06]/60 class (double opacity modifier) appearing ~25 times across registrations/delivery/email-jobs panels — silently drops the dark-mode background.",
    "Tighten typographic weight hierarchy: drop font-black from 11px eyebrows (ticketing-admin-panel.jsx:29,68,300) and reserve it for the page h1 in admin-shell.jsx:523."
  ]
}
```
