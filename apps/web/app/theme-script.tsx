// Runs before first paint so the page never flashes the wrong theme, and so
// a reader who has already closed the About banner never sees it paint and
// then vanish.
//
// Both read localStorage, which only exists on the client, so both have to
// happen here rather than in a component: the server can't know either
// answer, and a client effect runs after the first paint, which is the
// flash itself. The theme keys are docs/design/04-interaction.md's; the
// banner key is the task brief's ('fieldmap-about-dismissed'), and the
// attribute it stamps is what globals.css's ".fm-banner" rule hides on
// (components/AboutBanner.tsx owns the same key on the write side).
const THEME_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem('fieldmap-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
  try {
    if (localStorage.getItem('fieldmap-about-dismissed') === '1') {
      document.documentElement.setAttribute('data-about-dismissed', '1');
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
