# REVIEW-0002 — Final Foundation Review

> Historical review state (updated 2026-07-19): Review completed. Its original verdict remains unchanged. Resolution notes record subsequent corrections; a separate independent review is required to determine Foundation Freeze readiness.

## 1. Executive Summary

The O.R.I.O.N. Foundation has a strong and coherent architectural direction, but the candidate baseline is not ready for Foundation Freeze.

Capability-Oriented Architecture, inward dependency direction, Core independence, Contract-mediated collaboration, event-driven decoupling, and the separation of Skills, Providers, and Adapters are consistently established in the approved ADRs. The Foundation also correctly treats Clients as presentation surfaces, Engines as capability owners, Providers as replaceable technology implementations, Adapters as external-ecosystem translators, and Infrastructure as operational support.

The blocking problems are concentrated in the cognitive foundation:

1. Memory and Knowledge have overlapping definitions and taxonomies. Active ADR-0005 assigns facts and platform knowledge to Memory, while the Draft Memory and Knowledge models both claim semantic truth, learned knowledge, installed capabilities, and related durable information.
2. The Knowledge capability has no approved ownership decision. A Knowledge Engine is introduced only in the Draft Context Model, despite ADR-0002 requiring every capability to have exactly one Engine owner.
3. The Context Model's identity, version, lineage, reconstruction, and lifecycle rules are mutually inconsistent. An implementation cannot satisfy all of them without choosing new foundational semantics.

These are not future implementation details. They determine domain ownership, persistence authority, cognitive boundaries, and the meaning of reproducible reasoning. Implementing against the current baseline would force architectural choices that the Foundation has not made and would likely require later redesign.

Several additional HIGH and MEDIUM issues must also be corrected, including ambiguous Contract ownership language, direct Provider participation in Context, contradictory Memory Engine responsibility statements, stale general documentation, and unresolved documentation-governance defects.

**Classification: C. REQUIRES ARCHITECTURAL CORRECTIONS**

## 2. Review Scope

This review assessed the Foundation as one system rather than as isolated documents. The review covered:

- `README.md`
- `MANIFESTO.md`
- `docs/vision.md` (the repository contains no root `VISION.md`)
- `docs/principles.md`
- `docs/architecture.md`
- `docs/DOCUMENT-AUTHORITY.md`
- `docs/glossary.md`
- `docs/roadmap.md`
- all documents under `docs/templates/`
- all ADRs under `docs/adr/` (the repository contains no top-level `decisions/` directory)
- OES-0000 through OES-0010 under `docs/engineering/`
- `docs/architecture-review/REVIEW-0001-Foundation.md`
- `specifications/architecture/ARCH-0001-Core-Architecture.md`
- `specifications/concepts/CONCEPT-0001-Memory-Model.md`
- `specifications/concepts/CONCEPT-0002-Knowledge-Model.md`
- `specifications/concepts/CONCEPT-0003-Context-Model.md`
- `specifications/concepts/README.md`
- the existing Engine and Flow specification placeholders, including active `FLOW-0001-Voice-Interaction.md`
- `ORION-HANDOFF.md`

The review used the precedence rules in `docs/DOCUMENT-AUTHORITY.md`: approved ADRs, then Active Architecture Specifications, Active OES documents, lower specification types, operational guidance, general documentation, and finally README/MANIFESTO and examples. Draft Concept Models were evaluated as candidate foundational material but were not treated as authoritative over Active ADRs or specifications.

The review focused on architectural consistency, ownership, dependency direction, cognitive boundaries, terminology, normative language, missing decisions, and freeze safety. No implementation design was requested or evaluated.

## 3. Overall Assessment

The Foundation's architectural center is credible:

- ADR-0001 and ARCH-0001 clearly establish an inward dependency direction and a technology-independent Core.
- ADR-0002 establishes capability ownership by Engines and prevents technical-layer organization from fragmenting domains.
- ADR-0003 defines an appropriate hybrid of synchronous Contracts and asynchronous Events while prohibiting direct Engine implementation references.
- ADR-0004 provides a useful separation among business workflow, technology implementation, and ecosystem translation.
- OES-0002 through OES-0007 largely reinforce those decisions.
- The Context Model strongly articulates immutability during reasoning, reference-over-duplication, temporary composition, and read-only consumption.

However, the Foundation does not yet provide one coherent cognitive ontology. The question is not merely whether three documents use different wording; they allocate the same durable information to different models and introduce an unapproved capability owner. The Context Model then depends on those unresolved owners and adds incompatible lineage semantics.

Documentation authority is also undermined by lower-authority documents that redefine authoritative concepts instead of summarizing them, Active documents that contradict approved ADR terminology, an Open prior review whose actions remain marked Pending despite partial resolution, and empty specification/index files. These governance defects are mostly non-blocking individually, but they make architectural interpretation less reliable.

The candidate should retain its overall direction. It requires targeted architectural corrections, not a replacement architecture.

## 4. Blocking Findings

### FND-001 — Memory and Knowledge do not have mutually exclusive semantic boundaries

Severity:
- BLOCKER

Affected documents:

- `docs/adr/ADR-0005 — Memory Architecture Principles`
- `docs/principles.md`
- `docs/glossary.md`
- `docs/architecture.md`
- `specifications/concepts/CONCEPT-0001-Memory-Model.md`
- `specifications/concepts/CONCEPT-0002-Knowledge-Model.md`
- `specifications/concepts/CONCEPT-0003-Context-Model.md`
- `ORION-HANDOFF.md`

Description:

The intended distinction is stated clearly in the handoff and Concept Models—Memory answers “What have I experienced?”, Knowledge answers “What is true?”, and Context answers “What is relevant now?”—but the actual taxonomies violate it.

ADR-0005 calls Memory an “intentional knowledge system” and places Personal Knowledge and Platform Knowledge under Memory. `docs/principles.md` says “Memory represents knowledge.” `docs/glossary.md` defines Memory as “persistent knowledge” containing facts and long-term knowledge. `docs/architecture.md` assigns stored facts and long-term knowledge to the Memory Engine.

CONCEPT-0001 then defines Semantic Memory as facts that answer “What is true?”, includes learned concepts and installed capabilities, and assigns procedural knowledge and system/platform information to Memory. CONCEPT-0002 independently assigns validated truth, learned knowledge, built-in platform definitions, and platform capabilities to Knowledge. The same information can therefore be owned by Memory, Knowledge, or both.

Why it matters:

This ambiguity controls which Engine validates information, which lifecycle applies, where authority resides, how provenance works, what deletion means, and whether user-specific facts are experiences or truths. Persistence contracts, retrieval behavior, Context composition, security, and migration boundaries cannot be designed consistently until the distinction is resolved. Choosing during implementation would create architecture by accident and could require foundational data and contract redesign.

Recommended action:

Approve one canonical cognitive partition and align ADR-0005, the three Concept Models, and lower-authority summaries to it. At minimum, define classification rules for episodic experience, user-specific asserted facts, verified external facts, preferences, procedures, platform configuration, capability availability, and operational state. Specify how an item may be promoted or projected between Memory and Knowledge without transferring ownership silently.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0005 was updated first as the authoritative source and now defines the canonical partition by semantic role and authority rather than persistence:

- Memory represents intentionally retained experience and user continuity.
- Knowledge represents justified claims accepted as sufficiently true, with provenance and validation state.
- Context represents the temporary selection or projection of information relevant to the current operational or reasoning situation.

The decision now classifies episodic experience, preferences, assertions, validated claims, procedures, stable platform definitions, capability availability, operational state, historical system events, verified external facts, and Context projection explicitly. It also prohibits Memory and Knowledge from representing the same semantic claim merely because they concern the same real-world subject.

The conflicting lower-authority passages were aligned in `docs/principles.md`, `docs/glossary.md`, `docs/architecture.md`, CONCEPT-0001, CONCEPT-0002, CONCEPT-0003, `ORION-HANDOFF.md`, OES-0002, and FLOW-0001. Working Memory as temporary reasoning/session state is now Context; accepted Semantic Memory and general/validated Procedural Memory are Knowledge; System Memory is decomposed by semantic role; Platform Knowledge is Knowledge; and Personal Knowledge is classified as Memory assertion/experience or Knowledge accepted claim.

A repository audit found no remaining operative use of “Memory represents knowledge” or “persistent knowledge.” Remaining occurrences of the legacy taxonomy are limited to the authoritative classification/migration rules in ADR-0005 and CONCEPT-0001, plus the historical problem description in this finding. Those occurrences are compatible with the canonical partition and do not define legacy categories as current Memory categories.

FND-001 is fully resolved. This resolution does not decide Knowledge capability ownership (FND-002), Context identity/version/reconstruction semantics (FND-003), or alter the overall Foundation Freeze verdict.

### FND-002 — Knowledge ownership and authority are not established by an approved foundational decision

Severity:
- BLOCKER

Affected documents:

- `docs/adr/ADR-0002-Capability-Oriented-Architecture.md`
- `docs/adr/ADR-0005 — Memory Architecture Principles`
- `docs/DOCUMENT-AUTHORITY.md`
- `specifications/concepts/CONCEPT-0002-Knowledge-Model.md`
- `specifications/concepts/CONCEPT-0003-Context-Model.md`
- `ORION-HANDOFF.md`

Description:

ADR-0002 requires every capability to be owned by exactly one Engine and lists the foundational capabilities and owners, but it does not define Knowledge or a Knowledge Engine. ADR-0005 assigns substantial knowledge responsibilities to the Memory Engine. CONCEPT-0002 defines Knowledge conceptually but does not identify a capability owner. CONCEPT-0003 introduces a Knowledge Engine, assigns it ownership of permanent knowledge, and makes it a Context Source. That ownership exists only in a Draft, lower-authority document.

The Foundation also does not identify who validates Knowledge, who determines authority, who resolves contradictions among knowledge items, or whether Knowledge is an independent Engine capability, a Core domain concept, or a responsibility within another Engine.

Why it matters:

Knowledge is a direct input to Context, Reasoning, and Planning. Its owner controls truth acceptance, provenance, contradiction handling, versioning, and availability. Implementing the Context Engine or reasoning contracts would force the project to invent this ownership boundary. That would violate the documentation-authority rule for undecided topics and could change the Engine topology after freeze.

Recommended action:

Make an explicit, approved foundational decision about Knowledge ownership and authority. If Knowledge is an Engine-owned capability, add it consistently to the capability map and define its boundary against Memory. If it is not an Engine, remove the assumed Knowledge Engine and name the actual authoritative owner. The decision should remain conceptual and need not include an Engine implementation specification.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0002 now establishes Knowledge as an independent platform capability and the Knowledge Engine as its single architectural owner. The authoritative capability/Engine map and all directly affected foundational Engine enumerations now include Knowledge consistently.

