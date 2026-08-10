# ADR-0017 — Execution-Model Independence for Asynchronous, Event-Driven, and Distributed Collaboration

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-08            |
| **Updated**       | 2026-08-10            |
| **Decision Type** | Architecture Decision |

---

## Context

O.R.I.O.N. assigns architectural responsibility according to capability meaning. Context owns cognitive-reference collaboration and Context Revision preparation. Sources retain their semantics, retrieval execution, authority, lifecycle, and currentness. Security owns authorization semantics and decisions. Brain owns outer cognitive orchestration and final cognitive results. Bootstrap owns architectural composition, while Core custodies approved shared architectural language and Contracts.

These relationships may eventually operate with temporal separation, react to events, or cross process and deployment boundaries. Those execution characteristics change when or where participants act, but they do not provide a semantic basis for redistributing accepted responsibilities.

Asynchronous participation describes temporal separation. Event-driven participation describes an execution trigger or communication form. Distributed participation describes separation across runtimes, processes, services, hosts, or deployment locations. The forms are not operationally equivalent, but each raises the same architectural question: whether movement in time or execution location changes ownership.

Communication also introduces apparent handoff points. Information may be published, conveyed, delivered, received, persisted, or redelivered. A late reference may become available after a Context Revision has reached its stability boundary. A failure may cross several intermediaries before reaching a participant that owns a downstream consequence. None of these facts identifies who owns the conveyed meaning.

This ADR establishes one execution-model-independent ownership boundary. It preserves the accepted cognitive-reference architecture while leaving concrete communication, runtime, and deployment mechanisms unresolved.

## Problem Statement

Without an explicit topology-independent boundary, execution placement could be mistaken for architectural responsibility. A receiver might appear to acquire source semantics by receiving a reference, an intermediary might appear to own a propagated failure, or a distributed arrangement might be interpreted as shared authority. Runtime design would then redefine architecture without an accepted decision.

Temporal separation creates similar ambiguity. Delivery or participant completion could be mistaken for retrieval, incorporation, validation, or activation. Late evidence could appear permitted to enrich a stable or Active Context Revision. Delay, receipt time, or persistence could be treated as renewed currentness or authorization.

Event-driven participation can further blur the distinction between communication and meaning. Emission or receipt of an event could be mistaken for authority creation, issuer-owned verification, Security authorization, or Context incorporation. This would allow communication form to absorb capability responsibilities.

Persistence and redelivery also overlap superficially with historical reproduction. Without a clear relationship to ADR-0016, asynchronous delivery of retained evidence could be mislabeled as Logical Reconstruction or Exact Replay, or treated as recreation of historical authority and execution.

The architecture therefore needs one decision stating that accepted ownership survives changes in execution form while preserving Context Revision stability, authority attribution, authorization, currentness, failure identity, composition, custody, orchestration, and final-result ownership.

## Decision

### Execution-Model Independence

D-027

1. Architectural responsibility MUST be determined by accepted capability meaning rather than by when, where, or through which execution form collaboration occurs.
2. Execution topology MUST NOT redefine architectural ownership.
3. Temporal, process, runtime, service, host, or deployment separation MUST NOT transfer semantic responsibility.
4. Runtime separation MUST NOT create another semantic owner.
5. Asynchronous, event-driven, and distributed participation MUST remain execution characteristics rather than ownership models or separate architectural ownership decisions.
6. Asynchronous participation MUST describe temporal separation; event-driven participation MUST describe an execution trigger or communication form; distributed participation MUST describe runtime, process, service, host, or deployment separation.
7. These execution forms MUST NOT be treated as operationally equivalent merely because they share one ownership-preservation invariant.
8. Distributed participation MUST NOT create shared, composite, emergent, ownerless, or implementation-defined ownership or authority.
9. Senders, publishers, receivers, subscribers, intermediaries, workers, transports, persistence mechanisms, runtimes, services, hosts, and deployment boundaries MUST NOT acquire capability meaning merely because of their execution role.
10. Receipt or consumption of an event, message, reference, result, authorization artifact, or failure MUST NOT transfer ownership.
11. No asynchronous, distributed, Event, messaging, coordination, or topology capability or semantic owner MUST be introduced by this decision.

### Communication and Delivery

