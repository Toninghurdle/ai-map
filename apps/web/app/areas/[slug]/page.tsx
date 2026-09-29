import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { HeaderControls } from "@/components/HeaderControls";
import { CapacityHex } from "@/components/CapacityHex";
import { OrgRankRows } from "@/components/OrgRankRows";
import { ProvenanceBox } from "@/components/ProvenanceBox";
import { ReportLink } from "@/components/ReportLink";
import { Row, RowList } from "@/components/Row";
import { SectionHeading } from "@/components/SectionHeading";
import { statusLine } from "@/lib/capacity";
import { getMapData } from "@/lib/data";
import { buildMapIndex } from "@/lib/map-index";
import { rankOrgsFor } from "@/lib/org-rank";
import { taxonomyProvenance } from "@/lib/provenance";
import { nodesSummary } from "@/lib/summary";
import { plural } from "@/lib/text";

export async function generateStaticParams() {
  const data = await getMapData();
  const index = buildMapIndex(data);
  return Array.from(index.subareaBySlug.keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const found = index.subareaBySlug.get(slug);
  if (!found) return {};

  return {
    title: found.subarea.name,
    description: found.subarea.definition,
  };
}


export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const found = index.subareaBySlug.get(slug);
  if (!found) notFound();

  const { subarea, layer } = found;
  const orgCounts = new Map<string, number>();
  for (const node of subarea.nodes) {
    orgCounts.set(node.slug, (index.edgesByNode.get(node.slug) ?? []).length);
  }
  const ranked = rankOrgsFor(subarea.nodes, index);

  const siblings = layer.subareas;
  const i = siblings.findIndex((s) => s.slug === subarea.slug);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];

  return (
    <main className="fm-page fm-detail">
      <HeaderControls />
      <Breadcrumb steps={[{ label: "Whole map", href: "/" }, { label: layer.name, href: `/layers/${layer.slug}` }]} />
      <Link href={`/map/area/${subarea.slug}`} className="fm-map-link">
        See this sub-area on the map
      </Link>

      <h1 className="fm-panel-title">{subarea.name}</h1>
      <p className="fm-summary-line">{nodesSummary(subarea.nodes)}</p>
      <p className="fm-definition">{subarea.definition}</p>
      {subarea.scope_rule ? (
        <>
          <SectionHeading>Scope</SectionHeading>
          <p className="fm-definition">{subarea.scope_rule}</p>
        </>
      ) : null}

      <SectionHeading note={plural(subarea.nodes.length, "problem")}>Problems</SectionHeading>
      <RowList>
        {subarea.nodes.map((node) => (
          <Row
            key={node.slug}
            href={`/problems/${node.slug}`}
            icon={<CapacityHex capacity={node.capacity} size={18} />}
            name={node.name}
            // docs/design/05 ("Sub-area"): rows with status and organisation
            // count. The mini tile is decorative, so this line is also what
            // carries capacity to a screen reader.
            sub={statusLine(node)}
            value={plural(orgCounts.get(node.slug) ?? 0, "organisation")}
          />
        ))}
      </RowList>

      {ranked.length ? (
        <>
          <SectionHeading note={plural(ranked.length, "organisation")}>Who works here</SectionHeading>
          <OrgRankRows list={ranked} limit={10} />
        </>
      ) : null}

      <div className="fm-sib-nav">
        {prev ? <Link href={`/areas/${prev.slug}`}>&larr; {prev.name}</Link> : <span />}
        {next ? <Link href={`/areas/${next.slug}`}>{next.name} &rarr;</Link> : null}
      </div>

      <ProvenanceBox record={taxonomyProvenance(data.generated)} />
      <ReportLink subject={subarea.name} />
    </main>
  );
}
