/**
 * The whole map (docs/design/03-map.md "Page anatomy, top to bottom"). The
 * chart markup, FieldMapMount and the server-rendered problem list all live
 * in ./layout.tsx, shared with /map/[level]/[slug]: the list belongs on
 * every map route, not only here (docs/design/design-qa-fixes.md F6), and
 * the map itself loads and calls setData once per page load rather than once
 * per route.
 *
 * So this route adds nothing of its own. It exists because "/" needs a page
 * for the layout to wrap.
 */
export default function HomePage() {
  return null;
}
