# ADR-0019 — Configurable Retrieval Policy Ownership Boundary

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Draft                 |
| **Version**       | 0.1.0                 |
| **Owner**         | Orion Architecture    |
| **Created**       | 2026-08-08            |
| **Updated**       | 2026-08-08            |
| **Decision Type** | Architecture Decision |

---

## Context

Context preparation can obtain candidate cognitive references from multiple independent source capabilities. Context owns the collaboration purpose, retrieval initiation and request meaning, the architectural semantics of the aggregate returned set made available for consideration, contextual currentness, incorporation, and Context Revision responsibilities. Each source interprets a Context request within its own domain and retains retrieval execution, reference and source-result semantics, lifecycle, source currentness, and reference authority.

Retrieval decisions may eventually need configurable relevance, ranking, selection, preference, thresholds, or related criteria. Configuration creates an architectural risk when it is described as policy ownership rather than as input to a decision already owned by a capability. A policy representation, evaluator, provider, administrator, or runtime mechanism could then appear to define Context meaning, source meaning, authority, authorization, currentness, incorporation, or orchestration merely because it supplies or applies parameters.

The existing architecture assigns every affected responsibility to an accepted owner. Security owns authorization semantics and decisions, while applicable protected boundaries enforce those decisions. Brain owns outer cognitive orchestration and final cognitive results. Bootstrap owns architectural composition. Core custodies approved shared architectural language and Contracts. Capability failures remain owned by the responsibility that failed. Historical evidence, reconstruction, replay, execution topology, refresh, recollection, and repeated Context preparation retain their separate boundaries.

This ADR formalizes only the ownership boundary for configurable retrieval policy. DECISION-0001 supplies its non-normative source conclusion. ADR-0008 through ADR-0018 remain Draft provisional predecessors while applicable; completion tags do not change that repository status.

## Problem Statement

Without an explicit boundary, configurable policy could become an alternate retrieval owner shared across Context and its sources. Context request criteria could be treated as commands that redefine source interpretation, while source-side configuration could acquire Context incorporation responsibility. Ranking could be mistaken for authority, verification, authorization, or currentness, and selection could be mistaken for incorporation.

Configuration changes create an additional historical risk. Applying new criteria to an existing stable or Active Context Revision would rewrite its evidence boundary and erase the relationship between the revision and the conditions under which it was prepared. Present policy could also be substituted incorrectly for historical evidence in reconstruction or replay.

Runtime realization creates similar ambiguity. An administrator, configuration provider, evaluator, policy engine, transport, or storage mechanism could appear to own configured decisions because it stores, supplies, or applies policy values. That would make architectural ownership depend on implementation placement or topology.

The architecture therefore needs one rule that permits configuration within accepted decision boundaries while preventing configuration from becoming an independent architectural authority.

## Decision

### Architectural Classification and Governing Principle

D-029

1. Configuration MAY constrain or parameterize a decision only within the capability boundary that already owns that decision.
2. Configurable retrieval criteria MUST be parameters or constraints applied to decisions owned by an accepted capability.
3. Configurable retrieval policy MUST NOT become an independent architectural authority, semantic owner, retrieval owner, or policy owner.
4. Configurable retrieval policy MUST NOT independently be a capability, architectural participant, authority origin, authority owner, authority-verification owner, authorization owner, currentness owner, incorporation owner, failure owner, lifecycle owner, Brain orchestration owner, Bootstrap composition owner, Core custodian, or owner of final cognitive results.
5. Configuration MUST NOT create independent, shared, composite, emergent, ownerless, alternate, or implementation-defined semantic ownership.
6. Configuration MUST remain distinct from authority, authority verification, authorization, enforcement, currentness, incorporation, retrieval ownership, lifecycle ownership, failure ownership, orchestration, composition, custody, and final cognitive result ownership.

### Configuration Within Existing Capability Ownership

