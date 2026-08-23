# ENGINE-0005 — Knowledge Engine Revision

| Field          | Value                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Status**     | Active                                                                                                |
| **Supersedes** | 2.0.0                                                                                                 |
| **Version**    | 3.0.0                                                                                                 |
| **Owner**      | Project Maintainers                                                                                   |
| **Created**    | 2026-08-23                                                                                            |
| **Updated**    | 2026-08-23                                                                                            |
| **Applies To** | Knowledge Store execution, durable reconstruction, mutation recovery, and Engine lifecycle settlement |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0005
revision. It supersedes Knowledge Engine 2.0.0, which remains historical and
non-authoritative.

Active ADR-0026 is the primary authority for the execution and lifecycle model.
ADR-0023 governs durable Knowledge lifecycle semantics, ADR-0024 governs the
physical Store architecture, and ADR-0025 governs PostgreSQL product selection.
Applicable active ADRs, Concepts, Contracts, and Engineering Standards prevail
in a conflict.

```text
VERSION_CLASS:
MAJOR
```

The major classification is required because Store results change from `T` to
`Promise<T>`, initialization and mutation become awaited, recovery and awaited
shutdown are added, lifecycle states expand, and caller execution contracts
change. Accepted-record, reference, projection, currentness, and authority
meaning do not intentionally change.

## Purpose

Knowledge Engine 3.0.0 aligns the durable Knowledge boundary with non-blocking
Store execution. It preserves the Knowledge semantics established by 2.0.0
while governing asynchronous initialization, durable mutation settlement,
ambiguous-completion recovery, serialized mutation admission, and orderly
shutdown.

## Knowledge Ownership

Knowledge Engine remains the sole semantic owner of claim acceptance,
Knowledge validation, identity and version meaning, contradiction and
supersession meaning, lifecycle standing, acceptance-order meaning, Source
Currentness, references, projections, and projection authority.

The Store supplies durable I/O and transaction-outcome classification. An
adapter mechanically realizes the Store port. Bootstrap invokes lifecycle
operations where it owns composition. None acquires Knowledge semantics.

## Store Execution Model

```text
KNOWLEDGE_STORE_EXECUTION_MODEL:
PROMISE_BASED_UNIFIED_PORT
```

Every governed Knowledge Store implementation exposes one Promise-returning
port. No synchronous alternative port and no `T | Promise<T>` union is allowed.
The governed operations are equivalent to:

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

Legacy-compatible `put` may remain only where later Core alignment retains it;
it is not the durable acceptance boundary. The unified execution model applies
to `InMemoryKnowledgeStore`, `PostgreSQLKnowledgeStore`, and future Stores.
Exact Core syntax and discriminant names belong to Core alignment.

## Construction and Initialization

Construction performs no Store I/O and produces a CREATED Engine that is not
ready.

```text
KNOWLEDGE_INITIALIZATION_MODEL:
EXPLICIT_AWAITED_INITIALIZATION
```

Initialization is an explicit asynchronous lifecycle operation:

```text
CREATED
-> initialize admitted
-> INITIALIZING
-> await lifecycle snapshot
-> await every required immutable record
-> validate complete lifecycle and record correspondence
-> construct complete replacement runtime state
-> atomically publish runtime state
-> READY
```

No ready-gated operation may succeed before publication. Initialization does
not silently substitute an empty Store when loading, correspondence, or
validation fails. Failure publishes no partial state, does not enter READY, and
enters FAILED_INITIALIZATION.

```text
INITIALIZATION_FAILURE_TRANSITION:
INITIALIZING_TO_FAILED_INITIALIZATION

FAILED_INITIALIZATION_RETRY:
NEW_ENGINE_REQUIRED
```

FAILED_INITIALIZATION is fail-closed: reads, projections, mutations, recovery,
and another initialization attempt are prohibited. No automatic or explicit
same-instance initialization retry exists. Orderly shutdown remains permitted
as cleanup after no admitted initialization work can still publish state. Future
operation requires stopping/discarding that instance, creating a new Engine,
and initializing it from the authoritative Store.

Initialization is single-flight. Exactly one attempt executes per Engine
instance; concurrent callers during INITIALIZING share its logical completion.
Initialization after READY, while STOPPING, or after STOPPED is invalid. A
stopped Engine is never restarted in place.

