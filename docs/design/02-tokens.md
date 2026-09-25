# 02. Tokens

`tokens.css` has everything below as CSS custom properties with an `--fm-` prefix. The reference implementation predates the v2 names, so its variables are called differently; the mapping is at the end.

## Colour

### Page and text

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--fm-page` | `#f5f8fa` | `#08131b` | Page background |
| `--fm-paper` | `#ffffff` | `#0d1b25` | Panel, tooltip, search list, the margin inside the neatline |
| `--fm-ink` | `#16181a` | `#e9ebed` | Main text, rules, control borders when active |
| `--fm-ink-2` | `#44484d` | `#b2b7bc` | Secondary text: lede, definitions, meta in panels |
| `--fm-ink-3` | `#686e74` | `#848b92` | Tertiary text: counts, sub-labels, org meta |
| `--fm-rule` | ink at 16% | ink at 14% | List separators, floating shadows |
| `--fm-rule-2` | ink at 50% | ink at 50% | Control borders at rest, link underlines |
| `--fm-focus` | `#0a5bd3` | `#6aa8ff` | Focus outline and the focused-tile ring |

### Sea and frames

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--fm-sea` | `#4cb8e5` | `#0c2d42` | Open water: the map background |
| `--fm-shelf` | `#79caee` | `#10394f` | Water one hex beyond the shallows |
| `--fm-shoal` | `#a8dcf3` | `#164a66` | Shallows: every hex touching land, and under island names. Also the halo behind island names |
| `--fm-contour` | white at 75% | white at 16% | 1.5px line along the outer edge of the shelf |
| `--fm-frame` | `#fbf6dc` | `#c9c09a` | Cream frame round every tile; halo behind name tags and link lines |
| `--fm-frame-edge` | `#e3d8ad` | `#8f8766` | Outer edge of each island's frame |

Water gets paler towards land, like the shallows on the board. Frames are what separate tiles from the sea, so the tile fills don't need to contrast with the water (several don't).

### Tile fills: how much work there is

| Token | Light | Dark | Label | Text on it |
|---|---|---|---|---|
| `--fm-cap-none` | `#c8358a` | `#e0559f` | Nobody yet | white (light), ink `#16181a` (dark) |
| `--fm-cap-thin` | `#f7d65a` | `#e6c552` | A little | ink |
| `--fm-cap-active` | `#8cb52a` | `#7fa82a` | Active | ink |
| `--fm-cap-busy` | `#2f6a22` | `#2f6a22` | Busy | white |
| `--fm-cap-unknown` | `#d4d4d0` | `#3c4146` | Not assessed | ink (light), `#e9ebed` (dark) |

Thin, active and busy get darker in order, so the ramp still reads in greyscale and to colour-blind readers. Pink sits outside the ramp on purpose: a gap is a different kind of thing, not "less than thin". Dark mode keeps the same hues and only eases the brightness. Never flip the ramp.

### Home tokens (v2)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--fm-home-labs` | `#c8358a` | `#e0559f` | Pink ring: only frontier labs work on it |
| `--fm-home-field` | `#a3b0f4` | `#98a5ec` | Periwinkle dot: another field holds it |
| `--fm-home-field-edge` | `#5d67b8` | `#525cae` | Edge of that dot |

Both sit on a cream disc (`--fm-frame` fill, `--fm-frame-edge` stroke). Geometry is in `06-v2-encoding.md`.

### Lines and states

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--fm-link` | `#16181a` | `#f2f4f6` | Selection rings, relationship lines |
| (fixed) | `#16181a` | `#16181a` | Name tags beside lit tiles. Deliberately not themed: tags always sit on a cream `--fm-frame` halo, which stays light in dark mode |
| `--fm-dim` | 0.25 | 0.28 | Opacity of tiles outside the current focus |

### Checks

Colour blindness, checked with the dataviz palette validator across all pairs of the five fills (gold, green, forest, pink, periwinkle): worst ΔE 13.0 in light mode (gold against green, protanopia) and 11.4 in dark mode (periwinkle against pink, deuteranopia). Normal vision floor 18.4 (light) and 17.5 (dark). Brick orange was tried for gaps and rejected: against the greens it drops to ΔE 2.8 under deuteranopia.

Every category also has a non-colour cue: lightness order in the ramp, the token's shape (ring against dot), and its position.

Text contrast (WCAG ratio):

| Pair | Ratio |
|---|---|
| Ink on gold / green / periwinkle | 12.5 / 7.4 / 8.5 |
| White on forest | 6.6 |
| White on pink (light) | 4.9 |
| Ink on pink (dark) | 5.1 |
| Ink on sea (layer names) | 7.9 |
| Ink on shoal (island names) | 12.0 |
| Ink-2 on shelf (dimmed island names) | 5.0 |
| Ink-3 on page / on paper | 4.8 / 5.2 |
| Dark: ink on sea / ink-2 on sea | 12.0 / 7.1 |

If you change a colour, rerun both checks. Keep text at 4.5:1 or better and the colour-blind floor at ΔE 10 or better.

## Type