1. A capability MAY apply configurable criteria only within decisions already assigned to that capability.
2. Configuration MAY influence an owned decision without becoming the owner of that decision.
3. Configuration MUST NOT transfer, merge, replace, delegate, reinterpret, or redistribute an accepted capability responsibility.
4. Policy evaluation MUST mean application of configured criteria within an already-owned capability decision and MUST NOT constitute semantic authority.
5. Configuration applied by more than one capability MUST remain subordinate to each capability's separate decision boundary and MUST NOT create shared policy ownership.
6. Configuration MUST NOT merge Context-owned retrieval meaning with source-owned interpretation or execution.
7. The representation, location, custody, administration, evaluation, delivery, persistence, or consumption of configuration MUST NOT determine architectural ownership.

### Context-Owned Configurable Criteria

1. Context MUST retain ownership of collaboration, retrieval initiation, retrieval-request semantics, aggregate returned-set semantics, contextual currentness, incorporation, Context Revision preparation, Context Revision Identity, Context Lineage, validation, activation, incorporated-reference-set stability, lifecycle, immutability, and candidate-revision consequences.
2. Context-side configuration MAY parameterize Context-owned relevance, ranking, selection, preference, threshold, or related criteria only within Context-owned decisions.
3. Configuration MUST NOT independently define or redefine Context retrieval-request semantics.
4. Configuration MUST NOT become the owner of the architectural semantics of the aggregate returned set made available for Context consideration.
5. Policy selection MUST NOT constitute Context incorporation.
6. Context MUST make a separate incorporation decision for any selected candidate reference.
7. Configuration MUST NOT replace Context validation or activation.
8. Configuration MUST NOT alter Context Revision Identity or Context Lineage.
9. Configuration MUST NOT acquire contextual-currentness ownership, incorporation ownership, or candidate-revision-consequence ownership.
10. Context-owned criteria MUST NOT transfer Context responsibility to a policy, source, administrator, evaluator, Provider, Adapter, transport, or runtime mechanism.

### Source-Owned Configurable Criteria

1. Each source MUST retain source semantics, reference semantics, source-result semantics, retrieval-request interpretation within its domain, retrieval execution, source lifecycle, source currentness, authority origin, authority verification, and authority preservation.
2. Source-side configuration MAY parameterize source-owned interpretation or execution only within the source boundary.
3. Context-owned request criteria MUST NOT redefine source semantics, source-result meaning, source authority, source lifecycle, or source currentness.
4. Source-side configuration MUST NOT acquire Context retrieval-request, aggregate returned-set, contextual-currentness, or incorporation ownership.
5. Configuration MUST NOT redefine the semantic meaning or boundary of a source-issued reference or source result.
6. Configuration MUST NOT override source-owned interpretation from outside the source boundary.
7. Configuration MUST NOT mint, transfer, replace, reissue, or independently establish source authority.
8. Configuration MUST NOT transfer source responsibility to Context, a policy, an evaluator, or another participant.
9. Context-owned request criteria and source-owned interpretation MUST remain distinct even when both use configurable criteria.

### Relevance Boundary

1. Relevance MUST concern suitability within the decision boundary of the capability applying it.
2. Relevance MAY parameterize an already-owned suitability decision.
3. Relevance MUST NOT constitute authority.
4. Relevance MUST NOT constitute authorization.
5. Relevance MUST NOT constitute source currentness or contextual currentness.
6. Relevance MUST NOT constitute incorporation.
7. A relevance result MUST NOT transfer ownership of the decision in which it is used.
8. Concrete relevance rules and scoring content MUST remain outside this decision.

### Ranking Boundary

