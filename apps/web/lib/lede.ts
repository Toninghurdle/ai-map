// The one-sentence description of the map, used as the page lede
// (docs/design/03-map.md "Title block") and as the default meta
// description (app/layout.tsx). Shared so app/layout.tsx and
// app/(map)/layout.tsx can't drift from each other; the ported script keeps
// its own runtime copy of the same text (packages/fieldmap/src/fieldmap.js,
// ledeText()), which the two must be kept in step with.
//
// Two versions, because the lede describes what is actually on the map: the
// map only has pink tiles when some problem is at capacity "none", and
// promising pink when there is none sends a newcomer looking for something
// that isn't there (docs/design/06-v2-encoding.md, "The key for v2", and
// docs/design/design-qa-fixes.md F5).

const LEDE_WITH_NONE =
  "Every hex is a problem someone could work on. Pink means nobody is working on it yet, gold a little work, green active and dark forest busy. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field.";

const LEDE_WITHOUT_NONE =
  "Every hex is a problem someone could work on. Gold means a little work, green active and dark forest busy, and right now every problem has someone on it. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field.";

/**
 * The lede for a map where `hasNone` says whether any problem sits at
 * capacity "none". The script recomputes the same text on the client once
 * the data loads, so this is what a reader sees before hydration and what a
 * crawler sees; the two must agree, or the sentence changes under the
 * reader.
 */
export function ledeFor(hasNone: boolean): string {
  return hasNone ? LEDE_WITH_NONE : LEDE_WITHOUT_NONE;
}

/**
 * The generic version, for the site-wide meta description in app/layout.tsx,
 * which covers pages beyond the map and shouldn't depend on today's counts.
 */
export const LEDE = LEDE_WITH_NONE;
