# ENGINE-0003 — Context Engine Revision

| Field          | Value                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Status**     | Active                                                                                             |
| **Supersedes** | 2.0.0                                                                                              |
| **Version**    | 3.0.0                                                                                              |
| **Owner**      | Context Engine                                                                                     |
| **Created**    | 2026-08-11                                                                                         |
| **Updated**    | 2026-08-11                                                                                         |
| **Applies To** | Context preparation profiles, source incorporation, revision lifecycle, and authority verification |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0003
revision. It supersedes versions 1.0.0, 1.1.0, and 2.0.0. Those revisions are
historical and non-authoritative.

This revision describes the fixed Identity-only and Identity + Knowledge
preparation profiles authorized by CONTRACT-0001 and the governing Context
and Knowledge Concepts and ADRs. It introduces no generic multi-source
architecture.

Context is the semantic owner of Context preparation, retrieval initiation,
candidate incorporation, Context validation, activation, revision lifecycle,
and Active Context Revision authority. Core custodies shared executable
Contract language without acquiring Context or source semantics.

## Purpose

The Context Engine prepares and issues an immutable Active Context Revision
representing the information relevant to one applicable reasoning situation.

Context initiates required source retrieval through Core-custodied source
Contracts. Each qualified source retains interpretation, execution, result,
lifecycle, currentness, attribution, and failure semantics. Candidate
availability is distinct from incorporation.

## Capability Ownership

Context owns:

- validation of the outer Context preparation request and target;
- the decision that source retrieval is required for a preparation profile;
- invocation of qualified source Contracts;
- receipt of source-owned candidate material;
- construction of Context-owned source projections and fragments;
- closure of the incorporated-reference set;
- Context validation and activation;
- Lineage and Revision identity, numbering, parentage, and reuse;
- expiration and replacement of prior Active revisions; and
- registration and verification of Active Context Revision authority.

Identity retains Identity request interpretation, validation, source
invocation, result validation, Current Identity semantics, lifecycle,
attribution, and failures.

Knowledge retains Knowledge request interpretation, validation, Store
invocation, result validation, record reconstruction, Knowledge Identity,
Version, Currency, lifecycle, attribution, and failures.

Context MUST NOT authenticate an actor, interpret source request fields,
invoke Identity Source or Knowledge Store, decide Knowledge Currency, perform
authorization, or acquire source lifecycle behavior.

## Fixed Preparation Profiles

Version 3.0.0 supports exactly two fixed profiles.

### Profile A — Identity-only

The Identity-only profile preserves:

- Prepare Context Revision;
- Compose Context Revision;
- one mandatory Identity Context Fragment;
- `sourceCount = 1`; and
- `fragmentCount = 1`.

Prepare Context Revision receives a Context target and one associated Identity
Resolution Request. Context invokes Resolve Current Identity and receives
Current Identity as candidate material. Compose Context Revision remains the
incorporation-only operation for that completed candidate.

### Profile B — Identity + Knowledge

The Knowledge-aware profile adds separate preparation and incorporation
operations. Its preparation request contains exactly:

- one Context target;
- one Identity Resolution Request; and
- one Get Knowledge Request.

Knowledge participation is required for this profile. There is no missing-
Knowledge continuation, default Knowledge, or fallback to Identity-only
preparation.

Its Active revision contains exactly:

1. one Identity Context Fragment;
2. one Knowledge Context Fragment;
3. `sourceCount = 2`; and
4. `fragmentCount = 2`.

These profiles do not authorize arbitrary source arrays, source registries,
generic candidate models, aggregation, ranking, selection, or dynamic
fragment membership.

## Context-owned Retrieval

For either profile, Context owns the preparation purpose and initiates each
required retrieval. Nested Identity and Knowledge requests remain opaque to
Context except for their structural participation in the outer preparation
request.

For the Knowledge-aware profile, the semantic phases are:

```text
Context preparation
→ qualified source retrieval
→ source-owned candidate availability
→ explicit Context incorporation
→ Context validation
→ activation
```

The implementation MAY execute current synchronous calls in a deterministic
order, but this specification does not make physical sequencing,
synchronization, transport, process placement, or concurrency architectural.

Retrieval alone MUST NOT create a Lineage, create a Revision, close the
incorporated-reference set, mutate an existing Active revision, or activate
Context.

## Candidate Material

Current Identity is the Identity-owned candidate material.

