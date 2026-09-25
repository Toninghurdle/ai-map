# Local testing of the core schema, RLS and v2 seed

Run on 25 September 2026 against a scratch Postgres 16 cluster (no Docker or
Supabase CLI available in this environment), as `.claude/agents/schema.md`
allows: "otherwise apply the migrations to a scratch Postgres 16 with stub
`anon`, `authenticated` and `service_role` roles and an `auth` schema".

## 1. Start Postgres and create the scratch database

```
pg_ctlcluster 16 main start
su postgres -c psql -c 'create database ai_map_test;'
```

Result: cluster online (PostgreSQL 16.13), database created.

## 2. Stub roles and an `auth` schema

```sql
-- as postgres, in ai_map_test
do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
```

Result: roles and `auth.uid()` created; `auth.uid()` returns null by default,
matching an unauthenticated request.

## 3. Apply the three migrations, in order

```
psql -d ai_map_test -f supabase/migrations/20260925000000_core_schema.sql
psql -d ai_map_test -f supabase/migrations/20260925000010_rls_and_api.sql
psql -d ai_map_test -f supabase/migrations/20260925000100_seed_v2.sql
```

Result: all three applied with no errors (`CREATE TABLE` / `CREATE INDEX` /
`CREATE TRIGGER` / `CREATE POLICY` / `CREATE FUNCTION` / `INSERT 0 1` for
every statement). The seed applied in under 2 seconds.

## 4. Row counts match data/v2

```sql
select 'layers', count(*) from public.layers
union all select 'subareas', count(*) from public.subareas
union all select 'nodes', count(*) from public.nodes
union all select 'node_relations', count(*) from public.node_relations
union all select 'node_aliases', count(*) from public.node_aliases
union all select 'lens_definitions', count(*) from public.lens_definitions
union all select 'taxonomy_releases', count(*) from public.taxonomy_releases
union all select 'orgs', count(*) from public.orgs
union all select 'org_domains', count(*) from public.org_domains
union all select 'products', count(*) from public.products
union all select 'sources', count(*) from public.sources
union all select 'edges', count(*) from public.edges
union all select 'actors', count(*) from public.actors
union all select 'site_meta', count(*) from public.site_meta;
```

Result:

