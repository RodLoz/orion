# ENGINE-0005 — Knowledge Engine Revision

| Field          | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **Status**     | Active                                                                              |
| **Supersedes** | 1.0.0                                                                               |
| **Version**    | 1.1.0                                                                               |
| **Owner**      | Project Maintainers                                                                 |
| **Created**    | 2026-08-11                                                                          |
| **Updated**    | 2026-08-11                                                                          |
| **Applies To** | Knowledge Engine behavior and qualified-source participation in Context preparation |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0005
revision. It supersedes version 1.0.0, which remains historical and
non-authoritative.

Version 1.1.0 preserves the complete Knowledge Engine 1.0.0 semantics and adds
the approved collaboration by which the unchanged Get Knowledge operation
participates as a qualified source in CONTRACT-0001 Context preparation.

For all Knowledge-internal behavior not restated by this additive
collaboration, the normative requirements, invariants, limits, failures,
lifecycle, Store boundaries, tests, and acceptance criteria established in
version 1.0.0 are incorporated unchanged into this revision. Historical
future-only Context wording in version 1.0.0 is not incorporated as current
authority.

Applicable Active ADRs, Concepts, Engineering Standards, and CONTRACT-0001
govern in a conflict.

## Purpose

The Knowledge Engine remains the single semantic owner of accepted Knowledge.
It evaluates candidate claims under explicit acceptance evidence, preserves
Provenance, governs Knowledge Identity, Version, validation state and Currency,
resolves declared contradictions, and exposes deterministic retrieval.

Version 1.1.0 additionally specifies how Context may initiate Get Knowledge
through its Core-custodied Contract and receive Retrieved Knowledge as
source-owned candidate material without transferring Knowledge semantics.

## Compatibility Boundary

The following executable Knowledge surfaces remain unchanged:

- Get Knowledge;
- Get Knowledge Request;
- Retrieved Knowledge;
- Knowledge Reference;
- Knowledge Record;
- Knowledge Version;
- Knowledge Currency; and
- all Knowledge failures.

Knowledge acceptance, rejection, Provenance, contradiction, supersession,
historical retrieval, Store interaction, lifecycle, validation, privacy,
immutability, and diagnostic semantics remain unchanged from version 1.0.0.

No production Knowledge behavior change is required for the Context
collaboration.

## Knowledge Ownership

Knowledge owns:

- interpretation and validation of Get Knowledge Request;
- Knowledge Identity validation;
- Knowledge Store invocation and mechanical-result handling;
- confirmation that requested material is accepted Knowledge;
- reconstruction and validation of Knowledge Record and Knowledge Reference;
- Knowledge Version and Currency semantics;
- current-versus-historical Knowledge behavior;
- Retrieved Knowledge result semantics;
- Knowledge lifecycle behavior; and
- Knowledge and Store-originating failure semantics.

Core custodies shared Knowledge executable language without acquiring
Knowledge behavior or acceptance authority. A Store remains a mechanical
participant and does not decide acceptance, validation state, Version,
Currency, contradiction resolution, or availability.

## Context Collaboration

Knowledge participates as one qualified source for the fixed Identity +
Knowledge Context preparation profile.

Context owns:

- the Context preparation purpose;
- the decision that Knowledge retrieval is required for that profile;
- invocation of the injected Get Knowledge Contract;
- receipt of source-owned candidate material;
- the decision whether candidate material is incorporated;
- construction of the Context-owned Knowledge projection;
- Context validation and activation; and
- Context Lineage and Revision lifecycle behavior.

Knowledge does not own Context incorporation, fragment construction, Context
validation, Contextual Currentness, activation, revision reuse, or Active
Context authority verification.

Context MUST forward the associated Get Knowledge Request without interpreting
or reconstructing Knowledge-owned request fields. Invocation by Context does
not transfer request, retrieval, result, lifecycle, currentness, or failure
semantics to Context.

## Candidate and Reference Semantics

Successful Get Knowledge returns Retrieved Knowledge containing an immutable
Knowledge Record and Knowledge Reference according to unchanged Knowledge
semantics.

Retrieved Knowledge remains Knowledge-owned candidate material. Retrieval
success is availability, not Context incorporation. Knowledge Record MUST NOT
be incorporated into Context.

Knowledge Reference is the privacy-minimal source-owned handoff used by the
Context incorporation boundary. It retains:

- Knowledge Identity;
- accepted validation state;
- Version;
- Knowledge Currency; and
- Knowledge as authoritative capability.

It contains no raw Claim, Provenance, Acceptance Evidence, reason, authority
identifier, confidence, or personal data. Context reconstructs its own
immutable projection and does not retain the Knowledge Reference object as
Context representation.

Knowledge Reference remains Knowledge-specific. It is not a generic source,
candidate, evidence, Provider, Adapter, or registry abstraction.

## Source Currentness

Knowledge Currency remains Knowledge-owned Source Currentness information.
Get Knowledge continues to return the correct `current` or `superseded`
reference for the requested accepted Knowledge identity.

Knowledge Source Currentness is not Contextual Currentness. Context may
preserve Currency in its projection but MUST NOT reinterpret `current` as
Contextually Current or `superseded` as automatically invalid for Context.

