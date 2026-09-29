import Link from "next/link";

/**
 * docs/design/05-panels-and-pages.md, "Rows": the workhorse list. A row is
 * always a real link (detail pages have nowhere to send a client-side
 * navigation event, unlike the map panel, so this is a plain `<Link>` in an
 * `<li>` rather than a button).
 */
export function Row({
  href,
  icon,
  name,
  sub,
  strip,
  value,
}: {
  href: string;
  icon?: React.ReactNode;
  name: string;
  sub?: string;
  /** The mini-tile strip under a sub-area's name in a layer panel (05, "Rows"). */
  strip?: React.ReactNode;
  value?: string;
}) {
  return (
    <li>
      <Link href={href} className="fm-row">
        {icon !== undefined ? icon : null}
        <span className="fm-row-text">
          <span className="fm-row-name">{name}</span>
          {sub ? <small className="fm-row-sub">{sub}</small> : null}
          {strip}
        </span>
        {value ? <span className="fm-row-value">{value}</span> : null}
      </Link>
    </li>
  );
}

/** The `<ul>` wrapper, with the "plain" variant (no icon column) as a flag. */
export function RowList({
  children,
  plain,
}: {
  children: React.ReactNode;
  plain?: boolean;
}) {
  return <ul className={`fm-rows${plain ? " fm-rows-plain" : ""}`}>{children}</ul>;
}
