# Field map: design QA review and fix list

Review of `qa/design/REPORT.md` and all 29 capture folders (branch `task-1-port-the-map`, commit `5f49848`), checked against the design bible in `docs/design/`. I also spot-checked the live preview on 25 September 2026. Scope is UI and UX only: layout, type, colour, spacing, motion, interaction and copy. Nothing here changes the data, the taxonomy, the problem structure or the map's information architecture.

The short version: the map itself is a faithful port. With both sides aligned on the chart, the whole map matches the reference to within 0.2% of pixels at 1440 and at 1280, in both themes, and camera timing, Escape, Back, keyboard movement, tooltip placement, reduced motion and the console all match. The real problems are in the page around the map, plus a few weaknesses in the reference itself that only showed up once it ran on the real v2 data.

## Verdict on every difference

### From the QA report

| # | Difference | Verdict |
|---|---|---|
| 1 | Page title at 25.6px instead of up to 56px | **Real deviation.** Fix (F3) |
| 2 | List summary reads "Every problem" instead of "Every problem, as a list" | **Real deviation**, small. The accessibility reason given in `page.tsx` doesn't hold: a `<summary>`'s accessible name is its text either way, so the longer wording is just as stable. Fix (F8) |
| 3 | `pnpm check:emdash` fails on `apps/web/AGENTS.md`, which `next dev` generates | **Out of scope.** Repo tooling, not UI; no em-dash reaches the reader. The QA agent's suggestion (ignore untracked or generated files) is fine |
| 4 | 21 Tab presses before the first tile | **Problem with the bible, not the port.** "The map is one tab stop" was meant to say the map takes a single tab stop (roving tabindex, so you don't tab through 118 tiles), which both sides do. Check 7's "Tab reaches the map in one stop" is badly worded. Fix the wording and add a skip link (F9) |
| 5 | Lens definitions say "Nodes about..." | **Out of scope.** It's data copy (`lens_definitions`). Worth a content change through the normal proposal route, but not a code fix |
| 6 | Next.js dev badge over the map's left edge | **Acceptable.** Dev only. The Vercel toolbar on preview deployments is the same kind of thing |
| T3.1 | Right-hand panel is empty on every panel state | **Expected** (task 3), but it's the biggest problem for an entrant right now. See F1 |
| T3.2 | Camera frames the lit set 430px to the left | **Expected**, and a direct result of T3.1. Correct once the panel exists. See F1 for the interim |
| T3.3 | No bottom sheet on the phone | **Expected** (task 3) |
| T3.4 | No close button for Escape to return focus to | **Expected** (task 3) |

### Found in this review

| # | Difference | Verdict |
|---|---|---|
| A | On `/map/<level>/<slug>` routes the "Every problem" list is missing altogether. It only renders on `/` (`node-1440x900-light/site.png` ends at the chart foot; `reference.png` has the list) | **Real deviation.** Fix (F6) |
| B | Phone header: the theme button stays in a column beside the title, so the lede is squeezed to about 60% width (six lines instead of five) and the meta line wraps early (`overview-390x844`) | **Real deviation**, small. The larger theme button itself is fine for touch. Fix (F7) |
| C | Lens buttons show raw slugs: "loss-of-control", "defensive-technology", "critical-infrastructure". The data has no `name` for lenses, so the reference falls back to the slug | **Problem with the reference.** Both sides identical. Fix in the shared module (F4) |
| D | At problem level, name tags overprint island names when linked problems are spread across layers. In `nodeAF-*`, "Offensive cyber uplift" is written over "Cyberattacks and critical infrastructure" and the two read as one jumble | **Problem with the reference.** Both sides identical. Fix (F2) |
| E | The lede says "Pink means nobody is working on it yet", but the real data has no problem at capacity none, so no pink tile exists. The key's "Nobody yet" row shows "0" beside an empty space that looks like a rendering fault | **Problem with the reference** (the copy assumed pink would exist). Fix (F5) |
| F | Deep links on level routes can't scroll the chart to 8px from the top on tall screens: the page ends at the chart foot, so there isn't enough page to scroll | **Consequence of A.** Re-measure after F6 and F3; no separate fix |
| G | The 1280 layout looked different at a glance | **Not a difference.** Aligned on the chart it's 0.14% changed, the same as at 1440 |

I also rechecked two items the QA agent left unchecked, on the live preview: key-row filters (lighting 4 of 118 for "Busy", Escape clearing it, the route returning to `/`) and "Show all links" (drawing all 246). Both behave as specified.

## Ranking: how much each one hurts an entrant

1. **No panel** (T3.1 and T3.2). Clicking a problem lights it up and then tells you nothing about who works on it. That's the main job of the site, and right now it doesn't happen at all.
2. **Name tags overprinting island names** (D). It happens at the moment someone opens a problem, on exactly the labels they're trying to read.
3. **Title at half size** (1). It's the first thing anyone sees. At 25.6px the page reads like a dashboard header rather than a map with a name, and the hierarchy under it flattens.
4. **Lens buttons in slug form** (C). They're on the first screen, and hyphenated lowercase looks unfinished and like internal jargon.
5. **Pink promised but absent** (E). The lede tells a newcomer to look for something that isn't on the map, and the empty key row looks broken.
6. **List missing on level routes** (A). For screen-reader and keyboard users, the list is the alternative to the map. Anyone arriving on a shared problem link loses it.
7. **Phone header squeeze** (B). The first screen on a phone gets longer for no reason.
8. **"Every problem" wording** (2). Minor, but the longer label tells people what it is.
9. **Tab order** (4). Keyboard users have 21 stops before the map. A skip link fixes it cheaply.

## Fix list for the coding agent

Each item: what's wrong, what it should do instead, and where it comes from in the bible. Screenshots are in `qa/design/`. Items F2, F4, F5 and F9 change the shared map module or the bible, because the reference itself was wrong. Update `docs/design/reference/src/` to match, so the reference and the site don't drift.

### F1. Until the panel ships, don't open an invisible one (interim)

- **Wrong:** the site mounts with `panel: false, reserveRight: 430` and renders nothing in the panel. Selecting a problem, sub-area, layer or organisation shows no details, and the camera parks the lit tiles in the left two-thirds beside an empty-looking strip of dimmed map.
- **Should:** until task 3 lands, mount with the module's built-in panel (`panel: true`, no `reserveRight`), so the side sheet and phone bottom sheet appear exactly as in the reference. When the site's own panel ships, switch back to `panel: false, reserveRight: 430`. If the built-in panel can't be used, at least set `reserveRight: 0`, so the camera centres what's lit.
- **Bible:** `05-panels-and-pages.md` (panel container and "What each panel contains"); `04-interaction.md` (camera "leaving room for the panel on the right"); `07-integration-and-checks.md` (options table, porting note on `reserveRight`).
- **Files:** `apps/web/components/FieldMapMount.tsx:67`.

### F2. Name tags must never overprint island names

- **Wrong:** at problem level, if a linked problem's tag can't find a clean spot, the second pass lets it overlap island names. With real data this produces overprinted labels (`nodeAF-1440x900-light`, around "Cyberattacks and critical infrastructure").
- **Should:** before allowing any overlap, try the same eight positions again further out, with the gap between tile and tag raised from 5px to 18px. If a tag still has to overlap an island name, place the tag and hide that island name (opacity 0, 0.2s) for as long as the problem is open, then restore it. Tags beat island names, because the tags are what the reader asked for. The selected problem's third pass stays as it is. Link lines should still pass under tags, as now.
- **Bible:** `04-interaction.md`, "Placing name tags". Update the pass rules there to match.
- **Files:** `packages/fieldmap` `tags()`, and `screenLabels()` or the world island labels for the hiding. Mirror it in `docs/design/reference/src/body.html`.

### F3. Title at full size

- **Wrong:** both spans in the `h1` carry inline `font-size: 1.6rem`, so the title renders at 25.6px at every width.
- **Should:** remove the inline sizes so the stylesheet's `clamp(30px, 4.3vw, 56px)` applies. The first line is 700 with line-height 0.95 and letter-spacing -0.022em; "Field Map" is 400 on its own line. On phones that gives 30px, not 25.6px.
- **Bible:** `02-tokens.md`, Type table, "Page title" rows; `03-map.md`, Page anatomy item 1.
- **Files:** `apps/web/app/(map)/layout.tsx:80` and `:83`.

### F4. Lens buttons show readable names

- **Wrong:** when a lens has no `name`, the button shows its slug ("loss-of-control").
- **Should:** fall back to a readable form of the slug: hyphens to spaces, first letter capitalised ("Loss of control", "Defensive technology", "Open source", "Critical infrastructure", "Agents", "Democracy"). Use the same text for the button, its accessible name and anything else that names the lens. If `name` exists, use it unchanged.
- **Bible:** `06-v2-encoding.md`, Lenses; `01-principles.md`, Writing (plain words). Add a line to `06` saying names fall back to a readable form of the slug.
- **Files:** `packages/fieldmap`, where `lensList` is built in `buildModel`.

### F5. Don't promise pink when there isn't any

- **Wrong:** the lede always explains pink, and the "Nobody yet" key row shows "0" next to blank space. With the current data no tile is pink.
- **Should:** build the lede from what's on the map. When no problem has capacity `none`, use: "Every hex is a problem someone could work on. Gold means a little work, green active and dark forest busy, and right now every problem has someone on it. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field." When there are some, keep the current wording. In the key, keep the "Nobody yet" row (it's a fact worth stating), but when its count is 0 show "0" followed by "none right now" in 12px `--fm-ink-3`, so the empty run reads as deliberate.
- **Bible:** `06-v2-encoding.md`, "Tile colour: capacity" (the note on scarce pink) and "The key for v2" (the lede text). Update both with the zero case.
- **Files:** `packages/fieldmap` `buildText()` (lede) and `buildCensus()` (row), or the server-rendered header if the lede lives in `layout.tsx`.

