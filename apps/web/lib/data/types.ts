// The MapData shape, kept in step with data/v2/map-data.json and the v2
// taxonomy decisions in CLAUDE.md. This is a local stand-in: once
// packages/db exists with generated Supabase types, that package should
// replace this file rather than the other way round.

export type Capacity = "none" | "thin" | "active" | "busy";

export type Home =
  | "independent-ai-safety"
  | "frontier-labs"
  | "government"
  | "commercial"
  | "academia"
  | "another-field";

export type Connection = "strong" | "weak" | "missing" | "not-applicable";

export type EdgeRole = "primary" | "secondary";

export type OrgStatus = "active" | "dormant" | "closed" | "unknown";

export interface MapReference {
  title: string;
  url: string;
  source_id?: string;
}

export interface MapNode {
  slug: string;
  name: string;
  definition: string;
  why_it_matters?: string;
  progress_looks_like?: string;
  canonical_reference?: MapReference | null;
  key_agendas?: MapReference[];
  boundary_notes?: string;
  tailwind_links?: string[];
  capacity: Capacity | (string & {});
  capacity_note?: string;
  home: (Home | (string & {}))[];
  owner_field?: string;
  connection?: Connection | (string & {});
  connection_note?: string;
  lenses?: string[];
  related?: string[];
  existing_mitigations?: string;
  confidence?: "low" | "medium" | "high" | (string & {});
  entry_points?: string;
  open_problems_source?: MapReference | null;
  reference_needs_replacing?: boolean;
  [extra: string]: unknown;
}

export interface MapSubarea {
  slug: string;
  name: string;
  definition: string;
  scope_rule?: string;
  nodes: MapNode[];
}

export interface MapLayer {
  slug: string;
  name: string;
  definition: string;
  role_line?: string;
  subareas: MapSubarea[];
}

export interface MapOrg {
  org_id: string;
  name: string;
  url: string;
  type: string;
  hq_country?: string;
  region?: string;
  status: OrgStatus | (string & {});
  approachability?: string | string[];
  funding_model?: string;
  commercial_model?: string;
  notes?: string;
  [extra: string]: unknown;
}

export interface MapEdge {
  org_id: string;
  node_slug: string;
  role: EdgeRole | (string & {});
  evidence_url?: string;
  evidence_note?: string;
  [extra: string]: unknown;
}

/** A lens definition, as an array item or as one value of a slug-keyed object. */
export interface LensDefinition {
  slug: string;
  name: string;
  definition: string;
}

export interface MapData {
  version: string;
  generated: string;
  lens_definitions?: Record<string, string> | LensDefinition[];
  layers: MapLayer[];
  orgs: MapOrg[];
  edges: MapEdge[];
  [extra: string]: unknown;
}
