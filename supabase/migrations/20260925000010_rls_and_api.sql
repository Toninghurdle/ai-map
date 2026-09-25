-- Row Level Security and the public API surface for the AI Safety and
-- Security Field Map. Builds on 20260925000000_core_schema.sql.
--
-- Summary:
--   * RLS is enabled on every table.
--   * anon and authenticated may SELECT published content (not retired).
--   * org_domains is never public.
--   * contributions, profiles, record_history, change_proposals,
--     proposal_events, record_flags and actors have no anon or authenticated
--     access; contributions is written only through submit_contribution,
--     which only the service role (the site's server route) may call.
--   * is_admin() lets an admin profile select and update contributions.
--   * public.map_json() returns the whole dataset in the data/v2/map-data.json
--     shape, for /data/map.json.

-- ---------------------------------------------------------------------------
-- Base privileges. RLS policies below are the real access control, but a
-- role needs the underlying object privilege before a policy is even
-- consulted, so grant the minimum each role needs. (A hosted Supabase
-- project grants broadly to anon/authenticated by default; this migration
-- does not assume that and sets out what it needs explicitly, which is also
-- what a scratch Postgres for local testing requires.)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.layers, public.subareas, public.nodes, public.node_relations,
  public.node_aliases, public.lens_definitions, public.orgs, public.edges,
  public.products, public.sources
to anon, authenticated;

grant select, update on public.contributions to authenticated;
grant select on public.taxonomy_releases, public.site_meta to authenticated;
grant select, update on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere.
-- ---------------------------------------------------------------------------

alter table public.actors enable row level security;
alter table public.layers enable row level security;
alter table public.subareas enable row level security;
alter table public.nodes enable row level security;
alter table public.node_relations enable row level security;
alter table public.node_aliases enable row level security;
alter table public.lens_definitions enable row level security;
alter table public.taxonomy_releases enable row level security;
alter table public.site_meta enable row level security;
alter table public.orgs enable row level security;
alter table public.org_domains enable row level security;
alter table public.products enable row level security;
alter table public.sources enable row level security;
alter table public.record_flags enable row level security;
alter table public.edges enable row level security;
alter table public.record_history enable row level security;
alter table public.change_proposals enable row level security;
alter table public.proposal_events enable row level security;
alter table public.profiles enable row level security;
alter table public.contributions enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin(): reads profiles.role for the calling user. Used by policies and
-- can be called from the site's server code too.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True when the calling user (auth.uid()) has profiles.role = admin. security definer so it can read profiles despite RLS.';

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Published content: readable by anon and authenticated.
-- "Published" means status <> 'retired' where a table has that column; tables
-- without a status column, or whose status enum has no retired value, are
-- read in full.
-- ---------------------------------------------------------------------------

create policy layers_select_published on public.layers
  for select to anon, authenticated
  using (status <> 'retired');

create policy subareas_select_published on public.subareas
  for select to anon, authenticated
  using (status <> 'retired');

create policy nodes_select_published on public.nodes
  for select to anon, authenticated
  using (status <> 'retired');

create policy node_relations_select_all on public.node_relations
  for select to anon, authenticated
  using (true);

create policy node_aliases_select_all on public.node_aliases
  for select to anon, authenticated
  using (true);

create policy lens_definitions_select_all on public.lens_definitions
  for select to anon, authenticated
  using (true);

create policy orgs_select_all on public.orgs
  for select to anon, authenticated
  using (true);

-- edges has no "retired" state (current, historical); both are shown, and
-- the site distinguishes historical evidence in the UI.
create policy edges_select_all on public.edges
  for select to anon, authenticated
  using (true);

-- products is empty for the MVP; same reasoning as edges above (its status
-- enum is active, deprecated, discontinued, none of which is "retired").
create policy products_select_all on public.products
  for select to anon, authenticated
  using (true);

-- sources: public columns only, via a view (no private snapshot data exists
-- in the MVP schema anyway, so this is a straight passthrough for now).
create policy sources_select_all on public.sources
  for select to anon, authenticated
  using (true);

-- org_domains is never public: no anon or authenticated select policy here.
-- It is read only by submit_contribution (security definer, below) and by
-- admins directly against the table (service role in Studio for the MVP).

-- ---------------------------------------------------------------------------
-- Locked down: no anon or authenticated policies. Everything here is either
-- internal governance data or requires an admin, which the functions below
-- provide.
-- ---------------------------------------------------------------------------
-- actors, record_history, change_proposals, proposal_events, record_flags,
-- profiles, contributions, org_domains, taxonomy_releases, site_meta:
-- RLS is enabled above with no permissive policy for anon/authenticated, so
-- every row is hidden from them by default. Admins reach these tables today
-- through Supabase Studio (service_role, which bypasses RLS); the policies
-- below add authenticated-admin access to contributions specifically, per
-- the MVP inbox page.

create policy contributions_admin_select on public.contributions
  for select to authenticated
  using (public.is_admin());

create policy contributions_admin_update on public.contributions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A signed-in admin may also read taxonomy_releases and site_meta directly
-- (useful in Studio-adjacent tooling); nobody else can.
create policy taxonomy_releases_admin_select on public.taxonomy_releases
  for select to authenticated
  using (public.is_admin());

create policy site_meta_admin_select on public.site_meta
  for select to authenticated
  using (public.is_admin());

-- A person may see and update their own profile, but never change their own
-- role, status or verification fields; only an admin (or the service role)
-- can do that. Enforced by trigger below, not just the policy, because an
-- RLS "with check" cannot compare individual columns to their old values.
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create or replace function public.enforce_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
    or new.status is distinct from old.status
    or new.verification_method is distinct from old.verification_method
    or new.verified_at is distinct from old.verified_at
    or new.verified_org_id is distinct from old.verified_org_id
  then
    raise exception 'profiles: only an admin can change role, status or verification fields';
  end if;
  return new;
end;
$$;

create trigger profiles_self_update_guard before update on public.profiles
  for each row execute function public.enforce_profile_self_update();

-- ---------------------------------------------------------------------------
-- submit_contribution(): the only way anon (or authenticated) writes to
-- contributions. Validates inputs, looks up domain_matched_org_id, and
-- inserts with status = 'submitted'. Direct INSERT on contributions is
-- revoked from anon and authenticated below.
-- ---------------------------------------------------------------------------

create or replace function public.submit_contribution(
  p_target_table text,
  p_target_id uuid,
  p_kind text,
  p_field text,
  p_suggested_value text,
  p_evidence_url text,
  p_body text,
  p_contact_email text,
  p_contact_handle text,
  p_credit_opt_in boolean,
  p_ip_hash text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text := nullif(trim(p_contact_email), '');
  v_handle text := nullif(trim(p_contact_handle), '');
  v_domain text;
  v_matched_org_id uuid;
begin
  if p_kind is null or p_kind not in (
    'incorrect', 'missing-org', 'missing-product', 'missing-evidence', 'outdated', 'wrong-tag', 'other'
  ) then
    raise exception 'submit_contribution: kind must be one of incorrect, missing-org, missing-product, missing-evidence, outdated, wrong-tag, other';
  end if;

  if v_email is null and v_handle is null then
    raise exception 'submit_contribution: a contact_email or a contact_handle is required';
  end if;

  if v_email is not null and (length(v_email) > 320 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'submit_contribution: contact_email does not look like an email address';
  end if;

  if v_handle is not null and length(v_handle) > 200 then
    raise exception 'submit_contribution: contact_handle is too long';
  end if;

  if p_field is not null and length(p_field) > 200 then
    raise exception 'submit_contribution: field is too long';
  end if;

  if p_suggested_value is not null and length(p_suggested_value) > 2000 then
    raise exception 'submit_contribution: suggested_value is too long';
  end if;

  if p_body is not null and length(p_body) > 2000 then
    raise exception 'submit_contribution: body must be at most 2,000 characters';
  end if;

  if p_evidence_url is not null and length(trim(p_evidence_url)) > 0 then
    if p_evidence_url !~* '^https?://' then
      raise exception 'submit_contribution: evidence_url must start with http:// or https://';
    end if;
    if length(p_evidence_url) > 2048 then
      raise exception 'submit_contribution: evidence_url is too long';
    end if;
  end if;

  if v_email is not null then
    v_domain := lower(split_part(v_email, '@', 2));
    select org_id into v_matched_org_id
    from public.org_domains
    where domain = v_domain
    limit 1;
  end if;

  insert into public.contributions (
    target_table, target_id, kind, field, suggested_value, evidence_url, body,
    contact_email, contact_handle, domain_matched_org_id, credit_opt_in,
    status, ip_hash
  ) values (
    p_target_table, p_target_id, p_kind, p_field, p_suggested_value, nullif(trim(p_evidence_url), ''), p_body,
    v_email, v_handle, v_matched_org_id, coalesce(p_credit_opt_in, false),
    'submitted', nullif(trim(p_ip_hash), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.submit_contribution is
  'Entry point for "suggest a change". Validates inputs, matches the contact email domain against org_domains, and inserts a contributions row with status submitted. No sign-in required from the contributor, but only the service role may call it: the site''s server route verifies Turnstile, applies rate limits and hashes the IP first, then calls this with the secret key. Exposing it to anon would let anyone bypass those checks through the REST API.';

revoke execute on function public.submit_contribution(
  text, uuid, text, text, text, text, text, text, text, boolean, text
) from public, anon, authenticated;
grant execute on function public.submit_contribution(
  text, uuid, text, text, text, text, text, text, text, boolean, text
) to service_role;

-- No direct inserts or deletes on contributions by anyone but the service
-- role. Authenticated keeps UPDATE so the admin policy above can work; RLS
-- limits it to admins.
revoke insert, delete on public.contributions from anon, authenticated;
revoke update on public.contributions from anon;

-- ---------------------------------------------------------------------------
-- map_json(): the whole dataset in the data/v2/map-data.json shape, for
-- /data/map.json. Stable (read-only within a transaction) and granted to
-- anon so the route handler can call it as the anon role.
-- ---------------------------------------------------------------------------

create or replace function public.map_json()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with node_related as (
    select
      nr.node_id,
      jsonb_agg(rn.slug order by rn.slug) as related
    from public.node_relations nr
    join public.nodes rn on rn.id = nr.related_node_id
    group by nr.node_id
  ),
  node_json as (
    select
      n.subarea_id,
      n.sort_order,
      jsonb_build_object(
        'slug', n.slug,
        'name', n.name,
        'definition', n.definition,
        'why_it_matters', n.why_it_matters,
        'progress_looks_like', n.progress_looks_like,
        'canonical_reference', n.canonical_reference,
        'key_agendas', coalesce(n.key_agendas, '[]'::jsonb),
        'boundary_notes', n.boundary_notes,
        'related', coalesce(nr2.related, '[]'::jsonb),
        'tailwind_links', to_jsonb(n.tailwind_links),
        'capacity', n.capacity,
        'capacity_note', n.capacity_note,
        'home', to_jsonb(n.home),
        'owner_field', n.owner_field,
        'connection', n.connection,
        'connection_note', n.connection_note,
        'lenses', to_jsonb(n.lenses),
        'existing_mitigations', n.existing_mitigations,
        'open_problems_source', n.open_problems_source,
        'entry_points', n.entry_points,
        'created_by', ca.display_name,
        'last_verified', to_char(n.last_checked_at, 'YYYY-MM-DD'),
        'human_verified', (n.verification_state = 'verified')
      ) as node
    from public.nodes n
    left join node_related nr2 on nr2.node_id = n.id
    left join public.actors ca on ca.id = n.created_by
    where n.status <> 'retired'
  ),
  subarea_json as (
    select
      s.layer_id,
      s.sort_order,
      jsonb_build_object(
        'slug', s.slug,
        'name', s.name,
        'definition', s.definition,
        'scope_rule', s.scope_rule,
        'nodes', coalesce(
          (select jsonb_agg(nj.node order by nj.sort_order)
           from node_json nj where nj.subarea_id = s.id),
          '[]'::jsonb
        )
      ) as subarea
    from public.subareas s
    where s.status <> 'retired'
  ),
  layer_json as (
    select
      jsonb_build_object(
        'slug', l.slug,
        'name', l.name,
        'definition', l.definition,
        'role_line', l.role_line,
        'subareas', coalesce(
          (select jsonb_agg(sj.subarea order by sj.sort_order)
           from subarea_json sj where sj.layer_id = l.id),
          '[]'::jsonb
        )
      ) as layer
    from public.layers l
    where l.status <> 'retired'
    order by l.sort_order
  ),
  org_json as (
    select jsonb_agg(
      jsonb_build_object(
        'org_id', o.org_id,
        'name', o.name,
        'url', o.url,
        'type', o.type,
        'hq_country', o.hq_country,
        'region', o.region,
        'funding_model', o.funding_model,
        'commercial_model', o.commercial_model,
        'approachability', to_jsonb(o.approachability),
        'status', o.status,
        'notes', o.notes,
        'created_by', ca.display_name,
        'last_verified', to_char(o.last_checked_at, 'YYYY-MM-DD'),
        'human_verified', (o.verification_state = 'verified')
      ) order by o.org_id
    ) as orgs
    from public.orgs o
    left join public.actors ca on ca.id = o.created_by
  ),
  edge_json as (
    select jsonb_agg(
      jsonb_build_object(
        'org_id', oo.org_id,
        'node_slug', en.slug,
        'role', e.role,
        'evidence_url', e.evidence_url,
        'evidence_note', e.evidence_note,
        'created_by', ca.display_name,
        'last_verified', to_char(e.last_checked_at, 'YYYY-MM-DD'),
        'human_verified', (e.verification_state = 'verified')
      ) order by oo.org_id, en.slug
    ) as edges
    from public.edges e
    join public.nodes en on en.id = e.node_id
    left join public.orgs oo on oo.id = e.org_id
    left join public.actors ca on ca.id = e.created_by
  )
  select jsonb_build_object(
    'version', (select value from public.site_meta where key = 'version'),
    'generated', (select value from public.site_meta where key = 'generated'),
    'scope', (select value from public.site_meta where key = 'scope'),
    'display_rules', (select value from public.site_meta where key = 'display_rules'),
    'node_tests', (select value from public.site_meta where key = 'node_tests'),
    'lens_definitions', (
      select jsonb_object_agg(ld.slug, ld.definition order by ld.sort_order)
      from public.lens_definitions ld
    ),
    'layers', coalesce((select jsonb_agg(lj.layer) from layer_json lj), '[]'::jsonb),
    'orgs', coalesce((select orgs from org_json), '[]'::jsonb),
    'edges', coalesce((select edges from edge_json), '[]'::jsonb)
  );
$$;

comment on function public.map_json() is
  'Whole dataset in the data/v2/map-data.json shape, read by /data/map.json. security definer so it can read site_meta, actors and lens_definitions regardless of caller.';

grant execute on function public.map_json() to anon, authenticated;
