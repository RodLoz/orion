# ADR-0026 — Knowledge Durable Store Asynchronous Execution and Recovery

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Project Maintainers   |
| **Created**       | 2026-08-23            |
| **Updated**       | 2026-08-23            |
| **Decision Type** | Architecture Decision |

---

# Context

Active ADR-0023 requires one durable Knowledge lifecycle Store boundary with
atomic acceptance, supersession, historical retrieval, and restart
reconstruction. Active ADR-0024 selects a transactional relational physical
architecture, and Active ADR-0025 selects PostgreSQL through the direct `pg`
driver. The approved physical schema and initial migration preserve those
semantics.

The current executable `KnowledgeStore` and `KnowledgeLifecycleStore` methods
return immediate results. `KnowledgeEngine.initialize()` and acceptance also
consume those results synchronously. Correct PostgreSQL retrieval, transaction,
and `COMMIT` completion through `pg` are asynchronous. A synchronous wrapper
would block the Node.js event loop, conceal completion uncertainty, or introduce
an unapproved worker, process, sidecar, or transport architecture.

The execution boundary must therefore become asynchronous without changing
Knowledge meaning, moving PostgreSQL into Core, transferring ownership, or
propagating asynchrony into Context, Reasoning, Planning, and Brain where no
runtime I/O requires it.

# Decision Drivers

The decision must:

- preserve durable success-before-visibility semantics;
- distinguish known failure from ambiguous completion;
- support direct non-blocking `pg` transactions;
- provide one Store contract and conformance model;
- preserve eager lifecycle reconstruction and immutable history;
- bound asynchronous propagation to actual I/O boundaries;
- prevent concurrent Engine memory from diverging from durable order;
- preserve projection, Source Currentness, Context, and failure ownership; and
- require no physical schema or migration change.

# Decision

## Unified Promise-Based Store Port

```text
KNOWLEDGE_STORE_EXECUTION_MODEL:
PROMISE_BASED_UNIFIED_PORT
```

All Knowledge Store implementations use one Promise-returning semantic port.
This includes the in-memory reference Store, the PostgreSQL Store, and future
durable Stores. Separate synchronous and asynchronous Knowledge Store contracts
are not introduced.

The Core-alignment task will define exact TypeScript syntax. The governed shape
is equivalent to:

```text
put(record) -> Promise<KnowledgeStorePutResult>
get(identity) -> Promise<KnowledgeStoreGetResult>
putIndependentAcceptedKnowledge(request)
  -> Promise<PutIndependentAcceptedKnowledgeResult>
supersedeCurrentKnowledge(request)
  -> Promise<SupersedeCurrentKnowledgeResult>
loadKnowledgeLifecycleSnapshot()
  -> Promise<KnowledgeLifecycleSnapshotResult>
```

Promise-based execution changes when completion becomes observable. It does not
transfer record, lifecycle, acceptance, projection, currentness, or failure
meaning to Core, an Adapter, Bootstrap, or PostgreSQL.

## Explicit Awaited Initialization

```text
KNOWLEDGE_INITIALIZATION_MODEL:
EXPLICIT_AWAITED_INITIALIZATION
```

Knowledge construction remains free of asynchronous I/O. The Engine begins not
ready. Its explicit initialization operation is awaited and performs:

```text
constructed
-> initializing
-> await lifecycle snapshot
-> await every immutable record required by that snapshot
-> validate record/snapshot correspondence and lifecycle semantics
-> reconstruct lifecycle indexes and immutable-record cache
-> ready
```

No ready-gated Knowledge operation may succeed before initialization completes.
Initialization failure is fail-closed and cannot expose partially reconstructed
state.

## Eager Reconstruction and Record Cache

```text
DURABLE_KNOWLEDGE_RUNTIME_MODEL:
EAGER_RECONSTRUCTION
```

Initialization loads and retains the complete set of immutable accepted records
required by the reconstructed lifecycle. The cache is process-local,
Engine-owned runtime state containing exact records already read from and
validated against the authoritative Store.

The cache is not a second Store, durable state, a new source of Knowledge, a
projection authority, or an independent semantic authority. It is discarded on
process termination and rebuilt from the Store after restart.

## Post-Initialization Reads

