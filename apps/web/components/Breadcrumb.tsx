import Link from "next/link";

export interface BreadcrumbStep {
  label: string;
  href: string;
}

/**
 * docs/design/05-panels-and-pages.md, "Top row: breadcrumb and close": a
 * trail of underlined links ending at the parent of what's open, since the
 * current item is the title below and isn't repeated here. Detail pages
 * have no close button (that belongs to the map's own panel), so this
 * renders only the trail.
 */
export function Breadcrumb({ steps }: { steps: BreadcrumbStep[] }) {
  return (
    <nav className="fm-crumb" aria-label="Breadcrumb">
      {steps.map((step, i) => (
        <span key={step.href} style={{ display: "contents" }}>
          {i > 0 ? <span className="fm-crumb-sep">/</span> : null}
          <Link href={step.href}>{step.label}</Link>
        </span>
      ))}
    </nav>
  );
}
