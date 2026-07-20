# ENGINE-0003 — Context Engine

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| **Status**     | Active                                      |
| **Version**    | 1.0.0                                       |
| **Owner**      | Project Maintainers                         |
| **Created**    | 2026-07-19                                  |
| **Updated**    | 2026-07-19                                  |
| **Applies To** | Context Engine, M2 — Context Vertical Slice |

---

## Status

This specification is Active and governs M2 implementation according to the documentation authority and status rules.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements within this specification.

## Purpose

The Context Engine answers:

> What is relevant right now?

It is the single semantic owner of the Context capability. It constructs and evolves immutable Context Revisions within stable Context Lineages, governs the Context lifecycle, and exposes an Active Context Revision that is safe for future reasoning consumption.

M2 proves the minimum Context pattern using one real source capability—Identity—without implementing full cognitive composition, persistence, reasoning, replay, or external infrastructure.

## Capability Ownership

The Context Engine owns:

- Context Lineage semantics;
- Context Revision semantics;
- revision ordering and parentage semantics;
- Context lifecycle transitions;
- Context Fragment composition semantics;
- Context validation and activation semantics;
- selection of the current Active Context Revision within a lineage;
- creation of a new revision when relevant contextual state changes.

The Core is the canonical custodian of shared Context Contracts, identifiers, lifecycle types, projections, and failure definitions. Core custody governs shared definitions, compatibility, and versioning; it does not transfer Context behavior to Core.

Context Engine does not own Identity, Memory, Knowledge, Reasoning, Planning, Skills, Security policy, external systems, persistence technology, or exact-replay storage. Context may own the temporary contextual representation of a source projection while the source capability retains semantic ownership of the underlying facts.

## Scope

M2 includes:

- creation of one Context Lineage with one stable Context Lineage Identity;
- creation and deterministic ordering of Context Revisions;
- unique Context Revision Identity per revision;
- the Collecting → Composing → Validating → Active creation path;
- expiration of a previous Active revision when its successor becomes Active;
- one immutable Identity Context Fragment per revision;
- retrieval of the sole current Active Context Revision for a lineage;
- creation of a successor revision when the relevant Identity projection changes;
- deterministic, framework-free behavior and tests;
- privacy-safe runtime diagnostics.

M2 composes only Identity Context. It does not claim to implement complete operational Context.

## Non-Goals

M2 does not define or implement:

- Memory, Knowledge, Planning, device, environmental, temporal, session, or distributed Context sources;
- Memory Engine, Knowledge Engine, Reasoning Engine, Planning Engine, or Security Engine behavior;
- full Context conflict resolution, prioritization, relevance scoring, or cognitive selection;
- Context persistence, repositories, databases, retention mechanisms, or deletion;
- Context Snapshots, Logical Reconstruction, or Exact Replay;
- Archived-state behavior;
- Events, Event brokers, queues, or distributed synchronization;
- HTTP, API, Gateway, client, or external-integration behavior;
- LLMs, AI providers, or model-specific representations;
- authorization decisions or Security policy evaluation.

## Core Concepts

M2 uses only the following Context concepts.

### Context Lineage Identity

A **Context Lineage Identity** is the opaque, stable identity of one logical Context evolution. It is assigned when the lineage is created and MUST remain unchanged across every revision in that lineage.

Its representation and allocation mechanism are implementation details, provided they are technology-independent, deterministic under controlled test inputs, and collision-free within the M2 runtime scope. M2 does not mandate UUID, ULID, database, clock, or distributed allocation technology.

### Context Revision Identity

A **Context Revision Identity** is the opaque identity of exactly one Context Revision. Every revision MUST have a distinct Revision Identity, including revisions in the same lineage. It MUST remain stable throughout that revision's lifecycle and MUST NOT be reused.

### Context Revision Number

A **Context Revision Number** provides deterministic ordering within one lineage. M2 uses consecutive positive ordering:

