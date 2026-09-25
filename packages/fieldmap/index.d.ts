// The component contract for the fieldmap module, per
// docs/design/07-integration-and-checks.md. Kept here as types only: the
// script itself is untyped plain JavaScript, ported unchanged from
// docs/design/reference/src. This file describes what apps/web is allowed
// to rely on; anything not listed here is the script's private state.

/** A map level, as used by FieldMap.open() and fieldmap:navigate. */
export type FieldMapLevel = "overview" | "layer" | "area" | "node" | "org";

/**
 * Read once at start-up from `window.FIELD_MAP_OPTIONS`. Set this before
 * the fieldmap script runs.
 */
export interface FieldMapOptions {
  /**
   * Read and write `#map/...` URLs and follow `hashchange`.
   * Default true. The site sets this false so it owns routing itself and
   * calls `FieldMap.open` on load and on route changes.
   */
  hash?: boolean;
  /**
   * Render the map's own built-in side panel. Default true. The site sets
   * this false and renders its own panel from server data
   * (docs/design/05-panels-and-pages.md).
   */
  panel?: boolean;
  /**
   * Only meaningful with `panel: false`. Pixels (or a function of the
   * level returning pixels) that the site's own panel covers on the right
   * of the map, so the camera and name tags stay clear of it. Ignored on
   * the whole map and in the stacked (phone) layout. Default 0.
   */
  reserveRight?: number | ((level: FieldMapLevel) => number);
}

/** The detail carried by the `fieldmap:navigate` DocumentEvent. */
export interface FieldMapNavigateDetail {
  level: FieldMapLevel;
  /** null on the whole map; a slug or org_id at every other level. */
  slug: string | null;
}

export type FieldMapNavigateEvent = CustomEvent<FieldMapNavigateDetail>;

/** Organisation and edge data, as accepted by `FieldMap.setData`'s second argument. */
export interface FieldMapOrgData {
  orgs: FieldMapOrg[];
  edges: FieldMapEdge[];
}

/** The public API exposed on `window.FieldMap` once the script has run. */
export interface FieldMapApi {
  /** Go to a level. `slug` is ignored (and should be omitted or null) for 'overview'. */
  open(level: FieldMapLevel, slug?: string | null): void;
  /** Open a problem, or the whole map if `slug` is null. */
  select(slug: string | null): void;
  /** Back to the whole map. Equivalent to `open('overview')`. */
  clear(): void;
  /**
   * Replace the data and redraw. `orgs` is `{orgs, edges}`; omit it if
   * `json` already carries `orgs` and `edges` at its top level.
   */
  setData(json: FieldMapData, orgs?: FieldMapOrgData): void;
  /** Recompute the layout. Also runs on resize and once the web font has loaded. */
  relayout(): void;
}

declare global {
  interface Window {
    FIELD_MAP_OPTIONS?: FieldMapOptions;
    FieldMap?: FieldMapApi;
    /** Called when the open problem changes; null when none is open. */
    onNodeSelect?: (slug: string | null) => void;
  }

  interface DocumentEventMap {
    "fieldmap:navigate": FieldMapNavigateEvent;
  }
}

// --- v2 data types, matching lib/data/types.ts in apps/web ---------------
// Kept in step with docs/design/07-integration-and-checks.md ("Data the
// map reads") and CLAUDE.md's data vocabulary. apps/web's copy is the one
// actually imported by the site; this copy documents what the script
// itself expects to receive.

export type FieldMapCapacity = "none" | "thin" | "active" | "busy";

export type FieldMapHome =
  | "independent-ai-safety"
  | "frontier-labs"
  | "government"
  | "commercial"
  | "academia"
  | "another-field";

export type FieldMapConnection = "strong" | "weak" | "missing" | "not-applicable";

export type FieldMapEdgeRole = "primary" | "secondary";

export type FieldMapOrgStatus = "active" | "dormant" | "closed" | "unknown";

export interface FieldMapLensDefinition {
  slug: string;
  name: string;
  definition: string;
}

export interface FieldMapNode {
  slug: string;
  name: string;
  definition: string;
  /** v2 only. A node without `capacity` is drawn the legacy v1.2 way. */
  capacity?: FieldMapCapacity | (string & {});
  capacity_note?: string;
  home?: (FieldMapHome | (string & {}))[];
  owner_field?: string;
  connection?: FieldMapConnection | (string & {});
  connection_note?: string;
  lenses?: string[];
  related?: string[];
  /** Present only when no organisation data has been loaded. */
  primary_orgs?: number;
  secondary_orgs?: number;
  /** v1.2 legacy fields, tolerated but unused by the v2 site. */
  coverage_status?: string;
  bridge_status?: string;
}

export interface FieldMapSubarea {
  slug: string;
  name: string;
  definition: string;
  nodes: FieldMapNode[];
}

export interface FieldMapLayer {
  slug: string;
  name: string;
  definition: string;
  role_line?: string;
  subareas: FieldMapSubarea[];
}

export interface FieldMapOrg {
  org_id: string;
  name: string;
  url: string;
  type: string;
  hq_country?: string;
  region?: string;
  status?: FieldMapOrgStatus | (string & {});
  /** Semicolon-separated in v1.2 files; an array is also accepted. */
  approachability?: string | string[];
  notes?: string;
}

export interface FieldMapEdge {
  org_id: string;
  node_slug: string;
  role: FieldMapEdgeRole | (string & {});
  evidence_url?: string;
  evidence_note?: string;
}

export interface FieldMapData {
  version: string;
  generated: string;
  lens_definitions?: Record<string, string> | FieldMapLensDefinition[];
  layers: FieldMapLayer[];
  /** Optional here: may instead be supplied via `setData`'s second argument. */
  orgs?: FieldMapOrg[];
  edges?: FieldMapEdge[];
}