1. Ranking MUST mean ordering or evaluating candidates within an already-owned capability decision boundary.
2. Ranking MUST NOT constitute authority.
3. Ranking MUST NOT constitute authority verification.
4. Ranking or scoring MUST NOT substitute for issuer-owned authority verification.
5. Ranking MUST NOT constitute authorization.
6. Ranking MUST NOT establish source currentness or contextual currentness.
7. Ranking MUST NOT constitute retrieval ownership.
8. A scoring position MUST NOT constitute provenance.
9. A scoring position MUST NOT constitute authority verification.
10. Source priority MUST NOT constitute authority precedence.
11. Ranking MUST NOT transfer semantic ownership to a ranking policy, scorer, evaluator, or mechanism.
12. Concrete rankings, formulas, scoring models, thresholds, and weights MUST remain outside this decision.

### Selection and Preference Boundary

1. Selection MUST mean identification of candidates within an applicable capability-owned boundary.
2. Candidate selection MUST NOT constitute incorporation.
3. Candidate selection MUST NOT establish present contextual suitability.
4. Selection MUST NOT constitute retrieval ownership.
5. Preference MUST mean a configurable inclination within an already-owned capability decision.
6. Preference MUST NOT constitute authorization.
7. Source participation preference MUST NOT bypass Security authorization or protected-boundary enforcement.
8. Preference or source priority MUST NOT be treated as freshness.
9. Ranking, selection, relevance, preference, source priority, thresholds, weights, or scoring MUST NOT become permission.
10. Selection and preference MUST NOT transfer ownership to a policy, administrator, consumer, or evaluator.
11. Concrete selection procedures, preference rules, and source-priority rules MUST remain outside this decision.

### Authority, Authorization, and Enforcement Preservation

1. Issuing sources MUST retain authority origin, authority verification, and authority preservation for the cognitive references they issue.
2. Security MUST retain authorization semantics and authorization decisions.
3. Applicable protected boundaries MUST retain authorization-enforcement responsibility.
4. Configuration MUST NOT decide, replace, reinterpret, renew, or broaden authorization.
5. Configuration MUST NOT bypass applicable protected-boundary enforcement.
6. Configuration MUST NOT create, transfer, merge, replace, renew, or reinterpret source authority.
7. Configuration MUST NOT repeat or replace issuer-owned authority verification.
8. Ranking, scoring, selection, relevance, preference, source priority, or candidate availability MUST NOT establish authority or authorization.
9. A configured decision MUST remain subject to every applicable Security-owned authorization decision and protected-boundary enforcement responsibility.

### Currentness Preservation

1. Each issuing source MUST retain source-currentness ownership for the cognitive references it issues.
2. Context MUST retain contextual-currentness ownership for source-current cognitive references considered during Context Revision preparation.
3. Configuration MUST NOT independently establish or override source currentness or contextual currentness.
4. Ranking, scoring, selection, relevance, preference, source priority, delivery, or configuration availability MUST NOT establish either form of currentness.
5. Preference or source priority MUST NOT be treated as freshness.
6. Candidate selection MUST NOT establish present contextual suitability.
7. Source-side configuration MUST remain subordinate to source-owned currentness decisions.
8. Context-side configuration MUST remain subordinate to Context-owned contextual-currentness decisions.
9. Currentness determination MUST remain distinct from configured evaluation.

### Context Revision Stability and Prospective Policy Change

1. A configuration change MAY affect later Context preparation prospectively where applicable.
2. A configuration change MUST NOT mutate historical Context.
3. A configuration change MUST NOT reopen an incorporated-reference set that is stable.
4. A configuration change MUST NOT mutate an Active Context Revision.
5. A configuration change MUST NOT alter an existing incorporation decision.
6. A configuration change MUST NOT replace the evidence boundary of an existing Context Revision.
7. Later criteria MUST apply only within a later capability-owned decision and MUST NOT retroactively alter request criteria, candidate availability, currentness determinations, incorporation, validation, activation, or lifecycle history.
8. Configuration change MUST NOT by itself constitute refresh, recollection, repeated Context preparation, Context Revision creation, incorporation, or Brain cognitive execution.
9. Later Context preparation affected by configuration MUST remain Context-owned and MUST operate under the established revision-identity, lineage, stability, and immutability boundaries.
10. Configuration MUST NOT become a Context lifecycle owner merely because its value changes over time.

