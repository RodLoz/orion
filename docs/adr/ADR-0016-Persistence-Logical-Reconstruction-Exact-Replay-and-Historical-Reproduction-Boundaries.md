# ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-07            |
| **Updated**       | 2026-08-09            |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. assigns each artifact, decision, and outcome to an accepted owner. Context owns Context Revision semantics and preparation. Sources retain source responsibilities. Security owns authorization. Brain owns outer cognitive orchestration and final cognitive results. Bootstrap owns composition, while Core custodies approved shared architectural language and Contracts.

Context Revisions, source references, authorization artifacts, capability outputs, failures, and final cognitive results may be persisted as historical evidence. That evidence may support Logical Reconstruction, Exact Replay, diagnostics, audit, explainability, or reproduction of another historical outcome.

Preservation and reproduction do not perform the work represented by retained evidence. Historical authority, verification, authorization, currentness, incorporation, failure, or result evidence does not create its present or newly executed counterpart.

Logical Reconstruction constructs a distinct revision from required authoritative evidence. Exact Replay exactly reproduces the revision consumed by an identified reasoning cycle. Neither is refresh, recollection, later Context preparation, or new cognitive execution.

This ADR establishes their architectural boundary while leaving mechanisms unresolved.

# Problem Statement

Persistence could be mistaken for semantic ownership or renewal. Retained Context could be misclassified as Memory, assigned a replacement identity, or treated as presently current or authorized merely because it remains available.

Logical Reconstruction could be confused with restoration of the original revision, erasing the distinction between a logically equivalent revision and the original identity, lifecycle history, and historical status.

Exact Replay could be broadened into reenactment of the surrounding execution, while approximate or logically equivalent reproduction could be described incorrectly as exact.

Retained failures and final cognitive results require neutral historical-reproduction language. Reproducing them does not make them Exact Replay or transfer their ownership.

One boundary must distinguish these concerns, preserve existing responsibilities, and keep new Context and Brain activity separate.

# Decision

D-026

## Persistence and Retention

1. Persistence MUST preserve an architectural artifact or representation without acquiring its semantics or ownership.
2. A persisted Context Revision MUST remain that same Context Revision.
3. Persistence MUST NOT create a successor, replacement, reconstructed, or replay Context Revision.
4. Persistence MUST NOT make Context into Memory.
5. Semantic role and authority, rather than persistence duration or storage location, MUST distinguish Memory from Context.
6. A retained representation MUST NOT become authoritative merely because it was retained.
7. Persistence MUST NOT create, transfer, renew, replace, or independently verify authority, and MUST NOT renew or repeat authority verification.
8. Persistence MUST NOT renew authorization or establish present permission.
9. Persistence MUST NOT establish present source currentness or present contextual currentness.
10. Persistence MUST NOT rerun retrieval or incorporation.
11. Persistence MUST NOT constitute new Context preparation.
12. Persistence MUST NOT constitute new Brain cognitive execution.
13. Retained immutable evidence MUST remain historical evidence retained without mutation; retention alone MUST NOT establish authority or evidence sufficiency.

## Historical Evidence

1. Historical evidence MUST preserve evidence of an earlier architectural artifact, state, decision, verification, authorization, currentness determination, incorporation, failure, or cognitive result.
2. A historical representation MUST NOT acquire ownership of what it represents.
3. Historical evidence MUST remain attributable to its original architectural owner.
4. Historical evidence of authority MUST NOT constitute present or newly issued authority.
5. Historical evidence of authority verification MUST NOT constitute new verification.
6. Historical authorization MUST NOT constitute present authorization or renewed permission.
7. Historical source currentness MUST NOT establish present source currentness.
8. Historical contextual currentness MUST NOT establish present contextual currentness.
9. Historical evidence of incorporation MUST NOT constitute a new incorporation decision.
10. Historical evidence of a capability-owned failure MUST NOT create new failure ownership.
11. Historical evidence of a Brain-owned final cognitive result MUST NOT constitute new Brain cognitive execution or a newly assembled final cognitive result.
12. Historical evidence MUST preserve attribution; it MUST NOT convert historical architectural facts into present architectural acts or states.

