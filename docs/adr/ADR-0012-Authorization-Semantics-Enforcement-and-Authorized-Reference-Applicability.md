# ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability

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

Context Revision preparation can request cognitive references from independent source capabilities. Context owns retrieval initiation and request meaning, each source owns retrieval execution and its own returned meaning, and Context owns the aggregate meaning of candidates made available for consideration. Separate ownership also governs source authority, authority verification, currentness, and incorporation.

Participation across these capability boundaries may be protected. Permission for participation introduces three related architectural questions: which capability owns authorization meaning, which boundary applies an authorization decision, and what remains true about that decision after a reference passes through the protected boundary.

Existing architecture already separates Security-owned decisions from enforcement in other protected interactions. ADR-0008 through ADR-0011 provide Draft provisional predecessors for cognitive-reference authority, Context Revision stability, retrieval semantics, and currentness. This ADR specializes the authorization boundary for retrieval participation without redefining those responsibilities or treating a Draft predecessor as approved authority.

# Problem Statement

Without an explicit separation, authorization could be confused with source authority, retrieval meaning, currentness, or incorporation. A capability enforcing a decision could appear to acquire Security semantics, and a returned reference could appear authorized merely because it is present after retrieval or delivery.

Authorization applicability presents a further ambiguity. The architectural relevance of a Security-owned decision needs to remain associated with the protected participation and references it governed. That association cannot become a transfer of authorization ownership, a renewed authorization decision, or permission for unrelated later retrieval.

The architecture therefore needs one coherent boundary covering authorization semantics, enforcement responsibility, and authorized-reference applicability while preserving every established source and Context owner.

# Decision

## Authorization Semantics

1. Security MUST own authorization semantics and authorization decisions governing participation in retrieval of cognitive references during Context Revision preparation.
2. Authorization MUST determine whether retrieval participation is permitted under Security-owned semantics; it MUST NOT define what retrieval means.
3. Context MAY initiate retrieval without authorizing it, and participating sources MAY execute permitted retrieval within their source boundaries without acquiring authorization ownership.
4. Brain orchestration, Bootstrap composition, Core custody, transport, delivery, retrieval participation, or downstream consumption MUST NOT confer authorization ownership.
5. Authorization MUST remain distinct from source semantics, source authority, authority verification, retrieval initiation, retrieval request semantics, retrieval execution, source-result semantics, aggregate returned-set semantics, source currentness, contextual currentness, candidate availability, Context incorporation, and Context Revision lifecycle.
6. Authorization MUST NOT transfer semantic ownership, authority origin, or authority-verification ownership.
7. Authorization MUST NOT determine retrieval initiation, retrieval request semantics, retrieval execution, aggregate returned-set semantics, source currentness, contextual currentness, or Context incorporation.
8. Source authority MUST NOT by itself establish authorization, and authorization MUST NOT create, originate, or verify source authority.
9. Authorization-semantic ownership MUST NOT introduce a new capability.

## Authorization Enforcement

1. Applicable protected, Security-governed architectural boundaries MUST own enforcement of Security-owned authorization decisions for retrieval participation.
2. Authorization enforcement MUST apply an applicable Security-owned decision without originating, owning, reinterpreting, replacing, or independently recreating that decision.
3. Authorization enforcement and authorization-semantic ownership MUST remain distinct architectural responsibilities.
4. A capability participating at a protected boundary MAY invoke or depend on Security-owned authorization without acquiring Security semantics or authorization ownership.
5. An applicable protected boundary MUST NOT become a source-semantic, source-authority, authority-verification, retrieval-semantic, currentness, incorporation, Context-lifecycle, or Security-semantic owner by enforcing authorization.
6. Enforcement MUST NOT determine retrieval initiation, retrieval request semantics, retrieval execution, source-result semantics, aggregate returned-set semantics, source currentness, contextual currentness, candidate availability, or Context incorporation.
7. Brain MUST NOT acquire enforcement ownership by orchestrating a cognitive cycle; Bootstrap MUST NOT acquire it through composition; Core MUST NOT acquire it through custody; and transport or delivery MUST NOT acquire it by conveying requests, results, or references.
8. Authorization enforcement MUST NOT introduce a new capability.

## Authorized-Reference Applicability

