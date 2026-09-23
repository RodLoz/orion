# Application-Runtime-Specification.md

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Status**     | Active                                       |
| **Version**    | 3.0.1                                        |
| **Owner**      | Project Maintainers                          |
| **Created**    | 2026-09-15                                   |
| **Updated**    | 2026-09-22                                   |
| **Applies To** | Caller-driven multi-turn application runtime |

---

# Purpose

This specification defines the behavior and contract of the caller-driven multi-turn application runtime as established by ADR-0030.

The runtime is a process-local, caller-owned component that coordinates one C1 composition across multiple explicit turns without introducing session, durable state, or autonomous continuation.

This Active 3.0.1 records Rodrigo Lozano's human PASS on Draft 3.0.0 without semantic expansion during activation. It supersedes Active 2.0.1 at the specification lifecycle level, while the current Runtime implementation remains conformant only to the previously implemented Active 2.0.1 scope until a separately authorized implementation establishes executable conformance to the successful-preparation lineage result. This specification grants no implementation, production, or deployment authorization.

---

# Scope

This specification governs:

- Runtime lifecycle and state model
- Operation admission and rejection rules
- Preparation and turn execution correspondence
- Failure handling and continuation semantics
- Shutdown and cleanup behavior
- Authority boundaries and privacy constraints

This specification does not define:

- Transport mechanisms
- Implementation details
- Production deployment topology
- Authentication protocols
- Serialization formats
- Storage technologies

---

# Normative Authority

This specification is subordinate to:

- [ADR-0030 — Caller-Driven Multi-Turn Application Runtime](../docs/adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md)
- [OES-0001 — Repository Structure](../docs/engineering/OES-0001-Repository-Structure.md)
- [OES-0008 — Documentation Standards](../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../docs/engineering/OES-0010-Versioning-Standards.md)

---

# Terminology

| Term               | Definition                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime            | A process-local application instance retaining one C1 composition and the admission/lifecycle state needed to coordinate its use                  |
| Turn               | One explicitly caller-initiated and admitted cognitive request ending in one existing final result or a surfaced failure                          |
| Preparation        | An explicit operation that establishes the Context and Brain binding for subsequent turns                                                         |
| Preparation result | The exact prepared Context lineage identity returned only to the trusted internal application association after successful preparation settlement |
| Admission          | The state during which new operations may be accepted                                                                                             |
| Shutdown           | A request to close admission and initiate cleanup                                                                                                 |

---

# Runtime Invariants

- One C1 composition is retained across all operations
- Only one preparation/binding is established per runtime
- Operations are strictly sequential
- No automatic retry or recovery behavior
- No autonomous continuation or background cognition
- No durable session or conversation state
- No queue, scheduler, or parallel execution
- No revision pinning or re-preparation within a runtime

---

# Runtime Lifecycle and State Model

The runtime maintains the following states:

1. **Not Prepared** - Newly created runtime with no preparation attempted
2. **Preparing** - Preparation operation admitted but not yet completed
3. **Ready** - Preparation succeeded, runtime is ready for turns
4. **Preparation Failed** - Preparation attempt failed, cannot proceed to turn
5. **Turn In Progress** - Turn admitted and awaiting execution or executing; new turn admission is prohibited
6. **Admission Closed** - Shutdown has begun, no new operations may be admitted
7. **Cleanup In Progress** - Cleanup has been invoked after admitted work settles
8. **Terminal Closed** - Runtime shutdown completion has settled and admission remains permanently closed, whether cleanup succeeded or failed; this state does not assert cleanup success or global resource/handle revocation

These are Runtime lifecycle states, not Knowledge Engine states. After admission closes, bookkeeping for an already-admitted operation remains distinct from the closed lifecycle state until that operation settles.

State transitions are defined as follows:

```
Not Prepared → Preparing → Ready (if shutdown has not begun)
Not Prepared → Preparing → Preparation Failed (if shutdown has not begun)
Ready → Turn In Progress → Ready (after success or ordinary failure, if shutdown has not begun)
Not Prepared → Admission Closed (if shutdown requested)
Preparing → Admission Closed (if shutdown requested; admitted preparation may settle)
Preparation Failed → Admission Closed (if shutdown requested)
Ready → Admission Closed (if shutdown requested)
Turn In Progress → Admission Closed (if shutdown requested; admitted turn may execute/settle)
Admission Closed → Cleanup In Progress (after admitted work settles)
Cleanup In Progress → Terminal Closed (cleanup succeeds or fails; outcome remains observable)
```

