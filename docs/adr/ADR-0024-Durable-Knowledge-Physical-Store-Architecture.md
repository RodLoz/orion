# ADR-0024 — Durable Knowledge Physical Store Architecture

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Project Maintainers   |
| **Created**       | 2026-08-20            |
| **Updated**       | 2026-08-20            |
| **Decision Type** | Architecture Decision |

---

# Context

ADR-0023 and Active Knowledge Engine 2.0.0 establish durable Knowledge
lifecycle semantics. The approved Core boundary and the conformant in-memory
Store define the semantic operations that a first physical Store must support,
but the repository has no selected database product, physical adapter,
migration system, or deployment topology.

The physical architecture must preserve Knowledge ownership while providing
durable atomicity, conditional supersession, immutable history, and deterministic
restart reconstruction. It must not turn physical persistence into a second
Knowledge authority.

# Problem Statement

A physical Store is needed for the KnowledgeLifecycleStore boundary. Selecting a
product or schema without first fixing the physical capability boundary could
introduce numeric or lexical meaning for the opaque KnowledgeAcceptanceOrder,
permit concurrent branches, or duplicate lifecycle authority in a materialized
snapshot.

The decision must therefore select the minimum technology family and physical
architecture, while leaving vendor, concrete schema, physical types, migrations,
and deployment details to later authorized design work.

# Decision

O.R.I.O.N. selects a **transactional relational database family** as the physical
architecture for the first durable Knowledge Store. A specific vendor or product
is intentionally not selected by this ADR because repository deployment and
operational evidence is absent. Product selection is a subsequent decision under
this family constraint.

The physical model family is:

```text
immutable accepted Knowledge record
+ separate Knowledge-owned lifecycle metadata
```

The immutable record representation is never updated by lifecycle transitions.
Lifecycle standing and predecessor correspondence are changed only through the
Knowledge-specific atomic Store operations.

The physical adapter MUST implement the approved `KnowledgeLifecycleStore`
boundary and MUST provide:

- atomic independent acceptance;
- atomic expected-current supersession;
- uniqueness protection for exact identities and acceptance order;
- immutable historical retrieval;
- deterministic ordered lifecycle reconstruction; and
- restart-safe persistence.

The adapter may use database-native transaction, conditional-write, uniqueness,
and ordering mechanisms. Their physical form is deferred and MUST NOT leak into
Core or public Knowledge semantics.

# Technology Comparison

## Transactional relational database family — selected

This family directly supports the required multi-state atomic transitions,
conditional current-state enforcement, uniqueness, integrity checks, ordered
reads, mature backup/recovery practices, migration tooling, and TypeScript/Node
adapter interoperability. It also preserves a clear separation between
immutable record state and lifecycle metadata.

The family is portable across products. No product-specific feature is required
by this ADR.

## Transactional document database family — not selected

Conditional atomic updates and durable documents could implement the semantic
boundary. However, the required separation between immutable records and mutable
lifecycle metadata, ordered reconstruction, integrity validation, and future
schema evolution would rely more heavily on product-specific document features.
The repository has no deployment evidence favoring this family.

## Embedded transactional key/value family — not selected as the first physical architecture

An embedded transactional Store could provide local atomicity and simple testing.
It does not establish a suitable initial deployment boundary for possible
multiple O.R.I.O.N. runtime instances and would make shared durability and
operational recovery a later architectural replacement concern.

An embedded implementation remains acceptable as a test or development adapter
only when it conforms to the same semantic Store contract.

# Technology Decision

```text
PHYSICAL_STORE_TECHNOLOGY:
TRANSACTIONAL_RELATIONAL_DATABASE_FAMILY; PRODUCT_DEFERRED

TECHNOLOGY_DECISION_CONFIDENCE:
MEDIUM
```

The confidence is medium because the semantic fit is strong but deployment,
operations, and infrastructure requirements needed for product selection are not
yet governed.

# Physical Model Decision

```text
PHYSICAL_MODEL_FAMILY:
IMMUTABLE_RECORD_PLUS_LIFECYCLE_METADATA
```

