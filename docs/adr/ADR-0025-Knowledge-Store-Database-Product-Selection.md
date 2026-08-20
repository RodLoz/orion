# ADR-0025 — Knowledge Store Database Product Selection

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

Active ADR-0024 selects a transactional relational database family for the
first durable Knowledge Store, while deferring the concrete product. Active
Knowledge Engine 2.0.0 and its approved Core/runtime boundary require durable
atomic acceptance, expected-current supersession, one-winner concurrency,
immutable history, and deterministic reconstruction.

The repository currently provides no database product, provider, migration
system, ORM, or physical adapter. It does provide a Node.js 24 and TypeScript
monorepo with pnpm, Vitest, direct package builds, and an in-memory semantic
reference Store. This ADR selects the concrete database product required before
physical schema design, without changing the Knowledge semantic boundary.

# Decision Drivers

The product must support:

- durable multi-state atomic transactions;
- expected-current conditional mutation and one-winner supersession;
- uniqueness and immutable historical retention;
- exact retrieval and deterministic ordered reconstruction;
- crash recovery and backup/restore capability;
- supported migration/version evolution;
- secure external configuration;
- mature Node.js/TypeScript access; and
- deterministic integration testing without Core or Engine coupling.

The product must not force a provider, ORM, universal Store abstraction, or
physical meaning onto opaque `KnowledgeAcceptanceOrder`.

# Candidate Set

The smallest credible candidate set is:

- PostgreSQL;
- MySQL/MariaDB family;
- SQL Server; and
- SQLite.

No broader market survey is warranted by current repository evidence.

# Candidate Assessments

## PostgreSQL — selected

PostgreSQL provides transactional multi-state writes, conditional updates,
unique constraints, mature crash recovery and backup facilities, and a strong
Node.js ecosystem. Its transaction model supports atomic visibility of the
predecessor transition and successor insertion, while its uniqueness and
conditional-write capabilities support one-winner supersession.

The low-level `pg` driver provides pooling and explicit transaction control
without imposing an ORM. PostgreSQL is portable across self-hosted and managed
deployments. Product-native ordering mechanisms may be used privately by the
adapter, but no such mechanism becomes Knowledge semantic state.

## MySQL/MariaDB family — rejected

InnoDB provides ACID transactions, conditional updates, uniqueness, row-level
concurrency, crash recovery, and backup facilities. It is technically capable
of implementing the Store boundary.

It is not selected because the repository has no MySQL/MariaDB deployment or
tooling evidence, and PostgreSQL provides a cleaner default fit for the
repository's direct-driver, portability, and testing requirements without a
semantic advantage requiring a second relational family.

## SQL Server — rejected

SQL Server provides complete transactional atomicity, locking/row-versioning
concurrency, uniqueness, recovery, and mature operational tooling. It is
technically capable of implementing the Store boundary.

It is not selected because the repository has no Microsoft platform,
SQL Server, or managed-service convention. Its operational and ecosystem fit
would add unnecessary deployment decisions for the current Node-first
repository.

## SQLite — development/test only

SQLite provides durable transactions, crash recovery, and deterministic local
testing. It supports multiple readers but only one simultaneous writer, and its
WAL concurrency model requires participating processes to share one host.

SQLite is therefore permitted as a conformant development or test adapter, but
is not selected for the first shared production Store boundary, which must
remain compatible with multiple O.R.I.O.N. runtime instances.

# Decision Matrix

Scores use a ten-point scale and the governing weights from the product
selection task.

| Criterion             |   Weight | PostgreSQL | MySQL/MariaDB | SQL Server |  SQLite |
| --------------------- | -------: | ---------: | ------------: | ---------: | ------: |
| Semantic fit          |      30% |          9 |             8 |          8 |       6 |
| Concurrency/atomicity |      20% |          9 |             9 |          9 |       5 |
| Node ecosystem        |      10% |          9 |             8 |          6 |       9 |
| Operational maturity  |      10% |          9 |             9 |          9 |       6 |
| Migration/tooling     |      10% |          9 |             8 |          8 |       6 |
| Development/testing   |      10% |          9 |             8 |          6 |      10 |
| Portability           |       5% |          9 |             8 |          6 |       8 |
| Future expansion      |       5% |          9 |             8 |          8 |       4 |
| **Weighted total**    | **100%** |    **9.0** |       **8.3** |    **7.6** | **6.2** |

The matrix is comparative architecture evidence, not a benchmark or a schema
decision.

# Product Decision

```text
CONCRETE_DATABASE_PRODUCT:
POSTGRESQL

DATABASE_PRODUCT_DECISION_CONFIDENCE:
HIGH
```

PostgreSQL is the first physical Store product. The selection is based on
semantic fit, transactional concurrency, operational maturity, Node.js
interoperability, portability, and the absence of repository evidence favoring
another product.

# Version Policy

```text
DATABASE_VERSION_POLICY:
SUPPORTED_POSTGRESQL_MAJOR; MINIMUM_MAJOR_16; PATCH_LEVEL_DEFERRED
```

The adapter must target a currently supported PostgreSQL major version no older
than major 16 at implementation time. Patch selection, upgrade cadence, and
support-window operations remain deployment decisions.

# Provider and Topology

```text
DATABASE_PROVIDER:
DEFERRED

DATABASE_HOSTING_DECISION:
DEFERRED
```