## Logical Reconstruction

> Logical Reconstruction is the construction of a logically equivalent Context Revision from the required authoritative, version-identifiable source revisions and other required authoritative evidence.

1. Logical Reconstruction MUST construct a distinct Context Revision.
2. The reconstructed revision MUST be logically equivalent and MUST NOT be the original historical Context Revision.
3. Logical Reconstruction MUST NOT recreate the original Context Revision identity.
4. Logical Reconstruction MUST NOT recreate the original lifecycle history or original historical lifecycle status.
5. Logical Reconstruction MUST require the authoritative, version-identifiable source revisions required for logical equivalence and every other required authoritative item of evidence.
6. A retained representation alone MUST NOT substitute for required authoritative evidence merely because it was persisted.
7. If required authoritative source revisions or other required authoritative evidence are unavailable, Logical Reconstruction MUST NOT be claimed.
8. Logical Reconstruction MUST NOT recreate, replace, renew, or reissue source authority.
9. Logical Reconstruction MUST NOT itself perform new authority verification.
10. Logical Reconstruction MUST NOT renew Security authorization.
11. Logical Reconstruction MUST NOT establish present source currentness or present contextual currentness.
12. Logical Reconstruction MUST NOT repeat the original incorporation decision.
13. Logical Reconstruction MUST NOT repeat the original Brain cognitive execution.
14. Logical Reconstruction MUST NOT be treated as Exact Replay.
15. Logical Reconstruction MUST remain distinct from persistence, historical reproduction, refresh, recollection, repeated Context preparation, new Context preparation, and new Brain cognitive execution.

## Exact Replay

> Exact Replay is the exact reproduction of the Context Revision consumed by a reasoning cycle.

1. Exact Replay MUST apply only to the Context Revision consumed by a reasoning cycle.
2. Exact Replay MUST require sufficient retained immutable evidence.
3. Evidence sufficiency for Exact Replay MUST be relative to exact reproduction of the Context Revision consumed by the identified reasoning cycle.
4. If retained evidence supports only approximation or logical equivalence, the operation MUST NOT be called Exact Replay.
5. Exact Replay MUST NOT create a replacement Context Revision.
6. Exact Replay MUST NOT reopen, reactivate, or mutate the original Context Revision.
7. Exact Replay MUST NOT create replacement authority or repeat authority verification.
8. Exact Replay MUST NOT renew authorization.
9. Exact Replay MUST NOT establish or refresh present source currentness.
10. Exact Replay MUST NOT establish or refresh present contextual currentness.
11. Exact Replay MUST NOT rerun retrieval or incorporation.
12. Exact Replay MUST NOT constitute new Context preparation.
13. Exact Replay MUST NOT constitute a new Brain cognitive execution.
14. Exact Replay MUST concern exact reproduction of the consumed Context Revision and MUST NOT be broadened into reenactment of the surrounding historical execution.
15. Exact Replay MUST remain distinct from persistence, historical reproduction, refresh, recollection, repeated Context preparation, new Context preparation, and new Brain cognitive execution.

## Historical Reproduction of Other Outcomes

1. Historical reproduction MUST remain neutral reproduction terminology for historical artifacts or outcomes that do not themselves satisfy the definition of Exact Replay.
2. Capability-owned failures MUST retain their originating ownership and semantic identity through persistence and historical reproduction.
3. Brain-owned final cognitive results MUST retain Brain attribution through persistence and historical reproduction.
4. Reproduction of capability-owned failures or Brain-owned final cognitive results MUST use neutral historical-reproduction terminology unless the reproduced object actually satisfies the definition of Exact Replay.
5. Historical reproduction of a failure MUST NOT create a reproduction-owned failure.
6. Historical reproduction of a final cognitive result MUST NOT execute Brain again.
7. Historical reproduction of a final cognitive result MUST NOT create a newly assembled Brain final cognitive result.
8. Reproduction of an arbitrary historical failure or final cognitive result MUST NOT be classified as Exact Replay merely because that outcome was retained.

