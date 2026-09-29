import Link from "next/link";
import { ReportLink } from "@/components/ReportLink";
import { formatLongDate } from "@/lib/text";
import { getMapData } from "@/lib/data";

/**
 * Site footer on every page (task brief item 6): About, the report link,
 * the licence, and the data version and date from getMapData(). Async
 * server component so every route that renders it shares the one call to
 * getMapData() (cached by Next's data cache; see lib/data/index.ts) rather
 * than each page threading version/generated down as props.
 */
export async function SiteFooter() {
  const data = await getMapData();

  return (
    <footer className="fm-footer">
      {/* The rule and the row live on an inner element so the rule lines up
          with the text rather than running the full width of the page box
          (globals.css, ".fm-footer-inner"). */}
      <div className="fm-footer-inner">
        <Link href="/about">About</Link>
        <ReportLink subject="Footer" />
        <span>Data licensed CC BY 4.0</span>
        <span>
          Data version {data.version}, {formatLongDate(data.generated)}
        </span>
      </div>
    </footer>
  );
}