### Persistence, Reconstruction, Replay, and Historical Evidence Preservation

1. Persistence, historical evidence, Logical Reconstruction, Exact Replay, historical reproduction, and evidence sufficiency MUST retain their established architectural meanings.
2. Policy configuration or policy change MUST NOT by itself create historical authority or renew historical authority verification.
3. Policy configuration or policy change MUST NOT by itself establish present authorization or present source or contextual currentness.
4. Policy configuration or policy change MUST NOT by itself create Logical Reconstruction, Exact Replay, or historical reproduction.
5. Policy configuration or policy change MUST NOT alter historical meaning or attribution.
6. Policy configuration or policy change MUST NOT change evidence-sufficiency requirements.
7. Present policy MUST NOT substitute for historical evidence required by Logical Reconstruction or Exact Replay.
8. Present configured criteria MUST NOT be treated as evidence of the criteria or architectural conditions applicable to a historical Context Revision.
9. A retained historical policy representation, if persistence is later defined, MUST remain historical evidence and MUST NOT automatically become presently applicable or authoritative.
10. Persistence of configuration MUST NOT create policy authority, semantic ownership, currentness, authorization, incorporation, reconstruction, or replay.
11. This decision MUST NOT define persistence, evidence, reconstruction, replay, or historical-reproduction mechanisms.

### Execution-Model Independence

1. The same architectural ownership boundaries MUST apply across synchronous, asynchronous, event-driven, and distributed execution and across separate processes, services, hosts, or deployments.
2. Evaluator placement, delivery, persistence, remote execution, transport, or asynchronous continuation MUST NOT create policy authority or transfer ownership.
3. Event emission, receipt, delayed delivery, redelivery, or distributed evaluation MUST NOT transform configuration into a capability or semantic owner.
4. Runtime topology MUST NOT merge Context and source decision boundaries.
5. Execution placement MUST NOT change failure, authority, authorization, currentness, incorporation, orchestration, composition, or custody ownership.
6. Providers, Adapters, transports, workers, services, and deployment mechanisms MUST remain implementation participants and MUST NOT become architectural owners through configured evaluation.
7. This decision MUST NOT define an execution model, communication model, or distributed-coordination mechanism.

### Failure Ownership

1. Failure ownership MUST follow the accepted capability responsibility whose configured evaluation failed.
2. An independent policy-owned or configuration-owned failure category MUST NOT be introduced.
3. A Context-owned configured-evaluation failure MUST remain Context-owned.
4. A source-owned configured-evaluation failure MUST remain owned by that source.
5. A Security failure MUST remain Security-owned.
6. A protected-boundary enforcement failure MUST remain owned by the applicable enforcement responsibility.
7. Configuration MUST NOT absorb, merge, replace, reinterpret, or transfer source, Context, Security, Brain, Bootstrap, or enforcement failures.
8. Failure propagation MUST preserve originating ownership and semantic identity.
9. Context MUST retain ownership only of the applicable consequence for the candidate Context Revision under preparation.
10. Brain MUST retain ownership only of the applicable downstream final-result consequence without acquiring the originating failure.
11. Evaluators, administrators, Providers, Adapters, transports, stores, and runtime mechanisms MUST NOT acquire failure ownership through observation or handling.
12. This decision MUST NOT define failure handling, retry, recovery, compensation, rollback, timeout, or aggregation mechanisms.

### Brain, Bootstrap, and Core Preservation

