import { CONNECTION_LABEL, CONNECTION_STOCK_SENTENCE, connectionBorderToken } from "@/lib/connection";
import type { MapNode } from "@/lib/data/types";

/**
 * docs/design/06-v2-encoding.md, "Connection: panel only". Only rendered
 * when `connection` is set and not "not-applicable" (task brief).
 */
export function ConnectionBox({ node }: { node: MapNode }) {
  const connection = node.connection;
  if (!connection || connection === "not-applicable") return null;

  const label = CONNECTION_LABEL[connection];
  if (!label) return null;

  const sentence = node.connection_note || CONNECTION_STOCK_SENTENCE[connection];
  const borderToken = connectionBorderToken(connection);

  return (
    <p
      className="fm-connection-box"
      style={{ ["--fm-connection-border" as string]: `var(${borderToken})` }}
    >
      <b>{label}.</b> {sentence}
    </p>
  );
}