### F6. The problem list appears on every map route

- **Wrong:** the "Every problem" list renders only on `/`. On `/map/<level>/<slug>` the page ends at the chart foot.
- **Should:** render the same server-side list under the chart on every map route, identical markup and position, closed by default. It's the screen-reader and keyboard alternative to the map, so it has to be there wherever someone lands. This also gives deep links enough page to scroll the chart into view.
- **Bible:** `03-map.md`, Page anatomy item 5; `07-integration-and-checks.md`, "The list of every problem".
- **Files:** `apps/web/app/(map)/page.tsx` (move the list into the shared `(map)/layout.tsx`, or render it in the level route too).

### F7. Phone header in one column

- **Wrong:** under 700px the title block keeps two columns, with the theme button beside the title, and the lede is squeezed to about 60% of the width.
- **Should:** under 700px, make the header one column. Put the theme button above the title, left-aligned, as in the reference; keeping its larger touch size is fine. The title, lede (16px, max 58ch) and meta line then use the full width.
- **Bible:** `03-map.md`, Page anatomy item 1 ("on phones it sits above the title"); `02-tokens.md`, Type table (lede).
- **Files:** `apps/web/app/globals.css` (title block rules in the max-width 700px block), or `layout.tsx` if the grid is set inline there.

### F8. Summary label

