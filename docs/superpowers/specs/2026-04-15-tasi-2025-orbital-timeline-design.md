# TASI 2025 Orbital Timeline Design

## Goal

Adapt the radial-orbital timeline concept for the TASI 2025 page so it tells the story of the festival journey across the page’s major sections in a premium, editorial way.

## Approved Direction

Use the component as an editorial festival arc, not as a schedule tool and not as a decorative standalone widget.

The timeline should represent five narrative stages:

1. Arrival in New Delhi
2. Keynote Moments
3. Six Key Tracks
4. Core Takeaways
5. Looking Ahead to TASI 2026

## Placement

Insert the section on the TASI 2025 page after the opening hero/about context and before the deeper content blocks, so it acts as a visual story map for the rest of the page.

Primary target file:

- `src/components/editions/tasi-2025-page.jsx`

## Design Intent

- The component should feel premium, editorial, and clearly integrated into the TASI 2025 visual system.
- It should not look like a default sci-fi widget or unrelated product timeline.
- The orbit layout should help the user understand the page journey at a glance.
- Each node should correspond to real content already present on the page.

## Visual Direction

- Use the TASI 2025 page palette and existing rounded-corner language.
- Keep motion restrained and intentional.
- Favor warm editorial contrast over neon-heavy effects.
- Keep typography legible and slightly elevated.
- Make the central hub and orbit nodes feel like a curated festival map.

## Content Structure

The timeline should have:

- A section eyebrow
- A strong title
- A short explanatory paragraph
- One central anchor point for TASI 2025
- Five orbiting narrative nodes with concise labels and short supporting descriptions

## Interaction

- The section can be primarily visual and explanatory.
- If links are added, they should point to real sections on the page.
- Hover/focus states should feel polished but not excessive.

## Responsive Behavior

- Desktop can use the full orbital layout.
- Tablet/mobile should simplify into a stacked or reduced-complexity layout while preserving the same narrative order.
- Mobile usability is more important than preserving the exact orbital geometry.

## Constraints

- Do not remove existing TASI 2025 sections.
- Do not rewrite the entire page around the component.
- Do not turn the page into a dense infographic.
- Keep the component focused on storytelling across sections already present.

## Success Criteria

- The TASI 2025 page gains a clear visual story map of the festival journey.
- The timeline feels custom to TASI rather than copied from a component gallery.
- The section improves page coherence and narrative flow.
- The design remains readable and premium across desktop and mobile.
