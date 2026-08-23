# ENGINE-0005 — Knowledge Engine Revision

| Field             | Value                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Status**        | Superseded                                                                            |
| **Supersedes**    | 1.3.0                                                                                 |
| **Superseded By** | [ENGINE-0005 3.0.0](ENGINE-0005-Knowledge-Engine-Revision-3.0.0.md)                   |
| **Version**       | 2.0.0                                                                                 |
| **Owner**         | Project Maintainers                                                                   |
| **Created**       | 2026-08-20                                                                            |
| **Updated**       | 2026-08-23                                                                            |
| **Applies To**    | Knowledge acceptance, durable lifecycle persistence, reconstruction, and supersession |

---

## Status and Authority

This specification is Superseded by Knowledge Engine 3.0.0. It remains the
historical authority for Knowledge Engine 2.0.0 semantics and supersedes
Knowledge Engine 1.3.0; that revision and earlier revisions remain historical
and non-authoritative.

Applicable ADRs, Concepts, Engineering Standards, and Contracts govern in a
conflict.

The major revision reflects a breaking Store-implementer boundary change and
new restart/concurrency guarantees. Public Knowledge request and projection
semantics remain compatible.

## Purpose

This revision carries forward Knowledge Engine 1.3.0 and adds a durable
Knowledge lifecycle boundary. It defines how accepted immutable Knowledge,
current/superseded standing, and deterministic acceptance order survive process
restart and concurrent supersession without transferring Knowledge semantics to
the Store or persistence adapter.

## Compatibility and Existing Behavior Preservation

The following remain unchanged:

- CandidateClaim opacity and validation;
- KnowledgeIdentity and one-version-per-identity semantics;
- KnowledgeVersion rules;
- acceptance evidence and KnowledgeProvenance;
- accepted structured proposition and PropositionIdentity;
- closed source ownership correspondence;
- Source Currentness ownership;
- Knowledge projection and projection authority;
- Get Knowledge and List Knowledge References public meanings;
- contradiction and linear supersession semantics;
- claim-only compatibility;
- privacy and failure vocabulary;
- Context and Reasoning boundaries.

The change is breaking for Store implementations because durable lifecycle
operations and reconstruction capabilities become required for the 2.0.0
durable boundary.

## Knowledge Ownership

Knowledge Engine remains the sole semantic owner of:

- claim acceptance;
- Knowledge-domain validation;
- identity and version semantics;
- contradiction and supersession meaning;
- current/superseded lifecycle meaning;
- acceptance-order meaning;
- Knowledge references; and
- structured projection issuance and verification.

KnowledgeStore and its adapters provide mechanical persistence guarantees. They
do not decide truth, acceptance, authority, source currentness, structured
semantic validity, or contradiction meaning.

## Durable Lifecycle Model

The durable Knowledge state is:

```text
immutable accepted KnowledgeRecord
+ Knowledge-owned lifecycle metadata
```

Lifecycle metadata contains:

- standing: `current` or `superseded`;
- stable acceptance order; and
- predecessor correspondence where applicable.

Lifecycle metadata is internal. It is not a mutable field of KnowledgeRecord,
not public KnowledgeReference data, and not generic Store metadata.

Each KnowledgeIdentity continues to identify one immutable accepted version.
Independent acceptance begins at version 1. A successor receives a fresh identity
and version equal to its direct predecessor version plus one.

## Core-custodied KnowledgeStore Boundary

The durable Store boundary requires semantic capabilities equivalent to:

- `putIndependentAcceptedKnowledge`;
- `supersedeCurrentKnowledge`;
- `get`; and
- `loadKnowledgeLifecycleSnapshot`.

Exact Core type names remain subject to the subsequent Core Contract design.
These capabilities are internal Store operations, not public Knowledge APIs.

### Independent acceptance

The Engine MUST:

1. validate request shape, claim, evidence, and provenance;
2. allocate and validate KnowledgeIdentity;
3. assign version 1;
4. allocate and validate acceptedAt;
5. construct the immutable accepted KnowledgeRecord;
6. invoke the atomic independent acceptance Store operation;
7. validate the Store result; and
8. update reconstructed Engine indexes only after Store success.

The Store operation MUST atomically establish:

- the immutable accepted KnowledgeRecord;
- current lifecycle standing; and
- acceptance order.

No Engine-visible accepted result may be returned before Store success is
validated.

### Supersession

The Engine MUST:

1. validate the declared contradiction and predecessor;
2. validate the predecessor’s current standing;
3. calculate the successor version exactly;
4. allocate and validate the fresh successor identity and acceptedAt;
5. construct the immutable successor;
6. invoke the atomic supersession Store operation;
7. validate the result; and
8. update Engine indexes only after Store success.