Initialization remains Engine-owned admitted lifecycle work if its caller stops
awaiting. Caller abandonment does not cancel Store reads or reconstruction.

```text
SHUTDOWN_DURING_INITIALIZING:
WAIT_INITIALIZATION_THEN_STOP
```

If shutdown is requested during INITIALIZING, it becomes the single admitted
shutdown, closes admission of new ready work, does not cancel initialization,
and waits for initialization to settle. Successful reconstruction is not
exposed as an externally operational READY interval; the Engine proceeds
directly to STOPPING and STOPPED. Failed initialization enters
FAILED_INITIALIZATION and then proceeds through STOPPING to STOPPED when
settlement is proven.

## Eager Reconstruction and Runtime Cache

```text
DURABLE_KNOWLEDGE_RUNTIME_MODEL:
EAGER_RECONSTRUCTION
```

Initialization and recovery reconstruct all durable state needed for normal
execution, including:

- immutable accepted Knowledge records;
- current and superseded standing;
- predecessor relationships and version adjacency;
- acceptance ordering;
- confirmed and current indexes and references; and
- internal operands needed by projection and Source Currentness.

The reconstructed cache is process-local, non-durable, derived from the
authoritative Store, and owned operationally by the Engine. It is atomically
published or replaced only after complete validation. It is not a second Store,
a durable authority, or a separate semantic source of Knowledge.

## Ready-State Reads

```text
POST_INITIALIZATION_READ_MODEL:
SYNCHRONOUS_MEMORY_BACKED
```

While READY, normal reads perform no Store I/O. The following remain
synchronous over validated reconstructed memory:

- `getKnowledge`;
- `listKnowledgeReferences`;
- structured Knowledge projection;
- Source Currentness evaluation;
- projection-authority capture and verification.

Their existing semantic result and failure meanings are preserved. Lifecycle
gating may still fail them when the Engine is not READY.

## Awaited Mutations

```text
KNOWLEDGE_MUTATION_MODEL:
AWAIT_DURABLE_STORE_BEFORE_ENGINE_STATE_CHANGE
```

Independent acceptance and supersession are asynchronous. Successful
caller-visible completion follows this order:

```text
structural pre-enqueue request validation
-> verify mutation admission is allowed
-> enqueue and admit operation
-> dequeue inside serialized pipeline
-> lifecycle execution recheck
-> state-dependent Knowledge semantic validation
-> construct or confirm Store request
-> await atomic Store operation
-> validate Store result
-> update Engine cache and indexes
-> settle operation
-> allow next queued operation to begin state-dependent validation
```

The Engine never publishes identity confirmation, lifecycle standing,
acceptance order, immutable records, or current indexes before known durable
success. A known pre-commit failure changes no runtime state and leaves the
Engine READY when its lifecycle is otherwise valid. Existing Knowledge failure
mapping applies.

## Mutation Completion Model

```text
MUTATION_COMPLETION_MODEL:
SUCCESS_KNOWN_FAILURE_AMBIGUOUS
```

- **Success:** durable commit is known to have completed.
- **Known failure:** the Store knows the transition did not commit.
- **Ambiguous:** commit may or may not have completed and local execution cannot
  establish which occurred.

Ambiguity permits neither retry nor rollback assumption. It is not partial
durable state: the Store transition remains atomic, but its outcome is unknown
to the Engine.

```text
AMBIGUOUS_COMPLETION_ENGINE_STATE:
RECONSTRUCTION_REQUIRED
```

After ambiguity, the Engine performs no optimistic publication, exits READY,
fails normal operations closed, and requires authoritative reconstruction. It
does not retry the mutation automatically.

## Mutation Serialization and Cross-Instance Concurrency

```text
ENGINE_MUTATION_CONCURRENCY_POLICY:
SERIALIZE_PER_ENGINE_INSTANCE_STORE_GOVERNS_CROSS_INSTANCE
```

Each Engine instance serializes the governed pipeline from request admission
and semantic validation through Store completion, result validation, and cache
publication. No two admitted mutations update one Engine's runtime state
concurrently. Queue order is the per-instance invocation order.

```text
PRE_ENQUEUE_VALIDATION:
STRUCTURAL_ONLY

STATE_DEPENDENT_MUTATION_VALIDATION:
INSIDE_SERIALIZED_CRITICAL_SECTION

SERIALIZED_MUTATION_PIPELINE:
DEQUEUE_LIFECYCLE_RECHECK_STATE_VALIDATION_STORE_RESULT_PUBLICATION_SETTLEMENT
```

