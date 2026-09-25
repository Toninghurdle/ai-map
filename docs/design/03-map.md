# 03. The map

Screens: `reference/screens/b01-overview-light.png`, `b02-overview-dark.png`, `b12-phone-map.png`.

## Page anatomy, top to bottom

1. **Title block.** "AI Safety and Security" in 700 with "Field Map" beneath in 400, the lede, and a meta line ("118 problems · 308 organisations · data v1.2, 21 September 2026"). A small square theme button (Auto, Light, Dark) sits top right; on phones it sits above the title. A 2px ink rule closes the block.
2. **The key** (see below). Three columns on wide screens (v1.2) or two (v2), stacking on narrow ones.
3. **Toolbar.** Layer chips on the left (name plus problem count; the current layer is underlined 2px), then the search box, then square buttons: "Show all links" (a toggle) and "Whole map" (only when zoomed in). With v2 data that has lenses, a lens row sits under the toolbar (see `06-v2-encoding.md`).
4. **The chart.** A neatline frame (2.5px ink) with grid references in its top and left margins, the map inside a 1px ink inner frame, and a one-line foot under the map: a usage hint on the left, totals on the right ("191 links between problems, 516 organisation tags, each with a source").
5. **Every problem, as a list.** A closed `<details>` with "Show" and "Hide". Inside, one column per layer: layer name (uppercase, letter-spaced), each sub-area with its grid reference, and each problem with a mini tile and its organisation count. Every row opens that problem on the map. It's the list alternative to the map for screen-reader and keyboard users, so keep it complete. In the reference it's built by JavaScript; on the site, render it on the server so it also works without JavaScript and for crawlers (see `07-integration-and-checks.md`).

The panel lives inside the chart's map area on wide screens and becomes a bottom sheet on narrow ones. See `05-panels-and-pages.md`.

## The hex lattice

Everything sits on one pointy-top hex lattice with axial coordinates. For a hex of radius `R` (centre to corner), the centre of cell `(q, r)` is:

```
x = √3 · R · (q + r / 2)
y = 1.5 · R · r
```

Tiles, frames, sea bands, selection rings and keyboard movement all use this lattice, so nothing is ever placed by hand and nothing drifts off-grid.

`R` depends on the map's width `W`:

- Wide layout: `R = clamp(W / 63, 15.5, 21)`.
- Stacked layout: `R = clamp(W / 17.5, 16.5, 21)`.

## Layouts

**Wide** (map area at least 900px wide, and each column at least `10.5 · R` wide): the three problem layers sit side by side as columns, left to right in data order, with `1.8 · R` between columns. The foundation layer (Meta, slug `meta`) sits across the bottom as a band under a thin rule, because it's what the other three stand on. Layer titles are centred over their columns; Meta's title is centred over the band.

**Stacked** (anything narrower): every layer in data order, one under another, each with its title left-aligned above it and a thin rule between layers.

The layout reruns on every width change (debounced 60ms) and once the web font has loaded, because label widths change.

## Islands

Each sub-area is an island of adjacent tiles, one tile per problem.

**Shape.** Grown from a single cell: repeatedly add the free neighbouring cell that touches the most existing cells (weight 4 per neighbour), minus its distance from the island's centroid (with vertical distance stretched by 1.35, so islands come out a little wider than tall), with a tiny penalty for cells below the centroid. The result is a compact blob that depends only on the number of problems, so the same size always gives the same shape. Cache shapes by size.

**Tile order within an island.** Cells are ordered left to right, then top to bottom, and problems are assigned in status order: gaps first, then thin, active, busy, then anything else, keeping data order within a status. So the pink tiles sit at the left of each island, where the eye starts.

**Placement.** Within a layer, islands are placed one at a time in data order. Candidate anchors are all lattice cells sorted by distance from the layer's centre, with the vertical axis scaled by a factor `k` (1.05 for the wide columns, 6 for the Meta band so it spreads sideways, and `clamp(W / 380, 1, 2.4)` when stacked on screens wider than 560px, otherwise 1). The first anchor that fits wins. An anchor fits when:

- none of the island's cells is taken, and none touches an existing island (every placed cell blocks itself and its six neighbours, so there's always at least one hex of sea between islands);
- the island's name, centred under it with its top `0.4 · R` below the bottom of the lowest tile, stays `0.7 · R` clear of other names and `0.3 · R` clear of other islands' cells, and the island's cells stay `0.3 · R` clear of other names;
- on the first pass, the layer stays within its column width. A second pass drops that limit if nothing fits.