---

# Operation Admissions and Rejections

## Preparation

- Preparation is an explicit operation that must be called before any turn
- Only one preparation attempt is allowed per runtime
- A failed preparation does not permit another preparation attempt
- Re-preparation requires a new runtime instance

## Turn Execution

- Turns are explicitly caller-initiated
- At most one turn may be admitted at a time
- Overlapping turn operations are rejected
- Turn execution follows existing Brain orchestration semantics
- Admission and execution may be separate internal calls. Executing an already-admitted turn consumes that admission once; it is not admission of a new turn.

## Shutdown

- Shutdown immediately closes admission to new operations
- If an operation is already admitted, it is allowed to settle without cancellation
- Cleanup is invoked only after admitted work settles
- Repeated shutdown requests join or observe the same logical shutdown completion, including while admitted work or cleanup is pending; they do not admit a second shutdown or initiate another cleanup execution

## Invalid Operations

Operations are rejected when:

- Preparation attempted after successful preparation
- Turn attempted before preparation
- New turn admission attempted while admission is closed, or execution attempted without an unconsumed existing turn admission
- Overlapping operations (preparation or turn) are submitted

Repeated shutdown is observation of the existing shutdown, not an invalid overlapping preparation or turn operation. It MUST NOT be rejected merely because Runtime is Admission Closed, Cleanup In Progress, or Terminal Closed. The already-admitted turn exception is defined in Shutdown and Cleanup Correspondence below.

---

# Preparation Correspondence

Preparation attempts must be explicitly initiated by the caller.

The sole explicit internal preparation operation is `begin(input)`. It accepts
the existing authorized Context preparation input and performs exactly one
Runtime preparation attempt. Runtime receives the successful prepared Context
result through the existing C1 path and establishes the retained Brain binding
from the exact lineage identity in that result.

A preparation attempt may result in:

1. **Success** - Runtime synchronously returns only the exact
   `ContextLineageIdentity` from the successful prepared Context result. If
   shutdown has not begun, Runtime transitions to Ready before that return is
   observable.
2. **Failure** - Runtime transitions to Preparation Failed state before the
   originating failure is observable if shutdown has not begun. No lineage
   identity is returned.

The successful return is a direct projection of the lineage identity received
through the authorized Context preparation path. Runtime MUST NOT fabricate,
infer, clone into a semantically different value, substitute, or independently
select that identity. It MUST NOT return the complete Context revision, Context
state, Brain binding, C1 composition, preparation handle, Engine reference,
mutable preparation object, or transport metadata.

The returned lineage remains semantically owned by Context. Possession grants
no authority, proves no currentness, permits no Context mutation or lineage
selection, and creates no preparation, session, or conversation handle. The
value is private internal application integration data for the server-side
association established by ADR-0029. It MUST NOT cross a transport boundary,
appear in a public response, be accepted from an external caller, become a
caller-controlled selector, or be logged or interpreted as authorization
evidence.

The internal application mapping may use this exact returned identity to
construct a later caller-supplied `NormalizedCognitiveRequest` for the same
configured preparation. Request construction remains outside Runtime. Runtime
continues to accept an already-constructed request for an admitted turn and
forward that exact request unchanged to Brain. Runtime MUST NOT construct the
application request, infer or inject its fields, reinterpret caller intent,
choose a lineage independently, repair a mismatched request, or substitute its
binding identity into turn execution.

If shutdown begins during preparation, either outcome settles the admitted
preparation while admission remains closed. A successful Context preparation
and corresponding Brain binding may return the exact lineage identity only
after that admitted preparation has successfully settled. Runtime MUST NOT
transition through or restore Ready merely to expose the result after closure;
cleanup may begin under the existing closure-aware rules before the synchronous
caller observes the return. A failed preparation returns no lineage. Shutdown
does not skip, retry, cancel, roll back, or infer a second preparation
operation. The preparation outcome remains observable independently of
subsequent cleanup.

