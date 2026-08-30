\# PostgreSQL Knowledge Store Nonproduction Validation Evidence



\*\*Status:\*\* Technical execution complete - independent review pending

\*\*Date:\*\* 2026-08-29

\*\*Scope:\*\* Validation-only PostgreSQL Knowledge Store environment

\*\*Production activation:\*\* NO

\*\*Production change:\*\* NONE



\## Purpose



This evidence package records execution of the governed PostgreSQL Knowledge

Store nonproduction validation plan.



It demonstrates migration/schema readiness, least-privilege runtime access,

durable Knowledge behavior, restart reconstruction, conflict handling,

transactional rollback, backup/restore capability, and restored-state

reconstruction.



This package does not authorize production activation.



\## Governed references



\- Validation plan:

&#x20; `docs/runbooks/POSTGRESQL-KNOWLEDGE-STORE-NONPROD-VALIDATION-PLAN.md`

\- Activation runbook:

&#x20; `docs/runbooks/POSTGRESQL-KNOWLEDGE-STORE-ACTIVATION-RUNBOOK.md`

\- Migration runner:

&#x20; `tools/knowledge-store-migrations/knowledge-store-migration-runner.mjs`

\- Canonical migration:

&#x20; `tools/knowledge-store-migrations/migrations/0001\_initial\_knowledge\_store.sql`



\## Repository and release identity



| Evidence | Value |

|---|---|

| Repository HEAD | `86bb14d7d883ce0809ac7a82fe09d0358926fa4c` |

| Implementation baseline | `05061e723befb43a3e38fb0fa9fa9a88d08d0885` |

| Accepted runbook release | `9203d8abdcc6a80d0ee50625022aa35c12778f8a` |

| Migration SHA-256 | `539A3CEEDCDD4F9E43BD126267DBDBD0907C4D8FF5D521C4BAAA5D7628011DE5` |

| Node.js | `v24.13.0` |

| PostgreSQL dump/restore tooling | PostgreSQL 17.11 |

| Docker Engine | 29.4.0 |



\## Environment



| Field | Value |

|---|---|

| Environment purpose | VALIDATION\_ONLY |

| Platform | Supabase PostgreSQL nonproduction |

| Connectivity | Session Pooler, PostgreSQL port 5432 |

| TLS | `sslmode=verify-full` with trusted CA |

| Runtime identity | `orion\_knowledge\_runtime` |

| Migration/admin identity | `postgres` |

| Runtime/store mode | `postgresql` |

| Restore target | Separate disposable PostgreSQL 17 Docker target |

| Production routing changed | NO |

| Secrets recorded in evidence | NO |



Connection strings, passwords, secret values, and certificate contents are

intentionally excluded from this package.



\## Migration and schema verification



\### Migration result



The approved migration runner reported the database as exact-current:



```text

MIGRATION RESULT:

{ status: 'current', appliedMigration: null }

```



Migration ledger entry `0001` was present and matched the accepted migration

artifact checksum.



\### Verified durable objects



The validation confirmed the governed Knowledge schema includes:



\- `knowledge.knowledge\_record`

\- `knowledge.knowledge\_lifecycle`

\- `knowledge.schema\_migration`

\- `knowledge.knowledge\_acceptance\_order\_seq`

\- `knowledge.knowledge\_lifecycle\_canonical\_order\_seq`

\- governed primary keys, unique constraints, checks, and foreign keys.



\*\*Result:\*\* PASS



\## Runtime-role verification



The least-privilege runtime identity was verified with:



\- LOGIN: permitted

\- SUPERUSER: prohibited

\- CREATEDB: prohibited

\- CREATEROLE: prohibited

\- REPLICATION: prohibited

\- BYPASSRLS: prohibited

\- schema `USAGE`: permitted

\- schema `CREATE`: prohibited

\- Knowledge record SELECT/INSERT: permitted

\- Knowledge record UPDATE/DELETE: prohibited

\- lifecycle SELECT/INSERT: permitted

\- unrestricted lifecycle table UPDATE: prohibited

\- governed lifecycle standing update: permitted

\- migration ledger SELECT: prohibited

\- required sequence USAGE: permitted