```text
POST_INITIALIZATION_READ_MODEL:
SYNCHRONOUS_MEMORY_BACKED
```

After successful initialization, normal operations that require no new Store
I/O remain synchronous and use reconstructed Engine memory:

- `getKnowledge`;
- `listKnowledgeReferences`;
- structured Knowledge projection;
- Knowledge-owned Source Currentness determination; and
- projection-authority verification.

These paths must not query the Store during normal ready-state execution. This
bounds the public asynchronous change and keeps Context retrieval and
preparation synchronous after Bootstrap supplies a ready Knowledge capability.

## Awaited Mutations

```text
KNOWLEDGE_MUTATION_MODEL:
AWAIT_DURABLE_STORE_BEFORE_ENGINE_STATE_CHANGE
```

Independent acceptance and supersession are awaited. The sequence is:

```text
validate request and Knowledge semantics
-> construct immutable candidate record
-> await the atomic Store mutation
-> validate the Store result
-> update reconstructed Engine memory
-> return caller-visible outcome
```

The Engine must not update confirmed identities, standing, acceptance order, or
the immutable-record cache before known durable success. Known failed mutation
causes no Engine cache change.

## Partial Public Asynchronous Surface

```text
PUBLIC_KNOWLEDGE_ASYNC_SURFACE:
PARTIAL_INITIALIZE_MUTATE_RECOVER_SHUTDOWN
```

The major Knowledge successor makes acceptance evaluation Promise-returning and
makes Engine initialization, recovery, and orderly shutdown explicitly awaited.
Post-initialization retrieval, listing, structured projection, projection
verification, and Source Currentness remain synchronous under the eager
reconstruction model.

# Mutation Completion and Failure

## Completion Classes

```text
MUTATION_COMPLETION_MODEL:
SUCCESS_KNOWN_FAILURE_AMBIGUOUS
```

Every Store mutation completes in exactly one operational class:

1. **Success:** durable commit is known to have completed.
2. **Known failure:** the Store knows the transition did not commit.
3. **Ambiguous completion:** commit may have completed, but the caller cannot
   determine whether it did.

The Promise-based Store port must carry enough product-neutral internal result
information for the Engine to distinguish the third class from the second.
Exact Core discriminants are deferred to the Core-alignment task. PostgreSQL
error codes and driver objects do not enter Core.

Expected Store outcomes normally resolve through the Store result unions.
Known pre-commit unavailability is a resolved known-failure result. An
unexpected Promise rejection is a Store boundary failure. During mutation, if
the Store cannot prove that rejection occurred before possible commit, the
Engine treats it conservatively as ambiguous.

## Ambiguous Completion State

```text
AMBIGUOUS_COMPLETION_ENGINE_STATE:
RECONSTRUCTION_REQUIRED
```

After ambiguous completion, the Engine:

- assumes neither success nor failure;
- performs no optimistic cache update;
- issues no automatic retry;
- exits the ready state;
- prohibits further mutation; and
- requires authoritative Store reconstruction before normal operation resumes.

The internal ambiguous outcome does not create a new public Knowledge semantic
failure. It may continue to surface through the existing public Knowledge Store
unavailable failure identity while retaining a distinct internal recovery
requirement.

## Recovery

```text
RECOVERY_SEMANTIC_OWNER:
KNOWLEDGE_ENGINE

RECOVERY_ENTRYPOINT_MODEL:
EXPLICIT_AWAITED_ENGINE_OPERATION

RECOVERY_INVOCATION_BOUNDARY:
OWNING_RUNTIME_CALLER_TO_KNOWLEDGE_ENGINE
```

Recovery is an explicit awaited Knowledge Engine lifecycle operation. Exact
method naming is deferred to the Knowledge successor and executable alignment,
but its ownership and invocation boundary are not. It may be invoked only while
the Engine is reconstruction-required by the owning application/runtime
workflow, controlled operational orchestration holding the Knowledge
capability, or Bootstrap when Bootstrap is acting as that owning runtime
workflow.

The Store and PostgreSQL Adapter do not initiate recovery, call the Engine
recovery operation, mutate Engine lifecycle state, or decide readiness.
Context, Reasoning, Planning, and Brain semantic logic do not initiate recovery.
The caller requests recovery; the Knowledge Engine owns and performs it.

