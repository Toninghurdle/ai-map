import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CapacityHex } from "@/components/CapacityHex";
import { ProvenanceBox } from "@/components/ProvenanceBox";
import { ReportLink } from "@/components/ReportLink";
import { Row, RowList } from "@/components/Row";
import { SectionHeading } from "@/components/SectionHeading";
import { statusLine } from "@/lib/capacity";
import { getMapData } from "@/lib/data";
import { buildMapIndex } from "@/lib/map-index";
import { approachabilityChips, orgMeta } from "@/lib/org-meta";
import { safeUrl } from "@/lib/safe-url";
import { plural } from "@/lib/text";

export async function generateStaticParams() {
  const data = await getMapData();
  const index = buildMapIndex(data);
  // Only orgs with at least one edge get a page (task brief, "/orgs/<org_id>"),
  // and only ones that exist in `orgs`: edgesByOrg is keyed off edges, so an
  // edge naming a missing org would otherwise be prerendered as a page that
  // immediately notFound()s, and listed in the sitemap. resolveEdgeOrgs in
  // lib/map-index.ts already drops those, so the three agree.
  return Array.from(index.edgesByOrg.keys())
    .filter((orgId) => index.orgById.has(orgId))
    .map((orgId) => ({ orgId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgId: string }>;
}): Promise<Metadata> {
  const { orgId } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const org = index.orgById.get(orgId);
  if (!org || !index.edgesByOrg.has(orgId)) return {};

  return {
    title: org.name,
    description: `${org.name}: ${orgMeta(org)}.`,
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const org = index.orgById.get(orgId);
  const orgEdges = index.edgesByOrg.get(orgId);
  // Orgs with no edges get no page (task brief): 404 rather than an
  // organisation panel with nothing in "Works on".
  if (!org || !orgEdges) notFound();

  const site = safeUrl(org.url);
  const chips = approachabilityChips(org.approachability);
  const allEdges = [...orgEdges.primary, ...orgEdges.secondary];
  const total = allEdges.length;
  const mainCount = orgEdges.primary.length;

  // Rows grouped by layer, main line first within each layer, then by name
  // (docs/design/05-panels-and-pages.md "Organisation" panel; mirrors the
  // reference's own sort).
  const byLayer = new Map<string, { layerName: string; layerOrder: number; rows: { edge: (typeof allEdges)[number]; nodeName: string; subareaName: string; capacity: string; home: string[] }[] }>();
  const layerOrder = new Map(data.layers.map((l, i) => [l.slug, i]));

  for (const edge of allEdges) {
    const found = index.nodeBySlug.get(edge.node_slug);
    if (!found) continue;
    const entry = byLayer.get(found.layer.slug) ?? {
      layerName: found.layer.name,
      layerOrder: layerOrder.get(found.layer.slug) ?? 0,
      rows: [],
    };
    entry.rows.push({
      edge,
      nodeName: found.node.name,
      subareaName: found.subarea.name,
      capacity: found.node.capacity,
      home: found.node.home,
    });
    byLayer.set(found.layer.slug, entry);
  }

  const layerGroups = Array.from(byLayer.values()).sort((a, b) => a.layerOrder - b.layerOrder);
  for (const group of layerGroups) {
    group.rows.sort((a, b) => {
      const aMain = a.edge.role === "primary" ? 1 : 0;
      const bMain = b.edge.role === "primary" ? 1 : 0;
      return bMain - aMain || a.nodeName.localeCompare(b.nodeName);
    });
  }

  const layersOnCount = byLayer.size;

  return (
    <main className="fm-page fm-detail">
      <Breadcrumb steps={[{ label: "Whole map", href: "/" }]} />
      <Link href={`/map/org/${org.org_id}`} className="fm-map-link">
        See this organisation on the map
      </Link>

      <h1 className="fm-panel-title">{org.name}</h1>
      <p className="fm-org-meta" style={{ fontSize: "14px" }}>
        {orgMeta(org)}
      </p>
      {chips.length ? (
        <p className="fm-org-open">
          {chips.map((chip) => (
            <span key={chip.key} className={`fm-chip${chip.actNow ? " fm-chip-act-now" : ""}`}>
              {chip.label}
            </span>
          ))}
        </p>
      ) : null}
      {site ? (
        <p className="fm-definition">
          <a href={site} target="_blank" rel="noopener noreferrer">
            {site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </p>
      ) : null}
      {org.notes && org.status !== "active" ? <p className="fm-definition">{org.notes}</p> : null}

      <SectionHeading
        note={`${plural(total, "problem")}, ${mainCount} as a main line, across ${plural(layersOnCount, "layer")}`}
      >
        Works on
      </SectionHeading>
      {layerGroups.map((group) => (
        <div key={group.layerName}>
          <h3 className="fm-subheading">{group.layerName}</h3>
          <RowList>
            {group.rows.map((row) => (
              <Row
                key={row.edge.node_slug}
                href={`/problems/${row.edge.node_slug}`}
                icon={<CapacityHex capacity={row.capacity} size={18} />}
                name={row.nodeName}
                sub={[row.subareaName, statusLine({ capacity: row.capacity, home: row.home })].filter(Boolean).join(" \u00b7 ")}
                value={row.edge.role === "primary" ? "Main" : "Side"}
              />
            ))}
          </RowList>
        </div>
      ))}

      <ProvenanceBox record={org} />
      <ReportLink subject={org.name} />
    </main>
  );
}