Pre-enqueue validation may check only request structure, discriminants,
immutable bounded-value construction, and unsupported operation shape. It must
not decide current standing, predecessor or successor state, duplicate identity
against Engine state, lifecycle graph meaning, indexes, references, or any
condition that can change while the request waits in the queue.

After dequeue, and before Store invocation, the serialized critical section
rechecks whether execution remains permitted and performs every state-dependent
Knowledge validation against the latest published Engine state. This includes
duplicate-identity checks, predecessor currentness and standing, supersession
eligibility, version/predecessor semantics, and every decision that an earlier
queued mutation can change. Cache/index publication or failure/ambiguity
classification for one item completes before the next item's state-dependent
validation begins.

The lifecycle recheck permits execution while READY and also permits an item
admitted before STOPPING to execute only through the governed orderly-shutdown
drain. If an earlier mutation caused RECONSTRUCTION_REQUIRED, ambiguity stopped
the shutdown drain, or another state prohibits execution, the item invokes no
Store operation, is not replayed automatically, and settles through the
governed not-executed/unavailable behavior. A caller may reissue intent only
when a later lifecycle state permits new admission.

The Store and database remain the concurrency authority across Engine
instances. Expected-current and uniqueness semantics decide cross-instance
competition. No distributed Engine mutex, process-wide global Knowledge lock,
or distributed lock is introduced.

## Mutation Admission and Caller Abandonment

A mutation is admitted only after structural pre-validation, verification that
new mutation admission is currently allowed, and successful enqueue into the
serialized Engine mutation pipeline. A request rejected before enqueue is not
admitted. At enqueue, the Engine acquires ownership to settlement; mutable-state
semantic validation intentionally follows dequeue inside serialization.

```text
MUTATION_ADMISSION_OWNERSHIP:
ENGINE_OWNS_TO_SETTLEMENT

CALLER_ABANDONMENT_DOES_NOT_CANCEL_ADMITTED_MUTATION:
YES

MUTATION_CANCELLATION_MODEL:
NOT_SUPPORTED_AFTER_ADMISSION

QUEUED_MUTATION_OWNERSHIP:
ENGINE_OWNED_AFTER_ENQUEUE
```

After enqueue, the Engine owns the operation through success, known failure, or
ambiguity. Stopping `await`, dropping the Promise, or ignoring its result does
not cancel Store work, imply rollback, dequeue the operation, suppress a known
success cache update, or suppress transition to RECONSTRUCTION_REQUIRED.

This revision provides no `AbortSignal` or post-admission cancellation.
Cancellation requires separate governance.

```text
POST_AMBIGUOUS_QUEUED_MUTATION_POLICY:
DO_NOT_EXECUTE_REQUIRE_CALLER_REISSUE_AFTER_RECOVERY
```

When an admitted mutation completes ambiguously, later queued mutations do not
execute, are not replayed after recovery, and complete as governed not-executed
or unavailable outcomes. Callers must reissue still-valid intent after recovery.

## Recovery

```text
RECOVERY_SEMANTIC_OWNER:
KNOWLEDGE_ENGINE

RECOVERY_ENTRYPOINT_MODEL:
EXPLICIT_AWAITED_ENGINE_OPERATION

RECOVERY_INVOCATION_BOUNDARY:
OWNING_RUNTIME_CALLER_TO_KNOWLEDGE_ENGINE

RECOVERY_CONCURRENCY_MODEL:
SINGLE_FLIGHT
```

Recovery is an explicit awaited Engine lifecycle operation permitted only from
RECONSTRUCTION_REQUIRED. Its exact API name is deferred, but its semantics are
not.

An owning application/runtime workflow, controlled operational lifecycle
orchestration, or Bootstrap when actually owning lifecycle invocation may
request recovery. Context, Reasoning, Planning, Brain, Store, and adapter are
not recovery semantic callers. The caller requests recovery; Knowledge Engine
owns and performs it.

```text
RECONSTRUCTION_REQUIRED
-> recovery admitted
-> RECONSTRUCTING
-> await authoritative lifecycle snapshot
-> await required immutable records
-> validate complete replacement state
-> atomically publish replacement state
-> READY
```

