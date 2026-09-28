import { getMapData, getOrgCountsByNode } from "@/lib/data";
import { plural } from "@/lib/text";
import { CapacityHex } from "@/components/CapacityHex";

/**
 * "Every problem, as a list": anatomy item 5 in docs/design/03-map.md, a
 * closed `<details>` under the chart, server-rendered so it works with no
 * JavaScript and for crawlers (docs/design/07-integration-and-checks.md,
 * "The list of every problem").
 *
 * Rendered by app/(map)/layout.tsx, so it appears under the chart on every
 * map route, not only on "/". It is the screen-reader and keyboard
 * alternative to the map, so someone arriving on a shared link to a problem
 * has to find it there too; it also gives a deep link enough page to scroll
 * the chart to the top (docs/design/design-qa-fixes.md F6).
 *
 * The map's own `index-cols` element is left unmounted (see the layout), so
 * the script never builds a second copy of this list.
 */
export async function ProblemIndex() {
  const data = await getMapData();
  const orgCountsByNode = getOrgCountsByNode(data);

  return (
    <details className="fm-index">
      {/* The Show and Hide words come from a ::after pseudo-element in
          globals.css, matching the reference (packages/fieldmap/src/fieldmap.css,
          ".index > summary::after"). Pseudo-element text is not part of the
          accessible name, so the name stays "Every problem, as a list"
          however the control is operated, and the browser announces the open
          state from <details> itself. */}
      <summary className="fm-index-summary">
        <h2 className="fm-index-heading">Every problem, as a list</h2>
      </summary>
      {data.layers.map((layer) => (
        <section key={layer.slug} className="fm-index-layer">
          <h3>{layer.name}</h3>
          {layer.role_line ? <p className="fm-role-line">{layer.role_line}</p> : null}
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
                      <span className="fm-org-count">{plural(total, "organisation")}</span>
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