1. Brain MUST retain outer cognitive orchestration, stage precedence, final cognitive result assembly, and final-result meaning and ownership.
2. Configuration MUST NOT acquire, replace, redefine, or redistribute Brain responsibilities.
3. Configured capability outputs MAY participate in Brain orchestration without making configuration an orchestration participant or final-result owner.
4. Bootstrap MUST retain architectural composition.
5. Configuration MUST NOT become composition authority or restructure accepted ownership relationships.
6. Configuration MUST NOT select architectural owners or create capability relationships not accepted by higher architectural authority.
7. Core MUST retain custody of approved shared architectural language and Contracts.
8. Configuration MUST NOT acquire independent Core custody or semantic ownership merely because a future configuration Contract may be Core-custodied.
9. Core custody of a future configuration representation MUST NOT confer ownership of configured capability decisions.
10. Brain orchestration, Bootstrap composition, and Core custody MUST remain distinct from policy evaluation and administration.

### Administration, Provider, Evaluator, and Mechanism Non-Ownership

1. No configuration source, administrator, provider, evaluator, policy engine, rule engine, runtime mechanism, consumer, transport, persistence mechanism, or storage component MUST become an architectural owner merely because it supplies, stores, administers, evaluates, applies, transports, or consumes configuration.
2. Administration MUST remain distinct from semantic ownership.
3. Administration MUST NOT assign, transfer, replace, or reinterpret capability ownership.
4. This decision MUST NOT define administrator identity, permissions, authorization, lifecycle, governance, or mechanisms.
5. Provider or evaluator replaceability MUST NOT permit implementation placement to determine architecture.
6. A policy engine or rule engine MUST NOT become a capability, semantic authority, retrieval owner, authorization owner, currentness owner, incorporation owner, failure owner, orchestrator, composer, or custodian through evaluation.
7. Consumers MUST NOT acquire configured-decision ownership through preference, request, receipt, or use.
8. Storage, transport, evaluation, and administration MUST NOT create composite or emergent authority.
9. Hypothetical future roles MUST remain implementation or administration concerns until separately authorized and MUST NOT alter this ownership boundary.

### Explicit Scope Boundary

1. This ADR MUST NOT define concrete relevance rules, ranking algorithms, scoring algorithms or models, thresholds, weights, source-priority rules or lists, preference rules, or selection procedures.
2. This ADR MUST NOT define policy precedence, policy conflict resolution, policy languages, configuration schemas or files, configuration storage, or policy stores.
3. This ADR MUST NOT define administrator identity, administrator authorization, configuration-administration mechanisms, configuration lifecycle or versioning, or policy persistence.
4. This ADR MUST NOT define policy providers, evaluator implementation, policy engines, rule engines, runtime evaluation timing, or runtime evaluation placement.
5. This ADR MUST NOT define APIs, Contract names or shapes, schemas, payloads, Providers, Adapters, or transports.
6. This ADR MUST NOT define persistence mechanisms, distributed-coordination mechanisms, execution models, or communication models.
7. This ADR MUST NOT define refresh, recollection, repeated-preparation, retrieval, or currentness algorithms or mechanisms.
8. This ADR MUST NOT define authority-verification mechanisms or authorization mechanisms.
9. This ADR MUST NOT define failure handling, retries, recovery, compensation, rollback, timeout, or aggregation.
10. This ADR MUST NOT define runtime sequencing or implementation mechanisms.
11. Concrete policy values and procedures MUST remain deferred policy details and MUST NOT become architecture merely because they are configurable.

## Rationale

The governing rule preserves capability-oriented ownership while allowing future variation. Configuration can influence an accepted decision without becoming a new participant in the architecture. The capability remains accountable for the decision, its semantic meaning, its lifecycle consequence, and any failure arising from that responsibility.

Context and source criteria require separate treatment because their retrieval meanings differ. Context expresses a contextual need and owns the aggregate purpose of returned candidates. Each source interprets that need inside its own domain and determines what it can return. Applying configuration on both sides does not create shared retrieval ownership or permit either side to redefine the other.

Relevance, ranking, and selection are useful architectural categories only to establish their limits. Suitability, ordering, and candidate identification do not establish provenance, authority, verification, permission, currentness, or incorporation. Concrete formulas and values remain later policy choices.

