# Phase A brief: deep-dive taxonomy for the AI safety and security map

Read this whole file before starting. Today is 21 September 2026.

## What we are building

A live map of the AI safety AND security field, organised by problem space first: layers, then sub-areas, then nodes (specific sub-problems). Organisations will later be attached to nodes as evidence of who works on what. The map exists to show three things: who is working on what, where the gaps are, and who someone should reach out to in order to contribute.

## Target user

Someone entering the field. Knowledgeable and engaged with the core problems, but far from expert. They need each node to stand on its own: what the problem is in plain language, why it matters, what progress would look like, and one canonical thing to read. Not a resource dump. AISafety.com/map already does resource-heavy; we are doing problem-first.

## Non-negotiables

- Nodes with few or no organisations MUST be included. Blank space is the point: it tells the user where to go and work. Never drop a node because it looks empty.
- Safety and security are both in scope. Rule for where security work lands: protecting the AI system itself (weights, infrastructure, agents, supply chain, insider threat) sits under The Model; protecting the world from AI-enabled attackers (cyber offence, critical infrastructure, bio, fraud) sits under Misuse.
- Governance splits: governance OF the model by its developer (safety frameworks, safety cases, third-party auditing, incident reporting at lab level) sits under The Model. Governance BY governments and international bodies sits under Society and Government.
- Control is its own sub-area, separate from alignment. Interpretability is its own sub-area and includes chain-of-thought monitorability. Biosecurity sits under Misuse. Structural risk keeps its distinct nodes even where thin. Ethics, fairness and welfare are kept, visibly alongside the rest rather than merged into it.
- Commercial organisations count. Lab safety teams count as organisations.
- Every factual claim, reference and example organisation gets a URL. Do not invent. Mark uncertainty.

## The four layers

1. `model` The Model: making the AI system itself safe and secure. Expected sub-areas: alignment, interpretability, control, evaluations, model-security, developer-assurance (safety frameworks, safety cases, audits, lab-level incident reporting). Adjust if the evidence says so.
2. `misuse` Misuse: people using AI to cause harm. Expected sub-areas, to be tested not assumed: cyber offence, critical infrastructure, bio and chem, autonomous weapons, influence operations and persuasion, fraud and crime at scale, surveillance and authoritarian use, open-weights proliferation. Add or merge as the evidence dictates.
3. `society` Society and Government: structural risk (race dynamics, concentration of power, gradual disempowerment, multi-agent dynamics), public policy and regulation, international governance, compute governance, economic transition, epistemics and information ecosystem, ethics-fairness-welfare (kept alongside).
4. `meta` Meta: field infrastructure. Funding, talent and training, forecasting and evidence generation, watchdogs and lab accountability, communications and public engagement, convenings and coordination, tooling and public goods for safety research.

## Inputs you must read first

- /home/claude/aisafety-map/research/02-problem-taxonomy.md (first-pass 10-area taxonomy with ~70 nodes; reuse what is good, fix what is not, re-home nodes into the four layers)
- /home/claude/aisafety-map/research/04-tailwind-initiatives.md (Coefficient Giving's 36 Tailwind initiatives; each is a gap a leading funder sees; map them onto your nodes)
- /home/claude/aisafety-map/research/01-existing-maps-audit.md sections 2 and 5 (existing taxonomies to draw on)
- /home/claude/aisafety-map/research/03-org-seed-list.csv (209 orgs with focus tags; use as a hint for what exists, not as truth)

Then research beyond these with WebSearch and WebFetch (load via ToolSearch "select:WebSearch,WebFetch"; never curl or python for web pages). Primary sources preferred: lab research agendas, AISI and CAISI agendas, DeepMind's AGI safety paper, Anthropic's research directions, UK AISI, International AI Safety Report 2026, Reuel et al., Hendrycks, "Open Problems in Mechanistic Interpretability", RAND model weights security, MITRE ATLAS, OWASP agentic, Berkeley RDI cyber-AI survey, GovAI and CSET agendas, and the LessWrong "List of lists of project ideas" post.

## Node schema (every node needs every field; write "unknown" rather than guess)

- slug: `layer.subarea.node`, lowercase, hyphens
- name: short, plain
- definition: 2 to 3 sentences an entrant can understand without jargon; say what the problem is
- why_it_matters: 1 to 2 sentences on the failure this prevents
- progress_looks_like: 1 to 2 sentences on what a solved or much-improved version looks like
- canonical_reference: ONE title plus URL, the best single thing to read first
- key_agendas: named research agendas or approaches inside this node (not orgs), with a URL each where possible
- boundary_notes: how this node differs from its nearest neighbours, including neighbours in other layers; name the neighbour slugs
- example_orgs: up to 5, only if confident, each with URL; empty list is fine and expected for some nodes
- tailwind_links: titles of Tailwind initiatives that belong here, verbatim
- coverage_status: exactly one of `unowned` (no organisation works on this) / `lab-internal` (worked on inside frontier labs, no independent org) / `adjacent-field` (covered by a field that does not call itself AI safety, e.g. arms control, classical infosec) / `nascent` (idea exists, one or two people or a new org) / `covered` (several orgs, room for more) / `crowded` (many orgs, entrant would struggle to add). Plus coverage_reasoning: one sentence.
- confidence: high / medium / low

Sub-areas need: slug, name, a 2 to 3 sentence definition, and a one-line scope rule (what is in and what is out).

## Output

Two files, named per your layer:
- `/home/claude/aisafety-map/research/phaseA/<layer>.md`: a short method note, then the sub-areas and nodes as nested headings with every field, then a section "Open questions for reconciliation" listing anything you were unsure where to home, nodes that might duplicate another layer, and nodes you considered and rejected with a reason.
- `/home/claude/aisafety-map/research/phaseA/<layer>.json`: `{layer, subareas: [{slug, name, definition, scope_rule, nodes: [ {all node fields} ]}]}`. Must be valid JSON; validate with python before finishing.

Aim for 4 to 8 nodes per sub-area. Granular enough that an organisation's work tags to a specific node, coarse enough that the node still reads as one problem. British English, plain prose, no em-dashes, no marketing language.
