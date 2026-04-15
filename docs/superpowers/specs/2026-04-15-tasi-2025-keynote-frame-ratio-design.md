# TASI 2025 Keynote Frame Ratio Design

Date: 2026-04-15
Page: `src/components/editions/tasi-2025-page.jsx`
Scope: `Inaugural Keynote` media frame only

## Goal

Update the TASI 2025 inaugural keynote media frame so it matches the new image's `3:2` proportions, preserving the existing click-through video behavior and keeping the section visually balanced with the text column.

## Current State

The keynote image now uses the approved Dr. S. Jaishankar podium photo, but the frame still uses a taller ratio (`4:5` on small screens and `4:4.5` on desktop). That forces unnecessary cropping and makes the image block feel misaligned with the right-side text stack.

## Chosen Direction

Use a `3:2` media frame for the keynote image.

This means:

- the keynote image wrapper should use a `3:2` aspect ratio
- the image should continue to use `object-cover`
- the YouTube link, hover overlay, copy, and section layout stay unchanged

## Visual Intent

The keynote image should feel broader and more editorial, with proportions that reflect the source asset instead of compressing it into a taller card. This should make the left-side media and right-side text feel more parallel within the existing two-column section.

## Implementation Notes

Likely changes are limited to:

- `src/components/editions/tasi-2025-page.jsx`
- `tests/tasi-2025-page.test.cjs`

Implementation will:

- replace the current keynote image wrapper aspect utility classes with a `3:2` ratio
- extend regression coverage so the new ratio is enforced in source

## Testing

- Verify the keynote card still links to the same YouTube URL.
- Verify the keynote frame now uses a `3:2` ratio.
- Verify the image remains cropped cleanly with `object-cover`.
- Run the full test suite for regressions.

## Out of Scope

- changing keynote copy
- changing the keynote image itself
- changing the section grid structure
- changing any other TASI 2025 section
