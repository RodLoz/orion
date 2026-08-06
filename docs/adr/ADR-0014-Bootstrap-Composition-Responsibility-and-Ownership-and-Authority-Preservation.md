# ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Draft                 |
| **Version**       | 0.1.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-06            |
| **Updated**       | 2026-08-06            |
| **Decision Type** | Architecture Decision |

---

# Context

Cognitive-reference collaboration connects Context with independent source capabilities, issuer-owned authority verification, Security-governed protected boundaries, and capability-owned failure propagation. The accepted architecture assigns a distinct meaning and owner to each responsibility participating in these relationships. Context owns collaboration purpose, retrieval initiation and request meaning, aggregate returned-set meaning, contextual currentness, incorporation, and Context Revision responsibilities. Sources retain their semantics, retrieval execution, source results, authority, verification, lifecycle, and source currentness. Security retains authorization semantics and decisions, while applicable protected boundaries retain enforcement responsibility.

These responsibilities require architectural assembly. Concrete participants need to be selected and connected without allowing their arrangement, implementation, or communication path to redefine relationships accepted by higher architectural authority. Bootstrap is the application-boundary responsibility suited to this assembly, while Core provides custody for shared architectural language and approved Contracts.

Architectural composition is distinct from Context composition. Bootstrap composition concerns the assembly of concrete participants across approved capability relationships. Context composition concerns the Context-owned preparation and incorporation of information into a Context Revision. Architectural composition is also distinct from Brain orchestration, which concerns the high-level cognitive flow rather than assembly of concrete implementations.

Existing ADRs establish the collaboration, ownership, authority, lifecycle, retrieval, currentness, authorization, and failure boundaries that composition must preserve. This ADR formalizes which of those relationships Bootstrap assembles and establishes that assembly cannot become a new source of ownership or authority.

# Problem Statement

Without an explicit composition owner, approved relationships could be assembled implicitly or independently by Context, Brain, Security, sources, Providers, Adapters, transports, or the participating implementations themselves. That would make architectural connectivity depend on runtime topology and obscure accountability for selecting and connecting concrete participants.

Assigning composition to Bootstrap creates a separate risk if composition is confused with the behavior performed through a relationship. Connecting Context to a source could appear to confer retrieval semantics or source authority. Connecting an issuer-owned verifier could appear to make Bootstrap the verifier. Connecting a protected relationship could appear to confer authorization or enforcement ownership. Connecting a failure path could appear to transfer the failure to the composer.

Core Contract custody creates another possible ambiguity. Shared architectural language needs one canonical custodian, but custody cannot make Core the semantic owner, runtime authority, or composer of the capabilities described by that language. Likewise, selection or replacement of a concrete implementation cannot expand the responsibility expressed by its Contract.

The architecture therefore needs one coherent boundary identifying Bootstrap's composition responsibility while preserving every previously accepted capability, authority, Security, lifecycle, Context, failure, and orchestration owner.

# Decision

## Composition Responsibility

D-022

1. Bootstrap MUST own architectural composition of approved cognitive-reference collaboration relationships.
2. Bootstrap MUST compose only relationships already accepted by higher architectural authority.
3. Bootstrap MUST select and connect concrete participants through approved, Core-custodied Contracts.
4. Composition MUST remain an assembly responsibility and MUST NOT become ownership of behavior performed through a composed relationship.
5. Bootstrap MUST NOT redefine the accepted relationship, architectural meaning, or responsibility allocation expressed by an approved Contract.
6. Shared, implicit, ownerless, Provider-owned, Adapter-owned, transport-owned, participant-self-owned, or implementation-defined composition MUST NOT be introduced.
7. Bootstrap MUST assemble the approved Context-to-source relationship for Context-owned retrieval requests.
8. Bootstrap MUST assemble the approved source-to-Context relationship for returned candidate-reference sets.
9. Bootstrap MUST assemble the approved Context-to-issuer relationship for issuer-owned authority verification where required.
10. Bootstrap MUST assemble approved Security-governed protected relationships for retrieval participation.
11. Bootstrap MUST assemble the approved relationship for delivery of permitted source-issued references to Context for Context-owned contextual-currentness evaluation and incorporation.
12. Bootstrap MUST assemble the approved relationship for propagation of capability-owned failures without ownership transfer.
13. Bootstrap MUST NOT initiate retrieval, interpret retrieval requests, interpret source results, perform authority verification, authorize retrieval participation, enforce authorization, evaluate contextual currentness, incorporate references, or own propagated failures by assembling those relationships.

