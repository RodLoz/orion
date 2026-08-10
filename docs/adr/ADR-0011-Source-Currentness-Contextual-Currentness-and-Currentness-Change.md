# ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-04            |
| **Updated**       | 2026-08-09            |
| **Decision Type** | Architecture Decision |

---

# Context

Cognitive references participate in Context preparation while retaining the semantics, lifecycle, and authority of their issuing sources. Retrieval can make those references available, and Context can consider them for incorporation into a Context Revision. Those established boundaries do not determine whether a reference still reflects its source-owned state or whether it remains suitable for the particular Context Revision under preparation.

Currentness therefore has two architectural dimensions. Source currentness concerns a reference's standing within the issuing source's domain. Contextual currentness concerns the suitability of a source-current reference for a specific Context Revision. A change in either dimension also raises a historical-integrity question after the revision's incorporated-reference set is stable or its lifecycle state is Active.

ADR-0008 through ADR-0010 are Active normative predecessors for source ownership, reference authority, Context Revision preparation, stability, retrieval, and candidate availability. This ADR preserves their accepted boundaries and addresses only the currentness boundaries formalized here.

---

# Problem Statement

If source currentness and contextual currentness are treated as one determination, Context could absorb a source's semantic lifecycle or a source could decide cross-source suitability for Context. If currentness is inferred from retrieval, delivery, incorporation, authority, or authorization, participation in a collaboration could silently replace the judgment of the responsible capability.

Later currentness change creates a second ambiguity. Rewriting an existing Context Revision would change the evidence accepted for its reasoning cycle. Preserving that historical evidence, however, does not mean that the reference remains current or suitable for later use. The architecture needs a single ownership and change model that keeps historical integrity separate from present currentness and future suitability.

---

# Decision

## D-013 — Source Currentness

1. Each issuing source MUST own the architectural determination of source currentness for every cognitive reference it issues.
2. Source currentness MUST concern the reference's standing within the issuing source's semantic and lifecycle boundary.
3. Source semantics and source currentness MUST remain distinct architectural responsibilities even when the issuing source owns both.
4. Context, Brain, Security, Bootstrap, Core, transport, and downstream consumers MUST NOT acquire source-currentness ownership through participation, custody, communication, delivery, incorporation, or consumption.
5. Reference authority, authority verification, authorization, retrieval, delivery, and incorporation MUST NOT by themselves establish source currentness.
6. A returned or incorporated reference MUST NOT thereby be declared source-current.
7. Source-currentness ownership MUST NOT introduce a new capability.

## D-014 — Contextual Currentness

1. Context MUST own the architectural determination of contextual currentness for a source-current cognitive reference considered during Context Revision preparation.
2. Contextual currentness MUST concern the reference's suitability for the particular Context Revision under preparation.
3. Source currentness and contextual currentness MUST remain distinct architectural responsibilities.
4. A source-current reference MUST NOT thereby be considered contextually current.
5. Contextual-currentness determination MUST NOT redefine source semantics, source lifecycle, source currentness, reference authority, or authority verification.
6. Retrieval, delivery, authority, authority verification, authorization, ranking, and selection MUST NOT by themselves establish contextual currentness.
7. Contextual currentness MUST remain distinct from incorporation; contextual suitability MUST NOT itself incorporate a reference into a Context Revision.
8. Downstream consumption MUST NOT transfer contextual-currentness ownership away from Context.
9. Contextual-currentness ownership MUST NOT introduce a new capability.

## D-015 — Currentness Change

1. A later source-currentness or contextual-currentness change MUST NOT mutate, remove, replace, reorder, or rewrite references within a Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active.
2. The existing Context Revision MUST remain an immutable historical record of the evidence accepted for its reasoning cycle.
3. Changed source currentness MUST affect possible future source eligibility, while changed contextual currentness MUST affect possible future Context suitability.
4. Later cognitive use of affected evidence MUST involve later Context preparation and, where applicable, a distinct successor Context Revision.
5. A currentness change MUST NOT by itself constitute refresh, recollection, Logical Reconstruction, or Exact Replay.
6. The issuing source MUST retain responsibility for source-currentness determinations within its semantic and lifecycle boundary, and Context MUST retain responsibility for contextual-currentness determinations during later Context preparation.
7. Currentness associated with an earlier Context Revision MUST NOT by itself establish present source currentness or present contextual currentness.
8. Currentness change MUST NOT establish or redefine reference authority, authority verification, authorization, incorporation, Context Revision identity, or historical integrity.
9. Historical preservation MUST NOT imply continuing source currentness or contextual suitability for later use.
10. Currentness change, historical integrity, future eligibility, future suitability, expiration, successor revision, and authority preservation MUST remain distinct architectural concerns.

