import type { MetadataRoute } from "next";
import { getMapData } from "@/lib/data";
import { buildMapIndex } from "@/lib/map-index";

// sitemap.xml requires fully-qualified URLs (unlike metadata fields, which
// can rely on metadataBase to fill in the origin), so the base is built here
// directly from the same env var app/layout.tsx uses.
//
// sitemap.xml is statically generated, so whatever this resolves to at
// BUILD time is baked in for the life of the deployment: an unset variable
// would ship every URL as localhost to Search Console, which is a different
// order of harm from a wrong metadataBase, and cannot be corrected without
// a rebuild.
//
// So a deployed build without it fails rather than falling back. The gate
// is VERCEL rather than NODE_ENV because `next build` sets NODE_ENV to
// production locally too, where falling back to localhost is correct.
// Vercel also offers VERCEL_URL, but that's the per-deployment URL, not the
// site's own domain, so it isn't a safe default here.
function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;
  if (process.env.VERCEL) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set on Vercel: it is baked into sitemap.xml at build time and cannot be corrected at runtime.",
    );
  }
  return "http://localhost:3000";
}

const SITE_URL = siteUrl();

function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Every detail page (118 problems, 28 sub-areas, 4 layers, every org with at
 * least one edge), plus /about and "/" (task brief item 6).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getMapData();
  const index = buildMapIndex(data);
  const lastModified = new Date(`${data.generated}T00:00:00Z`);

  const entries: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified },
    { url: abs("/about"), lastModified },
  ];

  for (const layer of data.layers) {
    entries.push({ url: abs(`/layers/${layer.slug}`), lastModified });
  }
  for (const slug of index.subareaBySlug.keys()) {
    entries.push({ url: abs(`/areas/${slug}`), lastModified });
  }
  for (const slug of index.nodeBySlug.keys()) {
    entries.push({ url: abs(`/problems/${slug}`), lastModified });
  }
  // Same filter as the org page's generateStaticParams: an edge naming an
  // org that isn't in `orgs` must not reach the sitemap as a URL that 404s.
  for (const orgId of index.edgesByOrg.keys()) {
    if (!index.orgById.has(orgId)) continue;
    entries.push({ url: abs(`/orgs/${orgId}`), lastModified });
  }

  return entries;
}
