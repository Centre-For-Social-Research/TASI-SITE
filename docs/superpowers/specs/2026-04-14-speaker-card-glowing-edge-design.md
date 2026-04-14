# Speaker Card Glowing Edge Design

Date: 2026-04-14

## Summary

Add a reusable glowing-edge frame component around speaker cards on the speakers page so that only the hovered card shows the colored edge effect. The existing card content, layout, pagination, search, and flip interaction should remain unchanged.

## Goals

- Add the glowing-edge visual treatment to speaker cards on `src/app/speakers/page.jsx`
- Scope the hover response to a single card instance at a time
- Preserve the current front/back speaker card interaction
- Reuse the new frame component for future card surfaces if needed

## Non-Goals

- Redesign the speaker card content
- Change speaker filtering, search, pagination, or data structures
- Apply the effect site-wide in this change
- Replicate the reference effect at full visual intensity if it conflicts with the current site aesthetic

## Current Context

The speakers page uses `src/components/speakers/directory.jsx`, where each `SpeakerProfileCard` renders a flip-card interface with a front face and a back face. The current layout already keeps each card isolated in its own wrapper, which makes it a good integration point for a per-card hover frame.

The existing UI language on the speakers page is warm and editorial rather than neon-heavy. The new effect should therefore feel like a premium accent around the speaker card rather than a dominant visual takeover.

## Recommended Approach

Create a reusable outer wrapper component named `GlowingEdgeFrame` under `src/components/ui/` and wrap each `SpeakerProfileCard` card shell with it.

This keeps the glow logic separate from the speaker card’s flip behavior, makes the effect independently testable, and ensures pointer tracking is handled per card instance instead of at the grid level.

## Alternatives Considered

### 1. Integrate the effect directly into `SpeakerProfileCard`

Pros:
- Fewer component layers
- Direct access to the current card structure

Cons:
- Mixes effect logic with card presentation and flip behavior
- Harder to maintain and reuse
- Makes future tuning riskier

### 2. CSS-only hover border approximation

Pros:
- Simplest implementation
- Lowest runtime complexity

Cons:
- Does not match the pointer-reactive behavior of the reference
- Lower visual quality
- Less reusable if similar effects are needed elsewhere

## Component Design

### New Component

Add `GlowingEdgeFrame` in `src/components/ui/`.

Responsibilities:
- Own pointer position tracking for a single card instance
- Compute CSS variables for pointer position, direction, and edge proximity
- Render decorative mesh border, mesh background, and glow layers
- Fade the effect in on hover and out on pointer leave
- Render child content unchanged inside a stable inner container

Public API should stay small:
- `children`
- `className`
- optional tuning props only if needed during implementation

The component should default to values that suit the speakers page so the first use does not require extra configuration.

### Integration Point

Update `SpeakerProfileCard` in `src/components/speakers/directory.jsx` so the existing flip-card structure is wrapped by `GlowingEdgeFrame`.

The wrapper should:
- Match the existing speaker card dimensions
- Preserve the current `rounded-[10px]` visual language or harmonize it with a slightly larger outer radius if needed
- Keep the card content and clickable photo behavior intact

## Interaction Design

- Hovering a card activates the glowing-edge effect only for that card
- Moving the pointer over the hovered card updates the glow angle and edge emphasis for that card only
- Moving to another card transfers the effect naturally because each frame owns its own hover and pointer state
- Leaving a card fades that card back to its resting border state
- Clicking the photo still flips only that card
- The frame should continue to work whether the front or back card face is visible

## Visual Direction

The implementation should borrow the interaction pattern from the reference but adapt the styling to the site:

- Prefer warm amber, orange, champagne, and soft coral accents over saturated rainbow emphasis
- Keep the glow subtle enough that speaker names and bios remain the focus
- Use a restrained mesh/glow opacity so the border reads as premium, not flashy
- Preserve legibility on both VIP and non-VIP speaker cards

If the exact reference styling feels too loud in context, the site’s existing visual language takes priority.

## Technical Notes

- Use per-instance `ref` and pointer handlers inside `GlowingEdgeFrame`
- Avoid any shared hover state at the directory/grid level
- Keep the implementation client-side because it depends on pointer interaction
- Prefer CSS variables for the effect so pointer updates remain localized to the hovered element
- Ensure decorative layers do not block clicks on the speaker card content
- Keep the effect resilient when the card is not hovered by forcing decorative layers to fully fade out

## Accessibility and UX

- Decorative glow layers must not interfere with keyboard focus or click targets
- The card should remain usable without hover-driven affordances
- The card content and bio must remain readable while the glow is active
- If reduced-motion handling is straightforward during implementation, animation intensity should be softened for that mode

## Testing Plan

Add or update a focused test that verifies:

- The speakers directory still renders speaker cards successfully
- The new frame wrapper is rendered around speaker cards
- Search and pagination behavior remain unaffected by the new wrapper

Verification steps during implementation:

- Run the focused speakers-related test file
- Run the broader test suite if the targeted verification is clean
- Optionally run the speakers page locally to visually confirm that hover affects only one card at a time

## Risks and Mitigations

### Risk: All cards glow at once

Mitigation:
Do not store hover or pointer state in `SpeakersDirectory`. Keep all effect state inside each `GlowingEdgeFrame` instance.

### Risk: Glow overlays interfere with flip interactions

Mitigation:
Mark decorative layers as non-interactive and keep the actual card content above them.

### Risk: Effect feels visually out of place

Mitigation:
Tune colors and opacity to the existing warm editorial palette rather than copying the reference literally.

## Implementation Scope

This change should be limited to the speakers page integration plus the reusable frame component and supporting test updates. Reuse elsewhere can happen later once the first integration is validated.
