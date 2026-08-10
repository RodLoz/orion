# ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-06            |
| **Updated**       | 2026-08-09            |
| **Decision Type** | Architecture Decision |

---

# Context

Context Revision preparation coordinates independent capabilities while preserving their established responsibilities. Context owns collaboration initiation, retrieval initiation and request meaning, the aggregate meaning of returned candidates, contextual currentness, incorporation, and candidate revision handling. Each participating source retains its own semantics, retrieval execution, source-result meaning, reference authority, authority verification, lifecycle, and source currentness. Security retains authorization semantics and decisions. Brain owns high-level cognitive orchestration and final cognitive result construction, while Bootstrap owns composition.

A failure can arise within any of these responsibilities and become relevant beyond its originating boundary. The capability receiving or reacting to that failure is not necessarily the capability whose responsibility gives the failure architectural meaning. The same failure can affect a candidate Context Revision or downstream Brain result without changing its semantic origin.

Existing decisions establish ownership boundaries from which failure meaning is derived. Source authority survives boundary crossing, Context incorporation remains separate from candidate availability, currentness responsibilities remain divided, authorization semantics remain with Security, and revision boundaries remain unchanged. A failure model is needed when an accepted responsibility fails.

This ADR formalizes failure ownership, semantic continuity during propagation, and the candidate Context Revision consequence. It does not establish operational handling or a technical failure form.

# Problem Statement

Without an explicit ownership rule, a failure could be assigned according to where it is observed or acted upon rather than according to the responsibility that failed. Context, Brain, Security, or Bootstrap could then appear to own failures merely through participation. Such allocations would collapse capability boundaries into incidental topology.

Boundary crossing creates a second ambiguity. A propagated failure could be treated as a replacement, a newly created boundary-local failure, or a reinterpreted failure belonging to its receiver. That would sever the relationship between the failure and the architectural responsibility that gives it meaning.

A third ambiguity concerns consequence. Context needs to determine what a failure means for its candidate revision, while Brain may face a downstream result consequence. Either consequence could be mistaken for ownership of the originating failure.

The architecture therefore needs one boundary connecting originating ownership, identity-preserving propagation, and candidate-revision consequence without introducing central failure authority.

# Decision

## Failure Ownership

D-019

1. A failure MUST remain owned by the capability whose accepted architectural responsibility defines the failed semantic boundary.
2. Failure ownership MUST be determined by architectural meaning, not by representation, location, transport, observation, persistence, orchestration, topology, or downstream consequence.
3. Transport, delivery, communication, logging, persistence, aggregation, coordination, orchestration, observation, reception, consumption, or representation MUST NOT transfer failure ownership.
4. A centralized, shared, ownerless, or implementation-defined failure-ownership model MUST NOT be introduced.
5. A source MUST retain failures arising from its source interpretation, retrieval execution, source-result production, source semantics, reference authority, authority verification, source lifecycle, and source currentness responsibilities.
6. Context MUST retain failures arising from its collaboration initiation, retrieval initiation, retrieval-request semantics, aggregate returned-set semantics, contextual-currentness assessment, incorporation, validation, activation, and candidate Context Revision handling responsibilities.
7. Security MUST retain failures arising from Security-owned authorization semantics and authorization decisions.
8. Authorization relevance or enforcement by another boundary MUST NOT transfer a Security-owned authorization failure or convert a distinct source, Context, or enforcement failure into a Security-owned failure.
9. Brain MUST retain failures arising from Brain-owned orchestration and final cognitive result responsibilities, but orchestration or result construction MUST NOT transfer another capability's failure to Brain.
10. Bootstrap MUST retain failures arising from Bootstrap-owned composition, but composition MUST NOT transfer another capability's failure to Bootstrap.
11. Core custody MUST NOT confer failure ownership.
12. Failure persistence, if later introduced, MUST preserve originating ownership and MUST NOT constitute failure ownership.

## Failure Propagation

D-020

1. Propagation MUST preserve the originating capability's failure ownership.
2. Propagation MUST preserve the originating failure's semantic identity.
3. Propagation MUST NOT reinterpret the failure's architectural meaning.
4. Propagation MUST NOT recreate the originating failure as a boundary-local failure.
5. Propagation MUST NOT replace the originating failure.
6. Propagation MUST NOT automatically merge independent failures.
7. Propagation MUST NOT transfer failure ownership to a sender, receiver, intermediary, orchestrator, composer, consumer, or representational custodian.
8. Participants MAY observe a propagated failure and determine consequences within their own accepted responsibilities without acquiring ownership of that failure.
9. Failure representation MAY later change under approved Contracts or Specifications, but any such representation MUST preserve the failure's architectural meaning, semantic identity, and originating ownership.

## Candidate Context Revision Consequence

D-021