The Knowledge Engine owns Knowledge domain behavior and governs claim acceptance, validation state, provenance requirements, lifecycle semantics, version semantics, contradiction resolution within the Knowledge domain, Knowledge Contract semantics, and the Knowledge references or projections supplied to Context.

The corrected Foundation distinguishes semantic ownership from definition custody and physical persistence. The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types but does not own Knowledge behavior. Providers may supply technical support, and Adapters may supply external information, but neither determines what becomes accepted Knowledge. Imported information does not become Knowledge automatically.

Reasoning may propose claims, Memory may provide evidence or provenance, and Providers or Adapters may provide observations. Only the Knowledge capability governs whether a claim becomes accepted Knowledge. Context consumes read-only Knowledge references or projections through architectural Contracts and cannot govern, mutate, validate, or reclassify Knowledge.

The ownership rule was aligned across ADR-0005, DOCUMENT-AUTHORITY, ARCH-0001, OES-0001, OES-0002, the three Concept Models, `docs/architecture.md`, `docs/glossary.md`, `docs/principles.md`, and `ORION-HANDOFF.md`.

A repository audit found no operative document assigning Knowledge ownership or acceptance authority to the Memory Engine, Context Engine, Core, a Provider, an Adapter, or the Reasoning Engine. Historical descriptions of the original defect remain in this review and are superseded by this resolution note.

FND-002 is fully resolved. This resolution does not address Context identity, version, lineage, reconstruction, or lifecycle semantics (FND-003) and does not alter the overall Foundation Freeze verdict.

### FND-003 — Context identity, version, lineage, reconstruction, and lifecycle rules are incompatible

Severity:
- BLOCKER

Affected documents:

- `specifications/concepts/CONCEPT-0003-Context-Model.md`
- `specifications/concepts/CONCEPT-0001-Memory-Model.md`
- `specifications/concepts/CONCEPT-0002-Knowledge-Model.md`
- `docs/engineering/OES-0005-Events.md`

Description:

CONCEPT-0003 alternates between two incompatible models:

- Every Active Context has a unique identity, and no two Active Contexts may share an identity.
- A meaningful change creates a new Context Version and a new Active Context.
- State transitions are said to preserve Context Identity.
- Identity distinguishes one Context instance from another, while Version represents evolution.
- A new version has its own metadata and a Parent Context.

The document does not say whether lineage versions share one stable lineage identity, whether each version receives a new Context identity, or both. “Context instance,” “logical Context,” “Active Context,” “Context Version,” and “Snapshot” are not separated sufficiently to resolve this.

The lifecycle is also inconsistent. Section 10 includes `Active → Updating → Composing`, while the later canonical state table and state machine omit Updating and declare `Active → Composing` invalid. Archived Context and optional snapshots may be preserved for replay, but Context is also required to expire, not preserve historical information, and always be reconstructable from authoritative references. If referenced Memory, Knowledge, Identity, provider data, or policies later change or disappear, the same historical Context cannot be reconstructed unless source versions or an immutable snapshot are retained. The specification makes snapshots optional and does not require version-pinned references.

Why it matters:

These rules define reproducibility, auditability, reasoning traceability, event correlation, and the boundary between transient Context and persistent historical evidence. Implementers must choose an identity model, a state machine, and a replay model. Different choices affect Contracts, Events, storage responsibilities, observability, and privacy retention. This is a foundational semantic decision, not a serialization detail.

Recommended action:

Define separately: lineage identity, immutable revision identity, revision number, lifecycle state, and optional materialized snapshot. Establish one authoritative state machine. Clarify whether reconstruction means logical equivalence from version-pinned source revisions or exact replay from a retained immutable snapshot. Assign retention ownership for lineage metadata and snapshots without turning Context into a general storage layer.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

CONCEPT-0003 now defines Context Lineage and Context Revision as separate concepts. A Context Lineage has one stable Context Lineage Identity. Every Context Revision has its own unique Context Revision Identity, belongs to a lineage, carries a revision number or equivalent ordering semantic, includes creation metadata and lifecycle state, and remains immutable after becoming Active.

Active Context is now defined only as a Context Revision in the Active lifecycle state and valid for consumption. It is not a separate identity model. Each reasoning cycle consumes exactly one immutable Active Context Revision, and reasoning outcomes should identify the Revision Identity they consumed.

The single authoritative lifecycle is `Collecting → Composing → Validating → Active → Expired → Archived (optional)`. Updating is explicitly prohibited as a Context Revision lifecycle state. Operational changes initiate a new revision's creation lifecycle and never transition an Active revision back to Collecting or Composing.

Logical Reconstruction and Exact Replay are now distinct. Logical Reconstruction creates a logically equivalent revision from authoritative, version-identifiable source revisions and is conditional on those revisions remaining available. Exact Replay requires retained immutable historical evidence. If exact replay or exact historical reproducibility is claimed, a Context Snapshot or equivalent immutable representation sufficient to reproduce the exact revision must be retained.

A Context Snapshot is an immutable materialized representation associated with one Revision Identity. It never becomes Active again and does not become cognitive Memory merely because it is retained. The Context Engine owns Snapshot and lineage-metadata semantics; physical persistence remains behind architectural Contracts. Retention must follow Security and privacy governance.

Operational validity, expiration, archival retention, and deletion are now separate semantics. Expired revisions cannot be consumed as current Active Context. Archived evidence may be retained or deleted according to policy, and retention does not transfer ownership of referenced Memory, Knowledge, Identity, Planning, or other source information.

