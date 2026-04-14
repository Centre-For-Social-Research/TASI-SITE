# Exhibition Page Design

- Date: 2026-04-14
- Route: `/exhibition`
- Goal: Create a premium, credibility-led exhibition page that serves both prospective exhibitors and general visitors, with enquiry as the primary action.

## Intent

The exhibition page should feel institutional, premium, and curated. It should avoid the visual noise of a generic trade-show page and instead position TASI's exhibition environment as a serious, high-trust showcase connected to policy, platform accountability, research, and civil society dialogue.

The page needs to work for two audiences at once:

- Prospective exhibitors who want confidence that the audience and environment are worth participating in
- Visitors, partners, and stakeholders who want to understand what the exhibition looks like and what role it plays inside TASI 2026

## Direction

The approved creative direction is `Boardroom Gallery`.

This direction leads with authority and trust, then uses a structured visual gallery to make exhibition formats tangible. The tone should be premium and restrained, with a few high-impact visual moments anchored by real exhibition renders from `public/img/Exhibition`.

## Visual Language

- Overall tone: institutional and premium
- Mood: clean, composed, high-trust, curated
- Core cues from reference material and archive:
  - strong headline-led hero sections
  - proof metrics and concise value statements
  - modular content blocks that explain participation formats clearly
  - real exhibition visuals used as evidence, not decoration
- Core cues from existing TASI exhibition renders:
  - white structures and signage
  - warm timber panels and stage flooring
  - cool blue screen/light accents
  - spacious, uncluttered layouts

The page should preserve existing TASI brand patterns where appropriate, including the current navbar/footer and the existing boxed radius rule of `10px`.

## Page Structure

### 1. Hero

Purpose:
Establish the exhibition opportunity with confidence and clarity.

Content:

- Eyebrow indicating TASI 2026
- Main headline such as `Exhibit at TASI 2026`
- Supporting copy positioning the exhibition as part of India’s leading trust and safety gathering
- Primary CTA: `Send an Enquiry`
- Supporting visual: one of the strongest exhibition renders, placed prominently rather than as a background texture

Behavior:

- Desktop should use a split composition with copy and CTA on one side and featured exhibition imagery on the other
- Mobile should stack cleanly without losing the CTA or visual prominence

### 2. Credibility Strip

Purpose:
Provide immediate proof that the exhibition is selective, relevant, and valuable.

Content:

- 3 to 4 proof cards or metrics
- Emphasis should be on audience quality, curated environment, cross-sector participation, and visibility in shared festival spaces

Tone:

- concise
- factual
- high-trust rather than over-claimed

### 3. Exhibition Formats Gallery

Purpose:
Show what exhibition participation actually looks like.

Content:

- A set of visual cards using past exhibition renders
- Recommended format grouping:
  - branded booth presence
  - forum or lounge style activation
  - stage-adjacent or showcase environment
- Each card should include:
  - format title
  - short description
  - one sentence about what that format is best for

Behavior:

- Cards should feel polished and editorial, not like ecommerce tiles
- Gallery should remain readable on mobile and allow the images to carry meaning

### 4. Why Exhibit At TASI

Purpose:
Explain the strategic value of exhibiting at TASI.

Content themes:

- engage policymakers, platform leaders, researchers, and civil society
- be present in a context where trust and safety conversations are already high-intent
- align with a gathering that values substance over superficial visibility

Presentation:

- 3 to 4 strong reasons in a clean grid or staggered editorial layout

### 5. Experience / Environment Section

Purpose:
Make the physical setting feel credible and desirable.

Content:

- One larger featured visual
- Supporting secondary visuals from the archive
- Short copy describing the exhibition environment as curated, designed, and integrated into the broader event

Role in story:

This section brings in a small amount of the more spatial `Venue Dossier` instinct without overtaking the overall credibility-led direction.

### 6. Enquiry CTA Section

Purpose:
Close the page with a high-trust conversion point.

Content:

- short heading
- short reassurance copy
- primary CTA to enquiry flow

Implementation assumption:

Primary CTA should use the site’s existing contact pattern unless a dedicated exhibition enquiry endpoint or form already exists. If no dedicated flow exists, use a `mailto:` CTA to the appropriate event contact.

## Content Priorities

The page should answer these questions in order:

1. What is the exhibition at TASI 2026?
2. Why is it worth exhibiting here?
3. What kinds of exhibition presence are possible?
4. What does the environment look like?
5. How do I enquire?

## References To Borrow From

Borrow principles, not layout copies:

- Web Summit / CES:
  - strong clarity in commercial storytelling
  - fast proof and conversion cues
- VivaTech / MWC:
  - modular explanation of exhibitor opportunities
  - clearer participation framing
- RightsCon:
  - community and environment framing
  - exhibition as part of the event fabric, not a detached sales zone

## Implementation Notes

- Create a new top-level route at `/exhibition`
- Reuse existing site chrome:
  - `HomeNavbar`
  - `HomeFooter`
- Prefer existing shared UI patterns where they fit, but the page should not feel like a copy of `/sponsor`
- Use the exhibition images from `public/img/Exhibition`
- Keep all box-style corner radii at `10px`
- Preserve good desktop and mobile behavior

## Testing Expectations

- Route renders correctly at `/exhibition`
- Hero CTA is visible and usable on desktop and mobile
- Exhibition image sections load correctly and maintain layout integrity
- No visual breakage against current global styles
- Lint passes for touched files

## Out Of Scope

- Building a dedicated multi-step exhibitor application system
- Creating new CMS models for the page
- Adding animation-heavy or overly theatrical interactions
- Reworking `/sponsor` as part of this task
