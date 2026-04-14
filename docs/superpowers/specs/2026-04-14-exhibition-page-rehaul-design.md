# Exhibition Page Rehaul Design

- Date: 2026-04-14
- Route: `/exhibition`
- Goal: Redesign the exhibition page into a more compelling, enquiry-led destination that feels more premium, more intentional, and more sellable while staying consistent with the existing TASI theme, color system, and overall brand language.

## Intent

The current exhibition page is functional but not distinctive enough. It explains the opportunity, but it does not yet create enough desire, clarity, or momentum for organisations deciding whether to enquire.

The rehaul should make the page feel like a flagship invitation rather than a standard information page. It should communicate two things equally well:

- access to the right people
- participation inside a premium, curated environment

The page should still feel recognisably TASI. This is not a visual reset of the brand. It is a stronger application of the existing TASI visual language to one commercial page.

## Approved Direction

The approved direction is `Flagship Pavilion`.

This direction keeps the shared TASI hero, then moves into a more persuasive exhibition story built around high-trust access, premium on-site presence, and stronger visual staging. It should feel more valuable and more deliberate than the current version, without drifting into generic expo design.

## Audience

Primary target audience:

- a balanced mix of technology companies and product platforms
- institutions, NGOs, research bodies, and ecosystem organisations

The page should not overfit to one commercial archetype. The copy and visuals should make both types of organisations feel welcome and relevant.

## Conversion Goal

The page remains enquiry-led.

It should sell the opportunity strongly, but it should not introduce tier grids, pricing sheets, or package shopping behavior. The story should build confidence, then move the visitor toward enquiry.

## Research Summary

### What the external references do well

- authority-led page openings
- quick proof and value framing
- clear participation formats
- environment or booth imagery that makes participation tangible
- strong CTA rhythm without excessive clutter

### What the best TASI pages do well

- shared branded hero creates consistency
- premium gradients and high-contrast sections signal importance
- white sections with measured typography feel more editorial and trustworthy
- image-led cards work better when they are not overly dense
- stronger sections usually combine clear value framing with one or two visual anchors

### What to improve from the current exhibition page

- the page feels too evenly weighted, with not enough dramatic hierarchy
- it explains formats, but does not sell the larger promise strongly enough
- it needs more strategic visual sequencing
- it should use a more varied image story from the exhibition archive

## Visual Language

- Keep the existing TASI color palette intact
- Keep the current font system and typography style intact
- Preserve the shared `BrandedPageHero`
- Preserve the `10px` box radius rule
- Use richer section contrast and image pacing rather than introducing new color families

The rehaul should feel:

- premium
- persuasive
- institutional but not dry
- commercial without feeling generic

## Image Strategy

The page should use a broader mix of exhibition renders so the experience feels more dimensional.

Recommended visual roles:

- one hero-supporting environment image
- one or two booth-focused images for tangible exhibitor presence
- one or two stage or forum images to show event integration
- one partner-wall or display image to suggest prestige and ecosystem participation

The images should not all be used as equal cards in one grid. They should be staged with different roles:

- anchor image
- supporting image
- detail image

## New Page Structure

### 1. Shared TASI Hero

Use the same top hero structure used on other inner pages.

Purpose:

- orient the page within the site
- keep visual consistency with TASI
- establish the route as a serious destination

Content:

- eyebrow for TASI 2026
- page title
- short framing sentence

### 2. Flagship Selling Section

This becomes the real opening argument of the page.

Purpose:

- make the page feel immediately more valuable
- combine people-access and environment quality in one strong section

Layout:

- split layout with stronger copy on one side
- one strong exhibition image on the other

Content:

- more persuasive headline
- clearer business case
- explicit mention of who visitors can engage with
- primary enquiry CTA
- secondary jump CTA into the page

This section should feel more like a premium commercial landing section than the current straightforward introduction.

### 3. Proof Band

Replace the current generic stat-strip feel with a cleaner proof band.

Purpose:

- communicate credibility quickly without feeling like filler

Content options:

- curated audience profile
- integrated festival visibility
- high-intent dialogue

Presentation:

- short, sharper proof items
- fewer words per item
- stronger hierarchy

### 4. Participation Modes

This replaces the current standard format card area with something more designed and more persuasive.

Purpose:

- explain how an organisation can show up
- make each participation mode feel desirable

Recommended participation modes:

- showcase presence
- hosted conversation or lounge format
- stage-connected brand or thought leadership presence

Design notes:

- cards should feel cleaner, more editorial, less “template grid”
- image and copy rhythm should vary slightly so the section feels designed
- titles should be more concise than the current version

### 5. Why This Audience Matters

Purpose:

- shift from environment selling to commercial relevance
- explain why the room itself is valuable

Content themes:

- policy + platform + civil society intersection
- serious trust and safety context
- participation with relevance, not noise

Presentation:

- use a stronger contrast section
- concise benefit blocks, but with more emotional force than the current version

### 6. Environment Story

Purpose:

- show the physical and atmospheric quality of the exhibition
- reinforce that this is a curated environment, not a generic floor plan

Layout:

- one large anchor image
- one or two supporting images with different proportions
- possibly one image paired with a short narrative block

The image arrangement should feel intentionally composed, not like a simple gallery dump.

### 7. Final Enquiry CTA

Purpose:

- close with confidence
- make the next step feel direct and easy

Content:

- short, assured headline
- short explanatory sentence
- primary enquiry action
- optional supporting contact link

This section should use a high-value visual treatment, but it should not overpower the page.

## Content Priorities

The page should answer these questions in order:

1. Why should an organisation want to exhibit at TASI?
2. Who will they be in the room with?
3. What kinds of exhibition presence are possible?
4. What does the environment actually feel like?
5. How do they enquire?

## What This Rehaul Must Achieve

- feel more premium than the current page
- feel more commercially convincing
- stay consistent with TASI theme, color palette, and typography
- use more varied and better-staged exhibition images
- keep enquiry as the single primary conversion path

## What To Avoid

- generic expo tropes
- cluttered card grids with equal weighting everywhere
- adding pricing or package tables
- introducing off-brand colors or typography
- making the page look louder at the expense of credibility

## Implementation Notes

- redesign the existing `/exhibition` route in place
- retain `HomeNavbar`, `HomeFooter`, and `BrandedPageHero`
- keep the current enquiry flow pattern
- use images from `public/img/Exhibition`
- follow current box radius and site styling rules

## Testing Expectations

- `/exhibition` renders successfully
- enquiry CTA remains visible and functional
- new image composition behaves well on desktop and mobile
- touched files lint clean
- production build completes successfully
