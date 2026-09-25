import type { NextConfig } from "next";
import path from "node:path";

// The app lives at apps/web inside the pnpm workspace, but it needs to read
// data/v2/map-data.json from the repo root and to work with pnpm's linked
// node_modules across the monorepo. Vercel's root directory is apps/web, so
// point both the file tracer and Turbopack at the actual workspace root.
const workspaceRoot = path.join(__dirname, "../../");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
