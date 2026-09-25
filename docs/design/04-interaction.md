# 04. Interaction

Screens: `b03-layer.png`, `b04-area.png`, `b05-node.png`, `b07-org.png`, `b08-lens.png`, `b09-hover.png`, `b10-search.png`, `b13-phone-sheet.png`.

## Levels

The map has five levels. Each has a URL, and the back button, Escape and the breadcrumb all move between them.

| Level | Reference hash | Site route (architecture doc) | What's lit | Panel |
|---|---|---|---|---|
| Whole map | `#map` | `/map` | everything | none |
| Layer | `#map/layer/<slug>` | `/map/layer/<slug>` | the layer's problems | layer panel |
| Sub-area | `#map/area/<slug>` | `/map/area/<slug>` | the sub-area's problems | sub-area panel |
| Problem | `#map/node/<slug>` | `/map/node/<slug>` | the problem and its linked problems | problem panel |
| Organisation | `#map/org/<org_id>` | `/map/org/<org_id>` | every problem the organisation works on | organisation panel |

How you get to each:

- Click a tile: problem. Click an island name: sub-area. Click a layer title or a layer chip in the toolbar: layer.
- Click an organisation name anywhere in a panel: organisation.
- Search: problem, sub-area or organisation.
- Any row in a panel list, and any row in the index.

Going up one level (Escape, clicking empty sea, or the last-but-one breadcrumb):

- problem to its sub-area, sub-area to its layer, layer to the whole map;
- organisation back to wherever you opened it from (a problem, sub-area or layer), or to the whole map if you came from the whole map or from another organisation (which can only happen through search).

Escape clears an active key filter or lens before it goes up a level. The panel's close button (a square ×) goes straight to the whole map, and so does the "Whole map" button in the toolbar.

When the level changes, the map fires `fieldmap:navigate` with `{level, slug}` on `document`, and calls `window.onNodeSelect(slug)` whenever the open problem changes (null when none is open). The site mirrors these into its routes; see `07-integration-and-checks.md`.

## Focus and dimming

Whenever something is lit (any level other than the whole map, or a key filter or lens), everything else dims:

- tiles that aren't lit drop to `--fm-dim` opacity (0.25 light, 0.28 dark);
- names of islands with nothing lit drop to 35% (20% at problem and organisation level);
- layer titles with nothing lit drop to 45%.

Opacity changes take 0.2s.

## The camera (wide layout only)

Opening a level zooms and pans the map (a transform on the world group) to frame what's lit, leaving room for the panel on the right:

| Level | Frames | Max zoom |
|---|---|---|
| Layer | the layer's islands | 1.5 |
| Sub-area | the island, padded 1.6R on three sides and 0.8R below | `clamp(54 / R, 1.6, 2.8)`, so tiles reach about 54px radius |
| Problem | the problem's island plus its linked problems, padded 2.5R left, 5.5R right (room for name tags), 1.4R top and bottom | 2.2 |
| Organisation | all its problems, padded 4R left, 6R right, 2.5R top and bottom | 1.6 |

The frame is fitted into the visible map area minus the panel (panel width plus 20px) with 10px margins, and its height is capped at the viewport height minus 16px, so it never frames content below the fold. Zoom never goes below 0.55. The move takes 560ms with a cubic ease in-out; scale interpolates geometrically so the zoom feels even. Reduced motion jumps straight there.

Entering any level also scrolls the page so the chart's top edge sits 8px below the top of the viewport, remembering where the page was; returning to the whole map scrolls back. A deep link that opens on a level scrolls the chart into view on load.

In the stacked (phone) layout there's no camera. Instead, after each navigation the page scrolls so the relevant tile, island name or layer title sits in view above the bottom sheet.

## Text at zoom

Text that must stay a readable size is drawn in a screen-space overlay, recomputed after each camera move:

- **Island names at zoom.** When the zoom is above 1.3, the world-space island names and layer titles are hidden and island names are redrawn at their normal size under each island, ink when lit and ink-2 at 40% when not.
- **Problem names on tiles.** At sub-area level, when tiles are at least 34px in radius on screen, every tile in the island gets its name written on it: 500 weight, `clamp(r × 0.23, 11, 13)` px, wrapped to 1.5r, shrinking up to twice to fit, and cut with an ellipsis if it still doesn't. Text colour is the fill's text token, with a 3px halo in the fill colour. If the tile has a home token, the name moves down below it (see `06-v2-encoding.md`).
- **Name tags.** At problem level, the selected problem and each linked problem get a name tag beside their tile; at organisation level, each of its problems does. Tags are 13px 500 in `#16181a` with a 4.5px halo in `--fm-frame`, in both themes (the cream halo stays light in dark mode, so dark text stays readable); the selected problem's tag is 14px 700.

### Placing name tags

For each tile, try these positions in order and take the first that works: right, left, below, above, then the four diagonals (above right, below right, above left, below left). A position is rejected if it:

1. falls outside the visible map (4px margin, excluding the panel);
2. overlaps a tag already placed (2px margin) or any lit tile (1px margin);
3. overlaps an island name or layer title (1px margin), on the first pass only.

