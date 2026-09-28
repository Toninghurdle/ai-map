/**
 * Only render a link when the URL actually parses as http or https (task
 * brief: "Evidence and website links only when the URL parses as http or
 * https"). Mirrors the reference implementation's own guard so a stray
 * `javascript:`, a bare string, or a malformed value in the data never
 * becomes a clickable link.
 */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    // Not a parseable URL: fall through to null.
  }
  return null;
}
