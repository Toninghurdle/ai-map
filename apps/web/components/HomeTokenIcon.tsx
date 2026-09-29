import type { HomeToken } from "@/lib/home";

/**
 * The 20px "Who holds it" token icon (docs/design/06-v2-encoding.md, "In the
 * panel": "a 20px token icon"), drawn on its own rather than on a tile, at
 * the larger `tokenIcon` proportions the spec gives: disc radius 0.85R, ring
 * 0.55 of the disc, dot 0.62 of the disc.
 */
export function HomeTokenIcon({ token }: { token: HomeToken }) {
  if (token === "none") return <span className="fm-home-sp" aria-hidden="true" />;

  const size = 20;
  const cx = size / 2;
  const cy = size / 2;
  const discR = 0.85 * (size / 2);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <circle cx={cx} cy={cy} r={discR} fill="var(--fm-frame)" stroke="var(--fm-frame-edge)" strokeWidth={0.8} />
      {token === "field" ? (
        <circle
          cx={cx}
          cy={cy}
          r={0.62 * discR}
          fill="var(--fm-home-field)"
          stroke="var(--fm-home-field-edge)"
          strokeWidth={0.8}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={0.55 * discR}
          fill="none"
          stroke="var(--fm-home-labs)"
          strokeWidth={Math.max(1.1, 0.28 * discR)}
        />
      )}
    </svg>
  );
}