Each placed layer is then shifted, on the lattice, so it's centred in its column and nudged back inside the column edges if it overhangs.

**Island names.** 12.5px (12px stacked), weight 500, wrapped to the wider of the island's width plus `1.2 · R` and `6.6 · R`, centred, line height 1.18. Clicking a name opens that sub-area.

## Layer titles

Name in uppercase, 600, letter-spacing 0.16em; role line under it in 14px italic. Title block height is 50px, or 64px when a role line has to wrap in the wide layout. Clicking a title opens the layer. The rule above Meta (and between stacked layers) is 0.75px ink at 60% opacity.

## Sea

Draw the sea as three unions of lattice hexes, each hex at radius `R + 0.6` so neighbours overlap without seams:

- **Shallows** (`--fm-shoal`): every land cell, its six neighbours, and every cell under an island name.
- **Shelf** (`--fm-shelf`): the ring of cells just outside the shallows, with a 1.5px `--fm-contour` stroke on its outer edge.
- **Open sea** (`--fm-sea`): the map background.

The stepped outlines are deliberate. They read as water depth and they show the lattice.

## Tiles and frames

For each island, draw in this order:

1. A frame edge: the union of hexes at `R + 3.4` round each cell, filled `--fm-frame-edge`.
2. A frame: the union at `R + 2.2`, filled `--fm-frame`.
3. Each tile: a hex at `R - 2.2` with slightly rounded corners (each corner cut back by `min(0.06, 1.2 / r)` of the edge and joined with a quadratic curve), filled with its capacity colour.

So every tile sits in about 4px of cream, with a darker cream line round the island's outer edge. Don't stroke the tiles themselves.

With v2 data a tile carries at most one secondary mark, the home token (see `06-v2-encoding.md`). The legacy v1.2 path draws a hatch or a stipple, and can add a dashed edge on top of the stipple; none of that is used with v2.

## Drawing order

Inside one `<g>` that the camera transforms:

1. Sea: shelf with contour, shelf fill, shallows.
2. All-links layer (empty unless "Show all links" is on).
3. Frames.
4. Tiles.
5. Selected problem's links.
6. Island names.
7. Layer titles and rules.
8. Rings (selected, related, hover, focus).

Then, outside the camera group, a screen-space overlay for text that must stay a fixed size while zoomed: problem names on tiles, island names at zoom, and name tags. The overlay ignores pointer events.

## Grid references

Wide layout only. The map is divided into `clamp(round(W / 150), 4, 12)` columns lettered A, B, C and `clamp(round(H / 150), 3, 9)` rows numbered 1, 2, 3, with letters in the top margin and numbers in the left margin of the neatline (11px, 500, ink-2, with 5px tick marks at the boundaries). Each sub-area gets the reference of its centroid, for example "E3". The reference appears in the index, the sub-area panel ("Grid E3.") and the layer panel's sub-area list. Grid references fade out when the camera zooms in, because they no longer line up.

## The key (the census)

The key counts every problem as a small hex, Isotype-style, so proportions are visible before any number is read.

- Each row: a label (14px) with an optional sub-label (12px ink-3), then a run of mini tiles (13 × 14px each, 1px apart, with a 0.7px ink outline at 55% opacity), then the count (14px 600, tabular).
- Rows are buttons. Clicking one filters the map to those problems (everything else dims to `--fm-dim`), and clicking it again, pressing Escape or clicking empty sea clears the filter. The active row gets a faint ink background and a 600 label, and `aria-pressed="true"`.
- Under 700px wide: mini tiles shrink to 9.5 × 10.5px, sub-labels are hidden and rows tighten, so the map starts within the first screen and a half.
- If any problem has a missing or unrecognised status, a "Not assessed" row appears at the end of the first group, so the key always counts every tile on the map.
- The rows for v2 are in `06-v2-encoding.md`. For v1.2 there are three groups: "Organisations working on it" (one or two, several, many), "Nobody independent yet" (nobody at all, only inside labs) and "Held by another field" (they cover it, bridge needed).

## Phone

Under the wide threshold the map stacks (see Layouts). The neatline drops to 2px with no margin and no grid references. Tiles stay at least 16.5px in radius, so they stay tappable. See `04-interaction.md` for the bottom sheet and scrolling.
