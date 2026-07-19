# ADR-0001 — Core Ownership and Dependency Direction

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.1.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-19 |
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

The Core is the canonical custodian of shared architectural Contracts and defines:

- Domain Models
- Value Objects
- Contracts
- Event Definitions
- Identifiers
- Shared Types
- Exceptions
- Architectural Policy Definitions
- Platform-Wide Constraints
- Capability Definitions

The Core never contains technology-specific implementations.

---

# Source-Code Dependency Direction

Source-code dependencies always point inward toward Core abstractions.

```text
Clients -> Gateway / Application Boundary -> Engines / Skills -> Core Abstractions
Providers / Adapters / Infrastructure ------------------------> Core Abstractions
```

These arrows represent source-code dependency direction, not runtime call, data, or event flow.

The Core MUST NOT depend on Engines, Skills, Providers, Adapters, Infrastructure, or Clients. Engines MUST NOT depend directly on concrete Providers, Adapters, or Infrastructure implementations. Skills MUST NOT depend directly on concrete external systems.

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

Ownership does not imply implementation. Contract governance distinguishes custody, domain semantic ownership, and implementation responsibility.

The Core has custody of shared architectural Contract definitions and their compatibility and versioning rules.

Engines own capability behavior and domain semantics.

The Core MAY define platform-wide invariants, architectural policies, and shared rule vocabulary. It MUST NOT own capability-specific business rules, semantic decisions, or behavior. Those remain with the owning capability Engine.

Custody of a shared model, policy Contract, or rule type in the Core does not transfer semantic ownership of a capability decision to the Core.

Providers and Adapters implement or translate Contracts without becoming semantic owners of the capability.

Skills own executable capabilities.

Clients own user interaction.

Infrastructure owns operational concerns.

---

# Contracts

Shared architectural Contracts are defined under Core custody.

Core custody includes shared schemas, identifiers, interfaces, event envelopes, and cross-capability Contract definitions. It MUST NOT imply ownership of capability behavior.

Contracts describe capabilities.

Contracts never reference implementation technologies.

Implementations must conform to Contracts.

An implementation layer implements a Contract without changing its semantics.

---

# Events

The Core custodies shared Event Contracts, envelopes, and schemas.

Event governance distinguishes schema custody, semantic ownership, and runtime publication authority:

- a capability Engine or domain owns the semantics of its domain Events;
- an Adapter or integration domain owns the semantics of its integration Events;
- the appropriate platform domain owns platform or Infrastructure Event semantics;
- an authorized runtime publisher MAY be an Engine, Adapter, or other component appropriate to the Event type.

A runtime publisher MUST publish only Events whose semantics it is authorized to represent. An Adapter MUST NOT publish an Engine-owned domain Event as though it were the semantic owner. Core schema custody does not imply semantic ownership or runtime publication authority.

No Engine or other component is universally required to publish an Event when no meaningful completed fact exists.

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
| 2.0.0 | 2026-07-19 | Clarified Contract custody and inward dependency direction. |
| 2.1.0 | 2026-07-19 | Distinguished platform invariants from capability behavior and clarified Event custody, semantics, and publication authority. |

---

# Engineering Motto

> The Core defines the language. Every other component speaks it.