The Store operation MUST atomically establish:

- expected-current predecessor validation;
- accepted successor persistence;
- predecessor linkage;
- predecessor superseded standing;
- successor current standing;
- predecessor historical retention; and
- successor acceptance order.

For one predecessor, exactly one concurrent successor may succeed. A stale
predecessor attempt is the existing Invalid Supersession behavior.

## KnowledgeStore Operations

### `putIndependentAcceptedKnowledge`

Purpose: persist an independently accepted KnowledgeRecord and establish its
initial current standing and acceptance order.

Request semantics:

- one Engine-validated immutable KnowledgeRecord;
- no predecessor;
- version exactly 1.

Result semantics:

- stored with identity and internal acceptance-order confirmation;
- duplicate identity;
- unavailable; or
- invalid Store state.

The Store does not re-evaluate acceptance evidence or claim truth.

### `supersedeCurrentKnowledge`

Purpose: atomically replace one current Knowledge version with one successor.

Request semantics:

- expected predecessor KnowledgeIdentity;
- expected predecessor KnowledgeVersion;
- one Engine-validated immutable successor KnowledgeRecord.

The expected-current standing is an implicit Store precondition, not a
caller-authoritative mutable flag.

Result semantics:

- superseded with predecessor, successor, and acceptance-order confirmation;
- predecessor not found;
- predecessor stale or not current;
- duplicate successor identity;
- unavailable; or
- invalid Store state.

The operation has one semantic atomicity boundary. Physical implementation is
not prescribed.

### `get`

`get` remains unchanged as exact record retrieval by KnowledgeIdentity. The
Engine validates every returned record before exposing it as Knowledge.

### `loadKnowledgeLifecycleSnapshot`

Purpose: provide a coherent internal lifecycle snapshot during explicit Engine
initialization.

Each snapshot entry contains exactly:

- KnowledgeIdentity;
- KnowledgeVersion;
- optional predecessor identity;
- current/superseded standing; and
- acceptance order.

Complete KnowledgeRecord payloads are not duplicated in the snapshot and remain
retrievable through `get`.

The snapshot is not a public projection and MUST NOT expose raw provenance,
acceptance evidence, claims, source correspondence, or projection authority.

## Lifecycle Metadata

`KnowledgeLifecycleStanding` and `KnowledgeAcceptanceOrder` are Knowledge-owned
internal values.

Knowledge Engine owns their semantic meaning. The Store semantic operation
atomically allocates/persists acceptance order and persists standing. An adapter
mechanically implements that guarantee without acquiring Knowledge ownership.

Acceptance order MUST NOT be exposed through KnowledgeReference, Context, or
Reasoning.

## Initialization and Reconstruction

Knowledge Engine initialization MUST perform:

```text
initialize
→ load lifecycle snapshot
→ validate lifecycle graph and order
→ reconstruct confirmed/current/order indexes
→ Ready
```

Before successful reconstruction, the Engine remains unavailable for acceptance,
Get, List, and projection operations. It MUST NOT proceed with incomplete
lifecycle state.

The current lifecycle seam is explicit `KnowledgeEngine.initialize()`; no
asynchronous constructor behavior is introduced.

## Snapshot Validation

Knowledge Engine MUST validate:

- identity uniqueness;
- version validity;
- predecessor existence;
- exact version adjacency;
- no self-predecessor;
- no cycles;
- no branches;
- one current terminal record per linear lineage;
- current/superseded standing consistency;
- acceptance-order uniqueness and completeness; and
- Store result shape and immutability requirements.

Corrupted or incoherent durable lifecycle state is `Invalid Knowledge State`.
The Store remains responsible for returning a structurally conforming result.

## Deterministic Listing

`ListKnowledgeReferences` remains a public Knowledge Engine operation. It returns:

- current references only;
- deterministic acceptance-order ordering;
- bounded results; and
- privacy-minimal references.

Acceptance order must survive restart. It remains Knowledge-internal and is not
part of the public reference shape.

## Concurrency and Failure Semantics

The durable boundary MUST guarantee:

- one winner for concurrent supersession of one predecessor;
- no branch creation;
- no partial lifecycle transition;
- no overwrite on duplicate identity;
- independent accepted records receive unique identities and ordering;
- known pre-commit Store unavailability leaves lifecycle state unchanged; and
- restart after success reconstructs the committed lifecycle state.

When the Engine can determine that a Store operation failed before the durable
lifecycle transition completed, that attempted transition did not commit, no
successor or accepted state from that attempt exists, and the originating Store
failure remains a failure. The lifecycle state is unchanged by that attempt.

