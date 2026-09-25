# 01. Principles

## Who it's for and what it has to do

The reader is someone entering AI safety and security. In the first few seconds they should be able to see what the problem areas are, what each one is made of, and how much work is happening on each part. One click later they should know who works on a problem and how to reach them.

Everything in the design serves three questions, in this order:

1. What are the problem areas? The layers and sub-areas, read as a geography.
2. What's in each one, and how busy is it? Every problem is a tile, coloured by how much work there is.
3. Who works on this, and can I get involved? The panel lists organisations, split into main line and side line, with their openness tags and a link.

The owner's standing worry is that the top level becomes convoluted. When in doubt, show less at the top and put detail one click down.

## The visual direction

The map is drawn like a board game in the palette of the CATAN New Energies expansion (sampled from catan.com/new-energies; only the colours are used, none of the art, logo or type). The structure underneath comes from an atlas plate: a neatline frame, grid references round the edge, and a key that counts every problem. The two meet in a map that looks friendly and physical but still reads as a serious reference.

What that means in practice:

- **Hex tiles with cream frames on a cyan sea.** Each problem is a tile; each sub-area is an island of tiles; islands sit in shallow water that deepens away from land.
- **One meaning per channel.** Tile colour is how much work there is. A small token on the tile says who holds it (v2). Relationships are lines, and only appear when asked for.
- **Gaps are an affirmative colour.** Pink marks problems nobody works on. A gap must never look like missing data or a grey placeholder.
- **Isotype counting in the key.** The key is 118 small hexes (or however many problems there are), counted out by category, so the reader sees proportions without reading a number.
- **One typeface.** Jost, a Futura revival, in 400, 500, 600 and 700, with italic only for layer role lines and the panel role line.
- **Square and flat.** 2px corner radius on controls, 1px or 2px ink rules, hard offset shadows (4px 4px 0), no blur shadows, no gradients.

## What to avoid

The styling went through a round specifically to stop it looking AI-generated. These are the tells that were removed. Don't bring them back:

- A big italic serif number or stat as decoration.
- Small monospaced, letter-spaced, uppercase labels over everything. (The only letter-spaced uppercase is the layer names on the map and in the index, which is a map-lettering convention.)
- IBM Plex, Space Grotesk, Inter, Playfair, or any second typeface.
- Pill buttons, rounded cards with hairline borders, soft drop shadows, glassy blur.
- A helper subtitle under every heading. A heading says what the section is; a count on the right is enough.
- Breadcrumbs doubled by an eyebrow above the title.
- Dotted dividers, decorative icons, emoji.
- Purple gradients, cream-and-sage, or cream-with-terracotta palettes.
- Copy that narrates the design ("This map uses colour to show...") or announces insights.

Also avoid, for the map itself:

- Numbers or icons on tiles. Counts live in the key, the tooltip and the panel.
- Drawing every relationship at rest. It turned the first version into a hairball.
- More than one colour meaning per tile. Earlier versions mixed "how busy" and "who holds it" in one palette and readers couldn't tell them apart.
- Flipping the colour ramp in dark mode. Tiles keep their hues in both themes, like physical tiles.

## Writing

All visible text follows these rules:

- British English (organisation, prioritisation, colour).
- No em-dashes anywhere, including the data displayed. Use a full stop, a comma or a colon.
- Plain words about activity, never about progress. "Busy" means many organisations work on it, not that it's solved. Never say "solved", "covered" or "crowded" in the interface.
- Counts in words with their noun: "14 organisations", "1 problem", "6 problems in Cyberattacks". Use `plural(n, 'organisation')` style helpers so singulars are right.
- Headings are nouns or short questions: "Who works on it", "Linked problems", "Who holds it". No colons, no trailing punctuation.
- Button and link text says where it goes: "All 6 problems in Cyberattacks", "Whole map", "Show all 33".
- No exclamation marks, no "Let's", no "Explore", no "Discover".

The layer role lines ("The thing being built", "People turning it against the world", "The world adapting", "What the other three stand on") are part of the voice. In v2 they come from `layers.role_line`. The Harmful use layer's role line may need rewording once the layer definition covers lawful state use; that's a content decision for the owner, not a design one.
