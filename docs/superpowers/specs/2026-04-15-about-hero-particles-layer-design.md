# About Hero Particles Layer Design

## Goal

Add a subtle animated particles layer to the About Us hero using the provided component pattern, while avoiding CDN loading and preserving the existing hero composition.

## Approved Direction

Use the supplied particles component as the base implementation, but make only the minimum changes required for this codebase:

- avoid CDN loading
- install and use a local `particles.js` package
- place the effect in the About hero only
- reduce opacity slightly so it reads as atmosphere, not primary content

## Placement

Apply the particles layer in:

- `src/app/about/page.jsx`

The particles layer should sit:

- above the hero’s base visual background
- below the hero copy container
- inside the existing `BrandedPageHero` stack

## Component Scope

Create a dedicated local client component for the About hero particles layer, likely in:

- `src/components/about/about-hero-particles.jsx`

The component should remain structurally faithful to the provided snippet:

- client component
- mount-time initialization
- theme-aware color switching
- cleanup on unmount
- full-bleed absolute positioning

## Dependency Strategy

Do not load particles from CDN.

Instead:

- install `particles.js` as a project dependency
- initialize it from the component using the locally available library
- avoid global script injection where possible

## Visual Adjustments

Only minor visual adjustments are allowed:

- reduce particle opacity from the original snippet
- reduce line opacity slightly
- tune colors to align with the site’s editorial palette and existing About hero tones
- ensure the effect does not overpower hero text or reduce readability

The effect should feel premium and subtle, not bright or tech-demo-like.

## Interaction

Keep the original interaction model unless it interferes with the hero experience:

- hover interaction may remain
- click-to-push may remain
- motion should still feel restrained in practice because the layer sits behind the hero text

## Constraints

- Do not redesign the About hero layout
- Do not alter the hero copy
- Do not replace the existing hero background treatment
- Do not introduce a CDN dependency
- Do not let the layer interfere with hero text readability or click targets

## Success Criteria

- The About hero includes a subtle particles layer behind the text
- The implementation uses a locally installed dependency, not a CDN
- The effect remains visually subordinate to the hero copy
- The hero keeps its current layout and readability
- The component cleans up safely and does not leak canvases across re-renders
