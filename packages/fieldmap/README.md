# @ai-map/fieldmap

The hex archipelago map, as a module. This package is a placeholder: the
`fieldmap` agent's job (task 1 in `docs/plan/mvp.md`) is to move the
reference script from `docs/design/reference/src` in here unchanged, then
wrap it for the site. Don't rewrite the map in React; wrap it.

## What goes here

- `docs/design/reference/src/body.html` holds the reference markup and the
  plain-JavaScript IIFE that draws the map (layout, camera, selection,
  search, keyboard, the works). `docs/design/reference/src/head.html` holds
  its CSS, which becomes the token aliasing in `docs/design/02-tokens.md`.
  `build.py` shows how the standalone HTML embeds a data file and an
  organisations file; keep that standalone build working alongside the
  module.
- Port the script's internals as little as possible. Strip only the
  embedded v1.2 data block, since the site feeds data through
  `FieldMap.setData()` from `/data/map.json` instead.
- Keep the component contract in `index.d.ts` (below) as the script's
  public surface. Everything else stays module-private state, because the
  script is a singleton: one live map per page (see
  `docs/design/07-integration-and-checks.md`, "Mounting").

## How it will be mounted

A small client component in `apps/web` (for example
`apps/web/components/FieldMapMount.tsx`) will:

1. Set `window.FIELD_MAP_OPTIONS = { hash: false, panel: false, reserveRight: 430 }`
   before the script runs, so the site owns routing and its own panel.
2. Load this package's script once (a `<script>` tag or a dynamic import
   with side effects), which sets `window.FieldMap`.
3. Call `FieldMap.setData(mapJson)` with the data fetched from
   `/data/map.json`.
4. After mount, `await document.fonts.ready` and call
   `FieldMap.relayout()`, so labels are measured against the real Jost
   metrics rather than a fallback font (see `07-integration-and-checks.md`,
   "Font").
5. Listen for `fieldmap:navigate` on `document` and mirror
   `{level, slug}` into `/map/<level>/<slug>` with `router.replace`; call
   `FieldMap.open(level, slug)` on the way back in when the site's own
   links or the browser's back and forward buttons change the route.
6. Render the site's own side panel (`05-panels-and-pages.md`) from server
   data alongside the mounted map, not the map's built-in one.

Until that port happens, `apps/web/app/map/page.tsx` is a static
placeholder with the element IDs this script expects, so the mount point
doesn't need to change shape when the real script arrives.