1. The applicability of a Security-owned authorization decision MUST remain architecturally associated with the protected retrieval participation it governed and with references permitted through that boundary.
2. Authorization applicability MUST remain distinct from authorization semantics, authorization ownership, and authorization enforcement.
3. An authorized reference MUST mean only that the applicability of a Security-owned authorization decision remains associated with the governed participation and the reference permitted through the applicable protected boundary.
4. Preserving authorization applicability MUST NOT transfer authorization ownership or Security semantics to an enforcing source, Context, Brain, Bootstrap, Core, transport, delivery, or another participant.
5. Authorization applicability MUST NOT create, originate, transfer, or verify source authority; redefine source semantics; establish source currentness or contextual currentness; determine candidate suitability; or constitute Context incorporation.
6. Returning, transporting, delivering, receiving, considering, or incorporating a reference MUST NOT by itself prove, recreate, or renew authorization.
7. Historical authorization MUST NOT automatically establish later authorization applicability.
8. Authorization applicability MUST NOT renew authorization or by itself authorize later retrieval participation.
9. Authorization applicability MUST NOT reopen, enrich, or mutate a Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active.
10. Authorization applicability MUST NOT introduce a new capability.

# Rationale

Security owns authorization because permission semantics belong to the capability responsible for security decisions. Context can express a need for cognitive references without deciding whether participation is permitted. Sources can satisfy permitted requests without becoming owners of the Security decision that allowed participation.

Authority and authorization answer different questions. Source authority concerns the origin of trust or validity associated with a source-issued reference, while authorization concerns permission for participation. Keeping them separate prevents a source-authoritative reference from being treated as automatically permitted and prevents authorization from appearing to create cognitive authority.

Enforcement belongs at the applicable protected boundary because that is where permitted participation is applied. The boundary uses a Security-owned decision but does not gain the policy meaning or decision ownership behind it. This preserves the accepted general separation between Security semantics and protected-boundary enforcement while specializing it to Context retrieval participation.

Authorization applicability records the continued architectural relevance of the decision to the participation and references it governed. It is not another authorization decision or another semantic owner. This distinction allows governed references to remain attributable to the protected participation without implying that presence proves authorization or that an earlier decision grants permission indefinitely.

# Alternatives Considered

## Context, a Source, or Brain Owns Authorization

Rejected because Context owns retrieval and incorporation concerns, sources own their semantic domains, and Brain owns orchestration. None of those responsibilities confers Security authorization semantics.

## Source Authority Implies Authorization

Rejected because cognitive authority and permission for retrieval participation are separate architectural dimensions.

## Authorization Determines Retrieval or Incorporation

Rejected because permission to participate does not define request meaning, execution, returned candidates, suitability, or the Context incorporation decision.

## Security Owns Every Enforcement Boundary

Rejected because Security owns authorization semantics and decisions, while applicable protected boundaries apply those decisions without acquiring Security ownership.

## Enforcement Transfers Authorization Ownership

Rejected because applying a Security-owned decision does not create authority to reinterpret or replace it.

## Returned Presence Proves Authorization

Rejected because a returned reference can be present without proving which decision or protected participation governed it.

## Earlier Authorization Automatically Applies to Later Retrieval

Rejected because preserving historical applicability is not authorization renewal and does not independently permit another retrieval participation.

# Consequences

- Security remains the single owner of authorization semantics and decisions.
- Applicable protected boundaries have one enforcement responsibility without becoming Security-semantic owners.
- Context retains retrieval initiation, request meaning, aggregate returned-set meaning, contextual currentness, and incorporation.
- Sources retain source semantics, retrieval execution, source-result meaning, source authority, authority verification, lifecycle, and source currentness.
- Authorization constrains participation without determining retrieval or Context meaning.
- Authorized-reference applicability remains associated with the governed participation without transferring ownership.
- A returned reference remains a candidate even when its participation was authorized.
- Historical authorization supplies no automatic permission for later retrieval.
- Existing Context Revision lifecycle and immutability boundaries remain unchanged.

# Risks

- The word “authority” may be used imprecisely for Security authorization and source cognitive authority.
- A protected source boundary may be mistaken for the owner of the decision it enforces.
- Authorization applicability may be mistaken for a reusable or renewed authorization decision.
- A returned reference may be assumed authorized merely because it is available to Context.
- Permitted participation may be mistaken for contextual suitability or incorporation.
- Future authorization representation may accidentally transfer Security semantics to another capability.
- Later failure, expiration, or revocation work may blur authorization ownership and enforcement responsibility.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Draft provisional predecessor while applicable.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Draft provisional predecessor while applicable.
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md) — Draft provisional predecessor while applicable.
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md) — Draft provisional predecessor while applicable.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed change to Security authorization ownership, protected-boundary enforcement responsibility, or the architectural association of authorization applicability with governed retrieval participation.

Later accepted decisions concerning authorization representation, duration, expiration, revocation, failure handling, persistence, replay, refresh, recollection, or asynchronous participation may also prompt review. Authentication, identities, credentials, tokens, policy engines, access-control models, encryption, APIs, Contracts, schemas, providers, transports, runtime sequencing, retrieval algorithms, and implementation mechanisms remain outside this ADR.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-04 | Initial draft derived from the non-normative source decision record. |

# Engineering Motto

> Security decides. Protected boundaries enforce. Applicability preserves relevance without transferring ownership.
