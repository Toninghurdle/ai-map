import { NextResponse } from "next/server";
import { getMapData } from "@/lib/data";

// Revalidated by tag ("map") when DATA_SOURCE=supabase and a change is
// accepted; this ceiling just bounds staleness in between.
export const revalidate = 60;

// CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
// Data from the AI Safety and Security Field Map, CC BY 4.0. See
// docs/methodology-draft.md and the site's data and licence page for the
// full attribution wording and what the licence does and doesn't cover.
const LICENCE_HEADER =
  "CC-BY-4.0; https://creativecommons.org/licenses/by/4.0/; AI Safety and Security Field Map";

export async function GET() {
  const data = await getMapData();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "X-Licence": LICENCE_HEADER,
    },
  });
}
