// Fails if any tracked text file contains an em-dash (U+2014).
// Usage: node scripts/checks/no-emdash.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "dist", "out"]);
const TEXT_EXT = new Set([".md", ".mdx", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".css", ".sql", ".csv", ".html", ".yaml", ".yml", ".toml", ".txt"]);
const EM = String.fromCharCode(0x2014);
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (TEXT_EXT.has(extname(name))) {
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => { if (line.includes(EM)) hits.push(`${p}:${i + 1}`); });
    }
  }
}

walk(process.argv[2] ?? ".");
if (hits.length) {
  console.error(`Found ${hits.length} em-dash(es):\n` + hits.join("\n"));
  process.exit(1);
}
console.log("No em-dashes found.");