1. Context MUST own the consequence that a capability-owned failure has for the candidate Context Revision currently under preparation.
2. A capability-owned failure MAY prevent successful completion or activation of that candidate when preparation depends on the failed architectural responsibility.
3. Context MAY reject, abandon, or otherwise prevent activation of the affected candidate according to a later approved specification.
4. This ADR MUST NOT select which candidate disposition applies.
5. A candidate Context Revision consequence MUST NOT transfer ownership of the originating failure to Context.
6. A candidate Context Revision consequence MUST NOT reinterpret the originating failure as a Context-owned failure.
7. A candidate Context Revision consequence MUST NOT mutate an Active Context Revision.
8. A candidate Context Revision consequence MUST NOT mutate a stable historical Context Revision.
9. A candidate Context Revision consequence MUST NOT invalidate unrelated Context Revisions.
10. A candidate Context Revision consequence MUST NOT predetermine later Context preparation.
11. Brain MAY own a downstream consequence for construction of its final cognitive result when an observed failure affects Brain-owned responsibility.
12. A Brain-owned downstream consequence MUST NOT transfer ownership of or reinterpret the originating failure.

# Rationale

Failure meaning follows responsibility because capability boundaries remain stable when topology or technology changes. Locating ownership at a receiver, carrier, coordinator, or consumer would make semantic accountability depend on an incidental path.

This allocation preserves distinctions inside retrieval. Context owns initiation, request meaning, and aggregate candidate-set meaning. Sources own domain interpretation, execution, and source results. A broadly described retrieval failure therefore derives its owner from the particular responsibility involved.

Security owns failure meaning where Security-owned authorization semantics or decisions failed. Authorization relevance does not make Security the owner of failures in source execution, Context request meaning, or another distinct responsibility.

Propagation preserves semantic continuity. Making a failure observable elsewhere does not create a new owner. A receiver's reaction and downstream consequence remain distinct from the originating failure.

Context owns candidate preparation and therefore its failure consequence. That consequence describes Context-owned work, not the originating failure. Limiting it to the affected candidate preserves Active and stable historical revisions. Brain follows the same separation for its final cognitive result.

# Alternatives Considered

## Context Owns Every Collaboration Failure

Rejected because collaboration ownership does not absorb other capability semantics. Context owns its candidate response, not every failure observed during preparation.

## Brain Owns Every Cognitive Failure

Rejected because orchestration and final-result construction do not confer ownership of the capabilities Brain coordinates. A downstream Brain consequence is different from the originating failure.

## Security Owns Every Failure Involving Authorization

Rejected because authorization relevance does not erase source, Context, or protected-boundary responsibilities. Security ownership applies where Security-owned authorization meaning or decisions failed.

## Ownership Transfers to the Receiver or Consumer

Rejected because reception and consumption identify where a failure becomes observable or consequential, not which architectural responsibility defines its meaning.

## Propagation Creates or Replaces a Boundary-Local Failure

Rejected because recreation or replacement would sever semantic continuity, make ownership depend on topology, and obscure the responsibility that originally failed.

## Propagation Automatically Aggregates Failures

Rejected because independent failures can arise from different accepted responsibilities. Boundary crossing alone supplies no basis for merging their identities or ownership.

## Every Failure Invalidates Every Context Revision

Rejected because one candidate's incomplete preparation does not alter unrelated preparation histories or the stable evidence boundary of an existing revision.

## Candidate Consequence Transfers the Failure to Context

Rejected because Context's authority over candidate preparation concerns the affected revision. It does not confer the source, authorization, or other semantic responsibility from which the failure arose.

# Consequences

- Every failure remains attributable to one accepted capability responsibility.
- Source, Context, Security, Brain, Bootstrap, and Core boundaries remain aligned with existing architecture.
- Retrieval-related failures remain classifiable by the particular retrieval responsibility involved.
- Authorization-failure meaning remains distinguishable from enforcement and other protected-participation failures.
- Cross-boundary observation preserves semantic continuity without creating another failure owner.
- Context can determine the effect on its candidate revision without acquiring the originating failure.
- Brain can determine a final-result consequence without becoming the owner of a subordinate failure.
- Active and stable historical Context Revisions remain insulated from failures affecting another candidate's preparation.
- Later technical representations are constrained by stable architectural meaning.
- No centralized failure capability is introduced.

# Risks

- Broad labels such as “retrieval failure” may conceal whether a source-owned or Context-owned responsibility actually failed.
- A receiver's local reaction may be mistaken for ownership of the propagated failure.
- Authorization relevance may be confused with Security ownership of every associated failure.
- Candidate rejection or abandonment may be mistaken for reclassification of the originating failure.
- Brain final-result construction may be described imprecisely as normalization of another capability's failure meaning.
- A future technical representation may accidentally replace semantic identity with boundary-local errors.
- Operational concerns may be added to this ownership decision before receiving their own architectural authority.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Active normative predecessor.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Active normative predecessor.
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md) — Active normative predecessor.
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md) — Active normative predecessor.
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md) — Active normative predecessor.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed transfer of capability responsibility, a new Context Source category with incompatible failure semantics, or a model that cannot preserve originating meaning across architectural boundaries.

Later accepted decisions concerning handling, recovery, retry, compensation, rollback, timeout, cancellation, ordering, aggregation policy, monitoring, logging, observability, tracing, alerting, persistence, replay, refresh, recollection, or asynchronous behavior may prompt review. Failure representations, serialization, Contracts, schemas, APIs, providers, transports, runtime sequencing, candidate lifecycle transitions, validation criteria, activation behavior, and implementation mechanisms remain outside this ADR.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-06 | Initial draft derived from the non-normative source decision record. |
| 1.0.0   | 2026-08-09 | Approved architectural decision.                                     |

# Engineering Motto

> Responsibility owns the failure. Propagation preserves its meaning. Context owns the candidate consequence.
