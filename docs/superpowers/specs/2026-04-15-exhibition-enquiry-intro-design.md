# Exhibition Enquiry Intro Design

Date: 2026-04-15
Page: `src/app/exhibition/page.jsx`
Scope: Left-side intro block inside the `#exhibition-enquiry` section only

## Goal

Make the Exhibition Enquiry intro block feel consistent with the exhibition page's premium editorial tone instead of reading like plain support copy. The block should carry brand voice, balance the form card visually, and frame the enquiry as a curated invitation for serious organisations.

## Current Problem

The current left column is structurally correct but tonally flat. It uses a straightforward heading and utility copy that reads like form instructions rather than a considered editorial lead. On a page built around premium positioning, curated participation, and relevance-driven presence, this weakens the final conversion section.

## Chosen Direction

Use an editorial manifesto approach.

The left block should feel like a composed invitation rather than a helper panel. It should speak to relevance, fit, and tailored presence at TASI, while still supporting the form on the right. The structure should echo the exhibition page's stronger sections by using sharper hierarchy, more intentional spacing, and short supporting points instead of a plain paragraph stack.

## Content Strategy

Replace the current copy with:

- A stronger eyebrow that maintains the section label but feels more deliberate.
- A headline that sounds elevated and invitation-led, not administrative.
- A lead paragraph that frames the enquiry as the starting point for a more tailored presence at TASI.
- A compact set of editorial support points that explain the kind of organisations this is for and what happens after submission.
- A direct contact line that remains available but is integrated into the premium tone rather than presented as fallback utility text.

The copy should stay concise, confident, and brand-led. It should align with the rest of the page's language around relevance, ecosystem participation, curated formats, and thoughtful on-site presence.

## Visual Structure

Keep the existing two-column enquiry section and form card. Update only the left column presentation.

The revised left column should include:

- A refined eyebrow label.
- A more editorial headline with stronger rhythm.
- One primary paragraph with slightly more brand voice.
- A vertical stack of 2-3 compact editorial notes or pillars beneath the main copy.
- A final contact line with slightly stronger integration into the section hierarchy.

These supporting notes should not become generic bullets. They should read like concise editorial markers that reinforce quality, relevance, and follow-up.

## Styling Rules

- Preserve the site's existing palette and premium exhibition-page tone.
- Follow the existing `10px` radius rule for any boxed elements.
- Do not change button styling unless required by the existing section structure.
- Keep the form behavior, fields, and submission logic unchanged.
- Reuse the existing spacing, typography, and color vocabulary already present on the exhibition page wherever possible.

## Implementation Notes

Likely changes are confined to `src/app/exhibition/page.jsx`.

Implementation will:

- Rewrite the left-side enquiry copy.
- Replace the plain text stack with a more editorially structured block.
- Add compact supporting items that visually strengthen the column.
- Preserve the current form card and right-column layout.

No API, form, or validation changes are in scope.

## Testing

- Verify the section still reads well on mobile and desktop.
- Check that the left column now feels visually balanced against the form card.
- Confirm the contact email remains clear and accessible.
- Confirm no radius values exceed `10px` for new boxed elements.

## Out of Scope

- Changes to the enquiry form fields or submit behavior.
- Changes to other exhibition page sections.
- New animation, new CTA behavior, or changes to backend workflows.