Failure publishes no partial replacement, does not enter READY, and remains
fail-closed. It deterministically returns to RECONSTRUCTION_REQUIRED, where
stale prior cache state remains non-authoritative and unusable.

```text
RECOVERY_FAILURE_TRANSITION:
RECONSTRUCTING_TO_RECONSTRUCTION_REQUIRED

RECOVERY_RETRY_POLICY:
EXPLICIT_RETRY_PERMITTED_FROM_RECONSTRUCTION_REQUIRED

RECOVERY_FAILURE_WITH_PENDING_SHUTDOWN:
PROCEED_TO_STOP_WITHOUT_NEW_RECOVERY
```

An owning runtime caller may explicitly request another single-flight recovery
attempt from RECONSTRUCTION_REQUIRED; no automatic retry occurs. If shutdown
was already admitted during the failed recovery, it waits for failure
completion, proceeds from RECONSTRUCTION_REQUIRED to STOPPING without starting
another recovery, and reports STOPPED only after settlement is proven.
Concurrent permitted recovery callers share exactly one logical reconstruction
completion, one Store reload, and one publication attempt. Recovery never
retries the ambiguous mutation.

## Reconstruction-Required Gate

```text
RECONSTRUCTION_REQUIRED_READ_POLICY:
ALL_READY_GATED_OPERATIONS_PROHIBITED_EXCEPT_RECOVERY
```

While reconstruction is required, get, list, projection, currentness,
projection-authority verification, mutation, and other normal READY operations
are prohibited. Only explicit recovery, required lifecycle inspection, and
orderly shutdown according to its gate may proceed. Cached bytes do not justify
serving potentially stale lifecycle conclusions.

## Orderly Shutdown

```text
KNOWLEDGE_ORDERLY_SHUTDOWN_ASYNC_REQUIRED:
YES

ORDERLY_SHUTDOWN_MODEL:
STOP_ADMISSION_THEN_SETTLE_ADMITTED_WORK

ORDERLY_SHUTDOWN_CONCURRENCY_MODEL:
SINGLE_FLIGHT

SHUTDOWN_ADMISSION_SINGLE_WINNER:
YES
```

Orderly shutdown is awaited. Exactly one caller atomically establishes STOPPING
from an eligible state and starts the single shutdown execution. Entry into
STOPPING closes admission of new reads, projections, mutations, initialization,
and recovery. Concurrent callers share the same logical completion and do not
start another drain, settlement pass, recovery wait, or transition.

```text
SHUTDOWN_WHILE_STOPPING:
JOIN_EXISTING_SHUTDOWN

SHUTDOWN_WHILE_STOPPED:
IDEMPOTENT_SUCCESS

STOPPED_SHUTDOWN_PROMISE_POLICY:
IMMEDIATE_RESOLVED_NOOP
```

A call during STOPPING joins the existing shutdown. A call after STOPPED
returns an immediate successful asynchronous no-op without Store access, queue
work, recovery, resource creation, or lifecycle mutation. Historical Promise
identity need not be retained. Idempotent shutdown does not permit restart,
recovery, reads, projections, or mutations.

```text
ORDERLY_SHUTDOWN_QUEUE_POLICY:
DRAIN_ALREADY_ADMITTED_QUEUE
```

Already admitted mutations drain exactly once in queue order. Known success
publishes required memory state before settlement; known failure publishes
none.

```text
SHUTDOWN_POST_AMBIGUOUS_QUEUE_POLICY:
STOP_QUEUE_DO_NOT_AUTO_RECOVER
```

Ambiguity stops later queued execution. The remainder is not replayed, shutdown
does not initiate recovery, and the unknown durable outcome is preserved for
the next authoritative reconstruction.

```text
SHUTDOWN_RECOVERY_POLICY:
WAIT_EXISTING_RECOVERY_DO_NOT_START_NEW_RECOVERY
```

Recovery admitted before STOPPING is admitted work and shutdown waits for it.
If STOPPING wins admission, a new recovery is rejected. Additional shutdown
callers only join the single shutdown.

```text
ORDERLY_SHUTDOWN_COMPLETION_CONDITION:
NO_ADMITTED_OPERATION_CAN_STILL_CHANGE_STATE

SHUTDOWN_FAILURE_COMPLETION_RULE:
STOPPED_ONLY_AFTER_SETTLEMENT_PROVEN

SHUTDOWN_CALLER_ABANDONMENT:
DOES_NOT_CANCEL_SHUTDOWN
```

