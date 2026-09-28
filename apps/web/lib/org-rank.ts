import type { MapIndex } from "./map-index";
import type { MapNode, MapOrg } from "./data/types";

export interface RankedOrg {
  org: MapOrg;
  main: number;
  side: number;
}

/**
 * Every org working on any of `nodes`, with its main/side edge counts
 * across just those nodes, ranked by main-line count then total then name
 * (docs/design/05-panels-and-pages.md "Show all": "ranked by main-line
 * count, then total, then name"). Used for a sub-area's or layer's "Who
 * works here" / "Most active organisations" rows.
 */
export function rankOrgsFor(nodes: MapNode[], index: MapIndex): RankedOrg[] {
  const byOrg = new Map<string, RankedOrg>();

  for (const node of nodes) {
    const edges = index.edgesByNode.get(node.slug) ?? [];
    for (const edge of edges) {
      const org = index.orgById.get(edge.org_id);
      if (!org) continue;
      const entry = byOrg.get(org.org_id) ?? { org, main: 0, side: 0 };
      if (edge.role === "primary") entry.main += 1;
      else entry.side += 1;
      byOrg.set(org.org_id, entry);
    }
  }

  return Array.from(byOrg.values()).sort(
    (a, b) => b.main - a.main || b.main + b.side - (a.main + a.side) || a.org.name.localeCompare(b.org.name),
  );
}
