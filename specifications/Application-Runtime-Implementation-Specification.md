# Application-Runtime-Implementation-Specification.md

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| **Status**     | Active                                                      |
| **Version**    | 3.0.1                                                       |
| **Owner**      | Project Maintainers                                         |
| **Created**    | 2026-09-18                                                  |
| **Updated**    | 2026-09-22                                                  |
| **Applies To** | Caller-driven multi-turn application runtime implementation |

---

# Purpose

This specification defines the implementation obligations for the caller-driven multi-turn application runtime as established by ADR-0030 and the Application Runtime Specification.

The implementation must translate the approved semantic contract into bounded, process-local behavior while preserving all authority boundaries and operational invariants.

This Active 3.0.1 records Rodrigo Lozano's human PASS on Draft 3.0.0 without semantic expansion during activation. It supersedes Active 2.0.1 at the specification lifecycle level, while the current Runtime implementation remains conformant only to the previously implemented Active 2.0.1 scope until a separately authorized implementation establishes executable conformance to the successful-preparation lineage result. This specification grants no implementation, production, or deployment authorization.

---

# Scope

This specification governs:

- Runtime state representation and management
- Operation admission control and rejection handling
- Preparation and turn execution coordination
- Shutdown and cleanup orchestration
- Failure handling and propagation semantics
- Authority boundary preservation
- Concurrency and atomicity requirements

This specification does not define:

- Transport mechanisms
- Implementation details beyond behavioral obligations
- Production deployment topology
- Authentication protocols
- Serialization formats
- Storage technologies

---

# Normative Authority

This specification is subordinate to:

- [ADR-0030 — Caller-Driven Multi-Turn Application Runtime](../docs/adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md)
- [Application-Runtime-Specification.md](./Application-Runtime-Specification.md)

---

# Implementation Boundaries

The implementation must maintain the following boundaries:

- Engine authority is preserved
- Brain authority is preserved
- Context authority is preserved
- Knowledge authority is preserved
- C1 composition authority is preserved
- Reasoning authority is preserved
- Planning authority is preserved
- Security authority is preserved
- Skill authority is preserved
- Observer privacy constraints remain intact
- Transport boundary is preserved
- Failure Option A is preserved

---

# Runtime State Representation

The runtime maintains the following internal state:

1. **Not Prepared** - Newly created runtime with no preparation attempted
2. **Preparing** - Preparation operation admitted but not yet completed
3. **Ready** - Preparation succeeded, runtime is ready for turns
4. **Preparation Failed** - Preparation attempt failed, cannot proceed to turn
5. **Turn In Progress** - Turn admitted and awaiting execution or executing; new turn admission is prohibited
6. **Admission Closed** - Shutdown has begun, no new operations may be admitted
7. **Cleanup In Progress** - Cleanup has been invoked after admitted work settles
8. **Terminal Closed** - Runtime shutdown completion has settled and admission remains permanently closed after cleanup success or failure; this does not assert successful resource cleanup or global handle revocation

State transitions are managed through atomic operations that ensure consistency.

Closure and outstanding-operation bookkeeping MUST coexist: changing lifecycle state to Admission Closed must not lose an existing turn admission or confuse an admitted turn awaiting execution with an executing turn. The Runtime terminal state is not a projection of a Knowledge Engine state.

---

# Preparation Bookkeeping

The implementation must:

- Track exactly one preparation attempt per runtime instance
- Reject subsequent preparation attempts within the same runtime
- Preserve the result of the first preparation attempt (success or failure)
- Require a new runtime instance for re-preparation
- Maintain only the resulting preparation/binding needed to use its approved C1 composition for later explicitly caller-initiated turns
- If shutdown is requested during admitted preparation, allow that one preparation/binding operation to settle without cancellation; preserve its outcome while remaining Admission Closed rather than overwriting closure with Ready or Preparation Failed

The internal `begin(input)` implementation MUST continue to invoke the existing
authorized Context preparation path exactly once. On success it MUST:

1. receive the exact successful prepared Context result;
2. directly reference the `ContextLineageIdentity` present in that result;
3. establish the Brain binding from that same prepared result and identity;
4. settle preparation under the existing lifecycle rules; and
5. only after successful preparation and binding settlement, synchronously
   return that exact lineage identity to the trusted internal application-side
   caller.

When shutdown has not begun, Runtime MUST enter Ready before the successful
return becomes observable. If shutdown begins during the admitted preparation,
Runtime MUST preserve Admission Closed, settle the preparation/binding outcome,
and follow existing cleanup ordering without restoring Ready. In that case the
exact lineage may be returned only after successful preparation/binding
settlement; cleanup may already have begun before the synchronous caller
observes it. No lineage may be exposed from failed or incomplete preparation.

The implementation SHOULD directly project the existing lineage value. It MUST
NOT fabricate, infer, substitute, normalize, or clone it into a semantically
different identity. It need not retain a second independent lineage field after
the return; the retained Brain binding remains the preparation state needed for
turn execution.

On preparation failure, `begin(input)` MUST return no lineage, preserve the
originating failure semantics, and settle Preparation Failed before failure
observation when admission remains open. It MUST NOT retry, perform a second
preparation, or return a fallback, guessed, or fabricated lineage.

