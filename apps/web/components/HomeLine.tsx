import { HomeTokenIcon } from "@/components/HomeTokenIcon";
import { homeLine, homeToken } from "@/lib/home";
import type { MapNode } from "@/lib/data/types";

/**
 * docs/design/06-v2-encoding.md, "In the panel": a "Who holds it" line under
 * the status line, with the 20px token icon when there's a token.
 */
export function HomeLine({ node }: { node: MapNode }) {
  if (!node.home.length) return null;
  const token = homeToken(node.home);
  // The labs-only body already ends with its own sentence and full stop
  // (lib/home.ts); the "otherwise" body is a plain comma list that still
  // needs the closing full stop added here.
  const body = homeLine(node);
  const text = token === "labs" ? body : `${body}.`;

  return (
    <p className="fm-home-line">
      <HomeTokenIcon token={token} />
      <span>
        <b>Who holds it:</b> {text}
      </span>
    </p>
  );
}