## Ownership and Authority Preservation

1. Context MUST retain ownership of Context Revision identity, lineage, preparation, incorporated-reference-set stability, validation, activation, lifecycle, immutability, contextual currentness, incorporation, and the architectural semantics of the aggregate returned set made available for Context consideration.
2. Sources MUST retain source semantics, reference semantics, source-result semantics, source lifecycle, retrieval execution, source currentness, authority origin, authority verification, and authority preservation.
3. Security MUST retain authorization semantics and authorization decisions.
4. Applicable protected boundaries MUST retain enforcement responsibility.
5. Capability-owned failures MUST retain their originating ownership and semantic identity.
6. Brain MUST retain outer cognitive orchestration, final cognitive result assembly, and the architectural meaning of the final cognitive result.
7. Bootstrap MUST retain architectural composition.
8. Core MUST retain custody of approved shared architectural language and Contracts.
9. Persistence, storage, transport, reconstruction, replay, and historical-reproduction mechanisms MUST NOT acquire or transfer any of these responsibilities.
10. Retained evidence MUST NOT create composite or emergent authority.
11. Preservation, representation, reconstruction, replay, and historical reproduction MUST preserve attribution to the original accepted architectural owners.

## Evidence Sufficiency

1. Logical Reconstruction MUST require the required authoritative, version-identifiable source revisions and other required authoritative evidence.
2. Logical equivalence MUST NOT mean identity equivalence, lifecycle equivalence, historical-status equivalence, or exact reproduction.
3. Persistence alone MUST NOT establish evidence sufficiency for Logical Reconstruction.
4. Exact Replay MUST require sufficient retained immutable evidence.
5. Evidence sufficiency for Exact Replay MUST be relative to exact reproduction of the Context Revision consumed by the identified reasoning cycle.
6. Approximation MUST NOT be Exact Replay.
7. Logical equivalence alone MUST NOT be Exact Replay.
8. Evidence sufficiency for Exact Replay MUST NOT imply reenactment of retrieval, incorporation, authorization, verification, currentness evaluation, failure production, Brain orchestration, reasoning, or final-result assembly.
9. Evidence sufficiency MUST remain an architectural precondition without prescribing concrete evidence fields, artifacts, hashes, snapshots, logs, formats, storage structures, or validation algorithms.
10. Refresh MUST remain a separate currentness-oriented concern.
11. Recollection MUST remain a separate later retrieval or reavailability concern.
12. Repeated Context preparation and new Context preparation MUST remain separate Context-owned activity.
13. New Context preparation MUST remain prospective Context activity rather than historical reproduction.
14. New Brain cognitive execution MUST remain separate Brain-owned orchestration and final-result production.

# Rationale

The boundary preserves historical continuity without displacing semantic owners. Persistence provides custody; meaning remains with the capability that established the artifact.

Persistence leaves the same Context Revision intact. Logical Reconstruction yields a distinct revision because logical equivalence cannot restore original identity, lifecycle history, or historical status.

Exact Replay has a narrower object and stronger evidence condition: the Context Revision consumed by an identified reasoning cycle, not every surrounding action. This prevents replay from becoming an alternate orchestration path.

Authoritative source revisions and other authoritative evidence support logical construction; sufficient retained immutable evidence supports exact reproduction. Retention proves neither authority nor sufficiency.

Neutral terminology protects failure and result ownership. Retained failures remain attributable to the failed capability responsibility; retained final results remain attributable to Brain's historical orchestration.

Separating historical facts from present acts preserves Security and currentness boundaries. Earlier authorization and currentness can explain history but cannot establish present permission or currentness.

Evidence preconditions remain technology-neutral, allowing later designs to evolve without changing identity, attribution, authority, or execution boundaries.

# Alternatives Considered

## Persistence Becomes Semantic Ownership

Rejected because custody does not establish architectural meaning or transfer accepted responsibilities to storage.

## Persisted Context Becomes Memory

Rejected because Memory and Context are distinguished by semantic role and authority. Duration, archival state, or storage location cannot reclassify Context.

## Persistence Renews Authority, Currentness, or Authorization