The model is preferred over a single mutable canonical record because lifecycle
changes must not mutate accepted Knowledge history. An event or transition log is
deferred because replay/event authority semantics are not governed by Knowledge
2.0 and would enlarge the corruption and reconstruction surface.

# Acceptance-Order Architecture

```text
PRIVATE_CANONICAL_ORDER_REQUIRED: YES
PRIVATE_CANONICAL_ORDER_VISIBILITY: NONE
```

The physical adapter MUST maintain an adapter-private durable total order for
accepted lifecycle entries. This private ordering mechanism is separate from the
opaque Core `KnowledgeAcceptanceOrder` value.

The private order MUST be:

- unique;
- durable and restart-safe;
- assigned atomically with acceptance;
- stable for the lifetime of the accepted entry; and
- used to produce the canonical ordered lifecycle snapshot.

A database-native monotonic ordering primitive MAY be used mechanically. It MUST
NOT be exposed as a Knowledge count, version, timestamp, UUID, sequence meaning,
or public ordering field. The Core token remains exact opaque correspondence
metadata, and neither Engine nor public APIs compare it.

# Independent Acceptance Transaction

One physical atomic boundary MUST establish all of the following together:

- immutable accepted KnowledgeRecord;
- current lifecycle standing;
- exact opaque KnowledgeAcceptanceOrder;
- adapter-private canonical order.

Other Store clients must observe either the complete pre-acceptance state or the
complete post-acceptance state. No accepted result may be returned before the
boundary succeeds.

# Supersession Transaction

For `A → B`, one physical atomic boundary MUST establish:

- expected-current validation of A;
- expected-version validation;
- A standing changed to superseded;
- immutable B insertion;
- B predecessor linkage to A;
- B standing changed to current;
- B opaque acceptance order;
- B private canonical order; and
- retention of A for historical retrieval.

No partial predecessor transition, successor insertion, or branch may become
visible.

# Concurrency Architecture

```text
ONE_WINNER_SUPERSESSION: GUARANTEED
```

The adapter MUST use a technology-appropriate conditional or compare-and-set
mechanism within the atomic supersession boundary. The condition is the expected
predecessor identity, expected version, and current standing.

Two concurrent transitions `A → B` and `A → C` therefore produce exactly one
successful transition. The loser receives stale/not-current semantics and does
not leave a durable branch.

This ADR does not prescribe locks, isolation syntax, or transaction statements.

# Snapshot Architecture

```text
LIFECYCLE_SNAPSHOT_ARCHITECTURE: DERIVED
```

`KnowledgeLifecycleSnapshot` is derived from canonical immutable records and
lifecycle metadata in private canonical order. It is not an independent
authoritative persisted object. This avoids divergence between a snapshot and
the state from which it is derived.

The adapter returns the minimized lifecycle operands required by the Core
contract. Knowledge Engine validates graph meaning, adjacency, cycles, branches,
standing, and record coherence.

# Ambiguous-Completion Architecture

```text
AMBIGUOUS_COMPLETION_RECOVERY: AUTHORITATIVE_RECONSTRUCTION
```

The adapter and runtime preserve three operational outcomes:

- `KNOWN_PRE_COMMIT_FAILURE`: the operation is known not to have committed;
- `COMMITTED_SUCCESS`: the complete semantic transition committed; and
- `AMBIGUOUS_COMPLETION`: completion may have occurred but the caller cannot
  establish the result.

Ambiguous completion MUST NOT be reported as rollback or success. The Engine must
read or reconstruct authoritative lifecycle state before deciding whether a retry
is necessary or valid. No idempotency token, request identifier, or Core failure
expansion is introduced by this ADR.

# Adapter Boundary

## Knowledge Engine owns

- acceptance and contradiction meaning;
- identity and version assignment;
- version adjacency;
- lifecycle graph validation;
- snapshot semantic validation;
- Source Currentness;
- projections and projection authority; and
- public failure mapping.

## Durable adapter owns

- Core request/result translation;
- physical atomicity;
- uniqueness enforcement;
- expected-current enforcement;
- immutable persistence;
- private canonical ordering; and
- ordered snapshot reconstruction.

## Database owns

- durable bytes;
- transaction and concurrency primitives;
- uniqueness/integrity primitives;
- ordered physical retrieval; and
- crash recovery supplied by the selected product.

