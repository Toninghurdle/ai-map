# Task 3 lite: first public version

Owner's brief, 28 September 2026. Branch: `task-3-lite`, off `main`. One PR.

## Goal

Get the site to a state Dominic can send to a handful of people for feedback: the map, a readable page for every problem, sub-area, layer and organisation, an About page that explains what this is and how far to trust it, and a way to tell him when something's wrong. The full suggest-a-change form (task 7) is out of scope. Email replaces it for now.

## Read first

1. `CLAUDE.md` (rules, vocabulary, which agent does what)
2. `docs/plan/mvp.md` (what's done)
3. `docs/design/01-principles.md`, `05-panels-and-pages.md` and `07-integration-and-checks.md`
4. `docs/design/qa-fixes.md` (what task 1 already changed, including F1, the built-in panel)
5. `docs/about.md` (the owner's copy for the banner and About page)

## Where things stand

- The hex map is on `/`, mounted once in the shared `app/(map)` layout, with the module's built-in panel switched on (`panel: true`, see F1 in `qa-fixes.md`). Level routes are `/map/<level>/<slug>`.
- All data comes through `getMapData()` in `apps/web/lib/data`, from `data/v2` when `DATA_SOURCE=static` or from the `map_json` RPC when `DATA_SOURCE=supabase`. Use that function for everything below. Don't add new queries or a second data path.
- Nodes, orgs and edges carry provenance fields: `created_by`, `last_verified`, `reviewed_by`, `human_verified`.

## What to build

Use the `site` agent for 1 and 3 to 6, and the `fieldmap` agent for 2. Run the `reviewer` before pushing.

### 1. Detail pages

Server-rendered and statically generated for every record (`generateStaticParams`), with a proper 404 for unknown slugs:

- `/problems/<slug>`: breadcrumb, title, status line, home line and connection box (the v2 rules in `06-v2-encoding.md`), definition, then sections for why it matters, what progress looks like, key agendas, entry points, canonical reference and existing mitigations where present. Then "Who works on it" as organisation cards split into main line and side line, linked problems as rows, and "All n problems in X".
- `/areas/<slug>` and `/layers/<slug>`: as the sub-area and layer panels in `05`, with room for the full definition and scope rule.
- `/orgs/<org_id>`: as the organisation panel in `05`, with every problem it works on and the evidence for each.
- Each page has a small link back to the same thing on the map (`/map/node/<slug>` and so on).
- Use the components and spacing in `05`. Evidence links only when the URL is http or https. Dormant and closed organisations show their status. A problem with no organisations says "No organisation is recorded here yet", never an empty section.
- **Provenance box** on every detail page, built from the record's own fields. Example: "Compiled by AI research agents, 21 September 2026. Last checked 24 September 2026. Not yet reviewed by a person." When `human_verified` is true, say who and when instead. Style it as in `05`: plain bordered paragraph, no icon, no colour.

### 2. "Full page" link in the map panel

In the built-in panel, add a plain underlined "Full page" link next to the title for problems, sub-areas, layers and organisations, going to the matching detail page. It's a small change to `packages/fieldmap`. Mirror it in `docs/design/reference/src/body.html` so the two don't drift. Change nothing else in the module.

### 3. Old-slug redirects

Permanent redirects from every `old_slug` in `node_aliases` to its `new_slug`, for both `/problems/<slug>` and `/map/node/<slug>`. Resolve the alias before calling `FieldMap.open`, per `07`.

### 4. Banner and About page

- `/about` renders the About page section of `docs/about.md`, word for word, laid out as a reading page (single column about 720px, section headings with the 2px rule, as in `05`).
- The banner text from `docs/about.md` sits above the map on `/` as a plain bordered note, with "Read more about it" linking to `/about` and a "Close" button. Remember the dismissal in `localStorage` (key `fieldmap-about-dismissed`, wrapped in try/catch). On phones it mustn't push the map below the first screen by more than the banner's own height; keep it short.

### 5. Contact without exposing the address

- A small `ReportLink` component: shows "Spotted something wrong? Email Dominic_deane at yahoo dot co dot uk", and builds the real `mailto:` in JavaScript only when clicked, with a subject line naming the page (for example "Field map: Scalable oversight"). The plain address must never appear in the HTML or the JS bundle as one string. Assemble it from parts at click time.
- Put it at the foot of every detail page, on the About page and in a site footer.
- Also in the map's built-in panel, if that can be done with the same small hook as the "Full page" link. If not, skip it there; the footer covers it.

### 6. Footer, metadata, sitemap, analytics

- A site footer on every page: About, the report link, "Data licensed CC BY 4.0", and the data version and date from `getMapData()`.
- A page title and description for every page, built from the record. `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- `app/sitemap.ts` listing every detail page and `/about`.
- Vercel Web Analytics (`@vercel/analytics`). Note in the PR that Dominic has to switch it on in the Vercel dashboard.

## Don't

- Change the data, the taxonomy, the map's structure, or anything in `data/`, `supabase/` or `docs/design/` except the one mirror in 2.
- Build the suggest-a-change form, admin, exports, or the site's own map panel.
- Paraphrase the owner's copy in `docs/about.md`.

## Done when

- `pnpm build`, `pnpm lint` and `pnpm check:emdash` pass.
- Every one of the 118 problems, 28 sub-areas, 4 layers and every organisation with at least one edge has a page that builds. The sitemap lists them all.
- Playwright screenshots, read and checked by you: a busy problem, a problem whose home is another field, an organisation, a sub-area, and `/about`, at 1440x900 light and dark and at 390x844. No console errors. The address never appears in the page source.
- The reviewer has checked the diff against `05`, `01` and `CLAUDE.md`, and you've fixed what it found.
- `docs/plan/mvp.md` updated: task 3 partly done (detail pages, built-in panel kept for now), tasks 4 and 5 done, task 7 replaced by email for now.
- Pushed to `task-3-lite` with a PR opened. Report the preview link and anything the owner needs to do.
