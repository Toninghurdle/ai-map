import Link from "next/link";
import { approachabilityChips, orgMeta } from "@/lib/org-meta";
import { safeUrl } from "@/lib/safe-url";
import type { MapEdge, MapOrg } from "@/lib/data/types";

/**
 * docs/design/05-panels-and-pages.md, "Organisation card". Used under "Who
 * works on it" on a problem page, one card per edge (an org can have both a
 * primary and a secondary edge to different problems, but only one edge to
 * the problem this card is rendered under).
 */
export function OrganisationCard({ org, edge }: { org: MapOrg; edge: MapEdge }) {
  const site = safeUrl(org.url);
  const evidenceUrl = safeUrl(edge.evidence_url);
  const chips = approachabilityChips(org.approachability);
  const hasEvidence = Boolean(edge.evidence_note || evidenceUrl);

  return (
    <li className="fm-org-card">
      <div className="fm-org-top">
        <Link href={`/orgs/${org.org_id}`} className="fm-org-name">
          {org.name}
        </Link>
        {/* The visible words stay "Website" and "Source" (docs/design/05,
            "Organisation card"); aria-label only adds which organisation, so
            a screen reader's link list isn't a run of identical entries. */}
        {site ? (
          <a
            className="fm-org-site"
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${org.name} website`}
          >
            Website
          </a>
        ) : null}
      </div>
      <p className="fm-org-meta">{orgMeta(org)}</p>
      {chips.length ? (
        <p className="fm-org-open">
          {chips.map((chip) => (
            <span key={chip.key} className={`fm-chip${chip.actNow ? " fm-chip-act-now" : ""}`}>
              {chip.label}
            </span>
          ))}
        </p>
      ) : null}
      {hasEvidence ? (
        <details className="fm-org-evidence">
          <summary>Why it&apos;s listed</summary>
          <p>
            {edge.evidence_note}
            {evidenceUrl ? (
              <>
                {" "}
                <a
                  href={evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Source for ${org.name}`}
                >
                  Source
                </a>
              </>
            ) : null}
          </p>
        </details>
      ) : null}
    </li>
  );
}
