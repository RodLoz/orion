| Field                        | Value                                            |
| ---------------------------- | ------------------------------------------------ |
| **Status**                   | Archived                                         |
| **Authority Level**          | Historical Pre-ADR Decision                      |
| **Normative Status**         | Non-normative                                    |
| **Implementation Authority** | Not granted                                      |
| **Depends on**               | Authorized Cognitive Reference Integration Study |
| **Consumed by**              | ADR-0008 through ADR-0019                        |

---

> **Historical provenance:** This non-normative Decision record is retained as the source provenance for D-001 through D-029, which were formalized by ADR-0008 through ADR-0019. Those Active ADRs are authoritative. Any conflict MUST be resolved in favor of the applicable Active ADR, and this record MUST NOT be used as implementation authority.

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Scope](#2-scope)
- [3. Authority](#3-authority)
- [4. Existing Accepted Architecture](#4-existing-accepted-architecture)
- [5. Decision Inventory](#5-decision-inventory)
- [6. Ownership Decisions](#61-d-001--collaboration-ownership)
- [7. Authority Decisions](#71-d-004--reference-authority)
- [8. Lifecycle Decisions](#81-d-007--context-revision-relationship)
- [9. Retrieval Decisions](#91-d-010--retrieval-initiation)
- [10. Currentness Decisions](#101-d-013--source-currentness)
- [11. Security Decisions](#111-d-016--retrieval-authorization)
- [12. Failure Decisions](#121-d-019--failure-ownership)
- [13. Bootstrap Decisions](#131-d-022--composition-responsibility)
  - [13.2 D-023 — Composition Without Ownership or Authority Transfer](#132-d-023--composition-without-ownership-or-authority-transfer)
- [14. Brain Decisions](#141-d-024--cognitive-reference-orchestration-boundary)
  - [14.1 D-024 — Cognitive-Reference Orchestration Boundary](#141-d-024--cognitive-reference-orchestration-boundary)
  - [14.2 D-025 — Final Cognitive Result Boundary](#142-d-025--final-cognitive-result-boundary)
- [15. Cross-Cutting Ownership Boundary Decisions](#151-d-026--persistence-reconstruction-and-replay-ownership-boundary)
  - [15.1 D-026 — Persistence, Reconstruction, and Replay Ownership Boundary](#151-d-026--persistence-reconstruction-and-replay-ownership-boundary)
  - [15.2 D-027 — Asynchronous, Event-Driven, and Distributed Collaboration Ownership Boundary](#152-d-027--asynchronous-event-driven-and-distributed-collaboration-ownership-boundary)
  - [15.3 D-028 — Refresh, Recollection, and Repeated Context Cycle Ownership Boundary](#153-d-028--refresh-recollection-and-repeated-context-cycle-ownership-boundary)
  - [15.4 D-029 — Configurable Retrieval Policy Ownership Boundary](#154-d-029--configurable-retrieval-policy-ownership-boundary)

# 1. Purpose

DECISION-0001 records the architectural decisions required to resolve how cognitive references participate in the preparation of Context without transferring ownership among Brain, Bootstrap, Context, Memory, Knowledge, Security, Reasoning, or Planning.

The accepted Authorized Cognitive Reference Integration Study identifies the relevant architectural tension and evaluates the permissible boundaries. The study is analytical: it establishes the accepted design basis, constraints, and alternatives, but it does not provide a single decision record from which an ADR and its dependent specifications can derive an unambiguous architecture.

At the time this record was created, an ADR was premature because the remaining choices required explicit resolution before normative architecture could be stated. Writing ADR-0008 directly from the study would have combined analysis, selection, and formal authority in one step. That would have obscured which conclusions were accepted as decisions and made later formalization dependent on interpretation rather than a stable architectural record.

This document closed that gap. It captured the architectural decisions accepted for ADR preparation, preserved the rationale for those decisions, and exposed the consequences later formalized by ADR-0008 through ADR-0019. Its purpose was to resolve architectural decisions rather than define implementation behavior. It does not replace the architectural authority of the Active ADRs.

By separating decision resolution from normative adoption, DECISION-0001 reduced uncertainty before the ADR activation sequence. It preserves one reviewable historical account of the selected ownership boundaries, semantic relationships, and authority constraints, while ADR-0008 through ADR-0019 provide the normative architectural authority.

# 2. Scope

DECISION-0001 may decide only the architectural questions identified by the accepted Authorized Cognitive Reference Integration Study. Within that boundary, it may record:

- the selected interpretation of responsibility boundaries among already accepted capabilities;
- the architectural ownership of the decisions needed to integrate authorized cognitive references with Context;
- the distinction between semantic ownership, Contract custody, authority, and composition;
- the permitted relationships among existing architectural participants;
- the rationale for selecting or rejecting alternatives evaluated by the study; and
- the matters later formalized by ADR-0008 through ADR-0019.

DECISION-0001 may not define runtime sequences, Contract shapes, methods, data structures, lifecycle transitions, failure taxonomies, algorithms, storage models, transport behavior, deployment topology, provider behavior, or implementation milestones. It may not create a capability, assign behavior outside the accepted study, or convert an unresolved implementation concern into architecture.

This document intentionally avoids introducing new capabilities. It resolves only architectural questions concerning capabilities already accepted by the O.R.I.O.N. architecture.

This document:

- does not modify accepted Concepts;
- does not modify accepted ADRs;
- does not modify ENGINE specifications;
- does not modify Core Contracts;
- does not authorize implementation; and
- does not redefine M0–M10.

Where an accepted higher-authority document already governs a topic, this document records only a compatible decision within the remaining undecided space. Any inconsistency is resolved in favor of the accepted higher-authority document.

Implementation authority derives only from the applicable Active ADRs and aligned authoritative specifications. DECISION-0001 provides no basis for changing Core Contracts, Engine behavior, Bootstrap composition, or executable code.

# 3. Authority

DECISION-0001 is a pre-ADR architectural artifact. It records decisions derived from the accepted Architectural Study but remains non-normative. Its position in the decision-development chain is:

```text
Architectural Study
        ↓
Decision
        ↓
ADR
        ↓
Specification
        ↓
Core Contracts
        ↓
Engine implementation
        ↓
Bootstrap composition
```

Each layer has a distinct responsibility:

- **Architectural Study** examines the problem, accepted constraints, relevant existing authority, alternatives, and architectural consequences. It supplies the exclusive design basis for this Decision.
- **Decision** records the accepted architectural conclusions and their rationale for later normative formalization. It removes ambiguity between analysis and normative adoption without defining executable behavior or acquiring ADR authority.
- **ADR** is the first normative architectural authority in this chain. It formally adopts the architectural decisions, states their normative boundaries, and establishes their architectural authority subject to the repository authority hierarchy.
- **Specification** translates the approved ADR into precise conceptual, Engine, flow, protocol, API, or schema requirements within the authority of each specification type.
- **Core Contracts** express the shared technology-neutral boundaries authorized by the ADR and specifications. Core custody of a Contract does not transfer capability semantics to Core.
- **Engine implementation** realizes the approved capability behavior behind Core-custodied Contracts while preserving the semantic ownership and dependency direction established by accepted architecture.
- **Bootstrap composition** selects and connects concrete implementations through approved Contracts. Composition does not acquire capability semantics, mint capability authority, or redefine the architecture it assembles.

The arrows describe the progression from architectural analysis to authorized composition. They do not replace the repository documentation authority hierarchy and do not represent source-code dependency direction.

This document cannot override approved ADRs, Active Architecture Specifications, Active Concept Specifications, Active O.R.I.O.N. Engineering Standards, or any other higher-authority source applicable to its subject. It also cannot amend accepted Engine Specifications or Core Contracts indirectly. If a recorded decision conflicts with an accepted higher-authority document, the higher-authority document prevails and the conflict remains unresolved until handled through the repository's established architectural process.

ADR-0008 through ADR-0019 consumed DECISION-0001 as their non-normative decision source for D-001 through D-029. Corresponding Concept, ENGINE, Flow, Contract, protocol, API, or schema specifications consume the applicable Active ADRs only where their respective scopes require formalization. Core Contract changes, Engine implementation work, and Bootstrap composition consume the applicable authoritative ADR and specification set rather than this document directly.

# 4. Existing Accepted Architecture

This section restates only the architectural responsibilities accepted before DECISION-0001. It establishes the boundary within which the decisions in this document are interpreted and does not alter ownership.

This section intentionally restates previously accepted architectural ownership without extending, transferring, or redefining it.

## 4.1 Brain

Brain owns high-level cognitive orchestration. It receives normalized cognitive requests, coordinates existing capabilities through Core-custodied Contracts, maintains orchestration lifecycle and stage precedence, and assembles the final cognitive result as a Brain-owned orchestration outcome from authoritative capability outputs.

Brain does not own Context, Memory, Knowledge, Security, Reasoning, or Planning semantics. It does not replace the Engines it coordinates, reinterpret their authoritative outputs, or own final transport and presentation.

## 4.2 Bootstrap

Bootstrap owns composition. It selects concrete implementations, supplies dependencies through accepted Contracts, and connects the executable capability graph at the application boundary.

Bootstrap does not own capability behavior or domain semantics. It does not mint, wrap, register, or simulate Engine authority, and composition does not make Bootstrap the semantic owner of the values or decisions that pass through it.

## 4.3 Context

Context owns the information relevant to reasoning at a specific moment. The Context Engine owns Context composition, Context Lineage and Revision identity semantics, the Context Revision lifecycle, Context validation and activation, and the semantics of Context Snapshots and lineage metadata.

A Context Lineage has one stable identity. Each Context Revision has a unique identity and becomes immutable when Active. A reasoning cycle consumes exactly one Active Context Revision. A meaningful change creates a new revision rather than modifying an Active revision in place.

Context is distinct from Memory and Knowledge by semantic role and authority. Context selects or projects information relevant to the current situation; it does not acquire ownership of the source semantics represented by those references or projections.

## 4.4 Memory

Memory owns intentionally retained experience and user continuity. The Memory Engine owns episodic experience, intentionally retained interaction information, user preferences, assertion and interaction provenance, Memory retrieval, and Memory deletion.

Memory does not determine what is accepted as Knowledge and does not own what is relevant to the current situation. Memory may provide evidence or provenance without transferring Memory semantics to another capability.

## 4.5 Knowledge

Knowledge owns justified claims accepted as sufficiently true by the platform. The Knowledge Engine owns claim acceptance, validation-state governance, provenance requirements, Knowledge lifecycle and version semantics, contradiction resolution within Knowledge, and Knowledge Contracts and references used by Context.

Only the Knowledge capability governs whether a claim becomes accepted Knowledge. Knowledge does not own Memory, Context, Reasoning, Planning, or storage technology.

## 4.6 Security

Security owns security policy and authorization decision semantics. The Security Engine owns security-domain rules, policy-decision Contracts and governed policy artifacts, audit requirements, and sensitive-action validation.

Protected boundaries enforce applicable Security-owned decisions without acquiring Security semantics. Enforcement does not require direct Engine coupling and does not transfer authorization ownership to Brain, Bootstrap, Context, or another participating capability.

## 4.7 Reasoning

Reasoning owns inference and reasoning over one Active Context Revision. The Reasoning Engine owns intent analysis, inference, conclusions, decisions, candidate responses or next actions as reasoning outcomes, risk evaluation, and clarification requests.

Reasoning does not orchestrate the complete cognitive pipeline, execute Skills, own Context or Planning, or deliver results to Clients.

## 4.8 Planning

Planning owns advisory planning. The Planning Engine owns task decomposition, multi-step planning, dependency ordering, and execution strategy within its accepted capability boundary.

Planning does not own orchestration, Skill selection, authorization, or execution. Its output remains advisory and does not become execution authority.

The ownership stated above remains unchanged. Only the collaboration semantics for requesting, supplying, governing, and incorporating authorized Memory and Knowledge references remain unresolved, including how provenance, authority, authorization, and failure responsibilities remain separated while Brain, Bootstrap, and each participating capability retain their accepted boundaries. The following Decision sections resolve those collaboration questions without extending, transferring, or redefining existing ownership.

# 5. Decision Inventory

This section inventories the architectural questions resolved by the remaining sections of DECISION-0001. It assigns stable identifiers without resolving the questions, evaluating alternatives, or defining runtime behavior.

## 5.1 Ownership Decisions

### D-001 — Collaboration Ownership

Which accepted capability owns the semantics of coordinating the collaboration through which cognitive references become available to Context?

### D-002 — Source Semantic Ownership

How is Memory or Knowledge semantic ownership preserved when either capability supplies a reference for Context?

### D-003 — Context Incorporation Ownership

Which accepted capability owns the semantic decision to incorporate a supplied cognitive reference into Context?

## 5.2 Authority Decisions

### D-004 — Reference Authority

Which capability establishes the authority of a cognitive reference supplied from Memory or Knowledge?

### D-005 — Authority Verification

Which capability owns verification of the authority carried by a supplied cognitive reference?

### D-006 — Authority Preservation

How is source authority preserved when a cognitive reference crosses capability and composition boundaries?

## 5.3 Lifecycle Decisions

### D-007 — Context Revision Relationship

How does cognitive-reference collaboration relate to the accepted Context Revision lifecycle?

### D-008 — Reference Stability

At what architectural point does the set of incorporated cognitive references become fixed for a Context Revision?

### D-009 — Reference Change

How does a meaningful change in an incorporated cognitive reference relate to creation of a new Context Revision?

## 5.4 Retrieval Decisions

### D-010 — Retrieval Initiation

Which accepted capability initiates a request for relevant Memory or Knowledge references?

### D-011 — Retrieval Request Semantics

Which capability owns the meaning of the criteria used to request cognitive references?

### D-012 — Retrieval Result Semantics

Which capability owns the meaning and boundaries of a returned set of cognitive references?

## 5.5 Currentness Decisions

### D-013 — Source Currentness

Which capability determines whether a supplied cognitive reference is current within its source domain?

### D-014 — Contextual Currentness

Which capability determines whether a source-current cognitive reference remains suitable for incorporation into the Context Revision being prepared?

### D-015 — Currentness Change

How does a change in the currentness of an incorporated cognitive reference affect the applicable Context Lineage and Revision semantics?

## 5.6 Security Decisions

### D-016 — Retrieval Authorization

How is Security-owned authorization applied to requests for Memory or Knowledge references without transferring Security semantics?

### D-017 — Authorization Enforcement

Which protected boundary enforces the applicable Security-owned decision for cognitive-reference collaboration?

### D-018 — Authorized Reference Boundary

How does the applicability of a Security-owned authorization decision remain architecturally associated with protected retrieval participation and the references permitted through that boundary as they cross participating capability boundaries?

## 5.7 Failure Decisions

### D-019 — Failure Ownership

Which capability owns each failure arising from request interpretation, source retrieval, authority verification, authorization, or Context incorporation?

### D-020 — Failure Propagation

How do capability-owned failures cross collaboration boundaries without being reinterpreted by another capability?

### D-021 — Context Revision Consequence

What architectural consequence does a cognitive-reference collaboration failure have for the Context Revision being prepared?

## 5.8 Bootstrap Decisions

### D-022 — Composition Responsibility

Which cognitive-reference collaboration boundaries are composed by Bootstrap through accepted Contracts?

### D-023 — Composition Without Ownership or Authority Transfer

How does Bootstrap compose the collaboration without acquiring semantic ownership or capability authority?

## 5.9 Brain Decisions

### D-024 — Cognitive-Reference Orchestration Boundary

How may Brain coordinate cognitive-reference collaboration within its accepted orchestration ownership without acquiring or redefining the responsibilities of Context, sources, Security, Bootstrap, Core, or other participating capabilities?

### D-025 — Final Cognitive Result Boundary

How does Brain assemble and own the final cognitive result from an authoritative Context Revision and other authoritative capability outputs without acquiring, recreating, replacing, or reinterpreting their accepted semantics, authority, authorization, currentness, incorporation, or failure meaning?

## 5.10 Cross-Cutting Ownership Boundary Decisions

### D-026 — Persistence, Reconstruction, and Replay Ownership Boundary

How may authoritative architectural artifacts be retained and later used for logical reconstruction or exact replay without persistence, reconstruction, or replay acquiring their semantics, authority, authorization, currentness, incorporation, failure, orchestration, composition, custody, or final-result ownership?

### D-027 — Asynchronous, Event-Driven, and Distributed Collaboration Ownership Boundary

How may accepted cognitive-reference collaboration occur across asynchronous, event-driven, or distributed execution boundaries without changing any accepted ownership or authority boundary?

### D-028 — Refresh, Recollection, and Repeated Context Cycle Ownership Boundary

How may source information be refreshed, cognitive references be recollected, or Context preparation be repeated without mutating an existing stable-set or Active Context Revision, reusing historical authority as present authority, or transferring accepted ownership?

### D-029 — Configurable Retrieval Policy Ownership Boundary

How may retrieval relevance, ranking, selection, and related retrieval criteria be configurable without configurable policy acquiring or redefining any accepted ownership or authority boundary?

## Decision Dependencies

- D-004 through D-006 depend on D-001 through D-003 because authority boundaries require the applicable semantic owners to be identified first.
- D-007 through D-009 depend on D-003 because lifecycle questions require the ownership boundary for Context incorporation to be established.
- D-010 through D-012 depend on D-001 through D-003 because retrieval initiation and result semantics require the collaboration and source-ownership boundaries to be established.
- D-013 through D-015 depend on D-002, D-003, and D-007 through D-012 because currentness questions require source ownership, Context incorporation, lifecycle, and retrieval semantics to be established.
- D-016 through D-018 depend on D-001 through D-015 because authorization ownership, enforcement, and applicability require the collaboration, source ownership, incorporation, authority, lifecycle, retrieval, and currentness boundaries to be established first.
- D-019 through D-021 depend on D-001 through D-018 because failure ownership and consequences follow the boundaries established for each participating responsibility.
- D-022 depends on D-001 through D-021 because Bootstrap composition can be resolved only after the collaboration's ownership, authority, lifecycle, retrieval, currentness, security, and failure boundaries are established.
- D-023 depends on D-001 through D-022 because composition must preserve all previously accepted capability boundaries without acquiring ownership or authority.
- D-024 depends on D-001 through D-023 because Brain's cognitive-reference orchestration boundary must preserve the resolved collaboration and Bootstrap composition boundaries.
- D-025 depends on D-001 through D-024 because final-result ownership must preserve every contributing capability's accepted semantics and Brain's accepted orchestration boundary.
- D-026 depends on D-001 through D-025 because persistence, reconstruction, and replay must preserve the ownership and attribution of every accepted artifact and outcome.
- D-027 depends on D-001 through D-026 because asynchronous, event-driven, and distributed collaboration must preserve all accepted ownership boundaries, including persistence, reconstruction, and replay attribution.
- D-028 depends on D-001 through D-027 because refresh, recollection, and repeated Context preparation must preserve the accepted lifecycle, historical-attribution, and execution-model boundaries.
- D-029 depends on D-001 through D-028 because configurable retrieval policy must remain subordinate to every accepted capability-owned decision boundary.

## Resolution Order

The remaining sections of DECISION-0001 should resolve the decisions in the following order:

1. Ownership Decisions: D-001 through D-003.
2. Authority Decisions: D-004 through D-006.
3. Lifecycle Decisions: D-007 through D-009.
4. Retrieval Decisions: D-010 through D-012.
5. Currentness Decisions: D-013 through D-015.
6. Security Decisions: D-016 through D-018.
7. Failure Decisions: D-019 through D-021.
8. Bootstrap Decisions: D-022 and D-023.
9. Brain Decisions: D-024 and D-025.
10. Cross-Cutting Ownership Boundary Decisions: D-026 through D-029.

# 6.1 D-001 — Collaboration Ownership

### Decision

This decision identifies the accepted capability that owns the semantics of coordinating the collaboration through which cognitive references become available to Context. It does not assign source semantics, reference authority, authorization semantics, retrieval policy, or Context-incorporation criteria.

### Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for consumption by ADR-0008. It does not grant implementation authority or replace ADR authority.

### Alternatives Considered

#### Brain

Rejected. Brain owns high-level cognitive orchestration, not the semantics by which information becomes available for Context composition. Assigning this collaboration to Brain would expand orchestration ownership into Context preparation and blur the accepted boundary between coordinating capabilities and owning their semantics.

#### Bootstrap

Rejected. Bootstrap owns composition of concrete capability relationships. Treating composition as collaboration ownership would transfer domain meaning to an architectural assembly boundary and conflict with the accepted separation between composition and capability semantics.

#### Context

Accepted. Context already owns Context composition and the determination of what is relevant to reasoning at a specific moment. Ownership of the collaboration semantics belongs with that accepted responsibility while Memory, Knowledge, and Security retain their respective source and policy ownership.

#### Memory

Rejected. Memory owns intentionally retained experience and user continuity. It does not own Context relevance or collaboration involving Knowledge references, and its participation as a source does not extend its ownership to the preparation of Context.

#### Knowledge

Rejected. Knowledge owns accepted claims, validation governance, provenance requirements, and Knowledge lifecycle semantics. It does not own Context relevance or collaboration involving Memory references, and its participation as a source does not extend its ownership to the preparation of Context.

#### Security

Rejected. Security owns security policy and authorization decision semantics. Security governance applies to protected collaboration without making Security the owner of the collaboration's cognitive or contextual meaning.

#### Dedicated Retrieval Capability

Rejected for this decision. No dedicated Retrieval capability exists in the accepted M0–M10 architecture, and DECISION-0001 does not introduce a new capability. A future capability remains subject to separate architectural justification and approval.

#### Core

Rejected. Core may custody shared architectural language and approved Contracts, but that custody does not confer capability semantics. Assigning collaboration ownership to Core would conflict with the accepted separation between Core custody and Engine-owned behavior.

#### Reasoning

Rejected. Reasoning owns inference over one Active Context Revision. It consumes Context and does not own the collaboration through which references become available for Context preparation.

#### Planning

Rejected. Planning owns advisory planning. It does not own Context preparation, source semantics, or the collaboration through which cognitive references become available to Context.

#### Shared or Ownerless Collaboration

Rejected. Shared or unspecified ownership would prevent one capability from remaining accountable for the collaboration semantics and would make responsibility dependent on participants or composition rather than accepted capability boundaries.

### Recommended Decision

Context owns the semantics of coordinating the collaboration through which authorized cognitive references become available for Context preparation.

This ownership is limited to the collaboration as part of Context's accepted responsibility for Context composition and relevance. It does not transfer the semantics or authority of any participating source, security decision, cognitive reference, or outer orchestration concern to Context.

### Rationale

Context is the accepted owner of Context composition and of the information relevant to reasoning at a specific moment. Locating collaboration ownership within Context keeps the architectural question aligned with the capability whose accepted responsibility gives the collaboration its purpose.

The decision preserves accepted ownership boundaries because Memory continues to own intentionally retained experience and user continuity, Knowledge continues to own accepted claims and Knowledge governance, Security continues to own authorization decisions, Brain continues to own high-level cognitive orchestration, and Bootstrap continues to own composition. Context gains no ownership over those independent semantics.

The decision remains compatible with M0–M10 because it does not introduce a capability, revise an accepted milestone, alter existing cognitive sequencing, or change the established distinction among Core custody, Engine semantics, and Bootstrap composition.

Brain orchestration remains intact. Brain retains ownership of the high-level cognitive sequence and the final cognitive result as a Brain-owned orchestration outcome without becoming the semantic owner of Context preparation. The decision therefore distinguishes outer cognitive orchestration from the collaboration whose architectural purpose is to support Context composition.

Bootstrap composition also remains intact. Bootstrap may assemble approved relationships after normative authority and specifications exist, but assembly does not determine the meaning of the collaboration or transfer that meaning away from Context.

Source ownership remains intact because participation in the collaboration does not change what Memory and Knowledge own. The collaboration may make source-owned references available to Context, but it does not make Context the owner of Memory or Knowledge semantics, provenance, lifecycle, or authority.

The decision preserves future extensibility by locating ownership according to stable semantic purpose rather than a particular provider, storage mechanism, retrieval technique, or composition arrangement. Future architectural work may extend how relevant references are supplied without changing why the collaboration exists or transferring existing capability ownership.

### Consequences

- The collaboration has one semantic owner aligned with accepted Context ownership.
- Brain remains the owner of high-level cognitive orchestration and the final cognitive result as a Brain-owned orchestration outcome.
- Bootstrap remains the owner of composition and does not acquire collaboration semantics.
- Memory and Knowledge remain independent source capabilities with unchanged semantic ownership.
- Security remains the owner of security policy and authorization decision semantics.
- Core custody remains distinct from capability ownership.
- A dedicated Retrieval capability is not introduced or authorized by this decision.
- Later decisions remain responsible for defining the boundaries among collaboration ownership, source ownership, reference authority, and Context incorporation.

This decision does not transfer Memory semantics, Knowledge semantics, Security semantics, source authority, reference authority, authorization ownership, Context-incorporation criteria, Brain orchestration, Bootstrap composition, Core custody, Reasoning semantics, or Planning semantics to another capability.

### Deferred Implications

- D-002 remains responsible for resolving how source semantic ownership is preserved.
- D-003 remains responsible for resolving ownership of the Context-incorporation decision.
- D-004 through D-006 remain responsible for reference authority, verification, and preservation.
- D-007 through D-009 remain responsible for lifecycle relationships, reference stability, and reference change.
- D-010 through D-012 remain responsible for retrieval initiation, request semantics, and result semantics.
- D-013 through D-015 remain responsible for source and contextual currentness.
- D-016 through D-018 remain responsible for authorization and protected-boundary questions.
- D-019 through D-021 remain responsible for failure ownership, propagation, and Context Revision consequences.
- D-022 and D-023 remain responsible for Bootstrap composition boundaries.
- D-024 and D-025 remain responsible for Brain's orchestration and cognitive-result boundaries.
- D-026 through D-029 remain responsible for the cross-cutting ownership boundaries.

### Open Questions

- How is Memory or Knowledge semantic ownership preserved when either capability supplies a cognitive reference?
- Which capability owns the semantic decision to incorporate a supplied cognitive reference into Context?
- How are reference authority, verification, and authority preservation assigned?
- How does the collaboration relate to Context lifecycle and currentness?
- How are retrieval semantics divided among the participating owners?
- How is Security-owned authorization applied and enforced?
- How are capability-owned failures assigned and preserved across the collaboration?
- How do Bootstrap and Brain participate without acquiring Context collaboration semantics?
- Which implications remain explicitly deferred beyond DECISION-0001?

# 6.2 D-002 — Source Semantic Ownership

## Decision

This decision resolves whether Memory and Knowledge retain semantic ownership of the meaning represented by cognitive references after those references participate in Context collaboration, cross architectural boundaries, are incorporated into Context, or are consumed downstream.

Participation in Context collaboration does not itself transfer source semantic ownership. D-001 assigns Context ownership of the collaboration semantics; it does not assign Context ownership of the source meaning made available through that collaboration.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace the authority of an approved ADR or corresponding specifications.

## Alternatives Considered

### Source Ownership Remains with Memory and Knowledge

Accepted. Memory and Knowledge remain responsible for the meaning governed by their accepted capability boundaries even when a reference to that meaning participates in Context collaboration, Context composition, or downstream cognitive consumption.

### Source Ownership Transfers to Context When References Are Incorporated

Rejected. Incorporation concerns contextual relevance and composition; it does not convert retained experience into Context-owned Memory semantics or accepted claims into Context-owned Knowledge semantics.

### Shared Ownership Between Context and the Source

Rejected. Shared semantic ownership would create overlapping authority for the same source meaning and weaken the accepted separation between Context relevance, Memory retention, and Knowledge governance.

### Ownership Transfers to Brain After References Enter the Cognitive Pipeline

Rejected. Brain owns high-level cognitive orchestration, not the Memory or Knowledge semantics represented by values participating in the cognitive pipeline.

### Ownership Transfers to Core Because References Use Core-Custodied Values or Contracts

Rejected. Core custody provides shared architectural language and boundaries but does not confer capability behavior or semantic ownership.

### Ownership Transfers to Bootstrap Because It Composes the Source

Rejected. Bootstrap composition connects approved participants without acquiring the semantics of the capabilities or values it composes.

### Ownership Is Represented by Copied or Normalized Context-Owned Values

Rejected. Copying, projecting, or normalizing a representation does not change the capability that owns the represented source meaning, and representational custody cannot substitute for semantic ownership.

### Ownership Remains Undefined After Crossing the Source Boundary

Rejected. Undefined ownership would make provenance, lifecycle responsibility, and semantic accountability ambiguous as soon as source-owned meaning participates in another capability.

## Recommended Decision

Memory retains semantic ownership of Memory meaning represented by a cognitive reference, and Knowledge retains semantic ownership of Knowledge meaning represented by a cognitive reference, across Context collaboration, reference transport, Context incorporation, and downstream consumption.

Context owns the collaboration semantics established by D-001 and retains its accepted ownership of relevance and Context composition. Transport of a reference does not confer source semantic ownership. Incorporation determines that source-owned meaning participates in Context without converting that meaning into Context-owned Memory or Knowledge semantics. Downstream consumption does not transfer source semantic ownership to Brain, Reasoning, Planning, Bootstrap, Core, or another consumer or custodian.

This decision does not resolve reference authority, authority verification, the unit of authority, or how authority may be represented.

## Rationale

Memory owns intentionally retained experience and user continuity. Preserving source semantic ownership keeps retained experience, provenance, retention, and forgetting within the Memory capability even when Memory meaning is represented elsewhere.

Knowledge owns justified claims accepted as sufficiently true by the platform. Preserving source semantic ownership keeps claim acceptance, versions, supersession, and source-domain currency within the Knowledge capability even when Knowledge meaning contributes to Context.

Context continues to own relevance and composition. It can determine which represented information participates in Context without acquiring the independent semantics that make an experience Memory or a claim Knowledge. This preserves D-001: Context owns the collaboration's contextual purpose while each source retains ownership of the meaning it contributes.

Brain continues to own orchestration. Moving references through a cognitive sequence or making them available to cognitive participants does not make Brain responsible for Memory retention or Knowledge governance.

Bootstrap continues to own composition. Connecting Context with accepted source capabilities does not make Bootstrap the owner of the source meaning carried across those relationships.

Core remains the custodian of shared architectural language where applicable. The location or custody of a value or Contract does not displace the capability that owns its domain meaning.

Reasoning and Planning remain consumers within their accepted boundaries. Using source references as part of inference or advisory planning does not make either capability responsible for Memory or Knowledge semantics.

The decision supports future source extensibility because semantic ownership follows the capability that owns the represented meaning rather than the transport path, Context representation, consumer, or composition arrangement. An additional accepted source can participate without requiring Context, Brain, Core, or Bootstrap to absorb its semantics.

A reference or projection may represent source-owned meaning without introducing source-owned behavior inside Context. The representation allows that meaning to participate in Context while the source capability remains accountable for the semantics that the representation denotes and Context remains accountable only for its own relevance and composition concerns.

## Consequences

- Memory remains the semantic owner of represented retained experience, provenance, retention, and forgetting.
- Knowledge remains the semantic owner of represented accepted claims, versions, supersession, and source-domain currency.
- Context may incorporate a reference without owning the source semantics it represents.
- Brain may transport or consume references without acquiring source semantics.
- Reasoning and Planning may use source references without becoming source owners.
- Bootstrap may wire the collaboration without gaining source semantics.
- Core value custody does not confer source ownership.
- Source lifecycle decisions remain with the issuing source capability.
- A copied, projected, or normalized representation does not establish a new owner of the represented source meaning.
- Future accepted sources retain their own semantics when participating in Context collaboration.

This decision does not transfer Memory semantics, Knowledge semantics, source provenance ownership, source lifecycle ownership, retention or forgetting decisions, claim acceptance, versioning, supersession, source-domain currency, Context collaboration ownership, Context relevance, Context composition, Brain orchestration, Bootstrap composition, Core custody, Reasoning semantics, or Planning semantics.

## Deferred Implications

- D-003 remains responsible for Context incorporation ownership.
- D-004 through D-006 remain responsible for reference authority, verification, and preservation.
- D-010 through D-012 remain responsible for retrieval initiation, request semantics, and result semantics.
- D-013 through D-015 remain responsible for source and contextual currentness.
- D-016 through D-018 remain responsible for Security-owned authorization and enforcement questions.
- D-019 through D-021 remain responsible for failure ownership, propagation, and Context Revision consequences.
- Exact Contract and representation shapes remain unresolved.
- Whether references, batches, or projections carry authority remains unresolved.

## Open Questions

- Which capability owns the semantic decision to incorporate a supplied cognitive reference into Context?
- Which architectural unit, if any, carries source authority?
- Which capability establishes and verifies reference authority?
- How are cognitive references requested and returned across source boundaries?
- How are source currentness and contextual currentness distinguished and evaluated?
- How is Security-owned authorization applied and enforced across the collaboration?
- How are source, collaboration, authority, authorization, and incorporation failures assigned and preserved?
- What representation boundaries are formalized by future Contracts and specifications?

# 6.3 D-003 — Context Incorporation Ownership

## Decision

This decision resolves which capability owns the architectural decision that a source reference becomes part of a
Context Revision.

Incorporation is owned by Context because it is a decision about Context composition and relevance. Incorporation
ownership is an architectural responsibility boundary, not a runtime algorithm, execution sequence, selection
procedure, retrieval mechanism, or implementation rule.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Context Owns Incorporation

Accepted. Context owns composition and relevance and therefore owns the decision that a supplied source reference
participates in a Context Revision. This is compatible with D-001 and does not disturb the source semantic ownership
preserved by D-002.

### Memory Owns Incorporation

Rejected. Memory owns intentionally retained experience and user continuity. It may supply Memory references, but it
does not own the composition or relevance of a Context Revision.

### Knowledge Owns Incorporation

Rejected. Knowledge owns accepted claims and Knowledge governance. It may supply Knowledge references, but it does not
own the composition or relevance of a Context Revision.

### Brain Owns Incorporation

Rejected. Brain owns high-level cognitive orchestration. Orchestrating the cognitive sequence does not confer
ownership of decisions internal to Context composition.

### Bootstrap Owns Incorporation

Rejected. Bootstrap owns composition of approved architectural relationships. Connecting capabilities does not confer
ownership of the semantic decisions made through those relationships.

### Security Owns Incorporation

Rejected. Security owns security policy and authorization decision semantics. Security may constrain whether
participation is permitted, but it does not determine contextual relevance or own Context composition.

### Shared Incorporation Ownership

Rejected. Shared ownership would create overlapping accountability among Context and source capabilities and would
blur the distinction between source semantics and Context composition.

### Incorporation Determined by Transport

Rejected. Transport explains how a reference crosses a boundary, not whether its represented meaning belongs in a
Context Revision. A transport path cannot own a semantic decision.

### Incorporation Determined by Authority

Rejected. Authority and incorporation answer different questions. Authority may concern the standing of a reference,
while incorporation concerns its participation in Context. This decision does not resolve authority.

### Incorporation Determined by Downstream Consumers

Rejected. Brain, Reasoning, Planning, or other downstream consumers consume the resulting Context within their
accepted boundaries. Their intended use does not transfer ownership of Context composition or permit them to own
incorporation.

## Recommended Decision

Context owns the architectural decision to incorporate a supplied source reference into a Context Revision.

Context’s ownership of collaboration under D-001 concerns the semantics through which cognitive references become
available for Context preparation. Memory and Knowledge retain ownership of their respective source semantics under D- 002. Incorporation concerns whether available source-owned meaning participates in a particular Context Revision.
Authority concerns the standing of that meaning or its reference and remains unresolved. Downstream consumption
concerns the use of the resulting Context and does not confer ownership of incorporation.

This decision does not resolve authority, retrieval, or currentness.

## Rationale

Context already owns composition and the determination of relevance for reasoning at a specific moment. Assigning
incorporation ownership to Context keeps the decision with the capability whose accepted responsibility gives
incorporation its architectural meaning.

Memory ownership remains intact. Context may incorporate a Memory reference without acquiring ownership of retained
experience, user continuity, provenance, retention, or forgetting.

Knowledge ownership remains intact. Context may incorporate a Knowledge reference without acquiring ownership of
accepted claims, validation governance, provenance requirements, versions, supersession, or source-domain currency.

Brain orchestration remains intact. Brain may coordinate the broader cognitive sequence and consume the resulting
Context without deciding which source references become part of a Context Revision.

Bootstrap composition remains intact. Bootstrap may compose approved relationships among Context, Memory, Knowledge,
Security, and other participants without acquiring incorporation semantics.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Context ownership of incorporation neither replaces nor redefines Security responsibilities.

Core custody remains intact. Core may custody shared architectural language and approved Contracts, but that custody
does not confer ownership of Context incorporation or source semantics.

Incorporation does not transfer semantic ownership because selecting source-owned meaning for contextual participation
does not change what that meaning is or which capability governs it. Context owns only the contextual composition
decision; the contributing source remains the semantic owner.

The model preserves future extensibility because incorporation ownership follows the stable purpose of Context rather
than a particular source, provider, transport, storage mechanism, retrieval approach, authority model, consumer, or
composition arrangement. Future accepted sources can participate without transferring their semantics to Context or
acquiring ownership of Context composition.

## Consequences

- Context decides whether a source reference becomes part of a Context Revision.
- That decision does not transfer source semantic ownership.
- That decision does not establish authority.
- That decision does not redefine retrieval.
- That decision does not redefine Security.
- Downstream consumers consume the resulting Context without owning the incorporation decision.
- Memory and Knowledge remain responsible for the semantics represented by their respective references.
- Context incorporation remains distinct from the collaboration through which references become available.
- Brain remains responsible for high-level cognitive orchestration, not Context incorporation.
- Bootstrap remains responsible for architectural composition, not Context incorporation.
- Security constraints remain independently owned by Security.
- Core custody of shared language or Contracts does not confer incorporation ownership.
- Transport, authority, and consumer intent do not determine incorporation ownership.

This decision does not transfer Memory semantics, Knowledge semantics, source provenance ownership, source lifecycle
ownership, source authority, reference authority, authorization ownership, Security policy, retrieval ownership,
currentness ownership, Brain orchestration, Bootstrap composition, Core custody, Reasoning semantics, Planning
semantics, or downstream-consumer responsibilities.

## Deferred Implications

The following remain unresolved:

- authority;
- verification;
- retrieval;
- currentness;
- Security enforcement;
- failures;
- representation;
- Contracts.

## Open Questions

- What establishes the authority of a source reference?
- How is reference authority verified and preserved?
- How are references requested and returned across source boundaries?
- How are source currentness and contextual currentness distinguished?
- How is Security-owned enforcement applied to collaboration and incorporation?
- How are failures assigned and reflected in Context Revision outcomes?
- How are source references and incorporation outcomes represented?
- Which boundaries require formal Contracts?

# 7.1 D-004 — Reference Authority

## Decision

This decision resolves which architectural participant originates the authority associated with a cognitive reference
when that reference participates in Context collaboration, incorporation, transport, or downstream consumption.

For this decision, authority means the architectural origin of trust or validity associated with a cognitive
reference. It does not mean semantic ownership, authorization, verification, representation, or contextual relevance.

This decision identifies authority origin only. It does not define how authority is verified or represented.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Authority Originates from the Issuing Source Capability

Accepted. The capability that issues a cognitive reference is the architectural origin of the authority associated
with that reference. This keeps authority connected to the source boundary from which the reference originates without
transferring collaboration or incorporation ownership.

### Authority Originates When Context Incorporates the Reference

Rejected. Context owns incorporation, but incorporation determines contextual participation rather than originating
trust or validity. Context does not become the authority source by including a reference in a Context Revision.

### Authority Originates in Brain

Rejected. Brain owns high-level cognitive orchestration. Coordinating references or consuming the resulting Context
does not make Brain the origin of their authority.

### Authority Originates in Bootstrap

Rejected. Bootstrap composes approved architectural relationships. Composition does not establish the trust or
validity associated with references exchanged through those relationships.

### Authority Originates in Security

Rejected. Security owns security policy and authorization decision semantics. Those responsibilities may constrain
participation but do not make Security the origin of the cognitive authority associated with a source-issued
reference.

### Authority Originates in Core

Rejected. Core may custody shared architectural language and approved Contracts. Custody of common abstractions does
not make Core the origin of authority for capability-issued references.

### Authority Originates from Downstream Consumers

Rejected. Reasoning, Planning, Brain, or other consumers may use a Context Revision without creating authority for its
incorporated references. Consumption cannot retroactively establish the architectural origin of trust or validity.

### Authority Is Created During Transport

Rejected. Transport moves a reference across an architectural boundary. The path or mechanism used for transport
cannot mint authority for the transported reference.

### Authority Is Reconstructed After Incorporation

Rejected. Reconstruction would detach authority from the issuing source boundary and make Context or another
participant responsible for recreating trust or validity it did not originate.

### Authority Is Ownerless or Emergent

Rejected. Ownerless or emergent authority would leave the origin of trust or validity ambiguous and make it dependent
on participation, consensus, transport, or consumption rather than an accountable architectural boundary.

## Recommended Decision

The issuing source capability is the architectural origin of the authority associated with a cognitive reference.

Semantic ownership identifies the capability responsible for the meaning represented by a reference. Authority origin
identifies the capability boundary from which the reference derives its architectural claim to trust or validity.
These concepts remain related because both are anchored at the issuing source, but they are not identical.

Context incorporation determines whether the reference participates in a Context Revision; it does not originate
authority. Transport conveys the reference; it does not create authority. Downstream consumption uses the resulting
Context; it does not originate authority.

This decision does not resolve authority verification, authority preservation, Contracts, or representation.

## Rationale

D-001 remains preserved because Context continues to own the collaboration semantics through which cognitive
references become available for Context preparation. Locating authority origin at the issuing source does not transfer
collaboration ownership away from Context.

D-002 remains preserved because Memory and Knowledge retain semantic ownership of the meaning represented by their
references. Authority originates at the issuing source boundary without redefining that semantic ownership or treating
authority and semantics as the same architectural concept.

D-003 remains preserved because Context continues to own the incorporation decision. Context may decide that a source
reference becomes part of a Context Revision without creating or acquiring the authority associated with that
reference.

Brain orchestration remains intact. Brain may coordinate the broader cognitive sequence without becoming the authority
origin for references participating in that sequence.

Bootstrap composition remains intact. Bootstrap may assemble approved relationships without originating authority for
values exchanged through them.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Source-originated cognitive authority neither replaces Security responsibilities nor makes the issuing source the
owner of authorization.

Core custody remains intact. Core may custody shared architectural language and approved Contracts without originating
the authority of capability-issued references.

Authority origin remains with the issuing capability when a reference participates elsewhere because collaboration,
incorporation, transport, and consumption do not change the architectural boundary from which the reference was
issued. Participation may place the reference in additional contexts, but it does not create a new origin of trust or
validity.

The model supports future extensibility because every future accepted source can originate authority for the
references it issues without requiring Context, Brain, Bootstrap, Security, Core, transport mechanisms, or downstream
consumers to absorb source-specific responsibilities.

## Consequences

- The issuing source capability is the architectural origin of authority associated with its cognitive references.
- Context does not create authority by incorporating a reference.
- Brain does not create authority by orchestrating.
- Bootstrap does not create authority by composing.
- Transport does not mint authority.
- Downstream consumption does not mint authority.
- Security policy and authorization decisions do not make Security the origin of cognitive-reference authority.
- Core custody does not make Core the origin of cognitive-reference authority.
- A reference does not gain a new authority origin merely because it participates in a Context Revision.
- Semantic ownership and authority origin remain related but are not identical architectural concepts.
- Collaboration ownership, source semantic ownership, incorporation ownership, and authority origin remain distinct
  architectural responsibilities.

This decision does not establish how authority is verified, preserved, encoded, represented, transported, compared,
accepted, rejected, refreshed, or exposed through Contracts. It does not establish retrieval behavior, currentness
criteria, Security enforcement, failure handling, runtime sequencing, or implementation algorithms.

## Deferred Implications

The following remain unresolved:

- authority verification;
- authority preservation;
- representation;
- Contracts;
- retrieval;
- currentness;
- Security enforcement;
- failures.

## Open Questions

- Which capability verifies the authority associated with a cognitive reference?
- How is authority preserved when a reference crosses architectural boundaries?
- How is authority represented without transferring semantic ownership?
- Which authority boundaries require formal Contracts?
- How does retrieval interact with source-originated authority?
- How does currentness affect the authority associated with a reference?
- How is Security-owned enforcement applied without becoming the origin of cognitive authority?
- How are authority-related failures assigned and preserved?

# 7.2 D-005 — Authority Verification

## Decision

This decision resolves which capability owns the architectural responsibility for validating the source-originated
authority associated with a cognitive reference.

Authority verification concerns responsibility for validating authority that originates with the issuing source
capability under D-004. It does not originate authority, determine Context incorporation, or establish Security
authorization.

This decision defines an architectural ownership boundary only. It does not define verification algorithms, APIs,
verifier implementations, Contracts, or runtime behavior.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Verification Responsibility Remains with the Issuing Source Capability

Accepted. The issuing source capability owns verification of the authority it originates. Other participants may
invoke that source-owned responsibility or consume its results without acquiring verification ownership.

### Verification Belongs to Context

Rejected. Context owns collaboration and incorporation, not validation of source-originated authority. Requesting
verification or using its result when composing a Context Revision would not make Context the verification owner.

### Verification Belongs to Brain

Rejected. Brain owns high-level cognitive orchestration. It may coordinate activity involving verification without
acquiring responsibility for validating source-originated authority.

### Verification Belongs to Bootstrap

Rejected. Bootstrap owns architectural composition. Connecting an issuer with participants that invoke verification or
consume its results does not confer verification ownership.

### Verification Belongs to Security

Rejected. Security owns security policy and authorization decision semantics. Authorization and authority verification
are distinct responsibilities; applying security constraints does not make Security responsible for validating
cognitive authority originated by a source capability.

### Verification Belongs to Core

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer
capability behavior or ownership of source-specific verification semantics.

### Verification Belongs to Downstream Consumers

Rejected. Downstream consumers may rely on or consume verification results within their accepted responsibilities.
Consumption does not make them owners of the validation responsibility.

### Verification Belongs to Transport

Rejected. Transport may convey references, requests, or results, but movement across an architectural boundary cannot
validate source-originated authority or own its verification semantics.

### Verification Is Recreated After Incorporation

Rejected. Recreating verification after incorporation would detach validation responsibility from the capability that
originated the authority and risk making Context or a consumer an alternate authority boundary.

### Verification Is Shared by All Participants

Rejected. Shared verification ownership would create overlapping accountability and allow collaboration participants,
transport mechanisms, or consumers to redefine source-owned validation. Invocation and result consumption do not
require shared ownership.

## Recommended Decision

The issuing source capability owns verification of the authority associated with each cognitive reference it issues.

Authority origin identifies the capability boundary from which a reference derives its architectural claim to trust or
validity. Authority verification validates that source-originated authority. Authority preservation concerns how
authority remains associated across boundaries and remains unresolved.

Context owns collaboration and incorporation but not authority verification. Other capabilities may invoke issuer-
owned verification without owning it. Downstream consumers may consume verification results without acquiring
authority, verification ownership, or source semantic ownership.

This decision does not resolve authority preservation, Contracts, representation, or runtime sequencing.

## Rationale

D-001 remains preserved because Context continues to own the collaboration semantics through which references become
available. Invoking source-owned verification within that collaboration does not transfer collaboration ownership to
the issuer or verification ownership to Context.

D-002 remains preserved because Memory and Knowledge continue to own the semantics represented by their references.
Verification validates source-originated authority without transferring or recreating those semantics.

D-003 remains preserved because Context continues to decide whether a supplied reference becomes part of a Context
Revision. Context may use a verification result when exercising its accepted responsibility, but doing so does not
make Context the owner of verification.

D-004 remains preserved because authority originates with the issuing source capability. Keeping verification
ownership with that capability aligns validation responsibility with the architectural boundary that originates the
authority without treating authority origin and verification as identical concepts.

Brain orchestration remains intact. Brain may orchestrate participants whose collaboration involves verification, but
orchestration does not confer verification ownership.

Bootstrap composition remains intact. Bootstrap may compose approved relationships involving issuers, invokers, and
consumers without acquiring the semantics of verification.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Authority verification validates source-originated cognitive authority and neither replaces nor redefines Security
authorization.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
owning source-specific verification behavior.

Issuer-owned verification can be used elsewhere because invocation and result consumption are forms of participation,
not ownership. A participant can request validation or rely on its outcome while the issuing capability remains
accountable for what validation means within its source boundary.

The model supports future extensibility because each future accepted source can own verification of the authority it
originates. Context, Brain, Bootstrap, Security, Core, transports, and consumers do not need to absorb source-specific
verification semantics as new sources are introduced.

## Consequences

- Verification ownership remains with the issuing capability.
- Another capability may invoke issuer-owned verification without acquiring ownership.
- Context does not become verifier owner by requesting verification.
- Brain does not become verifier owner by orchestrating.
- Bootstrap does not become verifier owner by composing.
- Security authorization remains distinct from authority verification.
- Verification results do not transfer semantic ownership.
- Consuming a verification result does not make a downstream participant the authority origin or verification owner.
- Transporting a verification request or result does not confer verification ownership.
- Context incorporation does not recreate or transfer verification responsibility.
- Core custody of shared language or future Contracts does not confer verification ownership.
- Collaboration ownership, incorporation ownership, authority origin, verification ownership, and result consumption
  remain distinct architectural responsibilities.

This decision does not establish how authority is preserved, represented, encoded, requested, validated, communicated,
or consumed at runtime. It does not establish verifier APIs, algorithms, implementations, Contracts, retrieval
behavior, currentness criteria, Security enforcement, failure handling, or runtime sequencing.

## Deferred Implications

The following remain unresolved:

- authority preservation;
- representation;
- Contracts;
- retrieval;
- currentness;
- Security enforcement;
- failures;
- runtime sequencing.

## Open Questions

- How is source-originated authority preserved when a reference crosses architectural boundaries?
- How are authority and verification results represented?
- Which verification boundaries require formal Contracts?
- How does retrieval interact with issuer-owned verification?
- How does currentness affect verification meaning or validity?
- How is Security-owned enforcement applied alongside authority verification?
- How are verification failures assigned and reflected across the collaboration?
- When may verification be invoked within the cognitive sequence?

# 7.3 D-006 — Authority Preservation

## Decision

This decision resolves whether the architectural association between a cognitive reference and its source-originated
authority remains intact while that reference participates in Context collaboration, incorporation, transport,
verification, and downstream consumption.

Authority preservation means maintaining that architectural association across participation boundaries. It does not
originate, recreate, transfer, or verify authority.

This decision defines an architectural continuity boundary only. It does not define representation, encoding,
Contracts, APIs, runtime mechanisms, or algorithms.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Authority Remains Continuously Associated with the Issued Reference

Accepted. The source-originated authority associated with an issued cognitive reference remains architecturally
associated with that reference throughout collaboration, incorporation, transport, verification, and downstream
consumption.

### Authority Is Recreated After Incorporation

Rejected. Context incorporation determines participation in a Context Revision; it does not create a new authority or
reproduce the authority originated by the issuing source.

### Authority Transfers to Context

Rejected. Context owns collaboration and incorporation, but neither responsibility makes Context the origin or
recipient of transferred authority.

### Authority Transfers to Brain

Rejected. Brain owns high-level cognitive orchestration. Orchestrating or consuming a reference does not transfer its
source-originated authority to Brain.

### Authority Transfers to Bootstrap

Rejected. Bootstrap owns architectural composition. Composing approved relationships does not transfer authority from
an issuing capability to Bootstrap.

### Authority Transfers to Security

Rejected. Security owns security policy and authorization decision semantics. Applying those responsibilities does not
transfer cognitive-reference authority to Security.

### Authority Transfers During Transport

Rejected. Transport moves a reference across architectural boundaries. Crossing those boundaries does not change the
origin or architectural association of its authority.

### Authority Is Copied into a New Owner

Rejected. A copied, projected, or otherwise distinct representation must not create another owner of the same source-
originated authority. Representational duplication cannot establish architectural ownership.

### Authority Is Reconstructed by Downstream Consumers

Rejected. Downstream consumers use the resulting Context within their accepted responsibilities. They cannot
reconstruct authority they did not originate or become its new architectural source through consumption.

### Authority Is Detached After Verification

Rejected. Verification validates source-originated authority; it does not consume, exhaust, replace, or detach that
authority from the issued reference.

## Recommended Decision

Source-originated authority remains architecturally associated with an issued cognitive reference throughout its
participation in collaboration, incorporation, transport, verification, and downstream consumption.

Authority origin identifies the issuing source capability as the origin of trust or validity associated with the
reference. Authority verification remains an issuer-owned responsibility for validating that authority. Authority
preservation maintains the association between the reference and that source-originated authority without recreating
or transferring it.

Semantic ownership remains with the capability that owns the represented meaning. Context owns collaboration and
incorporation but does not acquire source authority. Downstream consumers use the resulting Context without acquiring
authority, verification ownership, incorporation ownership, or source semantic ownership.

This decision does not define representation, Contracts, or runtime sequencing.

## Rationale

D-001 remains preserved because Context continues to own the collaboration semantics. Maintaining a reference’s
association with source-originated authority does not transfer collaboration ownership to the issuer or another
participant.

D-002 remains preserved because Memory and Knowledge continue to own the semantics represented by their references.
Authority preservation maintains an authority association without transferring, duplicating, or redefining source
semantic ownership.

D-003 remains preserved because Context continues to own incorporation. Incorporating a reference into a Context
Revision changes its contextual participation, not its authority origin or association.

D-004 remains preserved because the issuing source capability remains the architectural origin of authority.
Preservation carries that association across participation boundaries rather than creating a replacement origin.

D-005 remains preserved because the issuing capability continues to own authority verification. Verification may
validate the preserved association, but it neither originates nor consumes the associated authority.

Brain orchestration remains intact. Brain may coordinate the cognitive sequence without acquiring or recreating
authority for participating references.

Bootstrap composition remains intact. Bootstrap may compose approved relationships without owning or transferring
authority carried across those relationships.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Preserved cognitive authority does not replace Security authorization or transfer authority ownership to Security.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
becoming the origin, owner, or recipient of source authority.

Preserving authority differs from recreating it because preservation maintains continuity with the original issuing
boundary, whereas recreation would claim a new basis for authority. It differs from transfer because preservation
leaves the origin and ownership boundaries unchanged, whereas transfer would assign authority to another participant.

The model supports future extensibility because additional accepted sources can preserve the authority associated with
their references without requiring Context, Brain, Bootstrap, Security, Core, transports, or consumers to absorb
source-specific authority responsibilities.

## Consequences

- Authority remains architecturally associated with the issued reference.
- Incorporation does not detach authority.
- Transport does not detach authority.
- Verification does not consume authority.
- Downstream consumption does not detach authority.
- Preserving authority does not transfer semantic ownership.
- Preserving authority does not redefine verification.
- Collaboration does not create a replacement authority association.
- Context does not acquire authority by incorporating a reference.
- Brain does not acquire authority by orchestrating or consuming a reference.
- Bootstrap does not acquire authority by composing participating capabilities.
- Security authorization remains distinct from preserved cognitive authority.
- Core custody does not confer ownership of preserved authority.
- Copying, projecting, or normalizing a reference does not create a new authority origin or owner.
- Authority origin, verification, and preservation remain distinct architectural concepts.

This decision does not establish how authority is represented, encoded, copied, transmitted, stored, resolved, or
exposed. It does not establish Contracts, APIs, retrieval behavior, currentness criteria, Security enforcement,
failure handling, runtime sequencing, implementation mechanisms, or algorithms.

## Deferred Implications

The following remain unresolved:

- representation;
- Contracts;
- retrieval;
- currentness;
- Security enforcement;
- failures;
- runtime sequencing;
- implementation mechanisms.

## Open Questions

- How is preserved authority represented across architectural boundaries?
- Which authority-preservation boundaries require formal Contracts?
- How does retrieval interact with preserved authority?
- How does currentness affect preserved authority?
- How is Security-owned enforcement applied to references with preserved authority?
- How are authority-preservation failures assigned and reflected across the collaboration?
- How is authority preservation expressed within runtime sequencing?
- Which implementation mechanisms maintain the architectural association without creating a new authority origin?

# 8.1 D-007 — Context Revision Relationship

## Decision

This decision resolves how cognitive-reference collaboration participates in the already accepted Context Revision
lifecycle.

Cognitive-reference collaboration belongs to preparation of a Context Revision and must be completed before that
revision becomes Active. Preparation encompasses the existing pre-activation lifecycle without assigning reference
collaboration to an exact state transition or defining an exact execution sequence.

This decision does not define Contracts, APIs, algorithms, runtime mechanisms, or failure precedence.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Reference Collaboration Occurs as Part of Preparation of a Context Revision Before Activation

Accepted. This aligns reference collaboration with Context ownership of composition and incorporation, preserves the
existing lifecycle, and ensures that downstream cognitive work receives one completed Active Context Revision.

### Reference Collaboration Occurs After Context Activation

Rejected. Post-activation collaboration would permit the evidence available to an Active revision to change and would
conflict with Active revision immutability and one revision per reasoning cycle.

### Reference Collaboration Occurs Independently of the Context Revision Lifecycle

Rejected. Independent collaboration would separate cognitive evidence preparation from the Context lifecycle that
gives that evidence contextual relevance and composition meaning.

### Reference Collaboration Creates a Separate Parallel Cognitive Snapshot

Rejected. A parallel snapshot would create a second representation of cognitive evidence outside Context, producing
ambiguous ownership and competing inputs for downstream consumers.

### Brain Owns a Separate Reference Lifecycle

Rejected. Brain owns high-level cognitive orchestration, not Context preparation or reference lifecycle semantics. A
Brain-owned reference lifecycle would duplicate Context responsibilities.

### References May Be Added Incrementally to an Already Active Revision

Rejected. Incremental enrichment would mutate the evidence basis of an Active revision and undermine deterministic
reasoning over one immutable Context Revision.

### Reference Collaboration Requires New Context Lifecycle States

Rejected. The accepted lifecycle already distinguishes preparation, activation, expiration, and optional archival.
This decision introduces no need for additional states.

### Reference Collaboration Is Owned by Bootstrap or Transport Lifecycle

Rejected. Bootstrap owns architectural composition, while transport conveys references across boundaries. Neither owns
Context lifecycle semantics or determines when Context preparation is complete.

## Recommended Decision

Cognitive-reference collaboration participates in preparation of a Context Revision and must be completed before that
revision becomes Active.

Collaboration lifecycle participation describes how source references contribute during Context preparation. It does
not absorb or redefine the independent lifecycles of Memory, Knowledge, or another issuing source. Authority continues
to originate with the issuing capability, verification remains issuer-owned, and authority remains associated with the
issued reference.

Context retains ownership of incorporation and activation within its accepted lifecycle responsibilities. Once the
revision becomes Active, downstream consumers consume that single Active Context Revision rather than receiving
incremental reference additions or a parallel evidence snapshot.

This decision does not determine the exact reference stability or freezing point addressed by D-008. It does not
determine how meaningful source or reference changes after activation are treated, which remains reserved for D-009.

## Rationale

The decision preserves the accepted Context lifecycle:

Collecting
→ Composing
→ Validating
→ Active
→ Expired
→ optionally Archived

Reference collaboration participates within preparation before Active without introducing another lifecycle state or
prescribing an exact allocation among Collecting, Composing, and Validating.

Completing collaboration before activation preserves one Active Context Revision per reasoning cycle. Reasoning and
other downstream consumers receive one coherent contextual evidence boundary rather than observing a revision whose
incorporated references change during consumption.

Active revision immutability remains intact because an Active revision is not incrementally enriched. Later
information cannot silently alter the evidence basis already presented to a reasoning cycle.

D-001 remains preserved because Context continues to own the collaboration semantics. Relating collaboration to
Context preparation does not transfer collaboration ownership to Brain, Bootstrap, a source, or transport.

D-002 remains preserved because Memory and Knowledge retain semantic ownership of the meaning represented by their
references. Participation in Context preparation does not merge source lifecycles into the Context lifecycle.

D-003 remains preserved because Context continues to own incorporation. Lifecycle participation identifies when
incorporation belongs architecturally without defining incorporation algorithms or exact sequencing.

D-004 through D-006 remain preserved because authority originates with the issuing source, verification remains
issuer-owned, and authority remains associated with the issued reference throughout collaboration and incorporation.
Context activation does not recreate or transfer authority.

Memory and Knowledge retain ownership of their respective source lifecycles. Context preparation consumes source-
issued references for contextual composition without governing retention, forgetting, claim acceptance, versioning,
supersession, or source-domain currency.

Brain orchestration remains intact. Brain may orchestrate a reasoning cycle around an Active Context Revision without
maintaining a separate lifecycle for its references.

Bootstrap composition remains intact. Bootstrap may compose approved capability relationships without determining the
lifecycle semantics of Context or participating sources.

The model supports deterministic cognitive evidence because downstream consumers operate against one completed and
immutable Active Context Revision. Collaboration must not create a second independent evidence snapshot outside
Context because doing so would introduce competing evidence boundaries and make the basis of a cognitive result
ambiguous.

Future source extensibility remains possible because additional accepted sources can participate in Context Revision
preparation while retaining their own semantics, authority responsibilities, and lifecycles.

## Consequences

- Reference collaboration participates in Context Revision preparation.
- Reference collaboration completes before activation.
- An Active revision is not incrementally enriched.
- Downstream consumers receive one authoritative Active Context Revision for a reasoning cycle.
- Source lifecycles remain separate from the Context lifecycle.
- Authority origin, verification, and preservation remain source-owned.
- No new Context lifecycle state is introduced.
- Brain does not maintain a parallel reference lifecycle.
- Bootstrap does not own lifecycle semantics.
- Transport lifecycle does not determine Context lifecycle participation.
- Context preparation does not create a second independent cognitive-evidence snapshot.
- Context incorporation remains distinct from source lifecycle and source semantic ownership.
- Activation establishes the revision consumed downstream without transferring source semantics or authority.

This decision does not establish the exact reference stability or freezing point, the treatment of meaningful source
or reference changes after activation, retrieval sequencing, currentness evaluation, Security timing, failure
precedence, Contracts, APIs, algorithms, or runtime mechanisms.

## Deferred Implications

- D-008 remains responsible for the exact reference stability or freezing point.
- D-009 remains responsible for the treatment of meaningful source or reference changes.
- Retrieval sequencing remains unresolved.
- Currentness evaluation remains unresolved.
- Security timing remains unresolved.
- Failure precedence remains unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- At what exact point during Context Revision preparation do incorporated references become stable?
- How are meaningful source or reference changes treated after activation?
- How does retrieval sequencing relate to Context Revision preparation?
- When is currentness evaluated relative to activation?
- How does Security-owned enforcement relate temporally to preparation and activation?
- How are competing failures ordered before activation?
- Which lifecycle boundaries require formal Contracts?
- Which runtime mechanisms support this lifecycle relationship?

# 8.2 D-008 — Reference Stability

## Decision

This decision resolves the architectural point after which the complete incorporated reference set for one Context
Revision cannot change.

The incorporated reference set becomes stable before Context validation begins and remains unchanged through
validation, activation, and downstream consumption.

Reference stability is an architectural property of one Context Revision. This decision does not define data
structures, algorithms, APIs, Contracts, or exact runtime calls.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### References Become Stable Before Context Validation Begins

Accepted. Closing the complete incorporated reference set before validation ensures that validation evaluates one
candidate Context Revision whose incorporated-reference set is stable and that subsequent activation and consumption
preserve the same evidence boundary.

### References Become Stable Only When the Revision Becomes Active

Rejected. Validation would otherwise observe a changing candidate, preventing it from evaluating the same reference
set that later becomes Active.

### References May Change During Validation

Rejected. Adding, removing, replacing, reordering, or substituting references during validation would make the
validation subject unstable and its architectural meaning ambiguous.

### References Become Stable Immediately When Retrieved

Rejected. Retrieval does not determine incorporation, and individual retrieval completion does not establish that the
complete Context Revision reference set has been composed.

### Each Reference Becomes Stable Independently at Incorporation

Rejected. Individual reference stability does not close the aggregate incorporated set. Additional references or
changes to collection membership could still alter the candidate revision.

### References Remain Mutable Until Reasoning Begins

Rejected. This would permit an Active Context Revision to change after activation and conflict with Active revision
immutability.

### References Remain Mutable Throughout the Cognitive Cycle

Rejected. A mutable evidence set would undermine deterministic reasoning and make the basis of downstream cognitive
results unstable.

### Stability Is Controlled by Brain

Rejected. Brain owns high-level cognitive orchestration, not Context composition or the stability boundary of a
Context Revision.

### Stability Is Controlled by Bootstrap or Transport

Rejected. Bootstrap owns architectural composition, and transport conveys references. Neither owns Context lifecycle
or reference-set stability semantics.

### Stability Is Inherited Automatically from Source Immutability

Rejected. An immutable source reference does not determine whether the aggregate Context set can add, remove, replace,
reorder, or substitute references. Source-reference immutability and Context Revision stability are distinct concerns.

## Recommended Decision

The complete incorporated reference set for a Context Revision closes before Context validation begins and remains
unchanged through validation, activation, and downstream consumption.

Source-reference immutability concerns whether an individual source-issued reference can change. Authority
preservation maintains the association between a reference and its source-originated authority. Context incorporation
determines which available references participate in a Context Revision. Context Revision reference-set stability
closes the complete incorporated set as one candidate for validation.

Validation evaluates that candidate Context Revision whose incorporated-reference set is stable. Activation does not
create, complete, or alter its reference set.
Downstream consumers consume the same stable set contained in the Active Context Revision.

This decision does not resolve how source state or a source reference change after activation is treated; D-009
remains responsible for that question.

## Rationale

The selected stability point preserves the accepted lifecycle:

Collecting
→ Composing
→ Validating
→ Active
→ Expired
→ optionally Archived

Collecting and Composing prepare the incorporated reference set. Closing that set before Validating ensures that
validation has one complete candidate revision as its subject without introducing a new lifecycle state.

Validation must not observe a moving reference set because a changing subject would prevent the architectural
conclusion of validation from applying consistently to the revision that becomes Active. Stability ensures that
validation, activation, and downstream consumption refer to the same contextual evidence boundary.

Active revision immutability remains intact because no reference-set change is permitted after stability is
established. Activation changes lifecycle status without changing the revision’s incorporated references.

Deterministic reasoning is preserved because one reasoning cycle consumes one Active Context Revision with a stable
evidence set. References cannot enter, leave, or change position during validation or downstream use.

D-001 remains preserved because Context continues to own collaboration semantics. Reference stability constrains the
Context-owned preparation outcome without transferring collaboration ownership.

D-002 remains preserved because Memory and Knowledge retain semantic ownership of represented source meaning. Closing
the Context reference set does not freeze, transfer, or redefine source semantics or source lifecycles.

D-003 remains preserved because Context continues to own incorporation. Reference-set closure establishes when
incorporation for one revision is complete without transferring incorporation ownership.

D-004 through D-006 remain preserved because authority continues to originate with the issuing source, verification
remains issuer-owned, and authority remains associated with each issued reference. Context stability neither recreates
nor changes those responsibilities.

D-007 remains preserved because reference collaboration remains part of Context Revision preparation and completes
before activation. D-008 narrows that relationship by establishing that the incorporated set closes before validation.

Brain orchestration remains intact. Brain may orchestrate a cognitive cycle around the resulting Active Context
Revision without controlling its stability boundary.

Bootstrap composition remains intact. Bootstrap may compose approved capability relationships without determining when
a Context Revision’s reference set closes.

Future source extensibility remains possible because additional accepted sources may participate during preparation
under the same aggregate stability boundary while retaining their own semantics, authority, verification, and
lifecycles.

## Consequences

- The complete incorporated reference set closes before validation.
- Validation evaluates one candidate Context Revision whose incorporated-reference set is stable.
- No reference may be added, removed, replaced, reordered, or substituted after stability is established.
- Activation does not create or alter the reference set.
- Active and downstream stages consume the same stable set.
- Source-reference immutability alone is insufficient to establish aggregate Context stability.
- Brain does not control the freezing point.
- Bootstrap and transport do not control the freezing point.
- Authority origin, verification, and preservation remain unchanged.
- Context owns the stability boundary as part of its accepted composition and lifecycle responsibilities.
- Closing the reference set does not freeze or transfer source lifecycle ownership.
- No new Context lifecycle state is introduced.
- A change in lifecycle status after stability does not reopen incorporation for that revision.

This decision does not establish how later source or reference changes are treated, how currentness is evaluated, when
Security enforcement occurs, how retrieval is sequenced, how failures take precedence, which validation rules apply,
how references are represented, which Contracts are required, or which runtime mechanisms establish and maintain
stability.

## Deferred Implications

- D-009 remains responsible for treatment of source or reference changes.
- Currentness rules remain unresolved.
- Security timing remains unresolved.
- Retrieval sequencing remains unresolved.
- Failure precedence remains unresolved.
- Exact validation rules remain unresolved.
- Contracts remain unresolved.
- Representation remains unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- How are meaningful source or reference changes treated after the incorporated set becomes stable?
- How is currentness evaluated against a stable reference set?
- When does Security-owned enforcement apply relative to reference-set closure and validation?
- How does retrieval sequencing relate to the stability boundary?
- How are failures ordered when they occur near reference-set closure?
- Which exact rules govern validation of the candidate Context Revision whose incorporated-reference set is stable?
- Which stability boundaries require formal Contracts?
- How is the stable reference set represented?
- Which runtime mechanisms enforce the established stability boundary?

# 8.3 D-009 — Reference Change

## Decision

This decision resolves the architectural consequence of a meaningful source-owned state change affecting a cognitive
reference after that reference has been incorporated into a Context Revision whose incorporated-reference set is
already stable or
whose lifecycle status is Active.

A meaningful reference change includes a source-owned state change affecting the meaning, eligibility, currency,
retention, or future suitability of an incorporated reference. Examples include Memory forgetting or retention-state
change, Knowledge supersession or currency change, source withdrawal or invalidation, or another source-owned semantic
lifecycle change.

This decision does not define exact source-specific change rules, detection mechanisms, refresh behavior, Contracts,
APIs, or runtime sequencing.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### A Source Change Requires a Successor Context Revision for Future Cognitive Use

Accepted. A meaningful source-owned change does not mutate an existing Context Revision whose incorporated-reference
set is stable or whose lifecycle state is Active. Future cognitive use of changed source evidence requires future
Context preparation and, where applicable, a successor Context Revision.

### A Source Change Mutates the Existing Active Context Revision

Rejected. Active Context Revisions are immutable. Mutating an Active revision would rewrite the evidence basis of the
cognitive cycle for which that revision was prepared.

### A Source Change Replaces the Reference Inside the Existing Revision

Rejected. Silent replacement would alter the historical evidence accepted for the existing revision and break
deterministic reasoning and diagnostic integrity.

### A Source Change Immediately Invalidates All Historical Use of the Existing Revision

Rejected. A later source-owned change does not retroactively erase the evidence boundary accepted for an earlier
cognitive cycle. Historical integrity and future suitability are distinct concerns.

### A Source Change Is Ignored Permanently

Rejected. Preserving an existing revision does not mean changed source state is irrelevant to future Context
preparation or future cognitive use.

### Brain Updates the Existing Revision

Rejected. Brain owns high-level cognitive orchestration, not Context composition, source lifecycle, or in-place Context
Revision mutation.

### Bootstrap or Transport Substitutes the Changed Reference

Rejected. Bootstrap composes approved relationships and transport conveys values. Neither owns source semantics,
Context incorporation, or revision succession.

### Downstream Consumers Independently Refresh References

Rejected. Independent refresh would create evidence outside the single authoritative Active Context Revision and
transfer Context preparation responsibilities to consumers.

### Source Changes Alter Source State but Not the Already-Fixed Historical Revision

Accepted. The source capability may change its own semantic or lifecycle state independently, while the Context
Revision whose incorporated-reference set is already stable or whose lifecycle state is Active remains an immutable
record of the evidence accepted for its cognitive cycle.

## Recommended Decision

A meaningful source-owned state change affecting an incorporated cognitive reference does not mutate, rewrite, remove,
or replace that reference within a Context Revision whose incorporated-reference set is already stable or whose
lifecycle state is Active.

The existing revision remains an immutable record of the evidence accepted for its cognitive cycle. The source
capability remains responsible for its own semantic and lifecycle change. Changed source state affects the reference’s
eligibility or suitability for future Context preparation rather than retroactively changing the historical revision.

Future cognitive use of changed source evidence requires a later Context preparation concern and, where applicable, a
successor Context Revision. Context remains responsible for deciding whether changed source evidence participates in a
later revision.

Source lifecycle change, reference authority, historical Context integrity, future contextual suitability, and Context
revision succession remain distinct architectural concerns.

This decision does not define detailed currentness policy, automatic refresh, recollection triggers, Security
revocation semantics, or exact successor-revision sequencing.

## Rationale

D-001 remains preserved because Context continues to own collaboration semantics. A later source change does not
transfer that ownership or permit another participant to rewrite Context.

D-002 remains preserved because the issuing source retains semantic ownership of the represented meaning and its
lifecycle. The source may change its own state without gaining ownership of Context Revision history.

D-003 remains preserved because Context continues to own incorporation. Source lifecycle change does not silently
replace or remove an incorporated reference from an existing revision.

D-004 through D-006 remain preserved because source authority remains originated, verified, and preserved according to
the issuing source boundary. A source lifecycle change may affect future eligibility without allowing another
capability to recreate or transfer authority.

D-007 remains preserved because reference collaboration belongs to Context Revision preparation and completes before
activation. A later source change does not reopen preparation for an already Active revision.

D-008 remains preserved because the complete incorporated reference set remains unchanged after stability is
established. A source change affects future preparation rather than altering the stable set.

Source semantic and lifecycle ownership remain intact because Memory continues to own retention and forgetting,
Knowledge continues to own versions, supersession, and source-domain currency, and future accepted sources continue to
own their own lifecycle changes.

Historical and diagnostic integrity are preserved because the existing Context Revision continues to represent the
exact evidence accepted for its cognitive cycle. Rewriting the revision would make prior reasoning and outcomes depend
on later source state.

Deterministic reasoning remains preserved because downstream consumers complete against the revision already supplied
to them rather than observing in-place changes.

Brain orchestration remains intact. Brain may coordinate later cognitive cycles but does not rewrite Context
Revisions.

Bootstrap composition remains intact. Bootstrap may compose future preparation relationships without substituting
references or acquiring source or Context semantics.

Preserving a historical revision does not claim that every incorporated reference remains suitable for a future
cycle. Historical integrity concerns what evidence was accepted previously; future suitability concerns what evidence
may participate in later Context preparation.

Future source extensibility remains possible because every accepted source can evolve according to its own lifecycle
while Context preserves stable revision history and evaluates future participation separately.

## Consequences

- An existing revision whose incorporated-reference set is stable or whose lifecycle state is Active is not mutated.
- An incorporated reference is not silently replaced, removed, or rewritten.
- Source state may change independently of the existing Context Revision.
- Changed source state affects future eligibility or incorporation.
- A later cognitive cycle may require a successor Context Revision.
- Downstream consumers complete against the revision already supplied to them.
- Brain does not rewrite Context.
- Bootstrap and transport do not substitute references.
- Authority preservation does not imply permanent future suitability.
- Historical preservation does not override Security revocation.
- Context remains responsible for whether changed source evidence participates in a later revision.
- The issuing source remains responsible for its own semantic and lifecycle changes.
- Historical Context integrity and future contextual suitability remain distinct.
- No new Context lifecycle state is introduced.

This decision does not establish detailed source-currentness or contextual-currentness rules, expiration criteria,
Security revocation behavior, recollection triggers, automatic refresh, failure handling, Contracts, APIs, runtime
sequencing, implementation mechanisms, or exact successor-revision sequencing.

## Deferred Implications

- Source and contextual currentness remain unresolved.
- Expiration criteria remain unresolved.
- Security revocation remains unresolved.
- Recollection triggers remain unresolved.
- Failure handling remains unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.
- Automatic refresh remains unresolved.
- Exact successor-revision sequencing remains unresolved.

## Open Questions

- How are source currentness and contextual currentness evaluated for future Context preparation?
- Which source changes are meaningful enough to affect future eligibility?
- Which expiration criteria apply to an existing revision after source change?
- How does Security-owned revocation affect historical and future use?
- What triggers recollection or preparation of a successor Context Revision?
- How are source-change failures owned and propagated?
- Which boundaries require formal Contracts?
- Which runtime mechanisms preserve historical integrity while enabling future revision succession?

# 9.1 D-010 — Retrieval Initiation

## Decision

This decision resolves which accepted capability owns the architectural responsibility for initiating requests for
relevant cognitive references during Context preparation.

Retrieval initiation concerns responsibility for causing a request for potentially relevant source references to
originate within the accepted collaboration. It does not determine the meaning of that request, the meaning of
returned results, or how retrieval is performed.

This decision does not define retrieval algorithms, APIs, Contracts, sequencing, providers, or implementation.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Context Initiates Retrieval

Accepted. Context owns collaboration, composition, relevance, and incorporation. It therefore owns initiation of
requests for references that may contribute to Context preparation without acquiring the semantics or authority of
participating sources.

### Brain Initiates Retrieval

Rejected. Brain owns high-level cognitive orchestration. Allowing Brain to initiate source retrieval would extend
orchestration into Context preparation and blur Context’s accepted collaboration boundary.

### Memory Initiates Retrieval

Rejected. Memory owns intentionally retained experience and user continuity. It participates as a source but does not
determine when Context requires potentially relevant references, including references from other sources.

### Knowledge Initiates Retrieval

Rejected. Knowledge owns accepted claims and Knowledge governance. It participates as a source but does not determine
when Context requires potentially relevant references, including references from other sources.

### Security Initiates Retrieval

Rejected. Security owns security policy and authorization decision semantics. Its constraints may apply to retrieval
without making Security responsible for initiating Context preparation requests.

### Bootstrap Initiates Retrieval

Rejected. Bootstrap composes approved architectural relationships. Composition enables participation but does not
confer responsibility for initiating capability collaboration.

### Core Initiates Retrieval

Rejected. Core may custody shared architectural language and approved Contracts, but it does not own capability
behavior or initiate capability-specific collaboration.

### Retrieval Is Initiated Independently by Downstream Consumers

Rejected. Independent initiation by Brain, Reasoning, Planning, or other consumers would bypass Context ownership and
risk creating evidence outside the single Context Revision prepared for a cognitive cycle.

### Retrieval Is Transport-Driven

Rejected. Transport conveys requests and results. It cannot determine that Context requires references or own the
architectural purpose for which retrieval is initiated.

### Retrieval Is Ownerless

Rejected. Ownerless initiation would leave accountability ambiguous and make retrieval dependent on incidental
participants, transports, or implementations rather than an accepted capability boundary.

## Recommended Decision

Context owns the architectural responsibility for initiating requests for relevant cognitive references during Context
Revision preparation.

Collaboration ownership gives Context responsibility for the semantics of coordinating source participation. Retrieval
initiation is the narrower responsibility for originating a request within that collaboration. Source participation
allows Memory, Knowledge, or another accepted source to contribute references without transferring source semantics or
lifecycle ownership.

Authority continues to originate with the issuing source and is not created by initiation. Context separately owns
incorporation of supplied references into a Context Revision. Downstream consumers consume the resulting Active Context
Revision without independently initiating retrieval for that revision.

This decision does not resolve retrieval request semantics, retrieval result semantics, retrieval algorithms,
Contracts, or runtime sequencing.

## Rationale

D-001 remains preserved because Context owns the collaboration semantics, and retrieval initiation occurs within that
Context-owned collaboration.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain semantic ownership of the
meaning represented by their references. A request initiated by Context does not make Context the owner of source
meaning.

D-003 remains preserved because retrieval initiation and incorporation remain distinct. Initiating a request makes
potential source evidence available for consideration; it does not determine whether any returned reference becomes
part of a Context Revision.

D-004 through D-006 remain preserved because initiation does not originate, verify, recreate, transfer, or detach
source authority. Authority continues to originate with the issuing capability, verification remains issuer-owned, and
authority remains associated with issued references.

D-007 and D-008 remain preserved because retrieval initiation belongs to Context Revision preparation, while the
complete incorporated reference set still closes before validation and remains stable afterward. This decision does
not redefine the lifecycle or prescribe exact retrieval sequencing.

D-009 remains preserved because initiating retrieval does not mutate an existing revision whose incorporated-reference
set is stable or whose lifecycle state is Active. Changed source evidence can participate only through future Context
preparation and incorporation decisions.

Context ownership remains coherent because the capability responsible for contextual relevance initiates requests for
potentially relevant references. Initiation does not predetermine either source participation outcomes or
incorporation.

Source ownership remains intact because issuing sources continue to govern their own semantics, authority,
verification, and lifecycle. Context’s initiation expresses a contextual need; it does not define the source-owned
meaning of any response.

Brain orchestration remains intact. Brain may orchestrate a cognitive cycle without acquiring responsibility for
retrieval initiation within Context preparation.

Bootstrap composition remains intact. Bootstrap may connect Context with approved sources without deciding when
retrieval is initiated.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics
without becoming the initiator or semantic owner of retrieval.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
initiating retrieval or acquiring its capability semantics.

Initiating retrieval does not transfer retrieval semantics because causing a request to originate is distinct from
defining what a request means or what a result means. Those questions remain reserved for D-011 and D-012.

Future source extensibility remains possible because Context can initiate participation by additional accepted sources
without absorbing their semantics, authority, lifecycle, or source-specific retrieval behavior.

## Consequences

- Context owns retrieval initiation during Context Revision preparation.
- The initiating capability does not become the owner of source semantics.
- Initiation does not create authority.
- Initiation does not determine incorporation.
- Brain orchestration remains distinct.
- Bootstrap composition remains distinct.
- Retrieval initiation does not define retrieval meaning.
- Memory, Knowledge, and future accepted sources retain their existing ownership boundaries.
- Security policy and authorization remain distinct from retrieval initiation.
- Core custody does not confer retrieval-initiation responsibility.
- Downstream consumers do not independently retrieve evidence for the Context Revision supplied to them.
- Retrieval initiation does not reopen or mutate a Context Revision whose incorporated-reference set is stable or whose
  lifecycle state is Active.
- No new capability is introduced.

This decision does not establish retrieval request semantics, retrieval result semantics, retrieval algorithms,
source-specific retrieval behavior, providers, currentness evaluation, Security enforcement, failure handling,
Contracts, APIs, runtime sequencing, or implementation mechanisms.

## Deferred Implications

- D-011 remains responsible for retrieval request semantics.
- D-012 remains responsible for retrieval result semantics.
- Retrieval algorithms remain unresolved.
- Currentness remains unresolved.
- Security enforcement remains unresolved.
- Failures remain unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- What architectural meaning does a retrieval request carry?
- What architectural meaning does a retrieval result carry?
- Which retrieval algorithms may implement the accepted boundaries?
- How does currentness affect retrieval initiation and participation?
- How is Security-owned enforcement applied to retrieval?
- How are retrieval failures assigned and reflected in Context preparation?
- Which retrieval boundaries require formal Contracts?
- Which runtime mechanisms realize Context-owned retrieval initiation?

# 9.2 D-011 — Retrieval Request Semantics

## Decision

This decision resolves which accepted capability owns the architectural meaning of a request for cognitive references
during Context preparation.

Retrieval request semantics express Context’s need for source participation in preparing a Context Revision.
Initiating a request means causing that request to originate. Defining its meaning establishes the contextual purpose
communicated by the request. Satisfying it concerns source participation within the receiving capability’s own
semantic boundary.

This decision does not define retrieval algorithms, request schemas, Contracts, providers, APIs, filters, ranking, or
implementation.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Context Owns Request Semantics

Accepted. Context owns collaboration, relevance, composition, incorporation, and retrieval initiation. The
architectural meaning of a request made for Context preparation therefore belongs to Context, while participating
sources retain responsibility for interpreting and satisfying it within their own boundaries.

### Memory Owns Request Semantics

Rejected. Memory owns intentionally retained experience and user continuity. It may interpret and satisfy a request
concerning Memory, but it does not own the contextual purpose shared by requests across participating sources.

### Knowledge Owns Request Semantics

Rejected. Knowledge owns accepted claims and Knowledge governance. It may interpret and satisfy a request concerning
Knowledge, but it does not own the contextual purpose shared by requests across participating sources.

### Brain Owns Request Semantics

Rejected. Brain owns high-level cognitive orchestration. Orchestrating Context preparation does not make Brain the
owner of retrieval request meaning.

### Security Owns Request Semantics

Rejected. Security owns security policy and authorization decision semantics. Security constraints may apply to a
request without defining its cognitive or contextual meaning.

### Bootstrap Owns Request Semantics

Rejected. Bootstrap composes approved architectural relationships. Composition does not confer ownership of the
meaning communicated through those relationships.

### Core Owns Request Semantics

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer
capability semantics or ownership of Context’s retrieval purpose.

### Each Source Defines Request Meaning Independently

Rejected. Sources interpret requests within their own semantic boundaries, but allowing each source to redefine the
request’s architectural meaning would fragment the Context-owned collaboration and produce inconsistent contextual
purposes.

### Transport Defines Request Meaning

Rejected. Transport conveys a request across architectural boundaries. It does not determine why Context requires
source participation or what the request means architecturally.

### Request Meaning Is Emergent

Rejected. Emergent meaning would leave responsibility ambiguous and make request semantics dependent on participants,
implementations, or transport rather than an accepted capability owner.

## Recommended Decision

Context owns the architectural semantics of retrieval requests issued during Context Revision preparation.

Context-owned retrieval initiation determines that a request originates. Context-owned request semantics define that
request as an expression of contextual need for potentially relevant cognitive references. These are distinct
responsibilities even though Context owns both.

Memory, Knowledge, and other accepted sources participate by interpreting the Context-owned request within their
respective semantic boundaries and by satisfying it according to their own responsibilities. Source interpretation and
retrieval execution do not transfer ownership of the request’s architectural meaning to the source.

Context separately owns incorporation. Neither the request nor its interpretation determines whether any resulting
reference becomes part of a Context Revision.

This decision does not resolve retrieval result semantics, Contracts, runtime sequencing, or algorithms.

## Rationale

D-001 remains preserved because retrieval request meaning belongs to the Context-owned collaboration through which
cognitive references become available for Context preparation.

D-002 remains preserved because participating sources retain semantic ownership of the meaning they govern. Context
defines what it is requesting for contextual preparation without defining Memory semantics, Knowledge semantics, or
another source’s domain meaning.

D-003 remains preserved because request semantics and incorporation remain distinct. A request communicates contextual
need but does not determine which supplied references Context incorporates.

D-004 through D-006 remain preserved because a request does not originate, verify, recreate, transfer, or detach
reference authority. Authority remains source-originated, verification remains issuer-owned, and authority
preservation remains unchanged.

D-007 through D-009 remain preserved because requests support preparation of a future Context Revision without
changing the accepted lifecycle, reopening a stable reference set, or mutating an existing revision whose
incorporated-reference set is stable or whose lifecycle state is Active.

D-010 remains preserved because Context continues to own retrieval initiation. Initiation and request semantics are
distinguished: initiation causes a request to originate, while request semantics define its architectural meaning.

Context ownership remains coherent because the request exists to express a contextual need within Context-owned
preparation. Assigning that meaning elsewhere would separate the purpose of retrieval from the capability responsible
for relevance and composition.

Source ownership remains intact because participating sources interpret and satisfy the request within their own
semantic boundaries. Interpretation allows a source to apply its domain meaning without becoming the owner of the
request’s cross-source contextual purpose.

Source authority remains intact because satisfying a request does not transfer the origin, verification, or
preservation of authority away from the issuing source.

Brain orchestration remains intact. Brain may orchestrate a cognitive cycle without defining the meaning of requests
internal to Context preparation.

Bootstrap composition remains intact. Bootstrap may connect Context with approved sources without owning the meaning
of requests exchanged across those relationships.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics
without acquiring retrieval request semantics.

Core custody remains intact. Core may custody shared language and future approved Contracts without becoming the owner
of Context request meaning.

Future source extensibility remains possible because additional accepted sources can interpret the same Context-owned
architectural purpose through their own semantics without requiring Context to absorb source-specific execution
responsibilities.

## Consequences

- Context owns the architectural meaning of retrieval requests made during Context Revision preparation.
- Initiating a request does not by itself define its meaning.
- Request semantics do not determine incorporation.
- Request semantics do not define result semantics.
- Memory and Knowledge interpret requests without becoming owners of their architectural meaning.
- Participating sources satisfy requests within their own semantic boundaries.
- Source interpretation does not transfer source semantics to Context.
- Retrieval execution does not transfer request-semantic ownership to a source.
- Brain does not define request meaning.
- Bootstrap does not define request meaning.
- Security constraints remain distinct from retrieval request semantics.
- Core custody does not confer ownership of request meaning.
- Transport does not define or alter request meaning.
- No new capability is introduced.

This decision does not establish retrieval result semantics, retrieval algorithms, request or result schemas, filters,
ranking, providers, APIs, source-specific execution behavior, currentness rules, Security enforcement, failure
handling, Contracts, runtime sequencing, or implementation mechanisms.

## Deferred Implications

- D-012 remains responsible for retrieval result semantics.
- Retrieval algorithms remain unresolved.
- Ranking remains unresolved.
- Currentness remains unresolved.
- Security enforcement remains unresolved.
- Failures remain unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- What architectural meaning does a retrieval result carry?
- Which retrieval algorithms may implement the accepted semantic boundaries?
- How is ranking governed without changing request meaning?
- How does currentness affect source interpretation and satisfaction?
- How is Security-owned enforcement applied to retrieval requests?
- How are request interpretation and satisfaction failures assigned?
- Which request-semantic boundaries require formal Contracts?
- Which runtime mechanisms realize Context-owned request semantics?

# 9.3 D-012 — Retrieval Result Semantics

## Decision

This decision resolves which accepted capability owns the architectural meaning of the set of cognitive references
returned in response to a Context-owned retrieval request during Context preparation.

Retrieval result semantics concern what the returned set represents within Context-owned collaboration. Request
semantics define the contextual need expressed by the request. Source interpretation applies that request within a
source capability’s own semantic boundary. Retrieval execution produces source-owned references in response. Returned
result semantics define the architectural meaning of those references as a set made available to Context.
Incorporation remains the separate Context-owned decision that determines which references participate in a Context
Revision.

This decision does not define ranking, filtering, algorithms, providers, APIs, Contracts, schemas, or implementation.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Context Owns Retrieval Result Semantics

Accepted. The returned set exists within Context-owned collaboration as a response to a Context-owned retrieval
request. Context therefore owns the architectural meaning of the set as candidate source references made available for
Context consideration, while each source retains ownership of the meaning represented by its individual references.

### Memory Owns Retrieval Result Semantics

Rejected. Memory owns the semantics of Memory references it issues, but it does not own the cross-source architectural
meaning of a returned set made available for Context preparation.

### Knowledge Owns Retrieval Result Semantics

Rejected. Knowledge owns the semantics of Knowledge references it issues, but it does not own the cross-source
architectural meaning of a returned set made available for Context preparation.

### Brain Owns Retrieval Result Semantics

Rejected. Brain owns high-level cognitive orchestration. Receiving or coordinating the resulting Context does not make
Brain the owner of retrieval-result meaning.

### Security Owns Retrieval Result Semantics

Rejected. Security owns security policy and authorization decision semantics. Security constraints may govern
participation without defining what the returned set means cognitively or contextually.

### Bootstrap Owns Retrieval Result Semantics

Rejected. Bootstrap composes approved architectural relationships. Composition does not confer ownership of the
meaning of values returned through those relationships.

### Core Owns Retrieval Result Semantics

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer
capability semantics or ownership of the returned set’s contextual meaning.

### Each Source Defines Result Meaning Independently

Rejected. Each source owns the meaning represented by its own references, but allowing every source to redefine the
architectural meaning of the aggregate returned set would fragment the Context-owned collaboration.

### Result Meaning Is Determined by Transport

Rejected. Transport conveys returned references. It does not determine what the returned set means within Context
preparation.

### Result Meaning Is Emergent

Rejected. Emergent meaning would make the returned set’s architectural purpose dependent on incidental participants,
implementations, or transport rather than an accepted capability owner.

## Recommended Decision

Context owns the architectural semantics of the set of cognitive references returned in response to a Context-owned
retrieval request during Context Revision preparation.

The returned result means that source-issued cognitive references have been made available as candidates for Context
consideration in response to a contextual need. It does not mean that Context has incorporated those references, that
the references are contextually current, or that their authority, authorization, or suitability has been established
by return alone.

Each participating source retains ownership of the semantics represented by the references it issues. Context owns the
meaning of the returned set without absorbing the meaning contributed by its members.

Request semantics, source interpretation, retrieval execution, result semantics, and Context incorporation therefore
remain distinct architectural concerns.

This decision does not resolve currentness, Contracts, ranking, algorithms, or runtime sequencing.

## Rationale

D-001 remains preserved because the architectural semantics of the aggregate returned set belong to the Context-owned
collaboration through which source references become available for Context preparation.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain semantic ownership of the
meaning represented by their references. Context owns the meaning of the aggregate returned set without becoming the
owner of the represented source meaning.

D-003 remains preserved because returned-result semantics and incorporation remain distinct. Inclusion in a retrieval
result does not establish inclusion in a Context Revision.

D-004 through D-006 remain preserved because returning a reference does not originate, verify, recreate, transfer, or
detach its source authority. Authority remains source-originated, verification remains issuer-owned, and authority
remains associated with the issued reference.

D-007 through D-009 remain preserved because retrieval results participate in Context Revision preparation without
changing the accepted lifecycle, reopening a stable reference set, or mutating an existing revision whose
incorporated-reference set is stable or whose lifecycle state is Active.

D-010 remains preserved because Context continues to initiate retrieval.

D-011 remains preserved because Context continues to own the architectural meaning of the retrieval request.
Request meaning expresses contextual need; result meaning expresses that candidate source references have been made
available in response.

Source ownership remains intact because each source retains responsibility for the meaning, authority, verification,
lifecycle, and source currentness of the references it issues. Context’s ownership of aggregate result meaning does not
absorb those responsibilities.

Brain orchestration remains intact. Brain may orchestrate a cognitive cycle without becoming the owner of
retrieval-result meaning.

Bootstrap composition remains intact. Bootstrap may connect Context with accepted sources without acquiring the
meaning of returned results.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Authorization constraints do not define the cognitive or contextual meaning of the returned set.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
becoming the owner of retrieval-result semantics.

Future source extensibility remains possible because references from additional accepted sources can participate in
one Context-owned returned-set meaning while retaining their independent source semantics.

## Consequences

- Context owns the architectural meaning of the returned reference set.
- The returned set represents candidate source references made available for Context consideration.
- Result semantics do not redefine source semantics.
- Result semantics do not determine incorporation.
- Result semantics do not redefine authority.
- Result semantics do not establish authorization.
- Result semantics do not establish source or contextual currentness.
- Sources retain ownership of the meaning represented by their references.
- A returned reference remains a candidate until Context separately decides incorporation.
- Brain does not own retrieval-result semantics.
- Bootstrap does not own retrieval-result semantics.
- Security constraints remain distinct from retrieval-result semantics.
- Core custody does not confer ownership of result meaning.
- Transport does not define or alter result meaning.
- No new capability is introduced.

This decision does not establish currentness rules, ranking, filtering, retrieval algorithms, providers, APIs,
request or result schemas, Security enforcement, failure handling, Contracts, runtime sequencing, or implementation
mechanisms.

## Deferred Implications

- Currentness remains unresolved.
- Ranking remains unresolved.
- Retrieval algorithms remain unresolved.
- Security enforcement remains unresolved.
- Failures remain unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- How are source currentness and contextual currentness evaluated for returned references?
- Which ranking or filtering responsibilities may later be authorized?
- How is Security-owned enforcement applied to returned references?
- How are retrieval-result failures assigned and propagated?
- Which result-semantic boundaries require formal Contracts?
- Which runtime mechanisms realize Context-owned retrieval-result semantics?

# 10.1 D-013 — Source Currentness

## Decision

This decision resolves which accepted capability owns the architectural determination of whether a cognitive reference
remains current within the semantic and lifecycle boundaries of its issuing source.

Source currentness concerns the standing of a reference relative to source-owned state, such as retained experience,
claim versions, supersession, withdrawal, invalidation, or another source-specific lifecycle condition. Contextual
currentness concerns suitability for a particular Context Revision and remains unresolved.

Source semantics define the meaning governed by the issuing capability. Incorporation determines participation in a
Context Revision. Authority concerns the architectural origin of trust or validity. Retrieval makes references
available for Context consideration. None of those responsibilities independently determines source currentness.

This decision does not define currentness algorithms, timestamps, freshness policies, Contracts, APIs, providers,
implementation, or runtime behavior.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### The Issuing Source Owns Source Currentness

Accepted. The issuing source owns the semantics and lifecycle against which its reference’s source-domain currentness
can be determined. This keeps currentness aligned with the capability responsible for the represented meaning.

### Context Owns Source Currentness

Rejected. Context owns collaboration, composition, relevance, incorporation, and Context Revision responsibilities. It
may later evaluate contextual currentness without redefining whether a reference remains current within its source
domain.

### Brain Owns Source Currentness

Rejected. Brain owns high-level cognitive orchestration. Orchestrating a cognitive cycle does not confer ownership of
Memory, Knowledge, or another source’s currentness semantics.

### Security Owns Source Currentness

Rejected. Security owns security policy and authorization decision semantics. Security constraints or revocation
concerns may affect permitted use without making Security the owner of source-domain currentness.

### Bootstrap Owns Source Currentness

Rejected. Bootstrap composes approved architectural relationships. Composition does not confer ownership of
participating source semantics or lifecycle determinations.

### Core Owns Source Currentness

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer
capability behavior or source-currentness ownership.

### Downstream Consumers Own Source Currentness

Rejected. Brain, Reasoning, Planning, and other consumers use an Active Context Revision within their accepted
boundaries. Consumption does not allow them to redefine the currentness of source-owned meaning.

### Currentness Is Transport-Defined

Rejected. Transport conveys requests, references, and results. It cannot determine whether a reference remains current
within the issuing source’s semantic lifecycle.

### Currentness Is Emergent

Rejected. Emergent source currentness would make the determination dependent on participants, observations, or
implementation rather than the accountable source capability.

## Recommended Decision

The issuing source capability owns the architectural determination of source currentness for every cognitive reference
it issues.

Source ownership identifies the capability responsible for the represented meaning and its semantic lifecycle. Source
currentness determines whether the reference remains current within that source-owned domain. Contextual currentness
separately concerns suitability for a particular Context Revision and remains reserved for D-014.

Authority continues to originate with the issuing source, but authority and source currentness remain distinct
architectural concepts. Retrieval makes a reference available without determining its source currentness. Context
incorporation determines participation without redefining the source-domain currentness of the incorporated reference.

This decision does not resolve contextual currentness, detailed consequences of currentness changes, Contracts,
runtime sequencing, or algorithms.

## Rationale

D-001 remains preserved because Context continues to own collaboration semantics. Source-currentness ownership does
not transfer collaboration ownership to participating sources.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain semantic and lifecycle ownership
of their represented meaning. Source currentness is evaluated within those existing source boundaries.

D-003 remains preserved because Context continues to own incorporation. Context may decide whether a reference
participates in a Context Revision without redefining the reference’s source currentness.

D-004 through D-006 remain preserved because authority origin, verification, and preservation remain distinct from
source currentness. A reference may retain its source-originated authority association while its source-owned
currentness changes.

D-007 through D-009 remain preserved because source lifecycles remain separate from the immutable historical boundary
of a Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active. This decision does
not mutate existing revisions or determine the consequences
of a currentness change.

D-010 through D-012 remain preserved because retrieval initiation, request semantics, and result semantics do not
determine source currentness. A reference may be requested or returned without retrieval redefining its state within
the source domain.

Determining whether a reference remains current within its source domain belongs to the issuing capability because
that capability owns the semantics and lifecycle facts required to make the determination. Context, transport, and
consumers do not acquire those responsibilities through participation.

Context ownership remains intact because Context retains responsibility for collaboration, relevance, composition,
incorporation, and its own revision lifecycle. Source-owned currentness provides a distinct source-domain
determination without resolving contextual suitability.

Brain orchestration remains intact. Brain may coordinate the cognitive sequence without acquiring source-currentness
responsibilities.

Bootstrap composition remains intact. Bootstrap may connect approved participants without determining the currentness
of their issued references.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Source currentness neither replaces nor absorbs Security responsibilities.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
becoming the owner of source-currentness semantics.

Future source extensibility remains possible because every accepted source can govern currentness according to its own
semantic lifecycle without requiring Context, Brain, Bootstrap, Security, Core, transport, or consumers to absorb
source-specific rules.

## Consequences

- Source currentness remains source-owned.
- Context does not redefine source currentness.
- Brain does not redefine source currentness.
- Retrieval does not redefine source currentness.
- Authority does not redefine source currentness.
- Incorporation does not redefine source currentness.
- Memory determines source currentness within Memory-owned semantic and lifecycle boundaries.
- Knowledge determines source currentness within Knowledge-owned semantic and lifecycle boundaries.
- Future accepted sources retain the same responsibility for their issued references.
- Source currentness and contextual currentness remain distinct.
- A returned or incorporated reference is not thereby declared source-current.
- Source-currentness ownership does not mutate an existing Context Revision whose incorporated-reference set is stable
  or whose lifecycle state is Active.
- Security authorization remains distinct from source currentness.
- Core custody does not confer source-currentness ownership.
- No new capability is introduced.

This decision does not establish contextual currentness, detailed source-change consequences, currentness algorithms,
timestamps, freshness thresholds, Security enforcement, failure handling, Contracts, APIs, runtime sequencing, runtime
mechanisms, or implementation rules.

## Deferred Implications

- D-014 remains responsible for contextual currentness.
- D-015 remains responsible for currentness change.
- Currentness algorithms remain unresolved.
- Security enforcement remains unresolved.
- Failures remain unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- Which capability owns contextual currentness?
- How does a source-currentness change affect future Context preparation and existing revisions?
- Which source-specific criteria may determine currentness?
- How is Security-owned enforcement applied when source currentness changes?
- How are source-currentness failures assigned and communicated?
- Which currentness boundaries require formal Contracts?
- Which runtime mechanisms expose source-owned currentness without transferring ownership?

# 10.2 D-014 — Contextual Currentness

## Decision

This decision resolves which accepted capability owns the architectural determination of whether a source-current
cognitive reference remains suitable for participation in the Context Revision currently being prepared.

Source currentness concerns whether a reference remains current within the semantic and lifecycle boundaries of its
issuing source. Contextual currentness concerns whether that source-current reference remains suitable for the
particular Context Revision under preparation.

Source semantics define the meaning governed by the issuing capability. Authority concerns the architectural origin of
trust or validity. Retrieval makes references available for consideration. Contextual currentness assesses contextual
suitability. Incorporation separately determines whether a reference becomes part of the revision.

This decision does not define relevance algorithms, scoring, heuristics, timestamps, Contracts, APIs, implementation,
or runtime behavior.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Context Owns Contextual Currentness

Accepted. Context owns relevance, composition, collaboration, and incorporation for the revision under preparation. It
therefore owns the distinct determination of whether a source-current reference remains suitable for that particular
contextual boundary.

### Memory Owns Contextual Currentness

Rejected. Memory owns Memory semantics, lifecycle, and source currentness for Memory references. It does not own
suitability for a Context Revision that may combine evidence from multiple sources.

### Knowledge Owns Contextual Currentness

Rejected. Knowledge owns Knowledge semantics, lifecycle, and source currentness for Knowledge references. It does not
own suitability for a Context Revision prepared for a specific cognitive cycle.

### Brain Owns Contextual Currentness

Rejected. Brain owns high-level cognitive orchestration. Orchestrating a cognitive cycle does not confer ownership of
Context-specific suitability or composition decisions.

### Security Owns Contextual Currentness

Rejected. Security owns security policy and authorization decision semantics. Security constraints may affect
permitted participation without determining whether permitted source evidence is contextually current.

### Bootstrap Owns Contextual Currentness

Rejected. Bootstrap composes approved architectural relationships. Composition does not confer ownership of Context
relevance or contextual suitability.

### Core Owns Contextual Currentness

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer
capability semantics or Context-currentness ownership.

### Downstream Consumers Own Contextual Currentness

Rejected. Brain, Reasoning, Planning, and other consumers receive the resulting Active Context Revision. Consumption
does not permit them to redefine the suitability determinations made during Context preparation.

### Contextual Currentness Is Emergent

Rejected. Emergent contextual currentness would make suitability dependent on incidental participants, consumers, or
implementations rather than the capability accountable for Context composition.

## Recommended Decision

Context owns the architectural determination of contextual currentness for source-current cognitive references
considered during Context Revision preparation.

The issuing source retains ownership of source currentness within its semantic and lifecycle boundaries. Context
determines whether a source-current reference remains suitable for the specific revision under preparation. That
contextual-currentness determination does not redefine the reference’s source semantics, source currentness, or
authority.

Retrieval makes a reference available for Context consideration without establishing contextual currentness. Context
incorporation remains a separate Context-owned decision: contextual currentness concerns suitability, while
incorporation determines participation in the revision.

This decision does not resolve currentness change, Contracts, algorithms, or runtime sequencing.

## Rationale

D-001 remains preserved because contextual-currentness determination belongs within the Context-owned collaboration
through which references become available for Context preparation.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain semantic ownership of the
meaning represented by their references. Context evaluates contextual suitability without redefining that meaning.

D-003 remains preserved because Context continues to own incorporation. Contextual currentness informs a distinct
architectural concern and does not itself incorporate a reference.

D-004 through D-006 remain preserved because contextual currentness does not originate, verify, recreate, transfer, or
detach authority. Authority remains source-originated, verification remains issuer-owned, and authority remains
associated with the issued reference.

D-007 through D-009 remain preserved because contextual currentness belongs to preparation of a Context Revision and
does not reopen, enrich, or mutate a revision whose incorporated-reference set is stable or whose lifecycle state is
Active. The consequences of later currentness changes remain unresolved.

D-010 through D-012 remain preserved because retrieval initiation, request semantics, and result semantics make source
references available for consideration without establishing their contextual suitability or incorporation.

D-013 remains preserved because the issuing source continues to own source currentness. Context accepts that distinct
source-domain determination without redefining it.

Context ownership remains coherent because only Context owns the relevance and composition boundary of the revision
under preparation. A source can determine whether its reference remains current within its own domain, but it cannot
determine whether that reference remains suitable for a particular cross-source Context Revision.

Source ownership remains intact because contextual-currentness evaluation does not transfer source semantics,
lifecycle responsibility, authority, or verification ownership to Context.

Brain orchestration remains intact. Brain may orchestrate the broader cognitive cycle without acquiring contextual-
currentness responsibility.

Bootstrap composition remains intact. Bootstrap may compose approved relationships without determining contextual
suitability.

Security ownership remains intact. Security continues to own security policy and authorization decision semantics.
Contextual currentness neither replaces nor absorbs Security responsibilities.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
owning contextual-currentness semantics.

Future source extensibility remains possible because references from additional accepted sources can retain source-
owned currentness while Context applies one stable ownership boundary for determining their suitability to the
revision under preparation.

## Consequences

- Context owns contextual currentness.
- Source currentness remains source-owned.
- Contextual currentness does not redefine source currentness.
- Contextual currentness does not redefine source semantics.
- Contextual currentness does not redefine authority.
- Contextual currentness does not determine incorporation.
- Retrieval does not establish contextual currentness.
- A source-current reference is not thereby guaranteed to be contextually current.
- Contextual suitability applies to the Context Revision under preparation rather than to the source domain generally.
- Downstream consumers consume the resulting revision without acquiring contextual-currentness ownership.
- Brain does not own contextual currentness.
- Bootstrap does not own contextual currentness.
- Security authorization remains distinct from contextual currentness.
- Core custody does not confer contextual-currentness ownership.
- No new capability is introduced.

This decision does not establish how contextual currentness is calculated, scored, compared, represented, or
communicated. It does not establish relevance algorithms, heuristics, timestamps, currentness-change consequences,
Security enforcement, failure handling, Contracts, APIs, runtime sequencing, runtime mechanisms, or implementation
rules.

## Deferred Implications

- D-015 remains responsible for currentness change.
- Currentness algorithms remain unresolved.
- Security enforcement remains unresolved.
- Failures remain unresolved.
- Contracts remain unresolved.
- Runtime mechanisms remain unresolved.

## Open Questions

- How does a source-currentness or contextual-currentness change affect future Context preparation?
- Which criteria may determine contextual currentness?
- How is Security-owned enforcement applied alongside contextual-currentness evaluation?
- How are contextual-currentness failures assigned and communicated?
- Which contextual-currentness boundaries require formal Contracts?
- Which runtime mechanisms realize Context-owned contextual currentness?

# 10.3 D-015 — Currentness Change

## Decision

This decision resolves the architectural consequence of a source-currentness change, a contextual-currentness change,
or both after a cognitive reference has been considered, incorporated, stabilized, or activated within a Context
Revision.

A source-currentness change concerns a change in the reference’s standing within the issuing source’s semantic and
lifecycle boundary. A contextual-currentness change concerns a change in whether a source-current reference remains
suitable for the Context Revision under preparation or for later Context preparation.

Currentness change does not itself redefine authority, authorization, source semantics, incorporation, Context Revision
stability, or historical integrity.

This decision does not define algorithms, timestamps, refresh intervals, Contracts, APIs, runtime mechanisms, or
implementation.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### A Currentness Change Affects Only Future Context Preparation

Accepted. Once a Context Revision’s incorporated reference set is stable or the revision is Active, a later
source-currentness or contextual-currentness change affects future eligibility and suitability rather than mutating
the existing revision.

### A Currentness Change Mutates a Context Revision Whose Incorporated-Reference Set Is Stable or Whose Lifecycle State Is Active

Rejected. Mutation would violate the accepted reference-set stability boundary, Active revision immutability, and
historical integrity.

### A Currentness Change Silently Removes or Replaces the Reference in the Existing Revision

Rejected. Silent removal or replacement would rewrite the evidence accepted for the revision’s cognitive cycle and
undermine deterministic reasoning.

### A Currentness Change Automatically Invalidates the Entire Historical Revision

Rejected. A later currentness change does not retroactively erase or rewrite the evidence boundary accepted for the
revision’s original cognitive cycle.

### A Currentness Change Is Ignored Permanently

Rejected. Historical preservation does not imply continuing suitability. Changed currentness must remain relevant to
future source eligibility or future Context preparation.

### Brain Rewrites or Refreshes the Existing Revision

Rejected. Brain owns high-level cognitive orchestration, not source currentness, contextual currentness, Context
composition, or in-place revision mutation.

### Bootstrap or Transport Substitutes a Newer Reference

Rejected. Bootstrap composes approved relationships and transport conveys values. Neither owns source semantics,
currentness, incorporation, or revision history.

### Downstream Consumers Independently Re-evaluate or Refresh Currentness

Rejected. Independent downstream refresh would create evidence outside the authoritative Context Revision and transfer
Context preparation responsibilities to consumers.

### A Currentness Change May Require Expiration or a Successor Revision under Later Lifecycle Rules

Deferred. Expiration or preparation of a successor revision may be an appropriate future consequence, but exact
criteria, triggers, and sequencing remain unresolved.

## Recommended Decision

A source-currentness or contextual-currentness change does not mutate, remove, replace, reorder, or rewrite references
within a Context Revision whose incorporated-reference set is already stable or whose lifecycle state is Active.

The existing revision remains an immutable record of the evidence accepted for its cognitive cycle. Changed
source-currentness affects future source eligibility. Changed contextual-currentness affects future Context
suitability. Later cognitive use may require future Context preparation and, where applicable, a successor Context
Revision.

The issuing source remains responsible for source-currentness changes within its own semantic and lifecycle boundary.
Context remains responsible for contextual-currentness determinations for later revisions.

Expiration may be an appropriate consequence under later lifecycle rules, but this decision does not define expiration
criteria, successor-revision triggers, automatic refresh, or recollection.

Security revocation remains a separate Security-owned concern. Historical preservation does not override Security
revocation, and currentness change does not define revocation semantics.

Historical integrity, future suitability, currentness change, expiration, successor revision, and authority
preservation remain distinct architectural concerns.

## Rationale

D-001 through D-003 remain preserved because Context continues to own collaboration, contextual relevance, composition,
and incorporation, while source capabilities retain their own semantic ownership.

D-004 through D-006 remain preserved because currentness change does not originate, verify, recreate, transfer, or
detach source authority. Authority preservation maintains the association with the issuing source without implying
permanent currentness.

D-007 and D-008 remain preserved because collaboration occurs during preparation and the incorporated reference set
closes before validation. A later currentness change does not reopen or mutate that stable set.

D-009 remains preserved because meaningful source-owned change affects future preparation rather than rewriting an
existing revision. D-015 specializes that accepted rule for changes in source currentness, contextual currentness, or
both.

D-010 through D-012 remain preserved because retrieval makes references available for consideration without
establishing permanent source or contextual currentness.

D-013 remains preserved because the issuing source continues to own source-currentness changes. D-014 remains preserved
because Context continues to own contextual-currentness determinations.

Source semantic and lifecycle ownership remain intact because each source governs its own meaning and lifecycle while
Context separately evaluates suitability for future revisions.

Context ownership remains intact because Context determines future contextual suitability and incorporation without
rewriting historical revisions.

Active Context Revision immutability remains intact because neither source-currentness nor contextual-currentness
changes alter the revision in place.

Deterministic reasoning remains preserved because downstream consumers complete against the revision already supplied
to them rather than observing mid-cycle currentness changes.

Historical and diagnostic integrity remain preserved because the revision continues to represent the exact evidence
accepted for its original cognitive cycle.

Authority origin, verification, and preservation remain intact because currentness change and authority remain
independent architectural dimensions.

Brain orchestration remains intact. Brain may coordinate later cognitive cycles without refreshing or rewriting an
existing Context Revision.

Bootstrap composition remains intact. Bootstrap may compose later preparation relationships without substituting
references or acquiring currentness semantics.

Security ownership remains intact because revocation remains distinct from both kinds of currentness and is not
resolved by this decision.

Core custody remains intact. Core may custody future shared language and approved Contracts without owning currentness
or revision-change semantics.

Future source extensibility remains possible because each accepted source may evolve according to its own currentness
and lifecycle rules while Context preserves historical integrity and evaluates future suitability independently.

Preserving the historical revision does not claim that its references remain current or suitable for future use. It
preserves only the evidence boundary accepted for that revision’s cognitive cycle.

## Consequences

- A Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active is not mutated.
- References are not silently replaced, removed, reordered, or rewritten.
- Source-currentness changes affect future source eligibility.
- Contextual-currentness changes affect future Context suitability.
- Later cognitive use may require a successor Context Revision.
- Expiration may be triggered by later rules but is not defined here.
- Downstream consumers complete against the revision already supplied to them.
- Brain does not refresh or rewrite Context.
- Bootstrap and transport do not substitute references.
- Authority preservation does not imply permanent currentness.
- Historical preservation does not override Security revocation.
- The issuing source remains responsible for source-currentness change.
- Context remains responsible for contextual-currentness determinations for later revisions.
- Currentness change does not redefine authority, authorization, incorporation, or historical integrity.
- No new capability is introduced.

This decision does not establish exact expiration criteria, successor-revision triggers, recollection triggers,
automatic refresh, Security revocation behavior, currentness algorithms, failure handling, Contracts, APIs, runtime
sequencing, runtime mechanisms, or implementation rules.

## Deferred Implications

- Exact expiration criteria remain unresolved.
- Successor-revision triggers remain unresolved.
- Recollection triggers remain unresolved.
- Automatic refresh remains unresolved.
- Security revocation remains unresolved.
- Failure handling remains unresolved.
- Contracts remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which currentness changes are sufficient to affect future source eligibility or contextual suitability?
- Which expiration criteria may apply after a currentness change?
- What triggers preparation of a successor Context Revision?
- What triggers recollection or re-evaluation?
- How does Security-owned revocation interact with historical and future use?
- How are currentness-change failures owned and propagated?
- Which future Contracts, if any, express currentness change?
- Which runtime sequencing and implementation mechanisms realize these boundaries?

# 11.1 D-016 — Retrieval Authorization

## Decision

This decision resolves which accepted capability owns authorization decisions governing participation in retrieval of
cognitive references during Context preparation.

Retrieval authorization concerns how Security-owned authorization applies when Context requests participation from
Memory, Knowledge, or another accepted source. Authorization determines whether retrieval participation is permitted;
it does not determine what retrieval means.

Retrieval initiation causes a request to originate. Request semantics define its contextual meaning. Result semantics
define the architectural meaning of returned references as candidates for Context consideration. Source authority and
verification concern the trust or validity associated with source-issued references. Contextual currentness concerns
suitability for a revision under preparation. Incorporation determines whether a reference becomes part of that
revision. Authorization remains distinct from each responsibility.

This decision does not define authorization algorithms, policies, permissions, identities, APIs, Contracts, runtime
sequencing, providers, or implementation.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Security Owns Retrieval Authorization

Accepted. Security owns authorization decision semantics and therefore owns decisions governing whether retrieval
participation is permitted. This preserves the separation between Security policy and Context-owned retrieval meaning.

### Context Owns Retrieval Authorization

Rejected. Context owns collaboration, retrieval initiation, request semantics, contextual currentness, and
incorporation. Those responsibilities do not confer ownership of authorization decisions.

### Memory or Knowledge Own Retrieval Authorization

Rejected. Memory and Knowledge retain their respective source semantics, authority, verification, lifecycle, and
source currentness. They may satisfy permitted requests without owning the Security authorization that governs
participation.

### Brain Owns Retrieval Authorization

Rejected. Brain owns high-level cognitive orchestration. Coordinating a cognitive cycle does not confer ownership of
authorization decisions.

### Bootstrap Owns Retrieval Authorization

Rejected. Bootstrap composes approved architectural relationships. Composition does not determine whether
participation through those relationships is authorized.

### Core Owns Retrieval Authorization

Rejected. Core may custody shared architectural language and approved Contracts, but custody does not confer Security
behavior or authorization ownership.

### Authorization Emerges from Participating Sources

Rejected. Emergent authorization would create inconsistent or ownerless permission semantics and blur source
participation with Security ownership.

### Authorization Is Implied by Source Authority

Rejected. Source authority concerns the architectural origin of trust or validity associated with a cognitive
reference. It does not establish permission to request, disclose, return, or use that reference.

### Authorization Is Implied by Contextual Currentness

Rejected. Contextual currentness concerns suitability for a Context Revision. A suitable reference is not thereby
permitted to participate, and an authorization decision does not establish contextual suitability.

## Recommended Decision

Security owns authorization decisions governing participation in retrieval of cognitive references during Context
preparation.

Context may initiate retrieval but does not authorize it. Memory, Knowledge, and other accepted sources may satisfy
authorized requests within their semantic boundaries but do not own authorization. Authorization determines whether
retrieval participation is permitted.

Authorization does not redefine retrieval request semantics, retrieval result semantics, source semantics, source
authority, source verification, source or contextual currentness, or Context incorporation. It does not determine
whether an authorized and returned reference becomes part of a Context Revision.

This decision does not resolve authorization enforcement, authorization representation, or permission models.

## Rationale

D-001 remains preserved because Context continues to own collaboration semantics. Security governs whether
participation is permitted without acquiring ownership of the collaboration’s contextual meaning.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain ownership of represented
meaning. Security authorization neither transfers nor redefines source semantics.

D-003 remains preserved because Context continues to own incorporation. Authorization permits participation but does
not decide which references become part of a Context Revision.

D-004 through D-006 remain preserved because source authority, issuer-owned verification, and authority preservation
remain distinct from authorization. Security does not become the origin or verifier of cognitive-reference authority
by authorizing retrieval.

D-007 through D-009 remain preserved because authorization does not redefine the Context lifecycle, reference-set
stability, source lifecycle changes, or historical revision integrity.

D-010 remains preserved because Context continues to initiate retrieval. Initiating a request and authorizing
participation are separate architectural responsibilities.

D-011 and D-012 remain preserved because Context continues to own retrieval request and result semantics. Security
determines whether participation is permitted without defining the meaning of the request or returned set.

D-013 through D-015 remain preserved because source and contextual currentness remain under their accepted owners.
Authorization does not establish currentness, and currentness does not establish authorization.

Context ownership remains intact because Context continues to determine why references are requested, what returned
sets mean contextually, whether references remain contextually current, and which references are incorporated.

Security ownership remains intact because authorization decisions remain within Security rather than being distributed
among Context, sources, orchestration, composition, custody, or transport.

Source ownership remains intact because sources interpret and satisfy authorized requests within their own semantic
boundaries while retaining source semantics, authority, verification, lifecycle, and source currentness.

Authority answers where the architectural trust or validity associated with a reference originates. Authorization
answers whether participation is permitted. A source-authoritative reference may be unauthorized for retrieval, and an
authorized retrieval does not create authority for any returned reference.

Brain orchestration remains intact. Brain may orchestrate the broader cognitive cycle without authorizing retrieval or
acquiring Security semantics.

Bootstrap composition remains intact. Bootstrap may assemble approved relationships without deciding whether retrieval
participation is authorized.

Core custody remains intact. Core may custody shared architectural language and future approved Contracts without
making authorization decisions.

Future extensibility remains possible because additional accepted sources can participate under one Security-owned
authorization boundary without transferring their semantics to Security or requiring Context to absorb permission
semantics.

## Consequences

- Security owns authorization.
- Context does not authorize retrieval.
- Sources do not authorize retrieval.
- Authorization determines whether retrieval participation is permitted.
- Authorization does not imply authority.
- Authority does not imply authorization.
- Authorization does not imply incorporation.
- Authorization does not define retrieval meaning.
- Authorization does not redefine request semantics.
- Authorization does not redefine result semantics.
- Authorization does not redefine source semantics.
- Authorization does not redefine authority or verification.
- Authorization does not redefine currentness.
- Context retains retrieval initiation and incorporation ownership.
- Sources retain their accepted semantic, authority, verification, lifecycle, and source-currentness responsibilities.
- Brain does not authorize retrieval.
- Bootstrap does not authorize retrieval.
- Core does not authorize retrieval.
- No new capability is introduced.

This decision does not establish authorization enforcement, permission-evaluation rules, identities, roles,
permissions, authorization representation, policy models, Security revocation semantics, failure handling, Contracts,
APIs, runtime sequencing, providers, implementation mechanisms, or algorithms.

## Deferred Implications

- Authorization enforcement remains unresolved.
- Permission evaluation remains unresolved.
- Authorization representation remains unresolved.
- Contracts remain unresolved.
- Failure handling remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which architectural boundary enforces Security-owned retrieval authorization?
- How are permissions evaluated without transferring authorization ownership?
- How is an authorization decision represented?
- Which authorization boundaries require formal Contracts?
- How are denied, unavailable, or indeterminate authorization outcomes handled?
- How is authorization related to runtime sequencing?
- Which implementation mechanisms apply Security-owned authorization to retrieval participation?

# 11.2 D-017 — Authorization Enforcement

## Decision

This decision resolves which architectural boundary enforces Security-owned authorization during retrieval
participation.

Authorization ownership concerns responsibility for authorization decision semantics and remains with Security under
D-016. Authorization enforcement concerns application of those Security-owned decisions at protected architectural
boundaries through which retrieval participation occurs.

Retrieval initiation, request semantics, result semantics, source authority, authority verification, contextual
currentness, and incorporation retain their accepted owners and meanings. Enforcement applies Security-owned
authorization without transferring Security semantics to the capability participating at a protected boundary.

This decision does not define enforcement mechanisms, APIs, middleware, interceptors, gateways, Contracts, runtime
sequencing, implementations, providers, identities, permissions, or algorithms.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, Contract, or specification.

## Alternatives Considered

### Enforcement Occurs at Protected Security-Governed Capability Boundaries

Accepted. Retrieval participation crosses capability boundaries that may require protection. Applying Security-owned
authorization at those protected boundaries preserves Security ownership while preventing participating capabilities
from independently defining authorization semantics.

### Context Performs Authorization Enforcement

Rejected as an ownership assignment. Context may participate through a protected boundary governed by Security, but
Context ownership of collaboration, retrieval initiation, request semantics, contextual currentness, and incorporation
does not confer authorization-enforcement ownership.

### Memory or Knowledge Perform Authorization Enforcement

Rejected as an ownership assignment. Source boundaries may be protected and apply Security-owned authorization, but
Memory and Knowledge do not acquire Security semantics or independently define enforcement by virtue of supplying
references.

### Brain Performs Authorization Enforcement

Rejected. Brain owns high-level cognitive orchestration. Orchestration does not make Brain the enforcement boundary or
confer Security authorization responsibilities.

### Bootstrap Performs Authorization Enforcement

Rejected. Bootstrap composes approved architectural relationships. Composition may connect protected participants but
does not apply authorization by virtue of assembly.

### Core Performs Authorization Enforcement

Rejected. Core may custody shared architectural language and approved Contracts. Custody does not make Core an
enforcement boundary or confer Security behavior.

### Transport Performs Authorization Enforcement

Rejected as an architectural ownership assignment. Transport may eventually support an approved enforcement mechanism,
but transporting a request or result does not itself confer authorization semantics or enforcement responsibility.
Mechanism placement remains deferred.

### Enforcement Is Distributed among All Participants

Rejected. Distributed ownership would permit participants to define or reinterpret Security semantics independently
and would blur accountability between authorization ownership and application.

### Enforcement Is Implied by Authority Verification

Rejected. Authority verification validates source-originated authority associated with a cognitive reference. It does
not determine whether retrieval participation is permitted and cannot substitute for Security-owned authorization
enforcement.

## Recommended Decision

Security remains the owner of authorization decisions. Security-owned authorization is enforced only at protected
architectural boundaries through which retrieval participation occurs and that are governed by Security.

Participating capabilities may invoke or depend on Security-owned authorization at those boundaries without acquiring
Security semantics. Enforcement applies an authorization decision; it does not originate, own, reinterpret, or replace
that decision.

Enforcement does not redefine retrieval initiation, retrieval request semantics, retrieval result semantics, source
semantics, source authority, authority verification, source or contextual currentness, or Context incorporation. It
determines none of those responsibilities.

This decision does not resolve enforcement mechanisms, enforcement placement inside implementations, or Contracts.

## Rationale

D-001 remains preserved because Context continues to own collaboration semantics. Applying authorization at a
protected collaboration boundary does not transfer collaboration ownership to Security.

D-002 remains preserved because Memory, Knowledge, and future accepted sources retain ownership of represented
meaning. Enforcement governs permitted participation without redefining source semantics.

D-003 remains preserved because Context continues to own incorporation. Passing an authorization boundary does not
determine whether a reference becomes part of a Context Revision.

D-004 through D-006 remain preserved because authority origin, issuer-owned verification, and authority preservation
remain distinct from authorization enforcement. Applying authorization neither creates nor validates cognitive-
reference authority.

D-007 through D-009 remain preserved because enforcement does not redefine the Context lifecycle, reference-set
stability, source-change consequences, or historical revision integrity.

D-010 through D-012 remain preserved because Context retains retrieval initiation, request semantics, and result
semantics. Enforcement determines whether participation is permitted without changing what a request or result means.

D-013 through D-015 remain preserved because source and contextual currentness retain their accepted owners.
Enforcement does not establish or redefine currentness.

D-016 remains preserved because Security continues to own authorization decision semantics. Protected boundaries apply
those decisions without becoming independent authorization owners.

Security ownership remains intact because the meaning and governance of authorization decisions remain centralized
within the Security capability boundary, even when another participating capability invokes or depends on them.

Context ownership remains intact because Context continues to initiate retrieval, define request and result semantics,
determine contextual currentness, and own incorporation. Enforcement constrains permitted participation without
absorbing those responsibilities.

Source ownership remains intact because sources continue to interpret and satisfy permitted requests within their own
semantic boundaries. Applying Security-owned authorization at a protected source boundary does not make the source an
authorization owner.

Authority origin, verification, and preservation remain intact because authorization enforcement answers whether
participation is permitted, not whether a reference is authoritative or whether its authority has been verified.

Brain orchestration remains intact. Brain may coordinate the cognitive cycle without enforcing authorization merely
because it orchestrates participants.

Bootstrap composition remains intact. Bootstrap may compose protected relationships without enforcing authorization
merely because it assembles them.

Core custody remains intact. Core may custody shared language and future approved Contracts without applying
authorization merely because it holds architectural abstractions.

Applying an authorization decision differs from owning it because application respects a decision whose semantics
remain governed by Security. The protected boundary does not acquire authority to redefine the decision, its policy
basis, or its meaning.

Future extensibility remains possible because additional accepted sources and retrieval participants can use the same
Security-governed protection model without absorbing Security semantics or requiring changes to Context ownership.

## Consequences

- Security continues to own authorization.
- Protected architectural boundaries apply Security-owned authorization.
- Context does not become the authorization owner.
- Sources do not become authorization owners.
- Participating capabilities may invoke or depend on Security-owned authorization without acquiring Security
  semantics.
- Brain does not enforce by virtue of orchestration.
- Bootstrap does not enforce by virtue of composition.
- Core does not enforce by virtue of custody.
- Transport does not enforce by virtue of conveying requests or results.
- Enforcement does not redefine authority.
- Enforcement does not redefine authority verification or preservation.
- Enforcement does not redefine retrieval.
- Enforcement does not redefine request or result semantics.
- Enforcement does not redefine source semantics.
- Enforcement does not redefine currentness.
- Enforcement does not determine incorporation.
- No new capability is introduced.

This decision does not establish enforcement mechanisms, implementation placement, middleware, interceptors, gateways,
identities, permission models, authorization representation, failure handling, Contracts, APIs, runtime sequencing,
providers, algorithms, or implementation mechanisms.

## Deferred Implications

- Enforcement mechanisms remain unresolved.
- Implementation placement remains unresolved.
- Contracts remain unresolved.
- Failure handling remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which concrete architectural interactions require protected boundaries?
- Which mechanisms apply Security-owned authorization at those boundaries?
- Where are enforcement responsibilities placed within implementations?
- Which enforcement boundaries require formal Contracts?
- How are denied, unavailable, indeterminate, or failed enforcement outcomes handled?
- How is enforcement ordered relative to retrieval participation?
- Which implementation mechanisms preserve Security ownership while applying authorization decisions?

# 11.3 D-018 — Authorized Reference Boundary

## Decision

This decision resolves how the applicability of a Security-owned authorization decision remains architecturally associated with retrieval participation and returned cognitive references as they cross protected architectural boundaries. It does not resolve how that association is represented.

Security authorization determines whether participation is permitted under Security-owned semantics. Authorization enforcement applies that decision at a protected boundary. Neither authorization nor enforcement originates source authority, verifies cognitive authority, defines retrieval participation or returned-result meaning, establishes source or contextual currentness, or decides Context incorporation.

Source capabilities retain the origin, verification, preservation, lifecycle, and source-currentness semantics of their references. Context retains retrieval initiation, request and result semantics, contextual-currentness assessment, and incorporation. A returned reference remains only a candidate for Context consideration.

An "authorized reference" therefore means only that the applicability of the Security-owned authorization decision remains associated with the protected retrieval participation and the reference permitted through that boundary. It does not mean that Security originated or verified the reference's cognitive authority, that the reference is contextually current, or that Context has incorporated it.

This decision does not define authorization tokens, permissions, claims, identities, scopes, envelopes, metadata, Contracts, APIs, runtime sequencing, providers, or implementation mechanisms.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Authorization Applicability Remains Associated with the Protected Participation Boundary and the References Permitted Through It

Accepted. This preserves the relevance of the Security-owned decision across the governed architectural boundary without transferring authorization ownership, changing source authority, or deciding contextual suitability or incorporation.

### Authorization Becomes Part of Source Authority

Rejected. Authorization governs permitted participation; source authority governs the cognitive authority of source-owned references. Combining them would erase the distinction accepted by D-004 through D-006 and D-016 through D-017.

### Authorization Transfers to Context After Retrieval

Rejected. Context owns retrieval and incorporation semantics, but receiving or incorporating a reference does not make Context the owner of Security authorization.

### Authorization Transfers to the Source Satisfying the Request

Rejected. A source enforces an applicable decision when it forms the protected boundary, but enforcement and returning a reference do not transfer Security semantics to that source.

### Authorization Transfers to Brain

Rejected. Brain owns high-level cognitive orchestration, not authorization semantics, source authority, retrieval-result meaning, or Context incorporation.

### Authorization Transfers to Bootstrap

Rejected. Bootstrap composes approved relationships; composition and transport do not confer ownership of authorization or cognitive authority.

### Authorization Is Recreated After Transport or Incorporation

Rejected. Transport and incorporation cannot independently recreate a Security-owned decision. Treating them as doing so would distribute authorization ownership and make authorization depend on consumers rather than Security semantics.

### Authorization Is Discarded Immediately After Enforcement

Rejected. Discarding all architectural association at the boundary would make it impossible to distinguish references permitted through the governed participation from references merely present after transport, even though the association transfers no ownership or cognitive authority.

### Authorization Is Inferred from the Presence of a Returned Reference

Rejected. A reference's presence proves neither that a Security-owned decision existed nor that a protected boundary enforced it.

### Authorization Is Ownerless After Crossing the Protected Boundary

Rejected. Authorization semantics remain Security-owned. Crossing a boundary may preserve applicability but cannot make authorization ownerless.

## Recommended Decision

Security remains the owner of authorization semantics, and protected Security-governed architectural boundaries apply Security-owned authorization decisions. The applicability of an authorization decision remains architecturally associated with the retrieval participation it governed and with the references permitted through that protected boundary.

This association preserves authorization applicability; it does not transfer authorization ownership to the enforcing source, Context, Brain, Bootstrap, transport, Core, or any other participant. Enforcement applies the decision without owning it. The association is not source authority, does not originate or verify cognitive authority, does not establish source or contextual currentness, and does not determine Context incorporation.

Returning or transporting a reference does not itself prove authorization. A reference may be authoritative, source-current, and permitted through an authorized participation boundary while remaining contextually unsuitable. Context may consider a reference that is authorized, authoritative, and source-current without being required to incorporate it. Context alone owns contextual suitability and incorporation within its accepted boundary.

Authorization ownership, authorization applicability, enforcement, cognitive authority, contextual suitability, and incorporation therefore remain distinct architectural concerns. This decision does not resolve the representation, duration, expiration, or revocation of authorization and does not define Contracts.

## Rationale

The selected model preserves D-001 through D-017 by retaining Context ownership of collaboration, retrieval initiation, request semantics, result semantics, contextual currentness, and incorporation; retaining source ownership of source semantics, authority origin and verification, authority preservation, lifecycle, and source currentness; and retaining Security ownership of authorization decisions while protected boundaries enforce them.

Maintaining authorization applicability across a protected participation boundary records the continued architectural relevance of the decision to the participation and references it governed. It is not a transfer of authorization ownership: Security remains responsible for authorization meaning, while an enforcing boundary only applies that meaning. It is also not a conversion into cognitive authority: source capabilities alone establish and verify the authority of their references under their accepted boundaries.

Retrieval request and result semantics remain with Context. Permission for a source to participate does not change the meaning of Context's request, and a permitted returned reference remains a candidate rather than an incorporation command. Source currentness remains a source determination, while contextual currentness and incorporation remain separate Context determinations.

Context Revision immutability remains unchanged. Authorization applicability does not modify an Active Context Revision, establish a reference's contextual suitability, or authorize in-place change. The accepted Context lifecycle and the consequences of meaningful change remain governed by D-007 through D-009 and D-015.

Brain continues to own high-level cognitive orchestration without owning, recreating, or interpreting authorization. Bootstrap continues to compose approved relationships without acquiring authorization or source authority. Core may later custody shared architectural language authorized by higher-authority documents, but custody would not confer Security, source, or Context semantics.

The decision supports future source extensibility because any accepted source can participate behind an applicable protected boundary while retaining its own semantics, authority, verification, lifecycle, and currentness. Authorization applicability remains independent of source technology, transport, provider, representation, and implementation arrangement.

## Consequences

- Security continues to own authorization semantics.
- Protected Security-governed architectural boundaries enforce authorization.
- Authorization applicability may remain associated with the permitted retrieval participation and returned references governed by the applicable decision.
- A source does not become an authorization owner by enforcing a decision or returning references.
- Context does not become the authorization owner by receiving, considering, or incorporating references.
- Authorization does not create, originate, or verify cognitive authority.
- Cognitive authority does not imply authorization.
- Authorization does not establish source currentness or contextual currentness.
- Authorization does not determine Context incorporation.
- The presence, return, or transport of a reference does not alone prove authorization.
- Brain does not own or recreate authorization.
- Bootstrap and transport do not own or recreate authorization.
- Core custody does not confer authorization, source-authority, or Context semantics.
- A returned reference remains a candidate for Context consideration even when its participation was authorized, its cognitive authority was verified, and it is source-current.
- No new capability is introduced.

This decision does not establish authorization representation, evidence, duration, expiration, revocation, permissions, scopes, identity semantics, failure behavior, Contract shapes, APIs, runtime sequencing, provider behavior, transport behavior, enforcement mechanisms, implementation mechanisms, source authority, authority-verification behavior, source-currentness criteria, contextual-currentness criteria, incorporation criteria, or Context Revision transitions.

## Deferred Implications

- Authorization representation remains unresolved.
- Authorization duration and expiration remain unresolved.
- Security revocation remains unresolved.
- Permission and scope models remain unresolved.
- Failure ownership, propagation, and consequences remain for D-019 through D-021.
- Contract definitions remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation and enforcement mechanisms remain unresolved.

## Open Questions

- How, if at all, is authorization applicability represented across protected architectural boundaries?
- For how long does authorization applicability remain valid, and how is expiration determined?
- How does Security-owned revocation affect previously permitted participation or returned references?
- Which permission and scope model governs cognitive-reference participation?
- How are authorization-related failures owned, preserved, and propagated?
- Which future Contracts, if any, express the authorized-reference boundary?
- What runtime sequencing and implementation mechanisms realize the boundary after normative approval?

# 12.1 D-019 — Failure Ownership

## Decision

This decision resolves which accepted capability owns the architectural meaning of a failure that arises within cognitive-reference collaboration. Failure ownership identifies the capability whose accepted architectural responsibility defines the semantic boundary that failed.

Failure ownership is distinct from failure propagation, which concerns how a failure crosses architectural boundaries; failure handling, which concerns how a participant responds to a failure; recovery, which concerns whether and how an unsuccessful condition may be overcome; and implementation, which concerns how approved behavior is realized. This decision resolves only ownership and does not define any of those other concerns.

A failure does not transfer ownership merely because another capability observes, receives, transports, consumes, coordinates around, or is affected by it. Ownership remains with the capability whose accepted responsibility gives the failure its meaning.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Each Capability Owns Failures Arising from Its Own Accepted Responsibilities

Accepted. This aligns failure meaning with the capability already accountable for the semantic boundary that failed and preserves all accepted ownership divisions.

### Context Owns Every Collaboration Failure

Rejected. Context owns the collaboration and its own retrieval, currentness, and incorporation responsibilities, but collaboration ownership does not transfer source, Security, Brain, Bootstrap, or other capability failures to Context.

### Brain Owns Every Cognitive Failure

Rejected. Brain owns high-level cognitive orchestration, not the semantics of every capability it coordinates. Orchestration does not make Brain the owner of failures arising from another capability's responsibility.

### Security Owns Every Failure Involving Authorization

Rejected. Security owns failures whose meaning arises from Security-owned authorization semantics. A source, Context, protected boundary, or other participant retains failures arising from its own distinct responsibilities even when authorization is relevant to the collaboration.

### Bootstrap Owns Failures Because It Composes the Collaboration

Rejected. Bootstrap owns composition, not the capability semantics of the components it connects. Composition does not transfer failure ownership.

### The Consuming Capability Owns the Failure

Rejected. Consumption identifies where a failure is observed or used, not which accepted responsibility defines its meaning.

### Ownership Transfers After Propagation

Rejected. Propagation changes where a failure is available, not the semantic responsibility from which it arose.

### Failures Become Shared After Crossing Boundaries

Rejected. Shared ownership would create overlapping accountability and make ownership dependent on transport or participation rather than accepted capability boundaries.

### Failures Become Ownerless

Rejected. Ownerless failures would sever failure meaning from the architectural responsibility that defines it and prevent clear accountability.

### Ownership Depends on Implementation

Rejected. Architectural failure ownership follows stable semantic responsibility and must remain independent of frameworks, transports, providers, composition arrangements, or other implementation choices.

## Recommended Decision

Each accepted capability owns failures arising from its own accepted architectural responsibilities. Failure ownership follows the responsibility that defines the failed semantic boundary.

Context owns failures arising from Context-owned collaboration, retrieval initiation, retrieval-request semantics, retrieval-result semantics, contextual-currentness assessment, Context Revision preparation, and incorporation responsibilities. A source capability owns failures arising from its source semantics, interpretation of the source meaning it governs, source authority origin, authority verification, authority preservation, lifecycle, and source-currentness responsibilities. Security owns failures arising from Security-owned authorization semantics. A protected boundary's distinct enforcement responsibility does not transfer Security authorization ownership or failures of authorization meaning to the enforcing participant.

These examples classify ownership only. They do not define failure categories, propagation, handling, recovery, ordering, or runtime behavior.

Observing a failure does not transfer ownership. Propagating or transporting a failure does not transfer ownership. Consuming a propagated failure does not transfer ownership. Bootstrap composition does not transfer ownership. Brain orchestration does not transfer ownership. A participant may encounter or be affected by a failure owned by another capability without acquiring the meaning of that failure.

This decision does not define how failures are represented, propagated, handled, recovered, ordered, aggregated, or implemented.

## Rationale

The selected model preserves D-001 through D-018 because it derives failure ownership from the responsibility boundaries those decisions already establish rather than creating a second ownership model. Context remains the owner of collaboration, retrieval initiation, request and result semantics, contextual currentness, and incorporation. Corresponding failures remain Context-owned without making Context the owner of failures arising from independent source or Security responsibilities.

Source capabilities retain source semantics, authority origin and verification, authority preservation, lifecycle, and source currentness. Failures whose meaning arises from those responsibilities therefore remain with the applicable source. This preserves the distinction between cognitive authority and authorization and prevents Context, Security, Brain, Bootstrap, or a consumer from acquiring source responsibility merely by encountering a source-owned failure.

Security retains authorization semantics. Failures arising from the meaning of a Security-owned authorization decision remain Security-owned, while enforcement remains a distinct responsibility at the applicable protected boundary. This distinction preserves D-016 through D-018 without converting every failure associated with protected participation into a Security-owned failure or transferring Security ownership to the enforcer.

Retrieval and currentness boundaries remain unchanged. Context owns failures in the meaning of its request, returned candidate-set semantics, contextual-currentness assessment, and incorporation decision. Sources own failures in source interpretation, source authority verification, and source currentness. A returned reference remains a candidate, and neither authorization nor authority predetermines incorporation.

Brain remains the owner of high-level cognitive orchestration and therefore owns only failures arising from that accepted responsibility; observing or coordinating a capability-owned failure does not make Brain its owner. Bootstrap remains the owner of composition and owns only failures arising from that responsibility; connecting or transporting participants does not transfer their failures to Bootstrap. Core custody of shared language does not make Core the owner of capability failures.

Ownership follows semantic responsibility because that responsibility remains stable across observation, propagation, transport, composition, and implementation changes. Locating ownership in any of those incidental relationships would make failure meaning depend on topology or technology and would weaken future source extensibility. A future accepted source can retain accountability for failures within its own semantics without changing Context, Security, Brain, Bootstrap, or Core ownership.

## Consequences

- Context owns failures arising from Context-owned responsibilities.
- Source capabilities own failures arising from their source-owned responsibilities.
- Security owns failures arising from Security-owned authorization semantics.
- A protected boundary's enforcement responsibility does not transfer Security-owned failure semantics to the enforcing participant.
- Brain does not become the owner of a capability-owned failure merely by orchestrating.
- Bootstrap does not become the owner of a capability-owned failure merely by composing.
- Propagation does not transfer failure ownership.
- Observation does not transfer failure ownership.
- Transport does not transfer failure ownership.
- Consumption does not transfer failure ownership.
- Authority-related failure ownership remains distinct from authorization-related failure ownership.
- Context Revision preparation, validation, activation, and immutability remain unchanged.
- Core custody does not confer failure ownership.
- No new capability is introduced.

This decision does not establish failure propagation, failure representation, failure categories, handling, recovery, retries, compensation, ordering, precedence, aggregation, consequences for Context Revision preparation, Contracts, APIs, runtime sequencing, transport behavior, provider behavior, logging, observability, or implementation mechanisms.

## Deferred Implications

- Failure propagation remains for D-020.
- Consequences for the Context Revision being prepared remain for D-021.
- Failure handling and recovery remain unresolved.
- Retries and compensation remain unresolved.
- Failure ordering and precedence remain unresolved.
- Failure aggregation remains unresolved.
- Contract and API definitions remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- How are capability-owned failures propagated across architectural boundaries without changing ownership?
- What consequences do failures have for the Context Revision being prepared?
- Which failure-handling and recovery responsibilities require later architectural resolution?
- Are retries or compensation permitted, and which future authority governs them?
- How are multiple failures ordered, prioritized, or aggregated?
- Which future Contracts, if any, represent capability-owned failures?
- What runtime sequencing and implementation mechanisms realize failure boundaries after normative approval?

# 12.2 D-020 — Failure Propagation

## Decision

This decision resolves how a capability-owned failure crosses participating architectural boundaries while preserving the architectural identity and ownership established by the responsibility in which the failure arose.

Failure propagation concerns preserving the semantic continuity of a capability-owned failure while that failure becomes observable across architectural boundaries. Failure ownership identifies the capability whose accepted responsibility defines the failure's meaning. Failure handling concerns how a participant responds to an observed failure. Recovery concerns whether and how an unsuccessful condition may be overcome. Implementation concerns how approved behavior is realized. This decision resolves propagation only and does not define handling, recovery, or implementation.

Propagation does not create a new failure, redefine or transfer ownership, replace the originating failure, merge independent failures, or reinterpret the failure's semantic meaning. It preserves the identity of the capability-owned failure as it becomes observable to another participant.

This decision does not define propagation mechanisms, transports, error objects, Contracts, APIs, or runtime behavior.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Capability-Owned Failures Propagate While Preserving Ownership

Accepted. This allows a failure to remain observable across architectural boundaries without changing the capability responsibility that defines its meaning.

### Propagation Transfers Ownership

Rejected. Crossing a boundary changes where a failure is observable, not which accepted responsibility produced and semantically owns it.

### Propagation Creates a New Failure

Rejected. Treating propagation itself as creation would replace semantic continuity with a second failure and obscure the original capability ownership.

### Each Architectural Boundary Creates Its Own Failure

Rejected. Boundary-local recreation would fragment one capability-owned failure into multiple independently interpreted failures and make ownership depend on topology.

### Context Reinterprets Propagated Failures

Rejected. Context may observe or react to a propagated failure, but its collaboration ownership does not authorize it to redefine a source-owned, Security-owned, Brain-owned, Bootstrap-owned, or other capability-owned failure.

### Brain Normalizes Propagated Failures

Rejected. Brain owns orchestration, not the semantic meaning of failures owned by the capabilities it coordinates. Any later representation concern cannot authorize semantic reinterpretation.

### Bootstrap Owns Propagated Failures

Rejected. Bootstrap composes participants but does not acquire the failures or semantics of the capabilities it connects.

### Transport Owns Propagated Failures

Rejected. Transport conveys information and has no accepted capability ownership over the semantic failure being conveyed.

### Propagation Replaces the Original Failure

Rejected. Replacement would sever the propagated failure from the originating responsibility and undermine the ownership established by D-019.

### Propagation Aggregates Failures Automatically

Rejected. Independent failures retain their respective ownership and semantic identities. Whether aggregation is permitted requires a separate decision and cannot be implied by propagation.

## Recommended Decision

Capability-owned failures may propagate across participating architectural boundaries while preserving both the ownership and semantic identity of the originating failure.

Propagation makes the same architecturally identified failure observable beyond the boundary at which it arose. It does not reinterpret the failure's meaning, recreate the failure, replace the originating failure, merge independent failures, or transfer ownership. The capability whose accepted responsibility defines the failed semantic boundary remains the owner throughout propagation.

Participants may observe propagated failures and may react to them within their own accepted responsibilities. Observation or reaction does not make a participant the owner of the propagated failure. Context does not acquire source- or Security-owned failure semantics by receiving them; Brain does not acquire capability-owned failure semantics through orchestration; Bootstrap does not acquire them through composition; and transport does not acquire them by conveyance.

This decision does not determine how a failure is propagated, represented, handled, recovered from, ordered, aggregated, logged, observed operationally, or implemented.

## Rationale

The selected model preserves D-001 through D-019 by carrying the failure-ownership rule established by D-019 across architectural boundaries without introducing a second ownership model. Each capability remains accountable for failures arising from its accepted responsibilities even when another participant must observe or react to those failures.

Context retains ownership of collaboration, retrieval initiation, request and result semantics, contextual currentness, and incorporation. A propagated source- or Security-owned failure does not become a Context failure merely because it becomes observable during Context-owned collaboration. Conversely, a Context-owned failure remains Context-owned when observed elsewhere.

Source capabilities retain source semantics, authority origin and verification, authority preservation, lifecycle, and source currentness. Propagation preserves failures arising from those boundaries without allowing Context, Brain, Bootstrap, Security, or transport to reinterpret their source-owned meaning. Authority boundaries therefore remain intact.

Security retains authorization semantics, and protected boundaries retain their distinct enforcement responsibilities. A propagated authorization failure remains owned according to the Security responsibility that defines its meaning; conveyance through an enforcing or consuming boundary does not transfer Security ownership. Authorization and cognitive authority remain distinct throughout propagation.

Retrieval and currentness boundaries also remain unchanged. Propagation does not transform a retrieval-request failure into a source failure, a source-currentness failure into a contextual-currentness failure, or an incorporation failure into an authorization failure. Each retains the semantic identity established by its owning responsibility.

Brain continues to own orchestration without becoming the owner or semantic normalizer of propagated capability failures. Bootstrap continues to own composition without acquiring propagated failures. Core may custody future shared architectural language if authorized by higher-authority documents, but custody does not confer failure ownership or permit reinterpretation.

Propagation preserves semantic continuity rather than creating a second ownership model. This is analogous to preservation of source authority across boundaries: crossing, observation, or transport preserves the relevant architectural identity without transferring authority ownership to the receiver, composer, orchestrator, or carrier. Failure propagation likewise preserves failure identity without transferring failure ownership.

## Consequences

- Propagated failures preserve their originating capability ownership.
- Propagated failures preserve their semantic identity.
- Propagation does not transfer failure ownership.
- Propagation does not reinterpret failure meaning.
- Propagation does not recreate failures.
- Propagation does not replace originating failures.
- Propagation does not automatically aggregate independent failures.
- Context does not become the owner merely by receiving or reacting to a propagated failure.
- Brain does not become the owner merely by orchestrating participants that observe a propagated failure.
- Bootstrap does not become the owner merely by composing participants through which a failure propagates.
- Transport does not become the owner by conveying a failure.
- Observation does not redefine ownership.
- Consumption or reaction does not redefine ownership.
- Authority, authorization, retrieval, currentness, and incorporation boundaries remain unchanged.
- Core custody does not confer failure ownership.
- No new capability is introduced.

This decision does not establish propagation mechanisms, transports, failure representations, error objects, handling, recovery, retries, compensation, ordering, precedence, aggregation policy, logging, observability, Contracts, APIs, runtime sequencing, provider behavior, Context Revision consequences, or implementation mechanisms.

## Deferred Implications

- Failure handling remains unresolved.
- Recovery remains unresolved.
- Retries and compensation remain unresolved.
- Failure ordering and precedence remain unresolved.
- Failure aggregation policies remain unresolved.
- Consequences for the Context Revision being prepared remain for D-021.
- Contract and API definitions remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- How, if at all, are capability-owned failures represented for propagation across architectural boundaries?
- Which participants handle an observed propagated failure within their own responsibilities?
- What recovery, retry, or compensation behavior may later be authorized?
- How are multiple independent failures ordered or prioritized without changing ownership?
- Under what policy, if any, may independent failures be aggregated while preserving their identities?
- What consequences do propagated failures have for the Context Revision being prepared?
- Which future Contracts, if any, express failure propagation?
- What runtime sequencing and implementation mechanisms realize propagation after normative approval?

# 12.3 D-021 — Context Revision Consequence

## Decision

This decision resolves the architectural consequence that a capability-owned failure may have for the candidate Context Revision currently under preparation.

Failure ownership identifies the capability whose accepted responsibility defines the failure's meaning. Failure propagation preserves that ownership and meaning as the failure becomes observable across architectural boundaries. Context Revision consequence identifies only how the failure relates to successful completion of the candidate revision under preparation. Validation determines whether a prepared revision satisfies its applicable criteria, activation concerns the accepted lifecycle status by which a validated revision becomes Active, and runtime handling concerns how executable participants respond. This decision resolves none of those separate concerns.

A capability-owned failure may prevent successful completion of the candidate Context Revision currently under preparation. That architectural consequence applies only to that candidate revision. It does not transfer or reinterpret ownership of the failure, alter its propagation, invalidate every Context Revision, or mutate any previous Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active.

This decision does not determine recovery, define lifecycle transitions, redefine validation or activation, or specify runtime behavior.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace an approved ADR or specification.

## Alternatives Considered

### A Capability-Owned Failure Affects Only the Candidate Context Revision Under Preparation

Accepted. The candidate revision is the revision whose preparation depends on the affected collaboration. Limiting the consequence to that candidate preserves Context Lineage stability and the immutability of previous revisions whose incorporated-reference sets are stable or whose lifecycle states are Active.

### Every Failure Invalidates All Context Revisions

Rejected. A failure arising during one preparation concern has no architectural basis for invalidating unrelated, previously completed, or Active revisions.

### Failures Automatically Mutate an Active Context Revision

Rejected. Active Context Revisions are immutable. A failure encountered during preparation cannot rewrite or annotate an Active revision in place.

### Context Ignores Propagated Failures

Rejected. Context does not acquire ownership of a propagated failure, but a failure relevant to candidate preparation may still prevent that preparation from completing successfully.

### Brain Decides the Architectural Consequence

Rejected. Brain owns high-level cognitive orchestration, not Context Revision preparation, validation, activation, or incorporation semantics.

### Bootstrap Decides the Architectural Consequence

Rejected. Bootstrap owns composition and does not acquire Context lifecycle semantics or authority over the candidate revision.

### Failure Propagation Alone Determines the Context Revision Outcome

Rejected. Propagation preserves observability, ownership, and semantic identity; it does not determine the architectural consequence for a Context-owned candidate revision.

### Recovery Determines Architectural Consequence

Rejected. Recovery is unresolved and concerns whether an unsuccessful condition may be overcome. The architectural scope of the immediate consequence must not depend on an undefined recovery model.

### Context Revision Consequence Is Implementation-Defined

Rejected. Whether a failure may prevent completion of the candidate revision is an architectural boundary required to preserve Context ownership and revision immutability; it must not vary by provider, transport, framework, or implementation.

### Failure Consequence Is Ownerless

Rejected. Context owns the candidate revision and its preparation. The revision consequence belongs within that accepted Context responsibility even though ownership of the originating failure remains with the capability whose semantic boundary failed.

## Recommended Decision

A capability-owned failure may prevent successful completion of the one candidate Context Revision currently under preparation when that preparation depends on the failed architectural responsibility.

The architectural consequence is limited to that candidate revision. It does not apply retroactively to other revisions, mutate a previous Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active, or predetermine any future Context preparation. Future preparation remains a separate Context concern.

Failure ownership remains with the capability whose accepted responsibility defines the failure, and propagation continues to preserve that ownership and semantic identity. Assigning a consequence to the candidate revision does not make Context the owner of a source-owned or Security-owned failure and does not reinterpret the failure.

This decision does not redefine validation criteria, activation semantics, the accepted Context Revision lifecycle, or the point at which incorporated references become stable. It does not determine recovery or specify what runtime participants do when successful candidate completion is prevented.

## Rationale

The selected model preserves D-001 through D-020 by locating the Context Revision consequence within Context's accepted ownership of collaboration, contextual currentness, incorporation, and revision preparation while leaving the originating failure with its accepted owner. Context determines the consequence for its candidate revision without acquiring source, Security, Brain, or Bootstrap failure semantics.

Source capabilities retain source semantics, authority origin and verification, authority preservation, lifecycle, and source currentness. A source-owned failure may affect candidate preparation without transferring that failure to Context or changing its source-owned meaning. Security likewise retains authorization semantics when a Security-owned failure affects protected participation required by the candidate revision.

Failure ownership and propagation remain intact. The consequence describes the affected architectural subject—the candidate Context Revision—rather than redefining the failure itself. Propagation makes the capability-owned failure observable without determining the candidate's consequence, while Context's accepted revision responsibility establishes whether successful preparation may be prevented.

The consequence belongs to the candidate revision because that is the revision whose preparation is incomplete and whose prospective incorporated-reference set depends on the affected collaboration. Other revisions have separate identities and preparation histories. Extending the consequence to every revision would collapse those identities and contradict the accepted Context Lineage and Revision model.

Previous revisions whose incorporated-reference sets are stable or whose lifecycle states are Active remain unaffected because their relevant preparation has already completed, and Active revisions are immutable. A failure arising during a different candidate's preparation cannot revise, invalidate, or mutate them through this decision. Any future Context preparation is likewise a separate concern and is not predetermined by the present failure.

Brain retains high-level cognitive orchestration without deciding Context Revision consequences or acquiring failure ownership. Bootstrap retains composition without acquiring Context lifecycle semantics. Core may custody future shared architectural language if authorized by higher-authority documents, but custody does not confer ownership of failures, Context preparation, validation, or activation.

The model therefore preserves lifecycle stability without defining lifecycle transitions, validation rules, activation behavior, failure handling, or recovery.

## Consequences

- A capability-owned failure may prevent successful completion of the candidate Context Revision under preparation.
- The consequence applies to one candidate revision and does not automatically affect any other Context Revision.
- Previously Active Context Revisions remain unchanged.
- Previous Context Revisions whose incorporated-reference sets are stable are not mutated.
- Failure ownership remains unchanged.
- Failure propagation remains unchanged.
- Validation and its rules are not redefined.
- Activation and its semantics are not redefined.
- The accepted stability point for incorporated references is not redefined.
- Recovery remains unresolved.
- Future Context preparation remains a separate concern.
- Brain does not redefine the failure consequence merely by orchestrating.
- Bootstrap does not redefine the failure consequence merely by composing.
- Core custody does not confer ownership of the failure or the Context Revision consequence.
- No new capability is introduced.

This decision does not establish which failures prevent completion, failure handling, recovery, retries, compensation, validation rules, lifecycle transitions, activation behavior, failure propagation mechanisms, ordering, aggregation, Contracts, APIs, runtime sequencing, transports, providers, logging, observability, or implementation mechanisms.

## Deferred Implications

- Failure handling and recovery remain unresolved.
- Retries and compensation remain unresolved.
- Validation rules remain unresolved by this decision.
- Context Revision lifecycle transitions remain unresolved by this decision.
- Activation behavior remains governed by accepted architecture and is not further resolved here.
- Contract and API definitions remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which capability-owned failures are sufficient to prevent successful completion of the candidate Context Revision?
- What recovery, retry, or compensation behavior may later be authorized for an affected candidate revision?
- Which validation rules apply after a failure has affected candidate preparation?
- Which lifecycle transition, if any, represents a candidate revision that cannot complete successfully?
- Which future Contracts, if any, express the candidate-revision consequence while preserving failure ownership?
- What runtime sequencing and implementation mechanisms realize the consequence after normative approval?

# 13.1 D-022 — Composition Responsibility

## Decision

This decision resolves which accepted architectural collaboration boundaries Bootstrap composes for cognitive-reference collaboration.

Bootstrap owns architectural composition of accepted collaboration boundaries through approved Contracts. Composition connects accepted participants according to approved relationships without changing their accepted responsibilities. It concerns architectural assembly of relationships rather than ownership of cognitive behavior.

Composition is distinct from semantic ownership, which remains with the capability responsible for the applicable meaning; orchestration, which remains Brain's responsibility for the high-level cognitive flow; authority, which remains with the applicable source capability; authorization, whose semantics remain Security-owned and whose decisions are enforced at protected boundaries; and runtime behavior, which is not defined by this decision.

Bootstrap composes relationships among accepted participants. It does not perform, redefine, or acquire their cognitive behavior. This decision does not define composition mechanisms, dependency injection, concrete Contracts, APIs, or implementation.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Bootstrap Composes Accepted Collaboration Boundaries

Accepted. Bootstrap already owns architectural composition and can connect approved participants without acquiring their semantics, authority, authorization, lifecycle, failures, or orchestration responsibilities.

### Context Composes Every Collaboration

Rejected. Context owns cognitive-reference collaboration semantics and Context preparation, not architectural assembly of concrete participants. Assigning composition to Context would mix semantic ownership with application-boundary assembly.

### Brain Composes Collaboration

Rejected. Brain owns high-level cognitive orchestration, not architectural composition. Composition ownership would expand Brain into selection and assembly of concrete relationships.

### Security Composes Collaboration

Rejected. Security owns authorization semantics. Security governance of protected boundaries does not make Security responsible for assembling the collaboration those boundaries protect.

### Core Composes Runtime Collaboration

Rejected. Core custodies shared architectural language and approved Contracts. Runtime composition in Core would reverse dependency direction and make Core aware of concrete participants.

### Sources Compose Themselves

Rejected. Source capabilities own their respective semantics, authority, lifecycle, retrieval participation, and source currentness. Self-composition would make each source responsible for an outer collaboration relationship and weaken source replaceability.

### Composition Emerges Automatically

Rejected. Implicit or ownerless composition would obscure accountability for assembling accepted relationships and could allow accidental dependencies to define architecture.

### Composition Belongs to Transports

Rejected. Transports may convey interactions but do not own the architectural relationships or capability responsibilities being connected.

### Composition Belongs to Providers

Rejected. Providers are replaceable implementations and must not determine the platform's architectural collaboration boundaries.

### Composition Ownership Is Shared

Rejected. Shared ownership would blur accountability between Bootstrap and participating capabilities and risk treating capability participation as authority to redefine assembly.

## Recommended Decision

Bootstrap owns architectural composition of the accepted cognitive-reference collaboration boundaries. Through future approved Core-custodied Contracts, Bootstrap composes:

- Context and participating source capabilities for Context-owned retrieval requests;
- participating source capabilities and Context for returned candidate-reference sets;
- Context and issuing source capabilities for issuer-owned authority verification where required;
- retrieval participation through Security-governed protected boundaries;
- delivery of permitted source-issued references to Context for Context-owned currentness evaluation and incorporation; and
- propagation of capability-owned failures across the composed collaboration without transferring ownership.

Any future Brain-specific composition remains subject to D-024 and D-025 and is not established by this decision.

Bootstrap connects accepted participants without changing their ownership or responsibilities. Composition concerns which approved relationships are assembled; it does not determine or perform the cognitive behavior within those relationships.

Bootstrap does not acquire semantic ownership, source authority, authority-verification responsibility, authorization ownership, authorization-enforcement responsibility, Context or source lifecycle ownership, currentness ownership, incorporation ownership, failure ownership, or Brain orchestration ownership. It does not redefine retrieval, currentness, incorporation, Context Revision preparation, authorization enforcement, failure propagation, or candidate-revision consequences.

This decision identifies Bootstrap's architectural composition responsibility without defining concrete Contracts, dependency injection, runtime composition, sequencing, APIs, providers, transports, or implementation mechanisms.

## Rationale

The selected model preserves D-001 through D-021 because it assembles the boundaries established by those decisions without creating another semantic owner. Context remains responsible for collaboration, retrieval initiation, retrieval request and result semantics, contextual currentness, incorporation, and Context Revision preparation. Bootstrap connects Context to accepted participants without acquiring any of those meanings.

Source capabilities retain source semantics, authority origin and verification, authority preservation, lifecycle, and source currentness. Bootstrap may compose an approved relationship with a source, but the relationship does not make Bootstrap the source, confer source authority, or permit Bootstrap to verify or reinterpret a cognitive reference.

Security retains authorization semantics, and protected architectural boundaries enforce Security-owned decisions. Bootstrap may compose the approved participants and protected relationships required by that architecture, but composition neither grants Bootstrap authorization ownership nor turns composition into authorization enforcement.

Brain retains high-level cognitive orchestration, but this decision does not establish how Brain participates in Context preparation or coordinates cognitive-reference collaboration. Any future Brain-specific composition remains subject to D-024 and D-025. Bootstrap does not acquire responsibility for the cognitive sequence or final cognitive result as a Brain-owned orchestration outcome, and Brain does not acquire Bootstrap's assembly responsibility.

Core remains the custodian of shared architectural language and approved Contracts. Bootstrap depends on and composes through those inward-facing abstractions; Core does not select concrete participants or compose runtime relationships. Contract custody therefore remains distinct from composition ownership.

Authority, authorization, retrieval, currentness, incorporation, failure ownership, failure propagation, and candidate-revision consequences remain governed by their accepted owners. Composition does not transform any of them because it establishes architectural connectivity rather than domain meaning.

Composition is an architectural assembly concern because it determines how independently owned participants are connected after their boundaries have been approved. Capability semantics answer what each participant means and owns; Bootstrap composition answers only which approved relationships are assembled. Keeping those concerns separate allows Bootstrap and each capability to remain independently replaceable.

## Consequences

- Bootstrap owns architectural composition.
- Bootstrap composes accepted cognitive-reference collaboration boundaries through approved Contracts.
- Composition connects accepted participants without changing their responsibilities.
- Composition does not transfer semantic ownership.
- Composition does not transfer source authority or authority-verification responsibility.
- Composition does not transfer authorization ownership or enforcement semantics.
- Composition does not transfer Context or source lifecycle ownership.
- Composition does not transfer failure ownership or reinterpret propagated failures.
- Composition does not transfer Brain orchestration ownership.
- Any future Brain-specific composition remains subject to D-024 and D-025 and is not established by this decision.
- Context remains the owner of Context-owned collaboration and revision responsibilities.
- Sources remain the owners of their respective source semantics, authority, lifecycle, and source currentness.
- Security remains the owner of authorization semantics.
- Brain remains the owner of high-level cognitive orchestration.
- Core remains the custodian of shared architectural language and approved Contracts.
- Providers and transports do not acquire composition ownership.
- No new capability is introduced.

This decision does not establish concrete Contracts, APIs, dependency-injection structures, runtime composition, composition order, runtime sequencing, participant instances, provider selection, transport selection, deployment topology, configuration, lifecycle behavior, failure handling, or implementation mechanisms.

## Deferred Implications

- Concrete Contracts remain unresolved.
- Dependency injection remains unresolved.
- Runtime composition and composition order remain unresolved.
- APIs remain unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which approved Contracts will express each accepted collaboration boundary?
- Which concrete participants will future normative architecture require Bootstrap to compose?
- How will dependency injection realize the approved relationships?
- What runtime composition and composition-order constraints are required?
- Which implementation mechanisms will realize Bootstrap composition after normative approval?

# 13.2 D-023 — Composition Without Ownership or Authority Transfer

## Decision

This decision resolves how Bootstrap composes the accepted collaboration through approved, Core-custodied Contracts
without acquiring, creating, transferring, verifying, or reinterpreting capability semantic ownership, source
authority, or Security-owned authorization semantics.

Architectural composition connects concrete participants according to accepted boundaries. Semantic ownership remains
with the capability responsible for the applicable meaning. Source authority originates with the issuing source
capability, authority verification remains issuer-owned, and authority preservation maintains the association between
a reference and its source-originated authority. Security owns authorization semantics, while protected architectural
boundaries enforce Security-owned decisions without acquiring that ownership. Core custodies shared architectural
language and approved Contracts. Bootstrap selects and composes concrete participants through those Contracts.

Approved Contracts express accepted architectural boundaries; they do not own or execute the capability semantics
expressed through them. Core custody of a Contract does not confer capability semantics, source authority, authority-
verification responsibility, or authorization ownership on Core. Bootstrap’s use of a Contract does not confer those
responsibilities on Bootstrap.

Composition does not create, transfer, merge, delegate, redistribute, reconstruct, or reinterpret semantic ownership
or authority. It does not substitute for source-owned authority verification or Security-owned authorization.
Selecting or replacing a concrete implementation does not redefine the accepted architecture.

This decision does not redefine the collaboration relationships established by D-022. It does not define Contract
shapes, APIs, dependency injection, runtime sequencing, implementations, providers, or transports.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, specification, or Contract.

## Alternatives Considered

### Composition Preserves Accepted Ownership and Authority Boundaries

Accepted. Bootstrap may compose accepted participants through approved Contracts while every capability retains its
established semantics, authority, authorization, lifecycle, currentness, failure, and orchestration responsibilities.

### Bootstrap Acquires Authority over Composed Capabilities

Rejected. Bootstrap owns architectural composition, not the semantics or authority of the capabilities it connects.
Assembly does not make Bootstrap authoritative over composed behavior or results.

### Core Acquires Authority Because It Custodies Contracts

Rejected. Core custody preserves shared architectural language and approved abstractions. Custody does not confer
capability behavior, semantic ownership, source authority, verification responsibility, or authorization ownership.

### Contracts Create Shared Ownership

Rejected. Contracts express boundaries between independently owned responsibilities. They do not merge those
responsibilities or create shared semantic ownership among custodians, implementers, composers, and consumers.

### Contracts Delegate Authority to Consumers

Rejected. Consuming an operation or result through a Contract does not delegate the issuing capability’s authority to
the consumer. Authority remains associated with its accepted source boundary.

### Composition Transfers Source Authority

Rejected. Composition connects an issuing source with accepted participants but does not change the origin, ownership,
verification, or preservation of source authority.

### Composition Recreates Authority at the Receiving Boundary

Rejected. A receiving boundary cannot reconstruct authority originated by a source capability. Reception, transport,
incorporation, and composition do not create a replacement authority origin.

### Bootstrap Verifies Source Authority by Wiring a Verifier

Rejected. Bootstrap may bind an operation to its issuer-owned verification responsibility, but wiring that
relationship does not make Bootstrap the verifier, the verification owner, or the source of authority.

### Bootstrap Owns Authorization by Composing Security

Rejected. Security retains authorization semantics. Bootstrap may compose a Security-governed protected relationship
without acquiring authorization ownership or becoming an enforcement boundary merely through composition.

### Providers or Transports Determine Authority

Rejected. Providers and transports are implementation concerns. They may realize or convey approved interactions, but
they cannot originate, transfer, redefine, or determine architectural authority.

### Concrete Implementation Selection May Redefine Responsibility

Rejected. Implementation selection must conform to the accepted Contract and responsibility boundary. A selected
implementation cannot expand, transfer, or reinterpret the architecture it implements.

### Composition Creates Emergent or Composite Authority

Rejected. Emergent or composite authority would make architectural responsibility depend on assembly topology rather
than accepted capability boundaries and would obscure accountable authority origin and verification.

## Recommended Decision

Bootstrap composes accepted participants only through approved, Core-custodied Contracts and within the collaboration
relationships established by D-022.

Contracts express accepted boundaries but do not own or execute capability semantics. Core remains the custodian of
shared architectural language and approved Contracts, not the semantic owner of the behavior expressed through them.
Bootstrap remains the composer of concrete participants, not the semantic owner or authority source for those
participants.

Source capabilities retain their semantic ownership, authority origin, authority verification, authority preservation,
lifecycle, and source-currentness responsibilities. Security retains authorization semantics. Context retains
collaboration, retrieval initiation, retrieval request and result semantics, contextual currentness, incorporation,
and Context Revision responsibilities. Brain retains high-level cognitive orchestration and final cognitive-result
ownership. Failure ownership remains with the capability whose accepted responsibility defines the failed semantic
boundary, including while that failure propagates through the composed collaboration.

Composition does not transfer, merge, delegate, redistribute, reconstruct, or reinterpret any of those
responsibilities. Bootstrap may bind a source operation and its issuer-owned verifier without becoming the issuer, the
verification owner, or the source of authority. Invoking or making issuer-owned verification available through a
composed relationship does not substitute for that verification.

Bootstrap may compose a Security-governed protected boundary without becoming the authorization owner or an
authorization enforcer merely by composition. Authorization ownership remains with Security, and enforcement remains a
distinct responsibility of the applicable protected boundary.

A concrete implementation may replace another only when the replacement satisfies the same approved Contract and
preserves the same accepted responsibility boundary. Selection, replacement, provider choice, and transport choice
cannot redefine the architecture.

This decision does not resolve how Brain participates in cognitive-reference collaboration. Brain-specific
participation and composition remain reserved for D-024 and D-025.

## Rationale

The selected model preserves D-001 through D-022 by keeping architectural assembly separate from every semantic
responsibility expressed through the assembled relationships.

Context continues to own collaboration, retrieval initiation, request and aggregate-result semantics, contextual
currentness, incorporation, and Context Revision preparation. Bootstrap can make the accepted relationships available
without acquiring their Context-owned meaning.

Source capabilities continue to own their semantics, lifecycles, source currentness, authority origin, authority
verification, and authority preservation. Wiring an issuing source or its verifier into the collaboration does not
make Bootstrap the source, create another authority origin, or transfer verification ownership. Calling a verifier is
participation in issuer-owned verification, not ownership of verification.

Security continues to own authorization semantics, while protected boundaries enforce Security-owned decisions.
Composing a protected relationship does not make Bootstrap the authorization owner. Applying a Security decision at an
applicable boundary is enforcement, not ownership of authorization; composition alone does not perform or acquire that
enforcement responsibility.

Failure ownership and propagation remain unchanged. A failure crossing a composed relationship retains the ownership
and semantic identity established by the responsibility that failed. Bootstrap does not acquire a capability-owned
failure by assembling the path through which it propagates.

Brain retains high-level cognitive orchestration and ownership of the final cognitive result as a Brain-owned
orchestration outcome. Bootstrap composition
neither transfers those responsibilities nor establishes how Brain participates in cognitive-reference collaboration.

Core custody remains distinct from capability ownership. A Core-custodied Contract provides shared, technology-neutral
architectural language authorized by higher-level architecture. Custody does not make Core the semantic owner of the
capabilities implementing or consuming that Contract.

The model preserves dependency direction because capabilities depend on approved inward-facing abstractions rather
than concrete participants, while Bootstrap remains at the application boundary where concrete implementations are
selected and connected. Wiring is therefore an assembly act, not authority.

Implementation replaceability follows from the same separation. Selecting an implementation does not redefine
architecture; a replacement remains valid only while it satisfies the approved Contract and preserves its accepted
responsibility boundary.

Future extensibility remains possible because additional accepted sources, implementations, providers, or transports
can participate without requiring Core or Bootstrap to absorb their semantics or authority. New participants remain
accountable to the same approved boundaries rather than deriving authority from their position in the composed graph.

## Consequences

- Bootstrap composes but does not own capability semantics.
- Core custodies approved Contracts but does not own capability behavior.
- Contracts express accepted architectural boundaries without owning or executing their semantics.
- Contracts do not create shared ownership.
- Contracts do not transfer authority.
- Composition does not mint authority.
- Composition does not recreate authority.
- Composition does not merge, delegate, redistribute, or reinterpret ownership or authority.
- Composition does not replace source-owned authority verification.
- Wiring a verifier does not make Bootstrap the verifier owner.
- Invoking verification does not make the invoker the verification owner.
- Composition does not make Bootstrap the authorization owner.
- Composition alone does not make Bootstrap an authorization-enforcement boundary.
- Core custody does not confer source authority, verification ownership, or authorization ownership.
- Source capabilities retain their accepted semantics, authority, lifecycle, and source-currentness responsibilities.
- Security retains authorization semantics.
- Context retains its accepted collaboration, retrieval, contextual-currentness, incorporation, and revision
  responsibilities.

- Failure ownership and propagation remain unchanged.
- Providers and transports do not determine architectural authority.
- Concrete implementations remain replaceable only within accepted Contract and responsibility boundaries.
- Implementation selection does not redefine architecture.
- Brain retains high-level orchestration and final cognitive-result ownership.
- Brain-specific collaboration remains unresolved until D-024 and D-025.
- No new capability is introduced.

This decision does not establish concrete Contract definitions, Contract shapes, APIs, dependency-injection
structures, runtime composition order, provider selection, transport selection, deployment topology, participant
instances, Brain-specific composition, runtime sequencing, enforcement mechanisms, verification mechanisms,
implementation mechanisms, or runtime behavior. It does not redefine the relationships established by D-022.

## Deferred Implications

- Concrete Contract definitions remain unresolved.
- Contract shapes remain unresolved.
- APIs remain unresolved.
- Dependency injection remains unresolved.
- Runtime composition order remains unresolved.
- Provider selection remains unresolved.
- Transport selection remains unresolved.
- Deployment topology remains unresolved.
- Brain-specific composition remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which approved Contracts will express the accepted ownership and authority boundaries?
- Which concrete implementations may satisfy each approved Contract?
- How will dependency injection realize the accepted composition without changing responsibility boundaries?
- What runtime composition order, if any, will later normative architecture require?
- Which providers and transports may realize the approved relationships without determining their authority?
- How will Brain-specific composition be bounded by D-024 and D-025?
- Which implementation mechanisms will preserve ownership and authority boundaries after normative approval?

# 14.1 D-024 — Cognitive-Reference Orchestration Boundary

## Decision

This decision resolves what architectural coordination responsibility Brain retains for placing Context preparation
within the broader cognitive sequence without coordinating, bypassing, or owning the cognitive-reference collaboration
internal to Context.

Brain’s outer cognitive orchestration coordinates the place of accepted capability work within the broader cognitive
sequence. Context’s internal cognitive-reference collaboration governs how source references become available, are
evaluated for contextual suitability, and are incorporated during Context Revision preparation. Coordinating Context
as an accepted capability is therefore distinct from coordinating the collaboration owned by Context.

Brain may establish the orchestration need for an authoritative Context output, invoke or depend on Context through an
already composed, Core-custodied Contract, and consume the authoritative Context output produced by Context. Context
alone governs the behavior and meaning behind its side of that relationship.

Bootstrap composes the approved relationship but does not perform cognitive orchestration or Context behavior. Source
capabilities participate within their own semantics, authority, verification, lifecycle, retrieval-execution, and
source-currentness boundaries. Security retains authorization semantics, while protected boundaries enforce Security-
owned decisions. Downstream cognitive participants consume the authoritative Context output without acquiring Context
preparation responsibilities.

Brain does not initiate retrieval for the Context Revision, define retrieval-request or aggregate-result semantics,
interpret source requests, execute source retrieval, or coordinate Context-to-source participation. Brain does not
receive, retain, rank, filter, or maintain an independent candidate-reference set. It does not determine source or
contextual currentness, decide incorporation, or own Context validation, activation, incorporated-reference-set
stability, revision succession, or candidate-revision consequences.

Brain does not create a parallel cognitive-evidence snapshot. It consumes the authoritative Context output rather than
constructing a competing evidence boundary from source references.

This decision does not define runtime order, method calls, APIs, Contract shapes, asynchronous behavior, providers,
transports, or implementation mechanisms.

## Status

Accepted for ADR preparation.

This remains a non-normative architectural conclusion. It grants no implementation authority and does not replace an
approved ADR, specification, or Contract.

## Alternatives Considered

### Brain Coordinates Context as One Accepted Capability within the Broader Cognitive Sequence

Accepted. Brain retains its established high-level orchestration responsibility by coordinating the place of Context
preparation in the broader sequence while Context remains responsible for its internal collaboration and revision
preparation.

### Brain Directly Coordinates Context-to-Source Retrieval

Rejected. Context owns cognitive-reference collaboration. Direct Brain coordination of participating sources would
duplicate that responsibility and bypass the Context boundary.

### Brain Initiates Retrieval on Behalf of Context

Rejected. Context owns retrieval initiation during Context Revision preparation. Brain may require a Context output
without initiating the source retrieval through which Context prepares it.

### Brain Receives Candidate References Directly from Sources

Rejected. Returned references belong to the Context-owned collaboration as candidates for Context consideration.
Direct receipt by Brain would create a path around Context-owned result semantics, contextual-currentness evaluation,
and incorporation.

### Brain Maintains a Parallel Cognitive-Reference Set

Rejected. A Brain-owned reference set would create a competing evidence boundary outside the authoritative Context
Revision and duplicate Context preparation responsibilities.

### Brain Determines Contextual Currentness

Rejected. Context owns contextual currentness for the revision under preparation. Brain orchestration does not confer
ownership of contextual suitability.

### Brain Determines Incorporation

Rejected. Context alone decides whether an available source reference becomes part of a Context Revision. Brain cannot
acquire incorporation ownership by requiring or consuming Context.

### Brain Validates or Activates the Context Revision

Rejected. Validation and activation belong to the accepted Context Revision lifecycle. Brain may consume the
authoritative Context output without acquiring lifecycle ownership.

### Brain Owns Context Preparation Because It Owns the Broader Sequence

Rejected. Coordinating a capability within a broader sequence does not transfer the capability’s internal semantics or
behavior to the orchestrator.

### Context Operates Independently of Brain Orchestration

Rejected. Context retains internal semantic ownership, but its preparation participates in the broader cognitive
sequence coordinated by Brain. Independence of semantics does not require architectural isolation from orchestration.

### Bootstrap Performs Cognitive Orchestration

Rejected. Bootstrap owns architectural composition, not the cognitive sequence. Connecting Brain and Context through
an approved relationship does not make Bootstrap the orchestrator.

### Downstream Consumers Request Additional Source References Independently

Rejected. Independent retrieval would bypass Context, create evidence outside the authoritative Context Revision, and
permit downstream consumers to acquire Context preparation responsibilities.

## Recommended Decision

Brain retains responsibility only for coordinating the place of Context preparation within the broader cognitive
sequence. Context remains the sole semantic owner of cognitive-reference collaboration and Context Revision
preparation.

Brain may establish the need for and consume one authoritative Context output produced by Context. Brain must not
bypass Context to obtain source evidence for that cognitive cycle, maintain a competing evidence boundary, or
reinterpret the internal collaboration results through which Context prepared its output.

Brain must not initiate retrieval for the Context Revision, define retrieval-request or aggregate-result semantics,
interpret or execute source retrieval, determine source or contextual currentness, decide incorporation, or acquire
Context Revision lifecycle responsibilities. Its orchestration remains external to those Context-owned and source-
owned semantics.

Brain must not reopen, enrich, remove references from, or rewrite a Context Revision whose incorporated-reference set
is stable or whose lifecycle state is Active. It consumes the authoritative Context output supplied for the cognitive
sequence rather than maintaining an independent candidate-reference set or parallel cognitive-evidence snapshot.

Bootstrap composes the approved relationship. Core custodies the applicable approved Contract. Brain orchestrates
through that relationship. Context owns the behavior and meaning behind its side of the relationship. None of these
roles transfers semantic ownership, authority, authorization, lifecycle responsibility, or failure ownership.

This decision does not redefine how Brain assembles or owns the final cognitive result as a Brain-owned orchestration
outcome. That boundary remains reserved for D-025.

## Rationale

The selected model preserves D-001 through D-023 by distinguishing outer cognitive orchestration from the internal
collaboration and preparation semantics of Context.

Context continues to own cognitive-reference collaboration, relevance, composition, retrieval initiation, retrieval-
request semantics, aggregate retrieval-result semantics, contextual currentness, incorporation, incorporated-
reference-set stability, and the consequence of collaboration failures for the candidate revision. Brain coordinates
the need for Context within the broader sequence without absorbing any of those responsibilities.

Source capabilities retain ownership of their semantics, retrieval interpretation and execution within their domains,
authority origin, authority verification, authority preservation, lifecycle, and source currentness. Brain receives
the Context output rather than collecting source references independently, so orchestration does not create another
source-participation path or authority boundary.

Authority remains source-originated, issuer-verified, and preserved with the issued reference. Consuming a Context
Revision does not make Brain the semantic owner of its incorporated references or the origin, verifier, or recipient
of transferred source authority.

Security retains authorization semantics, and protected boundaries retain their enforcement responsibilities. Brain
does not authorize retrieval or become an enforcement boundary merely because it coordinates a sequence that requires
Context. Orchestration is neither authority nor authorization.

Retrieval and currentness ownership remain unchanged. Requiring a Context output expresses an orchestration need; it
is not initiation of Context-owned retrieval. Brain does not define what Context requests, what returned candidate
sets mean, how sources satisfy requests, or whether references are source-current or contextually current.

Context Revision stability and Active immutability remain intact because Brain consumes the Context output without
reopening its incorporated-reference set. One authoritative Context Revision supplies one coherent evidence boundary
for downstream cognitive work, preserving deterministic reasoning.

Failure ownership and propagation also remain unchanged. Brain may observe or react to a propagated capability-owned
failure within its orchestration responsibility without acquiring the failure’s semantic identity. Context remains
responsible for the consequence to its candidate revision.

Bootstrap retains composition ownership, while Core retains custody of approved Contracts. Orchestration is not
composition: Bootstrap connects the approved relationship, whereas Brain coordinates cognitive work through that
relationship. Neither role acquires the Context semantics expressed behind the Contract.

Coordinating a capability is not owning its internal semantics. Requiring a Context output is not initiating its
retrieval. Consuming a Context Revision is not owning its references. Orchestration is not incorporation, composition,
authority, authorization, verification, or enforcement.

The model supports future source extensibility because Context may collaborate with additional accepted sources
without expanding Brain’s responsibilities or requiring Brain to understand source-specific semantics, authority,
lifecycle, retrieval, or currentness behavior.

## Consequences

- Brain owns outer cognitive orchestration.
- Context owns internal cognitive-reference collaboration.
- Brain may establish the orchestration need for and consume an authoritative Context output.
- Coordinating Context preparation does not make Brain the coordinator of Context’s internal collaboration.
- Brain does not initiate source retrieval for the Context Revision.
- Brain does not own retrieval-request or aggregate-result semantics.
- Brain does not interpret source requests or execute source retrieval.
- Brain does not receive or maintain candidate references outside Context.
- Brain does not independently rank or filter candidate references.
- Brain does not own source currentness or contextual currentness.
- Brain does not determine incorporation.
- Brain does not validate or activate a Context Revision.
- Brain does not own incorporated-reference-set stability, revision succession, or candidate-revision consequences.
- Brain does not reopen or mutate a Context Revision whose incorporated-reference set is stable.
- Brain does not reopen or mutate an Active Context Revision.
- Brain does not create a parallel cognitive-evidence snapshot.
- Brain does not reinterpret Context’s internal collaboration results.
- Bootstrap retains architectural composition ownership.
- Core retains custody of approved Contracts.
- Sources retain their semantics, authority origin, authority verification, authority preservation, lifecycle,
  retrieval participation, and source currentness.

- Security retains authorization semantics.
- Protected-boundary enforcement remains distinct from Brain orchestration.
- Failure ownership and propagation remain unchanged.
- Downstream consumers do not independently retrieve additional evidence for the supplied Context Revision.
- The final cognitive-result boundary remains reserved for D-025.
- No new capability is introduced.

This decision does not establish the final cognitive-result boundary, concrete Brain-to-Context Contracts, Contract
shapes, APIs, method calls, invocation mechanisms, runtime sequencing, stage order, asynchronous behavior, retries,
recovery, provider selection, transport selection, deployment topology, failure-handling behavior, or implementation
mechanisms.

## Deferred Implications

- The final cognitive-result boundary remains unresolved.
- Exact Brain-to-Context Contract definitions remain unresolved.
- Runtime sequencing remains unresolved.
- Invocation mechanisms remain unresolved.
- Asynchronous behavior remains unresolved.
- Retries remain unresolved.
- Provider selection remains unresolved.
- Transport selection remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- How does the authoritative Context output participate in the final cognitive result as a Brain-owned orchestration
  outcome without transferring Context or source semantics?

- Which approved Contract will express the Brain-to-Context boundary?
- What runtime sequencing, if any, will later normative architecture require for Context preparation within the
  broader cognitive sequence?

- Which invocation mechanisms may realize the accepted boundary?
- How may asynchronous Context preparation be supported without transferring orchestration or Context ownership?
- How may retries be governed without allowing Brain to acquire Context preparation semantics?
- Which providers and transports may realize the approved relationship without redefining it?
- Which implementation mechanisms will preserve the orchestration boundary after normative approval?

# 14.2 D-025 — Final Cognitive Result Boundary

## Decision

This decision resolves how Brain assembles and owns the final cognitive result from an authoritative Context Revision
and other authoritative capability outputs without acquiring, recreating, replacing, or reinterpreting Context
semantics, incorporated-reference semantics, source authority, authorization, currentness, incorporation, or
capability-owned failure meaning.

Brain owns the final cognitive result as a Brain-owned orchestration outcome of the broader cognitive sequence it
coordinates. This ownership concerns that final cognitive result and its architectural meaning as the conclusion of
Brain’s accepted orchestration. It does not confer ownership of every semantic input represented within that result.

Brain assembles the final cognitive result from authoritative outputs produced by accepted capabilities. Each
contributing capability retains ownership of the meaning governed by its accepted responsibility. Brain may use those
outputs and express their architectural consequence in the final result, but it does not rewrite, reinterpret,
replace, or independently validate their capability-owned meaning.

Context retains ownership of the authoritative Context Revision and all Context-owned preparation semantics, including
collaboration, retrieval-request and retrieval-result semantics, contextual currentness, incorporation, validation,
activation, identity, lifecycle, stability, and the meaning of incorporated references as Context content. Brain does
not create a replacement Context boundary, reopen or modify the authoritative Context Revision, or convert
incorporated references into independently Brain-owned source meaning.

Source capabilities retain semantic ownership of their issued references, their authority origin, authority
verification, authority preservation, source lifecycle, retrieval participation, and source currentness. Brain’s use
of an incorporated reference through the authoritative Context Revision does not make Brain the source, transfer the
reference’s semantics, or create a replacement authority origin.

Security retains authorization semantics. Enforcement of a Security-owned decision at an applicable protected boundary
does not transfer authorization ownership to Brain merely because the permitted or denied participation affects the
final cognitive result.

Capability-owned failures retain their ownership and semantic identity. Brain may express the orchestration
consequence of such a failure in the final result without redefining the failure or converting it into a Brain-owned
failure. Brain owns the final orchestration branch or outcome; the capability whose accepted responsibility failed
continues to own the failure’s meaning.

Ownership of the final cognitive result is distinct from ownership of authoritative capability outputs. Assembling a
result does not reconstruct authority, consuming an authoritative output does not acquire its semantic ownership, and
expressing the final cognitive result as a Brain-owned orchestration outcome does not replace Context or any other
contributing capability.

Final transport and presentation remain outside Brain’s final-result ownership and outside this decision.

This decision does not define result schemas, algorithms, ranking, summarization, generation, serialization,
transport, presentation, APIs, Contracts, or implementation mechanisms. It does not define runtime behavior or
redefine D-024’s orchestration boundary.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation
authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Brain Owns the Final Result While Contributing Capabilities Retain Their Own Semantics and Authority

Accepted. This preserves Brain’s accepted responsibility for final-result assembly while maintaining the ownership,
authority, authorization, currentness, incorporation, and failure boundaries established by D-001 through D-024.

### Brain Acquires Ownership of All Contributing Outputs

Rejected. Assembly does not transfer semantic ownership. This alternative would collapse independent capability
boundaries into Brain and allow orchestration to displace the capabilities being coordinated.

### Brain Acquires Ownership of the Context Revision

Rejected. Context owns the authoritative Context Revision and its preparation semantics. Brain consumes that revision
for orchestration without acquiring, replacing, reopening, or mutating it.

### Brain Acquires Ownership of Incorporated References

Rejected. Context owns incorporation, while issuing source capabilities retain the references’ source meaning and
authority. Brain cannot acquire either responsibility through final-result assembly.

### Brain May Reinterpret Authoritative Capability Outputs

Rejected. Reinterpretation would replace capability-owned meaning with Brain-owned meaning and would undermine the
authority of the participating capability.

### The Final Result Creates New Source Authority

Rejected. Authority originates with the accepted capability responsible for the applicable source semantics. Combining
authoritative outputs does not mint a new source or authority origin.

### The Final Result Replaces the Authoritative Context Revision

Rejected. A Brain-owned final cognitive result and a Context-owned revision serve different architectural purposes.
The final cognitive result as a Brain-owned orchestration outcome is not a substitute Context boundary.

### Context Owns the Final Cognitive Result

Rejected. Context owns preparation of the authoritative Context Revision, not the broader cognitive orchestration or
its final outcome.

### Sources Jointly Own the Final Cognitive Result

Rejected. Sources own their respective outputs, semantics, and authority. Their participation does not make them
owners of the final cognitive result as a Brain-owned orchestration outcome.

### Final-Result Ownership Is Shared Among All Participants

Rejected. Shared ownership would obscure accountability for the final cognitive result as a Brain-owned orchestration
outcome and blur the distinct semantic responsibilities of participating capabilities.

### The Consumer Owns the Result by Receiving It

Rejected. Receipt does not establish architectural ownership. Consumers do not acquire Brain’s orchestration
responsibility or the semantic ownership of contributing capabilities.

### Transport or Presentation Owns the Final Result

Rejected. Transport conveys the result and presentation renders it. Neither responsibility owns the final cognitive
result as a Brain-owned orchestration outcome or its contributing semantics.

### The Final Result Is Ownerless or Emergent

Rejected. An ownerless result would leave final assembly and orchestration accountability undefined despite Brain’s
accepted responsibility for both.

## Recommended Decision

Brain owns the assembly and architectural meaning of the final cognitive result as a Brain-owned orchestration outcome.
It may express that result based on the authoritative Context Revision and other authoritative capability outputs
coordinated within that orchestration.

The result is assembled from authoritative capability outputs without transferring ownership of those outputs to
Brain. Owning the final result is not owning every input. Consuming authoritative outputs is not acquiring their
semantic ownership, and assembling a result is not reconstructing their authority.

Context retains ownership of the authoritative Context Revision and all Context-owned preparation semantics. Brain
must not reopen, enrich, replace, rewrite, or mutate that revision. Expressing the final cognitive result as a
Brain-owned orchestration outcome is not replacing Context or creating a replacement Context boundary.

Source capabilities retain the semantics of the references or source results they produce within their source
boundaries, authority origin, authority verification, authority preservation, source lifecycle, and source currentness.
Brain must not
reinterpret source meaning, treat incorporated references as independently Brain-owned evidence, or convert those
references into Brain-owned source meaning.

Security retains authorization semantics. Brain’s orchestration and final-result ownership do not acquire, replace, or
reinterpret Security-owned authorization decisions.

Context retains incorporation and contextual-currentness ownership. Brain may rely on the architectural consequence of
Context’s authoritative preparation without repeating or replacing Context’s incorporation or currentness
determinations.

Capability-owned failures retain their ownership and semantic identity. Brain may express a final branch of the final
cognitive result as a Brain-owned orchestration outcome affected by such a failure, but it must not transform the
failure into a Brain-owned failure merely because the failure influences the final result.

Brain must not mint new cognitive or source authority merely by assembling the result. The result may state or embody
the architectural consequence of authoritative capability outputs without absorbing their ownership.

Transport and presentation remain outside this decision. This decision does not redefine the orchestration
responsibilities or boundaries accepted by D-024.

## Rationale

This decision preserves D-001 through D-024 by locating final-result ownership within Brain’s already accepted
orchestration responsibility without disturbing any responsibility established for Context, sources, Security,
Bootstrap, Core, or other participating capabilities.

Context remains the owner of cognitive-reference collaboration, retrieval initiation, retrieval-request and retrieval-
result semantics, contextual currentness, incorporation, Context Revision preparation, validation, activation,
identity, lifecycle, stability, and immutability. Brain reasons and assembles over the architectural consequence of
one authoritative Context Revision without reopening its preparation or creating a competing Context boundary.

Source capabilities retain source semantic ownership, authority origin, authority verification, authority
preservation, source lifecycle, retrieval boundaries, and source currentness. A source-issued reference does not lose
those properties when Context incorporates it or when Brain uses the authoritative Context Revision in final-result
assembly. This preserves future source extensibility because additional accepted sources can contribute authoritative
outputs without transferring their domains into Brain.

Security retains authorization ownership, and applicable protected boundaries retain enforcement responsibility. A
permitted, denied, or otherwise authorization-affected capability output may influence the final cognitive result as a
Brain-owned orchestration outcome without making Brain the owner of authorization meaning.

Context Revision stability and immutability remain intact. The final cognitive result as a Brain-owned orchestration
outcome is a distinct architectural subject from the authoritative Context Revision. Brain’s result may depend on the
revision, but dependency does not permit Brain to enrich, reconstruct, replace, or mutate it.

Failure ownership and propagation remain unchanged. A source-owned, Context-owned, Security-owned, or other
capability-owned failure may affect which orchestration branch becomes final. That effect does not change the
failure’s semantic origin or owner. Brain owns the consequence expressed in the final cognitive result as a Brain-owned
orchestration outcome, not the capability-specific meaning of the failure that influenced it.

Bootstrap retains composition ownership because assembling the final cognitive result does not make Brain the composer
of concrete capability relationships. Core retains custody of shared architectural language and any future authorized
Contracts without acquiring Brain’s result ownership or the semantics of contributing capabilities.

The decision preserves deterministic reasoning over one authoritative Context Revision by preventing final-result
assembly from becoming a second Context preparation boundary. Brain relies on the accepted revision and other
authoritative outputs rather than reopening retrieval, reevaluating incorporation, or reconstructing authority during
assembly.

Result ownership differs from input ownership because the final result represents Brain’s orchestration conclusion,
while each input continues to represent meaning governed by its issuing capability. Assembly differs from semantic
reinterpretation because Brain coordinates and relates accepted outputs without redefining what those outputs mean.

A final branch differs from source meaning because it states the consequence for the cognitive orchestration, not a
new source-domain claim. The final cognitive result as a Brain-owned orchestration outcome differs from the
authoritative Context Revision because it expresses Brain’s orchestration conclusion rather than the information
Context established as relevant for the reasoning cycle.

Consuming an authoritative output differs from acquiring its authority because use does not change the output’s
issuer, semantic owner, verification responsibility, preservation requirements, or lifecycle. Likewise, a failure
affecting the final result does not transfer failure ownership because architectural consequence and semantic origin
are separate responsibilities.

## Consequences

- Brain owns the final cognitive result as a Brain-owned orchestration outcome.
- Brain does not own the authoritative Context Revision.
- Brain does not own incorporated references as source meaning.
- Brain does not acquire source semantic ownership.
- Brain does not acquire source authority or verification ownership.
- Brain does not acquire Security authorization semantics.
- Brain does not acquire source or contextual currentness ownership.
- Brain does not acquire incorporation ownership.
- Brain does not reinterpret authoritative capability outputs.
- Brain does not mint authority by assembling the result.
- Brain does not replace the authoritative Context boundary.
- Brain does not reopen, enrich, rewrite, replace, or mutate the Context Revision.
- Brain does not treat incorporated references as independently Brain-owned evidence.
- Ownership of the final result does not transfer ownership of its contributing outputs.
- The final cognitive result may express the architectural consequence of authoritative capability outputs without
  absorbing their ownership.

- Failure ownership remains with the capability whose responsibility failed.
- A failure influencing the final result does not become Brain-owned.
- Brain may own the final orchestration branch affected by a failure without owning or redefining that failure.
- Context, sources, Security, Bootstrap, and Core retain their accepted responsibilities.
- Brain’s accepted orchestration ownership remains unchanged.
- Transport and presentation ownership remain outside this decision.
- D-026 through D-029 remain deferred.
- No new capability is introduced.

This decision does not establish result content, concrete result Contracts, result schemas, APIs, algorithms, ranking,
summarization, generation, selection, serialization, persistence, retention, reconstruction, replay, exact replay,
asynchronous collaboration, event-driven collaboration, distributed collaboration, refresh, recollection, repeated
Context cycles, configurable retrieval policy, transport, presentation, runtime sequencing, lifecycle transitions,
failure-handling mechanisms, or implementation mechanisms. It does not authorize implementation or redefine D-024.

## Deferred Implications

- Persistence remains unresolved.
- Retention remains unresolved.
- Reconstruction remains unresolved.
- Replay remains unresolved.
- Exact replay remains unresolved.
- Asynchronous collaboration remains unresolved.
- Event-driven collaboration remains unresolved.
- Distributed collaboration remains unresolved.
- Refresh remains unresolved.
- Recollection remains unresolved.
- Repeated Context cycles remain unresolved.
- Configurable retrieval policy remains unresolved.
- Relevance policy remains unresolved.
- Ranking policy remains unresolved.
- Selection policy remains unresolved.
- Concrete result Contracts remain unresolved.
- Result schemas remain unresolved.
- Serialization remains unresolved.
- Transport remains unresolved.
- Presentation remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which future normative artifact will define the concrete Contract for representing a Brain-owned final cognitive
  result?

- Which result schema, if any, will distinguish the final cognitive result as a Brain-owned orchestration outcome from capability-owned authoritative
  outputs?

- What persistence, retention, reconstruction, replay, or exact-replay semantics will apply to final cognitive
  results?

- What asynchronous, event-driven, or distributed collaboration model will later be authorized?
- What refresh, recollection, or repeated Context-cycle semantics will later be authorized?
- Which configurable relevance, ranking, selection, or retrieval policies will later be authorized?
- How will final cognitive results be serialized, transported, and presented?
- What runtime sequencing and implementation mechanisms will realize this boundary after normative approval?

# 15.1 D-026 — Persistence, Reconstruction, and Replay Ownership Boundary

## Decision

This decision resolves how authoritative Context Revisions, incorporated source references, authoritative capability
outputs, authorization artifacts, capability-owned failures, and Brain-owned final cognitive results may be retained
and later used for Logical Reconstruction, Exact Replay, or historical reproduction without persistence,
reconstruction, replay, or reproduction becoming a new semantic owner, authority origin, authorization authority,
currentness authority, incorporation authority, orchestration authority, or failure owner.

A retained artifact is an architectural artifact or representation preserved for later use. An authoritative artifact
carries authority established by its accepted architectural owner. Retention preserves the artifact and its
attribution; it does not create, transfer, renew, or independently verify authority. A retained representation of an
authoritative artifact is not authoritative merely because it was retained.

Retention does not classify Context as Memory. Expiration, archival, or retention of a Context Revision does not
transfer Context identity, lineage, preparation, lifecycle, or semantic ownership to Memory. Memory classification
remains governed by Memory’s accepted semantic boundary rather than by persistence duration or storage status.

A historical representation describes or preserves evidence of an earlier architectural state or outcome.
Representation is not ownership and does not make the representing mechanism the semantic owner of the represented
artifact.

Logical Reconstruction is the construction of a logically equivalent Context Revision from the required
authoritative, version-identifiable source revisions and other required authoritative evidence. It produces a distinct
Context Revision and remains conditional on that evidence being available. Logical Reconstruction does not recreate
the original Context Revision’s identity or lifecycle history, become the original historical revision, renew or
recreate source authority, renew authorization, automatically establish present source or contextual currentness,
repeat the original cognitive execution, or constitute Exact Replay.

Exact Replay is the exact reproduction of the Context Revision consumed by a reasoning cycle. It requires sufficient
retained immutable evidence and reproduces the applicable historical Context Revision exactly. Exact Replay does not
mutate or reopen the original revision, create a replacement authority origin, renew authorization, refresh present
currentness, rerun retrieval or incorporation, or itself constitute a new Brain cognitive execution.

New Context preparation remains a distinct Context-owned concern. Logical Reconstruction creates a distinct logically
equivalent Context Revision rather than a newly prepared current revision; Exact Replay reproduces the applicable
historical Context Revision without creating a replacement revision. A new cognitive execution remains a distinct
Brain-owned orchestration concern and does not occur through Logical Reconstruction or Exact Replay.

Context retains ownership of Context Revision identity, lineage, preparation, validation, activation, stability,
immutability, contextual currentness, and the architectural semantics of the aggregate returned set made available for
Context consideration. Source capabilities retain the semantics of the references or source results they produce
within their source boundaries, authority origin, authority verification, authority preservation, lifecycle, and
source currentness.
Security retains authorization semantics. Context retains incorporation ownership. Capability-owned failures retain
their ownership and semantic identity. Brain retains ownership of the final cognitive result as a Brain-owned
orchestration outcome.

Logical Reconstruction, Exact Replay, and historical reproduction preserve attribution to these original
architectural owners. They do not mint replacement authority, renew authorization, refresh source or contextual
currentness, repeat incorporation, transform capability-owned failures into reproduction-owned failures, or transfer
ownership of a Brain-owned final cognitive result.

This decision does not define persistence or replay mechanisms, Contract shapes, schemas, storage, serialization,
snapshots, event logs, databases, caches, algorithms, APIs, runtime sequencing, providers, transports, or
implementation.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation
authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Retention and Reproduction Preserve Original Ownership and Attribution

Accepted. Retained and reproduced artifacts remain attributable to their accepted architectural owners. Persistence
and reproduction preserve evidence without acquiring its semantics or authority.

### Persistence Becomes the Semantic Owner of Retained Artifacts

Rejected. Custody or preservation does not establish semantic ownership. This alternative would allow a storage
concern to displace Context, sources, Security, Brain, and other capability owners.

### Retained Context Automatically Becomes Memory

Rejected. Context and Memory are distinguished by semantic role and authority, not persistence. Expiration, archival,
or retention cannot reclassify Context as Memory.

### Logical Reconstruction Recreates the Original Authoritative Context Revision

Rejected. Logical Reconstruction produces a distinct, logically equivalent Context Revision from the required
authoritative evidence. It does not recreate the identity, lifecycle history, or authoritative status of the original
Context Revision or become the original historical revision.

### Reconstructed Material Is Authoritative Because It Was Persisted

Rejected. Persistence preserves an artifact or representation but does not establish authority. Authority remains
attributable to the accepted capability that originally established it.

### Exact Replay Renews Source Authority

Rejected. Exact Replay may reproduce the Context Revision containing evidence of historical source authority but
cannot renew, reissue, or recreate that authority.

### Exact Replay Repeats Authority Verification

Rejected. Historical evidence that verification occurred is not a new verification. Any new verification would be a
separate capability-owned concern rather than Exact Replay.

### Exact Replay Renews Security Authorization

Rejected. A historical authorization artifact represents a historical Security-owned decision. It does not grant
renewed or present permission.

### Exact Replay Refreshes Currentness

Rejected. Historical source or contextual currentness is not present currentness. Reevaluating currentness would be a
new source-owned or Context-owned concern, not Exact Replay.

### Exact Replay Repeats Context Incorporation

Rejected. Exact Replay reproduces the Context Revision that resulted from historical incorporation, but it does not
repeat Context’s incorporation decision or reopen Context preparation.

### Exact Replay Creates a New Brain Cognitive Execution

Rejected. Exact Replay reproduces the Context Revision consumed by the historical reasoning cycle; it does not itself
perform a new Brain orchestration. Any new cognitive execution must be treated as a separate architectural concern.

### Historical Reproduction Owns Capability Failures Represented in Historical Evidence

Rejected. A mechanism may reproduce evidence of a failure without acquiring the failure’s semantic identity or
ownership.

### A Storage Provider Determines Architectural Ownership

Rejected. Storage providers are replaceable implementation concerns. They cannot assign, transfer, or redefine
architectural ownership.

### A Replay Mechanism Creates a New Composite Authority

Rejected. Combining retained evidence does not create a new authority origin. Each represented artifact remains
attributable to its original accepted owner.

### Exact Replay Is Possible Without Sufficient Immutable Evidence

Rejected. Without sufficient retained immutable evidence, the Context Revision consumed by a reasoning cycle cannot
be reproduced exactly. Approximation or Logical Reconstruction must not be represented as Exact Replay.

## Recommended Decision

Persistence, retention, reconstruction, and replay are preservation or reproduction concerns, not semantic owners.

Every retained artifact remains attributable to its original accepted architectural owner. Retention preserves an
artifact or representation without transferring ownership, establishing new authority, renewing authorization,
refreshing currentness, repeating verification, repeating incorporation, or initiating a cognitive execution.

Context retains ownership of Context Revision identity, lineage, preparation, validation, activation, stability,
immutability, and contextual currentness. Retained Context is not Memory by retention alone, and expiration, archival,
or retention does not transfer Context semantics to Memory.

Source capabilities retain the semantics of the references or source results they produce within their source
boundaries, authority origin, authority verification, authority preservation, lifecycle, and source currentness.
Reproduction is not reissuance: Logical Reconstruction or Exact Replay does not recreate a source reference or replace
its issuing authority.

Security retains authorization semantics. A retained authorization artifact may represent a historical Security-owned
decision, but Exact Replay is not renewed authorization and historical authorization is not present permission.

Capability-owned failures retain their ownership and semantic identity. Retention or historical reproduction may
preserve or reproduce the historical consequence of a failure without transforming it into a persistence-owned or
reproduction-owned failure.

Brain retains ownership of the final cognitive result as a Brain-owned orchestration outcome. Reproduction of that
retained historical outcome does not transfer its ownership or create a new Brain cognitive execution.

Bootstrap retains composition ownership. Core retains custody of shared architectural language and approved Contracts.
Neither responsibility is transferred to persistence, reconstruction, replay, storage providers, or replay mechanisms.

Logical Reconstruction produces a distinct, logically equivalent Context Revision when the required authoritative,
version-identifiable source revisions and other required authoritative evidence remain available. It does not become
the original historical revision, recreate its identity or lifecycle history, renew authority or authorization,
establish present currentness, repeat incorporation or the original cognitive execution, or constitute Exact Replay.

Exact Replay reproduces exactly the Context Revision consumed by a reasoning cycle when sufficient retained immutable
evidence exists. It does not reopen or mutate the original Context Revision, rerun retrieval or incorporation, create a
replacement authority origin, renew authorization, refresh present currentness, or itself perform a new Brain cognitive
execution.

Retention, Logical Reconstruction, and Exact Replay do not constitute refresh, recollection, or a repeated Context
cycle. Any later new Context preparation or cognitive execution must be treated as a new architectural concern rather
than disguised as reconstruction or replay.

Representation is not ownership. Reproduction is not authority creation. Logical Reconstruction is not new
verification. Exact Replay is not renewed authorization, refreshed currentness, new incorporation, or a new cognitive
execution.

This decision does not resolve D-027 through D-029.

## Rationale

The selected boundary preserves D-001 through D-025 because it permits historical and diagnostic continuity without
displacing any accepted semantic owner.

Context ownership and revision immutability remain intact. Retaining or reproducing a Context Revision does not alter
the original revision’s identity, lineage, preparation history, lifecycle, stability, or immutability. Logical
Reconstruction creates a distinct Context Revision, and neither Logical Reconstruction nor Exact Replay reopens the
original revision or acts as a replacement Context-preparation boundary.

Source semantic ownership remains intact because retained references and capability outputs continue to be attributed
to their issuing sources. Persistence is custody, not semantic ownership. Reproduction is not reissuance, and
Logical Reconstruction does not establish a new source or authority origin.

Authority origin, verification, and preservation remain separate. Retained evidence may preserve the historical fact
and result of issuer-owned verification, but Logical Reconstruction does not perform new verification and Exact Replay
does not renew authority. This prevents storage or replay mechanisms from becoming substitute sources.

Retrieval and currentness boundaries remain unchanged. Logical Reconstruction depends on the required authoritative,
version-identifiable source revisions and other required authoritative evidence remaining available because retained
reference representations cannot independently replace their authoritative sources. Missing authoritative source
revisions or evidence therefore limit what may be logically reconstructed.

Historical source currentness and contextual currentness remain attributable to their respective owners and historical
architectural conditions. They do not establish present currentness. Reassessing currentness would require a distinct
capability-owned concern and cannot be implied by Exact Replay.

Security authorization ownership and enforcement remain unchanged. A retained authorization artifact represents a
historical Security-owned decision and its accepted applicability. Historical authorization is not renewed permission,
and Logical Reconstruction or Exact Replay cannot authorize present participation or action.

Failure ownership and propagation remain intact. Retained evidence may preserve a capability-owned failure and its
historical consequence, but preservation and reproduction do not alter its owner or semantic identity. A reproduction
mechanism does not acquire failure meaning merely because it reproduces a result affected by that failure.

Bootstrap retains composition ownership because persistent custody or replay does not compose the accepted capability
graph. Core retains custody of shared architectural language and approved Contracts without becoming the semantic
owner of retained or reconstructed artifacts.

Brain retains orchestration and final-result ownership. A reproduced final cognitive result remains attributable to
Brain’s historical orchestration. Historical reproduction is not rerun: reproducing that result does not
execute Brain’s orchestration again, change stage precedence, or create a new result through a new cognitive sequence.

Historical and diagnostic integrity require clear separation between the original authoritative artifact, retained
evidence, a later Logical Reconstruction, and Exact Replay. Treating every retained representation as authoritative
would erase provenance and make diagnostics unable to distinguish original decisions from later reproductions.

Deterministic reasoning is preserved because one authoritative Context Revision remains the basis of the applicable
historical reasoning cycle. Logical Reconstruction creates a distinct logically equivalent Context Revision, while
Exact Replay reproduces the consumed historical revision exactly; neither silently substitutes a newly prepared
revision, refreshes source inputs, or repeats incorporation.

Exact Replay requires evidence sufficient to reproduce exactly the Context Revision consumed by a reasoning cycle.
This requirement prevents an incomplete approximation from being represented as exact, while leaving the technical
evidence-sufficiency criteria unresolved.

Future source extensibility is preserved because each source retains its semantics, authority, verification,
lifecycle, retrieval-result boundary, and currentness regardless of persistence technology or replay mechanism. New
sources can participate without transferring their ownership into a centralized persistence or replay authority.

## Consequences

- Retention does not transfer ownership.
- Retention does not classify Context as Memory.
- Expiration, archival, or retention of Context does not transfer Context semantics to Memory.
- Persistence does not create authority.
- Logical Reconstruction does not create authority.
- Exact Replay does not create authority.
- Logical Reconstruction does not repeat verification.
- Exact Replay does not renew authorization.
- Exact Replay does not refresh source or contextual currentness.
- Exact Replay does not repeat incorporation.
- Exact Replay does not rerun retrieval.
- Exact Replay does not reopen or mutate the original Context Revision.
- Exact Replay does not create a replacement Context Revision.
- Exact Replay does not create a new cognitive execution.
- Reconstructed material is not authoritative merely because it was retained.
- Logical Reconstruction produces a distinct logically equivalent Context Revision and depends on required
  authoritative, version-identifiable source revisions and other required authoritative evidence remaining available.

- Missing required authoritative source revisions or evidence limit Logical Reconstruction.
- Exact Replay requires sufficient retained immutable evidence.
- A reproduction is not a reissuance of the represented artifact.
- Historical authorization is not renewed permission.
- Historical currentness is not present currentness.
- Failure ownership remains unchanged.
- Historical reproduction does not transform capability-owned failures into reproduction-owned failures.

- Brain final-result ownership remains unchanged.
- Context, sources, Security, Bootstrap, Core, and Brain retain their accepted responsibilities.
- Storage providers and replay mechanisms do not determine architectural ownership.
- Retention, Logical Reconstruction, and Exact Replay do not constitute recollection, refresh, or repeated Context
  cycles.
- A later new Context preparation or cognitive execution remains a distinct architectural concern.
- D-027 through D-029 remain unresolved.
- No new capability is introduced.

This decision does not establish retention, archival, or deletion policy; storage models; serialization; artifact
schemas; snapshot models; event logs; databases; caches; evidence-sufficiency criteria; reconstruction or replay
algorithms; replay engines; concrete Contracts; APIs; providers; transports; asynchronous, event-driven, or
distributed collaboration; refresh; recollection; repeated Context cycles; configurable retrieval policy; runtime
sequencing; or implementation mechanisms.

## Deferred Implications

- Retention policy remains unresolved.
- Archival policy remains unresolved.
- Deletion policy remains unresolved.
- Storage models remain unresolved.
- Serialization remains unresolved.
- Artifact schemas remain unresolved.
- Snapshot models remain unresolved.
- Event logs remain unresolved.
- Databases remain unresolved.
- Caches remain unresolved.
- Evidence-sufficiency criteria remain unresolved.
- Reconstruction algorithms remain unresolved.
- Replay algorithms remain unresolved.
- Replay engines remain unresolved.
- Asynchronous collaboration remains unresolved.
- Event-driven collaboration remains unresolved.
- Distributed collaboration remains unresolved.
- Refresh remains unresolved.
- Recollection remains unresolved.
- Repeated Context cycles remain unresolved.
- Configurable retrieval policy remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which retention, archival, and deletion policies will apply to each architectural artifact?
- Which future normative artifact will define evidence-sufficiency criteria for Exact Replay?
- Which artifact representations, if any, must be retained to support Logical Reconstruction or Exact Replay?
- How will unavailable authoritative source revisions constrain particular reconstruction requests?
- Which future Contracts or schemas will represent retained artifacts, historical representations, reconstructions,
  and replay outcomes?

- Which storage, serialization, snapshot, event-log, database, or cache models will later be authorized?
- Which reconstruction algorithms, replay algorithms, or replay mechanisms will later be authorized?
- How will asynchronous, event-driven, or distributed collaboration preserve this ownership boundary?
- How will refresh, recollection, and repeated Context cycles remain distinguishable from Logical Reconstruction and
  Exact Replay?
- How will configurable retrieval policy interact with Logical Reconstruction and Exact Replay without changing
  historical meaning?
- What runtime sequencing and implementation mechanisms will realize this boundary after normative approval?

# 15.2 D-027 — Asynchronous, Event-Driven, and Distributed Collaboration Ownership Boundary

## Decision

This decision resolves how the accepted cognitive-reference collaboration may occur across asynchronous, event-driven,
or distributed execution boundaries without changing semantic ownership, authority origin or verification,
authorization ownership or applicability, currentness ownership, incorporation ownership, Context Revision identity or
stability, failure ownership, Bootstrap composition, Core custody, Brain orchestration, or final-result ownership.

Architectural responsibility identifies which accepted capability owns a meaning or decision. An execution model
describes possible characteristics of how accepted collaboration is realized. Changes in execution model, temporal
separation, process separation, or deployment separation do not alter architectural responsibility.

Asynchronous continuation means that participation may continue after temporal separation. It does not establish a new
owner and is not automatically reconstruction, replay, refresh, recollection, a repeated Context cycle, new Context
preparation, or a new cognitive execution.

Publication, conveyance, delivery, receipt, and redelivery describe hypothetical movement or availability of
information under a possible execution model. None transfers semantic ownership. An intermediary or transport does not
become the owner of conveyed meaning, and execution topology does not determine architectural ownership.

Temporal delay does not renew or establish source currentness and does not establish contextual currentness.
Currentness remains governed by its accepted source or Context owner. Process or deployment separation likewise does
not create shared, emergent, or composite authority.

Delivery does not constitute retrieval initiation and does not define retrieval-request or retrieval-result semantics.
Receipt does not constitute authority verification or establish or renew authorization. Delivery does not constitute
Context incorporation.

Context retains ownership of Context Revision identity and lineage, preparation, validation, activation, incorporated-
reference-set stability, immutability, contextual currentness, incorporation, and candidate-revision consequences.
Delayed or newly delivered evidence cannot modify a Context Revision whose incorporated-reference set is stable or
whose lifecycle state is Active. Such evidence may be considered, where applicable, only through a later and distinct
Context-owned preparation concern.

Source capabilities retain the semantics of the references or source results they produce within their source
boundaries, authority origin, authority verification, authority preservation, lifecycle, and source currentness.
Security retains authorization semantics, and
applicable protected boundaries retain enforcement responsibility.

Asynchronous propagation preserves capability-owned failure meaning and ownership. Conveyance, delay, receipt, or
distributed participation does not transform a capability-owned failure into a transport-owned, intermediary-owned,
receiver-owned, or orchestration-owned failure.

Brain retains outer orchestration, stage precedence, final-result assembly, and ownership of the final cognitive
result as a Brain-owned orchestration outcome. Bootstrap retains composition ownership. Core retains custody of approved shared
architectural language and Contracts. Persistence, reconstruction, and replay remain governed by D-026.

Redelivery is not automatically replay. Asynchronous continuation is not automatically a new Context cycle or
cognitive execution. Any later new Context preparation or cognitive execution remains a distinct architectural concern
governed by its accepted owner.

This decision treats asynchronous, event-driven, and distributed solely as possible execution characteristics. It does
not establish an Event abstraction, Event semantics, Event schemas, publishers, subscribers, brokers, queues,
coordinators, workers, remote services, messages, delivery Contracts, protocols, or execution topology.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation
authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Execution-Model Changes Preserve Accepted Ownership and Authority Boundaries

Accepted. Execution characteristics may change without redefining which accepted capability owns the meaning,
authority, decision, failure, composition, orchestration, or result involved.

### Asynchronous Delivery Transfers Ownership to the Receiver

Rejected. Receipt provides no architectural basis for acquiring the semantics or authority of conveyed information.
The receiver remains bound by the original ownership attribution.

### A Publisher Owns the Semantics of Everything It Conveys

Rejected. A hypothetical publisher may convey information without becoming the owner of its capability-governed
meaning. Publication is not semantic ownership or authority creation.

### A Receiver Owns the Semantics of Everything It Receives

Rejected. Receipt does not transfer ownership or authorize reinterpretation of information governed by another
capability.

### An Intermediary or Broker Owns Conveyed Information

Rejected. A hypothetical intermediary or broker would be an execution participant, not the semantic owner of the
information it conveys.

### Delivery Constitutes Retrieval

Rejected. Retrieval initiation, request meaning, and result meaning remain governed by their accepted owners. Delivery
alone does not perform or redefine retrieval.

### Receipt Constitutes Verification

Rejected. Authority verification remains with the issuing source capability. Receipt does not verify authority or
replace issuer-owned verification.

### Delivery Renews Authorization

Rejected. Authorization semantics remain Security-owned. Conveying an authorization artifact neither renews its
applicability nor creates a new authorization decision.

### Delay Refreshes Currentness

Rejected. Temporal passage or delayed availability does not establish source or contextual currentness. Historical
currentness is not present currentness.

### Delivery Constitutes Incorporation

Rejected. Context owns incorporation. Availability or receipt of evidence does not place it within a Context Revision.

### Distributed Coordination Creates Shared or Composite Authority

Rejected. Coordination across execution boundaries does not merge the authority of participating capabilities or
create a new authority origin.

### Asynchronous Failure Propagation Transfers Failure Ownership

Rejected. Propagation preserves a failure’s original capability ownership and semantic identity regardless of temporal
or deployment separation.

### Late Delivery May Enrich a Context Revision Whose Incorporated-Reference Set Is Stable or Whose Lifecycle State Is Active

Rejected. The incorporated-reference set becomes fixed at its accepted stability boundary, and an Active Context
Revision is immutable. Late evidence cannot reopen either boundary.

### Redelivery Constitutes Replay

Rejected. Repeated conveyance is not automatically reproduction of a historical architectural outcome under D-026.
Replay remains a distinct preservation and reproduction concern.

### Asynchronous Continuation Constitutes a New Cognitive Execution

Rejected. Temporal continuation alone does not initiate a new Brain-owned orchestration. A new cognitive execution
must remain a distinct architectural concern.

### Deployment Topology Determines Ownership

Rejected. Process, service, host, or deployment placement describes execution location rather than semantic
responsibility.

### Providers or Transports Determine Architecture

Rejected. Hypothetical providers and transports are replaceable execution concerns and cannot assign or redefine
architectural ownership.

## Recommended Decision

Asynchronous, event-driven, and distributed execution may realize the accepted cognitive-reference collaboration only
while preserving every ownership, authority, authorization, currentness, incorporation, lifecycle, failure,
composition, custody, orchestration, and final-result boundary established by D-001 through D-026.

Context retains ownership of collaboration, Context Revision identity and lineage, preparation, validation,
activation, incorporated-reference-set stability, immutability, contextual currentness, incorporation, and candidate-
revision consequences. Delayed output cannot reopen, enrich, replace, or mutate a Context Revision whose incorporated-
reference set is stable or whose lifecycle state is Active. Later consideration of delayed evidence requires a
separate Context-owned preparation concern where applicable.

Source capabilities retain the semantics of the references or source results they produce within their source
boundaries, authority origin, authority verification, authority preservation, lifecycle, and source currentness.
Publication, conveyance, delivery, receipt,
redelivery, delay, process location, and deployment location do not transfer those responsibilities or create
replacement authority.

Security retains authorization semantics. Applicable protected boundaries retain enforcement responsibility. Delivery
or receipt of an authorization artifact does not establish, renew, extend, or reinterpret authorization.

Capability-owned failures retain their ownership and semantic identity during asynchronous propagation and across
process or deployment boundaries. Propagation does not make any hypothetical sender, receiver, intermediary, provider,
or transport the owner of the failure.

Brain retains outer orchestration, stage precedence, final-result assembly, and ownership of the final cognitive
result as a Brain-owned orchestration outcome. Asynchronous continuation does not automatically initiate a new cognitive
execution or transfer orchestration ownership.

Bootstrap retains composition ownership. Core retains custody of approved shared architectural language and Contracts.
Execution topology, process placement, deployment placement, or hypothetical conveyance mechanisms do not acquire or
redistribute either responsibility.

Persistence, reconstruction, and replay retain the D-026 ownership and attribution boundary. Redelivery is not
automatically replay, and asynchronous continuation is not automatically reconstruction.

Asynchronous is not ownerless. Distributed is not shared ownership. Publication is not authority creation. Conveyance
is not semantic interpretation. Delivery is not retrieval. Receipt is not verification. Delay is not currentness.
Delivery is not incorporation. Redelivery is not automatically replay. Continuation is not automatically refresh,
recollection, a repeated Context cycle, new Context preparation, or a new cognitive execution.

This decision does not resolve refresh, recollection, repeated Context cycles, or configurable retrieval policy. Those
concerns remain reserved for D-028 and D-029.

## Rationale

The selected boundary preserves D-001 through D-026 by making accepted architectural ownership independent of
execution characteristics. Moving collaboration across time, processes, or deployment locations changes neither the
meaning of the collaboration nor the capability responsible for that meaning.

Context ownership and revision immutability remain intact because temporal delay does not create lifecycle authority.
A late output cannot alter a closed evidence boundary, reopen a stable incorporated-reference set, or mutate an Active
Context Revision. Any later consideration remains a separate Context-owned preparation concern rather than an implicit
modification.

Source semantics and authority remain with the issuing capabilities. Execution placement is not semantic ownership,
and publication or delivery is not authority creation. Conveyance preserves attribution without permitting
hypothetical execution participants to reinterpret, reissue, verify, or acquire source meaning.

Retrieval semantics remain unchanged because delivery is not retrieval. Context retains retrieval initiation and
request meaning, while the participating source retains the meaning and boundary of its returned result. A delivery
mechanism cannot infer or redefine either responsibility from the fact that it conveys information.

Currentness ownership remains unchanged because delay is not currentness. Source capabilities continue to determine
source currentness, while Context continues to determine contextual currentness. Neither delivery time nor deployment
location establishes that retained or delayed information remains suitable.

Security authorization and enforcement remain intact. Receipt is not verification, and delivery is not renewed
authorization. Security retains authorization semantics, while applicable protected boundaries retain enforcement
responsibility without acquiring those semantics.

Failure ownership and propagation remain separate. Asynchronous propagation is not failure transfer: temporal or
deployment separation may affect how a failure is conveyed, but it does not alter the responsibility whose failure
meaning is represented.

Bootstrap composition remains distinct from execution topology. Bootstrap continues to compose approved capability
relationships, while a possible distributed realization cannot redefine composition through deployment arrangement.
Core custody likewise remains limited to approved shared architectural language and Contracts and is not expanded by
execution characteristics.

Brain orchestration and final-result ownership remain unchanged. Asynchronous continuation may participate in an
accepted collaboration without becoming outer orchestration or a new cognitive execution. Brain continues to own stage
precedence, final-result assembly, and the final cognitive result as a Brain-owned orchestration outcome.

The D-026 persistence, reconstruction, and replay boundary remains intact because delivery and redelivery do not
themselves determine whether historical evidence has been retained, reconstructed, or exactly replayed. Attribution
remains with the original architectural owners.

Deterministic reasoning is preserved because a reasoning cycle continues to consume one authoritative Context
Revision. Delayed evidence cannot silently change that revision or its fixed incorporated-reference set.

Historical integrity is preserved by preventing delayed delivery, receipt, or redelivery from rewriting the meaning,
authority, authorization, currentness, incorporation, failure, or outcome represented by historical evidence.

Future deployment flexibility is preserved because accepted collaboration may later be realized using different
execution characteristics without changing the architecture’s ownership model. Execution-model neutrality allows
implementations to evolve without redistributing semantic responsibility.

Future source extensibility is preserved because every source retains its own semantics, authority, lifecycle,
retrieval-result boundaries, and currentness regardless of temporal or deployment separation.

## Consequences

- Execution-model changes do not transfer ownership.
- Asynchrony does not create ownership.
- Distribution does not create shared ownership.
- Event-driven realization does not create event-owned semantics.
- Publication does not create authority.
- Delivery does not transfer semantic ownership.
- Receipt does not establish verification.
- Delivery does not renew authorization.
- Delay does not refresh source or contextual currentness.
- Delivery does not determine incorporation.
- Delivery does not constitute retrieval initiation.
- Delivery does not define retrieval-request or retrieval-result semantics.
- Redelivery is not automatically replay.
- Asynchronous continuation is not automatically reconstruction.
- Asynchronous continuation is not automatically refresh or recollection.
- Asynchronous continuation is not automatically a repeated Context cycle.
- Asynchronous continuation is not automatically a new cognitive execution.
- Intermediaries and transports do not own conveyed meaning.
- Deployment location does not determine architectural ownership.
- Distributed participation does not create shared, emergent, or composite authority.
- Failure ownership remains unchanged during asynchronous propagation.
- Late evidence does not reopen or mutate a Context Revision whose incorporated-reference set is stable or whose
  lifecycle state is Active.
- Later consideration of delayed evidence requires a distinct Context-owned preparation concern.
- Context, sources, Security, Brain, Bootstrap, and Core retain their accepted responsibilities.
- Persistence, reconstruction, and replay remain governed by D-026.
- D-028 and D-029 remain unresolved.
- No new capability or execution role is introduced.

This decision does not establish Event abstractions, Event semantics, Event schemas, publishers, subscribers, brokers,
queues, coordinators, workers, remote services, messages, correlation, ordering, consistency models, delivery
guarantees, retries, deduplication, idempotency, serialization, protocols, messaging or deployment topology,
distributed transactions, runtime sequencing, refresh, recollection, repeated Context cycles, configurable retrieval
policy, concrete Contracts, APIs, providers, transports, or implementation mechanisms.

## Deferred Implications

- Event abstractions remain unresolved.
- Event semantics remain unresolved.
- Event schemas remain unresolved.
- Publishers remain unresolved.
- Subscribers remain unresolved.
- Brokers remain unresolved.
- Queues remain unresolved.
- Coordinators remain unresolved.
- Messages remain unresolved.
- Correlation remains unresolved.
- Ordering remains unresolved.
- Consistency models remain unresolved.
- Delivery guarantees remain unresolved.
- Retries remain unresolved.
- Deduplication remains unresolved.
- Idempotency remains unresolved.
- Serialization remains unresolved.
- Protocols remain unresolved.
- Deployment topology remains unresolved.
- Distributed transactions remain unresolved.
- Refresh remains unresolved.
- Recollection remains unresolved.
- Repeated Context cycles remain unresolved.
- Configurable retrieval policy remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Should future normative architecture establish an Event abstraction for this collaboration?
- Which Event semantics or schemas, if any, will later be authorized?
- Which execution participants or roles, if any, will future normative architecture recognize?
- Which message, correlation, ordering, consistency, delivery, retry, deduplication, or idempotency requirements will
  apply?

- Which serialization and execution protocols, if any, will later be authorized?
- Which messaging or deployment topology, if any, will realize the accepted collaboration?
- Whether and how distributed transactions may participate remains unresolved.
- How will refresh, recollection, and repeated Context cycles remain distinguishable from asynchronous continuation
  and late delivery?

- How will configurable retrieval policy operate across asynchronous or distributed boundaries without changing
  ownership?

- What runtime sequencing and implementation mechanisms will realize this boundary after normative approval?

# 15.3 D-028 — Refresh, Recollection, and Repeated Context Cycle Ownership Boundary

## Decision

This decision resolves how source information may be refreshed, cognitive references may be recollected, or Context
preparation may be repeated without mutating an existing Context Revision whose incorporated-reference set is stable or
whose lifecycle state is Active, reusing historical
authority as present authority, or transferring retrieval, source semantics, authority, authorization, currentness,
incorporation, Context lifecycle, failure, orchestration, composition, or final-result ownership.

Refresh, recollection, and repeated Context cycles are architectural situations or lifecycle concerns. They are not
capabilities, architectural participants, semantic owners, authority owners, authorization owners, or lifecycle
owners. They preserve existing ownership boundaries rather than introducing new ones.

Refresh concerns later consideration of source-owned information. It does not create semantic ownership, renew
authority, repeat authority verification, renew authorization, or automatically establish source or contextual
currentness. Source capabilities retain responsibility for source currentness, while Context retains responsibility
for contextual currentness.

Recollection concerns obtaining candidate references for a later Context preparation. It is not incorporation and does
not reopen, enrich, replace, or mutate an existing Context Revision. Context retains retrieval initiation, request
meaning, and the architectural semantics of the aggregate returned set made available for Context consideration; each
participating source retains the semantics of the references or source result it produces within its source boundary;
and Context retains incorporation.

Repeated Context preparation is a distinct Context-owned preparation concern that produces a distinct Context
Revision. It does not continue or mutate a historical revision. A meaningful change requires a new Context Revision,
and historical revisions remain immutable.

A historical Context Revision is a previously prepared revision whose identity, lineage relationship, incorporated-
reference set, and lifecycle history remain governed by Context. Present Context preparation is a separate concern and
does not inherit present authority, authorization, or currentness merely from a historical revision.

Historical references do not become presently authoritative merely because they were previously incorporated.
Historical authority remains attributable to its original source and historical architectural conditions. Historical
authorization does not become present authorization, and historical currentness does not establish present source or
contextual currentness.

Logical reconstruction and exact replay remain governed by D-026. Refresh, recollection, and repeated Context
preparation do not constitute reconstruction or replay.

Asynchronous continuation and delayed delivery remain governed by D-027. Refresh and recollection do not constitute
asynchronous continuation, and delayed delivery does not by itself constitute refresh or recollection.

A repeated Context cycle is not automatically the same cognitive execution and does not automatically establish a new
cognitive execution. Any relationship to a later Brain-owned cognitive execution remains a distinct architectural
concern. Brain retains orchestration and ownership of each final cognitive result as a Brain-owned orchestration
outcome.

Capability-owned failures retain their ownership and semantic identity when refresh, recollection, or repeated
preparation is considered. These situations do not become failure owners or reinterpret failures.

This decision does not define scheduling, polling, timers, cron, triggers, refresh intervals, automation, runtime
sequencing, Contracts, schemas, APIs, algorithms, providers, transports, or implementation mechanisms.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation
authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Refresh, Recollection, and Repeated Context Preparation Preserve Accepted Ownership

Accepted. These situations may occur only within the ownership boundaries already established for Context, sources,
Security, Brain, Bootstrap, Core, and capability-owned failures.

### Refresh Renews Authority

Rejected. Authority remains attributable to its accepted source owner. Later consideration of source information does
not renew, recreate, or replace authority.

### Refresh Renews Authorization

Rejected. Authorization semantics remain Security-owned. Refresh does not make a historical authorization decision
presently applicable.

### Refresh Renews Currentness

Rejected. Refresh does not automatically establish source or contextual currentness. Each currentness determination
remains with its accepted owner.

### Recollection Constitutes Incorporation

Rejected. Recollection makes candidate references available for later Context consideration. Context separately owns
the semantic decision to incorporate a reference.

### Recollection Reopens a Context Revision

Rejected. A stable incorporated-reference set cannot be reopened, and an Active Context Revision is immutable. Later
evidence belongs, where applicable, to distinct Context preparation.

### Repeated Context Preparation Continues an Existing Context Revision

Rejected. Meaningful change creates a distinct revision within the accepted lineage model rather than extending or
mutating a historical revision.

### Repeated Context Preparation Is Replay

Rejected. Replay reproduces a historical architectural outcome under D-026. Repeated Context preparation creates a distinct
Context Revision and does not reproduce the original outcome as exact replay.

### Repeated Context Preparation Is Reconstruction

Rejected. Logical reconstruction represents an earlier architectural state or outcome from retained evidence. Repeated
preparation establishes a distinct present Context concern.

### Refresh Creates a New Semantic Owner

Rejected. Refresh is an architectural situation, not a capability or participant, and cannot own source, Context,
Security, or other capability semantics.

### Historical Authorization Applies Automatically

Rejected. A historical Security-owned authorization artifact does not establish authorization applicable to later
protected participation.

### Historical Authority Applies Automatically

Rejected. Historical evidence of authority does not independently establish present authority or replace required
source-owned authority semantics.

### Historical Currentness Applies Automatically

Rejected. Historical source or contextual currentness records an earlier determination and does not establish
suitability under present conditions.

### A Scheduler Determines Architectural Ownership

Rejected. A hypothetical scheduler would be a runtime mechanism. Runtime initiation or timing cannot assign or
redefine architectural ownership.

### Automation Becomes the Owner of Refresh

Rejected. Automation cannot acquire the source, Context, Security, or orchestration semantics implicated by later
consideration merely because it may initiate a runtime mechanism.

### Runtime Mechanisms Determine Architectural Ownership

Rejected. Architectural ownership is established by accepted capability responsibilities and remains independent of
scheduling, triggering, timing, deployment, or implementation.

## Recommended Decision

Refresh, recollection, and repeated Context preparation preserve all ownership boundaries established by D-001 through
D-027. They introduce no capability, participant, semantic owner, authority owner, authorization owner, or lifecycle
owner.

Context retains ownership of every Context Revision, including identity, lineage, preparation, validation, activation,
incorporated-reference-set stability, immutability, contextual currentness, incorporation, and candidate-revision
consequences. A repeated Context preparation creates a distinct Context Revision. It does not reopen, continue,
enrich, replace, or mutate a historical revision.

Historical Context Revisions remain immutable. Historical authority, authorization, and currentness remain historical
and attributable to their accepted owners and architectural conditions. Their prior applicability does not
automatically establish present applicability.

Source capabilities retain the semantics of the references or source results they produce within their source
boundaries, authority origin, authority verification, authority preservation, lifecycle, and source currentness.
Refresh is not verification and does not automatically
establish that source information is current.

Context retains retrieval initiation, request meaning, and the architectural semantics of the aggregate returned set
made available for Context consideration. Each participating source retains the semantics of the references or source
result it produces within its source boundary. Recollection makes candidate references available for a later
Context-owned preparation concern but is not
incorporation. Context alone retains incorporation ownership.

Security retains authorization semantics. Historical authorization is not renewed permission, and refresh,
recollection, or repeated Context preparation does not renew or reinterpret a Security-owned decision. Applicable protected
boundaries retain enforcement responsibility.

Capability-owned failures retain their ownership and semantic identity. Refresh, recollection, and repeated Context
preparation neither acquire failure ownership nor reinterpret a historical or present failure.

Brain retains outer orchestration, stage precedence, and ownership and assembly of the final cognitive result as a
Brain-owned orchestration outcome. A repeated Context cycle is not automatically the same cognitive execution or a new
cognitive execution.

Bootstrap retains composition ownership. Core retains custody of approved shared architectural language and Contracts.
Neither responsibility changes because later source consideration or Context preparation occurs.

Reconstruction and replay remain governed by D-026. Repeated Context preparation is neither reconstruction nor replay.
Asynchronous continuation and delayed delivery remain governed by D-027. Repeated Context preparation is not continuation, and
refresh or recollection is not implied by delivery or delay.

Refresh is not ownership. Recollection is not ownership. Repeated Context preparation is not ownership. Refresh is not
verification. Recollection is not incorporation. Repeated Context preparation is not replay, reconstruction, or continuation.
New preparation is not mutation of a historical revision.

This decision does not resolve configurable retrieval policy. That concern remains reserved for D-029.

## Rationale

The selected boundary preserves D-001 through D-027 by treating refresh, recollection, and repeated Context
preparation as situations governed by existing owners rather than as new architectural participants.

Context ownership remains intact because later consideration of evidence does not reopen a historical Context
Revision. Context continues to own revision identity, lineage, preparation, validation, activation, incorporated-
reference-set stability, contextual currentness, incorporation, and lifecycle. Repeated Context preparation creates a new
revision because meaningful change must be represented through a distinct identity rather than mutation.

Source semantics remain intact because refreshing is not renewing authority. Each source capability continues to own
the semantics of the references or source result it produces within its source boundary, authority origin,
verification, preservation, lifecycle, and source currentness. Neither prior incorporation nor later availability
transfers those responsibilities.

Authority origin, verification, and preservation remain separate from refresh. Refresh may concern later source
information, but it does not reissue a reference, recreate its authority, or repeat issuer-owned verification merely
by occurring.

Retrieval boundaries remain unchanged. Context retains retrieval initiation, request meaning, and the architectural
semantics of the aggregate returned set made available for Context consideration, while each source retains the
semantics of the references or source result it produces within its source boundary. Recollection describes candidate-
reference availability for later preparation; it does not acquire either side of the retrieval relationship.

Currentness ownership remains unchanged because historical currentness is not present currentness. A prior source-
current determination does not establish later source currentness, and a prior contextual-currentness determination
does not establish suitability for a distinct Context Revision. Each later determination remains with its accepted
owner.

Security authorization ownership remains intact because historical authorization is not present authorization.
Refresh, recollection, or repeated Context preparation cannot renew a historical decision or establish its applicability to
later protected participation.

Failure ownership remains with the capability whose accepted responsibility failed. Repeating preparation or later
considering source information does not transfer or reinterpret a historical or newly arising failure.

Bootstrap composition and Core custody remain unchanged because later Context preparation does not alter the accepted
capability graph or transfer shared architectural language into another owner.

Brain orchestration and final-result ownership remain intact. A distinct Context Revision does not by itself determine
whether a new cognitive execution occurs. When an accepted orchestration produces a final cognitive result as a
Brain-owned orchestration outcome, Brain retains ownership of that result as established by D-025.

D-026 remains preserved because repeated Context preparation creates a distinct revision rather than reconstructing or
replaying a historical outcome. D-027 remains preserved because delayed delivery and asynchronous continuation do not
automatically become refresh, recollection, or repeated Context preparation.

Context Revision immutability preserves historical and diagnostic integrity. A historical revision continues to
represent its original evidence boundary and preparation history. Later evidence is considered through a new revision
rather than retroactively changing that record.

Deterministic reasoning remains possible because each reasoning cycle consumes exactly one authoritative Context
Revision. A repeated cycle supplies a distinct revision rather than silently altering the revision used by an earlier
cycle.

Future extensibility is preserved because sources, execution models, and implementation mechanisms may evolve without
changing the ownership of source semantics, Context preparation, authorization, orchestration, composition, or shared
architectural language.

## Consequences

- Refresh does not create ownership.
- Recollection does not create ownership.
- Repeated Context preparation does not create ownership.
- Refresh does not renew authority.
- Refresh does not renew authorization.
- Refresh does not refresh source or contextual currentness automatically.
- Refresh does not constitute authority verification.
- Recollection does not constitute incorporation.
- Recollection does not reopen, enrich, replace, or mutate a Context Revision.
- Repeated Context preparation creates a distinct Context Revision.
- Meaningful change requires a new Context Revision.
- Historical revisions remain immutable.
- Historical authority remains historical.
- Historical authorization remains historical.
- Historical currentness remains historical.
- Previously incorporated references do not become presently authoritative merely because of that incorporation.
- Reconstruction and replay remain unchanged and governed by D-026.
- Asynchronous continuation and delayed delivery remain unchanged and governed by D-027.
- Refresh and recollection are not reconstruction or replay.
- Refresh and recollection are not asynchronous continuation.
- A repeated Context cycle is not automatically the same cognitive execution.
- A repeated Context cycle does not automatically establish a new cognitive execution.
- Failure ownership and semantic identity remain unchanged.
- Context, sources, Security, Brain, Bootstrap, and Core retain their accepted responsibilities.
- D-029 remains unresolved.
- No new capability or architectural participant is introduced.

This decision does not establish scheduling, polling, timers, cron, triggers, refresh intervals, automation behavior,
configurable retrieval policy, retrieval configuration, ranking, relevance, selection, runtime sequencing, Contracts,
schemas, APIs, algorithms, providers, transports, deployment, or implementation mechanisms.

## Deferred Implications

- Scheduling remains unresolved.
- Polling remains unresolved.
- Timers remain unresolved.
- Triggers remain unresolved.
- Automation remains unresolved.
- Configurable retrieval policy remains unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- What future normative authority, if any, will establish when later source consideration or repeated Context
  preparation is appropriate?

- Which scheduling, polling, timer, trigger, or automation mechanisms, if any, will later be authorized?
- How will a later cognitive execution, when separately authorized, relate to a distinct Context Revision?
- Which configurable retrieval policies may govern later candidate-reference requests without changing accepted
  ownership?

- What runtime sequencing and implementation mechanisms will realize repeated Context preparation after normative
  approval?

# 15.4 D-029 — Configurable Retrieval Policy Ownership Boundary

## Decision

This decision resolves how retrieval relevance, ranking, selection, and related retrieval criteria may be configurable
without configurable policy becoming a semantic owner, overriding Context-owned retrieval-request and incorporation
meaning, redefining source-owned retrieval-result boundaries, bypassing source authority or Security authorization,
determining currentness outside its accepted owner, mutating Context Revisions, or acquiring failure, orchestration,
composition, custody, or final-result ownership.

Configurable retrieval criteria are parameters or constraints that may influence decisions already owned by an
accepted capability. They do not constitute an independent architectural responsibility. Configuration may constrain
or parameterize a decision only within the boundary of the accepted capability that already owns that decision.

Configurable retrieval policy is not a capability, semantic owner, authority owner, authorization owner, currentness
owner, incorporation owner, orchestration owner, composition owner, or final-result owner. It does not create shared
ownership, composite authority, a policy authority, or an alternate retrieval owner.

Context may apply configurable criteria only within Context-owned collaboration, retrieval initiation, retrieval-
request meaning, relevance, the architectural semantics of the aggregate returned set made available for Context
consideration, contextual currentness, incorporation, and Context Revision preparation boundaries. Configuration cannot
redefine what a Context request means or transfer any of those responsibilities outside Context.

A source capability may apply configurable criteria only within its own source-owned semantic interpretation,
retrieval execution, the semantics of the references or source result it produces within its source boundary,
lifecycle, and source-currentness responsibilities.
Configuration cannot redefine the semantic meaning or authority of a source-issued reference or merge source
responsibilities with Context responsibilities.

Relevance concerns suitability within the decision boundary of the capability applying it. Relevance does not
establish authority, authorization, currentness, or incorporation.

Ranking orders or evaluates candidates within an already owned decision boundary. Ranking does not establish
authority, constitute authority verification, establish authorization, or determine source or contextual currentness.

Candidate selection identifies candidates under an applicable capability-owned boundary. Selection does not constitute
incorporation unless Context separately makes the incorporation decision within its accepted responsibility.

Contextual currentness remains Context-owned. Source currentness remains source-owned. Authority origin, verification,
and preservation remain source-owned. Authorization semantics remain Security-owned, and applicable protected
boundaries retain enforcement responsibility.

Source participation preference does not bypass Security authorization. Policy configuration cannot establish, renew,
broaden, or replace a Security-owned authorization decision.

Policy evaluation is the application of configured criteria within an already owned capability decision. It is not
semantic authority and does not transfer, merge, replace, or reinterpret ownership. A configurable-policy failure
remains owned by the capability responsibility whose evaluation failed.

Configuration administration concerns hypothetical future management of configuration. It does not assign
architectural ownership. Hypothetical administrators, providers, consumers, evaluators, transports, or runtime
mechanisms do not determine the ownership of any configured decision.

Configuration changes cannot reopen, enrich, replace, or mutate a Context Revision whose incorporated-reference set is
stable or whose lifecycle state is Active. Later configuration may affect only later Context-owned preparation where
applicable.

This decision does not define concrete relevance rules, ranking formulas, selection algorithms, thresholds, weights,
source-priority lists, policy languages, configuration schemas or files, administration models, policy stores, APIs,
runtime sequencing, or implementation mechanisms.

## Status

Accepted for ADR preparation.

This status records a non-normative architectural conclusion for future formalization. It grants no implementation
authority and does not replace an approved ADR or specification.

## Alternatives Considered

### Configurable Criteria Operate Only Within Existing Capability-Owned Decision Boundaries

Accepted. Configuration may influence an accepted capability’s decisions without becoming their owner or altering the
ownership of adjacent responsibilities.

### Configurable Policy Becomes an Independent Retrieval Owner

Rejected. Policy is not a capability or architectural participant. Independent ownership would create an alternate
retrieval authority and conflict with Context and source responsibilities.

### A Shared Policy Owns Context and Source Retrieval Semantics

Rejected. Context request meaning and source interpretation or result meaning are distinct responsibilities. Shared
policy ownership would merge those boundaries and obscure accountability.

### Policy Overrides Context Request Meaning

Rejected. Context owns retrieval-request semantics. Configuration may parameterize Context’s decision only within that
ownership boundary and cannot redefine its meaning externally.

### Policy Redefines Source-Reference or Source-Result Semantics

Rejected. Each source owns the semantics of the references or source result it produces within its source boundary.

### Ranking Establishes Authority

Rejected. Ordering candidates does not establish their semantic origin, provenance, authority, or entitlement to be
treated as authoritative.

### Ranking Substitutes for Verification

Rejected. Authority verification remains with the issuing source capability. Comparative position or score cannot
verify a source-issued reference.

### Ranking Establishes Currentness

Rejected. Ranking does not determine source or contextual currentness. Those decisions remain with their respective
accepted owners.

### Ranking Establishes Authorization

Rejected. Ranking expresses no Security-owned authorization decision and cannot permit protected participation.

### Selection Constitutes Incorporation

Rejected. Candidate selection and Context incorporation are distinct decisions. Context must separately determine
incorporation.

### Policy Bypasses Protected-Boundary Enforcement

Rejected. Configuration cannot override Security-owned authorization semantics or the enforcement responsibility of an
applicable protected boundary.

### Policy Changes Mutate an Existing Context Revision

Rejected. A stable incorporated-reference set cannot be reopened, and an Active Context Revision is immutable. Later
configuration may apply only to later Context preparation where applicable.

### Policy Failures Become Policy-Owned

Rejected. Policy is not a semantic owner. A failure remains owned by the accepted capability responsibility whose
configured evaluation failed.

### Administrators Determine Architectural Ownership

Rejected. Hypothetical administrators may later manage configuration but cannot assign or transfer capability
ownership.

### Configuration Providers Determine Architectural Ownership

Rejected. Hypothetical providers are replaceable implementation concerns and cannot define the architecture whose
configuration they supply.

### Consumers Determine Retrieval Policy Ownership

Rejected. Consumption or configuration preference does not confer ownership of retrieval semantics, authority,
authorization, currentness, or incorporation.

### Runtime Mechanisms Determine Architectural Ownership

Rejected. Evaluation placement and implementation mechanism do not establish semantic responsibility.

### Configuration Creates Composite or Emergent Authority

Rejected. Combining configurable criteria or outputs does not merge source authorities or create a new authority
origin.

## Recommended Decision

Configurable retrieval policy may parameterize only decisions already owned by an accepted capability. Configuration
does not create a new capability, semantic owner, authority owner, authorization owner, currentness owner,
incorporation owner, orchestration owner, composition owner, custody owner, final-result owner, shared owner,
composite authority, or alternate retrieval owner.

Context retains ownership of collaboration, retrieval initiation, retrieval-request meaning, the architectural
semantics of the aggregate returned set made available for Context consideration, contextual currentness,
incorporation, Context Revision preparation, identity, lineage, validation, activation, incorporated-reference-set
stability, immutability, and candidate-revision consequences.

Context may apply configurable relevance, ranking, selection, or related criteria only within those Context-owned
decisions. Configuration cannot redefine what a Context request means, convert candidate selection into incorporation,
or transfer Context responsibility to a policy or another participant.

Source capabilities retain semantic ownership, authority origin, authority verification, authority preservation,
lifecycle, retrieval interpretation and execution within their domains, the semantics of the references or source
results they produce within their source boundaries, and source currentness.

A source may apply configurable criteria only within those source-owned decisions. Configuration cannot redefine the
meaning or authority of a source-issued reference, replace source-owned verification, or transfer source
responsibility to Context or a policy.

Security retains authorization semantics. Applicable protected boundaries retain enforcement responsibility. Source
preference, relevance, ranking, or selection cannot establish authorization or bypass enforcement.

Capability-owned failures retain their ownership and semantic identity. A failure associated with configured
evaluation belongs to the capability responsibility whose evaluation failed; it does not become policy-owned or
configuration-owned.

Brain retains outer orchestration, stage precedence, final-result assembly, and final-result ownership. Bootstrap
retains composition ownership. Core retains custody of approved shared architectural language and Contracts.
Configurable policy does not acquire or redistribute those responsibilities.

D-026’s persistence, reconstruction, and replay boundary remains unchanged. D-027’s asynchronous, event-driven, and
distributed execution boundary remains unchanged. D-028’s refresh, recollection, repeated Context preparation, and
revision-immutability boundary remains unchanged.

Policy configuration cannot mint authority, renew authorization, establish currentness, replace verification, or
perform incorporation. Policy changes cannot reopen or mutate a Context Revision whose incorporated-reference set is
stable or whose lifecycle state is Active. Later configuration may affect only later Context-owned preparation where
applicable.

Configuration is not ownership. Policy evaluation is not semantic authority. Relevance is not authority. Ranking is
not verification. Selection is not incorporation. Preference is not authorization. Configuration change is not Context
mutation. Configuration administration is not architectural ownership.

## Rationale

The selected boundary preserves D-001 through D-028 by making configurable behavior subordinate to architectural
ownership. Configuration may influence a decision only inside the boundary of the capability already responsible for
that decision.

Context ownership remains intact because Context continues to determine retrieval initiation, request meaning, the
architectural semantics of the aggregate returned set made available for Context consideration, contextual currentness,
incorporation, and Context Revision preparation. Configurable criteria may parameterize those decisions but cannot
replace or reinterpret them.

Source semantic ownership remains intact because each source continues to interpret requests within its domain and
determine the meaning and boundary of what it can return. Context criteria and source interpretation remain distinct:
a configured Context request cannot dictate source semantics, and source-side configuration cannot acquire Context
incorporation authority.

Authority origin, verification, and preservation remain source-owned. Ranking cannot produce trust because relative
order, weight, preference, or selection does not establish provenance or source authority. Ranking cannot replace
issuer-owned verification.

Retrieval ownership and meaning remain separated across the accepted boundary. Context owns the request and the
architectural semantics of the aggregate returned set made available for Context consideration, while each
participating source owns the semantics of the references or source result it produces within its source boundary.
Configuration cannot merge those responsibilities into a shared policy.

Currentness ownership remains unchanged. Source configuration cannot make a reference source-current merely by
selecting or ranking it, and Context configuration cannot make it contextually current without the separate Context-
owned determination.

Security authorization and enforcement remain intact. Preference is not authorization, and policy configuration cannot
bypass an applicable protected boundary. Authorization remains a Security-owned semantic decision regardless of how
desirable or highly ranked a source appears.

Failure ownership remains with the capability whose accepted responsibility failed. A configured evaluation may
influence where a failure arises, but configuration does not become a semantic participant capable of owning that
failure.

Context Revision stability and immutability remain protected because policy changes apply prospectively. They cannot
retroactively alter the request criteria, candidate set, currentness determination, incorporation decision, or
evidence boundary of a revision whose incorporated-reference set is stable or whose lifecycle state is Active.

Bootstrap composition remains distinct from configuration. Configuration cannot select architectural ownership or
restructure approved capability relationships merely by affecting parameters. Core custody remains limited to approved
shared architectural language and Contracts and does not extend to ownership of policy meaning or configured
capability decisions.

Brain orchestration and final-result ownership remain unchanged. Configurable retrieval criteria may influence
capability-owned outputs used within an accepted orchestration, but they do not acquire stage precedence,
orchestration meaning, assembly responsibility, or ownership of the final cognitive result as a Brain-owned
orchestration outcome.

The D-026 through D-028 boundaries remain preserved because policy configuration does not become persistence, replay,
reconstruction, an execution model, refresh, recollection, or repeated Context preparation. Those concerns retain their
accepted distinctions and ownership constraints.

Deterministic reasoning remains possible because a reasoning cycle continues to consume one authoritative Context
Revision with a stable incorporated-reference set. Later policy changes affect future preparation rather than
rewriting the revision already used.

Future extensibility is preserved because capabilities may later support different configurable criteria without
creating a central policy owner or coupling source meaning, Context meaning, Security authorization, and orchestration
into one responsibility.

## Consequences

- Configurable retrieval policy does not create ownership.
- Configurable retrieval policy does not create a new capability.
- Configurable retrieval policy does not create shared ownership, composite authority, or an alternate retrieval
  owner.

- Context retains retrieval-request semantics.
- Context retains the architectural semantics of the aggregate returned set made available for Context consideration.
- Each source retains retrieval interpretation and the semantics of the references or source result it produces within
  its source boundary.
- Configuration does not merge Context and source responsibilities.
- Configuration cannot redefine the meaning of a Context request.
- Configuration cannot redefine the semantic meaning or authority of a source-issued reference.
- Relevance does not establish authority.
- Ranking does not establish authority.
- Ranking does not constitute authority verification.
- Ranking does not establish authorization.
- Ranking does not establish source or contextual currentness.
- Selection does not constitute incorporation.
- Source preference does not bypass Security authorization.
- Applicable protected boundaries retain enforcement responsibility.
- Policy changes do not reopen or mutate a Context Revision whose incorporated-reference set is stable or whose
  lifecycle state is Active.
- Later policy changes may affect only later Context preparation where applicable.
- Policy-related failures remain capability-owned.
- Administrators, providers, consumers, evaluators, transports, and runtime mechanisms do not determine architectural
  ownership.

- Context, sources, Security, Brain, Bootstrap, and Core retain their accepted responsibilities.
- D-026 through D-028 remain unchanged.
- No new capability or architectural participant is introduced.

This decision does not establish concrete policy content, relevance rules, ranking rules or formulas, selection rules
or algorithms, thresholds, weights, source-priority rules or lists, policy precedence, policy conflict resolution,
configuration authority, configuration administration, policy lifecycle, policy versioning, policy persistence,
policy-evaluation timing, configuration schemas or files, policy languages, administration models, policy stores,
Contracts, APIs, runtime sequencing, providers, transports, or implementation mechanisms.

## Deferred Implications

- Concrete policy content remains unresolved.
- Relevance rules remain unresolved.
- Ranking rules remain unresolved.
- Selection rules remain unresolved.
- Thresholds remain unresolved.
- Weights remain unresolved.
- Source-priority rules remain unresolved.
- Policy precedence remains unresolved.
- Policy conflict resolution remains unresolved.
- Configuration authority remains unresolved.
- Configuration administration remains unresolved.
- Policy lifecycle remains unresolved.
- Policy versioning remains unresolved.
- Policy persistence remains unresolved.
- Policy-evaluation timing remains unresolved.
- Configuration schemas remain unresolved.
- Policy languages remain unresolved.
- APIs remain unresolved.
- Runtime sequencing remains unresolved.
- Implementation mechanisms remain unresolved.

## Open Questions

- Which concrete relevance, ranking, selection, threshold, weight, or source-priority rules will future normative
  architecture permit?

- Which precedence and conflict-resolution rules will apply when multiple configurations influence one capability-
  owned decision?

- Who may administer configuration, and under what future authorization model?
- Which lifecycle, versioning, and persistence requirements will apply to configuration?
- At what point may configured criteria be evaluated within each capability-owned boundary?
- Which configuration schemas, policy languages, Contracts, or APIs, if any, will later be authorized?
- What runtime sequencing and implementation mechanisms will realize configurable retrieval policy after normative
  approval?
