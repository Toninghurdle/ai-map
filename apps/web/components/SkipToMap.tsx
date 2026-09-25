"use client";

/**
 * "Skip to the map", the first focusable element on the page: visually
 * hidden until it takes focus, then shown top-left (docs/design/design-qa-fixes.md
 * F9).
 *
 * Without it a keyboard user passes the theme button, six key rows, four
 * layer buttons, the search box and the toolbar buttons before reaching a
 * tile: 21 stops. Inside the map the tiles themselves are one stop, because
 * they use a roving tabindex (docs/design/04-interaction.md, Keyboard), so
 * this link is what makes "one press to the map" true.
 *
 * It moves focus to the tile that currently holds the roving tabindex, which
 * is the map's own idea of where you are: the last tile focused, or the
 * first tile of the first sub-area, or the open problem
 * (packages/fieldmap/src/fieldmap.js, setRoving). Reading it from the DOM
 * rather than through FieldMap keeps the ported module unchanged; there is
 * only ever one tile at tabindex="0".
 */
export function SkipToMap() {
  return (
    <a
      className="fm-skip"
      // #map-wrap, not #map: the wrapper carries tabindex=-1, so even before
      // this component has hydrated (when the browser follows the href itself
      // rather than running onClick) the reader lands on a focusable element
      // instead of losing focus to <body>.
      href="#map-wrap"
      onClick={(e) => {
        // The roving tile if the map has drawn; otherwise the map wrapper, which
        // carries tabindex=-1 for exactly this case. Falling through to the bare
        // #map href would scroll there and leave focus on this link, so someone
        // told they had skipped to the map would have nothing focused.
        const target =
          document.querySelector<SVGGElement>('#map .hex[tabindex="0"]') ??
          document.getElementById("map-wrap");
        if (!target) return;
        e.preventDefault();
        target.focus();
        // Matches the module's own scrolls (packages/fieldmap/src/fieldmap.js),
        // which all gate smooth behaviour on the reduced-motion preference.
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      }}
    >
      Skip to the map
    </a>
  );
}
