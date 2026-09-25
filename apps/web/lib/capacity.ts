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
