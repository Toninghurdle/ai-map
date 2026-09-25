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
      href="#map"
      onClick={(e) => {
        const tile = document.querySelector<SVGGElement>('#map .hex[tabindex="0"]');
        if (!tile) return; // no map yet: let the href fall through to #map
        e.preventDefault();
        tile.focus();
        tile.scrollIntoView({ block: "center", behavior: "smooth" });
      }}
    >
      Skip to the map
    </a>
  );
}
