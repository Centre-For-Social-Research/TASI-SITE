# TASI 2025 Track Card Illustrations Design

Date: 2026-04-15
Page: `src/components/editions/tasi-2025-page.jsx`
Scope: `Thematic Focus` / `Seven Key Tracks` cards only

## Goal

Make the TASI 2025 thematic track cards feel more attractive and premium by adding abstract illustrations to each card, while preserving the current grid structure and allowing a direct visual comparison between two illustration styles.

## Current Problem

The current track cards are typographic only. They read clearly, but they do not carry enough visual richness for a premium archival page about TASI 2025. The section feels flatter than the surrounding hero, keynote, and impact areas.

## Chosen Direction

Create an in-page A/B comparison:

- The first half of the track cards uses a subtle monochrome editorial illustration style.
- The second half uses a stronger accent-graphic illustration style.

This lets the user compare both visual directions inside the real page context before deciding which language should remain.

## Structure

Keep the existing:

- card grid
- card copy
- card count
- overall section spacing

Each card will gain a dedicated illustration area above the track title. The title, accent rule, and description will remain, but the card hierarchy will be adjusted to make room for the graphic without making the layout feel crowded.

## Illustration Strategy

Each track gets its own abstract graphic treatment inspired by its topic, using shapes, linework, gradients, and icon-like compositions rather than photography.

### Style A: Subtle monochrome

Used on the first half of the cards.

Characteristics:

- restrained, editorial, quieter
- mostly neutral or near-monochrome treatment
- linework and layered geometric forms
- premium but understated

### Style B: Stronger accent graphic

Used on the remaining cards.

Characteristics:

- richer color presence using the site palette
- more contrast and distinct personality
- slightly more luminous or dimensional visual feel
- still premium, but more expressive

## Visual Rules

- Preserve the existing site language and avoid generic stock-icon styling.
- Follow the `10px` radius rule on all boxed elements.
- Do not redesign the entire section; keep comparison focused on card illustration language.
- Avoid decorative clutter that competes with the card text.
- Keep the cards readable on desktop and mobile.

## Implementation Notes

Likely changes are confined to `src/components/editions/tasi-2025-page.jsx`.

Implementation will likely:

- expand the `tracks` data structure so each item can carry illustration metadata
- render a dedicated illustration block inside each card
- apply two different illustration treatments based on card index or item metadata
- preserve current title and description content

No new assets are required if the illustrations are rendered directly with HTML/CSS and existing utility classes.

## Testing

- Verify the track cards still align cleanly across breakpoints.
- Verify all boxed elements keep `rounded-[10px]`.
- Verify the first half clearly reads as subtle monochrome and the second half clearly reads as accent-led.
- Verify the section still feels coherent as one system, not like two unrelated components.

## Out of Scope

- Changes to the rest of the TASI 2025 page
- Copy changes to the track descriptions
- New backend logic
- Replacing the A/B split with a single final direction in this step
