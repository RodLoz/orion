# ADR-0015 — Brain Cognitive-Reference Orchestration and Final Cognitive Result Boundaries

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

Brain coordinates the broader cognitive sequence in which independently owned capabilities contribute authoritative work. Context participates in that sequence by preparing an authoritative Context Revision from cognitive references made available through its internal collaboration. Context owns the purpose and meaning of that collaboration, including retrieval initiation, request meaning, the aggregate meaning of returned candidates, contextual currentness, incorporation, validation, activation, and revision lifecycle responsibilities.

The capabilities contributing to Context retain their own boundaries. Sources retain source semantics, retrieval execution, source-result meaning, authority, verification, lifecycle, and source currentness. Security retains authorization semantics and decisions, while applicable protected boundaries retain enforcement responsibility. Bootstrap composes approved relationships, Core custodies their approved shared Contracts, and capability-owned failures retain the meaning established by the responsibility that failed.

Brain needs an authoritative Context output within the cognitive sequence, but this need does not make Brain the coordinator or owner of Context's internal source collaboration. Brain also produces a final cognitive result after coordinating authoritative capability outputs. Ownership of that result does not make Brain the semantic owner of the Context Revision, source references, authorization decisions, or capability failures that contributed to it.

This ADR establishes the boundary between Brain's outer orchestration and Context preparation, then establishes the related boundary between Brain's final cognitive result and its authoritative contributing inputs. It does not define the operational process used to realize either responsibility.

# Problem Statement

Without an explicit cognitive-reference orchestration boundary, Brain's ownership of the broader sequence could be interpreted as ownership of every activity inside Context preparation. Brain could appear permitted to initiate Context retrieval, coordinate sources directly, maintain its own candidate-reference set, determine currentness or incorporation, or create a parallel evidence snapshot. Any of those interpretations would bypass Context and duplicate responsibilities already allocated to Context and participating sources.

The authoritative output boundary also requires clarity. Brain consumes Context output rather than Context's internal candidate set, but consumption alone does not explain what Brain owns when it assembles the final cognitive result. If final-result ownership were treated as ownership of all inputs, Brain could absorb source meaning, Context lifecycle semantics, Security authorization, or capability-owned failure meaning.

Composition, custody, orchestration, capability output, and result assembly answer different architectural questions. Bootstrap connects concrete participants. Core custodies approved shared language. Context produces its authoritative output. Other capabilities produce outputs within their accepted domains. Brain coordinates these outputs and owns the concluding result of its orchestration without replacing any contributor.

The architecture therefore needs one coherent Brain boundary covering both its relationship to Context preparation and its ownership of the final cognitive result.

# Decision

## Cognitive-Reference Orchestration Boundary

D-024

1. Brain MUST own only the outer cognitive orchestration that places Context preparation within the broader cognitive sequence.
2. Brain MAY establish the need for an authoritative Context output.
3. Brain MAY invoke or depend on Context through an already composed, approved, Core-custodied Contract.
4. Brain MAY consume one authoritative Context output produced by Context.
5. Context MUST remain the sole owner of its internal cognitive-reference collaboration and Context Revision preparation.
6. Brain MUST NOT initiate retrieval for a Context Revision, define retrieval-request semantics, define aggregate returned-set semantics, interpret source requests or source results, execute source retrieval, or coordinate Context-to-source participation.
7. Brain MUST NOT receive or maintain an independent candidate-reference set or rank, filter, or maintain a parallel source-evidence set.
8. Brain MUST NOT determine source currentness, determine contextual currentness, decide incorporation, validate or activate a Context Revision, own incorporated-reference-set stability, own Context Revision succession, or own candidate-revision consequences.
9. Brain MUST NOT create a parallel cognitive-evidence snapshot or bypass Context to obtain source evidence for the same cognitive cycle.
10. Brain MUST NOT reopen, enrich, replace, or mutate an Active Context Revision or a Context Revision whose incorporated-reference set is stable.
11. Bootstrap MUST retain architectural composition ownership, and Core MUST retain custody of approved shared architectural language and Contracts.
12. Bootstrap composition and Core custody MUST NOT become Brain orchestration or Context behavior.