## Composition Without Ownership or Authority Transfer

D-023

1. Composition MUST NOT create, transfer, merge, delegate, redistribute, reconstruct, replace, or reinterpret capability semantic ownership, source authority, authority origin, authority-verification ownership, Security authorization semantics, Security authorization decisions, enforcement responsibility, source lifecycle ownership, Context lifecycle ownership, source-currentness ownership, contextual-currentness ownership, Context incorporation ownership, failure ownership, Brain orchestration ownership, or final cognitive result ownership.
2. Bootstrap MAY connect accepted participants without becoming their semantic owner.
3. Bootstrap MAY connect participants to issuer-owned authority verification without becoming the issuer, verifier, verification owner, or source of authority.
4. Bootstrap MAY compose Security-governed protected relationships without becoming the authorization owner or enforcement owner.
5. Selecting or replacing a concrete implementation MUST NOT redefine accepted architecture.
6. A replacement implementation MUST satisfy the same approved Contract and preserve the same accepted responsibility boundary.
7. Provider, Adapter, transport, or participant selection MUST NOT determine architectural ownership or authority.
8. Core MUST remain the custodian of approved shared architectural language and Contracts.
9. Core custody MUST NOT confer capability semantics, authority, authority-verification ownership, authorization ownership, enforcement ownership, lifecycle ownership, currentness ownership, incorporation ownership, failure ownership, Brain orchestration ownership, or Bootstrap composition ownership.
10. Bootstrap MUST NOT become Brain, perform cognitive orchestration, own cognitive sequencing, or own final cognitive result assembly.
11. Brain MUST NOT acquire Bootstrap composition ownership through orchestration, participation, or consumption of composed relationships.
12. Brain-specific composition MUST remain outside this decision.
13. Bootstrap MUST NOT perform Context behavior.
14. Bootstrap MUST NOT acquire retrieval ownership, retrieval-request semantics, aggregate returned-set semantics, contextual-currentness ownership, incorporation ownership, validation ownership, activation ownership, or Context Revision ownership through composition.

# Rationale

Bootstrap owns architectural assembly because composition occurs at the boundary where concrete implementations are selected and connected to approved inward-facing abstractions. This placement preserves dependency direction: capability implementations depend on approved Contracts, while Core remains independent of concrete participants and capability-to-capability implementation references remain unnecessary.

The six composed relationships are not new collaboration semantics. They are the connectivity required to realize boundaries already allocated by ADR-0008 through ADR-0013. Context still supplies the purpose and aggregate meaning of retrieval collaboration. Each source still interprets and executes requests within its domain and owns what it returns. Bootstrap makes those participants available to one another without performing their work.

The authority-verification relationship illustrates why assembly and authority must remain separate. Binding an issuing source or its verifier into an approved relationship does not make Bootstrap the issuer, originate authority, or transfer verification responsibility. The same separation applies to Security: composition can connect a protected relationship without deciding whether participation is authorized or applying the decision at the protected boundary.

Core custody and Bootstrap composition answer different architectural questions. Core provides the canonical shared language through which an accepted boundary is expressed. Bootstrap selects and connects concrete participants conforming to that language. Neither responsibility supplies the capability meaning, authority, or runtime behavior expressed through the Contract.

Implementation replaceability follows from this separation. A concrete implementation can change while the accepted Contract and responsibility boundary remain stable. If selection itself could change semantics or authority, architecture would become dependent on configuration or deployment rather than approved decisions.

Brain remains outside the cognitive-reference composition boundary addressed here. Brain's high-level orchestration responsibility does not make it the assembler of concrete Context collaboration participants, and Bootstrap's assembly responsibility does not make it the owner of cognitive sequencing or final-result construction. The later Brain decisions can therefore build upon a stable composition boundary without being anticipated here.

# Alternatives Considered

## Context Composes the Architectural Collaboration

