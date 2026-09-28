// Old slugs, so links shared before the v2 rebuild keep working. CLAUDE.md
// rule 10: slugs are permanent, and renames and merges go through
// node_aliases and redirect.
//
// The list comes from lib/node-aliases.generated.ts, regenerated from
// data/v2/node-aliases.csv by `pnpm build:aliases`. It's a static import
// rather than a file read because /map/[level]/[slug] is server-rendered
// per request: a readFileSync there would run inside the Vercel function,
// and if the file tracer ever missed the CSV every old link would stop
// redirecting with no error. Once the site runs on Postgres this should
// read the node_aliases table through getMapData()'s loader instead.
import { NODE_ALIASES, type AliasKind } from "./node-aliases.generated";

const BY_OLD_SLUG = new Map(NODE_ALIASES.map((a) => [a.oldSlug, a]));

export interface ResolvedAlias {
  slug: string;
  kind: AliasKind;
}

/**
 * The current slug for an old one, with the URL shape it belongs to, or
 * null if this slug isn't an alias.
 *
 * Follows a chain (an old slug pointing at a slug that was itself later
 * renamed) up to a small limit, so a cycle in the data can't hang a build.
 * The September 2026 file has no chains; the limit is there for the next
 * import.
 */
export function resolveAlias(slug: string): ResolvedAlias | null {
  const first = BY_OLD_SLUG.get(slug);
  if (!first) return null;

  let current = first.newSlug;
  for (let hops = 0; hops < 8; hops += 1) {
    const next = BY_OLD_SLUG.get(current);
    if (!next || next.newSlug === current) break;
    current = next.newSlug;
  }
  return { slug: current, kind: first.kind };
}