Retrieved Knowledge is Knowledge-owned candidate material. Context MUST NOT
incorporate Retrieved Knowledge or Knowledge Record directly. Knowledge
Reference is the source-owned handoff accepted by the Knowledge-aware
incorporation operation.

Possession, retrieval, or return of either candidate does not itself establish
Context membership, authority verification, authorization, or current
applicability.

## Context Projections

Context reconstructs source candidates into immutable Context-owned
projections. It MUST NOT retain collaborator-owned candidate or reference
objects as the projection.

The Identity projection remains unchanged and contains Anonymous or
Authenticated state, Identity attribution, and an Identity Identifier only
for Authenticated state.

The Knowledge Context Projection contains exactly:

- Knowledge Identity;
- Version;
- validation state `accepted`;
- Knowledge Currency; and
- authoritative owner `knowledge`.

It contains no Claim, Provenance, Acceptance Evidence, authority identifier,
confidence, timestamp, Store state, raw source evidence, or source-object
identity.

The Knowledge Context Fragment contains exactly one Knowledge Context
Projection and preserves Knowledge attribution without transferring Knowledge
semantic ownership to Context.

## Fragment Ordering

The canonical stored order for the Knowledge-aware profile is:

```text
Identity → Knowledge
```

This order exists for deterministic representation, comparison, and
reproducibility. It does not imply retrieval execution order, authority
priority, semantic priority, source priority, ranking, or selection.

## Incorporation

Compose Context Revision and the Knowledge-aware composition operation are
incorporation-only. They perform no retrieval.

The Knowledge-aware incorporation operation receives:

- the Context target;
- completed Current Identity; and
- completed Knowledge Reference.

It MUST:

1. validate the Context-owned request and target;
2. defensively validate candidate projections;
3. reconstruct immutable Identity and Knowledge projections;
4. construct the fixed fragment set in canonical order;
5. close the incorporated-reference set;
6. validate the complete candidate revision;
7. reuse an equivalent Active revision or construct a governed successor; and
8. activate only after successful validation.

Automatic incorporation is prohibited.

## Revision Identity, Reuse, and Lifecycle

Each Lineage has one stable Lineage Identity. Revision Numbers are positive
and consecutive. A successor retains the Lineage Identity, receives a new
Revision Identity, and identifies its direct parent.

Semantic reuse compares the target and incorporated projection content. For a
Knowledge-aware revision, Knowledge equality includes Knowledge Identity,
Version, validation state, Currency, attribution, and canonical profile
structure. It excludes retrieval timing, execution order, candidate or Record
object identity, Store identity, Provenance, Acceptance timestamp, Bootstrap
identity, and transport metadata.

Equivalent incorporated content returns the existing Active revision. A
meaningful projection change constructs and validates a successor before the
prior Active revision is expired and replaced.

The lifecycle remains:

```text
Collecting → Composing → Validating → Active → Expired → Archived
```

Archived remains optional and unimplemented. Active and historical revision
content is immutable. Failure before successful successor activation MUST NOT
expire or replace the existing Active revision.

## Currentness

Knowledge Source Currentness and Contextual Currentness are distinct.

Context MAY preserve Knowledge Currency as source-owned projection
information. It MUST NOT infer that `current` is Contextually Current or that
`superseded` is automatically invalid for Context.

This revision defines no TTL, freshness threshold, refresh interval,
currentness algorithm, ranking, selection, or incorporation policy beyond the
fixed profiles.

## Failure Semantics

Identity failures retain Identity ownership and propagate unchanged through
their preparation paths.

The following Knowledge failures retain Knowledge ownership and propagate
unchanged through Knowledge-aware preparation:

- Invalid Knowledge Input;
- Invalid Knowledge Identity;
- Knowledge Not Found;
- Knowledge Store Unavailable; and
- Invalid Knowledge State.

Context MUST NOT wrap, recreate, translate, or convert these failures to
Context Validation Failure.

A malformed or nonconforming Knowledge candidate is distinct from a Knowledge
retrieval failure. Context rejects malformed Knowledge material at its
incorporation boundary with the Context-owned Invalid Knowledge Context
Projection failure.

No retry, fallback, recovery, timeout, compensation, rollback, cancellation,
or dead-letter behavior is defined.

## Partial-success Safety

If Identity retrieval succeeds and Knowledge retrieval fails:

- no new Lineage or Revision exists;
- no fragment is incorporated;
- no activation occurs;
- the Identity candidate is not persisted in Context;
- no Identity-only fallback occurs;
- the exact Knowledge failure propagates; and
- an existing Active revision remains unchanged.

