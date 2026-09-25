# Dataset v2: structure, capacity and home

Generated 24 September 2026 by `build_v2.py` and `report_v2.py` in this folder, from the v1.3 files (archived unchanged in `v1.3/`) and the owner's decisions in `phaseC/DECISIONS-v2.md`. The hand-authored content is in three data modules: `v2_structure.py` (layers, sub-areas, merges, new nodes, text edits), `v2_fields.py` (capacity, home, connection and lenses for every node) and `v2_edges.py` (new organisations, edges and the low-confidence edits). To rebuild: `python3 build_v2.py && python3 report_v2.py`.

Headline: 118 nodes (v1.3: 118), 358 organisations (v1.3: 352), 670 evidenced edges (v1.3: 650). Nine nodes were added and nine merged away, so the count is unchanged: 118 + 9 new - 9 merged = 118. No node was dropped; every retired slug redirects through `node-aliases.csv`. map-data.json is 879,879 bytes. Validation passed (section f).

| Layer | Nodes v1.3 | Nodes v2 | Sub-areas v2 |
|---|---|---|---|
| The Model | 32 | 39 | Alignment 8, Interpretability 5, Control 5, Evaluations 5, Model security 5, Reliability and failures 4, Developer assurance 7 |
| Harmful use | 28 | 27 | Cyberattacks and critical infrastructure 6, Biological and chemical weapons 5, Military AI and autonomous weapons 3, Influence operations and persuasion 3, Fraud and abuse 3, Surveillance and repression 4, Open-weight models 3 |
| Society and Government | 28 | 30 | Structural risk 5, Public policy and regulation 7, International governance 4, Compute governance 3, Economic transition 3, Epistemics and information 4, Ethics, fairness and welfare 4 |
| Meta | 30 | 22 | Funding 2, Talent and training 4, Evidence and strategy 7, Watchdogs and accountability 2, Communications and public engagement 3, Convenings and coordination 2, Research tooling and public goods 2 |
| All | 118 | 118 | 28 sub-areas (v1.3: 28) |

The top level is simpler, not busier: the four layers are unchanged in number, the tile colour now depends on one field (capacity, four values) instead of a six-value status that mixed two questions, home is a small secondary mark, connection appears only inside the node panel, and lenses are off by default. These rules are recorded in the JSON's top-level `display_rules`.

## (a) Structural changes, with before and after slugs

### Schema (A1)

- Removed from every node: `coverage_status`, `coverage_reasoning`, `bridge_status`, `bridge_reasoning`.
- Added to every node: `capacity` (none / thin / active / busy), `capacity_note` (one sentence on the work that exists), `home` (one or more of independent-ai-safety / frontier-labs / government / commercial / academia / another-field), `owner_field` (only when home includes another-field), `connection` (strong / weak / missing / not-applicable), `connection_note` (one sentence, only for another-field nodes) and `lenses`.
- Added at the top level of taxonomy-v2.json and map-data.json: `scope` (A8), `display_rules` (A1), `node_tests` (A2b) and `lens_definitions` (A3).
- Provenance fields kept on every node. New and merged nodes carry created_by `v2-build-2026-09-24`; every node's last_verified is 2026-09-24 because its capacity, home and connection were re-derived and checked in this build; human_verified stays false.

### Layers and sub-areas

| Change | Before | After |
|---|---|---|
| Layer renamed (A7) | `misuse` "Misuse" | `misuse` "Harmful use" (slug unchanged; definition rewritten so lawful state uses such as military targeting and surveillance read correctly) |
| Layer definition | `model` | adds "reliable" and "making it dependable in use" for the new sub-area |
| Layer definition (A4) | `meta` "Field infrastructure: ..." | "Cross-cutting research about the risk and the field as a whole, plus the field's own infrastructure: ..." |
| New sub-area (A2) | none | `model.reliability` "Reliability and failures" (4 nodes), placed after model security |
| Sub-area renamed (A7) | `misuse.open-weights` "Open-weight safeguard removal" | `misuse.open-weights` "Open-weight models", definition and scope rule rebalanced |
| Sub-areas merged (A4) | `meta.evidence` "Evidence and forecasting" + `meta.strategy` "Strategy and prioritisation" | `meta.evidence` "Evidence and strategy" (7 nodes) |
| Scope rule rewritten (A6) | `model.developer-assurance`: "company-level and voluntary mechanisms" | assurance mechanisms "whether the developer adopts them voluntarily or a law requires them"; law-making, regulators and enforcement are out |
| Scope rule rewritten (A6) | `society.public-policy`: "Out: a developer's voluntary framework" | In: law-making, regulators and enforcement; Out: frameworks, safety cases, audits and incident reporting, which stay in developer assurance whether voluntary or mandated |
| Definition and scope rule | `misuse.cyber` | failures of AI embedded in critical systems with no attacker are now out (to `model.reliability.high-stakes-deployment-failures`) |
| Definitions updated | `meta.funding`, `meta.talent`, `meta.communications`, `meta.tooling`, `misuse.military` (scope rule) | wording follows the merges; `meta.funding` states that funder type lives on organisation rows |

### Nodes merged (A4 and B); nothing dropped

| After (slug and name) | Before (slugs merged) | Tailwind links carried |
|---|---|---|
| `misuse.military.lethal-autonomy` Autonomous weapons and their regulation | `misuse.military.lethal-autonomy`, `misuse.military.arms-control` | none |
| `meta.funding.funding-infrastructure` Funding infrastructure | `meta.funding.fiscal-sponsorship`, `meta.funding.prizes`, `meta.funding.incubation` | Fiscal sponsors, Grand awards for AI safety, Philanthropic startup incubator, Unclaimed research labs |
| `meta.convenings.convenings-and-events` Convenings and events | `meta.convenings.cross-sector`, `meta.convenings.subfield-forums`, `meta.convenings.event-infrastructure` | Cross-sector convenings, Subfield forums, Events as a service |
| `meta.talent.senior-and-specialist-recruitment` Senior and specialist capacity | `meta.talent.senior-and-specialist-recruitment`, `meta.tooling.on-demand-expertise` | Senior talent headhunting, Think tank for AI labs |
| `meta.communications.public-opinion` Public opinion and message research | `meta.communications.public-opinion`, `meta.communications.narrative-strategy` | none |
| `meta.evidence.macrostrategy-and-prioritisation` Macrostrategy and prioritisation | `meta.strategy.macrostrategy`, `meta.strategy.prioritisation` | none |
| `meta.tooling.shared-research-infrastructure` Shared compute, data and environments | `meta.tooling.compute-access`, `meta.tooling.datasets-and-environments` | Compute cluster for AI safety, Datasets for AI safety |

Moved without merging: `meta.strategy.threat-modelling` to `meta.evidence.threat-modelling` (sub-area merge).

Split (A2): `misuse.cyber.critical-infrastructure` keeps AI-enabled attacks; failures of AI embedded in critical systems, the CISA-led principles for AI in operational technology and the two edges that rest on them (CISA, NCSC) move to the new `model.reliability.high-stakes-deployment-failures`. The slug stays, so there is no alias row for it.

Renamed without a slug change: `meta.funding.funding-concentration` to "Concentration and diversity of funding"; `meta.talent.senior-and-specialist-recruitment` to "Senior and specialist capacity"; `meta.communications.public-opinion` to "Public opinion and message research"; `misuse.military.lethal-autonomy` to "Autonomous weapons and their regulation". The v1.3 display renames stand.

### New nodes (A2, A3, A5)

| Slug | Name | Sub-area | Why this home |
|---|---|---|---|
| `model.reliability.agent-reliability` | Agent reliability and error propagation | `model.reliability` | A2, as specified. |
| `model.reliability.hallucination` | Hallucination and factual errors | `model.reliability` | A2's optional fourth node; see section g for the sources that justify it. |
| `model.reliability.high-stakes-deployment-failures` | AI failures in critical systems | `model.reliability` | A2, as specified; takes the no-attacker half of critical infrastructure. |
| `model.reliability.safety-critical-assurance` | Safety-critical AI assurance | `model.reliability` | A2, as specified; home another-field. |
| `model.alignment.automated-alignment-research` | Automated alignment research | `model.alignment` | A5, as specified; re-points the automated-alignment material from superintelligence-alignment. |
| `model.developer-assurance.internal-deployment` | Automated AI R&D and internal deployment | `model.developer-assurance` | A5; developer assurance rather than evaluations, because measuring AI R&D capability already sits in dangerous-capability-evals and what is missing is how developers govern the systems once they have it. |
| `model.developer-assurance.deployment-misuse-safeguards` | Deployment safeguards against misuse | `model.developer-assurance` | A5, slug as specified. |
| `society.public-policy.agent-infrastructure` | Agent identity, visibility and protocols | `society.public-policy` | A3; public policy, next to standards (see section g). |
| `society.public-policy.agent-accountability` | Accountability and liability for agent actions | `society.public-policy` | A3; public policy, next to liability, as specified. |

### Other structural edits

- Rule 2 made mechanism-based (A6): boundary notes rewritten on `model.developer-assurance.frontier-safety-frameworks`, `model.developer-assurance.incident-reporting` (which said "Voluntary, lab-level disclosure"), `model.developer-assurance.third-party-auditing` and `society.public-policy.legislation`; the incident-reporting definition no longer says the legal rules "sit under legislation".
- Open-weight rebalance (A7): `misuse.open-weights.release-risk-assessment` definition, why_it_matters, progress_looks_like and boundary notes rewritten to hold the benefits side (research, defence, competition, and the July 2026 argument that responders needed open models); related now includes `society.structural-risk.concentration-of-power`. No node added.
- Superintelligence re-pointing (A5): `model.alignment.superintelligence-alignment` no longer holds the automated-alignment plan; its definition, progress marker, key agendas and boundary note point to the new node, and its canonical reference (Carlsmith, which is about automated alignment) moved to the new node and was replaced with Bengio et al. (2025) on Scientist AI.
- Concentration of power (B): not split; the existing boundary note already names both strands (seizure of power; market concentration), and why_it_matters was rewritten to name both and to drop the "It prevents" opening.
- Control evaluations and control protocols (B): not merged.
- Tailwind: 'Security capacity buildout' was linked to two nodes; it now sits only on `model.model-security.weights-security`, and the senior-and-specialist node's boundary note names it. All 36 titles map to exactly one node.
- Slug references rewritten in text by the alias map: 5; reciprocal related links added: 35.
- Edges re-pointed to merged or moved nodes: 48; duplicates collapsed where the same organisation was on two merged nodes: 6 (listed below); edges moved by the split: 2.

