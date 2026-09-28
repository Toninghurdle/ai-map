# MVP plan

Goal: put the map and its data in front of the first reviewers at ai-map.dominic-deane.com, with every record honestly marked as agent-compiled and a way to capture structured, attributable feedback. Scope is `docs/architecture.md` section 10, adjusted for the owner's decisions in `docs/decisions-v2.md` (no sign-in to contribute).

Each task is one PR. Tick it off here when merged. The agent named is the one to use; the main session reviews with `reviewer` before merging.

## Done in the skeleton (25 September 2026)

- [x] Monorepo, pnpm workspaces, `CLAUDE.md`, agents, settings, `.env.example`
- [x] v2 data in `data/v2`, specs in `docs/`
- [x] Core schema migration: taxonomy, orgs, edges, aliases, lenses, actors, provenance, history trigger, contributions, RLS, public views
- [x] Seed generator `scripts/seed/build-seed.mjs` and the generated v2 seed migration
- [x] `apps/web` scaffold: tokens, Jost (self-hosted via @fontsource), layout, theme toggle, home page with the title block and the server-rendered list of every problem, `/map` placeholder with the map's element IDs, `/data/map.json` route, data loader (static or Supabase)
- [x] `packages/fieldmap` placeholder with the component contract as types

## Owner, before task 1

- [ ] Reset the Supabase database password (it was shared in a chat)
- [ ] `supabase login`, `supabase link --project-ref uxlujfmekclqvigbohry`, then `supabase db push` to apply the schema and seed
- [ ] Vercel: preset Next.js, root directory `apps/web`, env vars from `.env.example`, domain `ai-map.dominic-deane.com`
- [ ] Drop the design reference folder (`reference/` from the design bible: the two HTML files, `src/`, `screens/`, `v2-preview-data.json`) into `docs/design/reference/`

## Tasks

1. **Port the map** (`fieldmap`). Move the reference script into `packages/fieldmap`, keep the standalone build, mount it on `/map` with the site's routing. Checks from `docs/design/07-integration-and-checks.md`.
2. **Data layer** (`site`). `lib/data` reads from Supabase public views when `DATA_SOURCE=supabase`, from `data/v2` when `static`. Cached functions tagged `map`, `node:<slug>`, `org:<id>`. `/data/map.json` served from it.
3. **Panel and detail pages** (`site`). **Partly done (task 3 lite, 28 September 2026).** `/problems/<slug>`, `/areas/<slug>`, `/layers/<slug>` and `/orgs/<id>` are built from the components in `05-panels-and-pages.md`, with the provenance box on every one. Still to do: the map renders its own built-in panel rather than the site rendering the panel from the same components (`panel: true`, see F1 in `docs/design/design-qa-fixes.md`). The built-in panel now carries a "Full page" link to each detail page, so the two are joined up for now. Switching to `panel: false` with `reserveRight: 430` is the remaining half.
4. **Server-rendered index**: the list exists on the home page; move it under the map as the "Every problem, as a list" `details` block once the map is mounted (`site`), per `03-map.md`. **Done** (in task 1; it renders under the chart on every map route).
5. **Redirects** for old slugs through `node_aliases` (`site`). **Done (task 3 lite).** Build-time 308s for `/problems/<old>` and `/areas/<old>` from `next.config.ts`, and the map route resolves an alias before calling `FieldMap.open`, per `07`.
6. **Methodology, data and licence, and about pages** (`site`). Methodology text comes from `docs/methodology-draft.md` once the owner has edited it. `/about` is done (task 3 lite), from `docs/about.md`; methodology and the data and licence page are still to do.
7. **Suggest a change** (`site`, `schema` for any function it needs). **Replaced by email for now (task 3 lite).** Every detail page, `/about` and the site footer carry a "Spotted something wrong?" link that builds a `mailto:` to the owner at click time, so the address is never in the page source. The full form below is deferred until after the first round of feedback. No account; work email or community handle required; Turnstile and honeypot, checked in a server route that then calls `submit_contribution` with the secret key (the function is service-role only); confirmation email via Resend, non-blocking; domain match against `org_domains`. `/admin/inbox` read-only list for the owner, behind Supabase Auth with the admin role.
8. **Exports** (`importer`). Nightly JSON and CSV snapshot, licence and schema doc; downloads page.
9. **Analytics and polish** (`site`). Vercel Web Analytics, the handful of events in architecture section 1, accessibility pass, phone check, cold review. Vercel Web Analytics is mounted (task 3 lite) and needs switching on in the Vercel dashboard; the custom events, the accessibility pass and the cold review are still to do.

## After the MVP

v1 in architecture section 10: change proposals and the review queue, owners and digests, the monitor and discovery agents, products, discussion. Also the evidence pass the owner asked for: every homepage-only tag replaced with a specific page, and released products (for example Apollo Research's Watcher) captured as products linked to problems.
