# 07. Integration and checks

## The component contract

The reference script is a plain IIFE with no dependencies. It reads two JSON script blocks, draws into fixed element IDs, and exposes a small API. Keep this contract when you move it into `packages/fieldmap`, so the standalone HTML build and the site can share one module.

**Options**, read once at start-up from `window.FIELD_MAP_OPTIONS`:

| Option | Default | Effect |
|---|---|---|
| `hash` | `true` | Read and write `#map/...` URLs and follow `hashchange`. With `false` the map never touches the URL; the site owns routing and calls `FieldMap.open` on load and on route changes |
| `panel` | `true` | Render the built-in panel. Set `false` when the site renders its own |
| `reserveRight` | `0` | Only with `panel: false`. Pixels (or a function of the level returning pixels) that the site's own panel covers on the right of the map, so the camera and name tags stay clear of it. Ignored on the whole map and in the stacked layout |

**API** on `window.FieldMap`:

| Call | Does |
|---|---|
| `open(level, slug)` | Go to a level: `'overview'`, `'layer'`, `'area'`, `'node'` or `'org'` |
| `select(slug)` | Open a problem, or the whole map if `slug` is null |
| `clear()` | Back to the whole map |
| `setData(json, orgs)` | Replace the data and redraw. `orgs` is `{orgs, edges}`; omit it if `json` already carries `orgs` and `edges` |
| `relayout()` | Recompute the layout (it already does this on resize and font load) |

**Events and callbacks:**

