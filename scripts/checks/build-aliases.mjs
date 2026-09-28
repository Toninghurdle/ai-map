// Regenerates apps/web/lib/node-aliases.generated.ts from
// data/v2/node-aliases.csv.
// Usage: pnpm build:aliases
//
// The site needs the alias list at runtime on /map/[level]/[slug], which is
// server-rendered per request. Reading the CSV there would mean a
// readFileSync inside the Vercel function against a path that only resolves
// if the file tracer picked the CSV up, and the failure mode is silent:
// every old link stops redirecting and nothing errors. A generated module
// is imported like any other source file, so it cannot go missing
// (CLAUDE.md rule 10; lib/data/index.ts imports map-data.json for the same
// reason).
//
// Once Postgres is the source of truth this should read the node_aliases
// table instead of the CSV, and the generated file goes away.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const CSV = path.join(root, "data", "v2", "node-aliases.csv");
const OUT = path.join(root, "apps", "web", "lib", "node-aliases.generated.ts");

// Every field in this file is a bare slug, a short change word or an ISO
// date, so a split on commas is enough; the seed generator
// (scripts/seed/build-seed.mjs) owns the strict parse and the validation
// that each new_slug exists.
const rows = readFileSync(CSV, "utf8")
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [oldSlug, newSlug, change] = line.split(",").map((f) => f?.trim());
    return { oldSlug, newSlug, change };
  })
  .filter((r) => r.oldSlug && r.newSlug);

const seen = new Set();
const entries = [];
for (const r of rows) {
  if (seen.has(r.oldSlug)) continue;
  seen.add(r.oldSlug);
  // The `change` column is what distinguishes the one sub-area merge from
  // the node merges and moves. A slug names one shape or the other, never
  // both, so this decides whether it redirects under /problems or /areas.
  const kind = r.change === "sub-area merged" ? "subarea" : "node";
  entries.push(
    `  { oldSlug: ${JSON.stringify(r.oldSlug)}, newSlug: ${JSON.stringify(r.newSlug)}, kind: ${JSON.stringify(kind)} },`,
  );
}

const file = `// Generated from data/v2/node-aliases.csv by scripts/checks/build-aliases.mjs.
// Do not edit by hand: run \`pnpm build:aliases\` after changing the CSV.
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
${entries.join("\n")}
];
`;

writeFileSync(OUT, file);
console.log(`node-aliases.generated.ts: ${entries.length} aliases written`);
