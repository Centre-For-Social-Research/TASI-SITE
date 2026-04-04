# TASI 2025 Keynote Video Section Design

## Goal

Add a new featured video section to the TASI 2025 page directly below the "About the Festival" section. The section should showcase two keynote addresses with embedded Mux players and concise editorial context.

## Scope

- Update `src/components/editions/tasi-2025-page.jsx`
- Insert one new section immediately after the existing "About the Festival" section
- Render two featured keynote video cards
- Use the exact video metadata supplied by the user

## Content Direction

The section should position these two talks as standout festival sessions that expand the page’s story from general festival framing into specific public-interest conversations.

The content should use:

- Eyebrow: `Featured Sessions`
- A short heading introducing the pair of keynotes
- Two equal-weight cards, one for each talk

Each card should include:

- `Label`
- `Category`
- `Title`
- One short descriptive paragraph
- Embedded Mux player

## Recommended Layout

Use a dedicated section with:

- A centered editorial intro at the top
- A two-column grid on desktop
- A single-column stack on mobile

Within each video card:

- Put the label in a prominent small badge or eyebrow treatment
- Show the category in a secondary metadata line
- Use the title as the main card heading
- Keep the description compact
- Place the video player in a rounded media container

## Visual Direction

The section should feel consistent with the rest of the TASI 2025 page:

- Editorial, high-trust, and polished
- Rounded cards and restrained shadow treatment
- Clear separation from the "About the Festival" section above and "Thematic Focus" section below
- Strong readability without overwhelming the page

The embeds should feel integrated into the design rather than dropped in as raw iframes.

## Video Data

### Card 1

- Label: `Featured Keynote`
- Category: `Keynote Address`
- Title: `Safety by Design in the Age of AI`
- Description: `A keynote by Julie Inman Grant, eSafety Commissioner, Australia, on AI risks, global regulation, and the future of online safety.`
- Embed source: `https://player.mux.com/k100u1ANRTgJCpEhVqJBpNxdREzMvhQWs1mE6IlSGeTE?metadata-video-title=Julie+Inman+Grant+&video-title=Julie+Inman+Grant+`

### Card 2

- Label: `Global Policy Address`
- Category: `Policy & Global Leadership`
- Title: `Combating Technology-Facilitated Gender-Based Violence: A Global Call to Action`
- Description: `A keynote by Delphine O, Ambassador-at-Large and Secretary General for the Generation Equality Forum, on global efforts to combat technology-facilitated gender-based violence.`
- Embed source: `https://player.mux.com/l6f94UXaZxMGhwpwVNhzI61C02uYEexTJH02REw1i024Os?metadata-video-title=DELPHINE+O&video-title=DELPHINE+O`

## Data Flow

Keep the implementation local to the page using a small array of video objects near the other page constants. Map over that array to render the two cards.

This keeps the new content self-contained and easy to maintain.

## Error Handling

There is no complex logic. The main implementation concerns are:

- Keep iframe attributes valid in JSX
- Ensure responsive sizing for both embeds
- Preserve accessibility with meaningful titles on the iframes

## Testing

Verification should focus on:

- Section appears directly below "About the Festival"
- Two cards render side-by-side on desktop and stack on mobile
- Both iframes are present with the correct Mux URLs
- The rest of the TASI 2025 page order remains unchanged

## Open Assumptions

- The user wants the videos embedded inline, not opened in a modal or new page
- The exact supplied titles, categories, labels, and descriptions should be used
- A shared section intro is acceptable above the two video cards
