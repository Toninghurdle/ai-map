import { redirect } from "next/navigation";

/**
 * /map now lives at "/" (docs/design/03-map.md "Page anatomy, top to
 * bottom": the whole map is the home page). /map/[level]/[slug] is
 * unaffected and keeps working (see app/(map)/map/[level]/[slug]/page.tsx).
 *
 * A temporary (307) redirect on purpose, not a permanent one: /map has
 * never been public, so there is no indexed URL to consolidate, and a 308
 * is cached by browsers indefinitely and is not cleared by a reload. While
 * the URL shape is still settling, that would make moving the map back to
 * /map hard to undo for anyone who had visited. Promote this to
 * permanentRedirect at launch if /map is still gone.
 */
export default function MapPage() {
  redirect("/");
}
