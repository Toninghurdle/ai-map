/**
 * The whole map (docs/design/04-interaction.md "Levels": `/map`). The
 * chart markup and the FieldMapMount client component both live in
 * ./layout.tsx, shared with /map/[level]/[slug], so the fieldmap script
 * loads, fetches and calls setData once per page load rather than once
 * per level (FieldMapMount reads the current level and slug from the URL
 * itself). This page renders nothing of its own.
 */
export default function MapPage() {
  return null;
}
