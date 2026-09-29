import { provenanceText, type Provenance } from "@/lib/provenance";

/**
 * docs/design/05-panels-and-pages.md, "Provenance box": a plain bordered
 * paragraph, no icon, no colour. It's information, not a warning.
 */
export function ProvenanceBox({ record }: { record: Provenance }) {
  return <p className="fm-provenance">{provenanceText(record)}</p>;
}