The return value is non-authoritative internal application integration data.
The implementation MUST NOT expose a complete Context revision, Context state,
Brain binding, C1 composition, preparation handle, Engine reference, mutable
preparation object, or transport metadata. It MUST NOT publish the lineage,
accept it from an external caller, treat it as authorization evidence, or make
it a caller-controlled selector.

---

# Admission Control

The implementation must enforce:

- Preparation and turn operations are strictly sequential
- No overlapping operations (preparation or turn) are permitted
- Only one operation may be admitted at a time
- Operations are rejected when:
  - Preparation attempted after successful preparation
  - Turn attempted before preparation
  - New turn admission attempted while admission is closed, or execution attempted without an unconsumed existing turn admission
  - Overlapping operations are submitted

Execution of the single turn admitted before closure remains allowed once under the existing execution contract; it is not new admission. Repeated shutdown joins or observes the existing logical shutdown completion and MUST NOT be rejected solely because closure or cleanup has begun or completed.

---

# Turn Settlement

The implementation must:

- Execute turns according to existing Brain orchestration semantics
- Allow ordinary failed turns to settle and permit subsequent explicitly caller-initiated turns when shutdown has not begun
- Not implement automatic retry, fallback, or autonomous continuation
- Preserve the existing turn execution boundaries and outcome correspondence
- Keep cognitive execution synchronous, forwarding the existing caller request unchanged and returning the exact Brain result or surfacing the originating execution failure
- When shutdown has begun, settle the admitted turn without restoring Ready; preserve closed admission before its result or failure becomes observable

Internal application mapping remains responsible for constructing the complete
`NormalizedCognitiveRequest`, including the exact private lineage obtained from
successful preparation. Runtime MUST NOT construct that request, infer or inject
application or transport fields, reinterpret caller intent, independently
choose a lineage, repair a mismatched request, normalize lineage correspondence,
or substitute its retained binding identity. It continues to accept one
caller-constructed request for an admitted turn and forward that exact request
unchanged to Brain.

---

# Shutdown Coordination

The implementation must:

- Close admission immediately upon shutdown request
- Allow already-admitted operations to settle without cancellation
- Invoke cleanup only after admitted work settles
- Preserve cleanup failure observability
- Follow established terminal/shared-cleanup semantics for repeated shutdown requests
- Not claim global revocation of independently retained Engine/Context/Brain handles