- `document` receives `fieldmap:navigate` with `detail: {level, slug}` whenever the level or slug changes. The site mirrors this into `/map/<level>/<slug>`: a change of level uses `router.push` (so Back walks up the map one level at a time), a change of slug at the same level uses `router.replace` (so browsing problem to problem, or organisation to organisation, doesn't fill history with one entry per hex).
- `window.onNodeSelect(slug)` is called when the open problem changes, with `null` when none is open.

When the site owns the panel, it should still call `FieldMap.open(...)` when its own links are followed, so the map, the camera and the lit set stay in step.

## Data the map reads

**Structure:** `layers[]` → `subareas[]` → `nodes[]`, each with `slug`, `name` and `definition`; layers may have `role_line`. Top level: `version`, `generated` (ISO date, shown in the meta line), and optionally `lens_definitions`.

**Per node, v2:** `capacity`, `home`, `owner_field`, `connection`, `connection_note`, `capacity_note`, `lenses`, `related` (array of slugs; links are made symmetric and de-duplicated), `primary_orgs`, `secondary_orgs`.

**Per node, v1.2 (legacy):** `coverage_status`, `bridge_status`, `owner_field`, `related`, `primary_orgs`, `secondary_orgs`.

**Organisations:** `orgs[]` with `org_id`, `name`, `url`, `type`, `hq_country`, `region`, `status`, `approachability` (semicolon-separated in v1.2; accept an array too), `notes`; `edges[]` with `org_id`, `node_slug`, `role` (`primary` or `secondary`), `evidence_url`, `evidence_note`. Organisations with no edges are left out. Only `http` and `https` URLs are ever turned into links.

Anything unknown is tolerated: unknown statuses draw as "Not assessed" (and get their own key row), unknown home values are ignored, empty sub-areas and layers are skipped, and duplicate slugs keep the first. Counts shown to people (panel, tooltip, screen-reader labels) come from the organisation edges when they're loaded, and from `primary_orgs` only when no organisation data is present.

### Exact values

A misspelt value doesn't throw; it silently draws as "Not assessed" or loses its token. These are the spellings the map expects:

| Field | Values |
|---|---|
| `capacity` | `none`, `thin`, `active`, `busy` |
| `home` (array) | `independent-ai-safety`, `frontier-labs`, `government`, `commercial`, `academia`, `another-field` |
| `connection` | `strong`, `weak`, `missing`, `not-applicable` |
| `edges[].role` | `primary`, `secondary` |
| `orgs[].status` | `active`, `dormant`, `closed`, `unknown` |
| `orgs[].approachability` | `hiring`, `fellowship-or-programme`, `open-to-collaborators`, `contact-form`, `publishes-open-problems`, `closed` |
| `orgs[].type` | `nonprofit-research`, `for-profit-startup`, `field-building`, `government`, `nonprofit`, `academic`, `think-tank`, `advocacy`, `lab-safety-team`, `funder`, `standards-body`, `vc`, `individual-led-project`, `media` (others are shown as written) |

A minimal v2 file (the full fixture is `reference/v2-preview-data.json`):

```json
{
  "version": "2.0",
  "generated": "2026-10-01",
  "lens_definitions": [
    {"slug": "agents", "name": "Agents", "definition": "Problems that change when AI systems act on their own over long tasks."}
  ],
  "layers": [{
    "slug": "misuse", "name": "Harmful use", "role_line": "People turning it against the world",
    "definition": "...",
    "subareas": [{
      "slug": "misuse.cyber", "name": "Cyberattacks and critical infrastructure", "definition": "...",
      "nodes": [{
        "slug": "misuse.cyber.defensive-capacity-gaps",
        "name": "Cyber defence in lower-resourced states",
        "definition": "...",
        "capacity": "thin",
        "capacity_note": "",
        "home": ["another-field"],
        "owner_field": "international cyber-capacity-building and digital-development institutions",
        "connection": "missing",
        "connection_note": "",
        "lenses": ["defensive-technology"],
        "related": ["society.international-governance.inclusive-participation"],
        "primary_orgs": 0, "secondary_orgs": 3
      }]
    }]
  }],
  "orgs": [{"org_id": "itu", "name": "ITU", "url": "https://www.itu.int", "type": "government", "hq_country": "", "region": "", "status": "active", "approachability": ["closed"], "notes": ""}],
  "edges": [{"org_id": "itu", "node_slug": "misuse.cyber.defensive-capacity-gaps", "role": "secondary", "evidence_url": "https://...", "evidence_note": "..."}]
}
```

## Porting notes for the Next.js site

- **Tokens.** Put `tokens.css` in the global stylesheet. Either rename the reference's variables to the `--fm-` names (mapping in `02-tokens.md`) or alias them; don't keep two sets of values.
- **Font.** Load Jost with `next/font/google`, weights 400, 500, 600, 700 and italic 400 and 500, and put its variable first in `--fm-font`. The map measures text with a canvas to wrap labels and place tags, so it must lay out again once the real font is in. `next/font` self-hosts and preloads, but don't rely on the timing: in the client component, after mounting, `await document.fonts.ready` and then call `FieldMap.relayout()`. The canvas font string uses the family name, so make sure `--fm-font` (and the `FONT` constant in the script) name the family `next/font` actually registers.
- **Theme.** Keep the Auto, Light, Dark control and the `data-theme` attribute on `<html>`, and set it before first paint to avoid a flash.
- **Mounting.** Mount the map in a client component. The script expects these IDs: `map`, `map-wrap`, `chart`, `grid-top`, `grid-left`, `census`, `layers`, `lensbar`, `lb-chips`, `lb-def`, `find`, `find-list`, `links-btn`, `home-btn`, `panel`, `tip`, `kbd-hint`. These are optional and skipped if absent: `meta`, `chart-foot`, `index-cols`, `theme-btn`, and the `.lede` paragraph. The script is a singleton (module-level state, one set of IDs), so it supports one live map per page. For a small map on detail pages, use a static SVG crop of the island rendered on the server, not a second instance; making it multi-instance means wrapping the state in a factory that takes a root element, which is a refactor, not a setting.
- **Data.** Strip the embedded organisation block and feed both from `/data/map.json` with `setData`.
- **The list of every problem.** Render it on the server as plain HTML: one section per layer (`h3` layer name), an `h4` per sub-area with its grid reference, and a `ul` of problems, each a link to `/problems/<slug>` with a mini tile and its organisation count, styled as in `03-map.md`. Leave out the map's own `index-cols` element so the script doesn't build a second copy, and let links behave as normal page links.
- **Old slugs.** Redirects through `node_aliases` are the router's job. Resolve an old slug to its current one before calling `FieldMap.open`; the map only knows current slugs and treats anything else as the whole map.
- **Panel.** With `panel: false`, render the panel from server data using `05-panels-and-pages.md`, in the same position (side sheet over the right of the map area on wide screens, bottom sheet on phones). Set `reserveRight` to the panel's width plus 20px (430 for a 410px panel) so the camera frames what's lit in the space that's left. If the site's panel sits outside the map area instead, leave it at 0.
- **Don't rebuild it in React.** The layout, camera and label placement are imperative and tuned. Wrap the module; don't reimplement it with a charting library.

## Checks before shipping

Run these on every change to the map or the tokens:

1. **Screenshots** at 1440 × 900 (light and dark), 1280 × 800, and 390 × 844 at 2x (phone, touch). Compare with `reference/screens/`. Look at the whole map, a layer, a sub-area, a problem, an organisation, a lens, hover, and search.
2. **Colour blindness.** If any colour changes, run the five tile colours through a CVD validator (all pairs, protanopia, deuteranopia, tritanopia). Floor: ΔE 10.
3. **Contrast.** Text 4.5:1 or better on its background, including tile names on every fill in both themes.
4. **No em-dashes** in the code, the copy or the data shown. A search for U+2014 in the built page must find nothing (`grep -c $'\\u2014'` returns 0).
5. **British English** in all copy.
6. **Robustness.** Load a dataset with an extra layer, an extra sub-area, unknown capacity values, an empty sub-area and a problem with no organisations. Nothing should overlap or throw; unknowns draw as "Not assessed".
7. **Keyboard.** A skip link reaches the map in one press; inside the map, Tab moves on rather than through the tiles; arrows move sensibly; Enter opens; Escape walks back up to the whole map; focus returns to something sensible after each step.
8. **Deep links.** Every level loads directly from its URL and scrolls the map into view; back and forward work.
9. **Console.** No errors or warnings in any of the above.
10. **A cold review.** Give the page to someone (or an agent) who hasn't seen it, ask them to find who works on a given problem and how to contact one of those organisations, and ask whether the styling looks AI-generated. Fix what they trip over.