None of these boundaries transfer Knowledge semantic ownership to persistence.

# Deployment and Topology

```text
PHYSICAL_STORE_TOPOLOGY:
ONE LOGICAL KNOWLEDGE STORE IN A DEPLOYMENT-PROVIDED TRANSACTIONAL DATABASE INSTANCE
```

The first physical adapter targets one logical Store boundary. This does not
mandate a single process, forbid future horizontal scaling, or select a hosting
provider. Embedded/local implementations may serve development and tests only
when they preserve the same Store semantics.

# Configuration and Secrets

Connection endpoint, database identity, credentials, TLS configuration, and
pooling belong to deployment/infrastructure configuration. They MUST remain
outside Knowledge records, Core types, specifications, and source control.

The adapter MUST avoid logging credentials, connection details, raw protected
Knowledge payloads, provenance, or acceptance evidence.

# Migration Strategy

The initial durable Knowledge Store starts empty.

```text
INITIAL_DATA_MIGRATION_REQUIRED: NO
```

Future physical schema evolution requires versioned migration governance and
review. This ADR authorizes no migration files or migration implementation.

# Backup and Recovery

The selected physical family and eventual product must provide durable backup
and recovery capability sufficient to restore a lifecycle-consistent canonical
Store. Recovery MUST preserve immutable records, lifecycle metadata, predecessor
chains, and canonical order.

Recovery MUST NOT reconstruct projection authority, Context state, Reasoning
state, preparation associations, or other excluded runtime state.

# Security and Privacy

Knowledge payloads, provenance, evidence, and lifecycle metadata remain protected
Store data. Public Knowledge references and projections expose none of the
private canonical order or lifecycle snapshot operands.

Credentials, authorization tokens, Context authority, Reasoning state, and
projection authority are outside this Store and MUST NOT be persisted here.

# Future Extensibility

This ADR is limited to KnowledgeStore. It does not introduce a universal database
schema or generic persistence abstraction for other Engines. Other Engine Stores
may later reuse physical capabilities, but each remains governed by its own
semantic boundary and architectural decision.

# Consequences

Positive consequences:

- Knowledge history remains immutable and retrievable;
- atomic lifecycle transitions have a clear physical capability boundary;
- concurrent supersession has one-winner semantics;
- deterministic reconstruction survives restart;
- physical ordering cannot redefine opaque Core semantics; and
- product choice remains portable within the selected family.

Costs and deferred decisions:

- a specific database product is still required before physical schema design;
- deployment, backup, monitoring, and secret-management choices remain open;
- physical migration design remains future work; and
- the adapter must translate ambiguous operational outcomes without Core changes.

# Risks

- A product may be selected without sufficient deployment evidence.
- Adapter-private ordering may accidentally leak into public semantics.
- A materialized snapshot may be introduced as duplicate authority.
- Database integrity rules may be mistaken for Knowledge semantic ownership.
- Recovery procedures may restore records without preserving lifecycle metadata.

These risks require independent review and physical-adapter conformance tests.

# Dependencies

- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [Knowledge Engine 2.0.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)
- [OES-0007 — Adapter Design](../engineering/OES-0007-Adapter-Design.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Implementation Notes

This ADR authorizes no SQL, schema, migration, dependency, adapter, or product
installation. Those require a subsequent product-selection and physical-model
design decision.

The physical adapter must first pass the existing KnowledgeLifecycleStore
semantic conformance suite, then add technology-specific atomicity, recovery,
corruption, and operational failure tests.

# Future Review

Review before physical schema design and again after product selection. Reopen if
deployment requires distributed Store instances, if another Engine becomes part
of the same physical boundary, or if Knowledge lifecycle semantics change.

# Change History

| Version | Date       | Description                                                                                                                                                                           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-20 | Drafted the transactional relational physical architecture, immutable-record model, private canonical ordering, atomic lifecycle boundaries, and authoritative reconstruction policy. |
| 1.0.0   | 2026-08-20 | Approved architectural decision.                                                                                                                                                      |

# Engineering Motto

> Physical persistence must preserve Knowledge semantics without becoming their owner.