This revision introduces no freshness threshold, TTL, ranking, selection,
refresh, or Contextual Currentness algorithm.

## Authority and Verification

Knowledge acceptance is not universal truth, external verification, or Active
Context authority verification. Confidence, where future architecture permits
it, is not authority. Retrieval success, reference possession, Context
incorporation, and Context activation do not establish verification.

The authoritative-capability field preserves attribution to Knowledge; it does
not transfer or complete authority verification.

## Authorization and Enforcement

Security owns authorization decisions. Protected boundaries own enforcement.
Get Knowledge execution, possession of Retrieved Knowledge, Context retrieval
initiation, incorporation, and activation do not grant or recreate
authorization.

Version 1.1.0 introduces no access-control, authorization, or enforcement
mechanism.

## Failure Ownership

Knowledge retrieval failures remain Knowledge-owned and propagate unchanged
through Context preparation. The current applicable failures are:

- Invalid Knowledge Input;
- Invalid Knowledge Identity;
- Knowledge Not Found;
- Knowledge Store Unavailable; and
- Invalid Knowledge State.

Context MUST NOT wrap, recreate, translate, or convert these failures to a
Context failure.

A nonconforming collaborator returning malformed candidate material is
distinct from a conforming Knowledge retrieval failure. Context owns defensive
validation of the material presented at its incorporation boundary and may
raise Invalid Knowledge Context Projection. That failure does not alter the
Knowledge failure taxonomy.

No retry, fallback, recovery, timeout, compensation, or rollback semantics are
added.

## Lifecycle and Store Preservation

All version 1.0.0 acceptance and lifecycle rules remain unchanged:

- only accepted Knowledge is retrievable;
- rejected or unconfirmed material is not Knowledge;
- accepted Records remain immutable;
- declared supersession creates a governed immutable successor;
- historical Records remain retrievable;
- Currency remains Engine-governed;
- malformed Store state cannot become Knowledge; and
- Store mechanics never establish acceptance or current availability.

Context participation invokes only the existing Get Knowledge operation. It
does not evaluate claims, persist Knowledge, mutate Currency, select a current
version, or acquire Store access.

## Bootstrap and Dependency Boundary

Bootstrap MAY construct a lifecycle-ready Knowledge capability, obtain its Get
Knowledge implementation through the Core-custodied Contract, and inject that
operation into Context.

Bootstrap MUST NOT interpret Knowledge requests or results, fabricate
Knowledge for Context preparation, decide Currency, build Context fragments,
or expose raw Knowledge downstream.

Knowledge Engine depends inward on Core-custodied Contracts and its authorized
Store abstraction. It MUST NOT depend on Context implementation. Context MUST
NOT depend on Knowledge Engine or Knowledge Store implementation.

## Brain, Reasoning, and Planning Boundary

Knowledge participates in cognitive processing only after approved
incorporation into an authoritative Active Context Revision.

Retrieved Knowledge, Knowledge Record, Knowledge Reference, Get Knowledge
Request, and Get Knowledge MUST NOT enter Brain, Reasoning, or Planning as
parallel evidence. Brain consumes authoritative Active Context, Reasoning
consumes its approved intent, Active Context and query inputs, and Planning
consumes Reasoning output.

## Execution-model and Persistence Neutrality

The collaboration is independent of synchronous, asynchronous, event-driven,
distributed, transport, serialization, and process-placement choices.

Knowledge persistence and Store technology remain unchanged and independent
of Context persistence, reconstruction, replay, or historical reproduction.

## Conformance

Conformance evidence MUST demonstrate:

- exact opaque Get Knowledge Request forwarding;
- Context-owned retrieval initiation;
- candidate availability distinct from incorporation;
- Knowledge Reference handoff without Knowledge Record incorporation;
- Context-owned projection reconstruction;
- exact Knowledge failure propagation;
- partial-success and existing-Active state safety;
- malformed-candidate distinction;
- fixed Identity + Knowledge profile semantics;
- semantic revision reuse;
- Source Currentness and Contextual Currentness separation; and
- absence of direct Context dependency on Knowledge implementation.

Knowledge Engine 1.0.0 behavior tests remain applicable because the source
operation and domain semantics are unchanged.

## Compatibility and Migration

Version 1.1.0 is a backward-compatible minor revision. It adds a governed
consumer collaboration without changing Knowledge requests, results,
references, failures, lifecycle, Store behavior, or public source semantics.

Existing Knowledge callers require no migration. Context participation uses
the existing Get Knowledge Contract. No data migration is required.

## Change History

| Version | Date       | Description                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the Knowledge Engine vertical slice, retrieval, reference, lifecycle, and Store behavior.    |
| 1.1.0   | 2026-08-11 | Added unchanged Get Knowledge participation as a qualified source for CONTRACT-0001 Context preparation. |

## References

- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](../../../docs/adr/ADR-0005%20%E2%80%94%20Memory%20Architecture%20Principles)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [Context Engine 3.0.0](../context/ENGINE-0003-Context-Engine-Revision-3.0.0.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ENGINE-0005 1.0.0](ENGINE-0005-Knowledge-Engine.md)

## Engineering Motto

> Knowledge remains source-owned when Context incorporates its projection.
