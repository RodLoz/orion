# Application-Runtime-Implementation-Specification.md

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| **Status**     | Active                                                      |
| **Version**    | 2.0.1                                                       |
| **Owner**      | Project Maintainers                                         |
| **Created**    | 2026-09-18                                                  |
| **Updated**    | 2026-09-21                                                  |
| **Applies To** | Caller-driven multi-turn application runtime implementation |

---

# Purpose

This specification defines the implementation obligations for the caller-driven multi-turn application runtime as established by ADR-0030 and the Application Runtime Specification.

The implementation must translate the approved semantic contract into bounded, process-local behavior while preserving all authority boundaries and operational invariants.

This specification accompanies the Application Runtime Specification Active 2.0.1 shutdown reconciliation. Rodrigo Lozano reviewed Draft 2.0.0 and supplied the human PASS recorded below; this lifecycle-only update activates that reviewed revision as Active 2.0.1 without semantic expansion or modification. The prior Active 1.0.1 versions remain recorded at code checkpoint `29736c0a295f361582fd564cf25533e2935c08c1`. This specification grants no shutdown implementation, production, or deployment authorization.

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

Shutdown evidence MUST cover all five pre-closure states; reentrant closure during synchronous preparation, binding, and turn execution; the admitted-but-not-executing case and its pending completion; rejection of new work; closure-preserving success/failure settlement; cleanup ordering and shared completion; repeated requests before/during/after cleanup; successful and failed terminal closure; separate operation and cleanup outcomes; and unchanged instance independence, privacy, authority boundaries, and synchronous execution. These are obligations for a later separately authorized implementation, not claims of current executable conformance.

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

| Version | Date       | Description                                                                                                                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-09-18 | Initial Draft based on approved runtime semantics                                                                                                                                                                                              |
| 1.0.1   | 2026-09-18 | Lifecycle activation following human review and approval; no semantic change                                                                                                                                                                   |
| 2.0.0   | 2026-09-21 | Draft for human review: align closure-aware state bookkeeping, admitted-work settlement, shared asynchronous cleanup completion, and terminal success/failure with the ADR-0030 specification reconciliation; no implementation authorization. |
| 2.0.1   | 2026-09-21 | Rodrigo Lozano's human SINGLE_MAINTAINER PASS for Draft 2.0.0 recorded; lifecycle activated as Active 2.0.1 without semantic expansion or modification; no shutdown implementation, production, or deployment authorization.                   |

---
