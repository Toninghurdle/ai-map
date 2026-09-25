#!/usr/bin/env node
// Reads data/v2 and writes supabase/migrations/20260925000100_seed_v2.sql.
//
// Deterministic: given the same files in data/v2, this script always writes
// byte-identical SQL (no wall-clock timestamps, no random ids; every date
// comes from the data itself or from the fixed compile date below).
// Idempotent: every statement in the generated migration is an upsert keyed
// on a natural key (slug, org_id, url_normalised, ...), so applying the
// migration twice changes nothing.
//
// See .claude/agents/importer.md and docs/architecture.md sections 3, 7, 9.
// Node 22, no dependencies: only node:fs, node:path, node:url.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'v2');
const OUT_FILE = path.join(ROOT, 'supabase', 'migrations', '20260925000100_seed_v2.sql');

// The v2 compile has no per-record date for layers, subareas, org_domains and
// sources (they are structural or derived, not individually dated records).
// Use the dataset's own "generated" date rather than the current wall clock,
// so the output stays deterministic.
const FIXED_DATE = '2026-09-24T00:00:00Z';

const COMPILE_ACTOR_KEY = 'compile-2026-09';
const COMPILE_ACTOR_NAME = 'agent: research agents, Sept 2026 compile';
const V2_BUILD_ACTOR_KEY = 'v2-build-2026-09-24';
const V2_BUILD_ACTOR_NAME = 'agent: v2 taxonomy build, Sept 2026';

// Built from its code point, not typed literally, so this file itself never
// contains the character `pnpm check:emdash` is scanning the repo for.
const EM_DASH = String.fromCharCode(0x2014);

const ORG_DOMAIN_SKIP_HOSTS = new Set([
  'github.io',
  'substack.com',
  'medium.com',
  'google.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
  'gov.uk',
]);

const APPROACHABILITY_VALUES = new Set([
  'hiring',
  'fellowship-or-programme',
  'open-to-collaborators',
  'contact-form',
  'publishes-open-problems',
  'closed',
]);
const HOME_VALUES = new Set([
  'independent-ai-safety',
  'frontier-labs',
  'government',
  'commercial',
  'academia',
  'another-field',
]);
const LENS_VALUES = new Set([
  'loss-of-control',
  'agents',
  'democracy',
  'defensive-technology',
  'open-source',
  'critical-infrastructure',
]);
const CAPACITY_VALUES = new Set(['none', 'thin', 'active', 'busy']);
const CONNECTION_VALUES = new Set(['strong', 'weak', 'missing', 'not-applicable']);
const EDGE_ROLE_VALUES = new Set(['primary', 'secondary']);
const ORG_STATUS_VALUES = new Set(['active', 'dormant', 'closed', 'unknown']);

// ---------------------------------------------------------------------------
// Tiny CSV parser. data/v2's CSV files have no embedded newlines inside
// quoted fields (checked against the raw line count), so a line-based parser
// is enough; it still handles quoted commas and doubled quotes correctly.
// ---------------------------------------------------------------------------

function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}

// ---------------------------------------------------------------------------
// SQL literal helpers
// ---------------------------------------------------------------------------

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function sqlBool(v) {
  if (v === null || v === undefined) return 'NULL';
  return v ? 'TRUE' : 'FALSE';
}

function sqlInt(v) {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  return `ARRAY[${arr.map(sqlStr).join(', ')}]::text[]`;
}

function sqlJsonb(value) {
  if (value === null || value === undefined) return 'NULL';
  return `${sqlStr(JSON.stringify(value))}::jsonb`;
}

function sqlSubquery(table, col, value, selectCol = 'id') {
  return `(SELECT ${selectCol} FROM public.${table} WHERE ${col} = ${sqlStr(value)})`;
}

function actorSubquery(createdByLabel) {
  const key = createdByLabel === V2_BUILD_ACTOR_KEY ? V2_BUILD_ACTOR_KEY : COMPILE_ACTOR_KEY;
  return sqlSubquery('actors', 'agent_key', key);
}