- the first revision is revision 1;
- each successor is exactly the previous revision number plus one;
- revision numbers are scoped to one lineage;
- a failed candidate MUST NOT create an observable gap in the successful lineage order.

Revision number is an ordering semantic, not a global identity.

### Context Lifecycle State

The canonical Context lifecycle states are exactly:

`Collecting → Composing → Validating → Active → Expired → Archived (optional)`

M2 implements Collecting, Composing, Validating, Active, and Expired. Archived is defined by the Foundation but deferred from M2 behavior.

Updating is not a lifecycle state.

### Context Fragment

A **Context Fragment** is one immutable, source-qualified unit used during composition. M2 supports exactly one fragment kind: the Identity Context Fragment.

This narrow choice proves compositional Context without introducing a generic Context Source registry or speculative source framework.

### Identity Context Projection

An **Identity Context Projection** is the minimum immutable projection of a successfully resolved Current Identity. It contains:

- Anonymous or Authenticated Identity state;
- one opaque Identity Identifier only when Authenticated;
- source ownership metadata identifying Identity as the authoritative capability.

It contains no Identity Resolution Reference, authentication evidence, provider payload, authorization decision, role, permission, profile, token, credential, or personal information.

### Context Revision

A **Context Revision** is one representation of relevant Context within a lineage. For M2 it contains:

- Context Lineage Identity;
- Context Revision Identity;
- Context Revision Number;
- optional Parent Context Revision Identity, absent only for revision 1;
- immutable creation metadata;
- one lifecycle state;
- one immutable Identity Context Fragment.

### Active Context Revision

An **Active Context Revision** is a Context Revision in the Active lifecycle state. It is not a separate identity model and does not receive a second identifier.

## Invariants

1. Context Engine is the single semantic owner of Context behavior.
2. Every lineage has exactly one stable Context Lineage Identity.
3. Every revision has exactly one unique Context Revision Identity.
4. Revision 1 has no parent; every later revision identifies the immediately preceding revision as its parent.
5. Revision numbers begin at 1 and advance by exactly one for each successfully activated successor.
6. Every revision occupies exactly one canonical lifecycle state.
7. Only a revision that completed composition and validation may become Active.
8. M2 permits at most one current Active Context Revision per lineage.
9. Every reasoning cycle in a future Reasoning Engine consumes exactly one immutable Active Context Revision.
10. An Active revision's identifiers, ordering, creation metadata, fragment composition, and projections MUST NOT change.
11. The only M2 lifecycle progression permitted after Active is Active → Expired.
12. An Expired revision MUST NOT be returned or consumed as current Active Context.
13. A relevant Identity change creates a new revision; it MUST NOT modify the current Active revision's contents.
14. Every M2 revision contains exactly one valid immutable Identity Context Fragment.
15. Identity remains the semantic owner of the projected facts.
16. Identity resolution failure MUST NOT become Anonymous and MUST prevent activation.
17. Context construction and evolution MUST be deterministic for the same lineage state, inputs, and controlled identity/creation allocation state.

## Context Lineage

M2 creates a Context Lineage as part of successfully creating its first Active Context Revision. A lineage is not considered successfully created if its first candidate fails collection, composition, or validation.

The lineage records the stable Lineage Identity, the ordered revisions that have successfully entered Active, and the identity of its current Active revision when one exists. This is conceptual Engine state, not persistence or a repository model.

M2 supports multiple independent lineages. The one-Active-revision rule applies within each lineage, not globally across the platform.

## Context Revision

Creation of a candidate revision begins in Collecting. The Context Engine assigns its Revision Identity, revision number, parent relationship, and creation metadata during the creation process.

Minimum M2 creation metadata consists of:

- Context Lineage Identity;
- Context Revision Identity;
- revision number;
- parent Revision Identity when applicable;
- a stable created-at value;
- lifecycle state;
- source count and fragment count, both equal to one in M2.