Recovery is:

```text
ambiguous mutation
-> reconstruction-required
-> block ready-gated operations
-> await authoritative snapshot and immutable records
-> validate and rebuild all Engine runtime state
-> ready
```

Successful reconstruction permits the caller or owning workflow to inspect the
authoritative state and decide whether a new operation is semantically valid.
Recovery does not retry the ambiguous mutation, reuse its transaction, infer
completion from sequence gaps, or introduce an idempotency key.

Reconstruction builds replacement cache and index state separately and
publishes it atomically only after the complete state validates. Failure
publishes no partial replacement and leaves the Engine fail-closed.

```text
RECOVERY_CONCURRENCY_MODEL:
SINGLE_FLIGHT
```

Concurrent permitted recovery callers observe one shared in-flight recovery
attempt. Only one Store reconstruction executes. Success returns the Engine to
ready; failure retains its fail-closed recovery-required/unavailable condition.

# Engine Runtime Lifecycle

The implementation must represent at least these semantic phases, using exact
names chosen by the Knowledge successor and runtime alignment:

```text
created
-> initializing
-> ready

ready
-> reconstruction-required
-> reconstructing
-> ready

ready
-> stopping
-> stopped

reconstruction-required
-> stopping
-> stopped
```

Initialization or reconstruction failure remains unavailable/fail-closed. A
failed reconstruction does not restore ready state. Mutation requires ready.
Exact state names remain an executable-alignment detail.

## Reconstruction-Required Read Policy

```text
RECONSTRUCTION_REQUIRED_READ_POLICY:
ALL_READY_GATED_OPERATIONS_PROHIBITED_EXCEPT_RECOVERY
```

While reconstruction is required, all normal ready-gated Knowledge operations
are prohibited. This includes mutation, retrieval, listing, projection, and
Source Currentness operations. Although immutable record bytes may remain in
memory, `getKnowledge` also reports lifecycle currency, listing depends on
current standing, and projection eligibility/currentness may have changed in
the ambiguous transaction. Serving those operations would risk presenting
stale lifecycle conclusions.

Only lifecycle inspection necessary to perform governed recovery and the
recovery operation itself may proceed. Projection-authority objects already
issued remain process-local historical objects, but the Engine does not issue
or verify them through a normal ready-gated operation until reconstruction
succeeds.

## Engine Mutation Concurrency

```text
ENGINE_MUTATION_CONCURRENCY_POLICY:
SERIALIZE_PER_ENGINE_INSTANCE_STORE_GOVERNS_CROSS_INSTANCE
```

One Knowledge Engine instance serializes acceptance evaluations that can mutate
Knowledge state from semantic validation through Store completion and the
corresponding cache update. Invocation order is the per-instance queue order.
This prevents overlapping awaited operations from validating one memory state
and applying results in an order different from durable acceptance order.

The serialization is process-local and is not a distributed lock. PostgreSQL's
expected-current transaction and uniqueness strategy remains the concurrency
authority across Engine instances. A cross-instance losing supersession is
handled through its governed Store result and does not update local memory.

## Mutation Admission and Caller Abandonment

```text
CALLER_ABANDONMENT_DOES_NOT_CANCEL_ADMITTED_MUTATION:
YES

MUTATION_ADMISSION_OWNERSHIP:
ENGINE_OWNS_TO_SETTLEMENT

MUTATION_CANCELLATION_MODEL:
NOT_SUPPORTED_AFTER_ADMISSION

QUEUED_MUTATION_OWNERSHIP:
ENGINE_OWNED_AFTER_ENQUEUE
```

A mutation becomes admitted after ready-state request admission and acceptance
into the Engine's serialized mutation queue. From enqueue onward, the Engine
owns it until known success, known failure, or ambiguous completion. The caller
controls whether it observes the returned Promise; it does not control the
admitted operation's lifecycle.

Stopping `await`, dropping the Promise, or ignoring its result does not cancel
Store execution, imply rollback, remove the operation from the queue, suppress
cache publication, or suppress transition to reconstruction-required. A known
success updates cache and indexes, a known failure leaves them unchanged, and
an ambiguous completion enters reconstruction-required exactly as if the caller
were still awaiting.

