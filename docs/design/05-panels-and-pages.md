# 05. Panels and pages

Screens: `b03-layer.png`, `b04-area.png`, `b05-node.png`, `b06-node-another-field.png`, `b07-org.png`, `b13-phone-sheet.png`.

In the reference, the map renders its own panel. On the site the architecture doc has the map run with `panel: false` and the site renders the panel from server data, so this file is written as a component spec for the site. Build the panel and the detail pages from the same components, so a problem looks the same in the map's side panel and on `/problems/<slug>`.

## The panel container

- **Wide screens:** a side sheet inside the map area, pinned to the right, `min(410px, 35%)` wide, full map height (capped at the viewport height minus 24px), scrolling inside with `overscroll-behavior: contain`. Paper background, 1.5px ink border on its left edge and 1px on top. Padding 14px 18px 22px. The camera leaves room for it (see `04-interaction.md`).
- **Phone:** a bottom sheet (see `04-interaction.md`).
- The panel is an `aside` with `aria-live="polite"` and `aria-label="Details"`, and it scrolls back to the top whenever its content changes.

### Focus and keyboard (for a site-rendered panel)

The reference handles these itself; with `panel: false` the site has to:

- After a search result is chosen, move focus to the panel's close button without scrolling (`focus({preventScroll: true})`).
- The map listens for Escape on the document and goes up a level, which fires `fieldmap:navigate`; the site updates its panel from that event. If Escape was pressed inside the panel and the panel is still open afterwards, put focus on its close button; if the panel has closed, return focus to the map's current tile.
- Keep the close button and every row reachable by Tab in reading order, and keep visible focus (2px `--fm-focus` outline, 2px offset).
- Every row and breadcrumb step is a real `button` or link, never a clickable `div`.

## Components

### Top row: breadcrumb and close

A breadcrumb on the left and a square close button on the right.

- Breadcrumb: 13px, each step an underlined button in ink-2 (underline in `--fm-rule-2`, 3px offset, full ink on hover), separated by " / " in ink-3. It starts at "Whole map" and runs through layer and sub-area to the parent of what's open. The current item is not repeated in the breadcrumb, because it's the title below. For an organisation it shows where you came from: "Whole map / Agent and application security".
- Close: 30px square, 1px ink border, 2px radius, an × drawn with two 1.6px strokes. It inverts (ink background, paper icon) on hover. Label: "Back to the whole map".

### Title and status

- Title: 24px 600, balanced wrapping.
- Role line (layers only): italic ink-2, directly under the title.
- Status line (problems): a 20px mini tile, then the capacity label in 600 followed by a full stop and one plain sentence: "**Active.** Several groups are working on it, with room for more." In v2, `capacity_note` replaces the stock sentence when it exists.
- Home line (v2 problems): a 20px token icon (or a blank 20px space), then "**Who holds it:** Universities, Government." See `06-v2-encoding.md`.
- Connection box (v2, another-field problems only): a paragraph with a 3px left border and a faint tint, 14px ink-2, starting with the label in ink 600: "**Weak connection.** There is some contact, but little flows between that field and AI developers." Green border for strong, periwinkle for weak and missing.
- Summary line (layers and sub-areas): 14px ink-2, for example "Grid E3. 6 problems: 2 with a little work, 4 active. 2 held by another field, 2 only in frontier labs."
- Definition: 14.5px ink-2, line height 1.5, 12px above.

### Section heading

15px 600, with a 2px ink rule above it (10px padding, 22px margin above the rule). A count or note sits on the right in 13.5px ink-3: "Who works on it ........ 14 organisations". Sub-headings inside a section are 13px 600 ink-2: "Main line of work (5)", "Side line (9)", "In The Model".

### Organisation card

Used under "Who works on it" on a problem.

- Name as an underlined button, 15px 600 ink, underline in `--fm-rule-2` until hover. It opens the organisation level.
- "Website" on the right of the same line, 12.5px ink-3 with a 1px bottom border, opening in a new tab.
- Meta line, 13px ink-3: type and country, joined with " · ", plus "Dormant", "Closed" or "Status unknown" when relevant ("Startup · Switzerland").
- Openness chips: 12px 500, 1px border, 2px radius. Chips that mean you can act now (Hiring, Fellowship or programme, Open to collaborators, Contact form) have an ink border and ink text; the others (Publishes open problems, Not taking approaches) use `--fm-rule-2` and ink-2.
- "Why it's listed": a `details` element with a "+ " or "− " prefix, 12.5px ink-3, opening to the evidence note and a "Source" link.
- Cards are separated by 1px `--fm-rule` lines, 9px padding top and bottom.