| Organisation | Merged node | Kept | Dropped |
|---|---|---|---|
| seismic-foundation | `meta.communications.public-opinion` | primary from `meta.communications.narrative-strategy` | secondary from `meta.communications.public-opinion` |
| rand-global-and-emerging-risks-caps | `meta.evidence.macrostrategy-and-prioritisation` | secondary from `meta.strategy.macrostrategy` | secondary from `meta.strategy.prioritisation` |
| article-36 | `misuse.military.lethal-autonomy` | primary from `misuse.military.lethal-autonomy` | primary from `misuse.military.arms-control` |
| international-committee-of-the-red-cross-icrc | `misuse.military.lethal-autonomy` | primary from `misuse.military.lethal-autonomy` | primary from `misuse.military.arms-control` |
| stop-killer-robots | `misuse.military.lethal-autonomy` | primary from `misuse.military.lethal-autonomy` | secondary from `misuse.military.arms-control` |
| unidir | `misuse.military.lethal-autonomy` | primary from `misuse.military.lethal-autonomy` | primary from `misuse.military.arms-control` |

## (b) Capacity and home per layer, and connection ratings

Capacity drives tile colour. Counts per layer:

| Layer | none | thin | active | busy | Nodes |
|---|---|---|---|---|---|
| The Model | 0 | 20 | 17 | 2 | 39 |
| Harmful use | 0 | 10 | 15 | 2 | 27 |
| Society and Government | 0 | 14 | 16 | 0 | 30 |
| Meta | 0 | 9 | 13 | 0 | 22 |
| All | 0 | 53 | 61 | 4 | 118 |

No node is rated none. v1.3 had no unowned nodes either; the reviewers found owners for the last three. The map's gaps now show as thin (a few organisations or one team) and as missing connections on nodes owned by other fields.

Home (a node with several homes counts once in each column):

| Layer | independent AI safety | frontier labs | government | commercial | academia | another field |
|---|---|---|---|---|---|---|
| The Model | 27 | 23 | 11 | 10 | 8 | 4 |
| Harmful use | 7 | 8 | 13 | 6 | 7 | 13 |
| Society and Government | 21 | 4 | 7 | 5 | 7 | 5 |
| Meta | 21 | 1 | 4 | 2 | 2 | 1 |

Every node, by layer (capacity, then home):

### The Model

| Node | Capacity | Home | v1.3 status |
|---|---|---|---|
| `model.alignment.scalable-oversight` Scalable oversight | active | labs, government, academia, independent | nascent |
| `model.alignment.reward-hacking` Reward hacking and specification gaming | active | labs, independent | lab-internal |
| `model.alignment.scheming` Scheming and deceptive alignment | active | labs, independent | nascent |
| `model.alignment.robust-generalisation` Goal misgeneralisation and emergent misalignment | active | labs, independent | nascent |
| `model.alignment.unlearning-and-tamper-resistance` Unlearning and tamper-resistant safeguards | active | independent, government, commercial | nascent |
| `model.alignment.superintelligence-alignment` Alignment for superintelligence | thin | independent, commercial | nascent |
| `model.alignment.automated-alignment-research` Automated alignment research | thin | labs | new |
| `model.alignment.conceptual-foundations` Conceptual foundations of alignment | active | independent, academia | nascent |
| `model.interpretability.understanding-internals` Understanding model internals | active | independent, labs, commercial, academia | covered |
| `model.interpretability.chain-of-thought-monitorability` Chain-of-thought monitorability | active | labs, independent, government | nascent |
| `model.interpretability.internal-monitoring` Probes and internal monitoring | active | labs, independent | nascent |
| `model.interpretability.interpretability-benchmarks` Interpretability benchmarks | thin | independent, academia | nascent |
| `model.interpretability.safety-applications` Interpretability applied to safety | thin | labs, commercial | nascent |
| `model.control.control-evaluations` Control evaluations | thin | independent, government | nascent |
| `model.control.control-protocols` Control protocols and monitoring | thin | independent, labs | nascent |
| `model.control.agent-sandboxing` Agent sandboxing and containment | thin | another field, labs | adjacent-field |
| `model.control.formal-verification` Formal verification and guaranteed-safe AI | thin | government, independent | nascent |
| `model.control.loss-of-control-detection` Detecting loss-of-control incidents | thin | independent | nascent |
| `model.evaluations.dangerous-capability-evals` Dangerous capability evaluations | active | government, labs, independent, commercial | covered |
| `model.evaluations.propensity-and-character-evals` Propensity and character evaluations | thin | labs, independent | nascent |
| `model.evaluations.science-of-evaluations` Science of evaluations | thin | government, independent | nascent |
| `model.evaluations.benchmarks-and-tooling` Benchmarks and evaluation tooling | active | independent, government | covered |
| `model.evaluations.sandbagging-and-elicitation` Sandbagging and capability elicitation | thin | independent | nascent |
| `model.model-security.weights-security` Weights and infrastructure security | active | independent, labs | nascent |
| `model.model-security.agent-security` Agent and application security | busy | commercial, labs | crowded |
| `model.model-security.supply-chain-and-integrity` Supply chain and model integrity | thin | another field, commercial | adjacent-field |
| `model.model-security.insider-threat` Insider threat | thin | independent, labs | nascent |
| `model.model-security.jailbreak-robustness` Jailbreaks and adversarial robustness | busy | commercial, labs, academia | crowded |
| `model.reliability.agent-reliability` Agent reliability and error propagation | thin | academia, independent, commercial | new |
| `model.reliability.hallucination` Hallucination and factual errors | active | academia, commercial, labs | new |
| `model.reliability.high-stakes-deployment-failures` AI failures in critical systems | thin | government, another field | new |
| `model.reliability.safety-critical-assurance` Safety-critical AI assurance | active | another field, academia | new |
| `model.developer-assurance.frontier-safety-frameworks` Frontier safety frameworks | active | labs, independent | covered |
| `model.developer-assurance.safety-cases` Safety cases | thin | government, independent | nascent |
| `model.developer-assurance.third-party-auditing` Third-party auditing | active | independent | nascent |
| `model.developer-assurance.incident-reporting` Developer incident reporting | thin | labs | nascent |
| `model.developer-assurance.internal-safety-governance` Internal safety governance | thin | labs | lab-internal |
| `model.developer-assurance.internal-deployment` Automated AI R&D and internal deployment | thin | independent, labs | new |
| `model.developer-assurance.deployment-misuse-safeguards` Deployment safeguards against misuse | active | labs, government | new |

### Harmful use

| Node | Capacity | Home | v1.3 status |
|---|---|---|---|
| `misuse.cyber.offensive-uplift` Offensive cyber uplift | active | labs, academia, government | covered |
| `misuse.cyber.defensive-uplift` AI for cyber defence | busy | labs, commercial, government | covered |
| `misuse.cyber.autonomous-intrusion` Autonomous cyber operations | thin | labs, independent | lab-internal |
| `misuse.cyber.attack-detection` Detecting AI-driven attacks in the wild | active | labs | lab-internal |
| `misuse.cyber.critical-infrastructure` Attacks on critical infrastructure | active | another field, government | adjacent-field |
| `misuse.cyber.defensive-capacity-gaps` Cyber defence where capacity is thin | thin | another field, government | adjacent-field |
| `misuse.bio-chem.knowledge-uplift` Bioweapons knowledge uplift | active | independent, academia, government | covered |
| `misuse.bio-chem.design-tool-misuse` Biological design tool misuse | thin | independent, labs, academia | nascent |
| `misuse.bio-chem.synthesis-screening` DNA synthesis screening | active | independent | covered |
| `misuse.bio-chem.chemical-weapons` Chemical weapons uplift | thin | government, commercial | nascent |
| `misuse.bio-chem.biosecurity-defence` AI for biosecurity defence | active | independent | nascent |
| `misuse.military.lethal-autonomy` Autonomous weapons and their regulation | active | another field, government | merged: lethal-autonomy adjacent-field, arms-control adjacent-field |
| `misuse.military.decision-support` AI targeting and decision support | thin | another field, government | nascent |
| `misuse.military.testing-and-assurance` Military AI testing and assurance | active | another field, government | adjacent-field |
| `misuse.influence-operations.covert-campaigns` Covert influence campaigns | active | labs, commercial, academia, independent | covered |
| `misuse.influence-operations.personalised-persuasion` AI persuasion at scale | thin | government, academia, labs | nascent |
| `misuse.influence-operations.extremist-recruitment` Violent extremism and terrorism | active | another field | adjacent-field |
| `misuse.fraud-and-abuse.fraud-and-impersonation` Fraud and impersonation | busy | another field, commercial, government | adjacent-field |
| `misuse.fraud-and-abuse.csam` AI-generated child sexual abuse material | active | another field, labs | adjacent-field |
| `misuse.fraud-and-abuse.ncii` Non-consensual intimate imagery | thin | another field | adjacent-field |
| `misuse.surveillance.mass-surveillance` Mass surveillance | active | another field | adjacent-field |
| `misuse.surveillance.censorship` AI-enabled censorship | active | another field | adjacent-field |
| `misuse.surveillance.predictive-policing-and-scoring` Predictive policing and social scoring | active | another field | covered |
| `misuse.surveillance.export-controls` Surveillance technology export controls | thin | another field | adjacent-field |
| `misuse.open-weights.safeguard-removal` Safeguard removal from open weights | thin | commercial, academia, government | nascent |
| `misuse.open-weights.uncensored-model-supply` Uncensored model supply | thin | commercial | nascent |
| `misuse.open-weights.release-risk-assessment` Open-weight release: marginal risk and benefit | active | government, independent, academia | nascent |

### Society and Government

| Node | Capacity | Home | v1.3 status |
|---|---|---|---|
| `society.structural-risk.race-dynamics` Race dynamics | thin | independent | nascent |
| `society.structural-risk.concentration-of-power` Concentration of power | thin | independent, academia | nascent |
| `society.structural-risk.gradual-disempowerment` Gradual disempowerment | thin | academia, independent | nascent |
| `society.structural-risk.multi-agent-risk` Multi-agent risks | active | independent, labs, commercial | covered |
| `society.structural-risk.strategic-stability` AI and strategic stability | active | another field | adjacent-field |
| `society.public-policy.legislation` Domestic AI legislation | active | independent, government | covered |
| `society.public-policy.liability` Liability for AI harms | thin | independent, academia | nascent |
| `society.public-policy.agent-accountability` Accountability and liability for agent actions | thin | independent, academia | new |
| `society.public-policy.standards` Standards and certification | active | government, commercial, independent | covered |
| `society.public-policy.whistleblower-protection` Whistleblower protection | thin | independent | nascent |
| `society.public-policy.regulatory-capacity` Government technical capacity | active | government | covered |
| `society.public-policy.agent-infrastructure` Agent identity, visibility and protocols | thin | government, independent, commercial | new |
| `society.international-governance.treaties` International agreements | active | independent | nascent |
| `society.international-governance.institutions` International institutions | active | government | covered |
| `society.international-governance.great-power-dialogue` US-China and cross-bloc dialogue | active | independent, academia | covered |
| `society.international-governance.inclusive-participation` Inclusive participation in global governance | thin | independent | nascent |
| `society.compute-governance.export-controls` Chip export controls and diversion | active | independent, government | covered |
| `society.compute-governance.agreement-verification` Verifying AI agreements | active | independent | nascent |
| `society.compute-governance.cloud-kyc` Cloud compute know-your-customer | thin | independent, government | nascent |
| `society.economic-transition.labour-disruption` Labour market disruption | active | another field | adjacent-field |
| `society.economic-transition.sharing-gains` Sharing the gains from AI | thin | independent | nascent |
| `society.economic-transition.safety-nets` Adapting safety nets | thin | another field | adjacent-field |
| `society.epistemics.collective-reasoning` AI and collective reasoning | thin | independent, commercial | nascent |
| `society.epistemics.deliberation-tools` Deliberation tools | active | independent | covered |
| `society.epistemics.content-provenance` Content provenance and deepfake detection | active | commercial | covered |
| `society.epistemics.decision-quality` Decision quality in key institutions | thin | independent | nascent |
| `society.ethics-fairness-welfare.fairness-and-bias` Fairness and bias | active | another field | adjacent-field |
| `society.ethics-fairness-welfare.ai-welfare-and-moral-status` AI welfare and moral status | active | independent, labs, academia | nascent |
| `society.ethics-fairness-welfare.machine-ethics` Machine ethics | thin | labs, academia | lab-internal |
| `society.ethics-fairness-welfare.human-ai-relationships` Human-AI relationships and wellbeing | active | another field, labs | adjacent-field |

