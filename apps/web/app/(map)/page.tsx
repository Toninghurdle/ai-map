import { getMapData, getOrgCountsByNode } from "@/lib/data";
import { plural } from "@/lib/text";
import { CapacityHex } from "@/components/CapacityHex";

/**
 * The whole map (docs/design/03-map.md "Page anatomy, top to bottom"). The
 * chart markup and FieldMapMount both live in ./layout.tsx, shared with
 * /map/[level]/[slug], so the fieldmap script loads, fetches and calls
 * setData once per page load rather than once per route.
 *
 * This page renders anatomy item 5, "Every problem, as a list": a closed
 * `<details>` under the chart, server-rendered so it works with no
 * JavaScript and for crawlers (docs/design/07-integration-and-checks.md,
 * "The list of every problem"). The map's own `index-cols` element is left
 * unmounted (see ./layout.tsx), so the script never builds a second copy of
 * this list.
 */
export default async function HomePage() {
  const data = await getMapData();
  const orgCountsByNode = getOrgCountsByNode(data);

  return (
    <details className="fm-index">
      {/* The Show and Hide words come from a ::after pseudo-element in
          globals.css, matching the reference (packages/fieldmap/src/fieldmap.css,
          ".index > summary::after"). Pseudo-element text is not part of the
          accessible name, so a screen reader reads a stable "Every problem"
          while the browser announces the open state from <details> itself,
          rather than the name changing under the reader as it is operated. */}
      <summary className="fm-index-summary">
        <h2 className="fm-index-heading">Every problem</h2>
      </summary>
      {data.layers.map((layer) => (
        <section key={layer.slug} className="fm-index-layer">
          <h3>{layer.name}</h3>
          {layer.role_line ? (
            <p className="fm-role-line">{layer.role_line}</p>
          ) : null}
          {layer.subareas.map((subarea) => (
            <div key={subarea.slug} className="fm-index-subarea">
              <h4>{subarea.name}</h4>
              <ul className="fm-index-list">
                {subarea.nodes.map((node) => {
                  const counts = orgCountsByNode.get(node.slug);
                  const total = counts?.total ?? 0;
                  return (
                    <li key={node.slug} className="fm-index-row">
                      <CapacityHex capacity={node.capacity} />
                      {/* A plain link, per docs/design/07-integration-and-checks.md
                          ("let links behave as normal page links"): these
                          detail pages don't exist yet, and this index must
                          work with no JavaScript regardless. */}
                      <a href={`/problems/${node.slug}`}>{node.name}</a>
                      <span className="fm-org-count">
                        {plural(total, "organisation")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </details>
  );
}