The first slice provides no caller cancellation after admission. A future
`AbortSignal` or cancellation contract requires separate governance.

```text
POST_AMBIGUOUS_QUEUED_MUTATION_POLICY:
DO_NOT_EXECUTE_REQUIRE_CALLER_REISSUE_AFTER_RECOVERY
```

If one mutation completes ambiguously, later queued mutations do not execute
against stale state. They complete as not executed/unavailable according to the
later Core alignment. Recovery must complete first, and callers must explicitly
reissue still-valid intent. The Engine does not replay queued mutations after
recovery.

Exact public result and error names for shutdown-suppressed or post-ambiguous
queued work are deferred to the major Knowledge successor. Caller abandonment
does not manufacture a cancellation outcome. Ambiguous completion may retain
the existing public unavailable-style mapping while the distinct internal
reconstruction-required state prevents unsafe continuation. Abandonment and
shutdown do not reinterpret the Store's success, known-failure, or ambiguous
classification.

## Initialization Concurrency

Initialization is single-flight. The first call from the created state enters
initializing. Concurrent callers observe the same in-flight initialization
completion rather than starting another reconstruction. A call after ready is
an invalid lifecycle call, preserving the existing one-time initialization
rule.

From reconstruction-required state, only the governed recovery entry may start
reconstruction. Concurrent recovery callers share one in-flight reconstruction.
Failure leaves the Engine fail-closed; success returns it to ready. Exact method
names are deferred to the Knowledge successor and executable alignment.

Initialization cannot begin while stopping or after stopped. The first slice
does not restart a stopped Engine in place.

```text
ENGINE_INSTANCE_RESTART_MODEL:
NEW_ENGINE_INSTANCE_AFTER_STOPPED

RECOVERY_AFTER_STOPPED:
CREATE_NEW_ENGINE_AND_INITIALIZE
```

## Cache Update Rules

- Successful independent acceptance adds the immutable record and updates
  confirmed/current/order indexes after Store success.
- Successful supersession retains the immutable predecessor, adds the immutable
  successor, and updates standing/order indexes after Store success.
- Known failed mutation changes no cache or reconstructed index.
- Ambiguous mutation makes no completion assumption and enters
  reconstruction-required.
- Reconstruction replaces the entire runtime cache and lifecycle indexes only
  after complete validation succeeds.

## Orderly Shutdown

```text
ORDERLY_SHUTDOWN_MODEL:
STOP_ADMISSION_THEN_SETTLE_ADMITTED_WORK

ORDERLY_SHUTDOWN_QUEUE_POLICY:
DRAIN_ALREADY_ADMITTED_QUEUE

KNOWLEDGE_ORDERLY_SHUTDOWN_ASYNC_REQUIRED:
YES

ORDERLY_SHUTDOWN_CONCURRENCY_MODEL:
SINGLE_FLIGHT

SHUTDOWN_WHILE_STOPPING:
JOIN_EXISTING_SHUTDOWN

SHUTDOWN_WHILE_STOPPED:
IDEMPOTENT_SUCCESS

SHUTDOWN_ADMISSION_SINGLE_WINNER:
YES
```

Orderly shutdown is an awaited Engine lifecycle operation. Exact method naming
is deferred. Entering stopping atomically prohibits admission of new
ready-gated reads, projections, mutations, and recovery requests. Mutations
already admitted into the serialized queue drain in queue order unless an
earlier admitted mutation completes ambiguously. A recovery already in flight
is also admitted work and shutdown waits for it.

Only one orderly-shutdown execution may exist per Knowledge Engine instance.
If callers race while shutdown may be admitted, exactly one atomically
establishes `ready -> stopping` or `reconstruction-required -> stopping` and
starts the governed shutdown work. Once stopping is established, no caller may
still observe ready and admit new work. Concurrent shutdown callers observe and
join the same logical in-flight shutdown completion; they do not start another
queue drain, Store-settlement pass, recovery wait, or lifecycle transition.
Exact Promise object identity is an implementation detail, but all joined
callers must observe the same semantic completion.

