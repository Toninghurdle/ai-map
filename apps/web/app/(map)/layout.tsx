import { FieldMapMount } from "@/components/FieldMapMount";
import { ProblemIndex } from "@/components/ProblemIndex";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ledeFor } from "@/lib/lede";
import { getMapData } from "@/lib/data";
// Written by apps/web/scripts/copy-fieldmap.mjs (predev, prebuild) from
// packages/fieldmap/src/fieldmap.{js,css}; gitignored build output, see
// .gitignore. A plain static import, same pattern as lib/data/index.ts's
// import of data/v2/map-data.json.
import fieldmapManifest from "../../fieldmap-manifest.json";

/**
 * Shared chrome for the whole map: the home page ("/", the whole map) and
 * the four level routes under /map/[level]/[slug]. FieldMapMount is
 * rendered here, once, rather than in the per-route page components, so a
 * layout re-render (moving between "/" and a level, or between levels)
 * doesn't unmount and remount it: React keeps a layout's own subtree across
 * navigations to different children, only the `children` slot changes. See
 * FieldMapMount's own comment for why this matters (it fetches and calls
 * setData once per page load, not once per route).
 *
 * This is a route group (`(map)`) precisely so "/" and "/map/[level]/[slug]"
 * share this one layout: a plain `app/layout.tsx` at either location would
 * only have covered one of the two URL shapes (docs/design/07's "Mounting").
 *
 * Renders the page anatomy in docs/design/03-map.md ("Page anatomy, top to
 * bottom"): title block (with the theme control and the 2px ink rule
 * closing it), the key, the toolbar, then the chart. The element IDs below
 * are what the fieldmap script expects; `index-cols` is left out on
 * purpose, so the script doesn't build a second copy of the problem list
 * (that list is server-rendered on the home page itself, per 07's "The list
 * of every problem"). `panel` is filled by the module itself for now
 * (FieldMapMount mounts with `panel: true`, an interim until task 3 ships
 * the site's own panel).
 */
export default async function MapLayout({ children }: { children: React.ReactNode }) {
  // The lede only promises pink when the map actually has a pink tile
  // (lib/lede.ts); the script recomputes the same sentence on the client
  // from the same data, so the text doesn't change after hydration.
  const data = await getMapData();
  const hasNone = data.layers.some((l) =>
    l.subareas.some((s) => s.nodes.some((n) => n.capacity === "none")),
  );

  return (
    <main className="fm-page">
      {/* apps/web/public/fieldmap.<hash>.css, a build-time copy of
          packages/fieldmap/src/fieldmap.css (see
          apps/web/scripts/copy-fieldmap.mjs), not bundled by Next's CSS
          pipeline, so a plain <link> is the only way to load it. This
          layout renders once per page load in this route group (it doesn't
          remount when only the route changes, see FieldMapMount's
          comment), so there is only ever one <link rel="stylesheet"> for
          this href in the DOM; React also injects its own
          <link rel="preload"> for the same href alongside it, which is
          expected and not a duplicate stylesheet. Verified with Playwright
          across layer, area and node navigation: the stylesheet link count
          stays at 1. */}
      <link rel="stylesheet" href={`/${fieldmapManifest.css}`} />
      <FieldMapMount />
      {/* SVG patterns the ported script's v1.2 path references by id
          (tx-lab, tx-adj); harmless and unused while only v2 data loads. */}
      <svg
        className="vh"
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        style={{ position: "absolute" }}
      >
        <defs>
          <pattern
            id="tx-lab"
            patternUnits="userSpaceOnUse"
            width="4.2"
            height="4.2"
            patternTransform="rotate(45)"
          >
            <path d="M1 0V4.2" style={{ stroke: "var(--m-lab-line)" }} strokeWidth="1.5" />
          </pattern>
          <pattern id="tx-adj" patternUnits="userSpaceOnUse" width="4.4" height="4.4">
            <circle cx="1.1" cy="1.1" r=".8" style={{ fill: "var(--o-dot)" }} />
            <circle cx="3.3" cy="3.3" r=".8" style={{ fill: "var(--o-dot)" }} />
          </pattern>
        </defs>
      </svg>

      <div className="fm-title-block fm-title-row">
        <div>
          {/* No inline font sizes: the size comes from .fm-title in
              globals.css, clamp(30px, 4.3vw, 56px), matching
              docs/design/02-tokens.md's "Page title" rows. The first line
              is 700, "Field Map" 400 on its own line. */}
          <h1 className="fm-title">
            <span className="fm-title-lead">AI Safety and Security</span>
            <span className="fm-title-sub">Field Map</span>
          </h1>
          <p className="fm-lede lede">{ledeFor(hasNone)}</p>
          <p className="fm-meta" id="meta" />
        </div>
        <ThemeToggle />
      </div>
      <hr className="fm-rule" />

      <section id="census" className="census" aria-label="Key" />

      <div className="bar">
        <nav id="layers" className="layers" aria-label="Layers" />
        <div className="find">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M10.6 10.6l3.4 3.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="find"
            type="search"
            placeholder="Find a problem or organisation"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-controls="find-list"
            aria-label="Find a problem, sub-area or organisation"
          />
          <ul className="find-list" id="find-list" role="listbox" hidden />
        </div>
        <button className="tbtn" id="links-btn" type="button" aria-pressed="false">
          Show all links
        </button>
        <button className="tbtn" id="home-btn" type="button" hidden>
          Whole map
        </button>
      </div>

      <div className="lensbar" id="lensbar" hidden>
        <span className="lb-label" id="lb-label">
          Lenses
        </span>
        <div className="lb-chips" id="lb-chips" role="group" aria-labelledby="lb-label" />
        <p className="lb-def" id="lb-def" hidden />
      </div>

      <section className="chart" id="chart" aria-label="Map of the field">
        <div className="grid-top" id="grid-top" aria-hidden="true" />
        <div className="grid-left" id="grid-left" aria-hidden="true" />
        <div className="map-wrap" id="map-wrap">
          <p className="vh" id="map-help">
            Map of every problem in the field. Arrow keys move between problems, Enter opens
            one, Escape goes back up a level.
          </p>
          <p className="kbd-hint" id="kbd-hint" hidden>
            Arrow keys move &middot; Enter opens &middot; Esc goes back
          </p>
          <svg id="map" role="group" aria-labelledby="map-help" />
          <aside className="panel" id="panel" aria-live="polite" aria-label="Details" hidden />
        </div>
        <p className="chart-foot" id="chart-foot" />
      </section>

      <div className="tip" id="tip" role="tooltip" hidden />

      {children}

      {/* Under the chart on every map route, not only "/": it's the
          screen-reader and keyboard alternative to the map, so someone
          arriving on a shared problem link has to find it too, and it gives
          a deep link enough page to scroll the chart to the top
          (docs/design/design-qa-fixes.md F6). */}
      <ProblemIndex />
    </main>
  );
}
