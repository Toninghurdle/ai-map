"use client";

// The owner's address, assembled from fragments only at click time so the
// full address never sits in the HTML source or the JS bundle as one
// contiguous literal (task brief item 5). Each part on its own is not the
// address, so grepping the built output for the joined string finds
// nothing; the character code sidesteps a literal "@" sitting next to the
// two halves in the source text.
const USER_PARTS = ["dominic_deane"];
const DOMAIN_PARTS = ["yahoo", "co", "uk"];
const AT = String.fromCharCode(64);

function buildAddress(): string {
  return `${USER_PARTS.join("")}${AT}${DOMAIN_PARTS.join(".")}`;
}

/**
 * How the address is written wherever it is shown: the local part, the word
 * "at", then the domain. Not the address a mail client or a scraper would
 * use (no "@"), so it is safe to render directly, and the real mailto: is
 * still only assembled on click.
 */
export const EMAIL_DISPLAY = "dominic_deane at yahoo.co.uk";

/**
 * "Spotted something wrong? Email dominic_deane at yahoo.co.uk", styled as
 * a plain underlined link. The real `mailto:` is only built and navigated
 * to when the control is activated.
 *
 * `children` lets the About page render this same click-time assembly
 * inline inside the owner's own sentence without duplicating the
 * address-building logic; every other caller uses the default wording.
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
      {children ?? `Spotted something wrong? Email ${EMAIL_DISPLAY}`}
    </button>
  );
}
