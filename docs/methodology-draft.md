# About this map and how it was made

## Why this exists

I built this map because coming into AI safety can be overwhelming. There are dozens of research agendas and hundreds of organisations, and nowhere obvious that shows how they fit together. I wanted something that helps people see what the problems are, who is working on each one and how much room is left, so they have somewhere to start working out where they fit.

It's a starting point, put together mostly by me working with AI research agents. If it proves useful I'd like it to keep growing and become more nuanced, with people who know each problem area well taking ownership of it. It gets better as people contribute.

Good resources already exist, and this is meant to sit alongside them. The Map of AI Safety at AISafety.com, maintained by Alignment Ecosystem Development, lists more than 370 organisations and is the best census of the field we know of, but groups them by type (funders, research groups, advocacy, training and so on), which can't show you everyone working on, say, interpretability. Funders publish the opposite view: Coefficient Giving's Project Tailwind lists problems it thinks no one owns and invites people to start organisations to tackle them, and by design doesn't show who is already working nearby. We couldn't find anything that crosses a detailed list of problems with the organisations working on each, so the gaps show up. That's what this map adds.

## What the map is and is not

The map is organised by problem. The basic unit is a node: a specific sub-problem such as scalable oversight or DNA synthesis screening. Each node has a plain definition, why it matters, what progress would look like, one thing to read first and a capacity and home. Organisations are attached to nodes as evidence that someone is working on that problem, and one organisation can appear on many nodes.

The current release has 118 nodes in 28 sub-areas, grouped into four layers:

- **The Model.** Making the AI system safe and secure: alignment, interpretability, control, evaluations, model security, and developer assurance.
- **Harmful use.** AI used, lawfully or not, to cause harm: cyberattacks, biological and chemical weapons, military AI, influence operations, fraud and abuse, surveillance, and open-weight models with safeguards removed.
- **Society and Government.** Structural risks such as race dynamics and concentration of power, public policy, international and compute governance, the economic transition, the information ecosystem, and ethics, fairness and welfare.
- **Meta.** The field's own infrastructure: funding, talent, evidence, outside scrutiny of AI companies, communications, convenings and strategy.

The scope is AI safety and security: catastrophic and other serious risks from AI, worldwide. Ethics, fairness and AI welfare have their own sub-area, kept visibly alongside the rest rather than merged in or left out, because a newcomer will meet them, even though they often have different funders and academic homes.

This map is written from the AI safety community's own vantage point. A node existing, or one sub-area having more nodes than another, is not a claim about importance; it mostly reflects how finely that work has been broken down. Some topics that shape AI's harms are out of scope for now, better served by other vantage points: environmental and resource costs, copyright and data rights, and general data governance and privacy. Privacy and data leakage is the one we'd revisit first.

The map isn't a learning-resources list; AISafety.com, BlueDot Impact and others do reading lists well. It isn't a careers page, though many nodes note approachable ways in. And it doesn't rank problems by importance.

## How the problem space was built

We started from how others already divide the field: Coefficient Giving's structure and Project Tailwind; the UK AI Security Institute's research agenda; DeepMind's "An Approach to Technical AGI Safety and Security"; Anthropic's research directions; the International AI Safety Report; "Open Problems in Technical AI Governance" (Reuel et al.); Hendrycks and colleagues' overview of catastrophic AI risks; and security frameworks including RAND's work on securing model weights, MITRE ATLAS and OWASP. Each of the 36 Tailwind initiatives we used links to exactly one node.

These sources disagree in places, and we had to choose:

- **Control is separate from alignment.** DeepMind nests control under misalignment; UK AISI lists them side by side. Control starts from a different premise, assume the model may be misaligned and contain it, with its own organisations.
- **Security appears in two layers.** Protecting the AI system itself is in The Model; protecting the world from attackers who use AI is in harmful use.
- **Developer assurance is separate from government regulation.** Frameworks, safety cases, audits and incident reporting sit in The Model, voluntary or not. What governments and international bodies do sits in Society and Government.
- **Domain-specific governance stays with its domain.** Arms control, export controls and synthesis screening rules sit with harmful use, because those communities are domain-specific.
- **Biosecurity sits under harmful use**, as most funders treat it, though most organisations there belong to the wider biosecurity field.
- **Chemical weapons uplift is its own node** even though nearly empty; merging it with bio would hide a gap.

Nodes that differed only by who does the work or who is targeted were merged. No node was dropped for being empty. Empty and thin nodes are kept and highlighted, because they show where there may be room to work.

Adding a node from here on is deliberate, not a default. A candidate must pass four tests: it has its own failure mode and its own sense of progress; at least one credible source treats it as a problem in its own right; the people who'd work on it are distinguishable from their neighbours; and it can't be said in one sentence inside an existing node. A sub-area that grows past eight nodes triggers a review of whether to split or trim it. These are standing criteria, not just this round's rule.

The map also carries **lenses**: cross-cutting tags (loss-of-control, agents, democracy, defensive-technology, open-source, critical-infrastructure) marking nodes that touch a theme across layers. They're off by default; switch one on to see where it lights up.

## What capacity, home and connection mean

Each node carries two separate fields, not one combined status: "how much work exists" and "who does the work" are different questions, and folding them together hid real distinctions.

**Capacity** describes how much work exists on the problem. It says nothing about how close the problem is to being solved.

