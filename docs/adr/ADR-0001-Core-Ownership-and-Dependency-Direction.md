# ADR-0001 — Core Ownership and Dependency Direction

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-10 |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. is designed as a capability-oriented AI platform composed of independent Engines, Skills, Providers, Clients, and Infrastructure.

The project required a clear definition of what the Core owns, what it does not own, and how dependencies should flow across the platform.

Without explicit ownership rules, architectural drift would eventually occur, allowing business logic, infrastructure concerns, or vendor-specific implementations to leak into the Core.

---

# Problem Statement

The platform requires a stable architectural center.

Several questions must be answered explicitly:

- What belongs to the Core?
- What does not belong to the Core?
- Who owns Contracts?
- Who owns Events?
- Which direction may dependencies follow?
- Can the Core depend on any external implementation?

Without a formal decision, different contributors could interpret these responsibilities differently.

---

# Decision

The Core is the architectural foundation of O.R.I.O.N.

The Core owns the language of the platform.

The Core defines:

- Domain Models
- Value Objects
- Contracts
- Event Definitions
- Identifiers
- Shared Types
- Exceptions
- Policies
- Capability Definitions

The Core never contains technology-specific implementations.

---

# Dependency Direction

Dependencies always point toward the Core.

```
Clients
        ↓
Engines
        ↓
Providers
        ↓
Contracts
        ↓
Core
```

The Core depends on nothing.

---

# Architectural Rules

The following dependencies are permitted.

```
Engine
        ↓
Core
```

```
Provider
        ↓
Contract
        ↓
Core
```

```
Skill
        ↓
Engine Contracts
        ↓
Core
```

The following dependencies are forbidden.

```
Core
        ↓
Provider
```

```
Core
        ↓
Engine
```

```
Core
        ↓
Framework
```

```
Core
        ↓
Infrastructure
```

```
Engine
        ↓
Client
```

```
Provider
        ↓
Client
```

---

# Ownership

Ownership does not imply implementation.

The Core owns definitions.

Engines own behavior.

Providers own technology integration.

Skills own executable capabilities.

Clients own user interaction.

Infrastructure owns operational concerns.

---

# Contracts

Contracts are defined by the Core.

Contracts describe capabilities.

Contracts never reference implementation technologies.

Implementations must conform to Contracts.

---

# Events

The Core defines Event schemas.

Publishing responsibility belongs to the corresponding Engine.

Ownership of an Event schema does not imply runtime ownership.

---

# Capability Registry

The Core defines available capability types.

The runtime registry is created during platform bootstrap.

The Core defines what capabilities exist.

The runtime determines which capabilities are available.

---

# Rationale

This approach provides:

- Strong architectural boundaries.
- Vendor independence.
- Stable abstractions.
- Long-term maintainability.
- Replaceable implementations.
- Testability.

It also minimizes coupling between business logic and infrastructure.

---

# Alternatives Considered

## Alternative A

Allow Engines to define their own Contracts.

Rejected.

Reason:

Different Engines could create incompatible abstractions.

---

## Alternative B

Allow Providers to expose SDK-specific interfaces.

Rejected.

Reason:

Business logic would become coupled to external technologies.

---

## Alternative C

Place Contracts inside Infrastructure.

Rejected.

Reason:

Infrastructure should implement Contracts, not define them.

---

# Consequences

Positive:

- Stable Core.
- Independent implementations.
- Predictable dependency graph.
- Easier testing.
- Easier provider replacement.

Negative:

- Slightly higher upfront design effort.
- Additional abstraction layers.

These trade-offs are acceptable given the long-term goals of the project.

---

# Risks

Potential over-abstraction.

Mitigation:

Only create abstractions when multiple implementations are realistically expected.

---

# Dependencies

- OES-0002 — Engine Design
- OES-0004 — Contracts
- OES-0005 — Events
- OES-0006 — Provider Design
- ARCH-0001 — Core Architecture

---

# Future Review

This decision should be reviewed before Platform v2.0.0 or if the platform adopts distributed execution or multiple runtime environments.

---

# Change History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 2026-07-10 | Initial architecture decision. |

---

# Engineering Motto

> The Core defines the language. Every other component speaks it.