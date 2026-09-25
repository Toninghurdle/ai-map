# Field map design bible

This folder is the design spec for the AI Safety and Security Field Map. It describes the map view and the visual system around it, so the site can be built to look and behave like the reference implementation Dominic signed off on 24 September 2026.

It covers design only. Data, schema, routing, admin and the research agent are in the architecture doc and the v2 taxonomy decisions. Where this bible and those docs disagree about data, they win. Where they're silent about how something looks or behaves, this wins.

## What's in here

| File | What it covers |
|---|---|
| `01-principles.md` | What the map is for, the visual direction, what to avoid, how to write the words |
| `02-tokens.md` | Colour, type, spacing, borders, motion. Light and dark. Contrast and colour-blind checks |
| `tokens.css` | The same tokens as drop-in CSS custom properties |
| `03-map.md` | Anatomy of the map and the layout algorithm: lattice, islands, sea bands, frames, labels, grid references, the key |
| `04-interaction.md` | Levels and URLs, the camera, hover, selection, links, labels at zoom, search, keyboard, phone behaviour |
| `05-panels-and-pages.md` | The panel components and how to reuse them on the detail pages |
| `06-v2-encoding.md` | How the design maps onto the v2 data: capacity, home, connection, lenses, renames |
| `07-integration-and-checks.md` | The component contract, porting notes for Next.js, and the checks to run before shipping |
| `reference/ai-safety-field-map.html` | The reference implementation, running on the v1.2 data. Self-contained; open it in a browser |
| `reference/v2-preview.html` | The same code running on a v2-shaped dataset derived from v1.2 (see below) |
| `reference/v2-preview-data.json` | That derived dataset, useful as a fixture |
| `reference/src/` | The reference code without the embedded data, easier to read: `head.html` (CSS), `body.html` (markup and JS) and `build.py`, which embeds a data file and an organisations file to produce a standalone page |
| `reference/screens/` | Screenshots of the v2 preview at every level, light, dark and phone |

## How to use it

1. Open both reference HTML files and click around before reading anything. The spec describes them; they're the ground truth for anything the spec leaves out.
2. Read `01-principles.md` and `06-v2-encoding.md` first. The first says what not to lose; the second says what changes for v2.
3. Port the map as a module (`packages/fieldmap`, per the architecture doc). The reference code is plain JavaScript with no dependencies and already has the integration hooks the site needs. Change its internals as little as possible.
4. Build the site's own pages from the components in `05-panels-and-pages.md` and the tokens in `tokens.css`. Don't invent new components when an existing one fits.
5. Run the checks in `07-integration-and-checks.md` and compare screenshots against `reference/screens/`.

## About the v2 preview

The v2 data isn't final yet, so `v2-preview.html` runs on values derived from v1.2 using the owner's rules of thumb (unowned to none, nascent with up to two primary organisations to thin, nascent with three or more or covered to active, crowded to busy, lab-internal to home frontier labs, adjacent field to home another field). The lens tags in it are keyword guesses, only there to exercise the lens bar. Use the preview for how things look and behave, never as data.

The reference code reads both shapes. A node with a `capacity` field is drawn the v2 way; a node with only `coverage_status` is drawn the v1.2 way. For the new site, only the v2 path matters.

## Non-negotiables

If time runs short, these are the things that make it this map rather than a generic one:

- Hexes on one lattice, grouped into islands by sub-area, with sea between islands and cream frames around every tile.
- Tile colour means one thing (how much work there is), and the palette in `02-tokens.md` exactly. Gaps are pink.
- One typeface (Jost), square corners (2px radius), hard offset shadows, no gradients, no icons or numbers on tiles.
- Relationships hidden at rest. Selecting a problem draws only its links.
- The key counts every problem as a small hex, and each row is a filter.
- Clicking a problem answers "who works on this?" straight away, split into main line and side line, with a way to reach each organisation.
- Every level has a URL, Escape goes up one level, and it works on a phone.
