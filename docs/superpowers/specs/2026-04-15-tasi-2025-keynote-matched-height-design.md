# TASI 2025 Keynote Matched Height Design

Date: 2026-04-15
Page: `src/components/editions/tasi-2025-page.jsx`
Scope: `Inaugural Keynote` layout only

## Goal

Increase the visual presence of the TASI 2025 inaugural keynote image by making the left media column extend down to align with the bottom border of the `Key Message` box on desktop, while preserving the existing image, click-through video behavior, and copy.

## Current State

The keynote image now uses the approved podium photo and a `3:2` frame. It reads better than the earlier taller crop, but it still occupies less total vertical area than the right-side content stack, so the left column feels lighter than the text column beside it.

## Chosen Direction

Use a matched-height two-column layout on desktop.

This means:

- the left keynote media card should stretch vertically to match the full height of the right-side content stack
- the bottom edge of the media card should align with the bottom border of the `Key Message` box
- the image should remain full-bleed with `object-cover`
- the YouTube link, hover overlay, and copy remain unchanged
- mobile should keep a normal ratio-based image treatment instead of forcing a very tall media block

## Visual Intent

The keynote section should feel more balanced as a pair of parallel columns. The image should carry comparable visual weight to the heading, paragraph, and quote card on the right, rather than stopping early and leaving the left side visually underused.

## Implementation Notes

Likely changes are limited to:

- `src/components/editions/tasi-2025-page.jsx`
- `tests/tasi-2025-page.test.cjs`

Implementation will likely:

- make the section grid items stretch on desktop rather than center-align
- turn the left article and anchor into full-height containers on desktop
- switch the image wrapper to a mobile ratio plus desktop full-height treatment
- keep the existing image source and overlay behavior intact

## Testing

- Verify the keynote image still links to the same YouTube URL.
- Verify the image fills down to the bottom of the `Key Message` box on desktop.
- Verify the mobile layout still uses a sensible ratio-based image frame.
- Run the full test suite for regressions.

## Out of Scope

- changing keynote copy
- changing the keynote image asset
- redesigning the rest of the TASI 2025 page
- changing unrelated sections