STOPPED is reported only after no Store mutation, recovery, cache publication,
or executable admitted queue item can still alter durable or local state. It
does not assert that an historical ambiguous durable outcome was resolved.

If settlement cannot be proven, shutdown fails, does not report STOPPED, and
transitions from STOPPING to terminal FAILED_SHUTDOWN.

```text
SHUTDOWN_FAILURE_TRANSITION:
STOPPING_TO_FAILED_SHUTDOWN

POST_SHUTDOWN_FAILURE_ENGINE_POLICY:
DISPOSE_AND_CREATE_NEW_ENGINE

SHUTDOWN_AFTER_SETTLEMENT_FAILURE:
FAIL_CLOSED_NO_RETRY
```

FAILED_SHUTDOWN reports neither STOPPED nor successful settlement. Reads,
projections, mutations, recovery, initialization, and every other semantic
operation are prohibited. A later shutdown invocation returns the same
fail-closed shutdown failure or equivalent lifecycle failure; it neither joins
new settlement work nor retries automatically. The owning runtime must dispose
the terminal instance. Authoritative continuation requires a new Engine and
full initialization.

All callers joined before failure observe the same failed logical completion.
Dropping one caller's Promise does not cancel shutdown or admitted
mutation/recovery work, and other joined callers continue observing completion.

## Abrupt Termination and Restart

```text
ABRUPT_TERMINATION_RECOVERY:
NEXT_START_FULL_RECONSTRUCTION

ENGINE_INSTANCE_RESTART_MODEL:
NEW_ENGINE_INSTANCE_AFTER_STOPPED

RECOVERY_AFTER_STOPPED:
CREATE_NEW_ENGINE_AND_INITIALIZE
```

Crash, kill, power loss, or forced termination receives no in-process orderly
settlement guarantee. The next runtime creates a new Engine and performs full
awaited reconstruction. A stopped instance is never restarted or recovered in
place.

## Lifecycle State Model

The implementation must represent these conceptual states or exact semantic
equivalents:

- CREATED;
- INITIALIZING;
- READY;
- RECONSTRUCTION_REQUIRED;
- RECONSTRUCTING;
- STOPPING;
- STOPPED;
- FAILED_INITIALIZATION; and
- FAILED_SHUTDOWN.

```text
FAIL_CLOSED_LIFECYCLE_STATE:
FAILED_INITIALIZATION_AND_FAILED_SHUTDOWN
```

Exact implementation enum names may differ, but the two failure causes and
their distinct gates are normative. Recovery failure requires no separate
failure state because it returns to RECONSTRUCTION_REQUIRED.

Required transitions are:

```text
CREATED -> INITIALIZING -> READY
CREATED -> INITIALIZING -> FAILED_INITIALIZATION
READY -> RECONSTRUCTION_REQUIRED
RECONSTRUCTION_REQUIRED -> RECONSTRUCTING -> READY
RECONSTRUCTION_REQUIRED -> RECONSTRUCTING -> RECONSTRUCTION_REQUIRED
READY -> STOPPING -> STOPPED
RECONSTRUCTION_REQUIRED -> STOPPING -> STOPPED
RECONSTRUCTING -> settle recovery -> STOPPING -> STOPPED
INITIALIZING + shutdown -> settle initialization -> STOPPING -> STOPPED
FAILED_INITIALIZATION -> STOPPING -> STOPPED
STOPPING -> FAILED_SHUTDOWN when settlement cannot be proven
STOPPING + shutdown -> STOPPING
STOPPED + shutdown -> STOPPED
FAILED_SHUTDOWN + shutdown -> FAILED_SHUTDOWN with fail-closed failure
```

Failed initialization or reconstruction never transitions to READY. Shutdown
already admitted during initialization or reconstruction waits for that work to
settle before proceeding. Successful initialization under pending shutdown does
not admit an externally operational READY interval.

## Lifecycle Gate Matrix

