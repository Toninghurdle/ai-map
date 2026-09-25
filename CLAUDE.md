# AI Safety and Security Field Map

A public, problem-first map of the AI safety and security field. The problems people work on are arranged as layers, then sub-areas, then problem nodes, and organisations are attached to each problem as evidence of who works on it. It's for people entering the field: knowledgeable, not expert, trying to see what the problems are, where there's room, and who to contact.

Owner: Dominic Deane. Site: https://ai-map.dominic-deane.com. Data licence CC BY 4.0, code MIT.

## Read these before changing anything

| Doc | What it's for |
|---|---|
| `docs/architecture.md` | The build spec. Components, data model, contribution flow, security, phased plan. Section 10 is the MVP scope |
| `docs/design/` | The design bible for the map and every page. `README.md` first, then `01-principles.md` and `06-v2-encoding.md` |
| `docs/decisions-v2.md` | The owner's decisions on the v2 taxonomy and the site |
| `docs/methodology-draft.md` | The public methodology page, awaiting the owner's edit. Its rules are binding on data work |
| `docs/data-v2-report.md` | How the v2 data was built and what's known to be weak |
| `docs/plan/mvp.md` | The MVP task list, in order, with who does what |

## Repo layout

```
apps/web            Next.js (App Router, TypeScript). Public site, route handlers, later /admin
packages/fieldmap   The hex map as a module. Port of the reference implementation; don't rewrite it
packages/db         Generated Supabase types and shared zod schemas
supabase/migrations Schema, RLS, functions, triggers, and the generated v2 seed
scripts/seed        Generator that turns data/v2 into the seed migration
data/v2             The v2 dataset as compiled on 24 September 2026. Source for the first import only
docs/               Specs. Treat as read-only unless the task is to change a spec
```

## Stack and commands

pnpm workspaces, Node 22. Supabase (Postgres, Auth for admin and owners only, Storage). Vercel for hosting, root directory `apps/web`.

```
pnpm install
pnpm dev                          # apps/web on localhost:3000
pnpm build                        # must pass before any PR
pnpm seed:build                   # regenerate the seed migration from data/v2
supabase db push                  # apply migrations to the linked project
supabase gen types typescript --linked > packages/db/src/database.types.ts
```

## Rules that apply to every change

1. **Postgres is the source of truth.** `data/v2` is only the first import. After that, content changes go through `change_proposals` and the `apply_proposal` function (architecture section 3), never direct table writes from app code.
2. **Agents propose, people accept.** Nothing an agent finds reaches the public site without a person accepting it. No auto-apply for content, ever.
3. **Every organisation tag has an evidence URL.** No URL, no tag. Never invent a URL, an organisation or a person.
4. **Provenance on every record.** Who or what made it, when, how, and whether a person has verified it. The site shows it.
5. **Empty and thin problems are kept and shown.** Never hide a node because nobody works on it.
6. **No sign-in to contribute.** Suggestions need a reachable contact (work email or community handle), are stored immediately as unconfirmed, and are weighted, not gated. Supabase Auth is for admin and owners only.
7. **Secrets never go in the repo.** Only `NEXT_PUBLIC_*` values and the publishable key may appear in code or `.env.example`. Service keys, the database password and tokens live in `.env.local` and Vercel settings.
8. **Writing.** British English. No em-dashes anywhere, in code, copy or data (`pnpm check:emdash` must pass). Activity words, never progress words: a problem is busy, never "covered", "crowded" or "solved". No "Explore", "Discover" or exclamation marks.
9. **Design.** Follow `docs/design/`. One typeface (Jost), the tokens in `docs/design/tokens.css`, square corners, no gradients, no icons on tiles. Don't rebuild the map in React; wrap `packages/fieldmap`.
10. **Slugs are permanent.** Node slugs like `model.alignment.scalable-oversight` never change meaning. Renames and merges go through `node_aliases` and redirect.

## Data vocabulary (exact spellings)

- `capacity`: none, thin, active, busy
- `home` (array): independent-ai-safety, frontier-labs, government, commercial, academia, another-field
- `connection`: strong, weak, missing, not-applicable (not-applicable unless home includes another-field)
- `edges.role`: primary, secondary
- `orgs.status`: active, dormant, closed, unknown
- `lenses`: loss-of-control, agents, democracy, defensive-technology, open-source, critical-infrastructure

## How to work here

The main session orchestrates and reviews; subagents in `.claude/agents/` do the building. Use them:

- `schema` for migrations, RLS, functions and generated types
- `importer` for the seed generator and anything that moves data into Postgres
- `site` for pages, components and route handlers in `apps/web`
- `fieldmap` for porting and wrapping the hex map
- `data-researcher` for research on organisations and problems; it can only produce change proposals
- `reviewer` before merging anything: it checks the diff against the architecture doc, the design bible and the rules above

Work in small PRs, one task from `docs/plan/mvp.md` at a time. Run `pnpm build` and the checks in `docs/design/07-integration-and-checks.md` before opening one.