The created-at value MUST remain unchanged. Its concrete clock and representation are not prescribed. Tests MUST control it deterministically without introducing a concrete infrastructure dependency into Core or Context Engine.

Candidate allocation MUST NOT let an invalid candidate replace or mutate the current Active revision. Failed candidates are not returned as Active revisions and do not advance the observable successful revision order.

## Lifecycle

The authoritative lifecycle remains:

```text
Collecting
→ Composing
→ Validating
→ Active
→ Expired
→ Archived (optional)
```

M2 behavior is:

### Collecting

The Engine receives one immutable Current Identity produced through the Identity capability Contract and constructs one source-qualified Identity Context Fragment. Missing, malformed, or unresolved Identity input prevents further progression.

### Composing

The Engine combines the fragment with lineage, revision, parent, ordering, and creation metadata to form the candidate Context Revision. Composition MUST NOT mutate the supplied Current Identity or assign new Identity meaning.

### Validating

The Engine verifies all M2 invariants, required metadata, the Identity projection shape, revision ordering, parentage, and ownership qualification. A failure prevents activation.

### Active

After successful validation, the candidate becomes an immutable Active Context Revision valid for consumption.

When activating a successor, expiration of the previous Active revision and activation of the successor form one semantic operation. If successor activation fails, the previous revision remains Active.

### Expired

When a successor becomes Active, the previous Active revision transitions to Expired. Its contextual contents, identifiers, ordering, parentage, creation metadata, and projections remain unchanged. Only the permitted lifecycle marker changes.

Expired revisions are not current Context and MUST NOT be returned by the Active Context query.

### Archived

Archived remains part of the canonical lifecycle but is not implemented by M2. M2 defines no retention, archival, deletion, snapshot, or replay behavior.

Invalid transitions—including Active → Collecting, Active → Composing, Active → Validating, Expired → Active, and any Updating transition—MUST fail explicitly.

## Identity Projection

M2 uses the successful output of the Core-custodied Resolve Current Identity Contract as its only Context Source input.

The Context Engine creates a Context-owned immutable projection for temporary inclusion in the revision. Context ownership applies only to the projection's placement and lifecycle as Context. Identity Engine remains semantic owner of:

- the actor state;
- the Identity Identifier;
- Identity validity and resolution semantics.

The projection rules are:

- Anonymous Current Identity becomes an Anonymous projection with no Identity Identifier;
- Authenticated Current Identity becomes an Authenticated projection with exactly one opaque Identity Identifier;
- no raw resolution input or source payload is copied;
- the projection MUST be defensively validated before activation;
- the projection MUST NOT be externally mutable;
- Context MUST NOT reclassify Anonymous as Authenticated or the reverse.

M2 does not claim Logical Reconstruction because M1 does not expose a versioned Identity source revision. A future source-revision reference may be added only through an approved Contract evolution.

## Context Composition

The minimum runtime interaction flow is:

```text
Resolve Current Identity Contract
→ immutable Current Identity
→ begin Context Revision in Collecting
→ create Identity Context Fragment
→ compose revision and metadata
→ validate revision
→ activate revision
→ expose immutable Active Context Revision
```

These arrows describe runtime data and interaction flow, not source-code dependency direction.

The Identity resolution step occurs before Context construction. Bootstrap or a future orchestration boundary invokes both Core-custodied Contracts. Context Engine depends only on shared Core definitions and MUST NOT depend on the Identity Engine implementation or the in-memory Identity Source.

Required composition inputs are:

- an explicit new-lineage or existing-lineage target;
- one successfully resolved immutable Current Identity;
- controlled creation metadata inputs needed for deterministic M2 behavior.

Successful output is one immutable Active Context Revision. M2 composes no Memory, Knowledge, Planning, device, environment, or external-system data.

## Active Context Semantics

For M2, each lineage has zero or one current Active Context Revision:

- zero before the first successful activation;
- one after successful activation;
- still one when successor construction fails;
- one new Active revision after successful successor activation, while the prior revision is Expired.

Get Active Context Revision returns the exact immutable Active revision for the requested lineage. It MUST NOT synthesize, reconstruct, reactivate, or return an Expired revision.

M2 does not implement Reasoning. The exposed Active revision is sufficient for a future reasoning cycle to identify and consume exactly one immutable revision.

## Revision Evolution

A meaningful change to the Identity projection requires a successor revision in the same lineage.

For the M2 demonstration:

1. Revision 1 contains Anonymous Identity and becomes Active.
2. A later successful Identity resolution yields Authenticated Identity.
3. Revision 2 begins Collecting in the same lineage.
4. Revision 2 receives a new Revision Identity, revision number 2, and Revision 1 as parent.
5. Revision 2 progresses through Composing and Validating.
6. Successful activation expires Revision 1 and makes Revision 2 current Active Context.

Revision 1 retains its Lineage Identity, Revision Identity, number, parentage, creation metadata, and Anonymous projection. Its lifecycle state becomes Expired through the one valid post-Active transition.

If the newly resolved Identity projection is semantically unchanged, M2 SHOULD return the existing Active revision rather than manufacture a meaningless successor. This idempotent behavior prevents revision churn. A change in Anonymous/Authenticated state or authenticated Identity Identifier is meaningful for M2.

## Contracts

All M2 cross-boundary interactions occur through Core-custodied Contracts. Contracts are conceptual and technology-independent; they do not prescribe TypeScript interfaces, serialization, storage, or transport.

### Compose Context Revision Contract

| Property                          | Definition                                                                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                                           |
| **Purpose**                       | Create the first or next valid Active Context Revision.                                                                                         |
| **Domain semantic owner**         | Context Engine                                                                                                                                  |
| **Schema custodian**              | Core                                                                                                                                            |
| **Implementation responsibility** | Context Engine                                                                                                                                  |
| **Input**                         | A discriminated new-lineage or existing-lineage target, one immutable Current Identity, and controlled creation metadata required by M2.        |
| **Output**                        | One immutable Active Context Revision; for successor activation, the prior Active revision is observably Expired.                               |
| **Failures**                      | Invalid request or identifier, unknown lineage, invalid lifecycle transition, missing/invalid Identity projection, Context validation failure.  |
| **Guarantees**                    | Valid lifecycle execution, stable lineage, unique revision, deterministic order, immutable projection, at most one Active revision per lineage. |

The new-lineage target contains no caller-selected revision number or parent. The existing-lineage target identifies the lineage and SHOULD identify the Active Revision Identity it expects to advance so stale concurrent input fails instead of replacing a newer revision.

This Contract encapsulates lifecycle progression. M2 does not expose separate public Collect, Compose, Validate, or Activate commands because externally assembling those phases would expand the Contract surface and weaken Engine ownership.

### Get Active Context Revision Contract

| Property                          | Definition                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                 |
| **Purpose**                       | Retrieve the sole current Active Context Revision for one lineage.                    |
| **Domain semantic owner**         | Context Engine                                                                        |
| **Schema custodian**              | Core                                                                                  |
| **Implementation responsibility** | Context Engine                                                                        |
| **Input**                         | One validated Context Lineage Identity.                                               |
| **Output**                        | The immutable current Active Context Revision.                                        |
| **Failures**                      | Invalid or unknown lineage identity; no Active Context Revision available.            |
| **Guarantees**                    | Never returns an Expired revision, mutable internal state, or more than one revision. |

No generic Context Source Contract is introduced in M2. The existing Resolve Current Identity Contract provides the only required source boundary.

## Published Events

M2 publishes no Context Events.

Revision activation and expiration are meaningful domain facts, but M2 has no approved Event consumer or Event infrastructure requirement. Events may be introduced only by a later approved use case with Core schema custody, Context semantic ownership, explicit runtime publication authority, and privacy-safe payloads.

