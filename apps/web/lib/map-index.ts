import type { MapData, MapEdge, MapLayer, MapNode, MapOrg, MapSubarea } from "./data/types";

/** A node together with the sub-area and layer it lives in, resolved once. */
export interface NodeContext {
  node: MapNode;
  subarea: MapSubarea;
  layer: MapLayer;
}

/** An org's edges, split by role, each still carrying the node it points at. */
export interface OrgEdges {
  primary: MapEdge[];
  secondary: MapEdge[];
}

/**
 * Every lookup the detail pages need, built from MapData in one pass rather
 * than repeated `.find()` calls scattered across renders (see the task
 * brief, "keep it one pass"). Call this once per page (it's cheap: a handful
 * of Map insertions over 118 nodes, 358 orgs and 670 edges) rather than
 * caching across requests, since getMapData() may itself be revalidated by
 * tag between calls.
 */
export interface MapIndex {
  data: MapData;
  nodeBySlug: Map<string, NodeContext>;
  subareaBySlug: Map<string, { subarea: MapSubarea; layer: MapLayer }>;
  layerBySlug: Map<string, MapLayer>;
  orgById: Map<string, MapOrg>;
  edgesByNode: Map<string, MapEdge[]>;
  edgesByOrg: Map<string, OrgEdges>;
}

export interface EdgeWithOrg {
  edge: MapEdge;
  org: MapOrg;
}

/**
 * Resolves each edge's org_id and drops any edge whose org isn't in the
 * data (shouldn't happen given CLAUDE.md rule 3, but keeps the render code
 * from having to narrow `MapOrg | undefined` itself), sorted alphabetically
 * by org name as every organisation list in 05-panels-and-pages.md is.
 */
export function resolveEdgeOrgs(edges: MapEdge[], index: MapIndex): EdgeWithOrg[] {
  const resolved: EdgeWithOrg[] = [];
  for (const edge of edges) {
    const org = index.orgById.get(edge.org_id);
    if (org) resolved.push({ edge, org });
  }
  return resolved.sort((a, b) => a.org.name.localeCompare(b.org.name));
}

export function buildMapIndex(data: MapData): MapIndex {
  const nodeBySlug = new Map<string, NodeContext>();
  const subareaBySlug = new Map<string, { subarea: MapSubarea; layer: MapLayer }>();
  const layerBySlug = new Map<string, MapLayer>();
  const orgById = new Map<string, MapOrg>();
  const edgesByNode = new Map<string, MapEdge[]>();
  const edgesByOrg = new Map<string, OrgEdges>();

  for (const layer of data.layers) {
    layerBySlug.set(layer.slug, layer);
    for (const subarea of layer.subareas) {
      subareaBySlug.set(subarea.slug, { subarea, layer });
      for (const node of subarea.nodes) {
        nodeBySlug.set(node.slug, { node, subarea, layer });
      }
    }
  }

  for (const org of data.orgs) {
    orgById.set(org.org_id, org);
  }

  for (const edge of data.edges) {
    const nodeList = edgesByNode.get(edge.node_slug) ?? [];
    nodeList.push(edge);
    edgesByNode.set(edge.node_slug, nodeList);

    const orgEdges = edgesByOrg.get(edge.org_id) ?? { primary: [], secondary: [] };
    if (edge.role === "primary") orgEdges.primary.push(edge);
    else orgEdges.secondary.push(edge);
    edgesByOrg.set(edge.org_id, orgEdges);
  }

  return { data, nodeBySlug, subareaBySlug, layerBySlug, orgById, edgesByNode, edgesByOrg };
}
