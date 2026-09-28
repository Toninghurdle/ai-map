"use client";

// The owner's address, assembled from fragments only at click time so the
// full address never sits in the HTML source or the JS bundle as one
// contiguous literal (task brief item 5). Each part on its own is not the
// address, so grepping the built output for the joined string finds
// nothing; the character code sidesteps a literal "@" sitting next to the
// two halves in the source text.
const USER_PARTS = ["Dominic_deane"];
const DOMAIN_PARTS = ["yahoo", "co", "uk"];
const AT = String.fromCharCode(64);

function buildAddress(): string {
  return `${USER_PARTS.join("")}${AT}${DOMAIN_PARTS.join(".")}`;
}

/**
 * "Spotted something wrong? Email Dominic_deane at yahoo dot co dot uk"
 * (docs/about.md), styled as a plain underlined link. The visible text
 * spells the address out in words, which is fine to render directly: it is
 * not the same string a mail client or a scraper would use, and reads
 * exactly as the owner's copy requires. The real `mailto:` is only built and
 * navigated to when the control is activated.
 *
 * `children` lets the About page render this same click-time assembly
 * inline inside the owner's own sentence ("email me at Dominic_deane at
 * yahoo dot co dot uk") without duplicating the address-building logic;
 * every other caller uses the default footer wording.
 */
export function ReportLink({
  subject,
  className,
  children,
}: {
  subject: string;
  className?: string;
  children?: React.ReactNode;
}) {
  function handleActivate() {
    const address = buildAddress();
    const mailto = `mailto:${address}?subject=${encodeURIComponent(`Field map: ${subject}`)}`;
    window.location.href = mailto;
  }

  return (
    <button type="button" className={className ?? "fm-report-link"} onClick={handleActivate}>
      {children ?? "Spotted something wrong? Email Dominic_deane at yahoo dot co dot uk"}
    </button>
  );
}