The corrected terminology and traceability rules were aligned in CONCEPT-0001, CONCEPT-0002, OES-0005, `docs/glossary.md`, `docs/architecture.md`, and `ORION-HANDOFF.md`. A repository audit found no remaining operative use of the ambiguous Context Version, generic Context Identity, Parent Context, Updating lifecycle, or unconditional reconstructability rules. Historical descriptions of the original defect remain in this review and are superseded by this resolution note.

FND-003 is fully resolved. This resolution does not address the HIGH findings and does not alter the overall Foundation Freeze verdict.

## 5. Cross-Document Consistency

The high-level architecture and the approved ADR series agree on the main direction: the Core remains independent; Engines own domain behavior; implementations depend inward through Contracts; Events express completed facts; Skills orchestrate workflows; Providers isolate technologies; Adapters isolate ecosystems; Clients do not own business logic.

The following inconsistencies require correction before freeze or immediately alongside the blocking corrections:

### FND-004 — Contract ownership language conflates domain ownership with definition custody

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md`
- `docs/engineering/OES-0004-Contracts.md`
- `specifications/architecture/ARCH-0001-Core-Architecture.md`
- `docs/DOCUMENT-AUTHORITY.md`
- `docs/glossary.md`

Description:

ADR-0001 says the Core owns and defines Contracts and explicitly rejects allowing Engines to define their own Contracts. OES-0004 says every Contract has exactly one owner and gives the owning Engine as the owner. DOCUMENT-AUTHORITY later distinguishes domain owner, schema custodian, and runtime authority, but the normative Contract standard does not use those terms. This can be reconciled conceptually, but the Active sources currently state different ownership models.

Why it matters:

Implementers cannot tell whether an Engine may define its port, whether all schemas must be centralized in Core, or who approves semantic changes. The ambiguity can produce either an anemic Core with fragmented language or an over-centralized Core that owns domain behavior.

Recommended action:

Make OES-0004 and ADR-0001 explicitly use the semantic-ownership distinctions already established by DOCUMENT-AUTHORITY: the Engine/domain owns meaning and guarantees; the Core is schema custodian; implementations provide runtime behavior.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0001 and OES-0004 now distinguish contract custody, domain semantic ownership, and implementation responsibility. The Core is the canonical custodian of shared architectural Contracts and governs their shared definitions, compatibility, and versioning. Capability Engines retain ownership of capability behavior and domain semantics, while Providers, Adapters, and other implementation layers implement or translate Contracts without changing their semantics or acquiring capability ownership. ARCH-0001, DOCUMENT-AUTHORITY, and supporting architecture terminology were aligned. FND-004 is fully resolved; the historical finding above is retained as review evidence.

### FND-005 — The documented dependency diagram reverses implementation dependency direction

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md`
- `docs/engineering/OES-0006-Providers.md`

Description:

ADR-0001 says dependencies always point toward the Core, but its linear diagram shows `Clients → Engines → Providers → Contracts → Core`. Engines must not depend on Providers; both Engines and Providers should depend on Contracts/Core. OES-0006 similarly renders `Core → Contract → Provider → Technology`, which visually suggests the Core depends outward on a Provider. The accompanying prose states the correct rule, but the diagrams teach a conflicting dependency graph.

Why it matters:

These diagrams can cause the first implementation to encode the exact coupling that the prose prohibits. Clean and Hexagonal Architecture depend on distinguishing runtime control flow from source dependency direction.

Recommended action:

Replace the linear diagrams with a ports-and-adapters dependency view in which Engine policy and Provider/Adapter implementations independently depend on Core-owned Contract definitions. Keep runtime call flow distinct from source-code dependency direction.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0001 now defines the canonical source-code dependency direction as Clients through the Gateway/Application boundary and Engines/Skills toward Core abstractions, with Provider, Adapter, and Infrastructure implementations independently depending inward on those abstractions. OES-0006 and other diagrams now distinguish runtime interaction from source-code dependency direction. The Foundation explicitly prohibits Core outward dependencies, Engine dependencies on concrete Providers, Adapters, or Infrastructure, and Skill dependencies on concrete external systems. FND-005 is fully resolved; the historical finding above is retained as review evidence.

### FND-006 — Active flow and general architecture assign response generation to the Brain Engine

Severity:
- HIGH

Affected documents:

- `docs/architecture.md`
- `specifications/flows/conversation/FLOW-0001-Voice-Interaction.md`
- `docs/glossary.md`
- `docs/architecture-review/REVIEW-0001-Foundation.md`

Description:

The Foundation intends Brain to orchestrate while Reasoning owns interpretation and response generation. Yet the Active Voice Interaction Flow makes Brain combine results, generate the natural response, and preserve conversation continuity. `docs/architecture.md` also gives response generation to Reasoning but later says Brain prepares the response. This preserves the unresolved overlap identified in REVIEW-0001.

Why it matters:

Response semantics include cognitive behavior, continuity, and potentially provider use. Duplicated ownership will couple orchestration to reasoning and make the Brain Engine a growing catch-all.

Recommended action:

Choose one owner for response semantics. Brain should coordinate the flow and aggregate an outcome envelope; Reasoning or a separately approved capability should own cognitive response generation. Correct FLOW-0001 because it is Active and therefore authoritative over general prose within its flow scope.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

Reasoning Engine is now the exclusive owner of inference and reasoning over one immutable Active Context Revision and may produce candidate responses, conclusions, decisions, or next actions as reasoning outcomes. Brain Engine owns high-level cognitive orchestration and may assemble the final cognitive result from capability outputs, but it may not perform domain reasoning or independently generate reasoning content. FLOW-0001 replaces Brain-owned response generation with final cognitive-result assembly. Final transport, presentation, voice rendering, and Client delivery are explicitly outside both Engines. FND-006 is fully resolved; the historical finding above is retained as review evidence.

