import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { HeaderControls } from "@/components/HeaderControls";
import { CapacityStrip } from "@/components/CapacityStrip";
import { OrgRankRows } from "@/components/OrgRankRows";
import { ProvenanceBox } from "@/components/ProvenanceBox";
import { ReportLink } from "@/components/ReportLink";
import { Row, RowList } from "@/components/Row";
import { SectionHeading } from "@/components/SectionHeading";
import { getMapData } from "@/lib/data";
import { buildMapIndex } from "@/lib/map-index";
import { rankOrgsFor } from "@/lib/org-rank";
import { taxonomyProvenance } from "@/lib/provenance";
import { nodesSummary } from "@/lib/summary";
import { plural } from "@/lib/text";
import type { MapNode } from "@/lib/data/types";

export async function generateStaticParams() {
  const data = await getMapData();
  return data.layers.map((layer) => ({ slug: layer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMapData();
  const layer = data.layers.find((l) => l.slug === slug);
  if (!layer) return {};

  return {
    title: layer.name,
    description: layer.definition,
  };
}


export default async function LayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMapData();
  const index = buildMapIndex(data);
  const layer = index.layerBySlug.get(slug);
  if (!layer) notFound();

  const allNodes: MapNode[] = layer.subareas.flatMap((s) => s.nodes);
  const ranked = rankOrgsFor(allNodes, index);

  return (
    <main className="fm-page fm-detail">
      <HeaderControls />
      <Breadcrumb steps={[{ label: "Whole map", href: "/" }]} />
      <Link href={`/map/layer/${layer.slug}`} className="fm-map-link">
        See this layer on the map
      </Link>

      <h1 className="fm-panel-title">{layer.name}</h1>
      {layer.role_line ? <p className="fm-role-line-panel">{layer.role_line}</p> : null}
      <p className="fm-summary-line">{nodesSummary(allNodes)}</p>
      <p className="fm-definition">{layer.definition}</p>

      <SectionHeading note={plural(layer.subareas.length, "sub-area")}>Sub-areas</SectionHeading>
      <RowList plain>
        {layer.subareas.map((subarea) => (
          <Row
            key={subarea.slug}
            href={`/areas/${subarea.slug}`}
            name={subarea.name}
            strip={<CapacityStrip nodes={subarea.nodes} />}
          />
        ))}
      </RowList>

      {ranked.length ? (
        <>
          <SectionHeading note={`${plural(ranked.length, "organisation")} in this layer`}>
            Most active organisations
          </SectionHeading>
          <OrgRankRows list={ranked} limit={8} />
        </>
      ) : null}

      <ProvenanceBox record={taxonomyProvenance(data.generated)} />
      <ReportLink subject={layer.name} />
    </main>
  );
}