- **Wrong:** the list's summary reads "Every problem".
- **Should:** "Every problem, as a list", followed by the "Show" and "Hide" affordance as now. The accessible name stays stable because it's the summary's own text.
- **Bible:** `03-map.md`, Page anatomy item 5.
- **Files:** `apps/web/app/(map)/page.tsx:31` (or wherever the list ends up after F6).

### F9. Skip link, and fix the bible's tab-stop wording

- **Wrong:** a keyboard user needs 21 Tab presses (theme button, six key rows, four layer buttons, search and so on) to reach the map. The bible's check 7 is worded as if that should be one press.
- **Should:** add a "Skip to the map" link as the first focusable element on the page. It's visually hidden until focused, then shown top-left as a square button (1px ink border, 2px radius, paper background, 13.5px 500), and it moves focus to the current tile. In the bible, change `04-interaction.md` to "The map itself is one tab stop: tiles use a roving tabindex" and `07` check 7 to "A skip link reaches the map in one press; inside the map, Tab moves on rather than through the tiles".
- **Bible:** `04-interaction.md`, Keyboard; `07-integration-and-checks.md`, check 7.
- **Files:** `apps/web/app/(map)/layout.tsx` for the link; `docs/design/04-interaction.md` and `07-integration-and-checks.md` for the wording.

### Left out on purpose

- The lens definition copy ("Nodes about...") and any other wording that comes from the data: content, not code.
- The em-dash check on generated files: tooling.
- Everything in task 3 beyond the interim in F1: the panel design is already specified in `05-panels-and-pages.md`.

## After the fixes

Rerun the QA with the same slugs and sizes. Because F3 moves everything below the title by 54px, the raw diffs should drop from 17 to 40% to under 1% on the whole map. Also recheck the three items the QA agent couldn't: tooltip suppression on a real touch tap, scroll restore when returning to the whole map (after F6), and the malformed-data run from check 6, using a fixture in the scratchpad rather than the real data.
