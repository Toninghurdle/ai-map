import { notFound, permanentRedirect } from "next/navigation";
import type { FieldMapLevel } from "@ai-map/fieldmap";
import { resolveAlias } from "@/lib/aliases";

const LEVELS: FieldMapLevel[] = ["layer", "area", "node", "org"];

function isMapLevel(value: string): value is FieldMapLevel {
  return (LEVELS as string[]).includes(value);
}

/**
 * The four non-overview levels (docs/design/04-interaction.md "Levels"):
 * /map/layer/<slug>, /map/area/<slug>, /map/node/<slug>, /map/org/<org_id>.
 * An unknown level 404s here; an unknown slug for a known level is the
 * ported script's own job (docs/design/07-integration-and-checks.md
 * "Robustness": it falls back to the whole map, never throws).
 *
 * Renders nothing itself: the chart markup and FieldMapMount both live in
 * the shared route group layout at app/(map)/layout.tsx (also used by "/",
 * the whole map), which reads the current level and slug from the URL
 * rather than from this page's params, so the map isn't unmounted and
 * remounted (and refetched) when moving between "/" and a level, or
 * between levels.
 *
 * Old slugs: resolved here, before the page renders and so before
 * FieldMapMount calls FieldMap.open (docs/design/07-integration-and-checks.md,
 * "Old slugs": the map only knows current slugs and treats anything else as
 * the whole map, so an unresolved old slug would silently land the reader
 * on the overview instead of the problem they followed a link to). A
 * permanent redirect, so the address bar, shared links and crawlers all end
 * up on the current slug rather than the site quietly rendering the right
 * thing at the wrong URL.
 *
 * Only "node" and "area" can carry an alias, and each alias belongs to one
 * of the two: node-aliases.csv holds problem merges plus the one sub-area
 * merge (meta.strategy -> meta.evidence), so the alias's own `kind` decides
 * which level it's valid at. Redirecting an old problem slug at
 * /map/area/... would point the map at a sub-area that doesn't exist.
 * Organisation renames live in org-aliases.csv and aren't wired up here;
 * the brief (docs/plan/task-3-lite.md item 3) asks for node_aliases only.
 */
export default async function MapLevelPage({
  params,
}: {
  params: Promise<{ level: string; slug: string }>;
}) {
  const { level, slug } = await params;
  if (!isMapLevel(level)) notFound();

  if (level === "node" || level === "area") {
    const alias = resolveAlias(decodeURIComponent(slug));
    const wanted = level === "node" ? "node" : "subarea";
    if (alias && alias.kind === wanted) {
      permanentRedirect(`/map/${level}/${encodeURIComponent(alias.slug)}`);
    }
  }

  return null;
}