Rejected because retained evidence describes earlier conditions. Availability cannot make storage a source, verifier, currentness owner, or authorization authority.

## Logical Reconstruction Restores Historical Identity

Rejected because a logically equivalent construction is distinct and cannot restore original identity, lifecycle history, or historical status.

## Logical Reconstruction Is Exact Replay

Rejected because logical equivalence and exact reproduction have different results and evidence boundaries.

## Exact Replay Reruns the Entire Cognitive Execution

Rejected because reenacting activity surrounding the consumed Context Revision would constitute separate architectural activity.

## Approximate Reproduction Is Exact Replay

Rejected because approximation cannot satisfy exact reproduction. Logical equivalence or partial retained evidence does not justify exact terminology.

## Historical Failures and Results Are Exact Replay

Rejected because arbitrary failures and final results are not the Context Revision consumed by a reasoning cycle.

## Reproduction Mechanisms Own Historical Semantics

Rejected because representation and reproduction do not establish semantic ownership or replace original attribution.

# Consequences

- A persisted Context Revision remains the same revision and retains its identity.
- Retention preserves evidence without creating authority, permission, currentness, incorporation, or execution.
- Retained Context does not become Memory because of duration or location.
- Logical Reconstruction produces a distinct, logically equivalent Context Revision only when its required authoritative evidence is available.
- Logical Reconstruction remains distinguishable from identity restoration and Exact Replay.
- Exact Replay is limited to exact reproduction of the Context Revision consumed by an identified reasoning cycle.
- Approximation and logical equivalence remain distinguishable from Exact Replay.
- Historical failures retain capability ownership and semantic identity.
- Historical final cognitive results retain Brain attribution.
- Historical reproduction remains neutral and does not create a new architectural participant.
- New Context preparation and new Brain cognitive execution remain prospective activities rather than reproduction semantics.
- Evidence sufficiency remains a future specification concern within the architectural preconditions established here.
- No new capability, owner, authority origin, revision type, or execution model is introduced.

# Risks

- Persistence may be described imprecisely as preservation of authority rather than preservation of evidence and attribution.
- A logically equivalent reconstructed revision may be mistaken for restoration of historical identity.
- Diagnostic reproduction may be labeled Exact Replay without sufficient retained immutable evidence.
- Exact Replay may be broadened into rerunning the surrounding cognitive sequence.
- Historical authorization or currentness may be mistaken for a present architectural decision.
- Retained Context may be misclassified as Memory because it is durable.
- Reproduced failures or final results may be assigned incorrectly to a replay mechanism.
- A future evidence design may accidentally make one representation, such as a snapshot or log, architecturally mandatory.
- Lower-authority specifications may require alignment after this decision is approved.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0004 — Separation of Skills, Providers and Adapters](ADR-0004-Separation-of-Skills-Providers-and-Adapters.md)
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
- [ADR-0015 — Brain Cognitive-Reference Orchestration and Final Cognitive Result Boundaries](ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md) — Active normative predecessor.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Relevant review triggers include a proposed change to Context Revision identity, the distinction between Logical Reconstruction and Exact Replay, evidence-sufficiency architecture, historical attribution, or the ownership of a persisted or reproduced artifact.

Storage technology, database design, caches, serialization, retention periods, archival or deletion policies, evidence formats, hashes, mandated snapshots, event stores, event logs, persistence APIs, Contract names or shapes, schemas, reconstruction algorithms, replay algorithms, replay engines, evidence-sufficiency validation algorithms, refresh mechanisms, recollection mechanisms, asynchronous participation, event-driven execution, distributed execution, runtime sequencing, concrete lifecycle transitions for reconstructed revisions, Providers, Adapters, transports, and implementation mechanisms remain outside this ADR.

Any later alignment of CONCEPT-0003 remains separate from this draft.

# Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-07 | Initial draft derived from the non-normative source decision record. |
| 1.0.0   | 2026-08-09 | Approved architectural decision.                                     |

# Engineering Motto

> Preservation retains evidence and attribution; it does not recreate authority, present state, or execution.
