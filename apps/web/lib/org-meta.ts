import type { MapOrg } from "./data/types";

/** docs/design/reference org card copy ("ORG_TYPE"): readable labels for org.type. */
const ORG_TYPE_LABEL: Record<string, string> = {
  "nonprofit-research": "Research nonprofit",
  "for-profit-startup": "Startup",
  "field-building": "Field-building",
  government: "Government",
  nonprofit: "Nonprofit",
  academic: "Academic",
  "think-tank": "Think tank",
  advocacy: "Advocacy",
  "lab-safety-team": "Lab safety team",
  funder: "Funder",
  "standards-body": "Standards body",
  vc: "Investor",
  "individual-led-project": "Individual project",
  media: "Media",
};

/** docs/design/reference ("ORG_STATUS"): only non-active statuses are shown. */
const ORG_STATUS_LABEL: Record<string, string> = {
  closed: "Closed",
  dormant: "Dormant",
  unknown: "Status unknown",
};

function orgTypeLabel(type: string): string {
  return ORG_TYPE_LABEL[type] ?? type;
}

/**
 * "Type · country" (or region if country is missing or "other"/"unknown"),
 * plus "Dormant", "Closed" or "Status unknown" when relevant
 * (docs/design/05-panels-and-pages.md, "Organisation card").
 */
export function orgMeta(org: MapOrg): string {
  const bits = [orgTypeLabel(org.type)];
  const isPlaceholder = (v: string | undefined) => !v || /^(other|unknown)$/i.test(v);
  if (!isPlaceholder(org.hq_country)) bits.push(org.hq_country as string);
  else if (!isPlaceholder(org.region)) bits.push(org.region as string);
  const statusLabel = ORG_STATUS_LABEL[org.status];
  if (statusLabel) bits.push(statusLabel);
  return bits.filter(Boolean).join(" · ");
}

/** docs/design/reference ("APPROACH"): label and whether it's an act-now chip. */
const APPROACHABILITY: Record<string, { label: string; actNow: boolean }> = {
  hiring: { label: "Hiring", actNow: true },
  "fellowship-or-programme": { label: "Fellowship or programme", actNow: true },
  "open-to-collaborators": { label: "Open to collaborators", actNow: true },
  "contact-form": { label: "Contact form", actNow: true },
  "publishes-open-problems": { label: "Publishes open problems", actNow: false },
  closed: { label: "Not taking approaches", actNow: false },
};

export interface ApproachabilityChip {
  key: string;
  label: string;
  actNow: boolean;
}

/**
 * `approachability` is semicolon-separated in the data but the type also
 * allows an array (CLAUDE.md facts); "unknown" and any other unrecognised
 * value are dropped rather than shown as a chip, matching the reference's
 * own filter.
 */
export function approachabilityChips(value: string | string[] | undefined): ApproachabilityChip[] {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(";");
  const chips: ApproachabilityChip[] = [];
  for (const item of raw) {
    const key = item.trim();
    const entry = APPROACHABILITY[key];
    if (entry) chips.push({ key, ...entry });
  }
  return chips;
}
