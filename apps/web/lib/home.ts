import type { MapNode } from "./data/types";

/** "Who holds it" labels, docs/design/06-v2-encoding.md ("In the panel"). */
export const HOME_LABEL: Record<string, string> = {
  "independent-ai-safety": "Independent AI safety groups",
  "frontier-labs": "Frontier labs",
  government: "Government",
  commercial: "Companies",
  academia: "Universities",
  "another-field": "Another field",
};

export type HomeToken = "labs" | "field" | "none";

/**
 * The two cases that earn a token on the tile and in the panel, checked in
 * this order (06-v2-encoding.md, "Home: a small token"). Everything else
 * gets no token: the panel lists which of independent groups, government,
 * companies or universities hold it instead.
 */
export function homeToken(home: MapNode["home"]): HomeToken {
  if (home.includes("another-field")) return "field";
  if (home.length === 1 && home[0] === "frontier-labs") return "labs";
  return "none";
}

/**
 * The "Who holds it" sentence body (without the "Who holds it:" label),
 * following the three cases in 06-v2-encoding.md exactly.
 *
 * The another-field case substitutes `owner_field` for the "Another field"
 * label but still lists every other home value, matching the reference
 * (packages/fieldmap/src/fieldmap.js, nodePanel: `n.home.map(k => k ===
 * 'another-field' && n.owner ? n.owner : HOME[k]).join(', ')`). 13 of the
 * 23 another-field problems in the September 2026 data name a second
 * holder, so returning only `owner_field` would silently drop, for example,
 * the "Government" half of "critical-sector regulators, Government".
 */
export function homeLine(node: MapNode): string {
  if (homeToken(node.home) === "labs") {
    return "frontier labs only. Outside the labs, nobody is working on it yet.";
  }
  return node.home
    .map((h) => (h === "another-field" && node.owner_field ? node.owner_field : (HOME_LABEL[h] ?? h)))
    .join(", ");
}