| State                   | Read/project | Mutation                         | Recovery                | Shutdown                                            |
| ----------------------- | ------------ | -------------------------------- | ----------------------- | --------------------------------------------------- |
| CREATED                 | Prohibited   | Prohibited                       | Prohibited              | Start single-flight no-work shutdown                |
| INITIALIZING            | Prohibited   | Prohibited                       | Prohibited              | Start/join shutdown; wait initialization, then stop |
| READY                   | Allowed      | Admit and execute serially       | Prohibited              | Start single-flight shutdown                        |
| RECONSTRUCTION_REQUIRED | Prohibited   | Prohibited                       | Start single-flight     | Start single-flight shutdown without recovery       |
| RECONSTRUCTING          | Prohibited   | Prohibited                       | Join in-flight recovery | Start/join shutdown; wait recovery, then stop       |
| STOPPING                | Prohibited   | No new admission; drain admitted | Prohibited              | Join existing shutdown                              |
| STOPPED                 | Prohibited   | Prohibited                       | Prohibited              | Immediate idempotent successful no-op               |
| FAILED_INITIALIZATION   | Prohibited   | Prohibited                       | Prohibited              | Start cleanup shutdown; transition through STOPPING |
| FAILED_SHUTDOWN         | Prohibited   | Prohibited                       | Prohibited              | Return fail-closed failure; no settlement retry     |

Initialization failure cannot become recovery or empty initialization.
FAILED_INITIALIZATION permits cleanup shutdown but no initialization retry.
FAILED_SHUTDOWN is terminal and permits no new settlement attempt. Recovery is
legal only from RECONSTRUCTION_REQUIRED.

## Store Failure Model

Expected Store outcomes resolve through Promise result unions. Promise
rejection is not a normal domain outcome.

For mutation, an adapter-proven rejection before any possible commit may follow
the known-failure path. If the adapter cannot prove that no commit could have
occurred, rejection is conservatively ambiguous. PostgreSQL error codes, driver
objects, and SQL details do not enter the Engine specification or Core.

Existing public Knowledge failure vocabulary remains preferred. Internal
ambiguity may map outward to an existing unavailable-style failure only when
that public identity does not claim definite non-commit. Public mapping never
erases the internal RECONSTRUCTION_REQUIRED state.

## In-Memory Store Compatibility

```text
IN_MEMORY_STORE_ASYNC_ALIGNMENT:
MECHANICAL_ONLY
```

`InMemoryKnowledgeStore` retains its algorithms and semantics and satisfies the
unified Store port through immediately resolved Promises. It does not gain
artificial durability, ambiguous behavior, parallel execution, or a second
runtime model.

## PostgreSQL Store Relationship

The future `PostgreSQLKnowledgeStore` implements the unified Promise port and
classifies known success, known failure, and ambiguous completion. It does not
initiate Engine recovery, own Engine lifecycle or shutdown, manipulate the
mutation queue, decide Knowledge meaning, or auto-migrate. SQL mapping,
connection handling, and other adapter internals remain deferred.

```text
POSTGRESQL_ADAPTER_LIFECYCLE_OWNERSHIP:
NONE
```

## Public Async Surface

```text
PUBLIC_KNOWLEDGE_ASYNC_SURFACE:
PARTIAL_INITIALIZE_MUTATE_RECOVER_SHUTDOWN
```

The following operations are asynchronous:

- initialize;
- `evaluateKnowledgeClaim`, because it can durably accept an independent claim
  or durably supersede current Knowledge;
- explicit recovery; and
- orderly shutdown.

Core alignment must therefore make the future `EvaluateKnowledgeClaim` shape
equivalent to:

```text
evaluateKnowledgeClaim(request)
  -> Promise<KnowledgeAcceptanceDecision>
```

Supersession occurs through that same evaluation capability in the current
public model and receives the same awaited boundary. If a later separately
named supersession capability is introduced, it must also be Promise-returning.

While READY, `GetKnowledge`, `ListKnowledgeReferences`, structured projection,
Source Currentness, and projection-authority verification remain synchronous
and perform no per-call Store lookup.

## Bootstrap Relationship

```text
BOOTSTRAP_KNOWLEDGE_COMPOSITION:
AWAIT_READY_BEFORE_RETURN

BOOTSTRAP_KNOWLEDGE_SHUTDOWN:
AWAIT_ENGINE_ORDERLY_SHUTDOWN_WHEN_OWNING_LIFECYCLE

BOOTSTRAP_REPEATED_SHUTDOWN:
SAFE_IDEMPOTENT
```