### Meta

| Node | Capacity | Home | v1.3 status |
|---|---|---|---|
| `meta.funding.funding-concentration` Concentration and diversity of funding | active | independent, government, commercial | nascent |
| `meta.funding.funding-infrastructure` Funding infrastructure | active | independent, commercial | merged: fiscal-sponsorship covered, prizes nascent, incubation covered |
| `meta.talent.early-career-bottleneck` Early-career pipeline capacity | active | independent | nascent |
| `meta.talent.experienced-professionals` On-ramps for experienced professionals | active | independent | nascent |
| `meta.talent.senior-and-specialist-recruitment` Senior and specialist capacity | thin | independent | merged: senior-and-specialist-recruitment nascent, on-demand-expertise nascent |
| `meta.talent.matchmaking` Talent matchmaking | thin | independent | nascent |
| `meta.evidence.capability-forecasting` Capability forecasting | active | independent | covered |
| `meta.evidence.incident-tracking` Incident tracking | active | independent, government | covered |
| `meta.evidence.incident-investigation` Incident investigation | thin | independent | nascent |
| `meta.evidence.state-of-risk` Living reviews of AI risk | thin | government, academia | nascent |
| `meta.evidence.capability-demonstrations` Capability demonstrations for decision-makers | thin | independent | nascent |
| `meta.evidence.threat-modelling` Threat modelling | thin | independent | nascent |
| `meta.evidence.macrostrategy-and-prioritisation` Macrostrategy and prioritisation | active | independent | merged: macrostrategy nascent, prioritisation nascent |
| `meta.watchdogs.lab-accountability` Lab accountability tracking | active | independent, academia | covered |
| `meta.watchdogs.whistleblower-support` Whistleblower support | thin | independent | nascent |
| `meta.communications.public-opinion` Public opinion and message research | active | another field, independent | merged: public-opinion adjacent-field, narrative-strategy nascent |
| `meta.communications.public-explanation` Explaining AI risk to the public | active | independent | nascent |
| `meta.communications.advocacy` Advocacy | active | independent | covered |
| `meta.convenings.convenings-and-events` Convenings and events | active | independent | merged: cross-sector nascent, subfield-forums covered, event-infrastructure nascent |
| `meta.convenings.regional-hubs` Regional community hubs | active | independent | nascent |
| `meta.tooling.shared-research-infrastructure` Shared compute, data and environments | thin | independent, government | merged: compute-access nascent, datasets-and-environments nascent |
| `meta.tooling.ai-uplift` AI uplift for safety research | thin | independent, labs | nascent |

### Where the value departs from the owner's rule of thumb

- `model.alignment.robust-generalisation`: Rule gives thin (1 primary); set active because the reasoning describes an active research direction followed up by teams at three labs.
- `misuse.cyber.defensive-uplift`: Rule gives active (covered); set busy because the reasoning and the Misuse reviewer describe it as busy since April 2026 with a large commercial market.
- `misuse.bio-chem.biosecurity-defence`: Rule gives thin (2 primaries after Sentinel, a funder, was re-roled to secondary); set active because the reasoning describes several well-funded organisations running real pilots.
- `misuse.military.testing-and-assurance`: Rule gives thin (2 primaries after the CNAS re-role); set active because the owning field has standing government mandates (CDAO, UK Defence AI Centre).
- `misuse.fraud-and-abuse.fraud-and-impersonation`: No rule for adjacent-field nodes; set busy because the reasoning says the owning field has more people and money on this than the whole AI safety community.
- `society.international-governance.inclusive-participation`: Rule gives active (3 primaries after adding the Global Center on AI Governance); kept thin because the reasoning describes a thinly resourced need served by a few small organisations.
- `meta.talent.early-career-bottleneck`: Rule gives active (17 primaries) and the reasoning says the bottleneck itself is thinly worked; kept active because the node was renamed to pipeline capacity and the programmes are that capacity, with the note naming the binding constraint.
- `society.economic-transition.labour-disruption`: Connection set strong, not weak: adjacent-covers-it maps to weak unless developers engage strongly, and developers publish occupation-level usage data that economists use.
- `misuse.surveillance.predictive-policing-and-scoring`: Connection set weak under the A1 rule for adjacent-covers-it; the reviewer's own wording ('missing, and little needs to flow') is reflected in the note.
- `model.control.agent-sandboxing`: Adjacent-field with no primary tags: capacity thin refers to containment against a model treated as an adversary; the owning field's isolation technology is mature.
- `society.ethics-fairness-welfare.machine-ethics`: v1.3 was lab-internal with an owner_field and bridge-needed, which contradicted each other; home set to frontier labs and academia, owner_field cleared and connection not-applicable, because its own reasoning says it is better described as lab-internal than adjacent-field.

### Connection ratings for every node with another-field in home

23 nodes: 1 strong, 19 weak, 3 missing.

