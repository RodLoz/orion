# ENGINE-0003 — Context Engine Revision

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Status**        | Superseded                                                                                         |
| **Supersedes**    | 3.0.0                                                                                              |
| **Superseded By** | [5.0.0](ENGINE-0003-Context-Engine-Revision-5.0.0.md)                                              |
| **Version**       | 4.0.0                                                                                              |
| **Owner**         | Context Engine                                                                                     |
| **Created**       | 2026-08-11                                                                                         |
| **Updated**       | 2026-08-11                                                                                         |
| **Applies To**    | Context preparation profiles, source incorporation, revision lifecycle, and authority verification |

---

## Status and Authority

This specification is Superseded by ENGINE-0003 5.0.0. It remains the
historical authority for the milestone that added the fixed Identity + Memory
profile while preserving the Identity-only and Identity + Knowledge profiles,
and superseded versions 1.0.0, 1.1.0, 2.0.0, and 3.0.0.

It defines exactly three fixed preparation profiles: Identity-only, Identity

- Knowledge, and Identity + Memory. It defines no generic multi-source
  architecture, dynamic source registry, aggregation, ranking, or selection.

## Purpose and Ownership

Context prepares and issues one immutable authoritative Active Context
Revision for an applicable reasoning situation. Context owns outer request and
target validation, retrieval initiation, candidate-use decisions, projection
construction, incorporation, Context validation, semantic reuse and successor
lifecycle, activation, and Context authority.

Identity, Knowledge, and Memory retain interpretation, validation, execution,
result, lifecycle, attribution, and failure semantics for their respective
source Contracts. Core custodies shared executable language without acquiring
Context or source ownership.

## Fixed Preparation Profiles

### Profile A — Identity-only

- existing Prepare Context Revision and Compose Context Revision operations;
- exactly one Identity fragment;
- `sourceCount = 1`; and
- `fragmentCount = 1`.

### Profile B — Identity + Knowledge

- separate Knowledge-aware preparation and incorporation operations;
- exactly one Identity fragment followed by one Knowledge fragment;
- `sourceCount = 2`; and
- `fragmentCount = 2`.

Knowledge is required for this profile. There is no default, optional
continuation, or Identity-only fallback.

### Profile C — Identity + Memory

- separate Memory-aware preparation and incorporation operations;
- exactly one Identity fragment followed by one Memory fragment;
- `sourceCount = 2`; and
- `fragmentCount = 2`.

Memory is required for this profile. Knowledge is not required. There is no
default Memory, optional continuation, or Identity-only fallback. No Identity

- Knowledge + Memory profile is authorized.

## Context-owned Retrieval

Context owns the preparation purpose and initiates every retrieval required by
the selected fixed profile. Nested Identity, Knowledge, and Memory requests are
opaque source-owned input. Context forwards each exact request through its
Core-custodied source Contract.

For Profile C, Context invokes Resolve Current Identity and Get Memory and
receives Current Identity and Retrieved Memory as candidate material. Physical
synchronous call order is current mechanics, not authority, priority,
relevance, or an execution-model requirement.

Retrieval alone creates no Lineage or Revision, closes no incorporated set,
mutates no Active revision, and activates no Context.

## Candidate and Incorporation Boundary

Retrieved Memory is Memory-owned candidate material. Memory Reference is the
source-owned handoff used by the Memory-aware incorporation operation. Context
does not incorporate or retain Retrieved Memory or Memory Record.

Candidate availability is not incorporation. Incorporation is explicit and
Context-owned.

The Memory-aware incorporation operation performs no retrieval. It receives a
Context target, completed Current Identity, and completed Memory Reference. It
defensively validates inputs, reconstructs Context projections, constructs
`[Identity, Memory]`, closes the incorporated-reference set, validates the
candidate revision, applies semantic reuse or successor behavior, and
activates only after successful validation.

## Context-owned Memory Projection

The immutable Memory Context Projection contains exactly:

- Memory Identity;
- kind `episodic`;
- lifecycle state `stored`; and
- authoritative owner `memory`.

It excludes Memory Record content, Provenance, retention reason, retained-at
time, Retrieval Receipt, retrieved-at time, retrieval purpose, last-use state,
Store state, and source-object identity. Context reconstructs this projection
and does not alias Memory-owned objects.

`stored` is preserved source lifecycle information only. It is neither Source
Currentness nor Contextual Currentness and does not prove continued retention.

## Ordering

Canonical stored order is Identity → Knowledge for Profile B and Identity →
Memory for Profile C. Ordering supports deterministic representation and
comparison only. It implies no retrieval priority, authority priority,
relevance, ranking, selection, or semantic precedence.

## Historical Applicability and Forgetting

Context incorporates only the exact requested Memory identity and reference.
It does not search for latest Memory, list retained Memory for selection, or
substitute another Memory.

