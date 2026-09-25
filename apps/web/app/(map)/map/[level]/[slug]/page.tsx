import { notFound } from "next/navigation";
import type { FieldMapLevel } from "@ai-map/fieldmap";

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
 * Old slugs: node_aliases redirects are the router's job (07's "Old
 * slugs"), not handled here yet; out of scope for this task.
 */
export default async function MapLevelPage({
  params,
}: {
  params: Promise<{ level: string; slug: string }>;
}) {
  const { level } = await params;
  if (!isMapLevel(level)) notFound();

  return null;
}