1. Accepted cognitive-reference collaboration MUST retain its established owner and architectural meaning independently of communication form.
2. Communication MUST convey information between accepted participants without allocating semantic responsibility.
3. Publication, communication, conveyance, delivery, receipt, and redelivery MUST NOT transfer, recreate, merge, or reinterpret semantic ownership.
4. Event emission or receipt MUST NOT create authority, perform authority verification, or establish authorization.
5. Delivery MUST NOT constitute retrieval initiation.
6. Delivery MUST NOT define retrieval-request semantics, source-result semantics, or aggregate returned-set semantics.
7. Delivery completion MUST NOT constitute Context incorporation.
8. Candidate availability MUST remain distinct from incorporation.
9. Transport MUST NOT acquire conveyed capability semantics.
10. Communication form MUST NOT establish Event-domain semantics.
11. This decision MUST NOT define messaging behavior.

### Context Revision Stability and Late Participation

1. Context MUST retain ownership of Context collaboration semantics, retrieval initiation, retrieval-request semantics, and the architectural semantics of the aggregate returned set made available for Context consideration.
2. Context MUST retain ownership of Context Revision identity and lineage, Context Revision preparation, incorporated-reference-set stability, validation, activation, lifecycle, immutability, contextual currentness, incorporation, and candidate-revision consequences.
3. Asynchronous participation MUST NOT reopen, enrich, replace, or mutate a Context Revision whose incorporated-reference set is stable.
4. Asynchronous participation MUST NOT reopen or mutate an Active Context Revision.
5. Event-driven participation MUST NOT imply incremental mutation of an Active Context Revision.
6. Distributed participation MUST NOT create a shared mutable Context Revision.
7. Later-arriving references or evidence MUST NOT automatically become incorporated into an existing stable or Active Context Revision.
8. Delivery completion, participant completion, or candidate availability MUST NOT determine incorporation, validation, or activation.
9. Participation timing MUST NOT itself determine incorporation.
10. Evidence arriving before the applicable Context-owned stability boundary MUST remain subject to existing Context-owned currentness and incorporation decisions.
11. Evidence arriving after incorporated-reference-set stability or activation MUST NOT alter that Context Revision.
12. Later consideration of delayed evidence MAY involve a separate Context-owned preparation concern where applicable, but this decision MUST NOT define its lifecycle or mechanics.
13. Asynchronous continuation MUST NOT automatically constitute refresh, recollection, repeated Context preparation, new Context preparation, or new Brain cognitive execution.
14. This decision MUST NOT define waiting, deadlines, late-arrival algorithms, completion detection, ordering, buffering, correlation, or cancellation.

### Source Semantics and Authority

1. Sources MUST retain source semantics, reference semantics, source-result semantics, and retrieval interpretation and execution within their source boundaries.
2. Sources MUST retain source lifecycle, source currentness, authority origin, authority verification, and authority preservation.
3. Publication, communication, transport, delivery, receipt, delay, persistence, redelivery, asynchronous participation, event-driven participation, and distributed placement MUST NOT transfer, recreate, or reinterpret these source responsibilities.
4. Receiving or persisting source-owned information MUST NOT make another participant its semantic owner, authority origin, authority verifier, or authority-preservation owner.

### Authorization, Currentness, and Incorporation

1. Security MUST retain authorization semantics and authorization decisions.
2. Applicable protected boundaries MUST retain authorization-enforcement responsibility.
3. Receipt, delivery, persistence, or possession of an authorization artifact MUST NOT establish, renew, extend, replace, or reinterpret authorization.
4. Event emission or receipt MUST NOT bypass authorization enforcement.
5. Participation timing or execution location MUST NOT determine authorization.
6. Temporal delay MUST NOT establish or renew source currentness and MUST NOT establish contextual currentness.
7. Delivery time, receipt time, redelivery, persistence, or deployment location MUST NOT determine currentness.
8. Historical or earlier currentness MUST NOT establish present currentness.
9. Sources MUST retain source-currentness responsibility, and Context MUST retain contextual-currentness responsibility.
10. Authorization, delivery, currentness, candidate availability, and incorporation MUST remain architecturally distinct.
11. Participation timing MUST NOT itself establish authority, authorization, currentness, candidate suitability, or incorporation.
12. This decision MUST NOT define authentication, credentials, tokens, authorization duration, expiration, revocation, policy engines, or access-control mechanisms.

### Failure Propagation

