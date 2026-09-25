-- Core schema for the AI Safety and Security Field Map.
-- MVP subset of the data model in docs/architecture.md section 3.
-- Left out on purpose (v1): ownerships, comments, comment_reactions, agent_runs,
-- watch_targets, citations, slug_aliases.
--
-- Conventions (architecture section 3):
--   * Primary keys are UUIDs. Human-facing identifiers (slug, org_id) are unique
--     text columns and are never reused.
--   * Every editable content table carries the provenance block: created_by,
--     created_at, created_method, updated_by, updated_at, verified_by, verified_at,
--     verified_method, verification_state, last_checked_at, row_version.
--   * Content tables (layers, subareas, nodes, node_relations, orgs, products,
--     edges) get a row_version trigger and a record_history trigger. Nobody
--     writes them directly except the one-off import and, from v1, apply_proposal.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper functions and triggers, defined first so CREATE TABLE can use them.
-- ---------------------------------------------------------------------------

-- Bumps row_version on every update to a content table.
create or replace function public.set_row_version()
returns trigger
language plpgsql
as $$
begin
  new.row_version := coalesce(old.row_version, 0) + 1;
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_row_version() is
  'Increments row_version and stamps updated_at on every UPDATE of a content table.';

-- Writes a before/after row to record_history on every insert or update of a
-- content table. The applying code sets app.actor_id and app.proposal_id with
-- set_config so this trigger knows who and why; both are optional (null when unset).
create or replace function public.log_record_history()
returns trigger
language plpgsql
as $$
declare
  v_actor_id uuid;
  v_proposal_id uuid;
begin
  begin
    v_actor_id := nullif(current_setting('app.actor_id', true), '')::uuid;
  exception when others then
    v_actor_id := null;
  end;
  begin
    v_proposal_id := nullif(current_setting('app.proposal_id', true), '')::uuid;
  exception when others then
    v_proposal_id := null;
  end;

  if tg_op = 'INSERT' then
    insert into public.record_history (table_name, record_id, op, row_version, before, after, actor_id, proposal_id)
    values (tg_table_name, new.id, 'import', new.row_version, null, to_jsonb(new), coalesce(v_actor_id, new.created_by), v_proposal_id);
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.record_history (table_name, record_id, op, row_version, before, after, actor_id, proposal_id)
    values (tg_table_name, new.id, 'update', new.row_version, to_jsonb(old), to_jsonb(new), coalesce(v_actor_id, new.updated_by), v_proposal_id);
    return new;
  end if;
  return null;
end;
$$;

comment on function public.log_record_history() is
  'Appends a record_history row on INSERT or UPDATE of a content table. Content tables are never hard-deleted; they are retired instead.';

-- ---------------------------------------------------------------------------
-- Actors: every writer, human or agent, is one row here.
-- ---------------------------------------------------------------------------

create table public.actors (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('human', 'agent', 'system')),
  profile_id uuid, -- fk added after profiles exists
  agent_key text unique,
  model text,
  prompt_version text,
  display_name text not null,
  created_at timestamptz not null default now()
);

comment on table public.actors is 'Unifies people and agents so created_by/updated_by is one foreign key whichever made the change.';

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------

create table public.layers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  definition text not null,
  role_line text,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'retired')),
  introduced_in text,
  retired_in text,
  -- provenance block
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1
);

create trigger layers_row_version before update on public.layers
  for each row execute function public.set_row_version();
create trigger layers_history after insert or update on public.layers
  for each row execute function public.log_record_history();

create table public.subareas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  layer_id uuid not null references public.layers (id),
  name text not null,
  definition text not null,
  scope_rule text,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'retired')),
  introduced_in text,
  retired_in text,
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1
);

create index subareas_layer_id_idx on public.subareas (layer_id);

create trigger subareas_row_version before update on public.subareas
  for each row execute function public.set_row_version();
create trigger subareas_history after insert or update on public.subareas
  for each row execute function public.log_record_history();

