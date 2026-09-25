import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
};

/**
 * Placeholder for the mounted hex map. Renders the element IDs the
 * fieldmap script expects (docs/design/07-integration-and-checks.md
 * "Mounting") inside the chart frame styles, so packages/fieldmap can be
 * wired in later without changing this page's structure. No map logic
 * lives here yet.
 */
export default function MapPage() {
  return (
    <main className="fm-page">
      <div className="fm-title-block">
        <h1 className="fm-title">
          <span style={{ display: "block", fontWeight: 700, fontSize: "1.6rem" }}>
            AI Safety and Security
          </span>
          <span style={{ display: "block", fontWeight: 400, fontSize: "1.6rem" }}>
            Field Map
          </span>
        </h1>
      </div>
      <hr className="fm-rule" />

      <div id="census" />

      <div>
        <div id="layers" />
        <input id="find" placeholder="Find a problem or organisation" />
        <div id="find-list" />
        <button id="links-btn" type="button">
          Show all links
        </button>
        <button id="home-btn" type="button">
          Whole map
        </button>
      </div>

      <div id="lensbar">
        <div id="lb-chips" />
        <div id="lb-def" />
      </div>

      <div id="chart" className="fm-chart">
        <div id="grid-top" />
        <div style={{ display: "flex" }}>
          <div id="grid-left" />
          <div id="map-wrap" className="fm-map-area">
            <svg id="map" role="img" aria-label="The field map" />
            <p className="fm-map-porting">The map component is being ported.</p>
            <aside id="panel" aria-label="Details" />
            <div id="tip" />
            <div id="kbd-hint" />
          </div>
        </div>
        <div className="fm-chart-foot" />
      </div>
    </main>
  );
}