## Final Cognitive Result Boundary

D-025

1. Brain MUST own assembly of the final cognitive result.
2. Brain MUST own the architectural meaning of the final cognitive result as a Brain-owned orchestration outcome.
3. Brain MAY construct the final cognitive result from the authoritative Context output and other authoritative capability outputs.
4. Brain final-result ownership MUST remain distinct from ownership of its contributing inputs.
5. Every contributing capability MUST retain semantic ownership and authority over its own authoritative output.
6. Context MUST retain the authoritative Context Revision; Context collaboration and preparation semantics; retrieval-request and aggregate returned-set semantics; contextual currentness; incorporation; validation; activation; and Context Revision identity, lineage, lifecycle, stability, and immutability.
7. Each source MUST retain its source semantics, reference semantics, source-result semantics, source authority and authority origin, authority verification and preservation, source lifecycle, retrieval execution, and source currentness.
8. Security MUST retain authorization semantics and authorization decisions, and applicable protected boundaries MUST retain enforcement responsibility.
9. Capability-owned failures MUST retain their originating ownership and semantic identity.
10. Brain MAY own a downstream final-result consequence without acquiring or reinterpreting the originating failure.
11. Brain MUST NOT acquire ownership of contributing authoritative outputs, reinterpret or replace another capability's authoritative meaning, or independently validate another capability's authoritative output.
12. Brain MUST NOT create a replacement Context boundary, reopen or mutate the authoritative Context Revision, or treat incorporated references as independently Brain-owned evidence.
13. Brain MUST NOT mint source authority or cognitive authority through result assembly.
14. Brain MUST NOT acquire or reinterpret Security authorization.
15. Brain MUST NOT convert a capability-owned failure into a Brain-owned failure.
16. Transport and presentation MUST remain outside Brain final-result ownership.

# Rationale

Brain owns coordination of the broader cognitive sequence because it decides how accepted capability work contributes to a cognitive outcome. Context preparation remains one bounded capability contribution within that sequence. Treating Brain's need for Context as permission to coordinate Context's sources would collapse outer orchestration into Context behavior and create competing owners for retrieval and revision preparation.

One authoritative Context output provides the necessary boundary. Context can prepare a revision using its accepted collaboration while Brain depends only on the resulting authoritative output. Brain therefore coordinates Context as a capability rather than coordinating the internal source relationships through which Context fulfilled its responsibility.

The prohibition on a parallel evidence set preserves a single contextual evidence boundary. If Brain received source candidates independently, ranked them, or retained a competing snapshot, its final result could rely on evidence that Context had not evaluated for contextual currentness or incorporated. That would weaken the authority of the Context Revision and make the evidence basis of the cognitive cycle ambiguous.

Final-result ownership follows Brain's orchestration responsibility. The final cognitive result expresses the architectural conclusion of the sequence Brain coordinated, so its assembly and result-level meaning belong to Brain. That ownership is intentionally narrower than ownership of the authoritative outputs used to construct the result.

Each contributor remains authoritative only within its accepted boundary. Context output carries Context-owned meaning; a source-issued reference retains source meaning and authority; a Security decision retains authorization meaning; and a capability failure retains the meaning of the failed responsibility. Brain can express the consequence of these inputs without validating them again, reclassifying them, or absorbing their ownership.

Bootstrap composition and Core custody remain separate because they make the Brain-to-Context relationship available without performing either side's behavior. This separation lets implementations change while the Context and Brain boundaries remain stable.

# Alternatives Considered

## Brain Coordinates Context-to-Source Retrieval