The prospective-change boundary preserves deterministic reasoning and historical integrity. Criteria can change for future decisions, but the evidence boundary of a stable or Active Context Revision continues to represent the conditions under which that revision was prepared. Present criteria cannot rewrite historical meaning or replace historical evidence.

Security remains independent because preference and ranking express desirability rather than permission. Source authority remains independent because ordering cannot establish origin or verify issuer-owned evidence. Currentness remains independent because comparative position cannot establish source standing or Context-specific suitability.

Failure ownership follows the responsibility that performed the configured evaluation. Configuration is an input, not a semantic participant capable of owning a failure. The same rule remains stable across local, asynchronous, event-driven, and distributed execution.

Brain, Bootstrap, and Core retain distinct platform roles. Configured capability outputs can participate in orchestration without becoming orchestration. Configuration can be supplied through composed relationships without becoming composition. A future shared Contract can be Core-custodied without making configuration or Core the owner of capability behavior.

## Ownership Matrix

| Concern                                                        | Architectural owner                    | Effect of configuration                                 |
| -------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| Configurable retrieval policy                                  | No independent semantic owner          | Parameters or constraints only                          |
| Context collaboration                                          | Context                                | Configurable only within Context decisions              |
| Retrieval initiation                                           | Context                                | Ownership remains unchanged                             |
| Retrieval-request semantics                                    | Context                                | Configuration cannot redefine the meaning independently |
| Aggregate returned-set semantics                               | Context                                | Configuration cannot acquire ownership                  |
| Contextual currentness                                         | Context                                | Configured evaluation does not establish currentness    |
| Incorporation                                                  | Context                                | Selection remains separate                              |
| Context Revision preparation, lifecycle, identity, and lineage | Context                                | Policy changes apply prospectively                      |
| Source interpretation and retrieval execution                  | Participating source                   | Source-side criteria remain subordinate                 |
| Reference and source-result semantics                          | Issuing source                         | Configuration cannot redefine them                      |
| Source lifecycle and currentness                               | Issuing source                         | Preference and ranking do not replace them              |
| Authority origin and preservation                              | Issuing source                         | Configuration cannot mint authority                     |
| Authority verification                                         | Issuing source                         | Ranking and scoring cannot substitute                   |
| Authorization semantics and decisions                          | Security                               | Configuration cannot decide permission                  |
| Authorization enforcement                                      | Applicable protected boundary          | Preference cannot bypass enforcement                    |
| Failure ownership                                              | Capability whose responsibility failed | No policy-owned failure                                 |
| Candidate-revision consequence                                 | Context                                | Limited to the affected candidate                       |
| Brain orchestration and final cognitive result                 | Brain                                  | Configured outputs transfer no ownership                |
| Architectural composition                                      | Bootstrap                              | Configuration cannot restructure relationships          |
| Shared language and Contract custody                           | Core                                   | Custody does not confer policy semantics                |

## Alternatives Considered

### Configurable Policy as an Independent Retrieval Owner

Rejected because a central policy owner would compete with Context request meaning and source interpretation while obscuring accountability.

### Shared Policy Ownership Across Context and Sources

Rejected because Context and source retrieval responsibilities have different semantic boundaries. Shared ownership would merge rather than coordinate them.

### Configuration Redefines Context or Source Meaning

Rejected because parameters can influence an owned decision but cannot replace the capability responsibility that gives the decision meaning.

### Ranking Establishes Authority or Verification

Rejected because comparative position supplies neither provenance nor issuer-owned verification.

### Ranking, Selection, or Preference Establishes Authorization

Rejected because desirability and candidate choice do not constitute a Security-owned permission decision.

### Selection Constitutes Incorporation

Rejected because candidate identification remains separate from the Context-owned decision that places a reference in a Context Revision.

### Policy Change Mutates Existing Context

Rejected because prospective criteria cannot rewrite a stable evidence boundary or an Active revision.

### Policy Owns Configured-Evaluation Failures

