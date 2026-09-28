/** docs/design/06-v2-encoding.md, "Connection: panel only". */
export const CONNECTION_LABEL: Record<string, string> = {
  strong: "Strong connection",
  weak: "Weak connection",
  missing: "No connection yet",
};

export const CONNECTION_STOCK_SENTENCE: Record<string, string> = {
  strong: "That field already works closely with AI developers and AI safety.",
  weak: "There is some contact, but little flows between that field and AI developers.",
  missing: "Almost nothing flows between that field and AI developers yet. Building the link is the work.",
};

/** Green for strong, periwinkle for weak and missing. */
export function connectionBorderToken(connection: string | undefined): string {
  return connection === "strong" ? "--fm-cap-active" : "--fm-home-field-edge";
}
