# AI Safety and Security Field Map

A public, problem-first map of the AI safety and security field: what the problems are, how much work is happening on each, and who is doing it. Built for people entering the field.

Live at https://ai-map.dominic-deane.com (once deployed). Data CC BY 4.0, code MIT.

## Start here

- `CLAUDE.md`: how this repo works, the rules, and which agent does what
- `docs/plan/mvp.md`: what's done and what's next
- `docs/architecture.md`: the build spec
- `docs/design/`: the design bible

## Run it

```
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

With `DATA_SOURCE=static` the site reads `data/v2` and needs no database. With `DATA_SOURCE=supabase` it reads the linked Supabase project.

## Database

```
supabase login
supabase link --project-ref uxlujfmekclqvigbohry
supabase db push
```

That applies the schema, RLS and the v2 seed. `supabase/TESTING.md` records how the migrations were tested.
