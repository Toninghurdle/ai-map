import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The controls that sit at the top right of every page: a small "About this
 * map" link beside the theme button.
 *
 * The About link is in the header as well as the footer because a reader
 * who lands on a shared problem link should be able to find out what the
 * map is, and how far to trust it, without scrolling to the bottom of a
 * long page (docs/about.md, "Before you trust it"). Both are plain controls
 * in the toolbar idiom of docs/design/02-tokens.md: 13px, no icons, square
 * corners.
 */
export function HeaderControls() {
  return (
    <div className="fm-header-controls">
      <Link href="/about" className="fm-about-link">
        About this map
      </Link>
      <ThemeToggle />
    </div>
  );
}
