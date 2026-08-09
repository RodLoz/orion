# ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Draft                 |
| **Version**       | 0.1.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-04            |
| **Updated**       | 2026-08-04            |
| **Decision Type** | Architecture Decision |

---

# Context

Context is prepared from cognitive references supplied by independent capability domains. Those sources retain their established semantics, lifecycles, and reference authority while Context determines which available references participate in a Context Revision. ADR-0008 records the provisional ownership and authority predecessor for that collaboration and remains Draft at the time of this ADR.

The Context Model already governs Context Revision identity, lineage, lifecycle states, activation, and immutability. Within that model, collaboration needs a precise relationship to revision preparation. The incorporated references also need one unambiguous closure boundary so validation, activation, and downstream reasoning concern the same evidence. Later changes within a source domain need treatment that preserves both the source's independent lifecycle and the historical integrity of an existing Context Revision.

This ADR addresses those connected boundaries without redefining the terminology or lifecycle governed by the Context Model. It formalizes only the lifecycle distinctions derived from D-007 through D-009 in the non-normative source decision record.

# Problem Statement

Without an explicit preparation and stability boundary, reference collaboration could continue after activation, validation could evaluate a changing candidate, or downstream consumers could observe different evidence within one reasoning cycle. Treating independent reference immutability as aggregate stability would leave open whether references could still enter, leave, or change position within the Context Revision.

A later source-owned change creates a related ambiguity. Mutating the existing revision would rewrite its historical evidence, while ignoring the source change would disconnect future Context preparation from source-owned semantics. The architecture therefore needs one coherent account of preparation, incorporated-reference-set closure, and the effect of later source change.

# Decision

### Context Revision Preparation

1. Cognitive-reference collaboration MUST occur as part of preparation of a Context Revision.
2. Collaboration MUST complete before that revision becomes Active.
3. This participation MUST use the existing pre-activation lifecycle and MUST NOT introduce another Context lifecycle state. It does not assign collaboration to an exact lifecycle transition or prescribe an execution sequence.
4. Downstream reasoning MUST consume one completed Active Context Revision rather than an incrementally enriched evidence boundary or a parallel cognitive-evidence representation.
5. Participating source capabilities MUST retain their independent semantics and lifecycles throughout Context Revision preparation.

### Incorporated-Reference-Set Stability

1. The complete incorporated-reference set for a Context Revision MUST close before Context validation begins.
2. That set MUST remain unchanged through validation, activation, and downstream consumption.
3. Validation MUST evaluate the candidate Context Revision whose incorporated-reference set is already stable.
4. Activation MUST NOT create, complete, or alter the incorporated-reference set.
5. No reference MAY be added, removed, replaced, reordered, or substituted after the incorporated-reference-set stability boundary.
6. Source-reference immutability and aggregate Context incorporated-reference-set stability MUST remain distinct architectural concerns. Individual source-reference immutability MUST NOT be treated as sufficient to establish stability of the aggregate Context set.
7. Incorporated-reference-set stability MUST remain a property of one Context Revision within Context-owned composition and lifecycle responsibilities; it MUST NOT introduce a new Context lifecycle state.

### Later Source-Owned Change

1. A meaningful source-owned change MUST NOT mutate, rewrite, remove, or replace a reference already incorporated into a Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active.
2. The existing revision MUST remain an immutable historical record of the evidence accepted for its reasoning cycle.
3. The source capability MUST retain responsibility for its own semantic and lifecycle changes.
4. With respect to Context, a later source change MUST affect possible future eligibility or suitability; it MUST NOT alter the integrity of the historical Context Revision.
5. Later cognitive use of changed source evidence MUST require later Context-owned preparation and, where applicable, a distinct successor Context Revision. Context MUST retain responsibility for deciding whether that evidence participates in the later revision.
6. Source lifecycle change, reference authority, historical Context integrity, later contextual suitability, and Context Revision succession MUST remain distinct architectural concerns.

# Rationale