Rejected because Context owns collaboration meaning and Context Revision behavior, not application-boundary selection and assembly of concrete implementations. Combining these responsibilities would blur semantic ownership with architectural wiring.

## Brain Composes the Architectural Collaboration

Rejected because Brain owns high-level cognitive orchestration rather than concrete participant assembly. It would also preempt the later decisions governing Brain-specific cognitive-reference participation.

## Core Selects and Composes Participants

Rejected because Core custodies shared architectural language and remains independent of concrete implementations. Runtime selection in Core would reverse dependency direction and confuse custody with composition ownership.

## Sources Compose Themselves

Rejected because a source owns its domain responsibilities, not the surrounding collaboration. Self-composition would make independent source implementations responsible for external architecture and weaken replaceability.

## Security Composes Protected Collaboration

Rejected because Security governance supplies authorization semantics, not ownership of the collaboration being protected. Composition is separate from both authorization and enforcement.

## Providers, Adapters, or Transports Own Composition

Rejected because these are replaceable realization concerns. Allowing them to determine approved relationships would make architectural responsibility depend on implementation choice.

## Contracts or Core Custody Create Shared Authority

Rejected because Contracts express independently owned boundaries. Their custody, implementation, invocation, or consumption does not merge semantic ownership or mint authority.

## Implementation Selection Redefines Responsibility

Rejected because implementation selection operates within an accepted Contract boundary. Treating selection as architectural redefinition would bypass the authority required to approve architectural change.

## Composition Creates Composite Authority

Rejected because authority cannot emerge from assembly topology. Source authority, issuer-owned verification, Security authorization, and capability semantics retain their accepted origins and owners.

# Consequences

- Bootstrap has one accountable architectural assembly responsibility for the accepted cognitive-reference relationships.
- The composed relationship set covers requests, candidate returns, authority verification, protected participation, permitted-reference delivery, and failure propagation.
- Composition remains distinguishable from the behavior available through each relationship.
- Context and source retrieval responsibilities remain independently owned.
- Source authority and issuer-owned verification remain unchanged when their participants are connected.
- Security authorization and protected-boundary enforcement remain separate from composition.
- Core Contract custody remains separate from capability meaning and concrete participant selection.
- Concrete implementations remain replaceable within stable Contract and responsibility boundaries.
- Context behavior remains with Context, including currentness evaluation, incorporation, validation, activation, and revision responsibilities.
- Brain orchestration and final-result responsibilities remain separate from Bootstrap assembly.
- Capability-owned failures retain their ownership while crossing composed relationships.
- No new capability or composite authority is introduced.

# Risks

- The term “composition” may be confused with Context composition of references into a Context Revision.
- Concrete participant selection may be mistaken for permission to change architectural policy.
- Wiring an issuer-owned verifier may be described imprecisely as Bootstrap verification.
- Composition of a protected relationship may be mistaken for authorization or enforcement.
- Core custody may be interpreted as ownership of behavior expressed through a Contract.
- Provider, Adapter, or transport configuration may accidentally encode relationships not approved by architecture.
- Future Brain work may blur orchestration with participant assembly.
- Implementation documentation may describe Bootstrap as performing capability behavior rather than connecting its owner.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0004 — Separation of Skills, Providers and Adapters](ADR-0004-Separation-of-Skills-Providers-and-Adapters.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Draft provisional predecessor while applicable.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Draft provisional predecessor while applicable.
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md) — Draft provisional predecessor while applicable.
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md) — Draft provisional predecessor while applicable.
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md) — Draft provisional predecessor while applicable.
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md) — Draft provisional predecessor while applicable.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed change to Bootstrap composition ownership, Core Contract custody, the accepted cognitive-reference relationship set, or the rule that implementation selection preserves architectural responsibility.

Brain-specific cognitive-reference participation, cognitive orchestration, and final-result assembly remain for later architectural decisions. Contract names and schemas, APIs, dependency injection, service discovery, registries, Providers, Adapters, transports, deployment topology, runtime sequencing, implementation mechanisms, persistence, replay, asynchronous behavior, refresh, and configurable policy remain outside this ADR.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-06 | Initial draft derived from the non-normative source decision record. |

# Engineering Motto

> Bootstrap assembles approved relationships. Contracts preserve the boundary. Composition never creates authority.