---

# Rationale

The issuing source owns the semantics and lifecycle facts needed to determine whether its reference remains current within its own domain. Keeping that determination with the source prevents Context, orchestration, custody, transport, or consumption from replacing source-specific judgment. It also preserves the distinction between a reference's authority origin and its present standing within the source lifecycle.

Context owns contextual currentness because Context is responsible for relevance and composition for the revision under preparation. A source can establish that a reference remains current within its domain without determining whether it suits a particular cross-source contextual boundary. Context can make that suitability determination without redefining the source's meaning, lifecycle, currentness, or authority.

Separating currentness from retrieval and incorporation prevents availability from becoming an implicit declaration of currency. A reference can be requested, returned, or considered without either form of currentness being established by those events alone. Contextual suitability also remains different from the later incorporation concern.

Preserving an existing revision after a currentness change protects historical and diagnostic integrity. The revision continues to identify the evidence accepted for its reasoning cycle, while later preparation provides the architectural boundary for considering changed eligibility or suitability. Historical preservation records what was accepted previously; it makes no claim about present use.

The three decisions form one coherent boundary: the source governs source-domain standing, Context governs revision-specific suitability, and later changes affect future consideration without reopening historical Context.

---

# Alternatives Considered

## Context Owns Both Forms of Currentness

Rejected because Context-specific suitability does not confer ownership of source semantics or source lifecycle determinations.

---

## Each Source Owns Both Forms of Currentness

Rejected because a source can govern its own reference standing but does not own suitability for a Context Revision composed across capability domains.

---

## Brain, Security, Bootstrap, Core, or Transport Owns Currentness

Rejected because orchestration, authorization governance, composition, Contract custody, and communication do not supply either the source-domain or Context-specific semantic boundary.

---

## Retrieval, Delivery, or Incorporation Establishes Currentness

Rejected because availability and participation do not replace the currentness determination of the responsible capability.

---

## Source Currentness Automatically Establishes Contextual Currentness

Rejected because standing within a source domain does not establish suitability for a particular Context Revision.

---

## Currentness Change Mutates the Existing Revision

Rejected because mutation, removal, replacement, reordering, or rewriting would alter the evidence boundary accepted for the historical reasoning cycle.

---

## Historical Preservation Establishes Present Currentness

Rejected because retaining the earlier evidence boundary does not establish its current standing or suitability for later use.

---

# Consequences

- Every cognitive reference has one accountable source-currentness owner.
- Contextual suitability has one accountable Context owner.
- A source-current reference can remain unsuitable for a particular Context Revision.
- Retrieval, delivery, authority, authorization, ranking, selection, and incorporation remain distinguishable from currentness.
- Existing Context Revision history remains unchanged after a later currentness change.
- Source-currentness change can affect later source eligibility without transferring source ownership.
- Contextual-currentness change can affect later Context suitability without reopening an existing revision.
- Later Context preparation can consider changed currentness while preserving the earlier evidence boundary.
- Additional accepted sources can participate under the same ownership separation.

---

# Risks

- A generic freshness label may obscure which currentness owner made the determination.
- Source-provided metadata may be mistaken for a Context suitability decision.
- A returned or incorporated reference may be assumed current without the responsible determination.
- Historical evidence may be mistaken for evidence of present currentness.
- A later change signal may be treated as permission to rewrite an existing Context Revision.
- Later authorization, expiration, refresh, or failure work may accidentally absorb currentness ownership.
- Broad use of “current” may blur source-domain standing and Context-specific suitability.

---

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](<ADR-0005 — Memory Architecture Principles>)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md) — Active normative predecessor.
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md) — Active normative predecessor.
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md) — Active normative predecessor.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)

---

# Related Documents

- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

---

# Implementation Notes

Currentness algorithms, timestamps, freshness thresholds, scoring, ranking, Contract shapes, schemas, APIs, providers, transports, runtime sequencing, and implementation mechanisms remain deferred to later authoritative artifacts.

---

# Future Review

Relevant review triggers include a proposed change to source-currentness ownership, Context ownership of contextual suitability, or the historical-preservation boundary following a currentness change.

Later accepted decisions concerning authorization, revocation, expiration, failure handling, refresh, recollection, persistence, Logical Reconstruction, Exact Replay, asynchronous participation, or configurable policy may also prompt review. Those subjects remain outside this ADR.

---

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-04 | Initial draft derived from the non-normative source decision record. |
| 1.0.0   | 2026-08-09 | Approved architectural decision.                                     |

---

# Engineering Motto

> Sources determine what remains current in their domains; Context determines what remains suitable for the revision being prepared.
