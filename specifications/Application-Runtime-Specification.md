# Application-Runtime-Specification.md

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Status**     | Active                                       |
| **Version**    | 2.0.1                                        |
| **Owner**      | Project Maintainers                          |
| **Created**    | 2026-09-15                                   |
| **Updated**    | 2026-09-21                                   |
| **Applies To** | Caller-driven multi-turn application runtime |

---

# Purpose

This specification defines the behavior and contract of the caller-driven multi-turn application runtime as established by ADR-0030.

The runtime is a process-local, caller-owned component that coordinates one C1 composition across multiple explicit turns without introducing session, durable state, or autonomous continuation.

This specification records the shutdown projection of ADR-0030 reviewed by Rodrigo Lozano as Draft 2.0.0. His human PASS recorded below activates that reviewed revision as Active 2.0.1 without semantic expansion or modification. The prior Active 1.0.1 version remains recorded at code checkpoint `29736c0a295f361582fd564cf25533e2935c08c1`. This specification grants no shutdown implementation, production, or deployment authorization.

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

| Term        | Definition                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Runtime     | A process-local application instance retaining one C1 composition and the admission/lifecycle state needed to coordinate its use |
| Turn        | One explicitly caller-initiated and admitted cognitive request ending in one existing final result or a surfaced failure         |
| Preparation | An explicit operation that establishes the Context and Brain binding for subsequent turns                                        |
| Admission   | The state during which new operations may be accepted                                                                            |
| Shutdown    | A request to close admission and initiate cleanup                                                                                |

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

A preparation attempt may result in:

1. **Success** - Runtime transitions to Ready state if shutdown has not begun
2. **Failure** - Runtime transitions to Preparation Failed state if shutdown has not begun

If shutdown has begun, either outcome settles the admitted preparation while admission remains closed. Context preparation and corresponding Brain binding remain one admitted preparation operation. Shutdown does not skip, retry, cancel, or infer a second preparation operation. The preparation outcome remains observable independently of subsequent cleanup.

Preparation failure does not permit another preparation attempt within the same runtime.
Preparation failure is distinct from turn failure and does not automatically enable continuation.

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

---

# Implementation Gates

This specification defines conformance obligations for future implementation:

- State transition correctness
- Operation admission/rejection rules
- Failure handling consistency
- Shutdown and cleanup behavior
- Authority boundary preservation

---

# Conformance Obligations

Implementations must:

1. Maintain correct state transitions
2. Enforce operation admission rules
3. Preserve authority boundaries
4. Handle failures according to Failure Option A
5. Implement shutdown semantics correctly
6. Not introduce new semantic authority or behavior

---

# Human Lifecycle Approval

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

| Version | Date       | Description                                                                                                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-09-15 | Initial Draft based on ADR-0030 decisions                                                                                                                                                                                     |
| 1.0.1   | 2026-09-17 | Lifecycle activation following human review and approval; no semantic change                                                                                                                                                  |
| 2.0.0   | 2026-09-21 | Draft for human review: reconcile ADR-0030 shutdown repetition, terminal closure, asynchronous cleanup completion, preserved admitted turns, and closure-aware settlement; no new ADR policy or implementation authorization. |
| 2.0.1   | 2026-09-21 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for Draft 2.0.0 recorded; lifecycle activated as Active 2.0.1 without semantic expansion or modification; no shutdown implementation, production, or deployment authorization.  |

---

# Engineering Motto

> A well-defined runtime contract enables predictable multi-turn application behavior.