### FND-007 — Prior review status and handoff state are stale

Severity:
- MEDIUM

Affected documents:

- `docs/architecture-review/REVIEW-0001-Foundation.md`
- `ORION-HANDOFF.md`

Description:

REVIEW-0001 remains Open and marks all actions Pending even though ADR-0001 through ADR-0005 exist and OES-0006 has been replaced. Other findings remain unresolved. ORION-HANDOFF says the Context Model is in progress and architecture is complete, while the candidate Context Model exists and this review finds architecture incomplete. These documents cannot reliably describe freeze state.

Why it matters:

The handoff and review records are used to establish current project state. Stale status can cause contributors to treat unresolved findings as closed or completed work as pending.

Recommended action:

Resolve or supersede REVIEW-0001 with explicit disposition for every action and update the handoff after architectural corrections are approved.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

REVIEW-0001 is now marked Superseded and explicitly points to this historical review while preserving its original findings and action plan. ORION-HANDOFF now records that all three Concept Models exist, FND-001 through FND-006 are resolved, production implementation has not started, Foundation Freeze remains unapproved, and a new independent review is the next milestone. FND-007 is fully resolved.

## 6. Ownership and Dependency Review

### Core

Core ownership is mostly clear: it defines platform language, domain models, value objects, policies, Contract schemas, Event schemas, identifiers, shared types, and capability definitions. It must not own technology implementations. The remaining ambiguity is the difference between schema custody and domain ownership, addressed by FND-004.

ARCH-0001's statement that “Every capability should be registered in the Core” and ADR-0001's distinction between Core-defined capability types and a runtime bootstrap registry should be tightened. The Core may define capability identities and registry Contracts; mutable availability and selection state must remain outside the Core.

### Engines

Engines consistently own one domain capability and behavior. Direct implementation references between Engines are prohibited; collaboration occurs through Contracts or Events. This is sound.

Three responsibility problems remain:

- Knowledge has no approved owner (FND-002).
- Brain and Reasoning overlap in response generation (FND-006).
- OES-0002 says the Memory Engine stores and retrieves knowledge but is “not responsible for deciding what to remember,” while ADR-0005 says the Memory Engine validates candidates and exclusively decides whether proposed memories are stored. The ADR takes precedence, so OES-0002 must be corrected.

OES-0002 also says persistent state belongs outside the Engine. That should mean physical state is accessed through repository/provider ports, not that domain ownership leaves the Engine. Otherwise it conflicts with Memory's exclusive governance and with explicit Planning/Skill state ownership in CONCEPT-0003.

### Skills

Skills are consistently prohibited from direct Provider or external-system access. They orchestrate business workflows through Engine/Adapter Contracts and may publish or consume Events. This boundary is sound.

Terminology is less stable: ADR-0002 makes Skills a platform capability owned by the Skill Engine; ADR-0004 calls each Skill an executable platform capability; OES-0003 calls a Skill an independent capability package; the glossary says a Skill orchestrates capabilities and never owns intelligence. These can coexist only if “capability type,” “Skill package,” and “skill-exposed operation” are explicitly differentiated.

### Providers

Providers correctly implement technology-facing Contracts and must not own business rules or domain state. Provider registry selection by cost, policy, user preference, and region is potentially behavioral. The Provider Registry may execute a policy supplied by the owning domain, but OES-0006 should not imply that infrastructure owns selection policy semantics.

CONCEPT-0003 weakens the boundary by allowing Device Providers and Calendar Providers to act as Context Sources and directly contribute fragments. Calendar is an external ecosystem and therefore belongs behind an Adapter under ADR-0004/OES-0007. Provider output must enter Context through a domain-owned Contract/source adapter; a Provider must not become a domain authority merely because it supplies data.

### Adapters

Adapters are consistently defined as translators for external ecosystems. They do not own business rules, intelligence, or domain models. OES-0007 allows Adapters to publish Events, while OES-0005 says only the owning Engine may publish its Events and describes Infrastructure as in scope. This is consistent only if Adapter-originated integration events are owned by the Adapter/integration domain and never impersonate Engine-owned Events. That distinction should be normative.

### Infrastructure

Infrastructure is consistently prohibited from business logic and should implement technical Contracts. CONCEPT-0003 assigns ownership of Device Context and Temporal Context to Infrastructure Providers, which conflicts with its own principle that Context Fragments remain owned by an originating architectural component and with Identity ownership of device-related information. Infrastructure can supply observations; domain ownership of their meaning must remain with a capability owner.

### Clients

Clients are consistently presentation and interaction surfaces without business logic. No foundational dependency violation was found in this boundary.

### Security

OES-0009 and ADR-0003 assign authorization enforcement to the Security Engine, while every Engine must also validate permissions and inputs. The likely distinction is central policy authority versus distributed enforcement at every boundary, but it is not stated. “Every action must be evaluated by the Security Engine” in general architecture is unnecessarily absolute and suggests a synchronous central dependency. Define Security Engine as policy/decision authority and require enforcement by each invocation boundary through Contracts or policy artifacts.

## 7. Cognitive Foundation Review

### Memory

The strongest parts of the Memory Model are intentional retention, user control, explainability, privacy, lifecycle governance, and the prohibition against treating Memory as a database, unrestricted log, or provider context window. ADR-0005 correctly centralizes persistent-memory governance in the Memory Engine.

