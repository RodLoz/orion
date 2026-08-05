# ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Draft                 |
| **Version**       | 0.1.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-04            |
| **Updated**       | 2026-08-04            |
| **Decision Type** | Architecture Decision |

---

## Context

Context Revision preparation can involve cognitive references supplied by multiple independent capability domains. Context owns collaboration and incorporation, while each participating source retains its established semantics, lifecycle, and reference authority. That ownership model leaves a narrower architectural boundary around retrieval: responsibility for originating retrieval, meaning of the request sent to sources, and meaning of the aggregate set returned for Context consideration.

Retrieval crosses capability boundaries but does not collapse them. A Context need is communicated to sources, each source applies that need within its own domain, and candidate references become available for later Context consideration. Several participants may therefore contribute to the collaboration without sharing one undifferentiated retrieval responsibility.

ADR-0008 and ADR-0009 provide Draft provisional predecessors for the collaboration, authority, preparation, and reference-set stability boundaries. This ADR preserves their Draft status and formalizes only the retrieval ownership distinctions derived from D-010 through D-012.

## Problem Statement

Without explicit retrieval boundaries, initiating a request could be confused with defining its meaning, a source's interpretation could be treated as ownership of the Context purpose, or source execution could be treated as ownership of the aggregate response. Transport or delivery could also appear to acquire semantic responsibility merely by conveying requests and returned values.

The returned values create a further ambiguity. Each source remains responsible for what its references and source result mean inside its own domain, while Context receives an aggregate set for contextual consideration. Treating those levels as identical would either transfer source meaning to Context or transfer the aggregate collaboration meaning to individual sources.

The architecture therefore needs one connected allocation for initiation, request semantics, source participation, and aggregate returned-set semantics while preserving the separate incorporation decision.

## Decision

### Retrieval Initiation

1. Context MUST own retrieval initiation during Context Revision preparation.
2. Retrieval initiation MUST originate a request for potentially relevant cognitive references within Context-owned collaboration.
3. Retrieval initiation MUST remain distinct from retrieval request semantics, source interpretation, retrieval execution, aggregate returned-set semantics, and incorporation.
4. Retrieval initiation MUST NOT transfer source semantics, source lifecycle ownership, or reference authority.
5. Retrieval initiation MUST NOT reopen a Context Revision whose incorporated-reference set is already stable or whose lifecycle state is Active.
6. Retrieval initiation MUST NOT introduce a new capability.

### Retrieval Request Semantics

1. Context MUST own the architectural semantics of retrieval requests issued during Context Revision preparation.
2. A retrieval request MUST express Context's need for potentially relevant cognitive references.
3. Retrieval initiation and retrieval request semantics MUST remain distinct architectural responsibilities.
4. Each participating source MUST interpret the Context-owned request within its own semantic boundary.
5. Each participating source MUST own retrieval execution within its own source boundary.
6. Source interpretation and retrieval execution MUST NOT transfer ownership of retrieval request semantics to the source.
7. Retrieval request semantics MUST NOT determine incorporation or aggregate returned-set semantics.

### Aggregate Returned-Set Semantics

1. Context MUST own the architectural semantics of the aggregate returned set made available in response to a Context-owned retrieval request.
2. The aggregate returned set MUST represent candidate source references made available for Context consideration.
3. Each participating source MUST own the semantics of the references it produces and the semantics of any source result produced within its own source boundary.
4. Aggregate returned-set semantics MUST remain distinct from source-reference semantics and source-result semantics.
5. Candidate availability MUST NOT constitute incorporation into a Context Revision.
6. Returning candidates MUST NOT by itself establish reference authority, authority verification, authorization, source currentness, contextual currentness, ranking, selection, or contextual suitability.
7. Retrieval request semantics, source interpretation, retrieval execution, source-result semantics, aggregate returned-set semantics, and incorporation MUST remain distinct architectural concerns.
8. Retrieval semantics MUST remain independent from transport or delivery.

## Rationale

Context initiates retrieval because retrieval begins within Context-owned preparation and exists to support a contextual need. This allocation keeps the purpose of obtaining potentially relevant references with the capability responsible for collaboration and incorporation. It does not absorb the independent domains from which those references originate.

Separating initiation from request meaning prevents the act of causing a request from becoming an implicit definition of everything the request communicates. Context owns both responsibilities, but they answer different questions: whether the collaboration originates and what contextual need the request expresses.

