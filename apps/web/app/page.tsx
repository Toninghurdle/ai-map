import { getMapData, getMapStats, getOrgCountsByNode } from "@/lib/data";
import { plural, formatLongDate } from "@/lib/text";
import { CapacityHex } from "@/components/CapacityHex";
import { ThemeToggle } from "@/components/ThemeToggle";

const LEDE =
  "Every hex is a problem someone could work on. Pink means nobody is working on it yet, gold a little work, green active and dark forest busy. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field.";

export default async function HomePage() {
  const data = await getMapData();
  const stats = getMapStats(data);
  const orgCountsByNode = getOrgCountsByNode(data);

  return (
    <main className="fm-page">
      <div className="fm-title-block">
        <div className="fm-title-row">
          <div className="fm-title">
            <h1>
              AI Safety and Security
              <span className="fm-title-sub">Field Map</span>
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="fm-lede">{LEDE}</p>
        <p className="fm-meta">
          {plural(stats.problemCount, "problem")} ·{" "}
          {plural(stats.orgsWithEdgesCount, "organisation")} · data v
          {stats.version}, {formatLongDate(stats.generated)}
        </p>
      </div>
      <hr className="fm-rule" />

      <p className="fm-porting-note">
        The interactive map is being ported to this page. In the meantime,
        every problem in the field is listed below.
      </p>

      <div className="fm-index">
        <h2 className="fm-index-heading">Every problem</h2>
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
      </div>
    </main>
  );
}
