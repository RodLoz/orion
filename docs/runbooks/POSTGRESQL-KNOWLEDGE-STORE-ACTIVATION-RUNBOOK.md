# PostgreSQL Knowledge Store Production Activation Runbook

**Status:** Active  
**Version:** 1.0  
**Updated:** 2026-08-24  
**Owner:** Deployment and application owners  
**Scope:** Production-like PostgreSQL activation of the approved Knowledge Store

## Purpose and scope

This runbook is an operator procedure for activating an already approved
PostgreSQL-backed Knowledge Store implementation. It does not define Knowledge
semantics, change architecture, provision a provider, or perform migrations by
itself. It is executed only after the release, database, security, backup, and
approval gates below are satisfied.

Audience: deployment operator, platform/database operator, application owner,
and independent reviewer/approver.

The current repository state remains:

```text
POSTGRESQL_PRODUCTION_ACTIVE: NO
KSTORE_DEPLOY_PLAN_F02: OPEN
```

## Fixed release and migration artifacts

The operator must verify the exact accepted release before any migration or
deployment action:

```text
Release commit: 05061e723befb43a3e38fb0fa9fa9a88d08d0885
Migration: tools/knowledge-store-migrations/migrations/0001_initial_knowledge_store.sql
Migration SHA-256: 539A3CEEDCDD4F9E43BD126267DBDBD0907C4D8FF5D521C4BAAA5D7628011DE5
```

Only the canonical migration artifact and approved migration runner may be
used. Do not copy SQL into deployment scripts or execute ad-hoc DDL.

## Environment evidence

Complete these fields without recording credentials or a full connection
string:

| Field                        | Evidence |
| ---------------------------- | -------- |
| Environment                  |          |
| Deployment timestamp         |          |
| Release commit               |          |
| PostgreSQL server version    |          |
| Database identifier          |          |
| Migration identity reference |          |
| Runtime identity reference   |          |
| Secret reference ID/name     |          |
| Change/ticket identifier     |          |
| Operator                     |          |
| Reviewer                     |          |

## Go/no-go gate

Use only `PASS`, `FAIL`, or `NOT APPLICABLE`. Any required `FAIL` is an
automatic **NO-GO**; there is no subjective override in this procedure. A gate
with `N/A Allowed: NO` must never be recorded as `NOT APPLICABLE`; doing so is
itself a `FAIL` and therefore a NO-GO. A gate with `N/A Allowed: YES` may use
`NOT APPLICABLE` only when its stated condition and compensating evidence are
recorded.

| Gate                                                    | Requirement                                              | N/A Allowed                                                                    | Result | Evidence/reference |
| ------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ | ------------------ |
| Release commit matches                                  | Mandatory                                                | NO                                                                             |        |                    |
| PostgreSQL major version is at least 16                 | Mandatory                                                | NO                                                                             |        |                    |
| DNS and network connectivity                            | Mandatory                                                | NO                                                                             |        |                    |
| TLS and certificate validation                          | Mandatory when TLS is required                           | NO                                                                             |        |                    |
| Runtime secret installed                                | Mandatory                                                | NO                                                                             |        |                    |
| Migration identity available                            | Mandatory                                                | NO                                                                             |        |                    |
| Runtime identity available                              | Mandatory                                                | NO                                                                             |        |                    |
| Backup ready                                            | Mandatory for first activation                           | NO                                                                             |        |                    |
| Non-production restore exercise passed                  | Mandatory for first activation                           | NO                                                                             |        |                    |
| Canonical migration checksum matches                    | Mandatory                                                | NO                                                                             |        |                    |
| Migration eligibility verified                          | Mandatory                                                | NO                                                                             |        |                    |
| Migration succeeded or database is current and verified | Mandatory                                                | NO                                                                             |        |                    |
| Exact schema verification passed                        | Mandatory                                                | NO                                                                             |        |                    |
| Runtime-role verification passed                        | Mandatory                                                | NO                                                                             |        |                    |
| Runtime connectivity smoke passed                       | Mandatory                                                | NO                                                                             |        |                    |
| Preproduction smoke passed                              | Mandatory                                                | NO                                                                             |        |                    |
| Restart validation passed                               | Mandatory                                                | NO                                                                             |        |                    |
| Monitoring configured                                   | Mandatory                                                | NO                                                                             |        |                    |
| Activation approval recorded                            | Mandatory                                                | NO                                                                             |        |                    |
| Mutating production smoke                               | Conditional; only if environment policy permits mutation | YES — only with documented policy and preproduction mutation evidence when N/A |        |                    |
| Cross-instance concurrency validation                   | Conditional; required for multi-instance topology        | YES — only for verified single-instance deployment with prescribed rationale   |        |                    |

## PostgreSQL version, connectivity, and TLS

The actual target server must report PostgreSQL major version 16 or newer;
repository test versions are not production evidence. Record the server version
and the command/result reference.

Validate DNS, port reachability, authentication, target database, and TLS
certificate validation. Never weaken certificate verification to make
connectivity work. Do not use `rejectUnauthorized=false` or an equivalent
override unless a separate security authority explicitly governs it.

