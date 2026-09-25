// Runs before first paint so the page never flashes the wrong theme.
// Reads the same key and values the ThemeToggle component writes
// (docs/design/04-interaction.md: localStorage 'fieldmap-theme', try/catch).
const THEME_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem('fieldmap-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