If retrieval completes but Knowledge material is malformed, Context may begin
incorporation but MUST reject the material before activation. No invalid
revision becomes Active, and existing Active state remains unchanged.

## Immutability and Authority

Revision objects, metadata, fragment collections, fragments, and projections
are immutable and defensively reconstructed.

Context authority registration and verification remain issuer-owned. A
structurally valid revision, accepted Knowledge, successful retrieval,
incorporation, or activation does not independently prove authority. Knowledge
attribution is not authority verification.

## Authorization and Enforcement

Security retains authorization-decision ownership. Protected boundaries retain
enforcement ownership. Context preparation, source execution, candidate
possession, incorporation, activation, and authority attribution do not grant
or recreate authorization.

This revision introduces no authorization or enforcement mechanism.

## Bootstrap Composition

Bootstrap is composition-only. It MAY construct lifecycle-ready capabilities,
obtain Resolve Current Identity and Get Knowledge through Core-custodied
Contracts, inject them into Context, and invoke the selected Context
preparation operation.

Bootstrap MUST NOT interpret source requests or candidates, decide Knowledge
Currency, fabricate Knowledge, construct fragments, incorporate candidates,
validate Context, or expose raw source material downstream.

## Dependency Boundary

Context depends inward on Core-custodied executable Contract language and
Context-local implementation only. It MUST NOT depend directly on Identity
Engine, Identity Source, Knowledge Engine, Knowledge Store, Bootstrap,
Infrastructure, Memory Engine, or another concrete qualified-source Engine.

Dependency tooling enforces part of this boundary but does not create its
architectural authority.

## Brain, Reasoning, and Planning Boundary

Brain receives only an authoritative Active Context Revision. It does not
receive raw Identity or Knowledge source material.

Reasoning receives exactly its approved intent, Active Context Revision, and
query inputs. Planning receives Reasoning output according to its governing
Contract.

Retrieved Knowledge, Knowledge Record, Knowledge Reference, Get Knowledge
Request, and Get Knowledge MUST NOT enter Brain, Reasoning, or Planning as
parallel evidence paths.

## Persistence and Execution-model Boundaries

Version 3.0.0 remains persistence-neutral and process-local in its current
implementation. Persistence, logical reconstruction, exact replay, and
historical reproduction remain separate governed concerns.

No synchronous, asynchronous, event-driven, distributed, or transport model
is architecturally required by the preparation semantics.

## Compatibility and Migration

Version 3.0.0 is a major Engine-spec revision because the public Context
fragment and revision model expands from one fixed Identity profile to two
fixed profiles.

The Identity-only preparation and incorporation operations remain unchanged.
The Knowledge-aware preparation and incorporation operations are additive and
separate. Consumers that assumed every Context revision had exactly one
Identity fragment MUST handle the fixed Knowledge-aware profile.

No persisted-data migration is defined because the current implementation
introduces no Context persistence.

## Conformance and Acceptance

Conformance evidence MUST demonstrate:

- source-request opacity;
- Context-owned retrieval initiation;
- candidate availability distinct from incorporation;
- exact fixed profiles and canonical ordering;
- defensive projection reconstruction and immutability;
- source failure ownership and partial-success safety;
- malformed-candidate distinction;
- semantic reuse and governed successor behavior;
- existing Active revision preservation;
- Context/Knowledge currentness separation;
- no raw source evidence downstream; and
- prohibition of direct Context dependencies on source implementations.

## Change History

| Version | Date       | Description                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Established the original Identity-only Context Engine vertical slice.                                         |
| 1.1.0   | 2026-07-29 | Added issuer-owned Active Context Revision authority verification.                                            |
| 2.0.0   | 2026-08-11 | Aligned Context-owned Identity retrieval with CONTRACT-0001.                                                  |
| 3.0.0   | 2026-08-11 | Added the fixed Identity + Knowledge preparation profile while preserving Identity-only preparation behavior. |

## References

- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0016 — Persistence and Reconstruction](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [Knowledge Engine 1.1.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.1.0.md)
- [Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [Brain Engine 2.0.0](../ENGINE-0001-Brain-Engine.md)
- [Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Planning Engine 2.0.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ENGINE-0003 2.0.0](ENGINE-0003-Context-Engine-Revision-2.0.0.md)

## Engineering Motto

> Context incorporates source-owned candidates without acquiring source ownership.
