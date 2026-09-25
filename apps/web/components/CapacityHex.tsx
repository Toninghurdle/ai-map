import { capacityFillToken, capacityLabel } from "@/lib/capacity";

function hexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = ((-90 + 60 * i) * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

/**
 * A small pointy-top hex coloured by capacity, per docs/design/03-map.md
 * ("the key") and 06-v2-encoding.md (the --fm-cap-* palette). Used on the
 * server-rendered index of every problem and anywhere else a mini tile is
 * needed without the full map.
 */
export function CapacityHex({
  capacity,
  size = 14,
}: {
  capacity: string | undefined;
  size?: number;
}) {
  const r = size / 2;
  const cx = size / 2;
  const cy = size / 2;
  const fill = `var(${capacityFillToken(capacity)})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      className="fm-mini-hex"
    >
      <polygon
        points={hexPoints(cx, cy, r - 0.7)}
        fill={fill}
        stroke="var(--fm-ink)"
        strokeOpacity={0.55}
        strokeWidth={0.7}
      />
      <title>{capacityLabel(capacity)}</title>
    </svg>
  );
}