While reconstructing, the first shutdown caller establishes the single
in-flight shutdown that waits for the already admitted recovery. Concurrent
shutdown callers join it. Shutdown starts neither a second recovery nor a
second shutdown execution. From reconstruction-required with no recovery in
flight, the first shutdown caller establishes stopping without initiating
recovery, and concurrent shutdown callers join that shutdown.

An executing mutation settles as known success, known failure, or ambiguous
completion before shutdown reports completion. Success publishes its cache
change; known failure publishes none. Ambiguous completion preserves the
unknown durable outcome and stops the remaining queue. Remaining queued
requests complete as not executed/unavailable and are not replayed.
All callers joined to the shutdown observe the same terminal completion; they
do not drain or settle the queue independently.

```text
ORDERLY_SHUTDOWN_AMBIGUOUS_POLICY:
PRESERVE_UNKNOWN_DURABLE_STATE_AND_REQUIRE_NEXT_START_RECONSTRUCTION

SHUTDOWN_POST_AMBIGUOUS_QUEUE_POLICY:
STOP_QUEUE_DO_NOT_AUTO_RECOVER

SHUTDOWN_RECOVERY_POLICY:
WAIT_EXISTING_RECOVERY_DO_NOT_START_NEW_RECOVERY
```

Shutdown does not start recovery merely to terminate. If the Engine is already
reconstruction-required with no recovery in flight, it may proceed to stopping.
If recovery is in flight, shutdown waits for that shared attempt without forced
cancellation. If it fails, shutdown remains fail-closed and continues only once
no admitted operation can change durable or local state.

```text
ORDERLY_SHUTDOWN_COMPLETION_CONDITION:
NO_ADMITTED_OPERATION_CAN_STILL_CHANGE_STATE

SHUTDOWN_FAILURE_COMPLETION_RULE:
STOPPED_ONLY_AFTER_SETTLEMENT_PROVEN

STOPPED_SHUTDOWN_PROMISE_POLICY:
IMMEDIATE_RESOLVED_NOOP

SHUTDOWN_CALLER_ABANDONMENT:
DOES_NOT_CANCEL_SHUTDOWN
```

Orderly shutdown completes only after admission is closed, no Store mutation or
recovery is in flight, and no remaining admitted queue item will execute. It
does not claim that an ambiguous durable outcome was rolled back or resolved.

An admitted recovery or mutation outcome that still permits settlement to
stopped does not create a separate shutdown-specific semantic failure. If an
unexpected implementation failure prevents the Engine from proving that no
admitted operation can still change durable or local state, shutdown must not
report stopped: the shutdown completion fails and the Engine remains
fail-closed. Every caller joined to that single-flight shutdown observes the
same failed completion, and no joined caller automatically retries it. A later
explicit shutdown invocation may proceed only when the lifecycle rules permit.

If one shutdown caller stops awaiting or drops its Promise, the admitted
shutdown continues through settlement. Other joined callers continue observing
the shared logical completion, and no queue or recovery work is cancelled. The
Engine owns orderly shutdown from admission through settlement.

After stopped, a repeated shutdown invocation completes successfully and
immediately as an idempotent no-op. It performs no Store access, queue work,
recovery, lifecycle mutation, or resource creation and need not retain the
historical Promise object from the completed shutdown. This supports overlapping
Bootstrap or application cleanup paths because the Engine is already in the
requested terminal state and no Knowledge semantic outcome or durable-state
ambiguity is hidden. Idempotent shutdown does not make the Engine restartable:
read, projection, mutation, initialization, and recovery remain prohibited, and
a subsequent runtime requires a new Engine instance.

```text
ABRUPT_TERMINATION_RECOVERY:
NEXT_START_FULL_RECONSTRUCTION
```

Process crash, kill, power loss, or termination before orderly shutdown
completes is abrupt termination. No in-process settlement guarantee applies.
The next runtime creates a new Engine and performs full awaited initialization
from the authoritative Store.

## Lifecycle Gate Matrix

