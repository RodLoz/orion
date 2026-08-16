# ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-16            |
| **Updated**       | 2026-08-16            |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. separates Knowledge, Context, and Reasoning by semantic responsibility. Knowledge governs what the platform accepts as true. Context governs what is relevant for one immutable Context Revision. Reasoning evaluates one bounded query against one authoritative Active Context Revision and owns the resulting reasoning outcome.

The current fixed Context profiles permit Identity only, Identity with Knowledge, or Identity with Memory. The Knowledge profile currently demonstrates incorporation through a minimal Knowledge reference projection, while current Reasoning treats non-Identity Context content opaquely. An identifier-only reference can establish identity and version correspondence but cannot supply the substantive proposition semantics needed for a legitimate Knowledge-grounded factual decision.

Allowing substantive semantics to reach Reasoning introduces architectural risks. A parallel source path could bypass Context authority. Context could acquire Knowledge truth or precompute a Reasoning answer. Reasoning could retrieve or verify Knowledge independently and reconstruct the Context evidence boundary. Brain, Planning, or a caller could become an alternate evidence authority. Excessive projection content could expose Knowledge records, provenance, acceptance evidence, source internals, or personal data.

This ADR establishes the smallest boundary that permits one deterministic Knowledge-grounded factual reasoning case while preserving the ownership, authority, currentness, authorization, failure, orchestration, and privacy boundaries established by prior architecture.

# Problem Statement

The architecture requires one permitted path through which accepted substantive Knowledge semantics can become available to Reasoning without transferring Knowledge ownership to Context, making Context answer the query, or allowing Reasoning to bypass the authoritative Context revision.

That path must also distinguish two applicability decisions:

- whether a governed Knowledge proposition should participate in a particular Context Revision; and
- whether that already-incorporated proposition semantically applies to the bounded query Reasoning evaluates.

The architecture must preserve issuer-owned authority verification, source-owned currentness, Context-owned contextual currentness and incorporation, Security-owned authorization, stable Context Revision history, and source opacity in Planning and Brain. It must define a privacy-minimal semantic projection without specifying a concrete executable representation.

# Decision

## Single Substantive Evidence Path

D-030

1. The authoritative Active Context Revision MUST be the single permitted path through which substantive Knowledge-derived semantics become available to Reasoning.
2. Reasoning MUST evaluate Knowledge-derived proposition semantics only when those semantics are incorporated into the exact authoritative Active Context Revision supplied for the reasoning cycle.
3. Raw Knowledge evidence, Knowledge records, source results, or proposition projections MUST NOT reach Reasoning through a parallel channel.
4. Reasoning MUST NOT retrieve Knowledge independently, refresh Knowledge, request an alternate Knowledge result, or receive a second source-evidence input outside the authoritative Context Revision.
5. Brain MUST NOT receive, inspect, select, transform, or supply Knowledge evidence independently of the authoritative Context output.
6. Planning MUST NOT receive, inspect, select, transform, or supply Knowledge evidence.
7. A caller or application boundary MAY propose an authorized bounded query but MUST NOT become the authority for evidence, proposition meaning, applicability, currentness, incorporation, or sufficiency.
8. Presence, custody, transport, representation, or consumption of a Knowledge identifier, reference, projection, fragment, correspondence, or receipt MUST NOT establish evidence authority.

## Bounded Knowledge Proposition Projection

D-031

1. Knowledge MAY issue a bounded Knowledge proposition projection for Context consideration.
2. The projection MUST remain Knowledge-owned proposition semantics even while Context owns its candidate treatment, placement, incorporation, lifecycle, and revision representation.
3. The projection MUST be tied to accepted Knowledge and bounded to the proposition semantics required for an approved reasoning case.
4. The projection MUST be issuer-verifiable, corresponded to a Source Currentness determination made by the applicable source owner during preparation, attributable to Knowledge, suitable for Context consideration, and minimal enough to keep Knowledge-record internals private.
5. The architectural minimum of the projection MUST include:
   - proposition identity;
   - bounded proposition semantic value;
   - Knowledge identity;
   - Knowledge version;
   - accepted state;
   - Source Currentness correspondence;
   - Knowledge attribution; and
   - issuer-authority verification correspondence.
