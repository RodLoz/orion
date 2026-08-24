# PostgreSQL Knowledge Store Nonproduction Validation Environment Plan

**Status:** Active  
**Version:** 1.0  
**Updated:** 2026-08-24  
**Owner:** Deployment, database, and application owners  
**Scope:** Validation-only PostgreSQL environment

## Purpose and boundary

This plan defines a future, separately authorized nonproduction environment for
producing PostgreSQL Knowledge Store deployment evidence. It does not provision
infrastructure, create credentials, execute migration, or activate production
routing. It does not change Knowledge semantics or architecture.

The environment is validation-only and is never a production durable authority.
Organization-specific provider, endpoint, network, account, region, and secret
references remain operator inputs; this plan selects none of them.

## Governing sources

- [Active PostgreSQL activation runbook](POSTGRESQL-KNOWLEDGE-STORE-ACTIVATION-RUNBOOK.md)
- [ADR-0023](../adr/ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0024](../adr/ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md)
- [ADR-0025](../adr/ADR-0025-Knowledge-Store-Database-Product-Selection.md)
- [ADR-0026](../adr/ADR-0026-Knowledge-Durable-Store-Asynchronous-Execution-and-Recovery.md)
- [SCHEMA-0001](../../specifications/schemas/SCHEMA-0001-PostgreSQL-Knowledge-Store-Physical-Schema-Design.md)
- [Canonical migration 0001](../../tools/knowledge-store-migrations/migrations/0001_initial_knowledge_store.sql)
- [Migration runner](../../tools/knowledge-store-migrations/knowledge-store-migration-runner.mjs)
- Accepted runbook release: `9203d8abdcc6a80d0ee50625022aa35c12778f8a`

Before execution, verify the accepted repository baseline and canonical
migration bytes:

```text
Implementation baseline: 05061e723befb43a3e38fb0fa9fa9a88d08d0885
Accepted runbook baseline: 9203d8abdcc6a80d0ee50625022aa35c12778f8a
Migration SHA-256: 539A3CEEDCDD4F9E43BD126267DBDBD0907C4D8FF5D521C4BAAA5D7628011DE5
```

## Environment ownership fields

Complete these fields before execution; do not invent values in this plan:

| Field                              | Owner/reference           |
| ---------------------------------- | ------------------------- |
| Validation environment identifier  | `OPERATOR_INPUT_REQUIRED` |
| PostgreSQL endpoint/database owner | `OPERATOR_INPUT_REQUIRED` |
| Migration identity owner/reference | `OPERATOR_INPUT_REQUIRED` |
| Runtime identity owner/reference   | `OPERATOR_INPUT_REQUIRED` |
| Secret owner/reference             | `OPERATOR_INPUT_REQUIRED` |
| Backup owner/reference             | `OPERATOR_INPUT_REQUIRED` |
| Restore-target owner/reference     | `OPERATOR_INPUT_REQUIRED` |
| Application/test executor          | `OPERATOR_INPUT_REQUIRED` |
| Evidence owner                     | `OPERATOR_INPUT_REQUIRED` |
| Independent reviewer               | `OPERATOR_INPUT_REQUIRED` |

```text
NONPROD_ENVIRONMENT_PURPOSE: VALIDATION_ONLY
NONPROD_PRODUCTION_AUTHORITY: NONE
```

## PostgreSQL platform requirements

The target must run PostgreSQL major version 16 or newer, support TLS with
certificate validation, provide reachable database connectivity, and persist
state across application restart. The environment must provide a separate
restore target and isolation from production.

The migration executor owns its migration Pool. Bootstrap owns the application
runtime Pool. The adapter never owns either lifecycle. No provider is selected.

```text
NONPROD_POSTGRESQL_MINIMUM_VERSION: 16
DATABASE_PROVIDER: DEFERRED
```

## Identity model

Use two distinct identities:

1. A privileged migration identity used only by the approved migration runner
   and its verification flow.
2. A least-privileged runtime identity used by the application Pool.

Each identity is created and credentialed by the deployment owner. Credentials
are externally injected, never committed, logged, or used interchangeably. The
application must never run as the migration identity. Runtime privileges must
pass the migration runner's governed verification, including schema, table,
column, sequence, grant-option, inheritance, `SET ROLE`, and administrative
checks.

```text
NONPROD_IDENTITY_SEPARATION: REQUIRED
```

## Secret delivery

Future execution receives migration/admin connectivity, runtime connectivity,
the runtime role name, and:

