import { formatLongDate } from "./text";
import type { Provenance } from "./data/types";

export type { Provenance };

/**
 * "agent-2026-09-21" and "v2-build-2026-09-24" both read as "AI research
 * agents", with the date taken from the field itself rather than hard-coded,
 * so a future run of either generator (or a new one following the same
 * "<name>-<date>" shape) still renders sensibly.
 */
function readableCreator(createdBy: string | undefined): { who: string; when: string | null } {
  if (!createdBy) return { who: "AI research agents", when: null };
  const match = createdBy.match(/(\d{4})-(\d{2})-(\d{2})/);
  const when = match ? formatLongDate(match[0]) : null;
  return { who: "AI research agents", when };
}

/**
 * The provenance box copy (docs/design/05-panels-and-pages.md, "the
 * provenance box"; task brief section A). Built from the record's own four
 * fields, never a static string, so a future human-verified record renders
 * differently without a code change.
 */
export function provenanceText(record: Provenance): string {
  const lastVerified = record.last_verified ? formatLongDate(record.last_verified) : null;

  if (record.human_verified && record.reviewed_by) {
    return lastVerified
      ? `Checked by ${record.reviewed_by}, ${lastVerified}.`
      : `Checked by ${record.reviewed_by}.`;
  }

  const { who, when } = readableCreator(record.created_by);
  const compiled = when ? `Compiled by ${who}, ${when}.` : `Compiled by ${who}.`;
  const checked = lastVerified ? ` Last checked ${lastVerified}.` : "";
  return `${compiled}${checked} Not yet reviewed by a person.`;
}

/**
 * Provenance for a layer or a sub-area. Neither carries per-record
 * provenance fields in the v2 data (only nodes, orgs and edges do), so the
 * box reports on the taxonomy as a whole and keeps CLAUDE.md rule 4 rather
 * than showing nothing.
 *
 * Both dates come from the dataset's own `generated` stamp, so the next
 * import moves them without a code change; `created_by` carries that date
 * for readableCreator to read, rather than a literal that would go stale
 * and then render a date the data no longer claims.
 */
export function taxonomyProvenance(generated: string): Provenance {
  return {
    created_by: `v2-build-${generated}`,
    last_verified: generated,
    reviewed_by: null,
    human_verified: false,
  };
}
