import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { MapData } from "./types";

// data/v2/map-data.json is the first import only (see CLAUDE.md), read here
// as a static fallback and for local development. It's compiled at build
// time (a plain JSON import), so no filesystem access is needed at runtime.
import staticMapData from "../../../../data/v2/map-data.json";

const DATA_SOURCE = process.env.DATA_SOURCE ?? "static";

async function fetchMapDataFromSupabase(): Promise<MapData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required when DATA_SOURCE=supabase",
    );
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.rpc("map_json");

  if (error) {
    throw new Error(`map_json RPC failed: ${error.message}`);
  }

  return data as MapData;
}

const getCachedSupabaseMapData = unstable_cache(
  fetchMapDataFromSupabase,
  ["map-data-supabase"],
  { tags: ["map"] },
);

/**
 * The single entry point for reading the map data on the server. With
 * DATA_SOURCE=static (the default) it reads the repo's data/v2 snapshot;
 * with DATA_SOURCE=supabase it calls the map_json RPC through a cached,
 * tagged function so accepted changes can be revalidated by tag ("map").
 */
export async function getMapData(): Promise<MapData> {
  if (DATA_SOURCE === "supabase") {
    return getCachedSupabaseMapData();
  }
  return staticMapData as unknown as MapData;
}

export interface MapStats {
  problemCount: number;
  orgsWithEdgesCount: number;
  version: string;
  generated: string;
}

/** Summary numbers for the meta line under the page title (see 03-map.md). */
export function getMapStats(data: MapData): MapStats {
  const problemCount = data.layers.reduce(
    (sum, layer) =>
      sum +
      layer.subareas.reduce((subSum, subarea) => subSum + subarea.nodes.length, 0),
    0,
  );

  const orgIdsWithEdges = new Set(data.edges.map((edge) => edge.org_id));

  return {
    problemCount,
    orgsWithEdgesCount: orgIdsWithEdges.size,
    version: data.version,
    generated: data.generated,
  };
}

export interface NodeOrgCounts {
  primary: number;
  secondary: number;
  total: number;
}

/** Builds a slug -> organisation-count lookup from the edges array once. */
export function getOrgCountsByNode(data: MapData): Map<string, NodeOrgCounts> {
  const counts = new Map<string, NodeOrgCounts>();
  for (const edge of data.edges) {
    const existing = counts.get(edge.node_slug) ?? { primary: 0, secondary: 0, total: 0 };
    if (edge.role === "primary") existing.primary += 1;
    else existing.secondary += 1;
    existing.total += 1;
    counts.set(edge.node_slug, existing);
  }
  return counts;
}