Source interpretation preserves capability boundaries. Memory, Knowledge, and other accepted sources can apply their own domain meaning when responding to a common contextual purpose. Their participation explains how a request is understood and satisfied within a source without fragmenting ownership of the cross-source Context need.

The same separation applies to returned values. A source remains accountable for the meaning of its references and any source result it produces. Context accounts for why the aggregate set is available within Context preparation: it contains candidates returned for consideration. Aggregate meaning therefore follows the Context-owned collaboration without converting Context into the semantic owner of the set's individual members.

Candidate status preserves the incorporation boundary. Availability in an aggregate returned set supplies material for consideration but does not record a decision that the material participates in a Context Revision. It also carries no independent conclusion about authority, authorization, currentness, ranking, selection, or suitability.

Keeping retrieval semantics independent from transport and delivery prevents semantic ownership from following data movement. The architectural purpose and domain meaning remain attributable to their capability owners regardless of how requests and values are conveyed.

## Alternatives Considered

### Brain, Bootstrap, Core, or Security Initiates Retrieval

Rejected because orchestration, composition, Contract custody, and security governance do not supply the Context-owned purpose for originating source participation during Context Revision preparation.

### Each Source Initiates Context Retrieval

Rejected because a source governs its own domain but does not determine when Context preparation needs participation across accepted sources.

### Initiation and Request Meaning Are One Responsibility

Rejected because causing a request to originate and defining its architectural purpose are distinct questions, even when assigned to the same capability.

### Sources Own the Context Request Meaning

Rejected because source interpretation applies a shared Context purpose within a domain; it does not redefine the architectural meaning communicated by Context.

### Context Owns Source Interpretation and Execution

Rejected because that allocation would absorb source-specific semantics and behavior into Context and weaken capability independence.

### Sources Own the Aggregate Returned-Set Meaning

Rejected because individual sources govern their references and source results, not the cross-source meaning of the aggregate set made available within Context preparation.

### Aggregate Meaning Replaces Source Meaning

Rejected because the contextual purpose of the aggregate does not redefine what any member reference or source result means within its issuing domain.

### Returned Candidates Are Automatically Incorporated

Rejected because availability and incorporation are separate Context concerns. Automatic incorporation would allow retrieval participation to bypass the Context-owned incorporation decision.

### Transport or Delivery Defines Retrieval Semantics

Rejected because conveying a request or returned value does not establish its architectural purpose or domain meaning.

## Consequences

- Retrieval initiation has one accountable capability within Context Revision preparation.
- Context request meaning remains distinguishable from source interpretation and execution.
- Each source can satisfy the contextual request according to its own domain responsibilities.
- Individual source-reference and source-result meaning remains distinguishable from aggregate returned-set meaning.
- Returned references remain candidates until the separate incorporation concern is resolved.
- Returning a candidate carries no independent conclusion about authority, authorization, currentness, ranking, selection, or suitability.
- Brain orchestration, Bootstrap composition, Core custody, and Security governance remain outside retrieval-semantic ownership.
- Transport and delivery remain semantically neutral to the retrieval boundaries addressed here.
- Additional accepted sources can participate without changing the ownership allocation.

## Risks

- A shared request representation may be mistaken for shared semantic ownership.
- A source performing retrieval may be mistaken for the owner of the Context request purpose.
- Aggregation may obscure which source owns the semantics of an individual reference or source result.
- Candidate availability may be mistaken for incorporation or contextual suitability.
- Delivery infrastructure may be treated as a semantic participant because it carries retrieval values.
- Later work on ranking, selection, currentness, authorization, or failure handling may accidentally redefine these retrieval boundaries.
- Broad use of the phrase “retrieval result” may obscure the distinction between a source result and the aggregate returned set.

## Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Draft provisional predecessor while applicable.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Draft provisional predecessor while applicable.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

## Future Review

Relevant review triggers include a proposed change to Context-owned retrieval collaboration, a new category of participating Context Source, or a model that cannot preserve the distinction between source results and aggregate returned sets.

Review may also follow later accepted decisions concerning currentness, authorization, failure semantics, asynchronous participation, refresh, or configurable retrieval policy. Algorithms, query languages, filters, ranking, source selection, Contract shapes, schemas, APIs, providers, transports, runtime sequencing, and implementation mechanisms remain outside this ADR.

## Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-04 | Initial draft derived from the non-normative source decision record. |

## Engineering Motto

> Context expresses the need and owns the aggregate purpose; each source retains the meaning of what it returns.
