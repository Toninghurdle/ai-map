import { CapacityHex } from "@/components/CapacityHex";
import type { MapNode } from "@/lib/data/types";

/**
 * docs/design/05-panels-and-pages.md: "Sub-area rows in a layer panel carry
 * a strip under the name: one mini tile per problem, 13px tall, in island
 * order, so the layer panel reads as a small version of the map."
 */
export function CapacityStrip({ nodes }: { nodes: MapNode[] }) {
  return (
    <span className="fm-strip" aria-hidden="true">
      {nodes.map((node) => (
        <CapacityHex key={node.slug} capacity={node.capacity} size={13} />
      ))}
    </span>
  );
}
