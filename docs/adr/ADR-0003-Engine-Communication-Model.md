# ADR-0003 — Engine Communication Model

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.1.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-19 |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. consists of multiple independent Engines responsible for distinct platform capabilities.

These Engines must collaborate while remaining loosely coupled.

The communication model directly influences maintainability, scalability, observability, testing, and future deployment options.

---

# Problem Statement

How should Engines communicate?

The communication model must:

- minimize coupling;
- preserve Engine autonomy;
- support synchronous and asynchronous interactions;
- allow future distributed execution;
- remain simple for local development.

---

# Decision

O.R.I.O.N. adopts a hybrid communication model.

Engines communicate through:

1. Contracts
2. Events

The communication mechanism depends on the interaction type.

---

# Communication Types

## Synchronous Communication

Used when an immediate result is required.

Characteristics:

- request/response
- deterministic
- short-lived
- caller waits

Implemented through Contracts.

Example:

```text
Reasoning Engine
        │
        ▼
Memory Contract
        │
        ▼
Memory Engine
```

---

## Asynchronous Communication

Used when no immediate response is required.

Characteristics:

- event-driven
- loosely coupled
- multiple subscribers
- resilient
- replayable

Implemented through Events.

Example:

```text
Voice Engine

↓

VoiceTranscribed

↓

Reasoning Engine

↓

Analytics Engine

↓

Audit Service
```

---

# Communication Rules

Engines MUST communicate through Contracts or Events.

Direct Engine-to-Engine references are prohibited.

Example:

```
Engine A

↓

Engine B
```

Not allowed.

Instead:

```
Engine A

↓

Contract

↓

Engine B
```

or

```
Engine A

↓

Event

↓

Subscribers
```

---

# Contract Usage

Contracts should be used when:

- immediate response required
- deterministic behavior expected
- validation required
- caller owns execution flow

Examples:

- Memory lookup
- Identity lookup
- Context retrieval

---

# Event Usage

Events should be used when:

- multiple consumers exist
- auditing is required
- notifications are generated
- asynchronous workflows are triggered

Examples:

- UserAuthenticated
- MemoryCreated
- SkillExecuted
- AutomationTriggered

---

# Engine Independence

No Engine should know:

- implementation details
- internal state
- technology stack
- provider selection

Only Contracts and Events are visible.

---

# Runtime Evolution

The communication model must support:

- single-process execution
- multi-process execution
- distributed deployment
- cloud-native deployment

Changing runtime topology must not require changing Engine behavior.

---

# Error Handling

Contract failures return explicit errors.

Event failures do not invalidate already published events.

Retry policies are implementation concerns.

---

# Observability

Every communication should support:

- Correlation ID
- Request ID
- Trace ID
- Timestamp
- Engine Identifier

Communication should be traceable end-to-end.

---

# Security

Every communication must respect:

- authentication
- authorization
- permission validation
- audit requirements

The Security Engine owns security policy semantics, authorization decision semantics, and Security-domain rules.

Enforcement occurs at the appropriate protected invocation or boundary point and MAY be performed by Engines, Gateways, Adapters, Providers, or Infrastructure as required. Every enforcing component MUST use Security-owned policy decisions, Contracts, or governed policy artifacts and MUST NOT acquire Security semantic ownership.

No component may bypass Security policy. Enforcement MUST NOT require direct Engine-to-Engine implementation coupling, and this decision does not require every action to synchronously call the Security Engine.

---

# Rationale

The hybrid model combines:

Contracts

- predictability
- simplicity
- explicit dependencies

Events

- extensibility
- scalability
- decoupling

This approach enables future evolution without redesigning Engine interactions.

---

# Alternatives Considered

## Direct Engine References

Rejected.

Reason:

Creates tight coupling and complicates testing.

---

## Events Only

Rejected.

Reason:

Simple request/response interactions become unnecessarily complex.

---

## Contracts Only

Rejected.

Reason:

Prevents efficient asynchronous workflows.

---

# Consequences

Positive:

- loose coupling
- high testability
- runtime flexibility
- scalable architecture

Negative:

- additional abstraction
- more documentation required
- event governance required

---

# Risks

Excessive event generation.

Mitigation:

Publish only meaningful domain events.

---

# Dependencies

- ADR-0001 — Core Ownership and Dependency Direction
- ADR-0002 — Capability-Oriented Architecture
- OES-0004 — Contracts
- OES-0005 — Events

---

# Future Review

Review before introducing distributed Engine execution or external message brokers.

---

# Change History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 2026-07-10 | Initial architecture decision. |
| 1.1.0 | 2026-07-19 | Distinguished Security policy and decision authority from enforcement at protected boundaries. |

---

# Engineering Motto

> Engines collaborate through contracts and events, never through direct dependencies.
