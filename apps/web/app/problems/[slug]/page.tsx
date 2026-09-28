import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { HeaderControls } from "@/components/HeaderControls";
import { CapacityHex } from "@/components/CapacityHex";
import { ConnectionBox } from "@/components/ConnectionBox";
import { HomeLine } from "@/components/HomeLine";
import { OrganisationCard } from "@/components/OrganisationCard";
import { ProvenanceBox } from "@/components/ProvenanceBox";
import { ReportLink } from "@/components/ReportLink";
import { Row, RowList } from "@/components/Row";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusLine } from "@/components/StatusLine";
import { getMapData } from "@/lib/data";
import { buildMapIndex, resolveEdgeOrgs } from "@/lib/map-index";
import { statusLine } from "@/lib/capacity";
import { plural } from "@/lib/text";
import { safeUrl } from "@/lib/safe-url";
import type { MapNode } from "@/lib/data/types";

export async function generateStaticParams() {
  const data = await getMapData();
  const index = buildMapIndex(data);
  return Array.from(index.nodeBySlug.keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const found = index.nodeBySlug.get(slug);
  if (!found) return {};

  return {
    title: found.node.name,
    description: found.node.definition,
  };
}

/** "title" on canonical_reference and open_problems_source, "name" on key_agendas (data facts). */
function referenceTitle(ref: { title?: string; name?: string }): string {
  return ref.title ?? ref.name ?? "Reference";
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const found = index.nodeBySlug.get(slug);
  if (!found) notFound();

  const { node, subarea, layer } = found;
  const edges = index.edgesByNode.get(node.slug) ?? [];

  const mainEdges = resolveEdgeOrgs(
    edges.filter((e) => e.role === "primary"),
    index,
  );
  const sideEdges = resolveEdgeOrgs(
    edges.filter((e) => e.role !== "primary"),
    index,
  );

  const total = mainEdges.length + sideEdges.length;

  // Linked problems, grouped by layer, the node's own layer first
  // ("Also in X"), matching docs/design/05-panels-and-pages.md and the
  // reference's own sort (layer index, then name).
  const related = (node.related ?? [])
    .map((relSlug) => index.nodeBySlug.get(relSlug))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  const layerOrder = data.layers.map((l) => l.slug);
  const relatedByLayer = new Map<string, { layer: typeof layer; nodes: MapNode[] }>();
  for (const rel of related) {
    const entry = relatedByLayer.get(rel.layer.slug) ?? { layer: rel.layer, nodes: [] };
    entry.nodes.push(rel.node);
    relatedByLayer.set(rel.layer.slug, entry);
  }
  const relatedGroups = Array.from(relatedByLayer.values()).sort(
    (a, b) => layerOrder.indexOf(a.layer.slug) - layerOrder.indexOf(b.layer.slug),
  );
  for (const group of relatedGroups) {
    group.nodes.sort((a, b) => a.name.localeCompare(b.name));
  }

  const canonicalUrl = safeUrl(node.canonical_reference?.url);
  const openProblemsUrl = safeUrl(node.open_problems_source?.url);

  return (
    <main className="fm-page fm-detail">
      <HeaderControls />
      <Breadcrumb
        steps={[
          { label: "Whole map", href: "/" },
          { label: layer.name, href: `/layers/${layer.slug}` },
          { label: subarea.name, href: `/areas/${subarea.slug}` },
        ]}
      />
      <Link href={`/map/node/${node.slug}`} className="fm-map-link">
        See this problem on the map
      </Link>

      <h1 className="fm-panel-title">{node.name}</h1>
      <StatusLine node={node} />
      <HomeLine node={node} />
      <ConnectionBox node={node} />
      <p className="fm-definition">{node.definition}</p>

      {node.why_it_matters ? (
        <>
          <SectionHeading>Why it matters</SectionHeading>
          <p className="fm-definition">{node.why_it_matters}</p>
        </>
      ) : null}

      {node.progress_looks_like ? (
        <>
          <SectionHeading>What progress looks like</SectionHeading>
          <p className="fm-definition">{node.progress_looks_like}</p>
        </>
      ) : null}

      {node.key_agendas && node.key_agendas.length ? (
        <>
          <SectionHeading note={plural(node.key_agendas.length, "agenda")}>Key agendas</SectionHeading>
          <ul className="fm-reference-list">
            {node.key_agendas.map((agenda, i) => {
              const url = safeUrl(agenda.url);
              const title = referenceTitle(agenda);
              return (
                <li key={`${title}-${i}`}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {node.entry_points ? (
        <>
          <SectionHeading>Entry points</SectionHeading>
          <p className="fm-definition">{node.entry_points}</p>
        </>
      ) : null}

      {node.canonical_reference ? (
        <>
          <SectionHeading>Canonical reference</SectionHeading>
          <p className="fm-definition">
            {canonicalUrl ? (
              <a href={canonicalUrl} target="_blank" rel="noopener noreferrer">
                {referenceTitle(node.canonical_reference)}
              </a>
            ) : (
              referenceTitle(node.canonical_reference)
            )}
          </p>
        </>
      ) : null}

      {node.existing_mitigations ? (
        <>
          <SectionHeading>Existing mitigations</SectionHeading>
          <p className="fm-definition">{node.existing_mitigations}</p>
        </>
      ) : null}

      {node.open_problems_source ? (
        <>
          <SectionHeading>Open problems</SectionHeading>
          <p className="fm-definition">
            {openProblemsUrl ? (
              <a href={openProblemsUrl} target="_blank" rel="noopener noreferrer">
                {referenceTitle(node.open_problems_source)}
              </a>
            ) : (
              referenceTitle(node.open_problems_source)
            )}
          </p>
        </>
      ) : null}

      <SectionHeading note={plural(total, "organisation")}>Who works on it</SectionHeading>
      {total === 0 ? (
        <p className="fm-empty-note">No organisation is recorded here yet.</p>
      ) : (
        <>
          <h3 className="fm-subheading">Main line of work ({mainEdges.length})</h3>
          {mainEdges.length ? (
            <ul className="fm-org-list">
              {mainEdges.map(({ edge, org }) => (
                <OrganisationCard key={org.org_id} org={org} edge={edge} />
              ))}
            </ul>
          ) : (
            <p className="fm-empty-note">No organisation has this as a main line of work.</p>
          )}
          {sideEdges.length ? (
            <>
              <h3 className="fm-subheading">Side line ({sideEdges.length})</h3>
              <ul className="fm-org-list">
                {sideEdges.map(({ edge, org }) => (
                  <OrganisationCard key={org.org_id} org={org} edge={edge} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}

      {relatedGroups.length ? (
        <>
          <SectionHeading note={plural(related.length, "problem")}>Linked problems</SectionHeading>
          {relatedGroups.map((group) => (
            <div key={group.layer.slug}>
              <h3 className="fm-subheading">
                {group.layer.slug === layer.slug ? "Also in " : "In "}
                {group.layer.name}
              </h3>
              <RowList>
                {group.nodes.map((relNode) => {
                  const relContext = index.nodeBySlug.get(relNode.slug);
                  return (
                    <Row
                      key={relNode.slug}
                      href={`/problems/${relNode.slug}`}
                      icon={<CapacityHex capacity={relNode.capacity} size={18} />}
                      name={relNode.name}
                      sub={[relContext?.subarea.name, statusLine(relNode)].filter(Boolean).join(" \u00b7 ")}
                    />
                  );
                })}
              </RowList>
            </div>
          ))}
        </>
      ) : null}

      <Link href={`/areas/${subarea.slug}`} className="fm-more-btn">
        <span>
          All {plural(subarea.nodes.length, "problem")} in {subarea.name}
        </span>
        <span aria-hidden="true">→</span>
      </Link>

      <ProvenanceBox record={node} />
      <ReportLink subject={node.name} />
    </main>
  );
}
