// Fails if any tracked text file contains an em-dash (U+2014).
// Usage: node scripts/checks/no-emdash.mjs
//
// Ignored files are skipped, so the check matches what it says: only files
// that can actually reach the repo are checked. Without this it also read
// build output and the AGENTS.md/CLAUDE.md that `next dev` generates, which
// carry em-dashes we don't control, so the gate failed on any machine that
// had run the dev server.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { spawnSync } from "node:child_process";

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "dist", "out"]);
const TEXT_EXT = new Set([".md", ".mdx", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".css", ".sql", ".csv", ".html", ".yaml", ".yml", ".toml", ".txt"]);
const EM = String.fromCharCode(0x2014);
const hits = [];

const root = process.argv[2] ?? ".";

// One `git check-ignore` call for the whole candidate list: it exits 1 when
// nothing matches, which is not an error here. If git isn't available (a
// tarball, say), nothing is treated as ignored and every file is checked.
function ignoredSet(paths) {
  if (!paths.length) return new Set();
  const res = spawnSync("git", ["check-ignore", "--stdin"], {
    input: paths.join("\n"),
    encoding: "utf8",
    cwd: root,
  });
  if (res.error || res.status > 1) return new Set();
  return new Set(res.stdout.split("\n").filter(Boolean));
}

const candidates = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (TEXT_EXT.has(extname(name))) candidates.push(p);
  }
}

walk(root);
const ignored = ignoredSet(candidates.map((p) => relative(root, p) || p));
for (const p of candidates) {
  if (ignored.has(relative(root, p) || p)) continue;
  const lines = readFileSync(p, "utf8").split("\n");
  lines.forEach((line, i) => { if (line.includes(EM)) hits.push(`${p}:${i + 1}`); });
}
if (hits.length) {
  console.error(`Found ${hits.length} em-dash(es):\n` + hits.join("\n"));
  process.exit(1);
}
console.log("No em-dashes found.");