\- excessive sequence SELECT/UPDATE: prohibited



\*\*Result:\*\* PASS



\## PostgreSQL application composition



Explicit Bootstrap configuration was validated as:



```text

knowledgeStoreMode: 'postgresql'

postgresqlConfigured: true

engineState: 'ready'

```



No fallback to the InMemory Knowledge Store was accepted during governed

PostgreSQL validation.



\*\*Result:\*\* PASS



\## Durable Knowledge validation



A Knowledge claim was accepted through the ORION public Knowledge capability

and persisted using the PostgreSQL-backed Store.



Initial durable identity:



```text

knowledgeIdentity: orion.knowledge.m4.1

version: 1

standing: current

acceptanceOrder: knowledge-acceptance-v1:1

```



A fresh PostgreSQL-backed Bootstrap subsequently reconstructed the durable

Knowledge state.



\*\*Result:\*\* PASS



\## Idempotency validation



The already persisted Knowledge record was retrieved through

`PostgreSQLKnowledgeStore.get()` and submitted again through

`putIndependentAcceptedKnowledge()`.



Observed result:



```text

status: duplicate

record\_count: 1

lifecycle\_count: 1

stateUnchanged: true

```



No duplicate record or lifecycle entry was persisted.



\*\*Result:\*\* PASS



\## Supersession and stale-predecessor validation



A controlled supersession produced:



```text

orion.knowledge.m4.1

&#x20; version: 1

&#x20; standing: superseded



orion.knowledge.m4.2

&#x20; version: 2

&#x20; predecessorKnowledgeIdentity: orion.knowledge.m4.1

&#x20; standing: current

```



An incorrect predecessor version was rejected as:



```text

status: stale-predecessor

```



A second attempt to reuse the already-superseded predecessor was also rejected

as:



```text

status: stale-predecessor

```



The competing successor was not stored.



Final durable counts:



```text

record\_count: 2

lifecycle\_count: 2

```



\*\*Result:\*\* PASS



\## Transactional rollback validation



A controlled conflicting successor reused an already-existing Knowledge

identity while superseding the current predecessor.



The transaction advanced through the governed supersession path and the

successor insert failed as a duplicate.



Observed result:



```text

status: duplicate

```



Post-failure verification confirmed:



```text

predecessorRestoredToCurrent: true

historicalPredecessorStillSuperseded: true

noAdditionalRecordPersisted: true

noAdditionalLifecyclePersisted: true

currentKnowledgeStillReadable: true

rollbackPreservedLifecycle: true

rollbackPreservedRows: true

```



Final durable counts remained:



```text

record\_count: 2

lifecycle\_count: 2

```



Sequence gaps caused by rolled-back transactions are not treated as durable

Knowledge corruption because PostgreSQL sequence allocation is not

transactionally reclaimed.



\*\*Result:\*\* PASS



\## Restart and reconstruction validation



A fresh PostgreSQL-backed Bootstrap reconstructed the authoritative current

projection after supersession.



Public Knowledge references exposed only:



```text

orion.knowledge.m4.2

version: 2

currency: current

validationState: accepted

```



The durable lifecycle snapshot reconstructed the complete history:



```text

orion.knowledge.m4.1

version: 1

standing: superseded



orion.knowledge.m4.2

version: 2

predecessorKnowledgeIdentity: orion.knowledge.m4.1

standing: current

```



Validation summary:



```text

engineReady: true

publicReferenceCount: 1

onlyCurrentExposed: true

successorCurrent: true

lifecycleEntryCount: 2

predecessorSuperseded: true

durableSuccessorCurrent: true

predecessorLinkRecovered: true

engineProjectionCorrect: true

durableHistoryCorrect: true

pass: true

```



Orderly shutdown completed with:



```text

engineState: stopped

```



\*\*Result:\*\* PASS



\## Backup evidence



A logical custom-format PostgreSQL backup of the governed `knowledge` schema

was created outside the repository.



| Evidence | Value |

|---|---|

| Backup mechanism | PostgreSQL `pg\_dump` custom format |

| Backup scope | `knowledge` schema |

| Backup file | `E:\\RODRIGO\\Backups\\Orion\\knowledge-20260829-131538\\orion-knowledge.dump` |