| State                   | Read/project | Mutation    | Recovery                  | Shutdown                                 |
| ----------------------- | ------------ | ----------- | ------------------------- | ---------------------------------------- |
| Created                 | Prohibited   | Prohibited  | Prohibited                | Lifecycle-valid no-work stop             |
| Initializing            | Prohibited   | Prohibited  | Prohibited                | Coordinate with in-flight initialization |
| Ready                   | Allowed      | Allowed     | Prohibited                | Start single-flight shutdown             |
| Reconstruction-required | Prohibited   | Prohibited  | Allowed                   | Start single-flight shutdown             |
| Reconstructing          | Prohibited   | Prohibited  | Shared in-flight recovery | Start/join shutdown; waits for recovery  |
| Stopping                | No new work  | No new work | No new recovery           | Join existing shutdown                   |
| Stopped                 | Prohibited   | Prohibited  | Prohibited                | Immediate idempotent success             |

Exact created-state shutdown result mechanics and error names are deferred to
the Knowledge successor, but they must not admit Store work. Initialization and
shutdown coordination must not expose readiness or report stopped while an
initialization Store operation remains capable of publishing state.

Concurrent shutdown while stopping creates no new lifecycle transition. A
shutdown invocation while stopped leaves the Engine stopped. No secondary
stopping state or repeated-stop state exists.

Engine ownership includes admission, its serialized mutation queue, recovery
lifecycle, cache publication, and graceful settlement. The Store owns durable
I/O outcomes and transaction-completion classification. The caller owns whether
it observes a Promise, not cancellation after admission.

```text
POSTGRESQL_ADAPTER_LIFECYCLE_OWNERSHIP:
NONE
```

The future PostgreSQL Adapter returns Promise-based Store outcomes, including
ambiguous completion, but never initiates recovery, governs orderly shutdown,
or manipulates the Engine queue. Caller abandonment and orderly shutdown remain
Engine concerns for the in-memory Store as well; its Promise alignment remains
mechanical and introduces no Store cancellation.

# In-Memory Reference Store

```text
IN_MEMORY_STORE_ASYNC_ALIGNMENT:
MECHANICAL_ONLY
```

`InMemoryKnowledgeStore` retains its current algorithms and semantic behavior.
It implements the unified Store port through immediately resolved Promises. It
does not become durable, artificially concurrent, or a second runtime model.

# Version and Specification Impact

```text
CORE_CONTRACT_VERSION_CLASS:
MAJOR

KNOWLEDGE_SPEC_SUCCESSOR_REQUIRED:
YES

KNOWLEDGE_SPEC_VERSION_CLASS:
MAJOR
```

Changing Store and acceptance capability returns to Promises is breaking for
TypeScript callers and implementers under OES-0010. A major Knowledge
specification successor must align:

- the Promise-based Store port;
- explicit awaited initialization;
- awaited acceptance and supersession;
- the explicit awaited recovery operation;
- awaited orderly shutdown and admitted-queue settlement;
- single-flight shutdown, stopping-state join, stopped-state idempotence, and
  shutdown-caller abandonment;
- caller-abandonment and post-ambiguous queue behavior;
- eager immutable-record reconstruction;
- the partial public asynchronous surface;
- ambiguous completion and reconstruction-required state; and
- synchronous post-initialization reads.

This ADR does not author or activate that successor.

# Bootstrap and Consumer Boundaries

## Bootstrap

```text
BOOTSTRAP_KNOWLEDGE_COMPOSITION:
AWAIT_READY_BEFORE_RETURN
```

Knowledge composition becomes asynchronous and returns only a fully initialized,
ready capability. Diagnostic composition and its CLI/callers await Knowledge
composition. Bootstrap transports readiness mechanics; it does not acquire
Knowledge semantic ownership.

```text
BOOTSTRAP_KNOWLEDGE_SHUTDOWN:
AWAIT_ENGINE_ORDERLY_SHUTDOWN_WHEN_OWNING_LIFECYCLE
```

Where Bootstrap owns an Engine lifecycle and provides graceful teardown, that
teardown awaits Knowledge orderly shutdown. No new teardown framework is
required where none exists; the major successor alignment must add the await at
each actual owning lifecycle seam.

```text
BOOTSTRAP_REPEATED_SHUTDOWN:
SAFE_IDEMPOTENT
```

If overlapping Bootstrap or application cleanup paths invoke shutdown
concurrently, they join the same in-flight completion. Later invocations after
stopped complete as immediate successful no-ops. Bootstrap continues to own
only lifecycle invocation mechanics and acquires no Knowledge semantic
authority.

