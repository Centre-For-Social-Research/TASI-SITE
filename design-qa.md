# Media Accreditation Page Design QA

## Comparison target

- Source visual truth: the live TASI media accreditation section at `https://trustandsafetyindia.org/media#media-accreditation`, plus the existing `BrandedPageHero`, navigation, footer, typography, color, and 10px panel-radius conventions in this repository.
- Implementation: `http://127.0.0.1:3000/media/accreditation` and the compatibility callout at `http://127.0.0.1:3000/media#media-accreditation`.
- Source screenshot: captured inline in the Codex in-app browser at the default desktop viewport; the browser did not expose a persistent local screenshot path.
- Implementation screenshots: captured inline in the Codex in-app browser at desktop and mobile widths; the browser did not expose persistent local screenshot paths.
- Desktop viewport and pixels: 1270 x 710 CSS px, device scale factor 1.
- Mobile viewport and pixels: 390 x 844 CSS px, device scale factor 1.
- State: light theme, signed out, empty accreditation form, optional cookies rejected. No form submission was performed.

## Full-view comparison evidence

The implementation intentionally changes the information architecture from an anchored form at the bottom of a long media-coverage page to a dedicated application page. It preserves the source visual system: the shared TASI gradient hero, white display typography, cream content background, purple form treatment, existing event photography, existing navigation and footer, and 10px cards. The media page now uses a concise callout that carries the same purple treatment and image into the dedicated route.

## Required fidelity surfaces

- Fonts and typography: existing site font stack, weights, tracking, and responsive heading scale are reused. The desktop and mobile captures show clear hierarchy and no truncation.
- Spacing and layout rhythm: desktop uses a guidance/form split; mobile stacks guidance, process, image, and form without horizontal overflow. Cards and panels use the required 10px radius.
- Colors and visual tokens: the existing TASI purple, magenta, orange, cream, white, and dark-mode tokens are preserved. Form contrast remains consistent with the source section.
- Image quality and asset fidelity: the existing `/img/hero-bg-2.png` asset is reused with `next/image` and responsive sizing. The form image is shown at its natural color and contrast without a blue or purple overlay. No placeholder or generated replacement is present.
- Copy and content: eligibility, review expectations, event dates, privacy links, field labels, and confirmation behavior are clear. The existing form payload and backend endpoint are unchanged.

## Focused region comparison evidence

The form was inspected separately at desktop and 390px mobile width. All six fields, labels, select controls, privacy links, and the existing submit button remain visible and legible. The form now uses the full right-column content width, keeping both field columns aligned to the same outer edges. The mobile form stays single-column and the submit action fits without overflow. The old `/media#media-accreditation` anchor was also checked after adding scroll offset; its heading and call to action clear the sticky navigation.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- No console warnings or errors were recorded on the new route during the final browser pass.
- P3: the form is intentionally below the eligibility guidance on mobile, adding some scroll before the first field. This is acceptable because the guidance establishes who should apply and what happens next.

## Comparison history

1. Initial compatibility callout capture placed its eyebrow close to the sticky navigation when opened through the old hash URL.
2. Added `scroll-mt-32` to the callout container.
3. Reopened `/media#media-accreditation`; the full eyebrow, heading, copy, image, and CTA were visible below the navigation.
4. Removed the tint and opacity from the form photograph, expanded the form to the full right-column width, and recaptured the desktop layout. The natural-color image, outer card edges, and both field columns aligned as intended.
5. Compared the user-supplied desktop screenshot, stretched both desktop columns to the same height, moved the media-centre link inside the second white card, and anchored it at the bottom. The white guidance column and purple form card now finish on the same baseline.

## Primary interactions checked

- Direct loading of `/media/accreditation`.
- Desktop and mobile responsive rendering.
- Media-page and Get Involved links resolve to the dedicated route.
- Form controls and select options are exposed with their expected labels.
- Privacy Policy, T&Cs, and media-centre links are present.
- No live application was submitted during QA.

## Implementation checklist

- [x] Dedicated public route and metadata.
- [x] Existing media API and storage behavior preserved.
- [x] Media-page form replaced with a focused callout.
- [x] Get Involved and media resource links updated.
- [x] Sitemap entry added.
- [x] Desktop and mobile visual checks passed.
- [x] Console checked.

final result: passed