## Consumed Events

M2 consumes no Events. Context evolution is requested explicitly through Contracts.

## Dependencies

Context Engine MAY depend on:

- Core-custodied Context identifiers, types, Contracts, and failures;
- Core-custodied Current Identity and Identity projection types;
- technology-neutral allocation or creation-time abstractions only if required for deterministic construction.

Context Engine MUST NOT depend directly on:

- Identity Engine implementation or the in-memory Identity Source;
- any other Engine implementation;
- Providers, Adapters, Infrastructure, databases, external systems, or Event brokers;
- authentication, transport, persistence, or AI frameworks;
- external npm packages unless separately approved for a later milestone.

Bootstrap composes Resolve Current Identity and Context Contracts explicitly. Runtime collaboration does not change inward source-code dependency direction.

## Internal Components

M2 requires only these logical responsibilities:

- **Lineage Manager** — maintains stable lineage identity, successful revision order, and the current Active revision;
- **Context Composer** — constructs the Identity Context Fragment and candidate revision;
- **Context Validator** — enforces M2 invariants and lifecycle rules.

These are responsibilities, not mandatory classes, packages, services, or deployment units. Implementations SHOULD combine them when separation provides no demonstrated value.

## Engine Responsibilities

Context Engine is responsible for:

- validating all Context requests and source projections at runtime boundaries;
- creating Context Lineages and Revisions;
- assigning and validating lineage/revision identity, ordering, parentage, and metadata;
- executing valid lifecycle transitions;
- composing and validating the Identity Context Fragment;
- atomically replacing the current Active revision with a validated successor;
- preserving revision contents after activation;
- exposing the sole current Active revision;
- returning deterministic, technology-neutral Context failures.

It is not responsible for any Non-Goal listed above.

## Engine Lifecycle

Context Engine follows the platform Engine lifecycle:

`Initialize → Ready → Running → Stopping → Stopped`

This Engine lifecycle is distinct from the Context Revision lifecycle.

For M2:

- initialization validates required Core Contracts and controlled identity/time allocation dependencies;
- initialization MUST be deterministic;
- Context operations MUST NOT execute while the Engine is not Running;
- stopping MUST NOT manufacture, activate, expire, archive, or persist a revision.

The lifecycle does not imply a process boundary or framework.

## State Management

M2 maintains process-local lineage and revision state only to demonstrate Context semantics. This state is owned semantically by Context Engine and is not a persistence abstraction.

The Engine MUST NOT expose mutable internal collections. Returned revisions, fragments, projections, and metadata MUST be immutable views or values. Physical persistence, retention, snapshots, and reconstruction remain deferred.

## Configuration

M2 configuration is limited to bootstrap construction of deterministic identifier and created-at inputs where required.

Context Engine MUST NOT contain:

- database or repository configuration;
- Provider, Adapter, endpoint, credential, or external-system configuration;
- Event broker or queue configuration;
- model, LLM, or framework configuration;
- environment-variable access in Context domain behavior.

No configuration framework is required.

## Failure Semantics

M2 defines the following minimum failure categories.

### Invalid Context Input

A request, Context Lineage Identity, Context Revision Identity, creation metadata value, or supplied projection violates its Contract. It is rejected before state changes.

### Context Lineage Not Found

An operation identifies a lineage that is not known to the Engine. No candidate becomes Active and no current revision changes.

### Invalid Context Lifecycle Transition

A requested or attempted transition is not part of the canonical lifecycle or violates current state. Updating and re-entry from Active into a construction state are always invalid.

### Missing or Invalid Identity Projection

Context construction lacks a successfully resolved Current Identity or receives an Identity value that violates Identity invariants. The candidate MUST NOT become Active.

### Context Validation Failure