6. The projection MAY include an opaque provenance pointer when a later specification demonstrates a governed need. The pointer MUST NOT become an independent retrieval handle for Reasoning or disclose raw provenance.
7. A KnowledgeRecord MUST NOT cross this boundary.
8. CandidateClaim MUST NOT serve as the cross-capability proposition representation. Candidate material does not by itself establish accepted Knowledge, projection issuance, currentness, or authority correspondence.
9. An identifier-only KnowledgeReference is insufficient as substantive factual evidence because it contains no bounded proposition semantic value.
10. The first slice MUST NOT expose raw provenance, acceptance evidence or rationale, confidence heuristics, source-internal metadata, personal data, or Context-owned retrieval purpose to Reasoning.
11. The projection MUST NOT become a generic evidence object, a generic source abstraction, or a transfer of Knowledge acceptance authority.

## Responsibility Allocation

D-032

1. Knowledge MUST retain ownership of:
   - accepted proposition semantics;
   - Knowledge acceptance, validation, lifecycle, identity, and version;
   - Knowledge-issued proposition-projection semantics;
   - issuer-owned verification of the Knowledge projection and its correspondence; and
   - Source Currentness participation within the applicable source boundary.
2. Knowledge MUST NOT own the Reasoning query, Contextual Currentness, Context incorporation, Context Revision authority, evidence sufficiency, or the final Reasoning outcome.
3. Context MUST retain ownership of:
   - candidate preparation;
   - contextual applicability;
   - incorporation;
   - Contextual Currentness;
   - Context placement of the bounded projection;
   - Context validation, lifecycle, and activation; and
   - Context Revision authority.
4. Context MUST NOT own raw Knowledge truth, Knowledge acceptance, source authority, issuer verification, exact-query applicability, evidence sufficiency, or the Reasoning outcome.
5. Reasoning MUST retain ownership of:
   - exact-query applicability over already-incorporated governed evidence;
   - evidence sufficiency for its bounded outcome;
   - deterministic bounded factual outcomes;
   - deterministic non-applicable or insufficient-evidence outcomes; and
   - privacy-safe Reasoning explainability.
6. Reasoning MUST NOT retrieve or independently verify Knowledge, establish Source Currentness, determine Contextual Currentness, redo Context incorporation, mutate Context, or resolve accepted Knowledge truth.
7. Planning MUST remain source-opaque and MUST consume or map only the authoritative Reasoning output.
8. Brain MUST remain source-opaque and MUST orchestrate only authoritative capability outputs.
9. Security MUST retain independent ownership of authorization semantics and authorization decisions.
10. These allocations MUST NOT create shared, composite, emergent, duplicated, or ownerless semantic authority.

## Issuer-Authority Correspondence

D-033

1. Issuer-owned verification of the bounded Knowledge proposition projection and its required correspondence MUST succeed before Context incorporation.
2. The projection issuer MUST verify that the projection corresponds to the applicable accepted Knowledge identity, version, proposition, attribution, and issuer-owned issuance.
3. Where accepted Knowledge preserves an underlying qualified source or domain authority, that source MUST retain its authority origin and applicable authority-verification ownership. Knowledge acceptance MUST NOT replace that source authority.
4. Context MAY preserve the completed issuer-verification correspondence required for the incorporated projection.
5. Context MUST NOT mint, reconstruct, recreate, renew, substitute, or independently verify Knowledge or original-source authority.
6. Context authority MUST prove only that the exact governed projection was incorporated into the exact immutable Active Context Revision under Context-owned preparation, validation, lifecycle, and activation.
7. Context authority MUST NOT prove:
   - Knowledge truth;
   - correctness of the Knowledge acceptance decision;
   - original source authority;
   - Security authorization;
   - present Source Currentness after preparation;
   - exact-query applicability; or
   - evidence sufficiency.
