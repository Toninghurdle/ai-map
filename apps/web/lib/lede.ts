// The one-sentence description of the map, used as the page lede
// (docs/design/03-map.md "Title block") and as the default meta
// description (app/layout.tsx). Shared so app/layout.tsx, app/page.tsx and
// app/map/layout.tsx can't drift from each other; the ported script keeps
// its own runtime copy of the same text (packages/fieldmap/src/fieldmap.js,
// buildText()), which is intentionally left alone.
export const LEDE =
  "Every hex is a problem someone could work on. Pink means nobody is working on it yet, gold a little work, green active and dark forest busy. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field.";
