/**
 * docs/design/05-panels-and-pages.md, "Section heading": 15px 600 with a
 * 2px ink rule above, an optional right-hand count or note in 13.5px ink-3.
 */
export function SectionHeading({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <h2 className="fm-section-heading">
      <span>{children}</span>
      {note ? <span className="fm-count">{note}</span> : null}
    </h2>
  );
}