Organisations are split into "Main line of work (n)" and "Side line (n)", each alphabetical. If none has it as a main line, say so in italic: "No organisation has this as a main line of work." If there are none at all: "No organisation is recorded here yet."

### Rows

The workhorse list, used for problems in a sub-area, linked problems, an organisation's problems, sub-areas in a layer, and organisations in a sub-area or layer.

- Each row is a full-width button: an 18px mini tile (or no icon), the name, and an optional right-hand value.
- The name is always underlined (1px, ink at 35%, 3px offset), thickening to 1.5px full ink on hover, so it's obviously clickable on touch screens too.
- An optional second line under the name, 12.5px ink-3: the status ("Active; another field"), the sub-area, or the organisation's type and country.
- The right-hand value is 13.5px ink-2, tabular: an organisation count, "Main" or "Side", a grid reference, or "3 main, 1 side".
- Rows are separated by 1px `--fm-rule` lines, 7px padding.
- The plain variant has no icon column.
- Sub-area rows in a layer panel carry a strip under the name: one mini tile per problem, 13px tall, in island order, so the layer panel reads as a small version of the map.

### Show all

Lists of organisations in a sub-area or layer show the top 10 (sub-area) or top 8 (layer), ranked by main-line count, then total, then name. A plain underlined "Show all 33" link under the list expands it in place.

### Buttons at the end

- "All 6 problems in Cyberattacks →": a full-width button with a 1px ink border, 2px radius, text left and arrow right, inverting on hover. It opens the sub-area from a problem panel.
- Previous and next sub-area: two underlined text buttons at the foot of a sub-area panel, "← Funding" on the left and "Evidence and forecasting →" on the right.

## What each panel contains

**Problem:** breadcrumb, title, status line, home line and connection box (v2), definition, "Who works on it" (main line, then side line, as organisation cards), "Linked problems" (rows grouped by layer, the problem's own layer first as "Also in The Model", others as "In Harmful use"), and the "All n problems in X" button.

**Organisation:** breadcrumb, title, meta line (14px), chips, website as a plain link, notes if the organisation isn't active, then "Works on" with a count note ("12 problems, 4 as a main line, across 2 layers") and rows grouped by layer, main line first, each showing "Main" or "Side".

**Sub-area:** breadcrumb, title, summary with grid reference, definition, "Problems" (rows with status and organisation count, in island order), "Who works here" (organisation rows with main and side counts, top 10 and Show all), and previous and next.

**Layer:** breadcrumb, title, role line, summary, definition, "Sub-areas" (rows with strips and grid references), and "Most active organisations" (top 8 and Show all).

## Detail pages

The architecture doc adds server-rendered pages: `/problems/<slug>`, `/areas/<slug>`, `/layers/<slug>`, `/orgs/<id>` and `/tools/<slug>`. Build them from the same components so they read as the panel with more room:

- Same page chrome as the map page: `--fm-page` background, 1480px max width, the same side padding, Jost throughout.
- The breadcrumb, title, status, home and connection components at the top, exactly as in the panel.
- A single reading column, about 720px, with extra sections (why it matters, what progress looks like, key agendas, products, entry points, discussion) each under a section heading with the 2px rule.
- A small map on the page: a static crop of the island with this problem's tile ringed, or the map component mounted at the right level. Either way it links to `/map/node/<slug>`.
- Organisation lists as organisation cards, and everything else as rows.
- The provenance box ("Compiled by research agent, 21 Sep 2026, not yet reviewed by a person") as a plain paragraph in a 1px `--fm-rule-2` bordered box, 13.5px ink-2, 2px radius. No icon, no colour; it's information, not a warning.
- "Suggest a change" as a square button in the toolbar style (1px `--fm-rule-2` border, 13.5px 500, inverting when pressed or active), and the per-section inline version as a plain underlined text link.
- The drawer form for suggestions: paper background, 1.5px ink border on its leading edge, the same heading and body sizes, inputs with a 1.5px ink underline like the search box, and a submit button that's the only filled (ink) button on screen.

If a new element doesn't fit any component here, prefer a row, a section heading and plain text over inventing a card.