One family: Jost, weights 400, 500, 600, 700 and italic 400, 500. Load it from Google Fonts or `next/font/google` with `display: swap`. The fallback stack is `"Futura", "Century Gothic", "Avenir Next", system-ui, sans-serif`. Use `font-feature-settings: "kern", "liga"`; use tabular figures (`font-variant-numeric: tabular-nums`) wherever numbers sit in a column.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title, first line | `clamp(30px, 4.3vw, 56px)` | 700 | line-height 0.95, letter-spacing -0.022em, `text-wrap: balance` |
| Page title, second line ("Field Map") | same | 400 | display block |
| Lede | 17px (16px under 700px) | 400 | ink-2, max 58ch, line-height 1.4 |
| Meta line | 13.5px | 400 | ink-3 |
| Body | 16px (15px under 700px) | 400 | line-height 1.45 |
| Key group heading | 15px | 600 | |
| Key row label / sub-label | 14px / 12px | 400 | sub-label ink-3, hidden under 700px |
| Key count | 14px | 600 | tabular |
| Layer chips in toolbar | 14.5px | 500 | count 13px 400 ink-3 |
| Buttons | 13.5px | 500 | |
| Grid references | 11px | 500 | ink-2 |
| Layer name on map | 16px wide, 15px stacked | 600 | uppercase, letter-spacing 0.16em |
| Layer role line on map | 14px | 400 italic | ink |
| Island (sub-area) name | 12.5px wide, 12px stacked | 500 | shoal-coloured halo, 4px |
| Name tag beside a lit tile | 13px (selected 14px) | 500 (selected 700) | frame-coloured halo, 4.5px |
| Problem name on a tile at area zoom | `clamp(r × 0.23, 11px, 13px)` | 500 | fill-coloured halo, 3px |
| Panel title | 24px | 600 | line-height 1.1, letter-spacing -0.01em, balance |
| Panel section heading | 15px | 600 | 2px ink rule above |
| Panel sub-heading | 13px | 600 | ink-2 |
| Panel body | 14.5px | 400 | ink-2, line-height 1.5 |
| Organisation name | 15px | 600 | underlined |
| Chips | 12px | 500 | |
| Tooltip name / body / location | 15px 600 / 13.5px / 12px | | |
| Index heading | 17px | 600 | |
| Index layer heading | 14px | 600 | uppercase, letter-spacing 0.14em |

## Spacing and layout

| Thing | Value |
|---|---|
| Page max width | 1480px, centred |
| Page side padding | `clamp(16px, 3vw, 40px)` |
| Page top padding | `clamp(18px, 2.4vw, 34px)`, bottom 56px |
| Title block | 18px padding below, then a 2px ink rule |
| Key | 18px above, 20px below; groups 36px apart |
| Toolbar | 10px above and below, 1px rule above |
| Chart (neatline) | 2.5px ink border; padding 18px top, 18px right, 0 bottom, 22px left for the grid references |
| Map area | 1px ink border inside the neatline |
| Side panel | `min(410px, 35%)` wide, padding 14px 18px 22px |
| Bottom sheet (phone) | full width, `max-height: min(60vh, 620px)`, padding 12px 16px, and `calc(20px + env(safe-area-inset-bottom, 0px))` at the bottom |

## Borders, corners, shadows

- Corner radius is 2px on every control and chip. Nothing is round except the home token.
- Rules: 2px ink for section breaks (under the title block, above each panel section, above the index), 2.5px for the outer neatline, 1px ink for the inner neatline and active controls, 1px `--fm-rule` between list rows.
- Floating things (tooltip, search list) use a hard shadow, `4px 4px 0 var(--fm-rule)`. The phone bottom sheet uses `0 -6px 0 var(--fm-rule)`. No blurred shadows anywhere.

## Motion

| Thing | Value |
|---|---|
| Camera move between levels | 560ms, cubic ease in-out; scale interpolated geometrically |
| Tile and label fades | opacity 0.2s ease |
| Grid references fading out on zoom | 0.25s |
| Selected tile ring | stroke pulses 3.2px to 5px over 1.8s |

With `prefers-reduced-motion: reduce`, the camera jumps, page scrolls are instant and the ring doesn't pulse.

## Focus

`:focus-visible` gets a 2px `--fm-focus` outline, 2px offset. A focused tile gets a 3px focus-coloured hex ring instead, because an outline on an SVG group looks wrong.

## Mapping to the reference code's variable names

| Reference variable | Token | Note |
|---|---|---|
| `--page`, `--paper`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--rule-2`, `--focus`, `--link`, `--dim` | same names with `--fm-` | |
| `--sea`, `--shelf`, `--shoal`, `--contour`, `--frame`, `--frame-edge` | same names with `--fm-` | `--coast` is an unused alias of `--frame-edge` |
| `--l-nas` | `--fm-cap-thin` | reference class `s-nas` |
| `--l-cov` | `--fm-cap-active` | class `s-cov` |
| `--l-cro` | `--fm-cap-busy` | class `s-cro` |
| `--m-un` | `--fm-cap-none` and `--fm-home-labs` | class `s-un` |
| `--o-adj`, `--o-dot` | `--fm-home-field`, `--fm-home-field-edge` | also the v1.2 adjacent-field fill and stipple |
| `--s-unk` | `--fm-cap-unknown` | class `s-unk` |
| `--tx-*` | `--fm-on-cap-*` | |
| `--m-lab`, `--m-lab-line`, `--bridge` | none | v1.2 only: lab-internal hatching and the bridge-needed edge. Not used with v2 data |
