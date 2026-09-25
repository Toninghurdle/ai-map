export type { Database, Json } from './database.types.js';

import type { Database } from './database.types.js';

export type LayerRow = Database['public']['Tables']['layers']['Row'];
export type SubareaRow = Database['public']['Tables']['subareas']['Row'];
export type NodeRow = Database['public']['Tables']['nodes']['Row'];
export type OrgRow = Database['public']['Tables']['orgs']['Row'];
export type EdgeRow = Database['public']['Tables']['edges']['Row'];
export type ContributionRow = Database['public']['Tables']['contributions']['Row'];

/**
 * The shape returned by `public.map_json()` (see
 * supabase/migrations/20260925000010_rls_and_api.sql), which matches
 * data/v2/map-data.json. This is a plain type, not a runtime validator: the
 * database is the source of truth, so nothing here re-checks its output.
 */
export interface MapData {
  version: string | number;
  generated: string;
  scope: {
    vantage_point: string;
    node_count_is_not_importance: string;
    capacity_is_not_progress: string;
    out_of_scope_for_now: Array<{ topic: string; note: string }>;
  };
  display_rules: {
    tile_colour: string;
    home: string;
    connection: string;
    lenses: string;
    counts: string;
    order: string[];
  };
  node_tests: {
    tests: string[];
    merge_review_trigger: string;
    applied_to: string;
  };
  /** slug -> definition, in display order (lens_definitions.sort_order). */
  lens_definitions: Record<string, string>;
  layers: MapDataLayer[];
  orgs: MapDataOrg[];
  edges: MapDataEdge[];
}

export interface MapDataLayer {
  slug: string;
  name: string;
  definition: string;
  role_line: string | null;
  subareas: MapDataSubarea[];
}

export interface MapDataSubarea {
  slug: string;
  name: string;
  definition: string;
  scope_rule: string | null;
  nodes: MapDataNode[];
}

export interface MapDataNode {
  slug: string;
  name: string;
  definition: string;
  why_it_matters: string | null;
  progress_looks_like: string | null;
  canonical_reference: { title: string; url: string } | null;
  key_agendas: Array<{ name: string; url: string }>;
  boundary_notes: string | null;
  related: string[];
  tailwind_links: string[];
  capacity: 'none' | 'thin' | 'active' | 'busy';
  capacity_note: string | null;
  home: string[];
  owner_field: string | null;
  connection: 'not-applicable' | 'strong' | 'weak' | 'missing';
  connection_note: string | null;
  lenses: string[];
  existing_mitigations: string | null;
  open_problems_source: { title: string; url: string } | null;
  entry_points: string | null;
  created_by: string | null;
  last_verified: string | null;
  human_verified: boolean;
}

export interface MapDataOrg {
  org_id: string;
  name: string;
  url: string | null;
  type: string | null;
  hq_country: string | null;
  region: string | null;
  funding_model: string | null;
  commercial_model: string | null;
  approachability: string[];
  status: 'active' | 'dormant' | 'closed' | 'unknown';
  notes: string | null;
  created_by: string | null;
  last_verified: string | null;
  human_verified: boolean;
}

export interface MapDataEdge {
  org_id: string | null;
  node_slug: string;
  role: 'primary' | 'secondary';
  evidence_url: string;
  evidence_note: string | null;
  created_by: string | null;
  last_verified: string | null;
  human_verified: boolean;
}
