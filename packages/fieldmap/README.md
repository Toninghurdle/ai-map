# @ai-map/fieldmap

The hex archipelago map, as a module: `src/fieldmap.js` and
`src/fieldmap.css`, ported from `docs/design/reference/src` (task 1 in
`docs/plan/mvp.md`) and wrapped for the site. The map itself is not
rewritten in React; it's a plain script that draws into fixed element IDs
and exposes a small API (`index.d.ts`), unchanged from the reference except
for how it gets its data.

## What's here

- `src/fieldmap.js` is the reference's markup-page script (from
  `docs/design/reference/src/body.html`'s inline `<script>`), with its
  internals changed as little as possible. The only real change: the
  reference reads two embedded `<script type="application/json">` blocks
  at boot; this module boots on an empty map instead and waits for the
  host to call `FieldMap.setData()`.
- `src/fieldmap.css` is the reference's CSS (from
  `docs/design/reference/src/head.html`), with its `:root` colour tokens
  replaced by aliases onto the `--fm-*` names in `docs/design/tokens.css`
  (mapping in `docs/design/02-tokens.md`), so there's one set of colour
  values, not two. The component rules below `:root` are otherwise
  unchanged.
- `index.d.ts` is the component contract: the script's public surface.
  Everything else is module-private state, because the script is a
  singleton, one live map per page (`docs/design/07-integration-and-checks.md`,
  "Mounting").
- The standalone HTML build (`docs/design/reference/src/build.py`) is
  separate from this package and untouched by the port: it still embeds a
  data file into the reference's own `head.html`/`body.html` as they
  stand, with their own unaliased tokens.

## How it's mounted

`apps/web/app/(map)/layout.tsx` renders the chart markup (the element IDs
the script expects) and `apps/web/components/FieldMapMount.tsx` once,
shared by `/` (the whole map) and `/map/[level]/[slug]` so the map isn't
unmounted and remounted (and refetched) when the reader moves between
levels. The two routes share this one layout because they sit in the same
route group, `app/(map)/`; a plain `/map` now redirects permanently to `/`
(`apps/web/app/map/page.tsx`).
`apps/web/scripts/copy-fieldmap.mjs` (run by `predev` and `prebuild`)
copies `src/fieldmap.js` and `src/fieldmap.css` into `apps/web/public`
with a content-hashed filename, recorded in `apps/web/fieldmap-manifest.json`,
so `packages/fieldmap/src` stays the only committed copy and a new deploy
gets a new URL rather than serving a browser's cached script.

`FieldMapMount`:

1. Sets `window.FIELD_MAP_OPTIONS = { hash: false, panel: false, reserveRight: 430 }`
   before the script runs, so the site owns routing and its own panel.
2. Loads the copied script once (a `<script>` tag), which sets
   `window.FieldMap`.
3. Calls `FieldMap.setData(mapJson)` with the data fetched from
   `/data/map.json`, and opens the level and slug read from the current
   URL.
4. After that, `await document.fonts.ready` and calls
   `FieldMap.relayout()`, so labels are measured against the real Jost
   metrics rather than a fallback font (see `07-integration-and-checks.md`,
   "Font").
5. Listens for `fieldmap:navigate` on `document` and mirrors
   `{level, slug}` into the URL: the whole map writes `/`, any other level
   writes `/map/<level>/<slug>`. A change of `level` uses `router.push` (so
   Back walks up the map one level at a time), and a change of `slug` at
   the same level uses `router.replace` (so browsing problem to problem
   doesn't fill history with one entry per hex). Calls
   `FieldMap.open(level, slug)` on the way back in when the site's own
   links or the browser's back and forward buttons change the route.
6. Renders the site's own side panel (`05-panels-and-pages.md`) from
   server data alongside the mounted map, not the map's built-in one; this
   is task 3, not yet built.