8. Reasoning MUST NOT call Knowledge or another source to reverify, refresh, replace, or supplement the incorporated projection.
9. Identifier possession, projection possession, Context-fragment presence, authority correspondence, or Context authority MUST NOT by itself establish Security authorization.

## Applicability Ownership

D-034

1. Context MUST own contextual applicability: whether a governed Knowledge proposition should participate in the particular Context Revision under preparation.
2. Contextual applicability MUST remain a Context-revision suitability decision and MUST NOT determine the Reasoning answer or establish evidence sufficiency.
3. Reasoning MUST own exact-query applicability: whether an already-incorporated governed proposition semantically applies to the bounded query being evaluated.
4. Exact-query applicability MUST occur only over evidence already fixed inside the authoritative Active Context Revision.
5. Exact-query applicability MUST NOT redo Context candidate selection, Contextual Currentness, incorporation, or activation.
6. Contextual applicability and exact-query applicability have different subjects and consequences. They MUST remain distinct responsibilities and MUST NOT be treated as shared ownership.
7. Knowledge MUST NOT receive ownership of or determine the Reasoning query through projection or retrieval semantics.
8. A caller MUST NOT determine either applicability decision as evidence authority.

## First-Slice Cardinality

D-035

1. The first Source-Aware Reasoning slice MUST support exactly one incorporated, contextually applicable, issuer-verified bounded Knowledge proposition.
2. Zero qualifying propositions MUST NOT produce a new successful Knowledge Profile activation.
3. Exactly one qualifying proposition MAY be incorporated when every other governing requirement is satisfied.
4. Multiple qualifying propositions are unsupported in the first slice and MUST NOT produce a new successful Knowledge Profile activation.
5. Contradictory propositions are unsupported and MUST be rejected within the applicable existing ownership boundaries.
6. Context MAY enforce the exact-one cardinality requirement but MUST NOT select among multiple propositions based on an expected Reasoning answer.
7. Knowledge MUST retain Knowledge-domain contradiction-resolution ownership.
8. Reasoning MAY reject an unsupported or contradictory evidence boundary presented to it, but MUST NOT resolve Knowledge truth or perform general Knowledge synthesis.
9. This decision MUST NOT authorize general multi-proposition aggregation, ranking, synthesis, reconciliation, or inference.

## Currentness

D-036

1. This decision MUST preserve ADR-0011.
2. Source Currentness MUST be established by the applicable source owner during Context preparation.
3. Retrieval, delivery, acceptance state, version, projection possession, authority verification, or incorporation MUST NOT by itself establish Source Currentness.
4. Context MUST separately own Contextual Currentness for the candidate Context Revision under preparation.
5. Activation MUST fix an immutable Context Revision and its incorporated proposition boundary.
6. Later Knowledge supersession, lifecycle change, source-currentness change, or contextual-currentness change MUST NOT mutate, remove, replace, invalidate, reopen, or rewrite that stable or Active Context Revision.
7. Later reasoning cycles requiring changed Knowledge MUST involve later Context preparation and, where applicable, a distinct successor Context Revision.
8. This decision MUST NOT introduce a time-to-live value, refresh interval, implicit latest lookup, automatic recollection, automatic successor creation, or autonomous repeated preparation.
9. Reasoning MUST NOT establish present Source Currentness or query Knowledge for a newer version.
10. Historical preservation of the incorporated projection MUST NOT imply present currentness or suitability for later use.

## Privacy and Minimization

D-037