Preparation failure does not permit another preparation attempt within the same runtime.
Preparation failure is distinct from turn failure and does not automatically enable continuation.
No fallback, guessed, cached-from-another-instance, or fabricated lineage may
be returned after failure.

---

# Turn Admissions and Correspondence

A turn represents one explicit caller-initiated execution against the established preparation/binding.

Turns:

- Are explicitly initiated by the caller
- Do not own Engine semantics
- Do not create durable conversational state
- Do not autonomously cause another turn
- Follow existing Brain orchestration boundaries

Turn admission is subject to:

- Runtime readiness (must be in Ready state)
- Admission not being closed
- No overlapping operations

These conditions gate new turn admission. An admission acquired before shutdown is preserved as specified below. Cognitive execution remains synchronous: it accepts the caller's existing request and returns the existing Brain result or surfaces the originating execution failure. Shutdown coordination does not change that operation into a Promise-returning operation.

---

# Failure Correspondence

Failure handling follows Failure Option A:

- Preparation failures remain with Context/Identity responsibilities
- Turn execution and cleanup failures retain their originating ownership
- Internal exception identity need not propagate unchanged across boundaries
- No public diagnostic taxonomy is introduced
- Semantic failure ownership stays with the originating responsibility
- Brain normalization remains intact

---

# Shutdown and Cleanup Correspondence

Shutdown behavior:

1. **Request** - Admission closes to new operations
2. **Settlement** - If an operation is already admitted, it settles without cancellation
3. **Cleanup** - Existing cleanup path is invoked after admitted work settles
4. **Observability** - Cleanup failures remain observable
5. **Repetition** - Repeated shutdown requests join pending completion or observe the same completed success or failure

Shutdown does not:

- Claim global revocation of independently retained Engine/Context/Brain handles
- Automatically retry cleanup
- Cancel admitted operations
- Permit new preparation or new turn admission after closure begins

## Shutdown operation and completion

