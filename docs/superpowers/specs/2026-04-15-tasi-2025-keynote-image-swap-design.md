# TASI 2025 Inaugural Keynote Image Swap Design

Date: 2026-04-15
Page: `src/components/editions/tasi-2025-page.jsx`
Scope: `Inaugural Keynote` media card only

## Goal

Replace the current `Inaugural Keynote` image on the TASI 2025 page with the newly provided photo of Dr. S. Jaishankar speaking at the festival podium, while keeping the existing click-through video behavior and surrounding section content unchanged.

## Current State

The `Inaugural Keynote` section already includes:

- a linked image card that opens the keynote video on YouTube
- hover-overlay copy that invites the user to watch the video
- editorial copy about India&apos;s Foreign Minister opening the festival

The current image is sourced from the home gallery assets and is not the newly provided podium shot.

## Chosen Direction

Make this a direct media replacement, not a redesign.

This means:

- use the provided keynote image as the image shown in the existing card
- preserve the current YouTube link target
- preserve the existing overlay and hover behavior
- preserve the existing section layout, copy, spacing, and aspect ratio

## Asset Handling

The provided image should be added as a public asset in the existing TASI/home gallery image area so the keynote section continues to use the same Next.js image delivery pattern as the rest of the page.

The image path in the keynote card should be updated to the new asset.

## Accessibility

The `alt` text should continue to describe Dr. S. Jaishankar speaking at TASI 2025, aligned to the keynote context and the new podium image.

## Implementation Notes

Likely changes:

- add the new keynote image file under `public/img/home-gallery/`
- update the `Image` component source in `src/components/editions/tasi-2025-page.jsx`

No copy changes, route changes, or interaction changes are needed.

## Testing

- Verify the keynote card still opens the same YouTube URL.
- Verify the new image renders in the existing aspect ratio without breaking the layout.
- Verify hover overlay text still appears.
- Run the existing test suite to catch regressions.

## Out of Scope

- redesigning the keynote section
- changing the video target
- editing keynote copy
- changing any other TASI 2025 section