## Identity separation and privileges

Use two deployment references:

1. A deployment-owned privileged migration identity, used only by the approved
   migration runner and verification tooling.
2. A distinct least-privileged runtime identity used by the application Pool.

The runtime identity must be rejected as a NO-GO if it has excessive table,
column, sequence, schema, or administrative privileges; `WITH GRANT OPTION`; or
prohibited inherited/`SET ROLE` authority. Run the migration runner's effective
permission verification and retain its result.

## Secret delivery and Store mode

Deliver the following through the external deployment secret/configuration
system:

```text
ORION_KNOWLEDGE_STORE=postgresql
ORION_POSTGRES_CONNECTION_STRING=<EXTERNAL_SECRET_REFERENCE>
```

The connection-string value must not appear in this document, source control,
logs, diagnostics, command history, or evidence. Confirm:

```text
SECRET_PRESENT: YES / NO
SECRET_VALUE_RECORDED: NO
```

Store mode is explicit. PostgreSQL must never be inferred from the presence of
database variables, and startup failure must not fall back to InMemory.

## Backup and restore gate

Backup readiness is mandatory before migration and activation. Record:

| Backup evidence                              | Value       |
| -------------------------------------------- | ----------- |
| Backup mechanism identifier                  |             |
| Backup timestamp                             |             |
| Scope (schema, relations, sequences, ledger) |             |
| Retention/reference                          |             |
| Restore target/environment                   |             |
| Restore exercise result                      | PASS / FAIL |

Before first production activation, perform a non-production restore exercise.
After restore, verify the migration ledger, exact schema, allocator state, and
Knowledge reconstruction. Where test data exists, verify historical retrieval,
currentness, predecessor linkage, and deterministic ordering.

## Migration procedure

1. Verify the release commit and migration checksum above.
2. Establish the migration identity without recording its credential.
3. Verify target PostgreSQL version and migration eligibility.
4. Run the approved repository migration runner against the target database.
5. Capture the runner result, migration identifier, checksum, and log reference.
6. Stop immediately on any failure.

Migration failure means: do not start the application in PostgreSQL mode, do not
manually repair schema, retain evidence, and escalate for a separately reviewed
recovery procedure.

### Deterministic runner handoff

The repository runner is an ESM module, not a command-line program. Its exact
entrypoint is:

```text
tools/knowledge-store-migrations/knowledge-store-migration-runner.mjs
```

The deployment executor must run from the repository root at the accepted
release and programmatically import `runKnowledgeStoreMigrations` from that
module. The executor must construct a `pg.Pool` using externally injected
migration/admin connectivity, then call:

```text
runKnowledgeStoreMigrations({
  pool,
  runtimeRole: <RUNTIME_ROLE_NAME>,
  migrationsDirectory: <REPOSITORY_ROOT>/tools/knowledge-store-migrations/migrations/
})
```

`<RUNTIME_ROLE_NAME>` and migration/admin connectivity are deployment-supplied
references, never values recorded in evidence. The executor must close its
migration Pool after the runner settles. No CLI flags are implied: this module
does not parse command-line arguments. Deployment automation owns the exact
secret injection and the small ESM handoff that constructs the Pool; the
operator must not invent an alternate SQL or runner path.

The runner performs eligibility checks as part of the same invocation. On a
pristine database it applies migration `0001`, verifies the applied schema and
runtime permissions, and returns an `applied` result. On an already migrated
database it verifies the ledger/checksum, schema, allocator state, and runtime
permissions and returns a `current` result without reapplying migration 0001.
Any other outcome—including invalid state, checksum mismatch, schema mismatch,
permission mismatch, unavailable connectivity, execution failure, or ambiguous
completion—is a non-success and therefore a STOP/NO-GO.

Capture the runner module identity, accepted release, migration hash, runtime
role reference, timestamp, returned status, schema-verification status,
runtime-role-verification status, and a non-secret log/artifact reference.

## Post-migration schema and role verification

Using approved runner verification, confirm exact relations, columns,
constraints, indexes, operator classes, canonical-order allocator, migration
ledger, ownership, and grants. Confirm runtime-role least privilege as described
above. Any mismatch is a NO-GO.

## Runtime connectivity smoke

Using the runtime identity only, acquire a Pool connection and perform a bounded
non-mutating readiness/read operation. Do not use the migration identity and do
not manually insert or alter Knowledge rows.

## Application startup and readiness

The application startup sequence is:

```text
configuration
→ Pool
→ PostgreSQLKnowledgeStore
→ KnowledgeEngine
→ initialize
→ READY
```

The service must not be healthy or READY before Knowledge initialization and
reconstruction succeed. If initialization fails, keep the service unhealthy,
close the Pool, preserve the failure evidence, and do not fall back to InMemory
or perform an authoritative write.

## Functional smoke test

After READY, execute the smallest environment-approved smoke:

1. list current Knowledge references;
2. if policy permits, accept one disposable/approved Knowledge item;
3. retrieve that exact identity;
4. optionally perform controlled supersession with explicitly disposable data;
5. verify predecessor retention and successor currentness;
6. remove or account for all test data according to environment policy.