Locating collaboration within pre-activation preparation aligns it with Context-owned composition and incorporation while preserving the independent domains of participating sources. A completed Active Context Revision then presents one coherent contextual evidence boundary to reasoning instead of a representation that continues to accumulate references during use.

Closing the complete incorporated-reference set before validation gives validation a fixed candidate. Activation changes lifecycle status rather than completing composition, and downstream consumption concerns the evidence that validation evaluated. This placement also distinguishes the immutability of an individual source reference from stability of aggregate membership and ordering within Context.

Preserving an existing revision after a later source change protects historical and diagnostic integrity. The source can evolve according to its own semantics, while the revision continues to represent the evidence accepted for its reasoning cycle. Future preparation provides the architectural point at which changed source evidence can receive later contextual consideration.

The three boundaries work together: preparation identifies where collaboration participates, stability identifies when incorporation is complete for one revision, and later-change treatment prevents either source evolution or downstream coordination from reopening that completed evidence boundary.

# Alternatives Considered

## Collaboration after Activation

Rejected because post-activation collaboration would allow the evidence associated with an Active revision to change during or after its use.

## Collaboration outside the Context Revision Lifecycle

Rejected because an independent collaboration lifecycle would separate contextual evidence preparation from the revision that supplies its composition and relevance boundary.

## Incremental Enrichment of an Active Revision

Rejected because incremental enrichment would expose downstream reasoning to a changing evidence basis and compete with the single Active Context Revision.

## Reference-Set Changes during Validation

Rejected because validation would no longer evaluate the same candidate that later enters the Active state.

## Stability Only at Activation or Reasoning Time

Rejected because either point leaves validation operating over a candidate whose incorporated-reference set can still change.

## Source Change Mutating an Existing Revision

Rejected because in-place mutation, removal, replacement, or rewriting would alter the historical evidence accepted for the existing revision's reasoning cycle.

## Brain-Controlled or Bootstrap-Controlled Stability

Rejected because Brain orchestration and Bootstrap composition do not own Context Revision composition or lifecycle semantics.

## Source-Reference Immutability as Aggregate Context Stability

Rejected because immutable individual references do not close aggregate membership or ordering. The Context set could otherwise change while every individual source reference remained immutable.

# Consequences

- Context preparation has a defined relationship to cognitive-reference collaboration without gaining another lifecycle state.
- Validation, activation, and downstream consumption concern one unchanged incorporated-reference set.
- Activation is distinguishable from completion of the incorporated-reference set.
- Source domains can evolve without rewriting Context Revision history.
- Historical integrity is distinguishable from later contextual eligibility or suitability.
- A later preparation can consider changed source evidence without reopening an existing revision.
- Brain orchestration and Bootstrap composition remain outside the reference-set stability boundary.
- Additional accepted Context Sources can participate under the same preparation and stability model while retaining their own semantics and lifecycles.

# Risks

- Implementations may confuse an Active lifecycle transition with closure of the incorporated-reference set.
- Per-reference immutability may be mistaken for stability of aggregate membership or ordering.
- Source-change notifications may be misinterpreted as permission to edit historical Context.
- Preserving historical evidence may be misread as a claim of present contextual suitability.
- Future specifications may accidentally place stability responsibility in Brain, Bootstrap, transport, or an individual source.
- Overextension of this decision could preempt separate decisions about retrieval, currentness, authorization, failure handling, or refresh.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Draft provisional predecessor while applicable.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed change to Context Revision preparation, the incorporated-reference-set stability boundary, or treatment of meaningful source-owned change. A future accepted authority that changes Context lifecycle or immutability semantics would also prompt review.

Review may also follow introduction of a new Context Source category whose lifecycle cannot be reconciled with the preparation and historical-preservation boundaries described here. Detailed retrieval, currentness, authorization, failure, persistence, replay, asynchronous participation, refresh, or configurable-policy decisions remain outside this ADR.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-04 | Initial draft derived from the non-normative source decision record. |

# Engineering Motto

> Prepare once, validate one complete evidence boundary, and preserve what the reasoning cycle consumed.
