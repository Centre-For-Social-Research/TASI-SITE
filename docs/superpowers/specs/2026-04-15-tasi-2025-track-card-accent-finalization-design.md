# TASI 2025 Track Card Accent Finalization Design

Date: 2026-04-15
Page: `src/components/editions/tasi-2025-page.jsx`
Scope: `Thematic Focus` / `Seven Key Tracks` cards only

## Goal

Finalize the TASI 2025 thematic track cards by applying the accent-graphic illustration treatment to all cards and removing the temporary A/B comparison framing so the section reads as one cohesive premium design system.

## Current State

The track cards currently contain a deliberate split:

- first half uses subtle monochrome illustrations
- second half uses accent-led illustrations

This served as an in-page design comparison. The preferred direction is now clear: the accent-graphic treatment should be used across all seven cards.

## Chosen Direction

Unify all track cards under the accent-graphic illustration language.

This means:

- every track uses the stronger accent-led illustration treatment
- the cards keep their illustration blocks
- the section stops reading like a comparison experiment
- all comparison labels or logic that imply two active visual systems should be removed or simplified

## Visual Direction

The final card system should feel:

- vivid but still premium
- more expressive than the earlier monochrome treatment
- consistent across all cards
- visually integrated with the rest of the TASI 2025 page

The illustration blocks should still be abstract and topic-inspired, not photo-based or stock-icon-like.

## Structural Changes

Keep:

- the current card grid
- the illustration area above each title
- the card copy
- the existing section spacing
- the `10px` radius rule

Change:

- all `illustrationVariant` values to the accent style
- any text labels that were only present to support the A/B comparison
- tests so they validate the final unified accent treatment rather than the comparison state

## Implementation Notes

Likely files:

- `src/components/editions/tasi-2025-page.jsx`
- `tests/tasi-2025-page.test.cjs`

Implementation will likely:

- remove the subtle variant usage from the track data
- simplify the illustration rendering logic where it still branches only for the A/B comparison
- keep the individual illustration patterns
- remove comparison wording such as the monochrome/accent labels if they no longer serve the final design

## Testing

- Verify all seven cards now use accent treatment.
- Verify the section no longer reads like a split test.
- Verify the cards still align correctly across breakpoints.
- Verify all boxed elements continue to use `rounded-[10px]`.

## Out of Scope

- redesigning the rest of the TASI 2025 page
- changing the card copy
- introducing new assets
- changing unrelated sections or routes
