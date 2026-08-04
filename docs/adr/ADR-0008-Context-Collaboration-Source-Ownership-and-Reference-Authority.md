# ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority

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

O.R.I.O.N. prepares Context from information supplied by independent capability domains. Memory, Knowledge, and future accepted Context Sources may contribute references for consideration while retaining their established domain responsibilities. This preparation model presents a separate architectural question about which supplied references participate in a Context Revision.

This collaboration crosses capability boundaries without changing the dependency direction, Contract custody, or capability ownership established by the existing architecture. The Core remains the custodian of shared architectural language, and participating capabilities remain independent. Communication and composition therefore cannot be treated as implicit transfers of meaning or authority.

This ADR addresses the relationship among collaboration, source semantics, Context incorporation, reference authority, authority verification, and authority preservation. Before this decision, later documents could have assigned the same responsibility to multiple participants or inferred ownership from representation, custody, composition, transport, or consumption.

# Problem Statement

The architectural problem is to identify accountability for the collaboration through which references become available to Context while preserving the semantic responsibility of every contributing source. It also concerns the identity of the participant that decides whether a supplied reference becomes Context content.

The related authority problem concerns preservation of a reference's authority when that reference crosses capability boundaries. Explicit responsibility for authority origin, verification, and preservation prevents receipt, representation, composition, or consumption from being mistaken for replacement authority.

The relevant compatibility baseline consists of capability-oriented ownership, inward dependency direction, Core Contract custody, Engine independence, and the established semantic partition among Memory, Knowledge, and Context.

# Decision

### Ownership

1. **D-001 — Collaboration ownership.** The Context capability owns the architectural semantics of the collaboration through which appropriately authorized, source-issued cognitive references are made available for Context consideration.
2. **D-002 — Source semantic ownership.** Each participating source capability retains semantic ownership of the information, references, and source results it produces within its source boundary. Supplying, representing, or incorporating a reference does not transfer that source-domain meaning to Context or another participant.
3. **D-003 — Context incorporation ownership.** The Context capability exclusively owns the semantic decision to incorporate a supplied cognitive reference into a Context Revision. Availability, authority, verification, authorization, composition, or downstream demand does not independently constitute incorporation.

### Reference Authority

4. **D-004 — Authority origin.** The capability that issues a cognitive reference is the origin of that reference's authority. Source semantic ownership and reference authority origin are related but distinct architectural responsibilities. Context incorporation and cross-boundary participation do not create a replacement authority origin.
5. **D-005 — Authority verification ownership.** The issuing source capability owns verification of the authority carried by the cognitive reference it issues. Another capability MAY invoke issuer-owned verification. Consuming the verification result MUST NOT transfer authority, verification ownership, or source semantic ownership. Another participant's structural validation, acceptance, custody, composition, or use does not replace issuer-owned authority verification.
6. **D-006 — Authority preservation.** The issued reference MUST remain attributable to its issuing source, and its source-established authority MUST remain associated with that reference across representation, verification, composition, custody, communication, incorporation, and consumption boundaries. Those boundaries MUST NOT transfer, detach, recreate, or independently mint the reference's authority.

# Rationale

The selected boundary follows capability responsibility rather than data location or runtime participation. Locating collaboration and incorporation responsibility in Context aligns both concerns with construction of Context. Retaining source accountability for contributed meaning avoids treating contextual selection as a redefinition of another capability's domain.

Separating availability from incorporation prevents retrieval, delivery, authority, or downstream interest from silently changing Context. It also preserves a single accountable decision point for what becomes part of a Context Revision without centralizing the semantics of every participating source.

The issuer-based authority boundary aligns semantic origin and provenance with the capability qualified to establish them. The corresponding verification allocation avoids reconstruction by a consumer that lacks the source's domain responsibility. Continuous attribution supports explainability across architectural boundaries and prevents representation or copying from appearing to create authority.

This allocation also explains the distinction between schema custody and domain behavior: Core custody of shared definitions does not imply responsibility for Context collaboration, source meaning, incorporation, or reference authority. Composition and communication connect participants without supplying a basis for changing their established responsibilities.

# Alternatives Considered

## Transfer Ownership to a Receiving or Coordinating Participant

Rejected. Moving source meaning or reference authority to Context, Brain, Bootstrap, Core, Security, transport, or a downstream consumer would make responsibility depend on where a reference happens to travel. It would also conflict with capability-oriented ownership and obscure the source-domain meaning that the reference represents.

## Establish Shared or Emergent Ownership

Rejected. Shared or emergent ownership would prevent the platform from identifying one accountable capability for collaboration, source semantics, incorporation, authority origin, and verification. Participation in the same flow is not sufficient reason to merge distinct responsibilities.

## Treat Availability or Authority as Incorporation

Rejected. A reference may be available and source-authoritative without being selected as Context content. Collapsing those states would allow sources, retrieval, verification, or consumers to bypass the Context-owned incorporation decision.

## Recreate Authority after a Boundary Crossing

Rejected. Reissuing, copying, normalizing, composing, transporting, or consuming a reference cannot reproduce the source responsibility from which its authority originated. Replacement authority would break provenance and permit non-source participants to represent themselves as the authority origin.

## Assign Verification to a Central Participant

Rejected. A central verifier would become a substitute source authority or would claim domain knowledge it does not own. Common structural checks may support collaboration, but they cannot replace verification governed by the issuing source.

# Consequences

- The selected allocation provides one accountable capability boundary for Context collaboration.
- The separation of responsibilities keeps source-domain meaning distinguishable from Context content.
- The incorporation boundary keeps candidate availability distinguishable from incorporation.
- Continuous source attribution supports reference-authority continuity across capability boundaries.
- The non-transfer boundary prevents representation, custody, composition, communication, and consumption from being treated as ownership or authority creation.
- The allocation remains compatible with the established separation between Core custody and capability semantic ownership.
- Independent capability evolution does not depend on transferring participating domains into Context.
- These boundaries provide the compatibility baseline for later lifecycle, retrieval, currentness, authorization, failure, composition, orchestration, persistence, and execution decisions.

# Risks

- Implementations may accidentally treat a Context representation as a replacement source record.
- A shared utility may be mistaken for the semantic owner because it performs structural checks or carries references.
- Cross-boundary normalization may lose source attribution even when the logical reference remains recognizable.
- Broad use of the word "validation" may blur Context validation and issuer-owned authority verification.
- Future source types may expose insufficient provenance to preserve the required authority association.
- Overextending this ADR into later Context concerns could preempt decisions that require separate authority.

These risks arise when later specifications obscure the accepted boundary or imply additional ownership.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant future-review triggers include a new category of Context Source, a change to the platform's source-reference authority model, a proposal for shared semantic ownership, or a cross-runtime authority model unable to preserve issuer attribution.

A proposed revision to an existing ADR or Concept that conflicts with the ownership or authority boundaries established here is also a future-review trigger.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-04 | Initial draft derived from the non-normative source decision record. |

# Engineering Motto

> Context decides what participates. Sources retain what their references mean and why they are authoritative.
