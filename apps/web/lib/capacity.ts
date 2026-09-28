import type { Capacity } from "./data/types";

/** Tile fill token per capacity, matching docs/design/06-v2-encoding.md. */
export const CAPACITY_FILL_TOKEN: Record<string, string> = {
  none: "--fm-cap-none",
  thin: "--fm-cap-thin",
  active: "--fm-cap-active",
  busy: "--fm-cap-busy",
};

/** The key/panel label for a capacity value, "Not assessed" for anything else. */
export const CAPACITY_LABEL: Record<string, string> = {
  none: "Nobody yet",
  thin: "A little",
  active: "Active",
  busy: "Busy",
};

export function capacityFillToken(capacity: string | undefined): string {
  return CAPACITY_FILL_TOKEN[capacity ?? ""] ?? "--fm-cap-unknown";
}

export function capacityLabel(capacity: string | undefined): string {
  return CAPACITY_LABEL[capacity ?? ""] ?? "Not assessed";
}

export const KNOWN_CAPACITIES: Capacity[] = ["none", "thin", "active", "busy"];

/**
 * The one-line status for a problem in a row or tooltip: the capacity label,
 * with the home token's meaning appended when the tile carries one, for
 * example "Active; another field" or "A little; only frontier labs"
 * (docs/design/06-v2-encoding.md, "Home": "The status line in rows and
 * tooltips appends the token's meaning"; the reference's own statusLine()).
 *
 * This is also what carries capacity to a screen reader: the mini tile is
 * decorative (components/CapacityHex.tsx is aria-hidden), so a row that
 * showed only the tile would convey capacity by colour alone.
 */
export function statusLine(node: { capacity?: string; home?: string[] }): string {
  const label = capacityLabel(node.capacity);
  const home = node.home ?? [];
  if (home.includes("another-field")) return `${label}; another field`;
  if (home.length === 1 && home[0] === "frontier-labs") return `${label}; only frontier labs`;
  return label;
}