create table public.nodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  subarea_id uuid not null references public.subareas (id),
  name text not null,
  definition text not null,
  why_it_matters text,
  progress_looks_like text,
  canonical_reference jsonb, -- {title, url, source_id}
  key_agendas jsonb, -- list of {name, url, source_id}
  boundary_notes text,
  tailwind_links text[] not null default '{}',
  capacity text not null check (capacity in ('none', 'thin', 'active', 'busy')),
  capacity_note text,
  home text[] not null default '{}',
  owner_field text,
  connection text not null default 'not-applicable' check (connection in ('not-applicable', 'strong', 'weak', 'missing')),
  connection_note text,
  lenses text[] not null default '{}',
  existing_mitigations text,
  confidence text check (confidence in ('low', 'medium', 'high')),
  reference_needs_replacing boolean not null default false,
  open_problems_source jsonb, -- {title, url, source_id}
  entry_points text,
  legacy_batch text,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'retired')),
  introduced_in text,
  retired_in text,
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1,
  constraint nodes_home_values check (home <@ array['independent-ai-safety', 'frontier-labs', 'government', 'commercial', 'academia', 'another-field']::text[]),
  constraint nodes_lenses_values check (lenses <@ array['loss-of-control', 'agents', 'democracy', 'defensive-technology', 'open-source', 'critical-infrastructure']::text[]),
  -- connection is not-applicable unless home includes another-field
  constraint nodes_connection_requires_another_field check (
    connection = 'not-applicable' or 'another-field' = any (home)
  )
);

create index nodes_subarea_id_idx on public.nodes (subarea_id);
create index nodes_capacity_idx on public.nodes (capacity);
create index nodes_home_idx on public.nodes using gin (home);
create index nodes_lenses_idx on public.nodes using gin (lenses);
create index nodes_status_idx on public.nodes (status);

create trigger nodes_row_version before update on public.nodes
  for each row execute function public.set_row_version();
create trigger nodes_history after insert or update on public.nodes
  for each row execute function public.log_record_history();

create table public.node_relations (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes (id),
  related_node_id uuid not null references public.nodes (id),
  kind text not null default 'related' check (kind in ('related')),
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1,
  constraint node_relations_no_self_link check (node_id <> related_node_id),
  constraint node_relations_unique unique (node_id, related_node_id)
);

create index node_relations_node_id_idx on public.node_relations (node_id);
create index node_relations_related_node_id_idx on public.node_relations (related_node_id);

create trigger node_relations_row_version before update on public.node_relations
  for each row execute function public.set_row_version();
create trigger node_relations_history after insert or update on public.node_relations
  for each row execute function public.log_record_history();

-- Maps a v2 node slug that was merged or renamed to its current slug, so old
-- links and API callers redirect. Not a content table: no provenance block.
create table public.node_aliases (
  old_slug text primary key,
  new_slug text not null references public.nodes (slug),
  change text,
  created_at timestamptz not null default now()
);

create table public.lens_definitions (
  slug text primary key check (slug in ('loss-of-control', 'agents', 'democracy', 'defensive-technology', 'open-source', 'critical-infrastructure')),
  name text not null,
  definition text not null,
  sort_order integer not null default 0
);

create table public.taxonomy_releases (
  version text primary key,
  status text not null default 'draft' check (status in ('draft', 'published')),
  released_at timestamptz,
  released_by uuid references public.actors (id),
  notes text,
  changelog jsonb,
  snapshot_path text,
  git_tag text
);

-- Small key-value store for the taxonomy's top-level metadata (scope,
-- display_rules, node_tests, version, generated) so map_json (migration
-- 20260925000010) can return them without a bespoke table per key.
create table public.site_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organisations, products and edges
-- ---------------------------------------------------------------------------

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null unique,
  name text not null,
  url text,
  type text,
  parent_org_id uuid references public.orgs (id),
  hq_country text,
  hq_city text,
  region text,
  founded_year integer,
  size_band text,
  funding_model text,
  commercial_model text,
  primary_focus text,
  focus_tags text[] not null default '{}',
  problem_description text,
  notable_outputs text,
  status text not null default 'unknown' check (status in ('active', 'dormant', 'closed', 'unknown')),
  confidence text check (confidence in ('low', 'medium', 'high')),
  approachability text[] not null default '{}',
  record_origin text,
  notes text,
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1,
  constraint orgs_approachability_values check (
    approachability <@ array['hiring', 'fellowship-or-programme', 'open-to-collaborators', 'contact-form', 'publishes-open-problems', 'closed']::text[]
  )
);

create index orgs_status_idx on public.orgs (status);
create index orgs_parent_org_id_idx on public.orgs (parent_org_id);
create index orgs_focus_tags_idx on public.orgs using gin (focus_tags);

create trigger orgs_row_version before update on public.orgs
  for each row execute function public.set_row_version();
create trigger orgs_history after insert or update on public.orgs
  for each row execute function public.log_record_history();

-- Used for contribution email-domain matching. Shared-parent domains (a
-- university, a government department) verify the parent, not one group.
create table public.org_domains (
  domain text primary key,
  org_id uuid not null references public.orgs (id),
  kind text not null default 'primary' check (kind in ('primary', 'alias', 'shared-parent')),
  added_by uuid references public.actors (id),
  added_at timestamptz not null default now()
);