Bootstrap must await initialization before exposing a ready Knowledge
capability. At an actual owning teardown seam it awaits orderly shutdown.
Overlapping teardown calls rely on Engine single-flight and STOPPED idempotence.
Bootstrap transports lifecycle mechanics and gains no Knowledge semantic
ownership.

## Downstream Boundaries

```text
CONTEXT_RUNTIME_ASYNC_CHANGE:
NOT_REQUIRED

REASONING_ASYNC_CHANGE_REQUIRED:
NO

PLANNING_ASYNC_CHANGE_REQUIRED:
NO

BRAIN_ASYNC_CHANGE_REQUIRED:
NO
```

Context receives a successfully initialized ready capability and continues to
use synchronous memory-backed Knowledge retrieval, projection, verification,
and currentness. Reasoning consumes authoritative Context. Planning and Brain
retain their existing semantic APIs. None initiates Knowledge recovery or owns
Knowledge lifecycle settlement.

## Source Currentness and Authority

Knowledge-owned Source Currentness remains synchronous over validated READY
memory and performs no Store I/O.

```text
PROJECTION_AUTHORITY_CHANGE:
NO

CONTEXT_AUTHORITY_CHANGE:
NO
```

Projection authority remains exact-object, process-local, and non-persisted.
Reconstruction issues fresh runtime authority as applicable. Context authority,
revision identity, incorporation, and currentness meaning remain unchanged.

## Physical Store Preservation

```text
PHYSICAL_STORE_CHANGE:
NO

DATABASE_DRIVER:
PG

DATABASE_ACCESS_STYLE:
DIRECT_DRIVER
```

This specification changes no PostgreSQL product, `pg` driver, SCHEMA-0001,
migration `0001`, migration runner, runtime role, transaction model,
acceptance-order representation or allocator, private canonical ordering, or
one-winner concurrency strategy.

```text
SYNC_STORE_FACADE:
PROHIBITED
```

Prohibited mechanisms include `Atomics.wait`, deasync/event-loop pumping,
blocking Worker facades, synchronous database child-process proxies,
`spawnSync` database execution, synchronous sidecar RPC, and any wrapper that
returns before PostgreSQL completion is known.

## Contract Preservation

```text
CONTRACT_0001_CHANGE_REQUIRED:
NO

NEW_CONTRACT_ARTIFACT_REQUIRED:
NO
```

CONTRACT-0001 already preserves Context/source collaboration across execution
models. No CONTRACT-0002 or other cross-engine Contract is introduced.

## Privacy

Existing Knowledge privacy classifications remain authoritative. Public errors,
results, and logs must not expose credentials, connection details, unnecessary
PostgreSQL or SQL errors, SQL parameters, protected provenance or evidence,
Knowledge payloads beyond their governed surface, Context state, Reasoning
state, lifecycle internals, or projection-authority internals.

Asynchrony, Promise rejection, recovery, and shutdown create no new persisted
user data.

## Compatibility

Knowledge semantic compatibility is preserved for:

- KnowledgeIdentity and KnowledgeVersion meaning;
- immutable KnowledgeRecord meaning;
- KnowledgeReference meaning;
- structured propositions;
- current and superseded standing;
- projection and Source Currentness meaning;
- projection authority; and
- existing public Knowledge failure identities where compatible.

```text
KNOWLEDGE_STORE_IMPLEMENTER_COMPATIBILITY:
BREAKING
```

Breaking callers and implementers include all Store implementations,
`EvaluateKnowledgeClaim` callers, initialization callers, recovery callers,
shutdown callers, Bootstrap Knowledge composition, and affected tests/helpers.

Compatible semantic consumers include READY `GetKnowledge`,
`ListKnowledgeReferences`, projection, currentness, Context, Reasoning,
Planning, and Brain callers. Lifecycle unavailability remains observable when
the Engine is not READY.

## Conformance Requirements

One Promise-aware Store conformance suite applies to
`InMemoryKnowledgeStore`, `PostgreSQLKnowledgeStore`, and future Stores.
Store-specific tests may add physical SQL mapping, transaction competition,
connection failure, corruption, and ambiguous-completion cases without changing
the shared semantic suite.

Runtime conformance must cover:

- initialization single-flight and failure atomicity;
- initialization failure entering FAILED_INITIALIZATION, blocking normal work
  and retry, and permitting cleanup shutdown;