```text
ORION_KNOWLEDGE_STORE=postgresql
ORION_POSTGRES_CONNECTION_STRING=<EXTERNAL_SECRET_REFERENCE>
```

Secret injection is external. Values must not appear in this plan, source,
evidence, logs, or avoidable shell history.

```text
NONPROD_SECRET_CREATION: NOT_PERFORMED
NONPROD_SECRET_DELIVERY: EXTERNAL
```

## Network and TLS prerequisites

Before database work, collect separate infrastructure evidence for DNS/endpoint
resolution, port reachability, authentication, target database reachability,
TLS negotiation, and certificate validation. Any firewall, routing, endpoint,
or certificate policy not supplied by repository authority is:
`OPERATOR_INPUT_REQUIRED`. No insecure certificate-validation bypass is allowed.

## Backup validation design

Use a deployment/platform-approved backup mechanism without selecting a vendor.
The future evidence must record mechanism reference, timestamp, database/schema
scope, retention/reference, success result, and integrity/availability result.
This proves backup capability for the validation environment, not production
backup readiness.

```text
NONPROD_BACKUP_VALIDATION: PLANNED_NOT_EXECUTED
```

## Restore validation design

Restore into a distinct nonproduction target. Verify the restored Knowledge
schema, migration ledger/checksum, sequences/allocators, immutable records,
lifecycle state, constraints/indexes, and required ownership/permissions or
their documented reapplication procedure. A successful database restore alone
is insufficient: a new runtime Pool and Knowledge Engine must reconstruct the
restored durable state.

```text
NONPROD_RESTORE_VALIDATION: PLANNED_NOT_EXECUTED
RESTORE_TARGET: SEPARATE_NONPRODUCTION_TARGET
```

## Migration validation design

Use only the accepted release and canonical migration artifact. From repository
root, verify the release and migration checksum, then have the deployment
executor construct a migration/admin `pg.Pool` and call the existing ESM API:

```text
runKnowledgeStoreMigrations({
  pool,
  runtimeRole: <RUNTIME_ROLE_NAME>,
  migrationsDirectory: <REPOSITORY_ROOT>/tools/knowledge-store-migrations/migrations/
})
```

The executor closes its migration Pool after the call settles. There is no
runner CLI. `applied` and `current` are successful results; exceptions,
checksum/state/schema/permission failures, unavailable connectivity, and
ambiguous completion are STOP conditions.

```text
NONPROD_MIGRATION_VALIDATION: PLANNED_NOT_EXECUTED
```

## Pristine and current database cases

Exercise both governed success paths where possible:

- pristine isolated database: runner applies 0001 and returns `applied`;
- already-current isolated database: runner verifies ledger/checksum/schema/
  allocator/runtime permissions and returns `current` without reapplying 0001.

Invalid ledger/schema/checksum/permission state must fail closed.

## Schema verification

Use the approved migration runner as the verification authority. Retain evidence
for schema, relations, columns, constraints, indexes, operator classes,
sequence/allocator, migration ledger/checksum, ownership, and grants. Do not
create plan-owned SQL or duplicate schema definitions.

```text
NONPROD_SCHEMA_VERIFICATION_SOURCE: APPROVED_MIGRATION_RUNNER
```

## Runtime-role verification

Retain runner evidence that the runtime identity has only governed privileges
and no excessive schema/table/column/sequence rights, grant options,
administrative attributes, inheritance, or prohibited `SET ROLE` path.

```text
NONPROD_RUNTIME_ROLE_VERIFICATION: APPROVED_RUNNER
```

## Application composition validation

In the isolated environment, explicitly supply PostgreSQL mode and the external
connection string. Validate:

```text
configuration
→ Pool
→ PostgreSQLKnowledgeStore
→ KnowledgeEngine
→ initialize
→ READY
```

Initialization failure must leave the service unhealthy, close the Pool, and
fail without InMemory fallback. This plan does not change production routing.

```text
NONPROD_POSTGRESQL_ROUTING: PLANNED_ONLY
PRODUCTION_ROUTING_CHANGE: NONE
```

## Functional validation

Using disposable validation data, prove READY, current-reference listing,
identity retrieval, one accepted durable record, exact retrieval of that
record, supersession, predecessor historical retrieval, successor currentness,
and lifecycle snapshot/reconstruction behavior. Mark every validation record as
disposable and account for cleanup.

## Restart and reconstruction validation

Execute:

```text
Instance A / Pool A
→ durable operations
→ orderly Knowledge shutdown
→ Pool A closed
→ fresh Instance B / Pool B
→ same PostgreSQL database
→ Knowledge initialize/reconstruct
→ READY
```

Evidence must prove Pool A closure, Pool B identity and fresh database session,
historical predecessor, current successor, linkage, ordering, and absence of
reused process-local authority.

```text
NONPROD_RESTART_RECONSTRUCTION: REQUIRED
```

## Backup/restore reconstruction proof

The operational evidence sequence is:

```text
source validation database
→ authoritative validation data
→ backup
→ separate restore target
→ restore
→ migration/current-state verification
→ fresh runtime Pool
→ fresh Knowledge Engine
→ initialize/reconstruct
→ verify durable Knowledge state
```

The existing restart test is not restore evidence.

```text
KSTORE_DEPLOY_PLAN_F02_EVIDENCE_SEQUENCE: BACKUP_RESTORE_THEN_FRESH_ENGINE_RECONSTRUCTION
```

## Multi-instance validation

Production topology is not established by repository authority. If future
deployment is multi-instance, preproduction must validate cross-instance
duplicate acceptance, competing supersession, one-winner behavior, loser
absence, and deterministic reconstruction. If topology remains unknown:

```text
OPERATOR_INPUT_REQUIRED
```

Only after topology is proven single-instance may the Active runbook's bounded
single-instance N/A rule be applied.

## Failure-path validation

In isolated, non-destructive tests, exercise unavailable database,
configuration, migration, checksum, schema, runtime-permission,
initialization, read, mutation, ambiguous-commit, shutdown, and Pool-cleanup
failures where safely testable. Record repository-test evidence separately from
operational environment evidence. Do not introduce destructive fault injection
outside the isolated environment.

## Monitoring validation

During the validation window, observe startup/initialization failure, Store
unavailable, invalid durable state, reconstruction-required, shutdown failure,
and Pool cleanup failure. Keep all telemetry secret-free and select no
monitoring vendor.

```text
MONITORING_PROVIDER: DEFERRED
```

## Cleanup plan

After validation, orderly stop the application and close Pools. Dispose of
validation-only secrets under their owner's policy, clean the validation and
restore targets according to approved retention, retain required backup/restore
and migration evidence, and ensure validation endpoints cannot enter production
configuration. Do not execute cleanup as part of this plan task.

## Evidence package

Retain one secret-free package containing:

- validation environment identifier and platform reference;
- accepted release and runbook version/status;
- PostgreSQL version;
- migration/runtime identity references;
- TLS/connectivity result;
- backup and restore references/results;
- runner result and migration hash;
- schema and runtime-role verification;
- PostgreSQL mode and startup/READY;
- functional smoke;
- restart reconstruction;
- backup→restore→fresh-engine reconstruction;
- multi-instance result or governed N/A evidence;
- monitoring and cleanup results;
- operator, reviewer, timestamps, and change/ticket references.

No credentials or connection strings may enter the package.

## Exit criteria

`KSTORE_DEPLOY_PLAN_F02` may advance only after independent review confirms
mandatory evidence for backup success, restore success, canonical
migration/current-state verification, schema conformance, runtime-role
conformance, PostgreSQL READY, durable mutation, fresh restart reconstruction,
restored-database fresh reconstruction, monitoring, and cleanup. Provisioning or
an otherwise successful migration alone is insufficient, and this plan does not
close F02.

## Production gate preservation

```text
KSTORE_DEPLOY_PLAN_F02: OPEN_PENDING_BACKUP_RESTORE_EVIDENCE
POSTGRESQL_PRODUCTION_PROVISIONING_READY: NO
POSTGRESQL_MIGRATION_READY: NO
POSTGRESQL_ACTIVATION_READY: NO
NONPROD_INFRASTRUCTURE_CREATED: NO
NONPROD_DATABASE_CREATED: NO
NONPROD_ROLES_CREATED: NO
NONPROD_SECRETS_CREATED: NO
NONPROD_BACKUP_EXECUTED: NO
NONPROD_RESTORE_EXECUTED: NO
NONPROD_MIGRATION_EXECUTED: NO
PRODUCTION_CHANGE: NONE
```

## Current plan state

```text
NONPROD_PLAN_INITIAL_STATUS: DRAFT
POSTGRESQL_NONPROD_VALIDATION_EXECUTION_READY: YES
```

## Change history

| Version | Date       | Description                               |
| ------- | ---------- | ----------------------------------------- |
| 1.0     | 2026-08-24 | Accepted as the governed validation plan. |