create index org_domains_org_id_idx on public.org_domains (org_id);

-- Empty for the MVP; the site and importer can start filling this in v1.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  org_id uuid not null references public.orgs (id),
  name text not null,
  kind text check (kind in ('software-tool', 'library', 'benchmark', 'dataset', 'evaluation-suite', 'service', 'standard-or-framework', 'model', 'other')),
  url text,
  description text,
  released_on date,
  availability text check (availability in ('open-source', 'free', 'commercial', 'restricted')),
  licence text,
  status text not null default 'active' check (status in ('active', 'deprecated', 'discontinued')),
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1
);

create index products_org_id_idx on public.products (org_id);

create trigger products_row_version before update on public.products
  for each row execute function public.set_row_version();
create trigger products_history after insert or update on public.products
  for each row execute function public.log_record_history();

-- ---------------------------------------------------------------------------
-- Sources and evidence
-- ---------------------------------------------------------------------------

-- One row per URL, shared by every record that cites it. Snapshots (when
-- taken, in v1) are private: they exist to re-check claims, not to republish
-- other people's pages. Not a content table in the provenance sense: it has
-- its own fetch-lifecycle columns instead.
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  url_normalised text not null unique,
  domain text,
  title text,
  first_seen_at timestamptz not null default now(),
  fetched_at timestamptz,
  http_status integer,
  content_hash text,
  snapshot_path text,
  archive_url text,
  check_status text not null default 'never-fetched' check (check_status in ('ok', 'changed', 'moved', 'gone', 'blocked', 'js-only', 'never-fetched')),
  last_checked_at timestamptz,
  fetched_by uuid references public.actors (id)
);

create index sources_domain_idx on public.sources (domain);

-- Data-quality flags on any record. Not itself a versioned content row.
create table public.record_flags (
  id uuid primary key default gen_random_uuid(),
  record_table text not null,
  record_id uuid not null,
  flag text not null,
  note text,
  raised_by uuid references public.actors (id),
  raised_at timestamptz not null default now(),
  resolved_by uuid references public.actors (id),
  resolved_at timestamptz
);

create index record_flags_record_idx on public.record_flags (record_table, record_id);

-- Edges: exactly one of org_id, product_id. A product edge does not imply an
-- org edge; the UI shows "via <product>" under the org.
create table public.edges (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs (id),
  product_id uuid references public.products (id),
  node_id uuid not null references public.nodes (id),
  role text not null check (role in ('primary', 'secondary')),
  evidence_source_id uuid references public.sources (id),
  evidence_url text not null,
  evidence_note text,
  evidence_strength text not null default 'unrated' check (evidence_strength in ('strong', 'moderate', 'weak', 'unrated')),
  status text not null default 'current' check (status in ('current', 'historical')),
  legacy_batch text,
  created_by uuid references public.actors (id),
  created_at timestamptz not null default now(),
  created_method text check (created_method in ('import', 'agent-research', 'agent-monitor', 'agent-discovery', 'human-edit', 'contribution')),
  updated_by uuid references public.actors (id),
  updated_at timestamptz,
  verified_by uuid references public.actors (id),
  verified_at timestamptz,
  verified_method text check (verified_method in ('review-accept', 'spot-check', 'owner-attest')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'needs-recheck', 'disputed')),
  last_checked_at timestamptz,
  row_version integer not null default 1,
  constraint edges_exactly_one_target check (
    (org_id is not null and product_id is null) or (org_id is null and product_id is not null)
  ),
  constraint edges_org_node_unique unique (org_id, node_id),
  constraint edges_product_node_unique unique (product_id, node_id)
);

create index edges_node_id_idx on public.edges (node_id);
create index edges_org_id_idx on public.edges (org_id);
create index edges_product_id_idx on public.edges (product_id);
create index edges_evidence_source_id_idx on public.edges (evidence_source_id);

create trigger edges_row_version before update on public.edges
  for each row execute function public.set_row_version();
create trigger edges_history after insert or update on public.edges
  for each row execute function public.log_record_history();

-- ---------------------------------------------------------------------------
-- Provenance, proposals and history
-- ---------------------------------------------------------------------------

-- Append-only. Written by the log_record_history trigger on every content
-- table, and (from v1) by apply_proposal.
create table public.record_history (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  op text not null check (op in ('import', 'create', 'update', 'retire', 'delete', 'merge')),
  row_version integer,
  before jsonb,
  after jsonb,
  actor_id uuid references public.actors (id),
  proposal_id uuid, -- fk added after change_proposals exists
  at timestamptz not null default now()
);

