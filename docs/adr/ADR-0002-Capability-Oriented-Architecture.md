# ADR-0002 — Capability-Oriented Architecture

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-19 |
| **Decision Type** | Architecture Decision |

---

# Context

Traditional software architectures are commonly organized around layers, services, or technical modules.

O.R.I.O.N. aims to become an extensible AI Operating Network capable of evolving across multiple devices, providers, and execution environments over many years.

To support this vision, the platform requires an architectural model centered on capabilities rather than technologies.

---

# Problem Statement

How should O.R.I.O.N. organize its internal architecture so that new functionality can be added without coupling business logic to specific technologies or implementations?

The platform requires an architectural model that:

- scales horizontally;
- remains vendor independent;
- supports multiple AI providers;
- supports multiple client types;
- allows incremental evolution.

---

# Decision

O.R.I.O.N. adopts a Capability-Oriented Architecture.

A capability represents a domain-level ability of the platform.

Capabilities are stable.

Implementations may change.

Examples of capabilities include:

- Voice
- Identity
- Memory
- Knowledge
- Context
- Reasoning
- Planning
- Vision
- Security
- Automation
- Skills

Capabilities define what the platform can do.

They do not define how those abilities are implemented.

---

# Capability Ownership

Each capability is owned by exactly one Engine.

Examples:

| Capability | Owner |
|------------|-------|
| Voice | Voice Engine |
| Identity | Identity Engine |
| Memory | Memory Engine |
| Knowledge | Knowledge Engine |
| Context | Context Engine |
| Reasoning | Reasoning Engine |
| Planning | Planning Engine |
| Vision | Vision Engine |
| Skills | Skill Engine |
| Automation | Automation Engine |
| Security | Security Engine |

Ownership implies responsibility for behavior, lifecycle, validation, and runtime execution.

---

# Knowledge Capability Ownership

Knowledge is an independent platform capability.

The Knowledge Engine is the single architectural owner of the Knowledge capability.

Knowledge answers:

> **"What is accepted as sufficiently true?"**

The Knowledge Engine:

- owns Knowledge domain behavior;
- governs whether claims are accepted as Knowledge;
- governs validation state and provenance requirements;
- governs Knowledge lifecycle and version semantics;
- governs contradiction resolution within the Knowledge domain;
- exposes Knowledge through architectural Contracts;
- provides Knowledge references or projections to Context.

The Knowledge Engine MUST NOT:

- own storage technology;
- own or mutate Context;
- own or mutate Memory;
- perform Reasoning or Planning.

The Core MAY define or custody shared Knowledge Contracts, schemas, identifiers, and domain types according to Core ownership rules. The Core MUST NOT own Knowledge behavior.

Providers MAY implement technology required by Knowledge persistence, retrieval, indexing, validation support, or enrichment. Providers MUST NOT determine what is accepted as Knowledge.

Adapters MAY supply information from external ecosystems. Imported information MUST NOT become Knowledge automatically.

Reasoning MAY propose claims. Memory MAY provide evidence or provenance. Adapters and Providers MAY provide external observations. Only the Knowledge capability governs whether a claim becomes accepted Knowledge.

Semantic ownership and governance remain with the Knowledge Engine regardless of the physical persistence mechanism.

---

# Architectural Principles

Capabilities must:

- represent business concepts;
- be technology-independent;
- expose Contracts instead of implementations;
- publish Events when appropriate;
- remain independently testable.

Capabilities must not:

- depend on specific providers;
- expose SDK-specific APIs;
- embed infrastructure concerns;
- duplicate responsibilities.

---

# Engine Responsibilities

An Engine is the runtime implementation responsible for one capability.

Engines collaborate through Contracts and Events.

No Engine should assume ownership of another capability.

Capability Engines own capability behavior and domain semantics. The Core is the canonical custodian of shared architectural Contracts and their compatibility and versioning rules. Providers, Adapters, and other implementation layers implement or translate Contracts without becoming semantic owners.

Source-code dependencies point inward toward Core abstractions. Runtime call, data, and event flows do not reverse that direction. Engines and Skills MUST NOT depend on concrete Providers, Adapters, Infrastructure, or external systems.

---

# Extensibility

New capabilities may be introduced without modifying existing capabilities, provided they:

- define clear ownership;
- expose Contracts;
- integrate through documented Flows;
- comply with Engineering Standards.

---

# Rationale

This architecture:

- reduces coupling;
- improves modularity;
- enables parallel development;
- simplifies testing;
- supports long-term evolution;
- allows provider replacement without affecting business behavior.

---

# Alternatives Considered

## Layer-Oriented Architecture

Rejected.

Reason:

Business capabilities become fragmented across technical layers.

---

## Service-Oriented Architecture

Rejected.

Reason:

Services describe deployment boundaries rather than platform abilities.

---

## Framework-Oriented Architecture

Rejected.

Reason:

The platform would become tightly coupled to implementation technologies.

---

# Consequences

Positive:

- Stable domain boundaries.
- Clear ownership.
- Independent evolution.
- Easier maintenance.
- Better scalability.

Negative:

- Requires discipline when defining new capabilities.
- Adds initial design effort.

---

# Risks

Over-segmentation.

Mitigation:

A new capability should only be introduced when it represents a distinct business responsibility.

---

# Dependencies

- ADR-0001 — Core Ownership and Dependency Direction
- OES-0002 — Engine Design
- ARCH-0001 — Core Architecture

---

# Future Review

Review before Platform v2.0.0 or when introducing distributed execution across multiple runtimes.

---

# Change History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 2026-07-10 | Initial architecture decision. |
| 2.0.0 | 2026-07-19 | Established Knowledge as an independent capability owned by the Knowledge Engine. |

---

# Engineering Motto

> Capabilities define what O.R.I.O.N. can do. Engines define how it does it.