The composed candidate violates lineage, revision, ordering, parentage, metadata, fragment, ownership, or single-Active-revision invariants.

### No Active Context Revision

The requested lineage exists but has no current Active revision. An Expired revision MUST NOT be returned as fallback.

Failures MUST be deterministic, technology-neutral, privacy-safe, and distinguishable. Unexpected implementation failures MUST be normalized at the Context Engine boundary without exposing implementation internals or source payloads.

## Relationship with Identity

Identity answers:

> Who is the actor?

Context answers:

> What is relevant right now?

M2 runtime composition MUST resolve Identity through the Resolve Current Identity Contract before Context composition. Context Engine receives only the validated immutable Current Identity output.

Context Engine MUST NOT:

- invoke or depend on the concrete Identity Engine;
- access the in-memory Identity Source;
- receive, inspect, persist, or expose an Identity Resolution Reference;
- validate authentication evidence or redefine Identity state;
- assign Identity Identifiers;
- infer authorization from Authenticated state;
- convert an Identity failure into Anonymous.

If Identity resolution fails, orchestration MUST preserve the Identity-domain failure and MUST NOT invoke successful Context activation with a fabricated projection. If Context is called without a valid projection, it fails with Missing or Invalid Identity Projection. Any candidate remains non-Active and the previous Active revision remains unchanged.

## Security

Context Engine owns no authorization or Security policy semantics. It MUST validate untrusted Contract inputs, minimize Identity information, preserve Security policy ownership, and enforce applicable Security-owned decisions at protected boundaries through Contracts without direct Security Engine coupling.

M2 contains no authorization decision and does not treat Authenticated Identity as permission to perform an action.

## Observability and Privacy

M2 SHOULD expose:

- Engine lifecycle and health status;
- lineage-creation and revision-activation outcome counts;
- current revision number;
- Context lifecycle state;
- Anonymous or Authenticated projection state;
- failure counts by M2 category;
- correlation identifier where policy permits.

M2 diagnostics MAY report:

- Context capability initialized;
- lineage created;
- revision number;
- lifecycle state;
- Identity projection state.

Logs, metrics, failures, and diagnostics MUST NOT contain:

- Identity Resolution References;
- raw Identity Identifiers;
- credentials, secrets, authentication tokens, or source payloads;
- personal information;
- authorization decisions;
- mutable Context contents.

Identifiers used for technical correlation SHOULD be minimized or redacted according to Security and privacy governance. No production observability vendor is required.

## Performance

M2 defines no throughput or latency target.

Correct lifecycle, validation, ownership, immutability, and deterministic behavior take precedence over optimization. Performance work MUST NOT weaken Context invariants or introduce speculative caching, persistence, or infrastructure.

## Testing

The future M2 implementation MUST include deterministic tests for:

- valid and invalid Context Lineage Identity construction;
- valid and invalid Context Revision Identity construction;
- first revision numbering and successor ordering;
- stable lineage identity and unique revision identities;
- parent-revision semantics;
- Collecting → Composing → Validating → Active transitions;
- invalid transition rejection, including Active → Composing and Expired → Active;
- one Active revision per lineage;
- immutable Active revision, metadata, fragment, and Identity projection;
- Anonymous and Authenticated Identity projections;
- missing/malformed Identity projection rejection;
- preservation of Identity-domain failures before Context activation;
- unchanged Identity projection idempotence;
- Identity change creating a successor revision;
- successful successor activation expiring the prior revision;
- failed successor construction leaving the prior revision Active and unchanged;
- Compose Context Revision and Get Active Context Revision Contract behavior;
- Engine initialization and explicit bootstrap composition;
- privacy-safe diagnostics;
- dependency rules preventing Core and Context Engine outward coupling.

Tests MUST require no network, external service, database, persistent storage, event infrastructure, clock-dependent nondeterminism, or nondeterministic identifier generation.

## M2 Implementation Boundary

The future M2 implementation SHOULD include only:

- Core-custodied Context domain types, identifiers, Contracts, and failures;
- a framework-free Context Engine;
- Identity integration through Core-custodied Contracts and immutable Current Identity output;
- explicit bootstrap composition of the accepted Identity and Context slices;
- controlled process-local state and deterministic demonstration identity/time allocation;
- unit, Contract, lifecycle, immutability, architecture, privacy, and smoke tests;
- a diagnostic demonstrating Anonymous revision 1 and Authenticated revision 2 in one lineage.

The future implementation MUST NOT include:

- Memory, Knowledge, Reasoning, Planning, Skill, or Security Engine implementation;
- generic Context Source plugin infrastructure;
- persistence, repository, database, ORM, cache, Snapshot, replay, archival, or retention behavior;
- Events, Event Bus, broker, queue, or distributed synchronization;
- HTTP, API, Gateway, client, container, cloud, or deployment technology;
- external integrations, Providers, LLMs, or AI frameworks.

## Acceptance Criteria

M2 is complete only when:

1. Context Engine is the single semantic owner of Context behavior.
2. Core custodies shared Context types and Contracts without owning Context behavior.
3. A Context Lineage can be created with one stable Lineage Identity.
4. Revision 1 progresses through Collecting, Composing, Validating, and Active.
5. Identity is resolved through the Identity capability boundary before Context construction.
6. Revision 1 contains one immutable, source-qualified Identity projection.
7. An Active revision and its contents are immutable except for the permitted lifecycle transition to Expired.
8. Invalid lifecycle transitions fail explicitly without state mutation.
9. Identity resolution failure prevents activation and never becomes Anonymous.
10. A meaningful Identity change creates revision 2 in the same lineage.
11. Revision 2 has a new Revision Identity, number 2, and revision 1 as parent.
12. Successful revision 2 activation expires revision 1 and makes revision 2 the sole current Active revision.
13. Revision 1's identifiers, order, parentage, creation metadata, and Identity projection remain unchanged.
14. Failed successor construction leaves revision 1 Active and unchanged.
15. An unchanged Identity projection does not manufacture a new successful revision.
16. Get Active Context Revision returns exactly one immutable Active revision and never an Expired revision.
17. Context does not acquire Identity semantic ownership or expose resolution evidence.
18. Context Engine has no direct dependency on Identity Engine, another Engine, or concrete outer implementation.
19. diagnostics and failures expose no raw Identity Identifier, Identity Resolution Reference, source payload, credential, token, personal information, or authorization decision.
20. unit, Contract, lifecycle, immutability, architecture, privacy, and smoke tests are deterministic and pass.
21. the complete repository validation and architectural dependency checks pass.
22. no external service, persistent store, or deferred technology is required.

## Future Evolution

Later approved milestones MAY add:

- Memory and Knowledge references or projections;
- additional explicitly qualified Context Sources;
- source-revision references supporting conditional Logical Reconstruction;
- Context Snapshots and exact-replay evidence;
- expiration policies, archival retention, and deletion governance;
- meaningful Context Events;
- persistence behind Contracts;
- planning, device, environmental, temporal, and distributed Context;
- conflict resolution and relevance policies;
- reasoning traceability by Context Revision Identity.

Every extension must preserve stable lineage identity, unique revision identity, canonical lifecycle, Active immutability, source ownership, Core Contract custody, Security governance, and inward dependency direction.

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](../../../docs/adr/ADR-0005%20%E2%80%94%20Memory%20Architecture%20Principles)
- [OES-0001 — Repository Structure](../../../docs/engineering/OES-0001-Repository-Structure.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../../../docs/engineering/OES-0005-Events.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)
- [IMPLEMENTATION-M1 — Identity Engine Vertical Slice](../../../IMPLEMENTATION-M1.md)

## Engineering Motto

> Context evolves through new immutable revisions; it never rewrites the present in place.