1. Reasoning MUST receive only the minimum governed proposition semantics and correspondence needed for the approved bounded deterministic query.
2. Reasoning MUST NOT receive KnowledgeRecord internals, raw provenance, private acceptance evidence or rationale, source-internal metadata, personal data in the first slice, confidence heuristics, or independent Knowledge retrieval handles.
3. Context MUST NOT copy private source material merely because it participates in retrieval or incorporation.
4. An optional opaque provenance pointer MUST remain opaque to Reasoning and MUST NOT create a parallel evidence or retrieval path.
5. Reasoning explainability MAY identify privacy-safe Context, proposition, Knowledge-version, rule, and correspondence references needed to explain the deterministic outcome.
6. Reasoning explainability MUST NOT expose private reasoning traces, chain-of-thought, raw proposition provenance, acceptance internals, source internals, personal data, or hidden KnowledgeRecord content.
7. Diagnostics and observability MUST preserve the same minimization boundary and MUST NOT treat architectural permission to reason over a proposition as permission to log its semantic value.

## CONTRACT-0001 Correspondence

D-038

1. CONTRACT-0001 remains sufficient for this architecture.
2. The bounded Knowledge proposition projection MUST be a Knowledge-specific specialization of the existing source-owned returned semantics to candidate availability boundary.
3. CONTRACT-0001 MUST continue to end at candidate availability and MUST NOT absorb issuer verification, Contextual Currentness, Context incorporation, Context validation, Context activation, or Reasoning semantics.
4. Context MUST retain the later incorporation decision under existing authority.
5. This decision MUST NOT allocate CONTRACT-0002 or create a generic evidence Contract.

## Downstream Opacity and Existing Profiles

D-039

1. Planning MUST remain source-opaque and MUST consume or map the authoritative Reasoning outcome only.
2. Brain MUST remain source-opaque and MUST orchestrate authoritative capability outputs only.
3. Direct Knowledge semantics, projections, provenance, currentness details, or authority correspondence MUST NOT enter Planning or Brain as independent evidence.
4. The fixed Context profiles MUST remain limited to:
   - Profile A: Identity;
   - Profile B: Identity with Knowledge; and
   - Profile C: Identity with Memory.
5. This decision MUST NOT authorize a combined Identity with Knowledge and Memory profile.
6. Context profile selection MUST NOT become autonomous or dynamic.
7. This decision MUST NOT create a generic source registry, generic evidence registry, or generic Context-source framework.

## Failure Ownership

D-040

1. Failure ownership MUST follow the architectural responsibility that failed, and propagation MUST preserve originating semantic identity.
2. No applicable Knowledge proposition is a Context-owned candidate-preparation or contextual-applicability consequence when no source-owned failure caused the absence.
3. A proposition that is not source-current at preparation remains owned by the applicable source-currentness responsibility. Context owns only the consequence for its candidate revision.
4. Failure to verify issuer authority or projection correspondence remains owned by the applicable issuing source or Knowledge projection issuer.
5. A malformed projection produced as Knowledge returned material remains Knowledge-owned.
6. A structurally malformed, mismatched, or inadmissible projection detected at Context incorporation is a Context-owned incorporation or validation failure without transferring Knowledge semantics.
7. Multiple qualifying propositions where exactly one is required produce a Context-owned inability to satisfy the first-slice cardinality constraint. Any underlying Knowledge-domain contradiction failure remains Knowledge-owned.
8. Exact-query non-applicability and insufficient evidence are Reasoning-owned outcomes or failures as later specified.
9. Invalid Context authority remains Context-owned and MUST prevent Reasoning consumption.
10. Reasoning outcome-authority failure remains Reasoning-owned and MUST prevent authoritative downstream consumption.
11. Context MAY determine the consequence for its candidate revision, and Brain MAY determine an orchestration consequence, without acquiring or reclassifying the originating failure.
12. A failed candidate preparation MUST NOT mutate an existing Active or stable historical Context Revision.

# Rationale

The selected boundary follows existing capability ownership rather than data location. Knowledge is the only capability qualified to issue accepted proposition semantics. Context is the only capability qualified to decide whether a governed proposition participates in a revision and to establish the authoritative revision consumed by Reasoning. Reasoning is the only capability qualified to determine whether incorporated semantics apply to its exact query and suffice for its outcome.