When failure, interruption, transport loss, process interruption, or equivalent
uncertainty occurs after durable completion may have occurred, the outcome is
ambiguous. The caller and Engine MUST NOT assume rollback or success. The
transition remains semantically atomic: it is either committed in full or not
committed; ambiguous completion does not permit a partial durable state. The
authoritative outcome MUST be determined by lifecycle reconstruction or another
governed Store read before deciding whether a retry is necessary or valid.

Existing public failures remain sufficient:

- Duplicate Knowledge Identity;
- Knowledge Not Found;
- Invalid Supersession;
- Knowledge Store Unavailable; and
- Invalid Knowledge State.

Internal Store results MAY distinguish stale/not-current conflict, predecessor
absence, duplicate identity, unavailable, and invalid state. The Engine
normalizes them without introducing a new public failure class.

Request-level idempotency tokens and request identifiers remain deferred.
Fresh KnowledgeIdentity values provide duplicate protection for known repeated
independent acceptance attempts. After ambiguous completion, the Engine MUST
reconstruct or read authoritative lifecycle state, determine whether the
requested transition committed, and determine the current predecessor/successor
state before deciding whether a retry is necessary or semantically valid. It
MUST NOT retry as though the previous attempt definitely failed.

## Immutability

KnowledgeRecord, CandidateClaim, provenance, evidence, structured propositions,
and historical records remain immutable.

Lifecycle metadata may change only through the governed atomic Store operation.
Such change does not mutate the historical KnowledgeRecord.

## Authority and Privacy

The Engine decides acceptance, identity, version, lifecycle meaning, and public
reference projection. The Store mechanically enforces uniqueness, expected
currentness, atomic persistence, and snapshot delivery.

The Store MUST NOT decide:

- claim truth;
- evidence sufficiency;
- source authority;
- Source Currentness;
- structured proposition validity; or
- contradiction meaning.

Lifecycle standing and acceptance order are INTERNAL. CandidateClaim, provenance,
and acceptance evidence remain PROTECTED. Source correspondences remain opaque.
Credentials, tokens, secrets, Context state, Reasoning state, and projection
authority are prohibited from Store lifecycle results.

## Structured Knowledge and Projection Authority

Structured Knowledge semantics remain unchanged from 1.3.0. PropositionIdentity,
the exact tuple, source ownership correspondence, Source Currentness, and
projection eligibility remain Knowledge-owned as previously governed.

Projection authority remains process-local. Durable reconstruction MUST NOT
persist or recreate prior projection authority captures. A later projection
obtains fresh runtime authority through the existing Knowledge mechanism.

## Context and Reasoning Boundaries

This revision changes neither Context nor Reasoning.

It does not modify:

- KnowledgeProjection;
- CandidatePreparationAssociation;
- CONTRACT-0001;
- Context authority or incorporation;
- Reasoning 3 structured tuple consumption; or
- Reasoning Store dependencies.

## Legacy Store Compatibility

Mechanical `put(record)` MUST NOT remain the durable Knowledge acceptance
boundary. It MAY remain temporarily for legacy internal fixtures and
compatibility tests, but the durable Engine path MUST use the semantic
independent-acceptance operation.

`get` remains valid and unchanged.

The public Knowledge API remains compatible. Store implementers require a
breaking migration to provide the durable operations and lifecycle snapshot.

## Deferred Scope

This revision does not define:

- physical database technology;
- physical transaction, lock, or isolation mechanisms;
- physical identifiers, sequences, indexes, or topology;
- request-level idempotency tokens;
- application audit/history;
- Context, Reasoning, Planning, Brain, Memory, Security, or session persistence;
- projection authority persistence; or
- CONTRACT-0002.

## Future Evolution

Future work may define idempotent retry semantics, richer lifecycle states, or
application history only through separate governed decisions. Such work MUST
preserve Knowledge Engine semantic ownership, immutable historical records,
privacy boundaries, and physical neutrality.

## References

- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](../../../docs/adr/ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [Knowledge Engine 1.3.0](ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change History

| Version | Date       | Description                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2026-08-20 | Draft successor defining durable Knowledge lifecycle persistence, reconstruction, and atomic supersession. |
| 2.0.0   | 2026-08-20 | Clarified known pre-commit Store failure versus ambiguous completion and retry reconstruction.             |
| 2.0.0   | 2026-08-20 | Activated as the sole current canonical ENGINE-0005 revision and superseded 1.3.0.                         |
| 2.0.0   | 2026-08-23 | Superseded by Knowledge Engine 3.0.0.                                                                      |

# Engineering Motto

> Durable persistence preserves Knowledge semantics; it does not own them.