The internal `shutdown(): Promise<void>` operation MUST implement [Shutdown and Cleanup Correspondence](./Application-Runtime-Specification.md#shutdown-and-cleanup-correspondence). Its first invocation closes admission before returning, including from Not Prepared and Preparation Failed. During admitted preparation or turn execution it records closure and waits for that operation's settlement; it must not synchronously block the call stack that must finish the admitted operation.

An admitted turn whose execution has not started remains outstanding after closure. Its caller may explicitly execute it once using the existing request contract. Cleanup MUST NOT start until it settles. If it is never executed, shutdown remains pending in Admission Closed; no cancellation, timeout, fabricated outcome, inferred request, or automatic execution is introduced.

All shutdown callers observe one logical completion while admitted work or cleanup is pending and after success or failure. Exact Promise identity is not required. Asynchronous shutdown/cleanup completion MUST NOT make `begin` or cognitive execution asynchronous, introduce a work queue, or admit overlapping turns. Dropping a caller's shutdown Promise does not cancel the lifecycle operation.

---

# Cleanup Coordination

The implementation must:

- Execute cleanup after admitted work settles
- Preserve existing Knowledge-resource cleanup ownership
- Not introduce application-wide revocation of retained Context/Brain handles
- Maintain observability of cleanup failures
- Follow the established shutdown semantics for cleanup coordination

Runtime MUST invoke only the retained C1 composition's existing cleanup operation after its admitted work settles, preserving one logical cleanup execution. The delegated `shutdown(): Promise<void>` is already exposed by [C1](../IMPLEMENTATION-C1.md#composition); Runtime adds no direct Engine-stop or resource-disposal responsibility. Underlying Knowledge settlement and failure precedence remain owned by that composition and its existing Engine boundary.

Runtime enters Cleanup In Progress when it invokes cleanup. It enters Terminal Closed before exposing cleanup completion: the Runtime shutdown Promise fulfills with `undefined` on success or rejects with the originating cleanup failure on failure. Admission remains permanently closed in either case. Repeated calls observe the same completed success or failure without another cleanup attempt; a failed completion MUST NOT become a successful no-op on a later call.

Cleanup failure MUST be delivered through shutdown completion without replacing the already-admitted preparation/turn outcome. Conversely, an ordinary preparation/turn failure does not itself reject shutdown if cleanup succeeds. No new failure taxonomy, recovery, or retry is introduced.

---

# Failure Correspondence

The implementation must handle failures according to Failure Option A:

- Preparation failures remain with Context/Identity responsibilities
- Turn execution and cleanup failures retain their originating ownership
- Internal exception identity need not propagate unchanged across boundaries
- No public diagnostic taxonomy is introduced
- Semantic failure ownership stays with the originating responsibility
- Brain normalization remains intact

---

# Authority Preservation

The implementation must preserve all authority boundaries:

- Engine authority
- Brain authority
- Context authority
- Knowledge authority
- C1 composition authority
- Reasoning authority
- Planning authority
- Security authority
- Skill authority
- Observer privacy constraints
- Transport independence

---

# Concurrency/Atomicity Requirements

The implementation must ensure:

- State transitions are atomic
- Operation admission is mutually exclusive
- No race conditions in state management
- Thread-safe access to runtime state
- Consistent handling of concurrent operations

---

# Non-Goals and Prohibitions

This specification explicitly prohibits:

- Re-preparation within the same runtime
- Revision pinning
- Queues, schedulers, or parallel execution
- Automatic retries or fallback behavior
- Autonomous continuation or background cognition
- Result-to-observation feedback loops
- Session abstraction or durable conversational state
- Transport selection or authentication redesign
- Production authorization or deployment authorization
- Public Runtime API or transport-visible preparation result
- Preparation handle, session identifier, or conversation identifier
- Runtime construction, repair, normalization, or transformation of the caller request

---

# Conformance Obligations

Implementations must:

1. Maintain correct state transitions
2. Enforce operation admission rules
3. Preserve authority boundaries
4. Handle failures according to Failure Option A
5. Implement shutdown semantics correctly
6. Not introduce new semantic authority or behavior
7. Ensure atomicity of state management operations
8. Prevent concurrent access violations

Future executable evidence for this Draft MUST demonstrate:

- successful `begin(input)` invokes Context preparation exactly once, returns
  the exact `ContextLineageIdentity` from the successful prepared result, and
  establishes the retained Brain binding from that same result;
- Runtime reaches Ready before the successful return is observable when
  admission remains open;
- failed preparation returns no lineage, preserves the originating failure,
  settles Preparation Failed before observation when admission remains open,
  preserves Admission Closed when shutdown has begun, and performs no retry or
  fallback;
- reentrant shutdown during preparation preserves closure and cleanup ordering,
  returns a lineage only after successful preparation/binding settlement, never
  restores Ready after closure, and exposes no lineage for failed or incomplete
  preparation;
- no complete Context revision, Context state, Brain binding, C1 composition,
  preparation handle, Engine reference, mutable preparation object, public
  Runtime API, or transport-visible lineage is introduced;
- turn execution still accepts a caller-constructed
  `NormalizedCognitiveRequest` and forwards the exact request object unchanged,
  without lineage substitution, repair, normalization, or inferred fields.

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

Shutdown evidence MUST cover all five pre-closure states; reentrant closure during synchronous preparation, binding, and turn execution; the admitted-but-not-executing case and its pending completion; rejection of new work; closure-preserving success/failure settlement; cleanup ordering and shared completion; repeated requests before/during/after cleanup; successful and failed terminal closure; separate operation and cleanup outcomes; and unchanged instance independence, privacy, authority boundaries, and synchronous execution. These are obligations for a later separately authorized implementation, not claims of current executable conformance.

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

| Field              | Value                            |
| ------------------ | -------------------------------- |
| Decision maker     | Rodrigo Lozano                   |
| Decision           | PASS — lifecycle activation      |
| Decision date      | 2026-09-18                       |
| Review route       | SINGLE_MAINTAINER                |
| INDEPENDENT_REVIEW | NOT_APPLICABLE_SINGLE_MAINTAINER |
| MAINTAINER_REVIEW  | PASS                             |
| Reviewed version   | Draft 1.0.0                      |
| Transition         | Draft -> Active                  |
| Recorded version   | Active 1.0.1                     |
| Blocking findings  | 0                                |

The previous F1 finding was remediated before the human PASS and therefore must NOT be recorded as an accepted blocking finding.

---

# Version History

| Version | Date       | Description                                                                                                                                                                                                                                                                                        |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-09-18 | Initial Draft based on approved runtime semantics                                                                                                                                                                                                                                                  |
| 1.0.1   | 2026-09-18 | Lifecycle activation following human review and approval; no semantic change                                                                                                                                                                                                                       |
| 2.0.0   | 2026-09-21 | Draft for human review: align closure-aware state bookkeeping, admitted-work settlement, shared asynchronous cleanup completion, and terminal success/failure with the ADR-0030 specification reconciliation; no implementation authorization.                                                     |
| 2.0.1   | 2026-09-21 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for Draft 2.0.0 recorded; lifecycle activated as Active 2.0.1 without semantic expansion or modification; no shutdown implementation, production, or deployment authorization.                                                                       |
| 3.0.0   | 2026-09-22 | Draft for human review: return the exact successful prepared Context lineage identity to the trusted internal application caller after preparation/binding settlement, preserving existing request forwarding, lifecycle, ownership, public API, transport, production, and deployment boundaries. |
| 3.0.1   | 2026-09-22 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for corrected Draft 3.0.0 recorded; lifecycle activated as Active 3.0.1 without semantic expansion; implementation authority and executable conformance to the new lineage-result requirement remain unestablished.                                  |

---