create index record_history_record_idx on public.record_history (table_name, record_id);
create index record_history_at_idx on public.record_history (at);

-- The unit of review, from v1 onwards. The table exists in the MVP schema so
-- contributions has somewhere to point once triage starts; apply_proposal
-- itself is v1 work.
create table public.change_proposals (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id uuid,
  op text not null check (op in ('create', 'update', 'retire', 'delete', 'merge')),
  patch jsonb not null,
  base_row_version integer,
  rationale text,
  evidence jsonb,
  proposed_by uuid references public.actors (id),
  agent_run_id uuid,
  contribution_id uuid, -- fk added after contributions exists
  release_label text,
  confidence text check (confidence in ('low', 'medium', 'high')),
  priority text not null default 'normal' check (priority in ('normal', 'urgent')),
  dedupe_key text,
  scope_node_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'needs-info', 'accepted', 'rejected', 'superseded', 'stale', 'withdrawn')),
  assigned_to uuid,
  reviewed_by uuid references public.actors (id),
  decision_note text,
  decided_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create index change_proposals_target_idx on public.change_proposals (target_table, target_id);
create index change_proposals_status_idx on public.change_proposals (status);
create unique index change_proposals_pending_dedupe_idx on public.change_proposals (dedupe_key) where status = 'pending';

alter table public.record_history
  add constraint record_history_proposal_id_fkey foreign key (proposal_id) references public.change_proposals (id);

-- Decided proposals are immutable: further changes of mind are new proposals.
create or replace function public.enforce_proposal_immutability()
returns trigger
language plpgsql
as $$
begin
  if old.status not in ('pending', 'needs-info') then
    raise exception 'change_proposals: proposal % is already decided (status %) and cannot be changed', old.id, old.status;
  end if;
  return new;
end;
$$;

create trigger change_proposals_immutable before update on public.change_proposals
  for each row execute function public.enforce_proposal_immutability();

-- Append-only log of every status change and comment on a proposal.
create table public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.change_proposals (id),
  event text not null,
  actor_id uuid references public.actors (id),
  note text,
  at timestamptz not null default now()
);

create index proposal_events_proposal_id_idx on public.proposal_events (proposal_id);

-- ---------------------------------------------------------------------------
-- People and no-account contributions
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id),
  handle text unique,
  display_name text,
  email_domain text,
  verified_org_id uuid references public.orgs (id),
  verification_method text check (verification_method in ('email-domain', 'manual', 'none')),
  verified_at timestamptz,
  community_handles jsonb not null default '{}'::jsonb,
  stated_affiliation text,
  show_affiliation boolean not null default false,
  role text not null default 'member' check (role in ('member', 'trusted', 'owner', 'admin')),
  status text not null default 'active' check (status in ('active', 'limited', 'banned')),
  accepted_contributions integer not null default 0,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.actors
  add constraint actors_profile_id_fkey foreign key (profile_id) references public.profiles (id);

-- No account required: at least one of contact_email or contact_handle is
-- required at insert. The row is written immediately with no confirmed_at;
-- submit_contribution (migration 20260925000010) sets domain_matched_org_id.
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  target_table text,
  target_id uuid,
  kind text not null check (kind in ('incorrect', 'missing-org', 'missing-product', 'missing-evidence', 'outdated', 'wrong-tag', 'other')),
  field text,
  suggested_value text,
  evidence_url text,
  body text,
  contact_email text,
  contact_handle text,
  confirmed_at timestamptz,
  domain_matched_org_id uuid references public.orgs (id),
  author_id uuid references public.profiles (id),
  author_snapshot jsonb,
  is_self_report boolean not null default false,
  credit_opt_in boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted', 'triaged', 'converted', 'accepted', 'declined', 'spam')),
  proposal_id uuid references public.change_proposals (id),
  handled_by uuid references public.actors (id),
  handled_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint contributions_needs_a_contact check (
    (contact_email is not null and length(trim(contact_email)) > 0)
    or (contact_handle is not null and length(trim(contact_handle)) > 0)
  )
);

create index contributions_status_idx on public.contributions (status);
create index contributions_target_idx on public.contributions (target_table, target_id);
create index contributions_domain_matched_org_id_idx on public.contributions (domain_matched_org_id);

-- change_proposals.contribution_id can now be a real foreign key.
alter table public.change_proposals
  add constraint change_proposals_contribution_id_fkey foreign key (contribution_id) references public.contributions (id);