ADR-0024's topology remains one logical Knowledge Store in a
deployment-provided transactional database instance. A managed provider,
self-hosting arrangement, region, replication topology, and operational
service tier are not selected by this ADR.

# Database Access Style and Driver

```text
DATABASE_ACCESS_STYLE:
DIRECT_DRIVER

DATABASE_DRIVER:
PG
```

The future adapter may use the low-level `pg` Node.js driver and its pooling
support. No ORM or query-builder contract is introduced. Driver version and
pool configuration remain implementation and deployment decisions.

# Physical Capability Mapping

The selected product must be used to implement, without semantic expansion:

- one atomic write boundary for independent acceptance;
- one atomic expected-current supersession boundary;
- uniqueness protection for identities and private ordering;
- immutable accepted-record retention;
- exact historical retrieval;
- deterministic ordered lifecycle reconstruction; and
- transaction failure handling that preserves ambiguous-completion semantics.

The adapter must use product capabilities mechanically. Knowledge Engine
remains the owner of lifecycle meaning, version adjacency, graph validation,
Source Currentness, projections, and public failure mapping.

# Canonical Ordering

The adapter must maintain a private durable total order for lifecycle entries.
It may use a PostgreSQL-native monotonic allocation mechanism mechanically, but
that mechanism must remain private, durable, unique, sortable, and atomically
assigned. It must never be exposed as `KnowledgeAcceptanceOrder`, a count,
timestamp, UUID, sequence meaning, or public ordering field.

The opaque Core token remains exact correspondence metadata. Knowledge Core and
Engine do not compare it; snapshot order supplied by the adapter remains the
canonical reconstruction order.

# Supersession and Failure Semantics

The adapter must implement the supersession transition as one PostgreSQL
transactional operation with an expected-current condition. Concurrent
successors against one predecessor produce exactly one winner; the losing
operation produces stale/not-current semantics and no durable branch.

Known pre-commit failure, committed success, and ambiguous completion remain
distinct. A lost connection or interrupted response after possible commit must
not be interpreted as rollback. The adapter/runtime must reconstruct or read
authoritative lifecycle state before deciding whether retry is valid.

# Migration Tooling

```text
MIGRATION_TOOLING_DECISION:
DEFERRED_TO_PHYSICAL_SCHEMA_DESIGN
```

Product selection does not select a migration framework. The subsequent schema
design must choose a versioned, reviewable migration mechanism compatible with
PostgreSQL and repository CI.

# Integration-Test Strategy

```text
DATABASE_INTEGRATION_TEST_STRATEGY:
EPHEMERAL_POSTGRESQL_INSTANCE_IN_CI_AND_LOCAL_DEVELOPMENT
```

The physical adapter must reuse the adapter-independent KnowledgeLifecycleStore
conformance suite. Additional tests must cover transaction atomicity, concurrent
supersession, restart/recovery, corruption detection, duplicate handling,
deterministic ordering, unavailable Store behavior, and ambiguous completion
where it can be simulated.

The exact CI service/container mechanism is deferred because the repository has
no existing database service convention.

# Security

The adapter must support deployment-provided TLS, least-privileged credentials,
external secret storage, protected backups, and avoidance of sensitive payloads
or credentials in logs. No credentials or provider configuration belong in
Knowledge records, Core, specifications, or source control.

# Rejected Alternatives

- MySQL/MariaDB: capable, but no repository evidence favors it over PostgreSQL.
- SQL Server: capable, but no platform or operational convention supports its
  additional ecosystem assumptions.
- SQLite: retained for local/test use, but its single-writer and same-host
  constraints do not establish the first shared production boundary.
- ORM or query-builder selection: deferred and intentionally outside the Store
  semantic contract.
- Provider selection: deferred until deployment requirements exist.

# Consequences

Positive consequences:

- a concrete product now exists for physical schema design;
- the approved relational architecture remains intact;
- atomic lifecycle semantics map cleanly to one transactional database;
- Node.js access can remain direct and low-level; and
- Core/Engine semantics remain product-independent.

Costs and deferred decisions:

- PostgreSQL deployment/provider is not selected;
- physical schema, identifiers, constraints, indexes, and migrations remain
  future work;
- CI must provide an ephemeral PostgreSQL integration environment; and
- product upgrades and backup operations require deployment governance.

# Scope Boundary

This ADR governs only concrete product selection for KnowledgeStore. It does
not authorize schema creation, migrations, adapter implementation, runtime
changes, or persistence for Context, Reasoning, Planning, Brain, Memory,
Security, conversations, or other application state.

# Dependencies

- [ADR-0024 — Durable Knowledge Physical Store Architecture](ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md)
- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [Knowledge Engine 2.0.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)
- [OES-0007 — Adapter Design](../engineering/OES-0007-Adapter-Design.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Review this ADR before or during physical schema design if deployment evidence
requires a different product, if multiple database instances become required,
or if Knowledge lifecycle semantics change.

# Change History

| Version | Date       | Description                                                                 |
| ------- | ---------- | --------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-20 | Drafted PostgreSQL product selection for the first durable Knowledge Store. |
| 1.0.0   | 2026-08-20 | Approved architectural decision.                                            |

# Engineering Motto

> Select the physical product without allowing it to redefine Knowledge.
