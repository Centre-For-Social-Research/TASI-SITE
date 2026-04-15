# Home Hero Sparkles Text Design

## Goal

Introduce the `sparkles-text` treatment from the referenced 21st.dev component into the homepage hero where `TASI 2026` and `Delhi` are displayed, while keeping the hero premium, restrained, and consistent with the existing site theme.

## Approved Direction

Use the effect only on:

- `2026`
- `Delhi`

Keep `TASI` itself as static editorial typography.

## Scope

Update the homepage hero in:

- `src/components/home/hero.jsx`

Add one reusable local UI component for the sparkle treatment, adapted to this codebase rather than depending on a runtime third-party install.

## Design Rules

- Preserve the existing hero structure, spacing, and CTA layout.
- Preserve current text hierarchy and approximate sizing.
- Keep the sparkle effect subtle and premium, not playful or noisy.
- Use site-aligned tones rather than introducing an unrelated palette.
- Maintain legibility on both desktop and mobile.
- Do not change hero copy other than visual treatment.

## Implementation Approach

1. Create a local `SparklesText` component inside the project.
2. Adapt the effect to work with the current React and Tailwind setup.
3. Apply the component only to the `2026` line and the `Delhi` heading.
4. Keep the rest of the hero typography and layout unchanged.
5. Verify the result with lint/tests and confirm the hero still renders cleanly.

## Constraints

- No external runtime dependency should be required just to render the hero effect.
- No unrelated homepage redesign.
- No changes to hero CTA behavior.
- No changes to the hero background system.

## Success Criteria

- The homepage hero displays a refined sparkle treatment on `2026` and `Delhi`.
- The effect reads as premium and integrated, not generic or distracting.
- The hero remains balanced, readable, and aligned with the current brand presentation.
- The implementation passes repository verification checks.