| Table | Count |
|---|---|
| layers | 4 |
| subareas | 28 |
| nodes | **118** |
| node_relations | 492 |
| node_aliases | 14 (1 of the 15 rows in node-aliases.csv is a sub-area merge, not a node alias, and is skipped; see build-seed.mjs's summary output) |
| lens_definitions | **6** |
| taxonomy_releases | 1 (version 2.0) |
| orgs | **358** |
| org_domains | 339 (19 orgs skipped: no usable url, an explicitly shared host, or a host used by more than one org) |
| products | 0 (empty for the MVP, as specified) |
| sources | 551 (distinct evidence_url values across 670 edges) |
| edges | **670** |
| actors | 2 (the Sept 2026 compile, and the v2 taxonomy build) |
| site_meta | 5 (version, generated, scope, display_rules, node_tests) |

All the counts the task calls out (118 nodes, 358 orgs, 670 edges, 4 layers,
6 lens definitions) match.

## 5. `map_json()` matches data/v2/map-data.json

```sql
select public.map_json();
```

Captured to a file and compared against `data/v2/map-data.json` with a
Python script:

- Layer, sub-area and node slug sets: **identical** (118 node slugs on both
  sides).
- Org id set: **identical** (358 on both sides).
- Edge `(org_id, node_slug)` pair set: **identical** (670 on both sides).
- Lens definition slug set: **identical** (6 on both sides).
- Spot check on `model.alignment.scalable-oversight`: `related`, `capacity`,
  `home` and `connection` match the source file exactly; `human_verified` is
  `false` and `created_by` is `"agent: research agents, Sept 2026 compile"`,
  which is correct since nothing imported is marked human-verified.

`map_json()`'s node/org/edge objects use the field list the importer task
specifies (`created_by` as the actor's display name, `last_verified` derived
from `last_checked_at`, `human_verified` as `verification_state = 'verified'`)
rather than byte-for-byte reproducing the source file's own bespoke
`created_by`/`reviewed_by` label strings, which are not modelled as schema
columns; see the seed's summary output and this repo's importer agent notes
for that decision.

## 6. RLS as `anon`

```sql
set role anon;
select count(*) from public.nodes;        -- 118 rows: published content is readable
select count(*) from public.contributions; -- ERROR: permission denied for table contributions
```

Result: matches the spec exactly (`select` on nodes succeeds, `select` on
contributions is denied).

## 7. `submit_contribution()` as anon

```sql
set role anon;

-- email on a domain in org_domains: matches
select public.submit_contribution(
  'nodes', null, 'missing-evidence', 'entry_points', 'Add a new fellowship',
  'https://80000hours.org/careers/', 'Saw this on the careers page.',
  'jo@80000hours.org', null, true, 'abc123hash'
);

-- handle only, no email: succeeds
select public.submit_contribution(
  'nodes', null, 'other', null, null, null, 'Just a note.',
  null, 'discord:jo#1234', false, null
);

-- neither contact: fails
select public.submit_contribution(
  'nodes', null, 'other', null, null, null, 'Just a note.',
  null, null, false, null
);
```

Result:

- Email case: succeeded, returned a new id. Checked
  `select domain_matched_org_id from contributions` against `orgs`: resolved
  to `80-000-hours`, the org whose `org_domains` row is `80000hours.org`.
- Handle-only case: succeeded, `contact_email` and `domain_matched_org_id`
  both null.
- Neither case: raised `submit_contribution: a contact_email or a
  contact_handle is required`, no row inserted.
- `select insert on public.contributions` was confirmed unavailable to
  `anon` directly (RLS has no insert policy for it, and the table-level
  grant is revoked), so `submit_contribution()` is the only way in.

## 8. Admin access to contributions

```sql
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'admin@example.com');
insert into public.profiles (id, role) values ('11111111-1111-1111-1111-111111111111', 'admin');
create or replace function auth.uid() returns uuid language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;
set role authenticated;
select count(*) from public.contributions; -- 2: is_admin() lets an admin see everything
```

Result: 2 (both contributions from step 7), confirming `is_admin()` and the
admin select/update policies on `contributions` work. `auth.uid()` was reset
back to returning null afterwards.

## 9. Provenance trigger and the connection constraint

```sql
update public.nodes set capacity_note = capacity_note || ' (checked)'
  where slug = 'model.alignment.scalable-oversight';
-- row_version: 1 -> 2; record_history gained an 'update' row alongside the
-- original 'import' row.

insert into public.nodes (slug, subarea_id, name, definition, capacity, home, connection)
values ('test.bad.node', (select id from public.subareas limit 1), 'Bad', 'def', 'thin', array['academia'], 'weak');
-- ERROR: new row for relation "nodes" violates check constraint
-- "nodes_connection_requires_another_field"
```

Both as expected.

## 10. Re-applying the seed changes nothing

```
psql -d ai_map_test -f supabase/migrations/20260925000100_seed_v2.sql
```

Result: every statement returned `INSERT 0 1` (`ON CONFLICT ... DO NOTHING`
matched the existing row) or `INSERT 0 0`, no errors, and the row counts from
step 4 were unchanged afterwards. Runtime data written during testing (the
two contributions and the admin profile) was untouched.

`scripts/seed/build-seed.mjs` was also run twice in a row and its output
file diffed byte-for-byte identical, confirming the generator itself is
deterministic given the same `data/v2` input.

## Cleanup

The scratch database (`ai_map_test`) and its stub roles were left in place in
this environment for any follow-up checks; they are not part of the repo and
are safe to drop (`drop database ai_map_test;`).

## 11. Change after review (25 September 2026)

`submit_contribution` is no longer callable by `anon` or `authenticated`. Only `service_role` may execute it, so every suggestion goes through the site's server route, which verifies Turnstile, rate-limits and hashes the IP before calling it with the secret key. Otherwise anyone could post straight to the REST API and skip those checks. Authenticated keeps UPDATE on `contributions` (RLS limits it to admins) so the admin inbox policy works; the earlier blanket revoke had removed it.

Re-tested on a fresh database with all three migrations: as `anon`, `submit_contribution` raises `permission denied`; as `service_role` it inserts, and `domain_matched_org_id` resolves `a@80000hours.org` to `80-000-hours`. Counts unchanged (118 nodes, 358 orgs, 670 edges), `map_json()` still returns 670 edges as `anon`.