| Node | Owner field | Connection | v1.3 bridge | Note |
|---|---|---|---|---|
| `model.control.agent-sandboxing` | cloud, container and agent-infrastructure security (commercial sandbox providers, cloud isolation, evaluation sandboxing such as Inspect's) | weak | bridge-needed | Isolation technology already flows into developers' products and evaluation harnesses, but what should flow and mostly does not is the control community's model-as-adversary threat model into how that technology is configured and tested, which the July 2026 escape showed is needed. |
| `model.model-security.supply-chain-and-integrity` | software supply-chain security (OpenSSF, Sigstore, SLSA) and commercial ML security vendors | weak | bridge-needed | Model signing and scanning are maturing in the supply-chain community, but nobody yet provides chain of custody for a frontier model's training data and process strong enough for an auditor to rely on, which needs supply-chain security people working with AI safety evaluators. |
| `model.reliability.high-stakes-deployment-failures` | operators and regulators of critical sectors (energy, health, finance, transport) and their safety engineering practice | weak | new | Operators and regulators receive general guidance on integrating AI, but little flows from developers and safety researchers about how general-purpose models fail in operational use, or from operators back into developers' evaluations. |
| `model.reliability.safety-critical-assurance` | safety engineering and functional safety (the ISO 26262, IEC 61508, ISO/PAS 8800, UL 4600 and aviation certification communities) | weak | new | Safety-case and hazard-analysis methods are starting to inform frontier AI safety cases, but little flows the other way: developers of general-purpose models rarely engage with functional-safety standards written for narrow components. |
| `misuse.cyber.critical-infrastructure` | critical-infrastructure security: national cyber agencies and sector regulators, sector ISACs, operational technology (OT) security vendors, and financial-stability authorities | weak | bridge-needed | Threat reports and, since June 2026, gated defensive access flow from developers to the largest operators, but early warning before a model with new offensive capability ships, developer indicators into sector sharing, sector test environments into pre-release evaluations and access for smaller operators mostly do not. |
| `misuse.cyber.defensive-capacity-gaps` | international cyber capacity building (CCB) and digital development, plus domestic programmes for under-resourced operators | missing | bridge-needed | Almost nothing flows today; what should flow is affordable defensive model access for CERTs and small operators routed through bodies that can vet them, developer threat indicators shared beyond the US, UK and EU, and AI modules in existing capacity-building curricula. |
| `misuse.military.lethal-autonomy` | arms control and international humanitarian law | weak | bridge-needed | Developers' usage policies restricting weapons uses and FLI's work in the CCW are the main links; what should flow is technical input on defining and verifying human control for systems built on general-purpose models, evaluation evidence on AI targeting reliability into weapons reviews, and developers' red lines stated in terms that match the CCW's draft prohibitions. |
| `misuse.military.decision-support` | international humanitarian law and military ethics | weak | not-applicable | Automation-bias and oversight research from AI safety and human-factors work should flow into targeting doctrine and minimum-review standards, and almost none does. |
| `misuse.military.testing-and-assurance` | military test and evaluation and defence acquisition | weak | bridge-needed | General-purpose models are entering military use through defence contracts, and evaluation methods from civilian AI safety (capability, propensity and control evaluations, independent red-teaming) should flow into military testing, which still relies mostly on developer self-assessment. |
| `misuse.influence-operations.extremist-recruitment` | counter-terrorism and extremism research | weak | adjacent-covers-it | What should flow is terrorist-content signals and hash lists into model safeguards and developers' monitoring for attack-planning queries, developers' case data on attempted misuse back to researchers, and replicated research rather than case studies. |
| `misuse.fraud-and-abuse.fraud-and-impersonation` | fraud prevention, financial crime and identity verification | weak | bridge-needed | Beyond developers' disruption reports and one anti-scam partnership, little flows; what should flow is real-time abuse signals from AI and voice-cloning providers to banks and telecoms, consent and identity checks on voice cloning, and provenance signals that verification vendors can use. |
| `misuse.fraud-and-abuse.csam` | child protection | weak | bridge-needed | The link is reasonable with closed-model developers (Safety by Design commitments and NCMEC reporting) but weak to missing with open-weight model makers, fine-tuners and hosting sites; what should flow is testing of models before release, dataset screening, removal of abuse-tuned models and shared detection signals. |
| `misuse.fraud-and-abuse.ncii` | image-based sexual abuse, victim support and online-safety regulation | weak | bridge-needed | Mainstream developers ban this use, but nudify apps run on open-weight models through app stores and payment rails; what should flow is removal of real-person likeness models from hosting sites, enforcement informed by ecosystem mapping, and detection of newly generated images. |
| `misuse.surveillance.mass-surveillance` | digital rights and human rights | weak | bridge-needed | Developers' threat reports now describe disrupting surveillance tooling and one developer's refusal of domestic mass surveillance became a legal fight in 2026; what should flow is developers' case data to rights researchers and rights groups' threat models into usage policies and monitoring. |
| `misuse.surveillance.censorship` | digital rights | missing | bridge-needed | The rights field and the evaluation community barely connect; evaluation methods for censorship inside models should flow into rights research, and rights groups' country knowledge into evaluators' prompts and benchmarks. |
| `misuse.surveillance.predictive-policing-and-scoring` | digital rights and criminal-justice reform | weak | not-applicable | Most systems here come from specialist vendors rather than frontier developers, so little flows between the rights field and AI developers and little yet needs to; the link to watch is police use of general-purpose models. |
| `misuse.surveillance.export-controls` | export control and dual-use trade policy | missing | bridge-needed | Technical input on how to define and verify a controllable category of AI surveillance system, of the kind compute governance has developed for chips, should flow from AI safety into export-control policy, and currently does not. |
| `society.structural-risk.strategic-stability` | arms control and strategic studies | weak | adjacent-covers-it | The research is strong, but little of it reaches AI developers and AI governance bodies as shared standards or channels, and developers' knowledge of what their models can do in military settings rarely flows back. |
| `society.economic-transition.labour-disruption` | labour economics | strong | adjacent-covers-it | Developers now publish occupation-level usage data (Anthropic's Economic Index) that economists use and economists' analyses reach labs' policy teams; what flows less is AI safety's fast-scenario thinking into mainstream labour forecasts. |
| `society.economic-transition.safety-nets` | social policy and welfare economics | weak | bridge-needed | Fast-scenario assumptions from AI safety, and indicators of displacement from developers' usage data, should flow into mainstream welfare design, which still assumes adoption spread over many years. |
| `society.ethics-fairness-welfare.fairness-and-bias` | algorithmic fairness and accountability (ML ethics, HCI, law) | weak | adjacent-covers-it | The fairness field works mostly on deployed systems and with regulators, and its methods for representational harm and contestability reach frontier developers and the AI safety community only patchily. |
| `society.ethics-fairness-welfare.human-ai-relationships` | child online safety, psychology and human-computer interaction | weak | bridge-needed | The child-safety side now reaches developers through litigation, regulators and risk assessments, but research on adult dependency, emotional reliance and sycophancy-driven harm flows between HCI, psychology and developers only through scattered studies. |
| `meta.communications.public-opinion` | survey research and public opinion polling | weak | bridge-needed | Pollsters' own AI series rarely ask about catastrophic risk or frontier regulation, and AI safety organisations' polling is mostly advocacy-aligned; what should flow is consistent, neutral questions into established series and shared evidence on framing across communicators. |

## (c) Lens counts

Lenses are off by default. Target: 5 to 20 nodes each.

| Lens | Nodes | Which |
|---|---|---|
| loss-of-control | 13 | `model.alignment.scheming`, `model.alignment.superintelligence-alignment`, `model.alignment.automated-alignment-research`, `model.interpretability.chain-of-thought-monitorability`, `model.interpretability.internal-monitoring`, `model.control.control-evaluations`, `model.control.control-protocols`, `model.control.agent-sandboxing`, `model.control.loss-of-control-detection`, `model.evaluations.dangerous-capability-evals`, `model.evaluations.sandbagging-and-elicitation`, `model.developer-assurance.internal-deployment`, `society.structural-risk.gradual-disempowerment` |
| agents | 9 | `model.control.control-protocols`, `model.control.agent-sandboxing`, `model.control.loss-of-control-detection`, `model.model-security.agent-security`, `model.reliability.agent-reliability`, `misuse.cyber.autonomous-intrusion`, `society.structural-risk.multi-agent-risk`, `society.public-policy.agent-accountability`, `society.public-policy.agent-infrastructure` |
| democracy | 10 | `misuse.influence-operations.covert-campaigns`, `misuse.influence-operations.personalised-persuasion`, `misuse.surveillance.mass-surveillance`, `misuse.surveillance.censorship`, `misuse.surveillance.predictive-policing-and-scoring`, `society.structural-risk.concentration-of-power`, `society.structural-risk.gradual-disempowerment`, `society.epistemics.collective-reasoning`, `society.epistemics.deliberation-tools`, `society.epistemics.content-provenance` |
| defensive-technology | 10 | `model.control.formal-verification`, `misuse.cyber.defensive-uplift`, `misuse.cyber.attack-detection`, `misuse.cyber.defensive-capacity-gaps`, `misuse.bio-chem.synthesis-screening`, `misuse.bio-chem.biosecurity-defence`, `society.compute-governance.agreement-verification`, `society.epistemics.content-provenance`, `society.epistemics.decision-quality`, `meta.tooling.ai-uplift` |
| open-source | 10 | `model.alignment.unlearning-and-tamper-resistance`, `model.model-security.supply-chain-and-integrity`, `misuse.bio-chem.design-tool-misuse`, `misuse.fraud-and-abuse.csam`, `misuse.fraud-and-abuse.ncii`, `misuse.surveillance.censorship`, `misuse.open-weights.safeguard-removal`, `misuse.open-weights.uncensored-model-supply`, `misuse.open-weights.release-risk-assessment`, `society.structural-risk.concentration-of-power` |
| critical-infrastructure | 6 | `model.reliability.high-stakes-deployment-failures`, `model.reliability.safety-critical-assurance`, `misuse.cyber.defensive-uplift`, `misuse.cyber.critical-infrastructure`, `misuse.cyber.defensive-capacity-gaps`, `society.structural-risk.strategic-stability` |

49 of 118 nodes carry at least one lens; 9 carry two.

## (d) New nodes in full

### `model.reliability.agent-reliability`

- **name**: Agent reliability and error propagation
- **definition**: AI agents that carry out long, multi-step tasks fail in ways single answers do not: a small early mistake compounds over dozens of steps, agents misread instructions or tool outputs, loop, give up or wrongly declare success, and systems of several agents pass errors between them. An agent can succeed at a task one time and fail unpredictably the next, and success rates fall as tasks get longer and the required reliability rises.
- **why_it_matters**: As agents are given real permissions over code, money and infrastructure, an agent that is right most of the time but fails unpredictably can do serious damage with no bad actor and no misaligned goal involved.
- **progress_looks_like**: Agent evaluations that report consistency and failure modes rather than only average success, agent designs that detect and recover from their own errors, and deployment practice that matches an agent's permissions to its measured reliability.
- **canonical_reference**: Why Do Multi-Agent LLM Systems Fail? (Cemri, Pan, Yang et al., 2025) (https://arxiv.org/abs/2503.13657)
- **key_agendas**: Holistic Agent Leaderboard reliability dashboard (Princeton) (https://hal.cs.princeton.edu/); Measuring AI ability to complete long tasks (METR time horizons) (https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/); MAST taxonomy of multi-agent system failures (https://github.com/multi-agent-systems-failure-taxonomy/MAST)
- **boundary_notes**: Unintended failures of agents doing what they were asked. An agent pursuing goals its developers did not intend is model.alignment; an agent manipulated by an outside attacker is model.model-security.agent-security; containing an untrusted agent is model.control.agent-sandboxing; measuring how long a task an agent can complete is model.evaluations.benchmarks-and-tooling; interactions between independently operated agents are society.structural-risk.multi-agent-risk.
- **related**: model.control.agent-sandboxing; model.evaluations.benchmarks-and-tooling; model.model-security.agent-security; model.reliability.hallucination; model.reliability.high-stakes-deployment-failures; society.public-policy.agent-accountability; society.structural-risk.multi-agent-risk
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: Public measurement comes from a few academic and nonprofit efforts (Princeton's Holistic Agent Leaderboard, METR's time horizons, failure taxonomies such as MAST), while companies building agents do reliability engineering in-house and publish little.
- **home**: academia; independent-ai-safety; commercial
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: agents
- **existing_mitigations**: Human approval steps for consequential actions, limited permissions, and retries and checks built into agent frameworks; most public benchmarks still report average success rather than consistency.
- **entry_points**: Princeton's HAL harness and METR's task suites are open and can be run on public models, and reproducing a failure analysis such as MAST on a new agent system is a practical first project. Companies that deploy agents hire reliability and evaluation engineers.
- **confidence**: medium
- **organisations**: Princeton SAgE (Holistic Agent Leaderboard) (primary, https://hal.cs.princeton.edu/); Andon Labs (secondary, https://andonlabs.com); METR (secondary, https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)

### `model.reliability.hallucination`

- **name**: Hallucination and factual errors
- **definition**: Language models state false information fluently and with confidence: invented facts, citations, legal cases, software packages or medical details. OpenAI's 2025 analysis argues that standard training and evaluation reward guessing over admitting uncertainty, so the problem persists as models improve. It is distinct from dishonesty, where a model states something it has reason to believe is false.
- **why_it_matters**: People increasingly act on model outputs in law, medicine, finance and software without checking them, so confident errors cause real harm and erode trust even when nobody intends any.
- **progress_looks_like**: Models that are calibrated about what they know and abstain when unsure, evaluations that reward that behaviour rather than guessing, and measured error rates that users and deployers can rely on in high-stakes settings.
- **canonical_reference**: Why Language Models Hallucinate (Kalai, Nachum, Vempala and Zhang, OpenAI, 2025) (https://arxiv.org/abs/2509.04664)
- **key_agendas**: Evaluations that reward abstention over guessing (OpenAI) (https://openai.com/index/why-language-models-hallucinate/); Hallucination leaderboard and open detection model (Vectara) (https://github.com/vectara/hallucination-leaderboard)
- **boundary_notes**: Unintended false statements. A model knowingly stating falsehoods is a question of honesty, measured in model.evaluations.propensity-and-character-evals; errors compounding across a multi-step task are model.reliability.agent-reliability; the consequences in critical systems are model.reliability.high-stakes-deployment-failures.
- **related**: model.evaluations.propensity-and-character-evals; model.reliability.agent-reliability; model.reliability.high-stakes-deployment-failures
- **tailwind_links**: none
- **capacity**: active
- **capacity_note**: A large academic literature on factuality, commercial detection tools and leaderboards (Vectara) and developers' own work on calibration and abstention, though it is rarely framed as a safety problem.
- **home**: academia; commercial; frontier-labs
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: none
- **existing_mitigations**: Retrieval from trusted sources, citation checking, commercial and open hallucination-detection models, and human review in regulated uses; none removes the underlying incentive to guess.
- **entry_points**: Hallucination and factuality are active academic research topics with open benchmarks, and Vectara's leaderboard and detection model are open source. Developers' post-training and evaluation teams work on calibration and abstention.
- **confidence**: medium
- **organisations**: OpenAI (primary, https://openai.com/index/why-language-models-hallucinate/); Vectara (primary, https://github.com/vectara/hallucination-leaderboard)

### `model.reliability.high-stakes-deployment-failures`

- **name**: AI failures in critical systems
- **definition**: AI embedded in systems where failure is costly (energy grids and industrial control, healthcare, finance, transport) creates new ways for those systems to fail with no attacker involved: models that behave unpredictably outside the conditions they were built for, give operators confident but wrong advice, or add hard-to-audit dependencies to systems that must stay up. Guidance for operators on integrating AI safely is only beginning to appear.
- **why_it_matters**: In critical systems a single malfunction can cascade into physical harm, outages or financial loss, and the safety arguments these sectors rely on were not written for components that learn from data and behave statistically.
- **progress_looks_like**: Sector-specific guidance and testing that operators actually apply before AI goes into critical systems, incident reporting that distinguishes AI failures, and reliable fallback to safe manual operation when an AI component misbehaves.
- **canonical_reference**: Principles for the Secure Integration of Artificial Intelligence in Operational Technology (CISA, NSA, NCSC and partners) (https://www.cisa.gov/resources-tools/resources/principles-secure-integration-artificial-intelligence-operational-technology)
- **key_agendas**: CISA, NSA and partners: principles for secure integration of AI in operational technology (https://www.cisa.gov/resources-tools/resources/principles-secure-integration-artificial-intelligence-operational-technology); International AI Safety Report 2026, on reliability failures (https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026)
- **boundary_notes**: Failures of AI inside critical systems with no attacker. AI-enabled attacks on the same systems are misuse.cyber.critical-infrastructure; formal assurance of AI in certified products such as vehicles and aircraft is model.reliability.safety-critical-assurance; unreliable agents in general are model.reliability.agent-reliability.
- **related**: misuse.cyber.critical-infrastructure; model.reliability.agent-reliability; model.reliability.hallucination; model.reliability.safety-critical-assurance
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: National cyber agencies have issued joint principles for integrating AI into operational technology, but sector-specific testing and incident data on AI failures in critical systems are still scarce.
- **home**: government; another-field
- **owner_field**: operators and regulators of critical sectors (energy, health, finance, transport) and their safety engineering practice
- **connection**: weak
- **connection_note**: Operators and regulators receive general guidance on integrating AI, but little flows from developers and safety researchers about how general-purpose models fail in operational use, or from operators back into developers' evaluations.
- **lenses**: critical-infrastructure
- **existing_mitigations**: Sector regulation and engineering practice (redundancy, manual fallback, change control) limit what a single component failure can do, and the joint principles from CISA, NSA, NCSC and international partners give operators AI-specific guidance for operational technology.
- **entry_points**: National cyber and infrastructure agencies such as CISA and NCSC publish guidance and hire. For AI safety researchers, testing how general-purpose models behave in operational settings, and sharing that with operators, is open ground.
- **confidence**: medium
- **organisations**: CISA (AI security work) (primary, https://www.cisa.gov/resources-tools/resources/principles-secure-integration-artificial-intelligence-operational-technology); UK National Cyber Security Centre (NCSC) (primary, https://www.cisa.gov/resources-tools/resources/principles-secure-integration-artificial-intelligence-operational-technology)

### `model.reliability.safety-critical-assurance`

- **name**: Safety-critical AI assurance
- **definition**: Showing, to the standard regulators require, that an AI component in a safety-critical product (a car, aircraft, medical device or railway system) is safe enough to certify. Established safety engineering relies on specified requirements, hazard analysis and exhaustive testing, which machine-learning components do not fit well, so the functional-safety community has been writing new guidance: ISO/PAS 8800 for AI in road vehicles, UL 4600 for autonomous products, EASA's guidance for machine learning in aviation, and assurance methods such as York's AMLAS.
- **why_it_matters**: Without accepted methods for assuring learned components, either unsafe AI enters products that can kill people or useful AI is kept out, and frontier AI safety cases miss decades of practice from these fields.
- **progress_looks_like**: Accepted assurance methods and standards for machine-learning components are applied in certification and extended to products built on general-purpose models, and frontier AI safety cases draw on the same practice.
- **canonical_reference**: Guidance on the Assurance of Machine Learning in Autonomous Systems (AMLAS), Centre for Assuring Autonomy, University of York (https://www.york.ac.uk/assuring-autonomy/guidance/amlas/)
- **key_agendas**: ISO/PAS 8800:2024, Road vehicles: safety and artificial intelligence (https://www.iso.org/standard/83303.html); UL 4600, Standard for Safety for the Evaluation of Autonomous Products (https://ulse.org/focus-areas/travel-safety/autonomous-vehicles/); EASA Artificial Intelligence Concept Paper Issue 2: guidance for Level 1 and 2 machine learning applications (https://www.easa.europa.eu/en/document-library/general-publications/easa-artificial-intelligence-concept-paper-issue-2)
- **boundary_notes**: Certifying AI inside regulated safety-critical products. Frontier developers' own evidenced safety arguments are model.developer-assurance.safety-cases; failures of AI in critical infrastructure operations are model.reliability.high-stakes-deployment-failures; AI-specific standards for AI governance generally are society.public-policy.standards; military systems are misuse.military.testing-and-assurance.
- **related**: misuse.military.testing-and-assurance; model.control.formal-verification; model.developer-assurance.safety-cases; model.reliability.high-stakes-deployment-failures; society.public-policy.standards
- **tailwind_links**: none
- **capacity**: active
- **capacity_note**: The functional-safety community has produced AI-specific guidance (York's AMLAS, ISO/PAS 8800, UL 4600, EASA's machine-learning guidance) and certifies products against it, mostly for narrow machine-learning components.
- **home**: another-field; academia
- **owner_field**: safety engineering and functional safety (the ISO 26262, IEC 61508, ISO/PAS 8800, UL 4600 and aviation certification communities)
- **connection**: weak
- **connection_note**: Safety-case and hazard-analysis methods are starting to inform frontier AI safety cases, but little flows the other way: developers of general-purpose models rarely engage with functional-safety standards written for narrow components.
- **lenses**: critical-infrastructure
- **existing_mitigations**: Functional-safety standards (IEC 61508, ISO 26262, ISO 21448 on the safety of the intended functionality, DO-178C in aviation) and certification regimes already govern these products, and AI-specific extensions now exist; they were written for narrow machine-learning components rather than general-purpose models.
- **entry_points**: The Centre for Assuring Autonomy at York publishes its guidance openly, and the committees behind ISO/PAS 8800 and UL 4600 take expert contributors. Safety engineers can bring hazard-analysis and safety-case practice into frontier AI safety-case work, for example alongside UK AISI's safety-case team.
- **confidence**: medium
- **organisations**: Centre for Assuring Autonomy (University of York) (primary, https://www.york.ac.uk/assuring-autonomy/guidance/amlas/); European Union Aviation Safety Agency (EASA) (primary, https://www.easa.europa.eu/en/document-library/general-publications/easa-artificial-intelligence-concept-paper-issue-2); UL Standards & Engagement (primary, https://ulse.org/focus-areas/travel-safety/autonomous-vehicles/)

### `model.alignment.automated-alignment-research`

- **name**: Automated alignment research
- **definition**: Using AI systems to do much of the work of alignment research itself (running experiments, proposing and checking methods, writing up results) and being able to trust what they produce. Frontier labs name this as their main plan for aligning systems more capable than their overseers, but it depends on verifying AI-produced safety work that humans may not be able to check line by line, and on catching a model that subtly sabotages or sandbags the research.
- **why_it_matters**: If the plan works, alignment research could keep pace with capabilities; if AI-produced safety work is trusted without being verifiable, a subtly misaligned model could steer the very research meant to catch it.
- **progress_looks_like**: Demonstrations that AI research agents produce alignment results humans can verify, evaluations that catch sabotage and sandbagging of research, and published criteria for when a developer would rely on AI-produced safety work.
- **canonical_reference**: Can we safely automate alignment research? (Joe Carlsmith, 2025) (https://joecarlsmith.com/2025/04/30/can-we-safely-automate-alignment-research/)
- **key_agendas**: Automated Alignment Researchers (Anthropic) (https://www.anthropic.com/research/automated-alignment-researchers); Automated researchers can subtly sandbag (Anthropic Alignment Science, 2025) (https://alignment.anthropic.com/2025/automated-researchers-sandbag); Automated alignment research (Superalignment framing, OpenAI 2023) (https://openai.com/index/introducing-superalignment/)
- **boundary_notes**: Trusting and scaling AI-produced safety research. Alignment approaches for systems beyond any overseer that do not rest on automation are model.alignment.superintelligence-alignment; independent organisations adopting AI tools for their own research is meta.tooling.ai-uplift; a model deliberately underperforming on evaluations is model.evaluations.sandbagging-and-elicitation; automated AI R&D in general, and the internal deployments that run it, are model.developer-assurance.internal-deployment.
- **related**: meta.tooling.ai-uplift; model.alignment.scalable-oversight; model.alignment.superintelligence-alignment; model.developer-assurance.internal-deployment; model.evaluations.sandbagging-and-elicitation
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: The labs' main plan for aligning more capable systems, but public work is mostly Anthropic's experiments with automated alignment researchers and its studies of subtle sandbagging; OpenAI's dedicated team was disbanded in 2024.
- **home**: frontier-labs
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: loss-of-control
- **existing_mitigations**: Developers test automated researchers on problems with known answers before relying on them, and control-style monitoring of internal agents is starting to be applied; no developer has published criteria for when AI-produced safety work is trusted.
- **entry_points**: Anthropic's Alignment Science team and the Anthropic Fellows Program publish and hire in this area. Outside the labs, the open work is evaluations for research sabotage and sandbagging, which can be built on open-weight models.
- **confidence**: medium
- **organisations**: Anthropic (primary, https://www.anthropic.com/research/automated-alignment-researchers); OpenAI (secondary, https://openai.com/index/introducing-superalignment/)

### `model.developer-assurance.internal-deployment`

- **name**: Automated AI R&D and internal deployment
- **definition**: Frontier developers increasingly use their most capable models inside the company, often before or without public release, including to automate parts of AI research and development itself. Lab frameworks and the International AI Safety Report treat AI that substantially speeds up AI R&D as a key threshold, because it could accelerate progress faster than safeguards and oversight are built, while internal deployments usually face weaker safeguards and no outside scrutiny.
- **why_it_matters**: A dangerous or misaligned model could do its most consequential work inside the company that built it, with privileged access to code, compute and future models, before any outside evaluator, regulator or user sees it.
- **progress_looks_like**: Developers define AI R&D capability thresholds precisely, apply the same or stronger safeguards to internal use as to public release, monitor internal agents, and share information about internal deployment of highly capable systems with appropriate outside bodies.
- **canonical_reference**: AI Behind Closed Doors: a Primer on the Governance of Internal Deployment (Apollo Research, 2025) (https://www.apolloresearch.ai/governance/ai-behind-closed-doors-a-primer-on-the-governance-of-internal-deployment)
- **key_agendas**: RE-Bench: evaluating frontier AI R&D capabilities against human experts (METR) (https://metr.org/blog/2024-11-22-evaluating-r-d-capabilities-of-llms/); Machine-learning R&D critical capability levels in Google DeepMind's Frontier Safety Framework (https://deepmind.google/blog/introducing-the-frontier-safety-framework/); Internal deployment of AI models and systems in the EU AI Act (Apollo Research) (https://www.apolloresearch.ai/governance/internal-deployment-eu-ai-act)
- **boundary_notes**: How developers govern AI used inside the company, including to automate AI research, whether they do so voluntarily or because a law requires it. Measuring AI R&D capability is model.evaluations.dangerous-capability-evals; controlling a possibly misaligned internal agent is model.control.control-protocols; trusting AI-produced alignment research specifically is model.alignment.automated-alignment-research; a small group using internally deployed AI to gain outsized power is society.structural-risk.concentration-of-power.
- **related**: model.alignment.automated-alignment-research; model.control.control-protocols; model.developer-assurance.frontier-safety-frameworks; model.developer-assurance.internal-safety-governance; model.evaluations.dangerous-capability-evals; society.structural-risk.concentration-of-power
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: Apollo Research's primer set out the governance problem in 2025, METR measures AI R&D capability, and lab frameworks name AI R&D thresholds, but internal deployment policies are neither public nor externally checked.
- **home**: independent-ai-safety; frontier-labs
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: loss-of-control
- **existing_mitigations**: Frontier safety frameworks include AI R&D or machine-learning R&D capability levels with associated safeguards, and some developers apply control-style monitoring to internal agent deployments; none of this is externally verified, and whether laws such as the EU AI Act reach internal use is contested.
- **entry_points**: Apollo Research's governance team publishes on internal deployment and hires governance researchers, and METR's RE-Bench and time-horizon work are open starting points for measuring AI R&D capability. Inside developers, frontier safety and security teams own the internal policies.
- **confidence**: medium
- **organisations**: Apollo Research (primary, https://www.apolloresearch.ai/governance/ai-behind-closed-doors-a-primer-on-the-governance-of-internal-deployment); Google DeepMind (secondary, https://deepmind.google/blog/introducing-the-frontier-safety-framework/); Institute for Progress (secondary, https://ifp.org); METR (secondary, https://metr.org/blog/2024-11-22-evaluating-r-d-capabilities-of-llms/)

### `model.developer-assurance.deployment-misuse-safeguards`

- **name**: Deployment safeguards against misuse
- **definition**: The systems a developer wraps around a deployed model to stop people using it for harm: input and output classifiers, monitoring of usage patterns across accounts, rapid response when a new attack appears, access tiers and know-your-customer checks for sensitive capabilities, and enforcement from warnings to account bans and referrals to law enforcement. This is how a developer turns a usage policy into practice, and how it argues that a model with dangerous capabilities can still be released.
- **why_it_matters**: Refusals trained into a model are brittle, so for models near dangerous capability thresholds the safeguards around them are what stands between an attacker and real uplift, and frontier safety frameworks depend on those safeguards being strong enough.
- **progress_looks_like**: Safeguards whose effectiveness is measured against adaptive attackers and independently evaluated before release, with shared methods for assessing them across developers.
- **canonical_reference**: Principles for safeguard evaluation (UK AI Security Institute, February 2025) (https://www.aisi.gov.uk/blog/principles-for-safeguard-evaluation)
- **key_agendas**: Constitutional Classifiers (Anthropic) (https://www.anthropic.com/research/constitutional-classifiers); Safeguards for biological capabilities: system-wide monitors, human review and enforcement (OpenAI, 2025) (https://openai.com/index/preparing-for-future-ai-capabilities-in-biology/); Anthropic Safeguards Research Team agenda (https://alignment.anthropic.com/2025/introducing-safeguards-research-team/)
- **boundary_notes**: The safeguards system around a deployed model, including classifiers, monitoring and enforcement, whether a developer adopts it voluntarily or a law requires it. Making the model itself resist adversarial prompts is model.model-security.jailbreak-robustness; detecting attacks in the wild across providers is misuse.cyber.attack-detection; stripping safeguards from open weights is misuse.open-weights.safeguard-removal; when safeguards are required is set by model.developer-assurance.frontier-safety-frameworks.
- **related**: misuse.bio-chem.knowledge-uplift; misuse.cyber.attack-detection; misuse.open-weights.safeguard-removal; model.developer-assurance.frontier-safety-frameworks; model.model-security.jailbreak-robustness
- **tailwind_links**: none
- **capacity**: active
- **capacity_note**: Every major developer runs safeguards teams building classifiers, monitoring and enforcement, and UK AISI evaluates safeguards and has published principles for doing so.
- **home**: frontier-labs; government
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: none
- **existing_mitigations**: Major developers run layered safeguards (usage policies, classifiers, account-level monitoring, human review and enforcement), with heightened protections against biological misuse applied from 2025, and UK AISI has published principles for evaluating them.
- **entry_points**: Frontier developers' safeguards and trust-and-safety teams hire engineers, analysts and policy staff, and Anthropic's Safeguards Research Team publishes its methods. UK AISI's safeguards work and public jailbreak bounties and arenas, such as Gray Swan's, are ways to test safeguards from outside.
- **confidence**: medium
- **organisations**: Anthropic (primary, https://alignment.anthropic.com/2025/introducing-safeguards-research-team/); OpenAI (primary, https://openai.com/index/preparing-for-future-ai-capabilities-in-biology/); UK AI Security Institute (primary, https://www.aisi.gov.uk/blog/principles-for-safeguard-evaluation)

### `society.public-policy.agent-infrastructure`

- **name**: Agent identity, visibility and protocols
- **definition**: The shared infrastructure that would let people, companies and governments know which AI agents are acting, on whose behalf and with what permissions: identifiers and authentication for agents, logs and disclosure of agent activity, and the protocols agents use to call tools and talk to each other. Most of this is being built now by companies and standards bodies, and whether it supports accountability depends on choices made early.
- **why_it_matters**: Without identity and visibility, harms caused by agents cannot be traced, rules for agents cannot be enforced, and an incident involving many agents cannot be reconstructed or stopped.
- **progress_looks_like**: Widely adopted open standards for agent identity and authorisation, activity records that incident investigators and regulators can use, and protocols that carry accountability information by default.
- **canonical_reference**: Infrastructure for AI Agents (Chan et al., 2025) (https://arxiv.org/abs/2501.10114)
- **key_agendas**: AI Agent Standards Initiative (NIST Center for AI Standards and Innovation, February 2026) (https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure); IDs for AI Systems (GovAI) (https://www.governance.ai/research-paper/ids-for-ai-systems); The 2025 AI Agent Index: technical and safety features of deployed agents (https://arxiv.org/abs/2602.17753)
- **boundary_notes**: Rules and shared infrastructure for identifying and tracing agents across developers and deployers. Securing a particular agent against attack is model.model-security.agent-security; who is liable when an agent causes harm is society.public-policy.agent-accountability; standards for AI in general are society.public-policy.standards; interactions between agents as a systemic risk are society.structural-risk.multi-agent-risk.
- **related**: meta.evidence.incident-investigation; model.model-security.agent-security; society.public-policy.agent-accountability; society.public-policy.standards; society.structural-risk.multi-agent-risk
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: NIST launched an AI Agent Standards Initiative in February 2026 and GovAI publishes the core research on agent IDs and visibility, while the protocols themselves are being built by companies with little accountability design.
- **home**: government; independent-ai-safety; commercial
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: agents
- **existing_mitigations**: Early standards work, including NIST's AI Agent Standards Initiative (launched February 2026, with a workstream on agent identity and authorisation), industry protocols for tool use and agent-to-agent communication, and research proposals for agent IDs and activity logs; no identity scheme is yet widely adopted.
- **entry_points**: NIST's initiative has sought public input, and GovAI publishes the core research. Engineers working on agent protocols and authentication in industry are building the infrastructure itself, and proposing accountability features there is open ground.
- **confidence**: medium
- **organisations**: Centre for the Governance of AI (GovAI) (primary, https://www.governance.ai/research-paper/ids-for-ai-systems); US Center for AI Standards and Innovation (CAISI) (primary, https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure)

### `society.public-policy.agent-accountability`

- **name**: Accountability and liability for agent actions
- **definition**: Who is responsible when an AI agent acting on someone's behalf causes harm: the developer of the model, the company that deployed the agent, the user who instructed it, or nobody. Existing law assumes a person or company takes each consequential action; agents that sign up to services, move money or run code blur that, and proposals range from applying agency law to requiring agents to follow the law by design.
- **why_it_matters**: If nobody is clearly accountable for what agents do, harms go uncompensated, the incentive to deploy agents carefully weakens, and courts and legislators settle the question case by case after the damage.
- **progress_looks_like**: A clear allocation of responsibility among developers, deployers and users for agent actions, tested in law or regulation, and agents designed to follow the law and leave the records that accountability needs.
- **canonical_reference**: Governing AI Agents (Noam Kolt, Notre Dame Law Review, 2025) (https://arxiv.org/abs/2501.07913)
- **key_agendas**: Law-Following AI: designing AI agents to obey human laws (Institute for Law & AI) (https://law-ai.org/law-following-ai/)
- **boundary_notes**: Responsibility for harm caused by agents specifically. Liability for AI harms in general is society.public-policy.liability; identifying and tracing agents is society.public-policy.agent-infrastructure; building agents that do not pursue unintended goals is model.alignment.
- **related**: model.reliability.agent-reliability; society.public-policy.agent-infrastructure; society.public-policy.liability
- **tailwind_links**: none
- **capacity**: thin
- **capacity_note**: Legal scholarship on governing agents (Kolt) and LawAI's work on law-following AI set out the questions, but no organisation focuses on responsibility for agent actions and no jurisdiction has settled it.
- **home**: independent-ai-safety; academia
- **owner_field**: none
- **connection**: not-applicable
- **connection_note**: none
- **lenses**: agents
- **existing_mitigations**: General tort, contract, product-liability and agency law apply, and the revised EU Product Liability Directive brings AI software under strict liability for products placed on the market from December 2026; none of it was written with autonomous agents in mind.
- **entry_points**: The Institute for Law & AI publishes on law-following AI and runs a workshop series on it; legal scholars working on agency law and product liability can contribute directly. Developers' terms of service for agent products are where responsibility is allocated in practice today.
- **confidence**: medium
- **organisations**: Institute for Law & AI (LawAI) (primary, https://law-ai.org/law-following-ai/)

### Merged nodes, for reading

**`misuse.military.lethal-autonomy` Autonomous weapons and their regulation** (from misuse.military.lethal-autonomy, misuse.military.arms-control). Weapon systems that, once activated, select and apply force to targets without further human intervention, including loitering munitions and drones with autonomous terminal guidance of the kind now used at scale in Ukraine, together with the treaty, legal and policy regimes that govern them. Covers how much human control is retained in practice, how international humanitarian law applies, and the international effort to regulate these weapons, which since 2014 has run mainly through the UN Convention on Certain Conventional Weapons (CCW), alongside national policy and non-binding declarations. *Boundary:* Weapons that engage without a human authorising each strike, and the arms-control and legal work on them inside and outside the CCW. Where a human formally decides but relies on AI recommendations, see misuse.military.decision-support; testing and assurance of military AI is misuse.military.testing-and-assurance; broader strategic-stability effects are society.structural-risk.strategic-stability; general international AI governance is society.international-governance.treaties. The map keeps domain-specific governance with its domain so that each community stays in one place. *Capacity:* active. The arms-control and humanitarian-law community has worked on this since 2014 (the CCW process, the ICRC, UNIDIR, Stop Killer Robots, Article 36, Human Rights Watch), with FLI as the main AI-safety-native bridge and a November 2026 decision on whether to negotiate.

**`meta.funding.funding-infrastructure` Funding infrastructure** (from meta.funding.fiscal-sponsorship, meta.funding.prizes, meta.funding.incubation). The mechanisms that turn money into working organisations and results: fiscal sponsors and shared back-office services that let a new project operate within weeks, prizes and competitions that pay for verified results, and incubators that find and support founders for identified gaps, including labs built around agendas that have no team. Each exists in the AI safety field, but none has kept pace with the number of gaps funders now name. *Boundary:* Mechanisms that turn money into organisations and results. Where the money comes from, and how concentrated it is, is meta.funding.funding-concentration; the benchmarks a prize might use are model.evaluations.benchmarks-and-tooling; people joining existing organisations are meta.talent.experienced-professionals. *Capacity:* active. Several fiscal sponsors and shared-services providers, two incubators and recurring prize arenas operate, and Coefficient Giving still names sponsorship, incubation and large prizes as open gaps.

**`meta.convenings.convenings-and-events` Convenings and events** (from meta.convenings.cross-sector, meta.convenings.subfield-forums, meta.convenings.event-infrastructure). The recurring events and shared event infrastructure that bring people working on AI safety, security and governance together: cross-sector gatherings of lab staff, officials, academics, journalists and civil society; focused forums for one technical or policy subfield; and the venues, logistics and event-running capacity that let any organisation host these without rebuilding that capacity each time. *Boundary:* Bringing people together, whatever the topic, through events and the infrastructure behind them. Place-based communities outside the main hubs are meta.convenings.regional-hubs; dialogue between countries' research and policy communities, including IDAIS, is society.international-governance.great-power-dialogue; government summits sit in society.international-governance; the technical content belongs to the relevant node in another layer. *Capacity:* active. Recurring subfield forums (ControlConf, the AI Security Forum, the Alignment Workshop series), a few cross-sector gatherings (The Curve, the Athens Roundtable) and one strong shared venue (Lighthaven), with no general events service usable anywhere.

**`meta.talent.senior-and-specialist-recruitment` Senior and specialist capacity** (from meta.talent.senior-and-specialist-recruitment, meta.tooling.on-demand-expertise). Safety organisations, frontier projects and lab safety teams struggle to get senior or narrowly specialised expertise, such as security engineers with the nation-state threat experience needed to reach RAND security levels SL4 and SL5, policy veterans with legislative drafting experience, or legal and technical specialists for a one-off question. Ordinary recruiting channels and pay do not reach these people, and small organisations cannot justify keeping every specialist on staff, so the field needs both a way to hire them and a way to borrow them on demand. *Boundary:* Getting scarce senior and specialist expertise into the field, by hiring it or borrowing it. Broad matching of people to roles is meta.talent.matchmaking; general on-ramps are meta.talent.experienced-professionals; the security work itself, and Tailwind's 'Security capacity buildout' initiative, sit with model.model-security.weights-security; the lab functions this expertise feeds are model.developer-assurance. *Capacity:* thin. Impact Ops headhunts for high-impact organisations, Heron and security bootcamps build security pipelines, and GovAI, the Frontier Model Forum and METR supply advice informally, but nobody reliably finds nation-state-grade security engineers or runs an on-demand advisory service.

**`meta.communications.public-opinion` Public opinion and message research** (from meta.communications.public-opinion, meta.communications.narrative-strategy). Systematic research on what the public and particular constituencies think about AI risk and regulation, and on how they respond to different ways of describing it: rigorous, repeated polling on one side, and audience research and message testing on the other. Covers the overall picture that the field's many communicators create, as opposed to occasional surveys run for one campaign's needs. *Boundary:* Measuring what the public thinks and testing how it responds. Campaigning to change opinion or policy is meta.communications.advocacy; explaining AI risk to the public is meta.communications.public-explanation; the resulting policy debate is society.public-policy. *Capacity:* active. Established pollsters run recurring AI attitude surveys and AIPI and Seismic Foundation commission AI-risk polling and message testing, without neutral, consistent tracking of questions on catastrophic risk and frontier regulation.

**`meta.evidence.macrostrategy-and-prioritisation` Macrostrategy and prioritisation** (from meta.strategy.macrostrategy, meta.strategy.prioritisation). Research that builds integrated scenarios of how transformative AI could unfold and uses them, together with evidence about the field itself, to judge which interventions, organisations and gaps deserve scarce money and talent. Scenario work stress-tests strategy rather than producing a single forecast; prioritisation compares interventions and studies the field as an ecosystem (which sub-problems are neglected, how organisations divide the work, how growth should be sequenced). *Boundary:* Scenario reasoning and deciding where effort should go. Calibrated forecasts of measurable trends are meta.evidence.capability-forecasting; synthesis of what is known about the risks is meta.evidence.state-of-risk; explicit models of how catastrophes could unfold are meta.evidence.threat-modelling; moving money is meta.funding; economy-specific scenarios are society.economic-transition.labour-disruption. *Capacity:* active. A few small, well-regarded groups build scenarios (the AI Futures Project, Forethought) and several organisations prioritise as part of wider mandates (Coefficient Giving, 80,000 Hours, Arb Research's shallow review).

**`meta.tooling.shared-research-infrastructure` Shared compute, data and environments** (from meta.tooling.compute-access, meta.tooling.datasets-and-environments). Shared compute (GPU clusters, cloud credits, remote access to the internals of large open models) and public datasets and test environments built to advance safety research, available to nonprofit and academic researchers who cannot build their own. Frontier labs have all of these in-house; outside them, empirical safety research is limited by what researchers can buy, borrow or rebuild from scratch. *Boundary:* Shared compute, data and environments for safety research. Benchmarks and harnesses built to measure models are model.evaluations.benchmarks-and-tooling; government rules on who can access compute are society.compute-governance; AI tools that speed up research are meta.tooling.ai-uplift. *Capacity:* thin. The CAIS compute cluster (closed to new applicants), NDIF's access to open-model internals and open environment libraries such as ControlArena exist, but nothing operates at the scale Tailwind describes.

## (e) Low-confidence edits from the v1.3 report, applied and skipped

Section (c) of the v1.3 report lists 30 low-confidence edits (3 Model, 14 Misuse, 4 Society, 9 Meta), one of which (misuse[149]) was held together with two medium-confidence edits on the same node (misuse[147], misuse[148]); the decisions file calls the rest 'the other 27', but the list has 29 besides misuse[149], and all 30 are in the table below. Applied unless an edit added a tag without a URL or read as a guess. The connection values the Misuse reviewer proposed for decision-support (misuse[92]) and predictive policing (misuse[150]) were used as the basis for the connection notes. The environmental-costs node (society[94]) is not added: A8 records it as out of scope for now.

| Edit | Node (v1.3 slug) | Proposed | Result | Note |
|---|---|---|---|---|
| model[43] | `model.interpretability.chain-of-thought-monitorability` | edges: METR re-evidenced with its own CoT research | applied |  |
| model[102] | `model.model-security.weights-security` | boundary_notes: name model extraction by distillation | applied |  |
| model[129] | `model.developer-assurance.safety-cases` | canonical_reference: Clymer et al. (2024) | applied |  |
| misuse[41] | `misuse.cyber.critical-infrastructure` | entry_points rewrite | applied |  |
| misuse[55] | `misuse.cyber.defensive-capacity-gaps` | entry_points rewrite | applied |  |
| misuse[73] | `misuse.bio-chem.chemical-weapons` | entry_points rewrite | applied |  |
| misuse[74] | `misuse.bio-chem.biosecurity-defence` | edges: Sentinel (a funder) primary to secondary | applied |  |
| misuse[89] | `misuse.military.decision-support` | status to adjacent-field | applied | as home another-field (A1) |
| misuse[90] | `misuse.military.decision-support` | owner_field: international humanitarian law and military ethics | applied |  |
| misuse[91] | `misuse.military.decision-support` | bridge_status bridge-needed | applied | as connection weak, with the note from misuse[92] |
| misuse[93] | `misuse.military.decision-support` | edges: add ICRC (secondary) | applied |  |
| misuse[98] | `misuse.military.testing-and-assurance` | edges: CNAS primary to secondary | applied | evidence URL unchanged; the reviewer asked for a specific CNAS publication, which was not supplied |
| misuse[112] | `misuse.influence-operations.extremist-recruitment` | bridge_status bridge-needed | applied | as connection weak |
| misuse[113] | `misuse.influence-operations.extremist-recruitment` | bridge_reasoning rewrite | applied | condensed into connection_note |
| misuse[142] | `misuse.surveillance.mass-surveillance` | edges: add Anthropic (secondary) | applied | evidence URL is the September 2026 threat report already used on four other edges |
| misuse[149] | `misuse.surveillance.predictive-policing-and-scoring` | bridge_status adjacent-covers-it (held with misuse[147], misuse[148]) | applied | as home another-field, owner_field digital rights and criminal-justice reform, connection weak (B) |
| misuse[160] | `misuse.open-weights.uncensored-model-supply` | existing_mitigations: Civitai payment-processor example | applied |  |
| society[29] | `society.public-policy.regulatory-capacity` | canonical_reference: Ada Lovelace Institute (2023) | applied |  |
| society[40] | `society.international-governance.great-power-dialogue` | edges: add CnAISDA and Brookings (secondary) | partly applied | CnAISDA added; Brookings skipped because the edit gives no evidence URL |
| society[42] | `society.international-governance.inclusive-participation` | key_agendas: add India AI Impact Summit and Global Index on Responsible AI | partly applied | Global Index added; the summit item skipped because its URL is a placeholder pointing at the 2023 UK summit; the existing UN Advisory Body item kept because the edit gave no reason to drop it |
| society[43] | `society.international-governance.inclusive-participation` | edges: add Global Center on AI Governance (primary, new org) | applied | new organisation created at low confidence |
| meta[6] | `meta.funding.fiscal-sponsorship` | reference_needs_replacing: false | applied | the node is merged into meta.funding.funding-infrastructure, whose reference (the Tailwind initiatives page) carries the flag false |
| meta[14] | `meta.funding.incubation` | edges: add Halcyon Futures (secondary) | skipped | reads as a guess: the reviewer asks for Halcyon's incubation offer to be checked before adding, and the evidence is its homepage |
| meta[39] | `meta.evidence.incident-investigation` | coverage_reasoning rewrite | applied | as capacity_note; the request to check the organisation Tailwind calls 'Nightingale' is kept out of public text and listed in this report |
| meta[71] | `meta.convenings.event-infrastructure` | edges: add LISA and Constellation (secondary) | applied | on the merged node meta.convenings.convenings-and-events |
| meta[82] | `meta.tooling.compute-access` | related: datasets, funding-concentration, cloud-kyc | applied | on the merged node meta.tooling.shared-research-infrastructure |
| meta[84] | `meta.tooling.datasets-and-environments` | canonical_reference: ControlArena | partly applied | URL checked and live; listed as a key agenda of the merged node, whose single canonical reference is the CAIS compute cluster page |
| meta[96] | `meta.strategy.threat-modelling` | edges: add Google DeepMind (secondary) | applied | arXiv 2504.01849 is the correct ID for 'An Approach to Technical AGI Safety and Security' |
| meta[98] | `meta.strategy.macrostrategy` | entry_points: drop Median Group | applied | on the merged node meta.evidence.macrostrategy-and-prioritisation |
| meta[99] | `meta.strategy.macrostrategy` | edges: remove Median Group | applied |  |

Held edits (B): misuse[147] (status adjacent-field), misuse[148] (owner field digital rights and criminal-justice reform) and misuse[149] (adjacent-covers-it) applied together as home another-field, owner_field "digital rights and criminal-justice reform" and connection weak under the A1 rule for adjacent-covers-it. The reviewer's own view ("missing, and little needs to flow") is carried in the connection note.

Summary: 26 applied in full, 3 partly applied, 1 skipped.

Needs evidence before tagging (logged, not created):

- google-deepmind on `model.alignment.automated-alignment-research`: Named in the v1.3 superintelligence reasoning as pursuing the automated-alignment plan; no public source found in the dataset.
- google-deepmind on `model.developer-assurance.deployment-misuse-safeguards`: Runs safeguards for Gemini (production cyber-misuse probes are cited on internal-monitoring), but no safeguards-specific evidence URL in the dataset.
- anthropic on `model.developer-assurance.internal-deployment`: RSP AI R&D thresholds and internal control-style monitoring are cited elsewhere, but the RSP v3.0 text was not checked for the AI R&D threshold in this pass.
- gray-swan-ai on `model.developer-assurance.deployment-misuse-safeguards`: Its arenas test developers' safeguards; no safeguards-specific evidence URL in the dataset.
- mit (AI Agent Index authors) on `society.public-policy.agent-infrastructure`: The 2025 AI Agent Index documents deployed agents' safety features; the authoring organisation was not confirmed.
- brookings-institution-ai-governance on `society.international-governance.great-power-dialogue`: Low-confidence review edit society[40] gave no evidence URL.
- The organisation Tailwind calls 'Nightingale' in connection with incident investigations still needs a human check (meta[39]); it is not named in public text.

## (f) Validation

| Check | Result |
|---|---|
| Unique slugs across layers, sub-areas and nodes | pass |
| Every node slug sits under an existing sub-area | pass |
| related is symmetric, with no dangling links | pass |
| No dangling slugs in boundary_notes, scope_rules, sub-area definitions or any other node text field | pass |
| Every edge resolves to an existing organisation and node, has an evidence URL and a valid role, and no edge sits on a closed organisation | pass |
| No duplicate edges | pass |
| Every one of the 36 Tailwind titles maps to exactly one node, and no unknown title is used | pass |
| Capacity, home and connection use only the allowed values; owner_field, connection and connection_note are set exactly when home includes another-field | pass |
| No retired field remains on any node; provenance fields present on every node | pass |
| capacity_note is one sentence on every node | pass |
| Every lens lights 5 to 20 nodes | pass |
| No sub-area has more than eight nodes (merge-review trigger) | pass |
| connection_note is one sentence wherever it is set | pass |
| map-data.json and 10-map-view-data.json match the taxonomy and edges; every related slug and organisation in the compact view resolves | pass |
| Every v1.3 node is still present or redirects through node-aliases.csv to a present node | pass |
| Every alias target exists | pass |
| No process language in public fields (node text, layer and sub-area text, scope, display rules, lens definitions, new edge notes) | pass |
| No em-dashes in taxonomy-v2.json, map-data.json, 10-map-view-data.json, orgs.csv, edges.csv, org-aliases.csv, node-aliases.csv; all JSON parses | pass |

Process-language scan: 1 hit(s), 1 allowed: `misuse.fraud-and-abuse.csam.why_it_matters` ("confirmed" reports an IWF finding, not an editing step).

Funder rows: 2 filled from existing data (ai-risk-mitigation-fund funding_model philanthropic, us-national-science-foundation-nsf funding_model government). Every organisation typed funder or vc, or tagged on a funding node, now has funding_model and commercial_model filled except: hack-club (funding_model unknown; typed nonprofit, an operations provider rather than a funder), impact-ops (funding_model unknown; typed field-building, an operations provider rather than a funder).

Sizes: map-data.json 879,879 bytes; 10-map-view-data.json 239,126 bytes.

## (g) Decisions I made, and what could not be done cleanly

- **Meta at 22 needed four merges beyond the ones the decisions name.** The named merges (convenings to two, funding to two) take Meta from 30 to 26, and folding strategy into evidence merges sub-areas, not nodes. To reach 20 to 22 I made four further pairwise merges, choosing those where the same organisations and the same failure mode sit on both sides: on-demand expertise into senior and specialist recruitment (the owner allowed this; hiring versus borrowing the same scarce people; renamed 'Senior and specialist capacity'); narrative strategy into public opinion (both are research on the public, and Seismic Foundation was already on both; renamed 'Public opinion and message research'); macrostrategy with prioritisation (the old 'Strategy and prioritisation' sub-area's own name, sharing RAND and funders' strategy work; threat modelling kept separate because Tailwind names a threat-modelling institute as its own gap); and compute access with datasets and environments ('Shared compute, data and environments', the weakest of the four: both are shared research infrastructure that labs have in-house and independents lack, but their providers differ). If the owner prefers 23, undo the last one. Matchmaking, incident tracking versus investigation, and the two watchdog nodes were left alone.
- **A fourth reliability node, hallucination.** A2 allowed one more only if the sources justify it. The International AI Safety Report 2026 names fabricated information first among reliability failures, OpenAI's 2025 paper frames it as a problem with its own cause and progress marker, and its community (factuality researchers, detection vendors, post-training teams) is distinct from agent-evaluation people. It is also distinct from honesty, which propensity evaluations already hold. It passes the four node tests; drop it if the owner wants the reliability sub-area at three.
- **Agent identity, visibility and protocols sits in public policy.** The alternatives were The Model (but the node is about infrastructure across many developers and deployers, not one developer's system) and structural risk (but the node is a governance lever, not a risk). Its closest neighbour is standards, and the actors are a government standards body (NIST's agent standards initiative), governance researchers (GovAI) and protocol builders. Public policy now has seven nodes, which also answers the review's point that it was the thinnest sub-area for its importance.
- **Automated AI R&D and internal deployment sits in developer assurance, not evaluations.** Measuring AI R&D capability is already part of dangerous-capability evaluations; what is missing is how developers govern systems used internally once that capability exists, which is Apollo's framing and an assurance question.
- **Deployment safeguards in developer assurance** follows the slug the owner gave. The field-framing review suggested model security; the boundary note separates it from jailbreak robustness (the model's own resistance) and from attack detection in the wild.
- **Release-risk assessment was rebalanced rather than a new node added.** The node was already renamed 'marginal risk and benefit' in v1.3; rewriting its text to hold the open-model side keeps the sub-area at three nodes and the top level simpler.
- **Rule-of-thumb departures** are listed in section b. The biggest judgement calls are fraud (busy, because the owning field is larger than AI safety), defensive uplift (busy), labour disruption (connection strong, because developers publish usage data economists use) and early-career pipeline (active, although the reviewers say the bottleneck itself is thinly worked).
- **Machine ethics inconsistency resolved**: v1.3 had it lab-internal with an owner field and bridge-needed. It is now home frontier labs and academia, capacity thin, no owner field, connection not-applicable, following its own reasoning.
- **Human-AI relationships owner field** widened from 'psychology and human-computer interaction' to 'child online safety, psychology and human-computer interaction', because its reasoning names child-safety organisations and litigators as the part of the field most engaged.
- **Funding tags not narrowed.** The Meta reviewer suggested making only diversification actors primary on funding concentration. The owner's A4 decision puts funder type on organisation rows and renames the node to include diversity, which makes the funders themselves relevant evidence; the tags were left as they are.
- **Funder fields.** Two funder rows had funding_model unknown and could be filled from existing data (AI Risk Mitigation Fund: philanthropic; NSF: government). Hack Club and Impact Ops appear on the funding-infrastructure node as operations providers, not funders, and their funding model is not inferable from the data; left unknown.
- **New organisations (6).** Five created from web evidence for the new nodes (Princeton SAgE, Vectara, York's Centre for Assuring Autonomy, UL Standards & Engagement, EASA), each with medium confidence and fields left unknown where not evident; one (Global Center on AI Governance) from the low-confidence Society edit, at low confidence. Type and country need a human check on all six.
- **Web evidence.** Pages fetched and checked for the new nodes: NIST's AI Agent Standards Initiative page and announcement (CAISI, 17 February 2026, includes agent identity and authorisation), Princeton's HAL (reliability dashboard; funded in part by Coefficient Giving and Schmidt Sciences), Anthropic's Safeguards Research Team post, UK AISI's safeguard-evaluation principles (4 February 2025), Apollo's internal-deployment primer, Google DeepMind's Frontier Safety Framework post (machine-learning R&D levels), OpenAI's biology safeguards post, the International AI Safety Report 2026 executive summary and the ControlArena site. Other references (arXiv papers, ISO/PAS 8800, UL 4600, EASA's concept paper, AMLAS, Kolt, LawAI's law-following AI) were confirmed from search results only.
- **Links for merged Meta nodes** carry all their sources' Tailwind titles and key agendas; one duplicate CCW agenda was dropped from the autonomous-weapons node. Where one organisation sat on two merged nodes, the primary tag was kept, and on a tie the surviving node's own evidence (six cases, listed in section a).
- **Could not be done cleanly.** (1) Capacity for adjacent-field nodes has no rule of thumb in A1, so it was judged from the reasoning (for example NCII thin, CSAM active). (2) The rich 'what should flow' paragraphs in v1.3's bridge_reasoning were condensed to one sentence each in connection_note, as A1 asks; the longer text is still in `v1.3/taxonomy-v1.3.json`. (3) capacity_note replaces coverage_reasoning, which on several nodes carried the only dated evidence; that detail survives in definitions, existing_mitigations and edge notes but not in a single field. (4) Two new-node tags rest on homepages (Andon Labs, IFP), as their v1.3 evidence did. (5) Four candidate tags on new nodes are logged as needing evidence (section e) rather than invented. (6) The older build scripts write to the same orgs.csv, edges.csv and map-data.json; run build_v2.py last if they are ever rerun. build_v2.py reads only from `v1.3/`.
- **Out of scope (A8).** The environmental-costs node proposed in review is not added; environmental and resource costs, copyright and data rights, and general data governance and privacy are recorded in the top-level `scope` as out of scope for now, with privacy and data leakage named as the first to revisit. The same text is ready for the methodology page.