- **None.** We found no organisation working on it.
- **Thin.** A little work exists: one or two groups, or a new organisation.
- **Active.** A reasonable amount of work exists, several organisations, with room for more.
- **Busy.** Many organisations already work on it. Busy doesn't mean solved: it's often where the jobs are, because established teams need people, even though a newcomer starting something new here would struggle to add much.

**Home** describes who does the work, and a node can have more than one: independent AI safety, frontier labs, government, commercial, academia, or another field. When home includes another field, **owner_field** names it, such as infosec, fraud prevention, child protection or digital rights.

For nodes whose home includes another field, **connection** describes how well that field's work reaches AI safety: **strong**, **weak** or **missing**, with a one-sentence **connection_note** on what flows, or should flow, between the two. This replaces the old idea of a node being "bridged" or not: a description, not a verdict on whether someone should build one.

This matters because much AI-enabled harm is worked on by people who don't call it AI safety. Counting only AI safety organisations would make those nodes look empty; counting the whole neighbouring field would hide a neglected part. Capacity and home let you see both at once.

## What counts

**Organisations.** Commercial companies, government bodies and academic groups count; academic work is tagged to the group or centre, not the university. Safety teams inside frontier labs count like any other organisation. Individuals and blogs don't, unless working under a named project. Closed or acquired organisations stay in the data with their status shown. On another-field nodes we list representative examples only, chosen because they're visibly working on the AI-specific version of the problem.

**Primary and secondary.** A tag is primary if the node is a main line of work for the organisation, secondary if they touch it but it isn't central.

**Evidence.** Every tag has an evidence URL (a paper, project page, product page, job advert or grant) with a one-line note. No evidence, no tag. The strongest links point to a specific piece of work; the weakest to a homepage. We plan to mark evidence strength on that basis.

**Products and tools (planned).** A later version will attach products, open-source tools, benchmarks and datasets to nodes as entries of their own, separate from the organisations that make them.

**A rename.** The layer previously called Misuse is now **Harmful use**. Misuse read as excluding harm done within the law, such as a state's lawful military or surveillance use of AI, which this layer includes.

**Funding type.** Whether a funder is government, philanthropic or venture money is recorded against the organisation, not the node; a node with several funders doesn't inherit a single funding type.

## How it was made and how confident to be

The map was compiled in September 2026 by research agents running on Anthropic's Claude models [Dominic: confirm which models ran research and which ran reconciliation], working under written briefs that set the rules above. Four agents drafted one layer each. A stronger model reconciled the drafts, merging 148 draft nodes into 115 (now 118), flagged the judgement calls and reviewed the result. Twelve research batches then looked for organisations, and a merge step cross-checked them. I made the judgement calls. At the time of writing, no subject-matter expert has reviewed the map.

Every record carries who made it and when.

Known weaknesses:

- About a third of tags (175 of 516) cite only an organisation's homepage; the tag is usually right, but the link won't help you check it.
- Several research batches ran out of web search partway through: military AI, model security, developer assurance and talent are most likely under-filled.
- Coverage of the Global South and China is thin; some sites couldn't be read by our tools, so those organisations are left untagged rather than guessed at.
- Definitions and reasoning were written by agents and haven't been reviewed by people who work on those problems.
- A few capacity and home calls are contested and worth a second look once someone with domain expertise is reviewing.

Read the fields and tags as a sourced first pass.

## How it stays alive

Every claim carries its provenance and a last-verified date. We plan to run a scheduled agent that watches organisations' sites and news and proposes changes: a new organisation, a closure, a field that no longer fits. It won't edit the map itself; proposals go to human owners per sub-area, who review them alongside visitors' suggestions. The dataset will be released in numbered versions with a changelog.

## How to contribute

You can suggest a change on any node or organisation: a missing organisation, a wrong tag, a better first read, a capacity or home you disagree with. You can comment on why a problem matters or doesn't, often the most useful feedback on the taxonomy. And you can offer to own a sub-area.

We ask for a reachable contact: a work email or a community handle, such as a LessWrong or EA Forum account. No account, no sign-in. Your suggestion is stored straight away, marked unconfirmed; a confirmation email follows separately, and you needn't click it before the suggestion counts, though a confirmed contact carries more weight, as does a matching email domain and a recognised handle. We weight rather than accept blindly, because an open form attracts honest mistakes and self-promotion alongside real corrections, and readers can't tell them apart. Nothing goes live without an owner's review.

We'd particularly like:

- Owners for the thinnest areas: the Global South, China, critical infrastructure, the economic transition and biosecurity defence.
- Corrections from any listed organisation, especially if we've described your work wrongly or missed part of it.

## Licence and reuse

The dataset is released under Creative Commons Attribution 4.0 (CC BY 4.0): copy, adapt and build on it, including commercially, as long as you give credit. Suggested attribution:

> [Map name], version [x], by Dominic Deane and contributors, [URL]. Licensed under CC BY 4.0.

The site's code is separate, released under the MIT licence.

The full dataset is available as JSON (the whole map in one file) and CSV (organisations, and the tags linking them to nodes). Found something wrong? Please send the correction back.

## Who is behind it

[Dominic to write: two or three sentences on background, why he's doing this, and whether the project is funded by or affiliated with anyone.]

The map lives at ai-map.dominic-deane.com.

Contact: [email or form]. For corrections, the suggest-a-change link on any node or organisation is quickest.