The taxonomy is not stable. ADR-0005 uses Conversation Memory, Context Memory, Preference Memory, Personal Knowledge, Platform Knowledge, and System Memory. CONCEPT-0001 replaces these with Working, Episodic, Semantic, Preference, Procedural, and System Memory. This is not merely different labeling: ownership and lifetime change. Working Memory is owned by Context; Context Memory in ADR-0005 is called temporary execution state but placed under Memory; conversation memory is both rejected as Memory and recognized as a category. The model must distinguish raw conversation history, transient conversational state, and intentionally retained episodic summaries.

Memory persistence is conceptually governed but physical persistence remains appropriately technology-independent. The missing requirement is a clear separation between domain ownership of persistent Memory and repository/provider ownership of storage mechanics.

### Knowledge

The Knowledge Model correctly emphasizes provenance, confidence, traceability, validation, versioning, and the rule that provider output is not Knowledge by default. These are architecturally useful and technology-independent.

It lacks an authoritative owner, validation authority, contradiction-resolution authority, and boundary rules against Semantic/Procedural/System Memory. “User-specific information should normally be stored as Memory unless it becomes a validated platform fact” is too vague to classify common cases. A user's profession can simultaneously be an experienced assertion, a user fact, and externally verified knowledge. The model needs ownership and projection rules, not implementation detail.

The taxonomy also mixes source/provenance categories rather than semantic categories: Built-in, Learned, Verified, Imported, and Generated can overlap. Imported Knowledge can also be Verified; Generated Knowledge can later be Verified. These are better understood as provenance or validation states unless exclusivity is explicitly denied.

### Context

The Context Model provides a mature direction: Active Context is temporary, composable, immutable during one reasoning cycle, owned by the Context Engine, and consumed read-only by Reasoning, Planning, and Skills. Context references rather than owns Memory, Knowledge, and Identity. Planning may influence only subsequent versions. These boundaries are appropriate.

Its principal defect is overclaiming deterministic reconstruction without defining stable source revision semantics. It also duplicates lifecycle models, conflates Context identity and revision lineage, and leaves Context Snapshot retention ownership unresolved (FND-003).

Context Source is too broad. “Any component” includes Providers, external events, running Skills, user interactions, and Infrastructure, but the model does not require each source to expose a domain-owned Context Contract, identify its authoritative owner, declare freshness, or preserve a source revision. This is the point at which external data could bypass Adapter/domain boundaries.

The fixed conflict priority is also unsafe as a universal rule. It ranks Memory above Knowledge even though Knowledge is described as validated truth, and ranks explicit user input above platform policy despite separately exempting security constraints. Source type alone is insufficient: authority depends on the field/domain being resolved. A verified identity source should outrank user assertion for identity; the user should control preferences; policy should govern prohibited actions. Resolution precedence should be domain-specific and policy-governed.

### Memory / Knowledge / Context Boundaries

The intended triad is architecturally valuable:

- Memory: retained experience and user continuity.
- Knowledge: justified claims accepted as sufficiently true.
- Context: the immutable, temporary selection of information relevant to one reasoning cycle.

The current documents do not yet enforce that triad. The stable boundary should be based on semantic role and authority, not physical persistence:

- Persistence alone does not make something Memory.
- A past event may be Memory; a proposition derived from it may become Knowledge only through an explicit validation/promotion process.
- Context may reference either but must not silently copy, reclassify, or become their durable owner.
- Operational/session state may be transient Context without being Memory.
- Reproducibility metadata or snapshots may be retained for audit without redefining them as cognitive Memory, but their retention owner and privacy lifecycle must be explicit.

Reasoning should consume exactly one Active Context that contains authorized, version-identifiable references or projections from Memory and Knowledge. Planning should consume the same immutable revision, produce a Plan owned by Planning, and contribute only a new fragment to a subsequent Context revision. This intent is present, but the ownership corrections above are necessary to make it enforceable.

## 8. Terminology Review

The following terms have multiple meanings or inconsistent definitions:

| Term | Inconsistency | Required clarification |
|---|---|---|
| Capability | Used for a domain ability, an Engine, a Provider feature flag, a Skill package, and a Skill-exposed operation. | Separate domain capability, implementation support, and executable operation. |
| Engine | Defined as both owner of a capability and runtime implementation of a capability. | Distinguish logical capability owner from deployable/runtime implementation. |
| Skill | Independent capability, capability package, executable capability, and orchestrator of capabilities. | Define Skill package and Skill operation without making Skills rival Engine-owned domains. |
| Provider | “Technology-specific capability,” Contract implementation, and in Context a source/authority for device/calendar data. | Keep Provider as implementation; domain authority must remain elsewhere. |
| Adapter | May publish Events despite Engine-exclusive publication wording. | Define Adapter-owned integration events versus Engine-owned domain events. |
| Contract owner | Core, Engine, and sometimes the component exposing/implementing it. | Use domain owner, schema custodian, and runtime implementer/authority. |
| Event owner | Core defines schemas, Engine owns meaning/publishing, Adapter may publish integration events. | Apply semantic ownership terminology consistently. |
| Memory | Experience, persistent knowledge, facts, preferences, platform knowledge, system state, and temporary context. | Restrict Memory semantically and align its taxonomy. |
| Knowledge | Durable truth, verified information, learned information, built-in architecture, and platform capabilities. | Define owner, validation state, provenance dimensions, and Memory boundary. |
| Context | Present operational state, relevant information, “complete cognitive state,” and several nested scopes. | Prefer “relevant operational state for a reasoning cycle”; avoid implying it contains all cognition. |
| Context Fragment | Independent unit but also said to remain owned by its originating component. | Clarify whether the source owns underlying data while Context owns the immutable projection/reference. |
| Active Context | Context instance, Context version, Reasoning Context, and final product are used nearly interchangeably. | Separate logical lineage, revision, and lifecycle state. |
| Context Source | Any component, source data, Provider, Event, user interaction, and infrastructure. | Define it as a Context-facing port with domain authority and source revision metadata. |
| Conversation memory/history | Both excluded from Memory and included as Conversation/Working/Session Context. | Separate transcript/history, ephemeral conversational state, and retained episode. |
| Service | OES-0002 says an Engine is not a service, while `services/` contains Engine implementations and high-level documents call services extensions. | State that service is a deployment/repository role, never a domain synonym for Engine. |

