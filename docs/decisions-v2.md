# Owner decisions for taxonomy v2 (24 September 2026)

Source: Dominic's replies to the decision sheet, plus the field-framing review section 7A and the v1.3 report section (d). Apply all of these. Keep the map simple at the top level: the owner's standing worry is that the highest level becomes convoluted for the entrant it is built for.

## A1. Split status into two fields, replace bridge with connection
- Remove `coverage_status`. Add `capacity` (none / thin / active / busy: how much work exists on the problem) and `home` (array, one or more of: independent-ai-safety / frontier-labs / government / commercial / academia / another-field: who does the work). `owner_field` names the field only when home includes another-field; blank otherwise.
- Replace `bridge_status` and `bridge_reasoning` with `connection` (strong / weak / missing / not-applicable) and `connection_note` (one sentence on what flows, or should flow, between that field and AI developers and AI safety). Only nodes with another-field in home get a connection other than not-applicable.
- Derive initial values from the v1.3 fields, the coverage_reasoning text, and the edge counts and org types, then sanity-check every node by hand against its reasoning. Rules of thumb: unowned -> capacity none; nascent with 0 to 2 primary edges -> thin; nascent with 3+ primaries or covered -> active; crowded -> busy. lab-internal -> home frontier-labs (plus others if tagged). adjacent-field -> home another-field with owner_field set. adjacent-covers-it -> connection weak unless the reasoning shows strong developer engagement; bridge-needed -> connection weak or missing per the reasoning. Rewrite coverage_reasoning into `capacity_note` (one sentence, plain, about the work that exists, never about "solved").
- Top level rendering rule for the front end (document it in the JSON's top-level `display_rules`): tile colour = capacity only; home = small secondary mark; connection only inside the node panel.

## A2. Add a reliability and failures sub-area in The Model
- `model.reliability`, about four nodes: agent reliability and error propagation; high-stakes deployment failures (AI embedded in critical systems creating new ways to fail, taking that half of misuse.cyber.critical-infrastructure and the CISA OT principles with it); safety-critical AI assurance (home another-field: safety engineering, functional safety, ISO 26262 and IEC 61508 communities); one more only if the sources justify it. Each node needs every schema field and must pass the node tests in A2b.
- A2b. Node tests (record in the JSON top level as `node_tests` and apply to every new node): (1) one problem with its own failure mode and its own progress statement; (2) at least one credible source frames it as a problem; (3) the people who would work on it are distinguishable from neighbours; (4) it cannot be said as one sentence inside an existing node. A sub-area over eight nodes triggers a merge review.

## A3. Agent governance nodes and lenses
- Add two nodes on agents: agent identity, visibility and protocols (in society.public-policy or a better home; justify); accountability and liability for agent actions (society.public-policy, near liability). 
- Add `lenses` (array of tags) to every node from this controlled list: loss-of-control, agents, democracy, defensive-technology, open-source, critical-infrastructure. Tag conservatively; a lens should light up 5 to 20 nodes, not 60. Record the list and definitions at the top level as `lens_definitions`. Lenses are off by default in the UI.

## A4. Compress Meta
- Merge convenings to two nodes; merge funding mechanism nodes so funding has two nodes: concentration and diversity of funding; funding infrastructure (fiscal sponsors, prizes, incubators). Merge meta.evidence and meta.strategy into one sub-area "Evidence and strategy". Leave meta.watchdogs where it is (owner wants "who scrutinises the labs" findable by name). Merge meta.tooling.on-demand-expertise into senior-and-specialist-recruitment only if it makes the compression cleaner; otherwise leave. Target about 20 to 22 Meta nodes. Re-point edges and Tailwind links; nothing is dropped, only merged.
- The government / philanthropic / venture distinction lives on the org rows (funding_model, commercial_model), not on nodes; check those fields are filled for every funder org and fill from existing data where possible.

## A5. Add three Model nodes
- model.alignment.automated-alignment-research (trusting and scaling AI-produced safety work; labs' central plan; Anthropic, OpenAI, DeepMind agendas; re-point any "automated alignment" mention in superintelligence-alignment). 
- model.evaluations or model.developer-assurance: automated AI R&D and internal deployment (capability threshold in lab frameworks and the International AI Safety Report; Apollo's work on internal deployment; choose the home and justify).
- model.developer-assurance.deployment-misuse-safeguards (classifiers, monitoring, usage enforcement; Anthropic constitutional classifiers, OpenAI safety systems, labs' safeguards teams).
- Each with every schema field, capacity/home set, lenses, and edges from existing orgs where evidence in the existing data supports it; log tags that need evidence later rather than inventing URLs.

## A6. Rule 2 mechanism-based
- Rewrite the developer-assurance sub-area scope rule and public-policy scope rule so frameworks and incident reporting stay in developer assurance whether voluntary or required by law; public policy holds law-making, regulators and enforcement. Fix boundary notes that say "voluntary".

## A7. Renames
- Layer `misuse` display name "Harmful use" (slug unchanged). Layer definition rewritten so lawful state use (military, surveillance) reads correctly.
- Sub-area `misuse.open-weights` display name "Open-weight models"; add or rebalance a release-assessment node so the open-model side of the argument is represented (July 2026 incident context).
- Keep "The Model".
- Node display renames already applied in v1.3 stand.

## A8. Scope and vantage statement
- Add top-level `scope` text to the JSON: written from the AI safety community's vantage point; node count is not importance; out of scope for now: environmental and resource costs, copyright and data rights, general data governance and privacy (privacy and data leakage is the first to revisit). This text is also going onto the methodology page.

## B. Node-review structural items
- Merge misuse.military.arms-control into misuse.military.lethal-autonomy; rename to "Autonomous weapons and their regulation"; keep both sets of edges and Tailwind links.
- Do not merge control-evaluations into control-protocols. Do not split concentration-of-power; add a boundary note naming both strands (seizure of power; market concentration).
- Apply the three held predictive-policing edits (adjacent-field / owner_field digital rights and criminal-justice reform / connection per A1 rules).
- Apply the other 27 low-confidence edits from the v1.3 report section (c) EXCEPT any that adds a tag without a URL or that reads as a guess (list what you skipped).

## C. Site and contribution decisions (for the docs, not the data)
- Domain: ai-map.dominic-deane.com. Licence CC BY 4.0 data, MIT code.
- No sign-in. Suggest-a-change requires a reachable contact (work email or community handle). Stored immediately as unconfirmed; non-blocking confirmation email; weighting from confirmed flag, email-domain match against listed orgs, and self-declared handle. Spam via Turnstile and honeypot. Org granularity: separate rows with parent_org_id.