Rejected because outer orchestration does not confer ownership of Context's internal collaboration. Direct source coordination would bypass Context-owned request, aggregate-set, currentness, incorporation, and revision responsibilities.

## Brain Maintains a Parallel Candidate or Evidence Set

Rejected because a competing evidence boundary could diverge from the authoritative Context Revision and expose the final result to references not incorporated by Context.

## Context Operates Outside Brain Orchestration

Rejected because Context owns its internal preparation while still participating as an accepted capability within the broader cognitive sequence coordinated by Brain.

## Bootstrap Performs Cognitive Orchestration

Rejected because Bootstrap owns assembly of approved relationships, not the cognitive sequence or capability behavior performed through those relationships.

## Brain Owns Every Contributing Output

Rejected because final-result ownership concerns the Brain-owned orchestration outcome. It does not transfer the independent semantic ownership or authority of capability outputs.

## Brain Replaces the Authoritative Context Revision

Rejected because Context remains the owner of Context Revision identity, lifecycle, stability, and incorporated content. A Brain result is a distinct architectural output rather than a replacement Context boundary.

## Final-Result Assembly Creates Authority

Rejected because assembly cannot originate source authority, reproduce issuer-owned verification, or create cognitive authority over contributing capability meaning.

## Context or Sources Jointly Own the Final Result

Rejected because contributors own their respective outputs, while Brain owns the concluding result as an outcome of its orchestration. Shared ownership would blur these separate responsibilities.

## A Consumer, Transport, or Presentation Layer Owns the Result

Rejected because delivery and presentation concern where a result travels or appears, not the orchestration responsibility that gives the final cognitive result its architectural meaning.

# Consequences

- Brain coordinates Context as one accepted capability within the broader cognitive sequence.
- Context retains one authoritative internal collaboration and evidence-preparation boundary.
- Brain consumes an authoritative Context output rather than source candidates or a parallel evidence set.
- Context Revision preparation, currentness, incorporation, validation, activation, and lifecycle remain with Context.
- Brain owns the final cognitive result without absorbing the ownership of authoritative contributing outputs.
- Source semantics and authority remain attributable to their issuing capabilities.
- Security authorization remains distinct from final-result ownership.
- Brain can express a downstream failure consequence while the originating capability remains accountable for the failure's meaning.
- Bootstrap composition and Core custody remain separate from Brain and Context behavior.
- Transport, presentation, and consumption do not create another final-result owner.
- No new capability, evidence boundary, authority origin, or shared ownership model is introduced.

# Risks

- Outer orchestration may be described imprecisely as Brain ownership of Context preparation.
- A Brain request for Context output may be mistaken for Brain-initiated source retrieval.
- Diagnostic access to source information may be mistaken for an independent Brain candidate set.
- Final-result ownership may be interpreted as ownership of every contributing artifact.
- Summarizing or expressing a capability consequence may be confused with reinterpretation of authoritative meaning.
- A final result containing incorporated references may be mistaken for a replacement Context Revision.
- Brain treatment of a failure may be mistaken for transfer of that failure's ownership.
- Transport or presentation concerns may be placed inside Brain's semantic result boundary.

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
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md) — Active normative predecessor.
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md) — Active normative predecessor.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed change to Brain outer orchestration, Context's authoritative output boundary, Brain final-result ownership, or the ownership retained by a contributing capability when its output informs a Brain result.

Brain orchestration algorithms, runtime ordering, stage scheduling, method calls, Contract names or shapes, APIs, schemas, Providers, transports, presentation mechanisms, persistence, Logical Reconstruction, Exact Replay, asynchronous participation, refresh, recollection, configurable retrieval policy, and implementation mechanisms remain outside this ADR.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-06 | Initial draft derived from the non-normative source decision record. |
| 1.0.0   | 2026-08-09 | Approved architectural decision.                                     |

# Engineering Motto

> Brain coordinates the sequence and owns its result. Context and every contributor retain their authoritative meaning.
