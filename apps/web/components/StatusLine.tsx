import { CapacityHex } from "@/components/CapacityHex";
import { capacityLabel } from "@/lib/capacity";
import type { MapNode } from "@/lib/data/types";

/** docs/design/06-v2-encoding.md, "Tile colour: capacity" table. */
const CAPACITY_STOCK_SENTENCE: Record<string, string> = {
  none: "Nobody is working on this yet.",
  thin: "One or two groups or people are working on it.",
  active: "Several groups are working on it, with room for more.",
  busy: "Many groups work on it. Joining one is usually a better move than starting something new.",
};

/**
 * docs/design/05-panels-and-pages.md, "Status line (problems)": a mini
 * tile, the capacity label in 600, a full stop, then one plain sentence.
 * `capacity_note` replaces the stock sentence when present
 * (docs/design/06-v2-encoding.md).
 */
export function StatusLine({ node }: { node: MapNode }) {
  const label = capacityLabel(node.capacity);
  const sentence = node.capacity_note || CAPACITY_STOCK_SENTENCE[node.capacity] || "Coverage has not been assessed yet.";

  return (
    <p className="fm-status-line">
      <CapacityHex capacity={node.capacity} size={20} />
      <span>
        <b>{label}.</b> {sentence}
      </span>
    </p>
  );
}