The glossary claims precedence over all documents, but DOCUMENT-AUTHORITY places general documentation below ADRs, specifications, and OES. The glossary must not claim higher authority than the formal hierarchy.

## 9. Normative Language Review

The Foundation uses normative language inconsistently. Several Active OES documents rely heavily on “should,” plain imperative prose, and “avoid” even when describing mandatory architectural boundaries. Conversely, the Draft Context Model uses MUST/SHALL for some claims that are either impossible as stated or prematurely absolute.

Contradictory or problematic requirements include:

- Context “SHALL always be reconstructable,” while immutable source revisions/snapshots are optional.
- Context “MUST expire,” while expired Context may be archived indefinitely and snapshots may be preserved; expiration, retention, and operational validity are not distinguished.
- Every meaningful change creates a new version, but significance is undefined and the lifecycle includes conflicting Updating rules.
- Every reasoning cycle consumes exactly one Reasoning/Active Context, while Planning and Skill execution also consume it; the scope of “reasoning cycle” versus workflow cycle is unclear.
- Explicit user intent has global precedence, subject to constraints, while platform policies are ranked second. This should be a domain policy rule rather than one universal ordering.
- “Every action must be evaluated by the Security Engine” and “authorization must be enforced by the Security Engine” suggest central synchronous mediation, while Engine standards require local validation and ADR-0003 prohibits direct Engine coupling.
- OES-0002 states Engines “must” publish meaningful Events and its Definition of Complete Engine requires Event publication. A capability with no meaningful completed domain fact should not be forced to invent Events. “MUST publish only when a meaningful domain event exists” is safer.
- ARCH-0001 requires 100% unit test coverage for domain rules. This is an implementation-quality policy, not a Core architectural invariant, and the absolute percentage is not justified by architecture.
- OES-0010 requires every document to use Semantic Versioning, while several existing normative documents use `1.0`, Draft Context uses a different header format, and README/MANIFESTO are unversioned exemptions only under OES-0008. The scope needs consistency.

Critical rules that currently exist only as descriptive prose and should become normative in their authoritative sources include:

- Knowledge validation and authority must have one named owner.
- An Engine/domain owns Contract semantics while the Core is schema custodian.
- Provider selection policy semantics remain owned by the consuming capability or platform policy domain.
- Providers and Adapters must contribute Context only through domain-owned Context Source Contracts.
- Context references used for deterministic replay must identify immutable source revisions or a retained snapshot.
- Planning output must not mutate the Context revision from which it was derived.
- Raw conversation history must not automatically become persistent Memory.
- Adapter-owned integration events must not be published as another Engine's domain events.

## 10. Missing Decisions or Ambiguities

The following are foundational and must be resolved before freeze:

1. The canonical Memory/Knowledge partition, including transition/projection rules (FND-001).
2. Knowledge capability ownership and authority (FND-002).
3. Context lineage identity, revision identity, lifecycle, reconstruction semantics, and retention ownership (FND-003).

The following are important but can be resolved as corrections to existing authoritative documents without introducing implementation detail:

- Domain ownership versus Core custody of Contracts and Events.
- Brain versus Reasoning ownership of response generation.
- Context Source qualification and the Provider/Adapter boundary.
- The distinction between Security policy authority and enforcement points.
- Canonical Memory taxonomy and terminology for conversation state.
- Whether capability registration in Core means immutable definitions/Contracts or runtime registry state.
- Domain-specific Context conflict-resolution authority.

The following are not Foundation blockers and should remain deferred:

- Concrete storage technology for Memory, Knowledge, Context snapshots, or event publication.
- Serialization formats and schema property names.
- Provider selection algorithms and scoring formulas.
- Distributed synchronization protocols.
- Exact retention durations.
- Concrete confidence scoring.
- Engine deployment topology.
- Context compression, knowledge graphs, vector search, or multi-agent synchronization mechanics.

## 11. Non-Blocking Improvements