1. Capability-owned failures MUST retain originating ownership and semantic identity across temporal, communication, persistence, and runtime boundaries.
2. Publication, propagation, communication, delay, delivery, receipt, redelivery, persistence, observation, asynchronous participation, event-driven participation, and distributed participation MUST NOT transfer failure ownership.
3. These execution and communication characteristics MUST NOT create sender-owned, intermediary-owned, transport-owned, receiver-owned, persistence-owned, or orchestration-owned failure semantics.
4. A receiver MAY observe or respond to a failure without acquiring its ownership.
5. Failure propagation MUST remain distinct from downstream consequences owned by Context, Brain, or another accepted capability.
6. This decision MUST NOT define retry, timeout, cancellation, compensation, rollback, recovery, dead-letter handling, aggregation, precedence, ordering, correlation, deduplication, idempotency, or delivery guarantees.

### Brain, Bootstrap, and Core Preservation

1. Brain MUST retain outer cognitive orchestration, stage precedence, final cognitive result assembly, and ownership of the final cognitive result as a Brain-owned orchestration outcome.
2. Asynchronous continuation MUST NOT automatically initiate another Brain cognitive execution.
3. Event-driven or distributed realization MUST NOT transfer orchestration to publishers, subscribers, workers, intermediaries, transports, Providers, or Adapters.
4. Bootstrap MUST retain architectural composition.
5. Runtime or deployment topology MUST NOT replace Bootstrap composition.
6. Core MUST retain custody of approved shared architectural language and Contracts.
7. Contract or Event representation custody MUST NOT confer capability semantics, composition ownership, orchestration ownership, or runtime authority beyond already accepted boundaries.
8. Providers, Adapters, transports, and deployment mechanisms MUST remain implementation participants and MUST NOT become architectural owners merely because execution crosses them.
9. This decision MUST NOT redefine Brain orchestration algorithms, Bootstrap composition mechanics, Core structure, Contracts, Providers, or Adapters.

### Persistence, Reconstruction, and Replay Separation

1. Persistence used for asynchronous or distributed coordination MUST remain persistence and MUST NOT acquire semantic ownership.
2. Persisted messages, references, results, authorization artifacts, and failures MUST retain their established attribution and ownership.
3. Persistent coordination MUST NOT renew authority or renew or repeat authority verification.
4. Persistent coordination MUST NOT establish or renew authorization.
5. Persistent coordination MUST NOT establish or renew source currentness or contextual currentness.
6. Asynchronous delivery of retained evidence MUST NOT by itself constitute Logical Reconstruction.
7. Delivery or redelivery MUST NOT by itself constitute Exact Replay.
8. Asynchronous propagation MUST NOT by itself constitute historical reproduction.
9. Asynchronous continuation MUST NOT by itself constitute Logical Reconstruction or Exact Replay.
10. Asynchronous continuation MUST NOT recreate authority, authority verification, authorization, currentness, incorporation, failure production, Context preparation, or Brain cognitive execution.
11. This decision MUST NOT redefine persistence, historical evidence, Logical Reconstruction, Exact Replay, historical reproduction, Context Revision identity, or evidence-sufficiency semantics established by ADR-0016.

## Rationale

Architectural responsibility follows meaning because capability owners remain accountable for the decisions and artifacts within their domains. Time and location cannot supply that domain responsibility. If deployment topology could assign ownership, moving an implementation between processes or hosts would silently change the architecture.

One topology-independence decision is preferable to separate asynchronous, event-driven, and distributed ownership decisions because the same preservation rule governs all three forms. Temporal separation, event-based triggering, and runtime separation have different operational implications, but none creates semantic responsibility. Separate ownership decisions would duplicate the boundary and risk inconsistent allocations.

Communication remains distinct from collaboration. Collaboration identifies how accepted capability responsibilities contribute to Context preparation. Communication conveys the requests, references, decisions, results, or failures involved. A mechanism that carries information lacks the source-domain knowledge, Context responsibility, Security authority, or orchestration responsibility necessary to own its meaning.

Context Revision stability provides the temporal boundary for delayed participation. Evidence available before stability remains subject to Context decisions. Evidence arriving afterward cannot rewrite the revision. This preserves one coherent evidence basis for validation, activation, and reasoning without requiring a particular waiting or completion mechanism.

Source authority survives communication boundaries because publication and receipt are not issuance or verification. Security authorization survives for the same reason: possession of an artifact explains neither its applicability nor present permission. Currentness likewise remains a capability-owned determination rather than a conclusion inferred from timestamps or delivery location.

Failure identity remains attributable to the responsibility that failed. Intermediaries may convey failure information, and receivers may own downstream consequences, but neither fact changes the original failure. This preserves accountability across process and temporal boundaries.

