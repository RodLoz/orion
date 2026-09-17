# Application-Runtime-Specification.md

| Field | Value |
|--------|--------|
| **Status** | Draft |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-09-15 |
| **Updated** | 2026-09-15 |
| **Applies To** | Caller-driven multi-turn application runtime |

---

# Purpose

This specification defines the behavior and contract of the caller-driven multi-turn application runtime as established by ADR-0030.

The runtime is a process-local, caller-owned component that coordinates one C1 composition across multiple explicit turns without introducing session, durable state, or autonomous continuation.

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

| Term | Definition |
|------|------------|
| Runtime | A process-local application instance retaining one C1 composition and the admission/lifecycle state needed to coordinate its use |
| Turn | One explicitly caller-initiated and admitted cognitive request ending in one existing final result or a surfaced failure |
| Preparation | An explicit operation that establishes the Context and Brain binding for subsequent turns |
| Admission | The state during which new operations may be accepted |
| Shutdown | A request to close admission and initiate cleanup |

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
5. **Turn In Progress** - Turn operation admitted and executing
6. **Admission Closed** - Shutdown has begun, no new operations may be admitted
7. **Cleanup In Progress** - Cleanup has been invoked after admitted work settles

State transitions are defined as follows:

```
Not Prepared → Preparing → Ready
Not Prepared → Preparing → Preparation Failed
Ready → Turn In Progress → Ready (after successful turn)
Ready → Turn In Progress → Admission Closed (if shutdown requested during turn)
Preparation Failed → Admission Closed (if shutdown requested)
Ready → Admission Closed (if shutdown requested)
Turn In Progress → Admission Closed (if shutdown requested during turn)
Admission Closed → Cleanup In Progress (after admitted work settles)
Cleanup In Progress → Terminal Closed
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

## Shutdown

- Shutdown closes admission to new operations
- If an operation is already admitted, it is allowed to settle without cancellation
- Cleanup is invoked only after admitted work settles
- Repeated shutdown requests observe the existing terminal state

## Invalid Operations

Operations are rejected when:
- Preparation attempted after successful preparation
- Turn attempted before preparation
- Turn attempted while admission is closed
- Overlapping operations (preparation or turn) are submitted
- Shutdown requested while already in cleanup state

---

# Preparation Correspondence

Preparation attempts must be explicitly initiated by the caller.

A preparation attempt may result in:
1. **Success** - Runtime transitions to Ready state
2. **Failure** - Runtime transitions to Preparation Failed state

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
5. **Repetition** - Repeated shutdown requests observe existing terminal state

Shutdown does not:
- Claim global revocation of independently retained Engine/Context/Brain handles
- Automatically retry cleanup
- Cancel admitted operations
- Permit new preparation or turn after closure begins

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

# Version History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 1.0.0   | 2026-09-15 | Initial Draft based on ADR-0030 decisions |

---

# Engineering Motto

> A well-defined runtime contract enables predictable multi-turn application behavior.
