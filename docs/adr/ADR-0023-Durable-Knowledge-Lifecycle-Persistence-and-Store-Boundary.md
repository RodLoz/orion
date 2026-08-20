# ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary

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

Knowledge Engine 1.3.0 defines immutable accepted Knowledge records, linear
supersession, current/superseded references, and deterministic current-reference
listing. The current `KnowledgeStore` exposes only mechanical `put` and `get`
operations. The Engine consequently keeps confirmed identities, current
identities, versions, and acceptance order in process-local state.

That state disappears on restart. Coordinating multiple `put` and `get` calls
also leaves a race in which two writers may both supersede one predecessor or a
partial lifecycle transition may become visible.

ADR-0016 establishes that persistence preserves capability-owned semantics and
does not acquire ownership. It leaves capability-specific persistence mechanisms
to later governance. This decision specializes that boundary for Knowledge.

# Problem Statement

The current Store boundary cannot guarantee all of the following together:

- restart-safe reconstruction of accepted Knowledge lifecycle state;
- deterministic current-reference listing after restart;
- one-winner concurrent supersession;
- atomic independent acceptance with current standing and acceptance order;
- immutable historical predecessor retention; and
- preservation of Knowledge Engine acceptance authority.

The missing boundary must remain technology-neutral. It must not expose a
physical transaction, lock, sequence, index, database product, or ORM concept.

# Decision

Adopt a Knowledge-specific semantic Store boundary between Knowledge Engine
semantics and persistence adapters.

```text
Knowledge Engine
  acceptance, identity/version, lifecycle meaning, projection authority
        |
        v
KnowledgeStore semantic boundary
  independent acceptance, supersession, retrieval, reconstruction
        |
        v
Persistence adapter
  implementation-specific durability and atomicity mechanism
```

Knowledge Engine remains the semantic owner of:

- candidate acceptance and validation;
- Knowledge identity and version semantics;
- contradiction and supersession meaning;
- current/superseded lifecycle meaning;
- acceptance-order semantics; and
- projection authority.

The KnowledgeStore boundary mechanically guarantees:

- atomic independent accepted persistence;
- atomic expected-current supersession;
- exact record retrieval;
- coherent lifecycle reconstruction; and
- atomic allocation and preservation of acceptance order.

The Store MUST NOT decide truth, acceptance evidence sufficiency, source
authority, structured Knowledge validity, or contradiction meaning.

## Independent acceptance

One semantic Store operation MUST establish atomically:

```text
immutable accepted KnowledgeRecord
+ current lifecycle standing
+ stable acceptance order
```

No accepted result may become externally visible before Store success is
validated by Knowledge Engine.

## Supersession

One semantic Store operation MUST establish atomically:

```text
expected-current predecessor
+ Engine-accepted successor
→ predecessor superseded
→ successor current
→ predecessor retained historically
→ successor linked to predecessor
→ stable acceptance order
```

For one predecessor, exactly one concurrent successor may succeed. A stale
attempt fails without creating a second accepted successor.

## Lifecycle metadata

`KnowledgeLifecycleStanding` and `KnowledgeAcceptanceOrder` are Knowledge-owned
internal durable semantics. They remain separate from immutable KnowledgeRecord
content. They are not public mutable fields, generic database metadata, Context
state, Reasoning state, or projection authority.

## Acceptance order

Knowledge Engine owns the meaning of acceptance order. The KnowledgeStore semantic
operation atomically allocates and persists the value. The physical mechanism is
deferred. Acceptance order is Knowledge-internal and MUST NOT appear in public
Knowledge references or projections.

## Reconstruction

Knowledge Engine initialization MUST perform:

```text
initialize
→ load coherent lifecycle snapshot
→ validate lifecycle graph and order
→ reconstruct confirmed/current/order runtime indexes
→ enter Ready
```

Before successful reconstruction, initialization is blocked. No operation may
proceed using incomplete lifecycle state.

Snapshot entries contain only the operands required for reconstruction:

- KnowledgeIdentity;
- KnowledgeVersion;
- optional predecessor identity;
- current/superseded standing; and
- acceptance order.

Complete KnowledgeRecord payloads remain retrievable through `get`.

# Alternatives Considered

## Continue process-local lifecycle authority

This preserves the current implementation but fails restart reconstruction and
cannot provide durable concurrency guarantees. Rejected.

## Engine coordination of multiple put/get operations

This preserves the existing interface but permits races and partial lifecycle
transitions. Rejected.

## Generic repository transaction abstraction

This would expose persistence mechanics and make Engine code coordinate storage
details. Rejected in favor of semantic Knowledge operations.

## Generic mutable lifecycle metadata API

This would permit arbitrary lifecycle mutation and blur Knowledge ownership.
Rejected.

## Derive currentness only from successor existence

Successor existence does not fit the current exact `get` boundary, does not by
itself reconstruct deterministic acceptance order, and makes coherent restart
validation less explicit. Rejected as the complete strategy.

## Current-only listing as sufficient reconstruction

Current-only data cannot reconstruct confirmed historical identities or validate
the complete predecessor graph. Rejected.

## Knowledge-specific atomic Store operations

Selected. This expresses the minimum semantic boundary, preserves ownership,
supports one-winner concurrency, and remains implementable by in-memory and
future durable adapters without prescribing physical technology.

# Consequences

Positive consequences:

- accepted lifecycle state survives restart;
- historical Knowledge remains immutable and retrievable;
- concurrent supersession has deterministic one-winner behavior;
- deterministic current-reference listing is preserved;
- Store adapters share one semantic contract;
- public Knowledge APIs remain compatible.

Costs and risks:

- Knowledge Engine 2.0.0 is required;
- Core Store types and interface evolve;
- existing durable Store implementers require migration;
- ambiguous caller-level interruption retry remains deferred;
- physical adapter design remains future work.

Persistence does not transfer Knowledge acceptance authority to the Store and
does not persist projection authority captures, preparation state, Reasoning
state, or application history.

# Physical Neutrality

This ADR mandates semantic atomicity only. It does not choose or name:

- a database product or SQL dialect;
- transaction syntax or isolation level;
- locks, sequences, indexes, or partitions;
- an ORM;
- replication, topology, or deployment;
- physical identifier or timestamp representation.

# Boundary Preservation

This decision leaves unchanged:

- Context and Context Source Retrieval;
- CONTRACT-0001;
- Reasoning, Planning, Brain, Memory, and Security;
- structured Knowledge tuple and projection semantics;
- Source Currentness and external source ownership;
- CandidatePreparationAssociation;
- process-local projection authority;
- the absence of CONTRACT-0002.

No new cross-engine Contract is introduced.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [Knowledge Engine 1.3.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Knowledge Engine 2.0.0 Draft](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Review when the KnowledgeStore Core evolution and in-memory conformance slice
are complete, before Knowledge Engine 2.0.0 activation and before physical
Engine Store design.

# Change History

| Version | Date       | Description                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-20 | Initial Draft defining durable Knowledge lifecycle persistence and Store boundary. |
| 1.0.0   | 2026-08-20 | Approved architectural decision.                                                   |

# Engineering Motto

> Semantic ownership remains with Knowledge; persistence preserves it.