| Size | 14,171 bytes |

| SHA-256 | `0E844B41AE8F8595057ACC710378DC358FB4906785EAA930EB4EEB7EE32DF98E` |

| `pg\_dump` exit code | 0 |



`pg\_restore --list` verified that the archive contains the governed schema,

tables, table data, sequences, sequence state, constraints, and foreign keys.



\*\*Result:\*\* PASS



\## Restore evidence



The backup was restored into a fresh, separate PostgreSQL 17 Docker target.



The successful clean restore completed with:



```text

pg\_restore exit code: 0

```



Restored objects included:



```text

knowledge.knowledge\_lifecycle

knowledge.knowledge\_record

knowledge.schema\_migration

```



Restored durable data included the controlled Knowledge and lifecycle state.



\*\*Result:\*\* PASS



\## Fresh Store reconstruction from restored database



After restore, a fresh ORION `PostgreSQLKnowledgeStore` connected to the

separate restored target and loaded:



```text

status: loaded



knowledgeIdentity: orion.knowledge.m4.1

version: 1

standing: current

acceptanceOrder: knowledge-acceptance-v1:1



restoredKnowledgeFound: true

```



This proves restored durable state can be reconstructed by ORION and is not

merely a successful SQL restore.



\*\*Result:\*\* PASS



\## Restore-target teardown



The disposable restore target was removed after validation:



```text

docker rm -f orion-knowledge-restore-test

```



Subsequent container listing showed no matching restore container.



\*\*Result:\*\* PASS



\## Monitoring



No production monitoring provider was introduced or changed by this

validation.



Monitoring/provider integration remains governed separately.



\*\*Result:\*\* NOT APPLICABLE TO NONPRODUCTION TECHNICAL EXECUTION



\## Validation result summary



| Gate | Result |

|---|---|

| TLS / trusted CA | PASS |

| Runtime authentication | PASS |

| Migration exact-current | PASS |

| Schema verification | PASS |

| Runtime least privilege | PASS |

| PostgreSQL Bootstrap READY | PASS |

| Durable write/read | PASS |

| Duplicate/idempotency | PASS |

| Supersession | PASS |

| Stale-predecessor rejection | PASS |

| Transactional rollback | PASS |

| Fresh restart/reconstruction | PASS |

| Backup creation | PASS |

| Backup integrity inspection | PASS |

| Isolated restore | PASS |

| Fresh ORION reconstruction from restore | PASS |

| Restore-target teardown | PASS |



\## Evidence disposition



```text

NONPROD\_TECHNICAL\_EXECUTION\_RESULT: PASS

NONPROD\_BACKUP\_EXECUTED: YES

NONPROD\_RESTORE\_EXECUTED: YES

NONPROD\_RESTART\_RECONSTRUCTION: PASS

NONPROD\_TRANSACTIONAL\_ROLLBACK: PASS



F02\_TECHNICAL\_EVIDENCE\_COMPLETE: YES

F02\_INDEPENDENT\_REVIEW: PENDING

KSTORE\_DEPLOY\_PLAN\_F02: OPEN\_PENDING\_INDEPENDENT\_REVIEW



POSTGRESQL\_PRODUCTION\_ACTIVE: NO

PRODUCTION\_CHANGE: NONE

```



A technical PASS does not close F02 and does not authorize production

activation. Independent review remains mandatory under the governed validation

plan.



\## Review record



| Field | Value |

|---|---|

| Execution date | 2026-08-29 |

| Operator | `OPERATOR\_INPUT\_REQUIRED` |

| Independent reviewer | `PENDING` |

| Review timestamp | `PENDING` |

| Change/ticket reference | `PENDING\_OR\_NOT\_PROVIDED` |

| Independent review result | `PENDING` |



\## Secret handling



This evidence package intentionally contains:



\- no PostgreSQL passwords;

\- no credential-bearing connection strings;

\- no environment-variable secret values;

\- no private certificate contents.



\## Final state



```text

TECHNICAL\_VALIDATION: PASS

INDEPENDENT\_REVIEW: PENDING

F02: OPEN

PRODUCTION\_ACTIVATION: NO

```