Record:

```text
MUTATING_SMOKE: PASS / NOT APPLICABLE
```

If mutating smoke is `NOT APPLICABLE`, equivalent mutation evidence must come
from preproduction.

## Durable-authority warning

**The first authoritative PostgreSQL Knowledge write establishes PostgreSQL as
the durable Knowledge authority for this deployment.**

After that point, switching to `ORION_KNOWLEDGE_STORE=in-memory` is not a normal
rollback and is prohibited unless separately governed.

## Restart validation

Before activation declaration:

1. Instance A performs an approved PostgreSQL-backed operation and shuts down
   orderly.
2. Instance B/new process starts with a fresh Pool against the same database.
3. Instance B initializes and reconstructs authoritative state.
4. Record current state, historical retrieval, predecessor linkage, acceptance
   order, and deterministic snapshot ordering.

For a multi-instance topology, also perform preproduction cross-instance
supersession/concurrency validation. For a single-instance topology, record:

```text
NOT APPLICABLE — cross-instance behavior is adapter-conformance-tested but not deployment-exercised.
```

## Activation declaration and monitoring

Declare operational activation only after every required go/no-go gate is
`PASS`, approval is recorded, and the evidence package is complete. The
operational evidence may then record:

```text
POSTGRESQL_PRODUCTION_ACTIVE: YES
```

This document and repository remain `POSTGRESQL_PRODUCTION_ACTIVE: NO` until
that real operational event occurs.

Use a deployment-owned observation window; do not invent a duration here.
Monitor startup failures, Store unavailable, invalid durable state,
reconstruction-required, failed initialization, shutdown failures, and Pool
cleanup failures. Logs and metrics must contain no credentials, payloads, raw
SQL, or raw PostgreSQL errors.

## Abort and rollback policy

Pre-activation abort is fail-closed for wrong release, PostgreSQL below 16,
connectivity/TLS failure, missing secret, missing backup, failed restore,
checksum or migration failure, schema/role mismatch, failed preproduction
validation, failed startup, or failed restart validation.

If activation fails before the first authoritative PostgreSQL write, stop the
application, close the Pool, preserve the migrated database unless a reviewed
cleanup procedure exists, and revert configuration only if operationally
appropriate. Do not silently delete the schema.

After the first authoritative write:

- PostgreSQL remains authoritative;
- do not fall back to InMemory;
- do not run an automatic down migration;
- assess application binary compatibility before rollback;
- use only an approved forward correction or restore/recovery procedure.

Application rollback requires explicit compatibility verification against the
current schema and durable Knowledge state. Schema rollback is never an
automatic down migration after durable writes.

## Evidence package

Retain the following without secrets:

| Evidence                                     | Reference/result |
| -------------------------------------------- | ---------------- |
| Release commit                               |                  |
| Migration artifact and hash                  |                  |
| PostgreSQL version                           |                  |
| Migration runner result                      |                  |
| Exact schema verification                    |                  |
| Runtime-role verification                    |                  |
| Backup reference                             |                  |
| Restore evidence                             |                  |
| Configuration mode (`postgresql`, no secret) |                  |
| Startup and Knowledge READY                  |                  |
| Functional smoke                             |                  |
| Restart validation                           |                  |
| Monitoring configuration                     |                  |
| Activation timestamp                         |                  |
| Operator/reviewer/change ID                  |                  |

Avoid embedding secrets in shell history. Use the deployment platform's
external secret injection, file-descriptor, or equivalent mechanism where
available; do not prescribe a provider-specific tool here.

## References

- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](../adr/ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0024 — Durable Knowledge Physical Store Architecture](../adr/ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md)
- [ADR-0025 — Knowledge Store Database Product Selection](../adr/ADR-0025-Knowledge-Store-Database-Product-Selection.md)
- [ADR-0026 — Knowledge Durable Store Asynchronous Execution and Recovery](../adr/ADR-0026-Knowledge-Durable-Store-Asynchronous-Execution-and-Recovery.md)
- [SCHEMA-0001 — PostgreSQL Knowledge Store Physical Schema Design](../../specifications/schemas/SCHEMA-0001-PostgreSQL-Knowledge-Store-Physical-Schema-Design.md)
- [Canonical migration 0001](../../tools/knowledge-store-migrations/migrations/0001_initial_knowledge_store.sql)
- [Migration runner](../../tools/knowledge-store-migrations/knowledge-store-migration-runner.mjs)

## Current planning state

```text
KSTORE_DEPLOY_PLAN_F02: OPEN
POSTGRESQL_PROVISIONING_READY: NO
POSTGRESQL_MIGRATION_READY: NO
POSTGRESQL_ACTIVATION_READY: NO
POSTGRESQL_PRODUCTION_ACTIVE: NO
```

## Change history

| Version | Date       | Description                                  |
| ------- | ---------- | -------------------------------------------- |
| 1.0     | 2026-08-24 | Accepted as the governed activation runbook. |
