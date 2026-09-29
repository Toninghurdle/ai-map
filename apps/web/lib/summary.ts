import { homeToken } from "./home";
import { plural } from "./text";
import type { MapNode } from "./data/types";

/**
 * The sub-area and layer "Summary line" (docs/design/05-panels-and-pages.md):
 * "6 problems: 2 with a little work, 4 active. 2 held by another field, 2
 * only in frontier labs." Written for v2's capacity/home fields rather than
 * the v1.2 reference's coverage_status groups (docs/design/06-v2-encoding.md
 * moved capacity and home apart, so a v1.2-shaped sentence would conflate
 * them again).
 */
export function nodesSummary(nodes: MapNode[]): string {
  const counts = { none: 0, thin: 0, active: 0, busy: 0 };
  let field = 0;
  let labs = 0;

  for (const node of nodes) {
    if (node.capacity in counts) counts[node.capacity as keyof typeof counts] += 1;
    const token = homeToken(node.home);
    if (token === "field") field += 1;
    else if (token === "labs") labs += 1;
  }

  const parts: string[] = [];
  if (counts.none) parts.push(`${counts.none} with nobody on it yet`);
  if (counts.thin) parts.push(`${counts.thin} with a little work`);
  if (counts.active) parts.push(`${counts.active} active`);
  if (counts.busy) parts.push(`${counts.busy} busy`);

  const held: string[] = [];
  if (field) held.push(`${field} held by another field`);
  if (labs) held.push(`${labs} only in frontier labs`);

  let sentence = `${plural(nodes.length, "problem")}: ${parts.join(", ")}.`;
  if (held.length) {
    const heldSentence = held.join(", ");
    sentence += ` ${heldSentence.charAt(0).toUpperCase()}${heldSentence.slice(1)}.`;
  }
  return sentence;
}
