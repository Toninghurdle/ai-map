import type { NextConfig } from "next";
import path from "node:path";
import { NODE_ALIASES } from "./lib/node-aliases.generated";

// The app lives at apps/web inside the pnpm workspace, but it needs to read
// data/v2/map-data.json from the repo root and to work with pnpm's linked
// node_modules across the monorepo. Vercel's root directory is apps/web, so
// point both the file tracer and Turbopack at the actual workspace root.
const workspaceRoot = path.join(__dirname, "../../");

/**
 * Old slugs, from the same generated module lib/aliases.ts imports
 * (CLAUDE.md rule 10: renames and merges go through node_aliases and
 * redirect). Regenerate it with `pnpm build:aliases` after changing
 * data/v2/node-aliases.csv.
 *
 * These are config-level redirects rather than per-page ones because they
 * have to fire for slugs that have no page: an old slug is not in
 * generateStaticParams, so /problems/<old> would 404 before any page
 * component could redirect it. The map routes are handled in the page
 * instead (app/(map)/map/[level]/[slug]/page.tsx), because that route does
 * render for any slug and has to resolve the alias before FieldMap.open.
 */
function aliasRedirects() {
  const seen = new Set<string>();
  const redirects: { source: string; destination: string; permanent: true }[] = [];

  for (const alias of NODE_ALIASES) {
    if (seen.has(alias.oldSlug)) continue;
    seen.add(alias.oldSlug);
    // An old slug names either a problem or a sub-area, never both, and
    // `kind` says which. Emitting both shapes for every row would point
    // /areas/<an old problem slug> at an /areas/ URL that doesn't exist,
    // and a 308 into a 404 is worse for a crawler than a plain 404.
    const segment = alias.kind === "subarea" ? "areas" : "problems";
    redirects.push({
      source: `/${segment}/${alias.oldSlug}`,
      destination: `/${segment}/${alias.newSlug}`,
      permanent: true,
    });
  }

  return redirects;
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  async redirects() {
    return aliasRedirects();
  },
};

export default nextConfig;