Later Forget Memory does not mutate an existing Active, stable, or historical
Context revision. Later unavailability affects later retrieval attempts
prospectively; prior incorporated Context meaning remains unchanged. Context
defines no Memory rehydration, recollection, Store-history selection,
reconstruction, replay, or evidence-sufficiency behavior.

## Currentness

Memory lifecycle or retention state, Source Currentness, and Contextual
Currentness are distinct. Memory currently exposes no Source Currentness value,
and Context invents none. `stored` does not imply source current; forgotten
Memory does not invalidate prior Context; retrieval time does not establish
Contextual Currentness. No TTL, freshness, aging, ranking, or selection policy
is defined.

## Failure and Partial-success Semantics

These Get Memory failures remain Memory-owned and propagate unchanged:

- Invalid Memory Input;
- Invalid Memory Identity;
- Memory Not Found;
- Memory Store Unavailable; and
- Invalid Memory State.

Malformed collaborator material is distinct from source failure. Context
rejects an invalid Memory projection at incorporation with Invalid Memory
Context Projection. No retry, fallback, recovery, timeout, compensation,
rollback, cancellation, or dead-letter behavior is defined.

If Identity succeeds and Memory fails, no fallback, Lineage, Revision,
fragment incorporation, or activation occurs. Existing Active Context remains
unchanged. Malformed Memory material likewise cannot activate a successor.

## Revision Reuse and Lifecycle

Equivalent incorporated Profile C content reuses the existing Active revision.
Memory equality includes Memory Identity, kind, lifecycle state, attribution,
and canonical profile structure. It excludes Retrieved Memory, Memory Record,
Memory Reference, and receipt object identities; retrieved-at time; request or
receipt purpose; content; Provenance; retention reason; retained-at time;
Store or Bootstrap identity; and execution timing.

A changed preserved Memory Identity is changed Context content and may produce
a governed successor. Lineage identity, positive consecutive numbering,
parentage, immutable Active revisions, historical preservation, and
issuer-owned authority registration and verification remain unchanged. A
prior Active revision is replaced only after successful successor validation.

## Persistence, Reconstruction, and Replay

Context owns no Memory persistence, Store reconstruction, Memory history,
forgetting, Logical Reconstruction, Exact Replay, or evidence sufficiency.
Get Memory reconstructing Memory-owned return material from Store output is not
Context Logical Reconstruction.

## Bootstrap Composition

Bootstrap is composition-only. It may obtain lifecycle-ready Resolve Current
Identity and Get Memory Contracts, inject them into Context, and invoke
Memory-aware preparation. It must not interpret Memory request or result
semantics, select latest Memory, construct Memory Reference or fragments,
decide applicability or currentness, incorporate candidates, validate Context,
or expose raw Memory downstream.

## Downstream Boundary

Brain consumes one authoritative Active Context Revision. Reasoning receives
exactly intent, Active Context Revision, and query. Planning receives Reasoning
output. Brain and Reasoning may recognize current fixed profile envelopes but
do not interpret Memory semantics.

Get Memory Request, Retrieved Memory, Memory Reference, and Memory Record must
not enter Brain or Reasoning as parallel evidence.

## Dependency, Authority, and Authorization Boundaries

Context depends only on Core-custodied Contracts and Context-local modules,
not concrete Identity, Knowledge, or Memory implementations. Attribution,
retrieval, incorporation, and Active status do not establish source authority
verification. Security retains authorization ownership and protected
boundaries retain enforcement ownership.

## Compatibility and Conformance

Version 4.0.0 is major because the public authoritative Context profile model
expands from two fixed legal profiles to three. Profiles A and B remain
unchanged; Profile C is separate and additive. Consumers must preserve all
three current profiles without interpreting opaque source semantics.

Conformance evidence covers request opacity, Context-owned invocation,
candidate/incorporation separation, minimal projection ownership, failure
identity, partial-success safety, malformed candidates, stable reuse,
prospective forgetting stability, downstream opacity, and dependency
boundaries.

## Change History

| Version | Date       | Description                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Established the original Identity-only Context Engine vertical slice.                           |
| 1.1.0   | 2026-07-29 | Added issuer-owned Active Context Revision authority verification.                              |
| 2.0.0   | 2026-08-11 | Aligned Context-owned Identity retrieval with CONTRACT-0001.                                    |
| 3.0.0   | 2026-08-11 | Added the fixed Identity + Knowledge preparation profile.                                       |
| 4.0.0   | 2026-08-11 | Added the fixed Identity + Memory profile while preserving the Identity and Knowledge profiles. |

## References

- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0016 — Persistence and Reconstruction](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [Memory Engine 1.1.0](../memory/ENGINE-0004-Memory-Engine-Revision-1.1.0.md)
- [Knowledge Engine 1.1.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.1.0.md)
- [Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [Brain Engine 2.0.1](../ENGINE-0001-Brain-Engine.md)
- [Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Planning Engine 2.0.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Context incorporates fixed source profiles without acquiring source ownership.