## Context

```text
CONTEXT_RUNTIME_ASYNC_CHANGE:
NOT_REQUIRED
```

Context receives a fully initialized Knowledge capability. It may continue to
invoke `getKnowledge`, projection, projection verification, and memory-backed
Source Currentness-related operations synchronously. Context preparation,
authority, revision identity, incorporation, and currentness semantics do not
change.

## Reasoning, Planning, and Brain

```text
REASONING_ASYNC_CHANGE_REQUIRED:
NO

PLANNING_ASYNC_CHANGE_REQUIRED:
NO

BRAIN_ASYNC_CHANGE_REQUIRED:
NO
```

Reasoning continues to consume authoritative Context rather than the Knowledge
Store. Planning and current Brain semantic APIs remain unchanged. Future
orchestration may await a Knowledge-aware Bootstrap composition without
transferring Knowledge or Brain ownership.

# Source Currentness and Authority

Knowledge-owned Source Currentness remains a synchronous determination over
validated reconstructed memory. No new source I/O is introduced.

```text
PROJECTION_AUTHORITY_CHANGE:
NO

CONTEXT_AUTHORITY_CHANGE:
NO
```

Projection authority remains process-local, exact-object verification retains
its meaning, and restart issues fresh process-local authority. Awaiting Store
work transfers no semantic authority. Context authority is unchanged.

# Physical Store and Driver Preservation

```text
PHYSICAL_STORE_CHANGE:
NO

DATABASE_DRIVER:
PG

DATABASE_ACCESS_STYLE:
DIRECT_DRIVER
```

This decision changes no approved PostgreSQL physical choice, including:

- SCHEMA-0001;
- migration `0001` or its runner;
- runtime-role permissions;
- PostgreSQL version policy;
- private canonical ordering;
- opaque acceptance-order allocation; or
- transaction, locking, and one-winner strategy.

The blocker is the execution contract, not the selected driver.

# Prohibited Synchronous Facades

```text
SYNC_STORE_FACADE:
PROHIBITED
```

The architecture prohibits:

- `Atomics.wait` on the main thread;
- worker-backed synchronous Store facades;
- child-process or `spawnSync` database proxies;
- deasync or event-loop pumping;
- synchronous sidecar RPC wrappers; and
- any wrapper returning before PostgreSQL completion is known.

These approaches block or obscure completion, introduce an ungoverned transport
architecture, or undermine ambiguous-completion handling.

# Store Conformance

One conformance suite governs the Promise-based Store port. Tests await Store
operations and apply the same lifecycle semantics to `InMemoryKnowledgeStore`,
`PostgreSQLKnowledgeStore`, and future conforming implementations.

Product-specific tests remain additive only for physical behavior such as SQL
mapping, transaction concurrency, connection failure, and corruption detection.

# Restart Semantics

Restart remains:

```text
new process
-> new Engine and empty runtime cache
-> await initialize
-> reconstruct authoritative durable lifecycle and immutable records
-> issue fresh process-local projection authority
-> ready
```

No runtime cache or projection authority is persisted.

# Contract and Privacy Preservation

```text
CONTRACT_0001_CHANGE_REQUIRED:
NO

NEW_CONTRACT_ARTIFACT_REQUIRED:
NO
```

CONTRACT-0001 already preserves Context/source ownership across synchronous and
asynchronous execution. No CONTRACT-0002 is created.

Promise rejection and asynchronous execution introduce no new persisted data.
Credentials, database exceptions, SQL parameters, Knowledge payloads,
provenance, lifecycle internals, and source correspondence must not be exposed
through public errors or logs.

# Compatibility

Unaffected semantic consumers and meanings:

- Context runtime API;
- Reasoning, Planning, and Brain semantic APIs;
- accepted Knowledge and KnowledgeReference meaning;
- immutable history and lifecycle semantics;
- projection and Source Currentness semantics; and
- authority and failure ownership.

Breaking execution consumers:

- Knowledge Store implementers;
- acceptance-evaluation callers;
- Knowledge initialization callers;
- Knowledge recovery and orderly-shutdown callers;
- Bootstrap Knowledge composition and diagnostics; and
- tests and helpers invoking those paths.