- Correct malformed Markdown in `README.md`, `MANIFESTO.md`, OES-0000, and OES-0001. These files contain escaped Markdown tokens and mojibake; `docs/architecture.md` also has an unclosed code fence and malformed headings.
- Align repository documentation with the actual repository. OES-0001 requires `infrastructure/` and `tools/`, while the repository contains misspelled `infraestructure/` and no `tools/`. README and AGENTS also describe top-level `engineering/` and `adr/` although they are under `docs/`.
- Normalize ADR-0005's filename to the documented naming convention and include the `.md` extension.
- Populate or remove/reclassify empty files. `docs/README.md`, `docs/roadmap.md`, `specifications/concepts/README.md`, `ENGINE-0001-Brain-Engine.md`, and most Flow files are empty. Empty Active documents are prohibited by OES-0008; empty files without status create ambiguity.
- Ensure the requested/canonical vision path is unambiguous. The repository has `docs/vision.md`, not root `VISION.md`.
- Update all cross-references to real relative Markdown links as required by DOCUMENT-AUTHORITY. Many references are plain names, stale names such as `CORE-SPEC-0001`, or unresolved conceptual aliases such as `MEMORY-MODEL`.
- Bring CONCEPT-0003 into the standard Concept header/template format or formally allow YAML front matter. It duplicates section number 5, lists a Table of Contents structure that is not fully present, and is much more normative than the Concept template anticipates.
- Decide whether Concept Specifications belong in the authority hierarchy. DOCUMENT-AUTHORITY lists Architecture, Engine, Flow, Protocol, API, and Schema specifications but does not place Concept Specifications explicitly.
- Change REVIEW-0001 to a supported status. OES-0008 allows Draft, Review, Active, Deprecated, Superseded, and Archived; `Open` is not listed.
- Reconcile exception naming (`ValidationError` versus `ValidationException`, `ConfigurationError` versus `ConfigurationException`) through one canonical vocabulary.
- Use “LLM” consistently (`LlmProvider` and `LLMProvider` currently differ).
- Replace direct product examples that blur taxonomy, such as Calendar Provider where the architecture requires a Calendar Adapter.
- Separate runtime call-flow diagrams from source dependency diagrams throughout the documentation.
- Add explicit status/disposition metadata to this final review during the eventual correction/approval process; this review intentionally follows the user-mandated structure.

## 12. Foundation Freeze Recommendation

### Cleanup Disposition Note — 2026-07-19

This note records later cleanup without altering the original assessment or verdict.

Resolved for independent re-review:

- Core capability registration now distinguishes stable capability identities and registry Contracts from mutable runtime registry state.
- Memory governance now agrees with ADR-0005: the Memory Engine decides intentional retention while physical persistence remains an implementation responsibility.
- Capability, Engine, and Skill terminology now distinguishes domain capability ownership, runtime realization, and executable Skill packages.
- Provider selection executes policy owned by the consuming capability or platform-policy authority; Provider infrastructure does not own policy semantics.
- Context Sources must use domain-owned Contracts, preserve authoritative ownership, and identify source revisions when reproducibility requires them. Provider, Adapter, Event, Skill, and Infrastructure observations do not acquire domain authority.
- Calendar integration is consistently treated as an Adapter boundary, and device or temporal observations no longer assign domain ownership to Infrastructure Providers.
- Context conflict precedence is domain- and policy-governed rather than a universal ranking based only on source type.
- Adapter-owned integration Events are explicitly distinct from Engine-owned domain Events.
- Security Engine owns authorization policy and decision semantics; enforcement occurs at invocation boundaries without direct Engine coupling.
- The glossary no longer claims precedence over the formal document-authority hierarchy.
- Event publication is required only when a meaningful completed domain fact exists, and the unjustified absolute test-coverage percentage was removed.
- Broken Markdown fences in active authority and architecture documents were closed.

Deferred post-freeze because they do not affect Foundation correctness:

- Broad Markdown and mojibake normalization in otherwise readable documents.
- Repository-directory spelling and optional `tools/` alignment.
- ADR-0005 filename normalization.
- Population or reclassification of empty non-authoritative placeholders and indexes; the empty Brain Engine placeholder remains untouched because this cleanup must not create an Engine Specification.
- Conversion of all plain cross-references to relative Markdown links and cleanup of non-normative aliases.
- CONCEPT-0003 template/front-matter normalization and broader section-format cleanup.
- Explicit authority-hierarchy placement for future Active Concept Specifications; the current Concept Models remain Draft and therefore non-authoritative under the existing status rules.
- Exception-name and `LLM` capitalization normalization.
- Documentation-version formatting normalization where existing documents predate the current versioning standard.
- Root `VISION.md` aliasing; `docs/vision.md` remains the canonical existing vision document.
- Broad formatting cleanup of all runtime-flow labels beyond the authoritative contradictions already corrected.
- Concrete storage, serialization, algorithms, retention durations, scoring, deployment, and synchronization choices already identified as post-freeze implementation concerns.

Still requires action before Foundation Freeze, but not before independent re-review:

- A separate independent review must assess the corrected candidate Foundation and issue a new verdict.

No unresolved BLOCKER or HIGH finding from this review remains after the recorded resolution notes. The original verdict below is intentionally preserved as historical evidence.

O.R.I.O.N. should not enter Foundation Freeze in its current state.

The architectural direction should be preserved. Clean/Hexagonal dependency principles, Capability-Oriented ownership, hybrid Contract/Event collaboration, and the Skills/Providers/Adapters separation provide a viable long-term foundation. The required work is a focused correction of cognitive ownership and semantic consistency, not a broad redesign.

Freeze can be reconsidered after all BLOCKER findings are resolved in authoritative documents and the directly conflicting Active OES/Flow material is aligned. HIGH findings should also be corrected before freeze because a frozen baseline must not contain competing normative interpretations of Contract ownership, dependency direction, or Brain/Reasoning responsibility.

Formatting defects, empty indexes/placeholders, stale handoff text, and repository naming issues are real quality problems but do not independently require a foundational redesign. They should be corrected as part of freeze hygiene and must not be confused with the three architectural blockers.

**Final classification: C. REQUIRES ARCHITECTURAL CORRECTIONS**

FOUNDATION FREEZE: NOT APPROVED