function createdAtLiteral(record) {
  if (record && record.last_verified) return sqlStr(`${record.last_verified}T00:00:00Z`);
  return sqlStr(FIXED_DATE);
}

function emptyToNull(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
}

function cleanUnknown(v) {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  if (t === '' || t.toLowerCase() === 'unknown') return null;
  return v;
}

function titleCaseFromSlug(slug) {
  const words = slug.split('-');
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');
}

function hostOf(urlStr) {
  try {
    const u = new NodeURL(urlStr);
    let h = u.hostname.toLowerCase();
    if (h.startsWith('www.')) h = h.slice(4);
    return h || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Load data/v2
// ---------------------------------------------------------------------------

const mapData = JSON.parse(readFileSync(path.join(DATA_DIR, 'map-data.json'), 'utf8'));
const orgsCsv = parseCsv(readFileSync(path.join(DATA_DIR, 'orgs.csv'), 'utf8'));
const edgesCsv = parseCsv(readFileSync(path.join(DATA_DIR, 'edges.csv'), 'utf8'));
const nodeAliasesCsv = parseCsv(readFileSync(path.join(DATA_DIR, 'node-aliases.csv'), 'utf8'));
// org-aliases.csv is read only to confirm there is nothing left to redirect:
// the merges it records are already applied in map-data.json and orgs.csv
// (checked below). There is no org-alias table in this MVP schema (that is
// slug_aliases, v1 scope), so this file otherwise has no import step.
const orgAliasesCsv = parseCsv(readFileSync(path.join(DATA_DIR, 'org-aliases.csv'), 'utf8'));

// ---------------------------------------------------------------------------
// Validate before writing anything. Fail loudly with the offending rows.
// ---------------------------------------------------------------------------

const errors = [];
const notes = []; // non-fatal, reported in the summary

// 1. No em dashes anywhere in the source data.
function scanEmDash(value, where) {
  if (typeof value === 'string') {
    if (value.includes(EM_DASH)) errors.push(`em dash (U+2014) in ${where}: ${JSON.stringify(value)}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scanEmDash(v, `${where}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) scanEmDash(v, `${where}.${k}`);
  }
}
scanEmDash(mapData, 'map-data.json');
[
  ['orgs.csv', orgsCsv],
  ['edges.csv', edgesCsv],
  ['node-aliases.csv', nodeAliasesCsv],
  ['org-aliases.csv', orgAliasesCsv],
].forEach(([name, rows]) => {
  rows.forEach((row, i) => scanEmDash(row, `${name} row ${i + 2}`)); // +2: header is row 1
});

// 2. Build slug sets and cross-check the structural shape.
const layerSlugs = new Set(mapData.layers.map((l) => l.slug));
const subareaSlugs = new Set();
const nodeSlugs = new Set();
mapData.layers.forEach((layer) => {
  layer.subareas.forEach((sub) => {
    subareaSlugs.add(sub.slug);
    sub.nodes.forEach((n) => nodeSlugs.add(n.slug));
  });
});

// 3. Node-level enum and structural checks.
mapData.layers.forEach((layer) => {
  layer.subareas.forEach((sub) => {
    sub.nodes.forEach((node) => {
      if (!CAPACITY_VALUES.has(node.capacity)) {
        errors.push(`node ${node.slug}: invalid capacity "${node.capacity}"`);
      }
      if (!CONNECTION_VALUES.has(node.connection)) {
        errors.push(`node ${node.slug}: invalid connection "${node.connection}"`);
      }
      (node.home || []).forEach((h) => {
        if (!HOME_VALUES.has(h)) errors.push(`node ${node.slug}: invalid home value "${h}"`);
      });
      (node.lenses || []).forEach((l) => {
        if (!LENS_VALUES.has(l)) errors.push(`node ${node.slug}: invalid lens "${l}"`);
      });
      const hasAnotherField = (node.home || []).includes('another-field');
      if (node.connection !== 'not-applicable' && !hasAnotherField) {
        errors.push(
          `node ${node.slug}: connection "${node.connection}" is set but home does not include another-field`
        );
      }
      (node.related || []).forEach((relSlug) => {
        if (!nodeSlugs.has(relSlug)) {
          errors.push(`node ${node.slug}: related slug "${relSlug}" does not exist`);
        }
      });
    });
  });
});

// 4. Org set: orgs.csv and map-data.json orgs must describe the same set.
const mdOrgsById = new Map(mapData.orgs.map((o) => [o.org_id, o]));
const csvOrgIds = new Set(orgsCsv.map((r) => r.org_id));
for (const id of mdOrgsById.keys()) {
  if (!csvOrgIds.has(id)) errors.push(`org ${id} is in map-data.json but not in orgs.csv`);
}
for (const id of csvOrgIds) {
  if (!mdOrgsById.has(id)) errors.push(`org ${id} is in orgs.csv but not in map-data.json`);
}
for (const org of mapData.orgs) {
  if (!ORG_STATUS_VALUES.has(org.status)) errors.push(`org ${org.org_id}: invalid status "${org.status}"`);
}

// 5. Edges: every edge must resolve to a known org and node, and use a valid role.
mapData.edges.forEach((edge, i) => {
  if (!mdOrgsById.has(edge.org_id)) {
    errors.push(`edge ${i}: org_id "${edge.org_id}" does not exist`);
  }
  if (!nodeSlugs.has(edge.node_slug)) {
    errors.push(`edge ${i}: node_slug "${edge.node_slug}" does not exist`);
  }
  if (!EDGE_ROLE_VALUES.has(edge.role)) {
    errors.push(`edge ${i}: invalid role "${edge.role}"`);
  }
  if (!edge.evidence_url || !/^https?:\/\//i.test(edge.evidence_url.trim())) {
    errors.push(`edge ${i} (${edge.org_id} -> ${edge.node_slug}): evidence_url is missing or not http(s)`);
  }
});

// 6. Approachability values must be within the vocabulary once "unknown" is
// dropped; anything else is an unmapped enum value and must fail loudly.
const approachabilityUnknownOrgs = [];
for (const org of mapData.orgs) {
  const raw = (org.approachability || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const bad = raw.filter((a) => a !== 'unknown' && !APPROACHABILITY_VALUES.has(a));
  if (bad.length > 0) {
    errors.push(`org ${org.org_id}: unmapped approachability value(s) ${JSON.stringify(bad)}`);
  }
  if (raw.includes('unknown')) approachabilityUnknownOrgs.push(org.org_id);
}

// 7. Node aliases: only rows shaped like node slugs (layer.subarea.node) are
// node_aliases; anything else (a subarea-level merge) belongs to a future
// slug_aliases table, out of MVP scope, and is skipped, not imported.
const isNodeSlugShape = (s) => s.split('.').length === 3;
const nodeAliasRows = [];
const skippedAliasRows = [];
for (const row of nodeAliasesCsv) {
  if (!isNodeSlugShape(row.old_slug)) {
    skippedAliasRows.push(row);
    continue;
  }
  if (!nodeSlugs.has(row.new_slug)) {
    errors.push(`node-aliases.csv: new_slug "${row.new_slug}" (from "${row.old_slug}") does not exist`);
    continue;
  }
  nodeAliasRows.push(row);
}

// 8. org-aliases.csv: confirm every merge it records is already applied (the
// old id is gone, the new id is present), so there is genuinely nothing left
// to import for it in this schema.
for (const row of orgAliasesCsv) {
  if (mdOrgsById.has(row.old_org_id)) {
    errors.push(
      `org-aliases.csv: old_org_id "${row.old_org_id}" still appears in map-data.json; expected it to already be merged into "${row.new_org_id}"`
    );
  }
  if (!mdOrgsById.has(row.new_org_id)) {
    errors.push(`org-aliases.csv: new_org_id "${row.new_org_id}" does not exist in map-data.json`);
  }
}

if (errors.length > 0) {
  console.error(`build-seed: ${errors.length} validation error(s), nothing written.\n`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build the seed SQL.
// ---------------------------------------------------------------------------

const out = [];
out.push(
  [
    '-- Generated by scripts/seed/build-seed.mjs from data/v2. Do not hand-edit;',
    '-- change data/v2 (or the generator) and run `pnpm seed:build` again.',
    '--',
    '-- Deterministic and idempotent: every insert is keyed on a natural key with',
    '-- ON CONFLICT ... DO NOTHING, so re-applying this file changes nothing.',
    '--',
    '-- Provenance: every imported row is created_method = import,',
    "-- verification_state = 'unverified' (nothing imported is marked human-",
    '-- verified), created_by one of two actors: the general Sept 2026 research',
    '-- compile, or the v2 taxonomy build specifically where the record says so.',
  ].join('\n')
);

// --- Actors -----------------------------------------------------------------
out.push('-- Actors');
out.push(
  `INSERT INTO public.actors (kind, agent_key, display_name) VALUES ('agent', ${sqlStr(COMPILE_ACTOR_KEY)}, ${sqlStr(COMPILE_ACTOR_NAME)}) ON CONFLICT (agent_key) DO NOTHING;`
);
out.push(
  `INSERT INTO public.actors (kind, agent_key, display_name) VALUES ('agent', ${sqlStr(V2_BUILD_ACTOR_KEY)}, ${sqlStr(V2_BUILD_ACTOR_NAME)}) ON CONFLICT (agent_key) DO NOTHING;`
);

// --- site_meta ---------------------------------------------------------------
out.push('-- Site metadata (top-level taxonomy fields, read back by map_json())');
function metaRow(key, value) {
  return `INSERT INTO public.site_meta (key, value) VALUES (${sqlStr(key)}, ${sqlJsonb(value)}) ON CONFLICT (key) DO NOTHING;`;
}
out.push(metaRow('version', mapData.version));
out.push(metaRow('generated', mapData.generated));
out.push(metaRow('scope', mapData.scope));
out.push(metaRow('display_rules', mapData.display_rules));
out.push(metaRow('node_tests', mapData.node_tests));

// --- lens_definitions ---------------------------------------------------------
out.push('-- Lens definitions');
Object.entries(mapData.lens_definitions).forEach(([slug, definition], i) => {
  const name = titleCaseFromSlug(slug);
  out.push(
    `INSERT INTO public.lens_definitions (slug, name, definition, sort_order) VALUES (${sqlStr(slug)}, ${sqlStr(name)}, ${sqlStr(definition)}, ${i}) ON CONFLICT (slug) DO NOTHING;`
  );
});

// --- taxonomy_releases ---------------------------------------------------------
out.push('-- Taxonomy release');
out.push(
  `INSERT INTO public.taxonomy_releases (version, status, released_at, released_by, notes) VALUES ('2.0', 'published', ${sqlStr(FIXED_DATE)}, ${actorSubquery(V2_BUILD_ACTOR_KEY)}, ${sqlStr('Compiled by research agents from data/v2; not yet reviewed by a person.')}) ON CONFLICT (version) DO NOTHING;`
);

// --- layers ---------------------------------------------------------------
out.push('-- Layers');
mapData.layers.forEach((layer, idx) => {
  out.push(
    `INSERT INTO public.layers (slug, name, definition, role_line, sort_order, created_by, created_method, created_at) VALUES (${sqlStr(layer.slug)}, ${sqlStr(layer.name)}, ${sqlStr(layer.definition)}, ${sqlStr(emptyToNull(layer.role_line))}, ${idx}, ${actorSubquery(COMPILE_ACTOR_KEY)}, 'import', ${sqlStr(FIXED_DATE)}) ON CONFLICT (slug) DO NOTHING;`
  );
});

// --- subareas ---------------------------------------------------------------
out.push('-- Subareas');
mapData.layers.forEach((layer) => {
  layer.subareas.forEach((sub, idx) => {
    out.push(
      `INSERT INTO public.subareas (slug, layer_id, name, definition, scope_rule, sort_order, created_by, created_method, created_at) VALUES (${sqlStr(sub.slug)}, ${sqlSubquery('layers', 'slug', layer.slug)}, ${sqlStr(sub.name)}, ${sqlStr(sub.definition)}, ${sqlStr(emptyToNull(sub.scope_rule))}, ${idx}, ${actorSubquery(COMPILE_ACTOR_KEY)}, 'import', ${sqlStr(FIXED_DATE)}) ON CONFLICT (slug) DO NOTHING;`
    );
  });
});

// --- nodes ---------------------------------------------------------------
out.push('-- Nodes');
mapData.layers.forEach((layer) => {
  layer.subareas.forEach((sub) => {
    sub.nodes.forEach((node, idx) => {
      const createdAt = createdAtLiteral(node);
      out.push(
        [
          'INSERT INTO public.nodes (',
          '  slug, subarea_id, name, definition, why_it_matters, progress_looks_like,',
          '  canonical_reference, key_agendas, boundary_notes, tailwind_links,',
          '  capacity, capacity_note, home, owner_field, connection, connection_note,',
          '  lenses, existing_mitigations, confidence, reference_needs_replacing,',
          '  open_problems_source, entry_points, legacy_batch, sort_order,',
          '  created_by, created_method, created_at, last_checked_at, verification_state',
          ') VALUES (',
          `  ${sqlStr(node.slug)}, ${sqlSubquery('subareas', 'slug', sub.slug)}, ${sqlStr(node.name)}, ${sqlStr(node.definition)}, ${sqlStr(emptyToNull(node.why_it_matters))}, ${sqlStr(emptyToNull(node.progress_looks_like))},`,
          `  ${sqlJsonb(node.canonical_reference ?? null)}, ${sqlJsonb(node.key_agendas ?? [])}, ${sqlStr(emptyToNull(node.boundary_notes))}, ${sqlTextArray(node.tailwind_links)},`,
          `  ${sqlStr(node.capacity)}, ${sqlStr(emptyToNull(node.capacity_note))}, ${sqlTextArray(node.home)}, ${sqlStr(emptyToNull(node.owner_field))}, ${sqlStr(node.connection)}, ${sqlStr(emptyToNull(node.connection_note))},`,
          `  ${sqlTextArray(node.lenses)}, ${sqlStr(emptyToNull(node.existing_mitigations))}, ${sqlStr(node.confidence ?? null)}, ${sqlBool(node.reference_needs_replacing ?? false)},`,
          `  ${sqlJsonb(node.open_problems_source ?? null)}, ${sqlStr(emptyToNull(node.entry_points))}, ${sqlStr(node.phaseb_batch ?? null)}, ${idx},`,
          `  ${actorSubquery(node.created_by)}, 'import', ${createdAt}, ${createdAt}, 'unverified'`,
          ') ON CONFLICT (slug) DO NOTHING;',
        ].join('\n')
      );
    });
  });
});

// --- node_relations (from each node's "related" list) ------------------------
out.push('-- Node relations (replaces the related array; directional as imported)');
let relationCount = 0;
mapData.layers.forEach((layer) => {
  layer.subareas.forEach((sub) => {
    sub.nodes.forEach((node) => {
      (node.related || []).forEach((relSlug) => {
        relationCount++;
        out.push(
          `INSERT INTO public.node_relations (node_id, related_node_id, created_by, created_method, created_at) VALUES (${sqlSubquery('nodes', 'slug', node.slug)}, ${sqlSubquery('nodes', 'slug', relSlug)}, ${actorSubquery(node.created_by)}, 'import', ${createdAtLiteral(node)}) ON CONFLICT (node_id, related_node_id) DO NOTHING;`
        );
      });
    });
  });
});

// --- node_aliases ---------------------------------------------------------
out.push('-- Node aliases (v2 merges and renames)');
nodeAliasRows.forEach((row) => {
  const createdAt = row.date ? `${row.date}T00:00:00Z` : FIXED_DATE;
  out.push(
    `INSERT INTO public.node_aliases (old_slug, new_slug, change, created_at) VALUES (${sqlStr(row.old_slug)}, ${sqlStr(row.new_slug)}, ${sqlStr(emptyToNull(row.change))}, ${sqlStr(createdAt)}) ON CONFLICT (old_slug) DO NOTHING;`
  );
});

// --- orgs (orgs.csv joined with map-data.json orgs) ---------------------------
out.push('-- Organisations');
const orgDomainHostCounts = new Map();
orgsCsv.forEach((row) => {
  const md = mdOrgsById.get(row.org_id);
  const host = hostOf(cleanUnknown(md.url));
  if (host) orgDomainHostCounts.set(host, (orgDomainHostCounts.get(host) ?? 0) + 1);
});

const orgDomainRows = [];
const orgDomainSkipped = [];

orgsCsv.forEach((row) => {
  const md = mdOrgsById.get(row.org_id);
  const createdAt = createdAtLiteral(md);
  const focusTags = (row.focus_tags || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const approachability = (md.approachability || '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== 'unknown');
  const founded = cleanUnknown(row.founded_year);
  const foundedYear = founded && founded !== '0' ? parseInt(founded, 10) : null;

  out.push(
    [
      'INSERT INTO public.orgs (',
      '  org_id, name, url, type, hq_country, hq_city, region, founded_year, size_band,',
      '  funding_model, commercial_model, primary_focus, focus_tags, problem_description,',
      '  notable_outputs, status, confidence, approachability, record_origin, notes,',
      '  created_by, created_method, created_at, last_checked_at, verification_state',
      ') VALUES (',
      `  ${sqlStr(md.org_id)}, ${sqlStr(md.name)}, ${sqlStr(cleanUnknown(md.url))}, ${sqlStr(cleanUnknown(md.type))},`,
      `  ${sqlStr(cleanUnknown(md.hq_country))}, ${sqlStr(cleanUnknown(row.hq_city))}, ${sqlStr(cleanUnknown(md.region))}, ${sqlInt(foundedYear)}, ${sqlStr(cleanUnknown(row.size_band))},`,
      `  ${sqlStr(cleanUnknown(md.funding_model))}, ${sqlStr(cleanUnknown(md.commercial_model))}, ${sqlStr(cleanUnknown(row.primary_focus))}, ${sqlTextArray(focusTags)}, ${sqlStr(emptyToNull(row.problem_description))},`,
      `  ${sqlStr(emptyToNull(row.notable_outputs))}, ${sqlStr(md.status)}, ${sqlStr(cleanUnknown(row.confidence))}, ${sqlTextArray(approachability)}, ${sqlStr(emptyToNull(row.source))}, ${sqlStr(emptyToNull(md.notes))},`,
      `  ${actorSubquery(md.created_by)}, 'import', ${createdAt}, ${createdAt}, 'unverified'`,
      ') ON CONFLICT (org_id) DO NOTHING;',
    ].join('\n')
  );

  const host = hostOf(cleanUnknown(md.url));
  if (!host) {
    orgDomainSkipped.push({ org_id: md.org_id, reason: 'no usable url' });
  } else if (ORG_DOMAIN_SKIP_HOSTS.has(host)) {
    orgDomainSkipped.push({ org_id: md.org_id, host, reason: 'explicitly shared host' });
  } else if ((orgDomainHostCounts.get(host) ?? 0) > 1) {
    orgDomainSkipped.push({ org_id: md.org_id, host, reason: 'host used by more than one org' });
  } else {
    orgDomainRows.push({ org_id: md.org_id, host });
  }
});

// --- org_domains ---------------------------------------------------------
out.push('-- Organisation domains, for contribution email-domain matching');
orgDomainRows.forEach(({ org_id, host }) => {
  out.push(
    `INSERT INTO public.org_domains (domain, org_id, kind, added_by, added_at) VALUES (${sqlStr(host)}, ${sqlSubquery('orgs', 'org_id', org_id)}, 'primary', ${actorSubquery(COMPILE_ACTOR_KEY)}, ${sqlStr(FIXED_DATE)}) ON CONFLICT (domain) DO NOTHING;`
  );
});

// --- sources (one row per distinct evidence_url) ------------------------------
out.push('-- Sources (one row per distinct edge evidence_url)');
const distinctEvidenceUrls = [];
const seenUrls = new Set();
mapData.edges.forEach((e) => {
  const url = e.evidence_url.trim();
  if (!seenUrls.has(url)) {
    seenUrls.add(url);
    distinctEvidenceUrls.push(url);
  }
});
distinctEvidenceUrls.forEach((url) => {
  const domain = hostOf(url);
  out.push(
    `INSERT INTO public.sources (url, url_normalised, domain, first_seen_at, check_status) VALUES (${sqlStr(url)}, ${sqlStr(url)}, ${sqlStr(domain)}, ${sqlStr(FIXED_DATE)}, 'never-fetched') ON CONFLICT (url_normalised) DO NOTHING;`
  );
});

// --- edges ---------------------------------------------------------------
out.push('-- Edges (evidence_strength left at its default, unrated: v2 carries no rating)');
const edgeLegacyBatch = new Map();
edgesCsv.forEach((row) => {
  edgeLegacyBatch.set(`${row.org_id}|${row.node_slug}`, row.batch);
});
mapData.edges.forEach((edge) => {
  const url = edge.evidence_url.trim();
  const createdAt = createdAtLiteral(edge);
  const legacyBatch = edgeLegacyBatch.get(`${edge.org_id}|${edge.node_slug}`) ?? null;
  out.push(
    [
      'INSERT INTO public.edges (',
      '  org_id, node_id, role, evidence_source_id, evidence_url, evidence_note,',
      '  legacy_batch, created_by, created_method, created_at, last_checked_at, verification_state',
      ') VALUES (',
      `  ${sqlSubquery('orgs', 'org_id', edge.org_id)}, ${sqlSubquery('nodes', 'slug', edge.node_slug)}, ${sqlStr(edge.role)}, ${sqlSubquery('sources', 'url_normalised', url)}, ${sqlStr(url)}, ${sqlStr(emptyToNull(edge.evidence_note))},`,
      `  ${sqlStr(emptyToNull(legacyBatch))}, ${actorSubquery(edge.created_by)}, 'import', ${createdAt}, ${createdAt}, 'unverified'`,
      ') ON CONFLICT (org_id, node_id) DO NOTHING;',
    ].join('\n')
  );
});

writeFileSync(OUT_FILE, out.join('\n\n') + '\n');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`build-seed: wrote ${OUT_FILE}`);
console.log(`  layers: ${mapData.layers.length}`);
console.log(`  subareas: ${subareaSlugs.size}`);
console.log(`  nodes: ${nodeSlugs.size}`);
console.log(`  node_relations: ${relationCount}`);
console.log(`  node_aliases imported: ${nodeAliasRows.length}, skipped (not node-shaped): ${skippedAliasRows.length}`);
if (skippedAliasRows.length > 0) {
  skippedAliasRows.forEach((r) => console.log(`    skipped: ${r.old_slug} -> ${r.new_slug} (${r.change})`));
}
console.log(`  orgs: ${orgsCsv.length}`);
console.log(`  org_domains created: ${orgDomainRows.length}, skipped: ${orgDomainSkipped.length}`);
console.log(`  orgs with an "unknown" approachability entry (mapped to no value): ${approachabilityUnknownOrgs.length}`);
console.log(`  sources (distinct evidence_url): ${distinctEvidenceUrls.length}`);
console.log(`  edges: ${mapData.edges.length}`);
console.log(`  org-aliases.csv rows confirmed already merged: ${orgAliasesCsv.length}`);
console.log('  parent_org_id: left null for every org; data/v2 has no parent/child linkage field to import.');
console.log('  introduced_in / retired_in: left null for every layer, subarea and node; not present in data/v2.');
