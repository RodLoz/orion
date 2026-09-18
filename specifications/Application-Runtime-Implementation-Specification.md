# Application-Runtime-Implementation-Specification.md

| Field | Value |
|--------|--------|
| **Status** | Draft |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-09-18 |
| **Updated** | 2026-09-18 |
| **Applies To** | Caller-driven multi-turn application runtime implementation |

---

# Purpose

This specification defines the implementation obligations for the caller-driven multi-turn application runtime as established by ADR-0030 and the active Application Runtime Specification.

The implementation must translate the approved semantic contract into bounded, process-local behavior while preserving all authority boundaries and operational invariants.

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
5. **Turn In Progress** - Turn operation admitted and executing
6. **Admission Closed** - Shutdown has begun, no new operations may be admitted
7. **Cleanup In Progress** - Cleanup has been invoked after admitted work settles

State transitions are managed through atomic operations that ensure consistency.

---

# Preparation Bookkeeping

The implementation must:

- Track exactly one preparation attempt per runtime instance
- Reject subsequent preparation attempts within the same runtime
- Preserve the result of the first preparation attempt (success or failure)
- Require a new runtime instance for re-preparation
- Maintain the Context/Brain binding established during successful preparation

---

# Admission Control

The implementation must enforce:

- Preparation and turn operations are strictly sequential
- No overlapping operations (preparation or turn) are permitted
- Only one operation may be admitted at a time
- Operations are rejected when:
  - Preparation attempted after successful preparation
  - Turn attempted before preparation
  - Turn attempted while admission is closed
  - Overlapping operations are submitted
  - Shutdown requested while already in cleanup state

---

# Turn Settlement

The implementation must:

- Execute turns according to existing Brain orchestration semantics
- Allow ordinary failed turns to settle and permit subsequent explicitly caller-initiated turns when shutdown has not begun
- Not implement automatic retry, fallback, or autonomous continuation
- Preserve the existing turn execution boundaries and outcome correspondence

---

# Shutdown Coordination

The implementation must:

- Close admission immediately upon shutdown request
- Allow already-admitted operations to settle without cancellation
- Invoke cleanup only after admitted work settles
- Preserve cleanup failure observability
- Follow established terminal/shared-cleanup semantics for repeated shutdown requests
- Not claim global revocation of independently retained Engine/Context/Brain handles

---

# Cleanup Coordination

The implementation must:

- Execute cleanup after admitted work settles
- Preserve existing Knowledge-resource cleanup ownership
- Not introduce application-wide revocation of retained Context/Brain handles
- Maintain observability of cleanup failures
- Follow the established shutdown semantics for cleanup coordination

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

---

# Version History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 1.0.0   | 2026-09-18 | Initial Draft based on approved runtime semantics |

---