The internal Runtime shutdown operation has signature `shutdown(): Promise<void>`. This projects ADR-0030 D4-A onto the retained asynchronous C1 cleanup operation; it does not establish a public Runtime package or transport API. The existing cleanup boundary and inherited behavior are documented in [C1](../IMPLEMENTATION-C1.md#composition) and [ADR-0026](../docs/adr/ADR-0026-Knowledge-Durable-Store-Asynchronous-Execution-and-Recovery.md#bootstrap). Knowledge-specific states, mutation queues, and recovery policies are not Runtime lifecycle mechanisms.

The first shutdown request MUST close admission synchronously before returning its Promise. Shutdown completion MUST remain pending until any already-admitted preparation or turn has settled and the existing composition cleanup has completed. With no outstanding admitted operation, Runtime proceeds from Admission Closed to Cleanup In Progress and invokes that cleanup without admitting additional work.

Cleanup success transitions Runtime to Terminal Closed before the shutdown Promise fulfills with `undefined`. A cleanup failure transitions Runtime to Terminal Closed before the shutdown Promise rejects with the originating cleanup failure, preserving existing failure ownership and representation without a new diagnostic taxonomy. Terminal Closed records permanent Runtime closure and a settled shutdown outcome; it does not certify that all underlying resources were successfully cleaned or that an underlying Engine reached a successful stopped state.

Runtime MUST preserve one logical shutdown completion and one logical delegated cleanup execution. Calls while waiting for admitted work, during cleanup, or after terminal closure observe that same eventual or completed outcome. After success, later shutdown calls fulfill without further cleanup; after failure, they reject with the existing failure without retrying cleanup. Exact Promise object identity is not a normative requirement. Dropping a shutdown Promise does not cancel admitted work or cleanup.

## Shutdown with an admitted turn awaiting execution

ADR-0030 D4-A protects already-admitted work, not only work whose execution has started. With the existing split admission/execution boundary, a turn admitted before closure therefore remains eligible for one explicit execution after closure. This completes the existing admission; it does not admit a new turn, queue a new request, or authorize autonomous execution. Runtime MUST continue to reject overlapping execution and every new turn admission.

Shutdown MUST wait for that turn to settle before invoking cleanup. If its caller never submits the existing cognitive request for execution, the admitted turn remains unsettled, Runtime remains Admission Closed, and shutdown remains pending. No finite completion deadline is promised. Runtime MUST NOT infer a request, discard the admission, fabricate a result/failure, time out, or cancel the turn to force shutdown completion. A caller awaiting shutdown must not rely on that await to execute its own outstanding turn.

## Closure-aware settlement and separate outcomes

A shutdown request is valid from Not Prepared, Preparing, Ready, Preparation Failed, or Turn In Progress. Already-admitted preparation or turn execution completes under its existing synchronous contract. After closure, its settlement MUST NOT restore Ready or otherwise reopen admission. Cleanup begins only after that admitted work has settled, on either success or ordinary failure.

The admitted operation's result or originating failure remains the outcome of that operation. A later cleanup failure belongs to shutdown's Promise and MUST NOT replace, reinterpret, or mask the admitted operation's outcome. An ordinary operation failure does not itself make shutdown fail if subsequent cleanup succeeds. After either cleanup outcome, new preparation and turns remain prohibited; subsequent shutdown observes the settled shutdown outcome.

---

# Authority Boundaries and Privacy Constraints

- Engine authority is preserved
- Brain authority is preserved
- Context authority is preserved
- Knowledge authority is preserved
- C1 composition authority is preserved
- Failure Option A is preserved
- Transport boundary is preserved
- Observer privacy constraints remain intact
- The successful preparation lineage result remains non-authoritative internal application integration data

---

# Non-Goals and Exclusions

This specification explicitly excludes:

- Implementation mechanisms (mutexes, locks, promises, etc.)
- Transport protocols or serialization formats
- Authentication technologies
- Deployment topology
- Storage technologies
- Production authorization
- Transport implementation authorization
- Production deployment authorization
- Autonomous continuation
- Background cognition
- Result-to-observation feedback loops
- Session abstraction
- Durable session/conversation storage
- Queue, scheduler, or parallel execution
- Automatic retry behavior
- Re-preparation semantics
- Revision pinning
- New Engine, Brain, Context, or Knowledge authority
- Public exposure or external caller selection of a preparation lineage
- Runtime construction, repair, or transformation of an application request
- Preparation handles, session identifiers, or conversation identifiers

---

# Implementation Gates

This specification defines conformance obligations for future implementation:

- State transition correctness
- Operation admission/rejection rules
- Failure handling consistency
- Shutdown and cleanup behavior
- Authority boundary preservation
- Exact successful-preparation lineage correspondence and non-disclosure

---

# Conformance Obligations

Implementations must:

1. Maintain correct state transitions
2. Enforce operation admission rules
3. Preserve authority boundaries
4. Handle failures according to Failure Option A
5. Implement shutdown semantics correctly
6. Not introduce new semantic authority or behavior

Future executable evidence for this Draft MUST demonstrate:

- `begin(input)` invokes preparation exactly once and returns the exact
  `ContextLineageIdentity` from its successful prepared Context result;
- the retained Brain binding is established from that same result and Runtime
  reaches Ready before the successful return is observable when admission has
  not closed;
- preparation failure returns no lineage, preserves the originating failure
  semantics, settles Preparation Failed before observation when admission
  remains open, preserves Admission Closed when shutdown has begun, and
  introduces no retry, fallback, or fabricated identity;
- reentrant shutdown during preparation preserves the existing Admission
  Closed and cleanup ordering, exposes a lineage only after successful
  preparation/binding settlement, never restores Ready after closure, and
  exposes no lineage from a failed or incomplete preparation;
- no complete Context revision, Context state, Brain binding, C1 composition,
  preparation handle, Engine reference, mutable preparation object, or
  transport metadata is returned;
- no public Runtime API, transport-visible lineage, external lineage input, or
  caller-controlled lineage selector is introduced;
- turn execution still accepts one caller-constructed
  `NormalizedCognitiveRequest` and forwards the exact request unchanged without
  lineage repair or substitution.

The later implementation evidence MUST exercise the following closure-aware
matrix deterministically and observe the preparation operation and shutdown
completion through their separate channels.

## Shutdown requested during Context preparation

1. **Preparation succeeds; cleanup succeeds.** `begin(input)` returns the exact
   lineage from the successful Context result; Brain binding uses that same
   result; closure remains effective without restoring Ready; shutdown fulfills;
   and the lineage and shutdown outcomes remain separate.
2. **Preparation succeeds; cleanup Promise rejects.** `begin(input)` still
   returns that exact lineage; cleanup rejection neither replaces nor alters
   it; Runtime reaches Terminal Closed before shutdown rejects with the
   originating cleanup failure; and cleanup is not retried.
3. **Preparation succeeds; cleanup invocation throws synchronously.**
   `begin(input)` still returns that exact lineage; the invocation failure
   neither replaces nor suppresses it; Runtime preserves terminal-failure
   ordering; shutdown rejects with the originating cleanup failure; and cleanup
   is not retried.
4. **Preparation fails; cleanup succeeds.** `begin(input)` produces no lineage
   result and surfaces the originating preparation failure; cleanup still runs;
   shutdown fulfills; and the two outcomes remain separate.
5. **Preparation fails; cleanup Promise rejects.** `begin(input)` produces no
   lineage result and surfaces the originating preparation failure; shutdown
   independently rejects with the originating cleanup failure; neither failure
   replaces the other; and cleanup is not retried.
6. **Preparation fails; cleanup invocation throws synchronously.**
   `begin(input)` produces no lineage result and surfaces the originating
   preparation failure; shutdown independently rejects with the originating
   cleanup failure; neither failure replaces the other; and cleanup is not
   retried.

## Shutdown requested during Brain binding

After Context preparation succeeds, evidence MUST request shutdown reentrantly
during establishment of the retained Brain binding and cover:

1. binding success with cleanup success;
2. binding success with a rejecting cleanup Promise;
3. binding success with a synchronous cleanup invocation throw;
4. binding failure with cleanup success;
5. binding failure with a rejecting cleanup Promise; and
6. binding failure with a synchronous cleanup invocation throw.

In each successful-binding case, `begin(input)` MUST return the exact lineage
from the same successful prepared Context result, closure MUST remain effective
without restoring Ready, and cleanup outcome MUST NOT replace or suppress the
lineage result. In each failed-binding case, `begin(input)` MUST produce no
lineage result and surface the originating preparation failure while shutdown
independently exposes cleanup success or the originating cleanup failure.
Cleanup success MUST NOT erase the operation failure; cleanup failure MUST NOT
replace it; and cleanup MUST NOT be retried. These cases use the existing
preparation-failure model and introduce no new failure taxonomy.

## Ordinary preparation and regression evidence

Without shutdown, evidence MUST show that successful `begin(input)` returns the
exact prepared lineage, establishes Brain binding from the same result, and
enters Ready before the return is observable. Failed `begin(input)` MUST expose
no lineage, settle Preparation Failed before the originating failure is
observable, and perform no retry, fallback, or second preparation attempt.

All unaffected Active 2.0.1 behavioral evidence MUST remain passing. Assertions
whose sole purpose is to require successful `begin(input)` to return `undefined`
are superseded by Draft 3.0.0 and MUST be replaced during a later authorized
implementation by assertions for the exact successful
`ContextLineageIdentity` return. Synchronous invocation, single-attempt
preparation, lifecycle ordering, failure behavior, retained Brain binding, turn
admission, exact request forwarding, synchronous execution, exact result and
originating execution-failure identity, shutdown admission closure, preserved
admitted work, exactly-once cleanup, terminal settlement, operation/cleanup
outcome separation, repeated shutdown, instance independence, architecture and
dependency enforcement, and aggregate repository validation remain regression
obligations. This Draft does not itself authorize test modification.

---

# Human Lifecycle Approval

Rodrigo Lozano supplied the human PASS for the corrected Draft 3.0.0 revisions
of both Runtime specifications after the final focused audit reported
`PASS_READY` and no blockers. This lifecycle recording activates the reviewed
semantics as Active 3.0.1 without alteration. AI/Codex records the supplied
decision; it is not the decision maker or an independent reviewer.

| Field                                   | Value                                     |
| --------------------------------------- | ----------------------------------------- |
| REVIEW_ROUTE                            | SINGLE_MAINTAINER                         |
| INDEPENDENT_REVIEW                      | NOT_APPLICABLE_SINGLE_MAINTAINER          |
| MAINTAINER_REVIEW                       | PASS                                      |
| REVIEWER                                | Rodrigo Lozano                            |
| DECISION                                | PASS                                      |
| Decision date                           | 2026-09-22                                |
| Reviewed version                        | Draft 3.0.0                               |
| Transition                              | Draft 3.0.0 -> Active 3.0.1               |
| Recorded version                        | Active 3.0.1                              |
| HUMAN_REVIEW_REQUIRED                   | YES — satisfied by this recorded decision |
| HUMAN_DECISION_RECORDED                 | YES                                       |
| IMPLEMENTATION_AUTHORITY_GRANTED        | NO                                        |
| Executable conformance to Active 3.0.1  | NOT_ESTABLISHED                           |
| Semantic expansion during activation    | NONE                                      |
| Current implemented/conformant baseline | Previous Active 2.0.1 scope               |
| Production authorization                | NONE                                      |
| Deployment authorization                | NONE                                      |

## Historical approval of Active 2.0.1

Rodrigo Lozano supplied the human PASS for the Draft 2.0.0 revision presented in the immediately preceding human-review preparation. AI/Codex records the supplied decision; it is not the decision maker or an independent reviewer.

| Field                         | Value                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| REVIEW_ROUTE                  | SINGLE_MAINTAINER                                                                                                        |
| INDEPENDENT_REVIEW            | NOT_APPLICABLE_SINGLE_MAINTAINER                                                                                         |
| MAINTAINER_REVIEW             | PASS                                                                                                                     |
| REVIEWER                      | Rodrigo Lozano                                                                                                           |
| DECISION                      | PASS                                                                                                                     |
| Decision date                 | 2026-09-21                                                                                                               |
| Reviewed version              | Draft 2.0.0                                                                                                              |
| Transition                    | Draft -> Active                                                                                                          |
| Recorded version              | Active 2.0.1                                                                                                             |
| Review evidence               | The Draft 2.0.0 revisions of both Runtime specifications presented in the immediately preceding human-review preparation |
| Semantic change in activation | None; the reviewed shutdown rules are preserved without expansion or modification                                        |
| Implementation authorization  | None; a separate bounded shutdown implementation review is still required                                                |
| Production authorization      | None                                                                                                                     |
| Deployment authorization      | None                                                                                                                     |

## Historical approval of Active 1.0.1

The following record applies only to the earlier Draft 1.0.0 review and Active 1.0.1 lifecycle activation.

| Field                | Value                       |
| -------------------- | --------------------------- |
| **Decision maker**   | Rodrigo Lozano              |
| **Decision**         | PASS — lifecycle activation |
| **Reviewed version** | Draft 1.0.0                 |
| **Transition**       | Draft -> Active             |
| **Recorded version** | Active 1.0.1                |

---

# Version History

| Version | Date       | Description                                                                                                                                                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-09-15 | Initial Draft based on ADR-0030 decisions                                                                                                                                                                                                                                     |
| 1.0.1   | 2026-09-17 | Lifecycle activation following human review and approval; no semantic change                                                                                                                                                                                                  |
| 2.0.0   | 2026-09-21 | Draft for human review: reconcile ADR-0030 shutdown repetition, terminal closure, asynchronous cleanup completion, preserved admitted turns, and closure-aware settlement; no new ADR policy or implementation authorization.                                                 |
| 2.0.1   | 2026-09-21 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for Draft 2.0.0 recorded; lifecycle activated as Active 2.0.1 without semantic expansion or modification; no shutdown implementation, production, or deployment authorization.                                                  |
| 3.0.0   | 2026-09-22 | Draft for human review: synchronously project the exact successful prepared Context lineage identity to the trusted internal application association without changing request construction, lifecycle, ownership, public API, transport, production, or deployment authority. |
| 3.0.1   | 2026-09-22 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for corrected Draft 3.0.0 recorded; lifecycle activated as Active 3.0.1 without semantic expansion; implementation authority and executable conformance to the new lineage-result requirement remain unestablished.             |

---

# Engineering Motto

> A well-defined runtime contract enables predictable multi-turn application behavior.
