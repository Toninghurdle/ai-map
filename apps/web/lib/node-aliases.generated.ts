// Generated from data/v2/node-aliases.csv by scripts/checks/build-aliases.mjs.
// Do not edit by hand: run `pnpm build:aliases` after changing the CSV.
//
// A generated module rather than a runtime file read, for the same reason
// lib/data/index.ts imports map-data.json directly: /map/[level]/[slug] is
// server-rendered per request, so a readFileSync there runs inside the
// Vercel function against a path that only resolves if the file tracer
// happened to pick it up. Old-slug redirects failing silently is exactly
// the kind of breakage nobody notices (CLAUDE.md rule 10).

export type AliasKind = "node" | "subarea";

export interface NodeAlias {
  oldSlug: string;
  newSlug: string;
  /** Which URL shape this slug belongs to: /problems/<slug> or /areas/<slug>. */
  kind: AliasKind;
}

export const NODE_ALIASES: NodeAlias[] = [
  { oldSlug: "misuse.military.arms-control", newSlug: "misuse.military.lethal-autonomy", kind: "node" },
  { oldSlug: "meta.funding.fiscal-sponsorship", newSlug: "meta.funding.funding-infrastructure", kind: "node" },
  { oldSlug: "meta.funding.prizes", newSlug: "meta.funding.funding-infrastructure", kind: "node" },
  { oldSlug: "meta.funding.incubation", newSlug: "meta.funding.funding-infrastructure", kind: "node" },
  { oldSlug: "meta.convenings.cross-sector", newSlug: "meta.convenings.convenings-and-events", kind: "node" },
  { oldSlug: "meta.convenings.subfield-forums", newSlug: "meta.convenings.convenings-and-events", kind: "node" },
  { oldSlug: "meta.convenings.event-infrastructure", newSlug: "meta.convenings.convenings-and-events", kind: "node" },
  { oldSlug: "meta.tooling.on-demand-expertise", newSlug: "meta.talent.senior-and-specialist-recruitment", kind: "node" },
  { oldSlug: "meta.communications.narrative-strategy", newSlug: "meta.communications.public-opinion", kind: "node" },
  { oldSlug: "meta.strategy.macrostrategy", newSlug: "meta.evidence.macrostrategy-and-prioritisation", kind: "node" },
  { oldSlug: "meta.strategy.prioritisation", newSlug: "meta.evidence.macrostrategy-and-prioritisation", kind: "node" },
  { oldSlug: "meta.tooling.compute-access", newSlug: "meta.tooling.shared-research-infrastructure", kind: "node" },
  { oldSlug: "meta.tooling.datasets-and-environments", newSlug: "meta.tooling.shared-research-infrastructure", kind: "node" },
  { oldSlug: "meta.strategy.threat-modelling", newSlug: "meta.evidence.threat-modelling", kind: "node" },
  { oldSlug: "meta.strategy", newSlug: "meta.evidence", kind: "subarea" },
];
