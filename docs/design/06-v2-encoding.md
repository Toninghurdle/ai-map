# 06. Mapping the design onto the v2 data

The map was designed on the v1.2 data, where one `coverage_status` field mixed how much work there is with who holds it, and a `bridge_status` sat on top. The v2 decisions split that into `capacity`, `home` and `connection`, and set the display rule: tile colour is capacity only, home is a small secondary mark, and connection appears only inside the problem panel. This file is how the design does that. The reference code already implements it (any node with a `capacity` field takes this path); `reference/v2-preview.html` shows it running.

## Tile colour: capacity

| `capacity` | Tile | Label in the key and panel | Sub-label | Plain sentence (panel, when there's no `capacity_note`) |
|---|---|---|---|---|
| `none` | pink | Nobody yet | None | Nobody is working on this yet. |
| `thin` | wheat gold | A little | Thin | One or two groups or people are working on it. |
| `active` | pasture green | Active | | Several groups are working on it, with room for more. |
| `busy` | forest | Busy | | Many groups work on it. Joining one is usually a better move than starting something new. |
| missing or unknown | pale grey | Not assessed | | Coverage has not been assessed yet. |

Colours are the `--fm-cap-*` tokens. The words describe activity, never progress; "busy" deliberately points entrants at jobs inside existing groups rather than warning them off.

If the v2 data ends up with very few `none` problems, pink will be scarce on the map. Don't compensate by recolouring anything else pink. The labs-only token carries the "no independent work" story, and the key still leads with the "Nobody yet" row.

## Home: a small token, and only when it changes what an entrant should do

`home` can hold any mix of six values. Marking all of them on the map would bring back the clutter the owner wants to avoid, so the tile carries a token in exactly two cases:

| Rule (checked in this order) | Token | Why it earns a mark |
|---|---|---|
| `home` includes `another-field` | periwinkle dot | The move is to join or work with that community, not to start something inside AI safety |
| `home` is exactly `["frontier-labs"]` | pink ring | Outside the labs nobody works on it, so it's a gap for independent work (and a jobs signal inside labs) |
| anything else | none | Independent groups, government, companies or universities: the panel lists which |

**Token geometry.** In the tile's own coordinates (tile radius R):

- a cream disc (`--fm-frame` fill, `--fm-frame-edge` 0.8px stroke) centred at `(0, -0.47R)` with radius `tr = max(2.6, 0.3R)`;
- another field: a disc inside it of radius `0.62 · tr`, filled `--fm-home-field` with a 0.8px `--fm-home-field-edge` stroke;
- frontier labs only: a ring inside it of radius `0.55 · tr`, no fill, stroked `--fm-home-labs` at `max(1.1, 0.28 · tr)`.

It sits in the upper half of the tile like a board-game number token, so it scales with the tile and stays out of the way of the tile colour. The same drawing (`homeToken` in the reference) is used on map tiles and on every mini tile (key, rows, index, search). The panel's 20px "Who holds it" icon draws the token on its own, without the tile, at a larger proportion (`tokenIcon`: disc radius 0.85R, same inner proportions).

**Names at sub-area zoom.** When a tile has a token, its name moves below it: the text block is centred `0.36r` below the tile centre and must fit in `0.86r` of height (0.9r maximum before truncating), instead of the usual `1.35r` centred block.

**In the panel.** A "Who holds it" line under the status line, with a 20px token icon when there's a token:

- labs only: "**Who holds it:** frontier labs only. Outside the labs, nobody is working on it yet."
- another field: "**Who holds it:** " followed by `owner_field` in place of "Another field" (for example "digital rights and criminal-justice reform communities").
- otherwise the `home` values joined with commas, using these labels: Independent AI safety groups, Frontier labs, Government, Companies, Universities, Another field.

The status line in rows and tooltips appends the token's meaning: "A little; only frontier labs", "Active; another field".

## Connection: panel only

Only problems whose `home` includes `another-field` have a connection other than `not-applicable`. Nothing about connection appears on the map or in the key. In the problem panel, under the home line, a boxed paragraph (3px left border, faint tint):

| `connection` | Label | Border | Stock sentence (used when `connection_note` is empty) |
|---|---|---|---|
| `strong` | Strong connection | pasture green | That field already works closely with AI developers and AI safety. |
| `weak` | Weak connection | periwinkle edge colour | There is some contact, but little flows between that field and AI developers. |
| `missing` | No connection yet | periwinkle edge colour | Almost nothing flows between that field and AI developers yet. Building the link is the work. |

This replaces the v1.2 dashed "bridge needed" edge on tiles. Don't bring the edge back.

## The key for v2

Two groups instead of three (screens `b01`, `b11`):

- **How much work there is:** Nobody yet (None), A little (Thin), Active, Busy. Each row counts the problems at that capacity; mini tiles show their tokens too.
- **Who holds it:** Only frontier labs (Pink ring), Another field (Blue dot), then one line of small print: "Every other problem has independent groups, government, companies or universities on it. The panel says which."

Grid columns: `minmax(0, 2.2fr) minmax(0, 1fr)`. Every row filters the map, as before. If any problem's capacity is missing or unrecognised, a "Not assessed" row is added after Busy, so the key always adds up to the number of tiles.

The lede changes to match: "Every hex is a problem someone could work on. Pink means nobody is working on it yet, gold a little work, green active and dark forest busy. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field."

## Lenses

`lenses` on each node plus `lens_definitions` at the top level (an array of `{slug, name, definition}` or an object keyed by slug; the reference reads both). Lenses are off by default.

- A row under the toolbar, only shown when at least one lens tags at least one problem: the label "Lenses" (13px 600 ink-2), then one square button per lens in the `lens_definitions` order, with its problem count in lighter text ("Agents 3").
- A lens with no `name` of its own is named by a readable form of its slug: hyphens to spaces, first letter capitalised, so `loss-of-control` reads "Loss of control". Never show a raw slug: it reads as internal jargon. The same text is used for the button, its accessible name and anywhere else the lens is named. A `name` in the data is used unchanged.
- Buttons match the toolbar buttons but a size smaller: 13px 500, 1px `--fm-rule-2` border, 2px radius; pressed is ink fill with paper text.
- Clicking a lens lights its problems on the whole map, exactly like a key filter, and shows the lens definition in one line under the row (13.5px ink-2). Only one lens or key filter is on at a time. Escape, clicking it again or clicking empty sea turns it off.
- Screen `b08-lens.png`.

## Renames and other v2 changes that touch the design

- **Layer names and role lines come from the data.** The reference uses `layers[].role_line` when present and falls back to its built-in lines. "Harmful use" for the `misuse` layer needs no design change; the column title just reads "HARMFUL USE".
- **New sub-area (`model.reliability`) and a smaller Meta layer.** Nothing to do: layout is computed from the data. Check the wide layout still fits three columns, and that Meta's band still reads as a foundation (screens `b01`, `b02`).
- **Sub-areas over eight problems** would trigger a merge review in the taxonomy; the island shape handles any size, but islands over about 10 tiles start to dominate a column. If one appears, raise it with the owner rather than restyling.
- **Merged or renamed node slugs.** The map should accept old slugs in its URLs and redirect through `node_aliases`, so old links keep working.

## What v2 drops from the reference's v1.2 styling

The reference keeps these only so it can still draw the v1.2 file:

- the pink-hatched "lab-internal" fill;
- the periwinkle stippled "adjacent field" fill;
- the dashed pink "bridge needed" edge;
- the three-group v1.2 key ("Organisations working on it", "Nobody independent yet", "Held by another field").

With v2 data none of them appear. The site can leave them out entirely.