Rejected because failure meaning follows the accepted capability responsibility that failed, not the configuration supplied to it.

### Administrator or Provider Determines Ownership

Rejected because supplying, managing, storing, or evaluating configuration does not confer capability semantics.

### Runtime Placement Determines Policy Authority

Rejected because execution topology and implementation placement cannot assign architectural responsibility.

## Consequences

- Capabilities can support configurable criteria without creating a policy capability.
- Context and source retrieval responsibilities remain separate.
- Relevance, ranking, selection, and preference remain subordinate to capability-owned decisions.
- Candidate selection remains separate from incorporation.
- Authority, verification, authorization, currentness, and enforcement retain their established owners.
- Policy changes affect future decisions rather than historical Context.
- Historical evidence, reconstruction, and replay boundaries remain intact.
- Configured-evaluation failures remain capability-owned.
- Brain orchestration, Bootstrap composition, and Core custody remain unchanged.
- Administration and implementation placement do not determine ownership.
- Concrete policy content and mechanisms remain deferred.

## Risks

- Configurable policy may be modeled incorrectly as an independent owner.
- A shared policy may merge Context request meaning with source interpretation.
- Configuration may override Context retrieval-request semantics.
- Context criteria may redefine source-result meaning or authority.
- Ranking may be treated as authority or provenance.
- Ranking or scoring may replace issuer-owned verification.
- Ranking, selection, or preference may be treated as authorization.
- Selection may be treated as incorporation.
- Source preference may bypass Security enforcement.
- Ranking or preference may be treated as currentness or freshness.
- Policy changes may mutate historical or Active Context.
- Present policy may rewrite historical meaning.
- Present criteria may replace historical evidence required for reconstruction or replay.
- Policy-related failures may leak into an independent policy-owned category.
- Administrators may be mistaken for semantic owners.
- Providers or evaluators may acquire ownership through implementation placement.
- Configurable criteria may be allowed to control Brain orchestration.
- Configuration may be allowed to restructure Bootstrap composition.
- Core custody of a future Contract may be confused with policy semantic ownership.
- A runtime mechanism may be treated as architectural authority.

## Dependencies

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
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md) — Draft provisional predecessor while applicable.
- [ADR-0015 — Brain Cognitive-Reference Orchestration and Final Cognitive Result Boundaries](ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md) — Draft provisional predecessor while applicable.
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md) — Draft provisional predecessor while applicable.
- [ADR-0017 — Execution Model Independence for Asynchronous, Event-Driven, and Distributed Collaboration](ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md) — Draft provisional predecessor while applicable.
- [ADR-0018 — Refresh, Recollection, and Repeated Context Preparation Boundaries](ADR-0018-Refresh-Recollection-and-Repeated-Context-Preparation-Boundaries.md) — Draft provisional predecessor while applicable.
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [DECISION-0001 — Context Collection Semantics](../decisions/DECISION-0001-Context-Collection-Semantics.md) — Non-normative source decision record.
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

## Future Review

Future review can address concrete relevance, ranking, scoring, threshold, weight, source-priority, preference, and selection rules; policy precedence and conflict resolution; administration and authorization; policy lifecycle and versioning; persistence; evaluation timing; representations; and implementation mechanisms.

Any later proposal that assigns independent semantic ownership to configuration, merges Context and source retrieval meaning, changes historical Context, or derives authority, authorization, currentness, incorporation, orchestration, composition, or custody from policy requires architectural review.

## Implementation Notes

This draft supplies an ownership and non-equivalence boundary only. It authorizes no policy language, configuration model, evaluator, provider, store, API, runtime, algorithm, or administration mechanism.

Later specifications can define approved mechanisms only after appropriate architectural authority and while preserving the capability boundaries recorded here.

## Change History

| Version | Date       | Description                                                          |
| ------- | ---------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-08-08 | Initial draft derived from the non-normative source decision record. |

## Engineering Motto

> Configuration can shape an owned decision; it never becomes the owner of that decision.