At problem level the linked tags get a second pass that tries the same eight positions further out, with the gap between tile and tag raised from 5px to 18px, still rejecting every overlap. Only if that fails does a third pass allow the tag to overlap an island name or layer title: the tag is placed, and the name it covers is hidden (opacity 0 over 0.2s) for as long as the problem is open, then restored. Tags beat island names, because the tags are what the reader asked for. The selected problem's tag gets a final pass that ignores everything except the map edge, so it always appears. At organisation level there's only the first pass: a tag that can't be placed cleanly is left out, since the panel lists every problem anyway. Never draw boxes behind tags; the halo is enough.

A tag is tested against where an island name actually is on screen, not the box the layout reserved for it: the reserved box is a slot in the packing, and the centred text inside it can be wider or narrower than the slot.

## Selection rings and links

Rings are hexes at `R + 1.6` in `--fm-link`, drawn above everything else in the world group, with non-scaling strokes:

| Ring | Stroke |
|---|---|
| Selected problem | 3.2px, pulsing to 5px over 1.8s (no pulse with reduced motion) |
| Linked problem, or an organisation's main line | 1.6px |
| An organisation's side line | 1.4px, dashed 3 3 |
| Hover | 2px at 70% |
| Keyboard focus | 3px in `--fm-focus` |

Links between problems are hidden at rest. Opening a problem draws a curved line from it to each linked problem: a quadratic curve with a bend of 0.2 of its length, trimmed by `1.02 · R` at each end so it starts at the tile edge, 1.4px `--fm-link` over a 5px `--fm-frame` halo. "Show all links" draws every link as a faint 0.8px ink line at 28% opacity with a bend of 0.14, limited to links that touch lit tiles when something is lit. While all links are on, hovering a tile draws that tile's links too.

## Hover tooltip

On mouse hover (never on touch), a tooltip follows the pointer, offset 16px right and 18px down, flipping to stay inside the viewport:

- where it is: "Alignment, The Model" (12px ink-3);
- the problem name (15px 600);
- a status row: mini tile plus the status line ("Active", "A little; only frontier labs");
- who works on it: the first three organisation names, then "and N more", or "No organisation recorded yet".

The tooltip isn't shown for the tile that's already selected. For a tile with keyboard focus it's anchored above the tile (below it if there's no room). Style: paper background, 1px ink border, hard shadow `4px 4px 0 var(--fm-rule)`, max width 300px.

## Keyboard

- The map itself is one tab stop: tiles use a roving `tabindex`, so Tab moves on past the map rather than through every tile. The tile that receives focus is the last focused one, or the open problem, or the first tile of the first sub-area.
- A "Skip to the map" link is the first focusable element on the page, so the map is one press away. It's visually hidden until focused, then shown top-left as a square button (1px ink border, 2px radius, paper background, 13.5px 500), and it moves focus to the tile holding the roving `tabindex`. Without it the page chrome (theme, key rows, layer buttons, search, toolbar) stands between the reader and the map.
- Arrow keys move to the nearest tile in that direction. Score candidates by distance along the direction plus 2.2 times the distance across it, and ignore tiles that are more than 1.8 times further across than along.
- Enter or Space opens the focused problem. Escape goes up a level (see above), returning focus to the panel's close button if it came from inside the panel.
- While a tile has keyboard focus, a small hint sits in the bottom-left corner of the map: "Arrow keys move · Enter opens · Esc goes back".
- Every tile has an `aria-label` that reads as a sentence: name, capacity, home mark, how many organisations have it as a main line, sub-area and layer.

## Search

A combobox in the toolbar with the placeholder "Find a problem or organisation" and an underline-only input (1.5px ink).

- Matches problem names, sub-area names and organisation names, case-insensitive. A match at the start ranks first, then at the start of a word, then anywhere; sub-areas rank slightly ahead of problems and organisations slightly behind. Show the top 10.
- Each result: a mini tile (problems only), the name, and a second line saying what it is: the sub-area for a problem, "Sub-area of The Model", or "Organisation · 4 problems".
- Arrow keys move through results, Enter opens one. Escape closes the list, then clears the text, then leaves the box and goes up a level.
- Choosing a result opens that level and moves focus to the panel's close button.

## Key filters and lenses

Clicking a row in the key, or a lens (v2), lights only the matching problems on the whole map and dims the rest. If you're zoomed in, it returns to the whole map first. Clicking the same row again, pressing Escape, or clicking empty sea turns it off. Only one filter or lens is on at a time.

## Theme

The theme button cycles Auto, Light and Dark and sets `data-theme` on `<html>` (no attribute for Auto). The choice is kept in `localStorage` under `fieldmap-theme`, wrapped in try/catch so it degrades to Auto.

## Phone and touch

- The stacked layout applies below the wide threshold.
- The panel becomes a bottom sheet: fixed to the bottom, full width, up to `min(60vh, 620px)` tall, scrolling inside, with a 2px ink top border and a flat shadow. The page gets 60vh of bottom padding while it's open so the end of the map can scroll above it.
- Taps act as clicks. Hover effects and the tooltip don't fire for touch. `touch-action: manipulation` on the map avoids the double-tap zoom delay, and the tap highlight is off.
- Tiles are at least 16.5px in radius (about 29px across) in the stacked layout.