- shutdown during initialization waiting for success or failure, admitting no
  transient READY work, and converging to STOPPED when settlement is proven;
- eager reconstruction and synchronous READY reads;
- mutation serialization and durable-before-memory publication;
- two admitted mutations proving the second performs state-dependent validation
  only after the first publishes its cache change;
- an ambiguous first mutation preventing the second from invoking the Store;
- STOPPING preventing new mutation enqueue while draining the admitted queue;
- caller abandonment;
- known failure and ambiguous completion;
- RECONSTRUCTION_REQUIRED gating;
- recovery single-flight and atomic replacement;
- recovery failure returning to RECONSTRUCTION_REQUIRED without publication,
  permitting explicit later recovery, and never retrying automatically;
- post-ambiguous queue suppression and caller reissue;
- orderly queue drain;
- concurrent shutdown and STOPPING join;
- STOPPED idempotence;
- shutdown caller abandonment and failure propagation;
- shutdown settlement failure withholding STOPPED, entering terminal
  FAILED_SHUTDOWN, prohibiting retry, and requiring a new Engine;
- mutation/shutdown and recovery/shutdown races; and
- abrupt-termination next-start reconstruction.

## Deferred Scope

This revision does not define or implement:

- mutation cancellation or `AbortSignal` semantics;
- lazy Store reads or bounded cache eviction;
- multi-process Engine coordination beyond Store concurrency semantics;
- PostgreSQL adapter internals;
- provider selection or production routing;
- distributed Engine locks;
- idempotency tokens;
- persisted projection authority;
- application audit/history; or
- a new Contract artifact.

## Migration from Knowledge 2.0.0

Knowledge 3.0.0 supersedes Knowledge 2.0.0, which remains historical and
non-authoritative.

The conceptual implementation migration is:

1. align the Core Store port and mutation capability to Promises;
2. mechanically align `InMemoryKnowledgeStore`;
3. implement the asynchronous Engine lifecycle, mutation queue, and recovery;
4. preserve eager reconstruction and synchronous READY reads;
5. propagate initialization, mutation, recovery, and shutdown awaits through
   actual Bootstrap/caller seams;
6. verify Context and downstream containment;
7. conduct Promise Store and runtime conformance review; and
8. resume `PostgreSQLKnowledgeStore` implementation.

Activation creates authority for the governed Core async alignment sequence. It
does not implement or authorize runtime or PostgreSQL adapter work ahead of the
readiness gates below.

## Readiness

```text
KNOW30_CORE_ASYNC_DESIGN_READY:
YES

KNOW30_RUNTIME_IMPLEMENTATION_READY:
NO

POSTGRESQL_ADAPTER_IMPLEMENTATION_READY:
NO
```

The specification closes the design inputs needed for subsequent Core
alignment. Runtime implementation remains blocked until Core alignment is
completed and independently reviewed.

The PostgreSQL adapter additionally remains gated by Knowledge runtime and
in-memory alignment, Bootstrap async propagation, and conformance review.

## References

- [ADR-0026 — Knowledge Durable Store Asynchronous Execution and Recovery](../../../docs/adr/ADR-0026-Knowledge-Durable-Store-Asynchronous-Execution-and-Recovery.md)
- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](../../../docs/adr/ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md)
- [ADR-0024 — Durable Knowledge Physical Store Architecture](../../../docs/adr/ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md)
- [ADR-0025 — Knowledge Store Database Product Selection](../../../docs/adr/ADR-0025-Knowledge-Store-Database-Product-Selection.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [Knowledge Engine 2.0.0](ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)
- [Context Engine 5.1.0](../context/ENGINE-0003-Context-Engine-Revision-5.1.0.md)
- [Reasoning Engine 3.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Planning Engine 2.1.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Brain Engine 2.0.3](../ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change History

| Version | Date       | Description                                                                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 3.0.0   | 2026-08-23 | Drafted Promise-based durable execution, recovery, mutation serialization, and orderly Knowledge lifecycle settlement model. |
| 3.0.0   | 2026-08-23 | Closed serialized mutation validation ordering and deterministic initialization, recovery, and shutdown failure transitions. |
| 3.0.0   | 2026-08-23 | Activated as the sole current canonical ENGINE-0005 revision and superseded 2.0.0.                                           |

# Engineering Motto

> Await durability, publish only certainty, and reconstruct before trusting memory again.