A bounded proposition projection supplies the minimum substantive value absent from an identifier-only reference while avoiding disclosure of the complete Knowledge record. Pre-incorporation issuer verification preserves ADR-0008 authority ownership. Separating Context authority from Knowledge authority prevents incorporation from becoming a truth or authorization claim.

The exact-one constraint avoids premature multi-proposition synthesis. It permits a deterministic first case without giving Context permission to reason among competing propositions or giving Reasoning permission to resolve Knowledge-domain contradictions.

Keeping Planning and Brain source-opaque preserves their existing capability roles and prevents orchestration or plan mapping from becoming evidence interpretation.

# Alternatives Considered

## Separate Evidence Channel Parallel to Context

Rejected because it would bypass the authoritative Context evidence boundary, permit same-cycle divergence, and require Brain or another caller to coordinate source evidence independently.

## Identifier- or Reference-Only Evidence

Rejected as insufficient because identity, version, accepted state, and attribution do not expose the substantive proposition needed for a factual determination. Identifiers also do not constitute authority.

## Context-Produced Answer Semantics

Rejected because Context owns relevance, incorporation, and revision preparation, not exact-query interpretation, sufficiency, or the Reasoning outcome.

## Generic Reasoning-Evidence Framework

Rejected because the first slice needs only a Knowledge-owned proposition projection. A generic framework would introduce unsupported abstraction, risk a second semantic owner, and generalize Context beyond the accepted profiles.

## Reasoning Retrieves or Verifies Knowledge Independently

Rejected because Reasoning would reconstruct or compete with the Context evidence boundary, duplicate issuer verification, and establish a parallel source relationship.

## Caller-Owned Evidence Applicability

Rejected because the caller may state a query but cannot become the authority for Context participation, source meaning, exact-query applicability, or evidence sufficiency.

## General Multi-Proposition Synthesis in the First Slice

Rejected because aggregation, contradiction reconciliation, precedence, and synthesis require additional architecture. The exact-one constraint is sufficient for the first deterministic Knowledge-grounded case.

# Consequences

- Reasoning can perform one legitimate Knowledge-grounded deterministic factual evaluation without retrieving Knowledge.
- The authoritative Active Context Revision remains the only substantive evidence boundary into Reasoning.
- Knowledge meaning and issuer verification remain source-owned.
- Context retains contextual applicability, incorporation, lifecycle, and revision authority without acquiring Knowledge truth.
- Reasoning gains exact-query applicability and evidence-sufficiency responsibility without redoing Context preparation.
- Planning and Brain remain source-opaque.
- Security authorization remains independent of possession and cognitive authority.
- Existing Context stability and currentness rules remain intact.
- The first slice cannot answer from zero, multiple, or contradictory qualifying propositions.
- Later Engine and executable Contract-surface evolution will be required before runtime behavior can implement this decision.
- General evidence frameworks and multi-proposition synthesis remain unauthorized.

# Risks

- Implementations may copy a KnowledgeRecord instead of constructing a minimal projection.
- Context placement may be described incorrectly as ownership of proposition truth.
- Source-currentness metadata may be mistaken for a Context or Reasoning determination.
- Context authority may be mistaken for Knowledge authority or authorization.
- Exact-query applicability may be confused with Contextual Currentness.
- Cardinality enforcement may be expanded into Context-owned answer selection.
- An opaque provenance pointer may be used incorrectly as an independent retrieval handle.
- Explainability or diagnostics may expose proposition values or hidden Knowledge internals.
- Planning or Brain may be given source details for convenience.
- Future profile work may incorrectly infer authorization for combined profiles or autonomous selection.

# Compatibility and Existing Architecture

This decision preserves:

- ADR-0008 source semantic ownership, issuer authority origin, and issuer-owned verification;
- ADR-0011 Source Currentness, Contextual Currentness, stable-revision, and prospective-change boundaries;
- ADR-0012 Security-owned authorization and the rule that possession does not prove or renew authorization;
- ADR-0013 originating failure ownership and Context-owned candidate consequences;
- ADR-0015 source-opaque Brain orchestration and authoritative capability-output consumption;
- CONTRACT-0001 source-owned returned semantics, candidate availability, and later Context-owned incorporation;
- fixed Context Profiles A, B, and C only;
- Context-only substantive evidence delivery to Reasoning;
- source-opaque Planning and Brain boundaries; and
- inward dependency direction and Core custody without Core semantic ownership.

The bounded proposition projection is an additive Knowledge specialization within established authority. It does not create a new capability, Contract identity, source registry, evidence registry, Context profile, authorization semantic, or orchestration role.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Active normative predecessor.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Active normative predecessor.
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md) — Active normative predecessor.
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md) — Active normative predecessor.
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md) — Active normative predecessor.
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md) — Active normative predecessor.
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md) — Active normative predecessor.
- [ADR-0015 — Brain Cognitive-Reference Orchestration and Final Cognitive Result Boundaries](ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md) — Active normative predecessor.
- [ADR-0018 — Refresh, Recollection, and Repeated Context Preparation Boundaries](ADR-0018-Refresh-Recollection-and-Repeated-Context-Preparation-Boundaries.md) — Active normative predecessor.
- [ADR-0019 — Configurable Retrieval Policy Ownership Boundary](ADR-0019-Configurable-Retrieval-Policy-Ownership-Boundary.md) — Active normative predecessor.
- [CONTRACT-0001 — Context Source Retrieval](../contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0003 — Context Engine 4.0.0](../../specifications/engines/context/ENGINE-0003-Context-Engine-Revision-4.0.0.md)
- [ENGINE-0005 — Knowledge Engine 1.1.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.1.0.md)
- [ENGINE-0006 — Reasoning Engine 2.0.0](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [ENGINE-0007 — Planning Engine 2.0.0](../../specifications/engines/planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [ENGINE-0001 — Brain Engine](../../specifications/engines/ENGINE-0001-Brain-Engine.md)
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Deferred Scope

Later Engine specifications and other applicable lower-authority artifacts MUST define any approved concrete realization. This ADR does not define or authorize:

- concrete TypeScript types;
- executable request or result shapes;
- an exact authority-verification API;
- bounded query vocabulary;
- an exact deterministic Reasoning rule;
- concrete Context or Reasoning failure and result types;
- projection validation algorithms;
- runtime sequencing details;
- Bootstrap composition mechanics;
- diagnostic representation;
- test matrices;
- future multi-proposition synthesis;
- refresh or time-to-live policy;
- ranking, scoring, preference, or selection algorithms;
- confidence use;
- Provider, Adapter, transport, serialization, or persistence policy; or
- Logical Reconstruction or Exact Replay mechanisms.

# Implementation Notes

This ADR establishes architectural ownership, authority, correspondence, cardinality, currentness, privacy, and downstream boundaries only. It authorizes no runtime implementation beyond its accepted architectural scope.

Concrete specifications must preserve the distinction between semantic projection design and programming-language representation. They must also preserve fixed profile selection, exact-one proposition cardinality, issuer verification before incorporation, Context-only delivery to Reasoning, and source opacity downstream.

# Future Review

Future review is required before authorizing general multi-proposition synthesis, contradictory-proposition reconciliation outside existing Knowledge ownership, another substantive evidence source for Reasoning, a new Context profile, autonomous profile selection, a generic evidence framework, or a model that cannot preserve issuer verification and source attribution across its execution topology.

A proposal that transfers Knowledge truth to Context, makes Reasoning a source retriever, exposes Knowledge evidence to Planning or Brain, or treats authority as authorization requires architectural review and revision of this decision.

# Change History

| Version | Date       | Description                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-16 | Initial Draft establishing the Knowledge Evidence Boundary for Source-Aware Reasoning. |
| 1.0.0   | 2026-08-16 | Approved architectural decision.                                                       |

# Engineering Motto

> Knowledge supplies governed meaning. Context decides participation. Reasoning decides what the bounded query supports.
