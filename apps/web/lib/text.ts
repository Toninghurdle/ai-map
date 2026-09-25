/**
 * Renders a count with its noun, getting the singular right:
 * plural(1, "organisation") -> "1 organisation"
 * plural(14, "organisation") -> "14 organisations"
 * plural(0, "problem", "problems") -> "0 problems"
 */
export function plural(n: number, noun: string, pluralNoun?: string): string {
  const word = n === 1 ? noun : (pluralNoun ?? `${noun}s`);
  return `${n} ${word}`;
}

/** "2026-09-24" -> "24 September 2026" (British long date, for the meta line). */
export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