# Alternatives Rejected

## Keep the Synchronous Store

Rejected because direct PostgreSQL I/O cannot complete synchronously without
blocking or hiding completion.

## Separate AsyncKnowledgeLifecycleStore

Rejected as the target architecture because it creates parallel Store and
Engine execution paths and risks divergent conformance.

## Union of Immediate and Promise Results

Rejected because `T | Promise<T>` leaves execution handling ambiguous for every
caller and does not establish one uniform port.

## Lazy Database Reads

Rejected for the first durable slice because initialization already loads every
record for lifecycle validation. Retaining those records bounds asynchrony and
avoids unnecessary Context propagation.

## Optimistic Engine Mutation

Rejected because Engine-visible success and memory changes must follow known
durable Store success.

## Automatic Retry After Ambiguous Completion

Rejected because retry could duplicate or incorrectly branch a transition that
already committed.

## Persist Projection Authority

Rejected because projection authority remains process-local and is not durable
Knowledge state.

# Consequences

Positive consequences:

- direct non-blocking `pg` integration becomes possible;
- COMMIT completion classes remain explicit;
- all Stores share one execution and conformance model;
- async propagation is limited to actual I/O and mutation boundaries;
- Context, Reasoning, Planning, and Brain semantic APIs remain stable;
- restart reconstruction remains authoritative; and
- future durable Stores can implement the same port.

Costs and required work:

- a major Core contract alignment;
- a major Knowledge specification successor;
- awaited Knowledge initialization and mutation callers;
- an explicit awaited recovery and orderly-shutdown boundary;
- asynchronous Bootstrap Knowledge composition;
- Engine mutation serialization, caller-abandonment, queue-drain, shutdown, and
  recovery-state implementation; and
- updates to conformance tests and affected helpers.

# Scope Boundary

This ADR governs only the Knowledge durable Store execution boundary, eager
runtime reconstruction, and ambiguous-completion recovery. It does not activate
a Knowledge successor, change Core or runtime code, implement an Adapter, select
a provider, route production traffic, or change physical Store artifacts.

PostgreSQL Adapter implementation remains blocked until this ADR is independently
reviewed and activated, the major Knowledge successor is approved, and Core,
runtime, in-memory Store, Bootstrap, and tests conform.

```text
POSTGRESQL_ADAPTER_IMPLEMENTATION_READY:
NO
```

# Required Follow-Up

1. Conduct independent review of this Draft ADR.
2. Activate the ADR only after approval.
3. Draft the major Knowledge specification successor.
4. Conduct independent review and activation of that successor.
5. Align the Core Promise-based Store and acceptance capability contracts.
6. Align Knowledge Engine lifecycle recovery, mutation admission, orderly
   shutdown, and `InMemoryKnowledgeStore`.
7. Propagate awaited Knowledge composition, mutation, recovery, and graceful
   shutdown calls through Bootstrap and affected tests.
8. Conduct independent async-boundary conformance review.
9. Resume `PostgreSQLKnowledgeStore` implementation.

# Dependencies

- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0024 — Durable Knowledge Physical Store Architecture](ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md)
- [ADR-0025 — Knowledge Store Database Product Selection](ADR-0025-Knowledge-Store-Database-Product-Selection.md)
- [ADR-0017 — Execution-Model Independence for Asynchronous, Event-Driven, and Distributed Collaboration](ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [Knowledge Engine 2.0.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)
- [CONTRACT-0001 — Context Source Retrieval](../contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [OES-0007 — Adapter Design](../engineering/OES-0007-Adapter-Design.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Future Review

Review this decision if the Knowledge runtime can no longer eagerly reconstruct
its complete immutable accepted-record set, if normal read operations require
new Store I/O, if recovery needs a distributed coordination protocol, or if a
future execution model cannot preserve the same semantic Store port.

# Change History

| Version | Date       | Description                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-23 | Drafted asynchronous Knowledge Store execution and ambiguous recovery model. |
| 1.0.0   | 2026-08-23 | Approved architectural decision.                                             |

# Engineering Motto

> Await durability without allowing execution timing to redefine Knowledge.