Brain, Bootstrap, and Core retain different roles regardless of topology. Brain owns the outer cognitive outcome, Bootstrap assembles approved relationships, and Core custodies shared language. A distributed realization changes none of those meanings.

The relationship to ADR-0016 prevents coordination artifacts from acquiring historical-reproduction semantics. Persistence and redelivery can support execution without becoming reconstruction, replay, renewed authority, or another cognitive execution.

## Alternatives Considered

### Ownership Determined by Execution Topology

Rejected because process, host, service, or deployment placement describes execution location rather than capability meaning. Moving an implementation would otherwise reassign architecture implicitly.

### Shared or Distributed Semantic Ownership

Rejected because distribution does not merge capability responsibilities or create composite authority. Shared ownership would obscure the participant accountable for each meaning and decision.

### Receiver or Intermediary Ownership After Delivery

Rejected because receipt and conveyance provide no basis for acquiring source semantics, authority, authorization, incorporation, or failure meaning.

### Event-Owned Architectural Semantics

Rejected because an event may represent or convey an accepted fact without becoming an independent owner of the fact's domain meaning.

### Separate Ownership Models for Each Execution Form

Rejected because asynchronous, event-driven, and distributed participation test the same ownership-preservation invariant. Their runtime differences do not justify separate semantic allocations.

## Consequences

- Capability ownership remains stable when execution moves across time, processes, runtimes, services, hosts, or deployment locations.
- Asynchronous, event-driven, and distributed designs can evolve without redistributing architectural responsibility.
- Communication and delivery remain separate from retrieval, authority, authorization, currentness, and incorporation.
- Stable and Active Context Revisions remain protected from late mutation.
- Source semantics and authority remain attributable across communication boundaries.
- Authorization and enforcement remain assigned to their accepted owners.
- Failure propagation preserves originating ownership and semantic identity.
- Brain orchestration, Bootstrap composition, and Core custody remain distinct from runtime topology.
- Persistence and redelivery remain distinguishable from reconstruction, replay, and historical reproduction.
- Runtime designs carry the additional burden of preserving attribution and accepted boundaries across temporal and deployment separation.
- No new capability, semantic owner, composite authority, or execution role is introduced.

## Risks

- Delivery may be mistaken for Context incorporation.
- Receipt may be mistaken for authority verification or authorization.
- Late evidence may be treated as permission to mutate a stable or Active Context Revision.
- Persistence or redelivery may be mislabeled as reconstruction or replay.
- Failure ownership may be transferred incorrectly to an intermediary or receiver.
- Deployment topology may be allowed to determine architectural ownership.
- Event representation custody may be confused with Event-domain or capability semantics.
- Concrete runtime designs may obscure attribution across several communication boundaries.
- The shared topology-independence rule may be misread as operational equivalence among the three execution forms.

## Dependencies

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
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md) — Active normative predecessor.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

## Future Review

Relevant review triggers include a proposed ownership change caused by execution placement, a topology that cannot preserve source attribution or Context Revision stability, or a communication model that merges delivery with capability meaning.

Future work may address Event abstractions and domain semantics; schemas, envelopes, payloads, publishers, subscribers, consumers, workers, coordinators, remote-service roles, brokers, queues, topics, event buses, and event logs; messaging protocols and APIs; Contract names and shapes; correlation and causation representations; delivery, ordering, and processing guarantees; retry, timeout, cancellation, compensation, rollback, recovery, and dead-letter behavior; deduplication and idempotency; consistency and availability models; transactions and distributed locks; service discovery and deployment topology; threading, concurrency, scheduling, and synchronization; serialization and storage; runtime sequencing; concrete late-arrival handling; completion or stability detection; refresh, recollection, repeated-preparation mechanisms, configurable retrieval policy, reconstruction and replay algorithms, and implementation mechanisms.

Review of those concerns does not alter this draft's allocation unless a later approved architectural decision explicitly changes it.

## Related Documents

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

## Implementation Notes

Concrete runtime mechanisms belong to later Specifications, Contracts, Providers, Adapters, transports, or implementation work. Those artifacts can select communication and deployment techniques while preserving the ownership, attribution, stability, and non-transfer boundaries established here.

This draft supplies no implementation authority for a messaging system, Event model, distributed runtime, persistence design, or late-arrival mechanism.

## Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-08 | Initial draft derived from the non-normative source decision record. |
| 1.0.0   | 2026-08-10 | Approved architectural decision.                                     |

## Engineering Motto

> Execution may move in time or space; ownership does not move with it.
