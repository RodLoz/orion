# Glossary

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.4.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-19 |
| **Applies To** | Entire Platform |

---

# Purpose

This document defines the official vocabulary of O.R.I.O.N.

Every document, implementation, specification, and AI agent should use these definitions consistently.

If multiple interpretations exist, apply `DOCUMENT-AUTHORITY.md`. This glossary standardizes vocabulary but does not override ADRs, Specifications, or Engineering Standards.

---

# Core Concepts

## Capability

A capability represents something O.R.I.O.N. is able to do.

Capabilities describe behavior rather than implementation.

Examples:

- Voice Processing
- Memory Management
- Planning
- Identity Verification
- Context Building

Capabilities are owned by Engines.

---

## Engine

An Engine is the owner of a capability.

In architectural language, an Engine is the logical capability-owning component whose behavior is realized at runtime. It is not a deployment unit or a synonym for a service.

Each Engine is responsible for exactly one domain of intelligence.

Engines expose Contracts.

Capability Engines own capability behavior and domain semantics. The Core remains the canonical custodian of shared architectural Contract definitions.

Engines publish domain Events when a meaningful completed fact exists and they are authorized to represent its semantics.

Engines never communicate directly with other Engines.

Examples:

- Brain Engine
- Voice Engine
- Memory Engine
- Knowledge Engine
- Planning Engine
- Identity Engine

---

## Skill

A Skill extends the platform by orchestrating one or more capabilities.

A Skill is an executable capability package that exposes operations by coordinating Engine- or Adapter-owned Contracts. It does not become the semantic owner of the Engine capabilities it invokes.

Skills never own intelligence.

Skills consume Engine Contracts.

Skills may publish Events.

Skills are independently deployable.

Examples:

- Calendar
- GitHub
- Spotify
- IBM Sterling
- Home Assistant

---

## Provider

A Provider implements a technology-specific capability.

Providers are replaceable.

Examples:

- OpenAI
- Azure OpenAI
- Whisper
- ElevenLabs
- PostgreSQL
- Redis

Providers are never referenced directly by business logic.

---

## Adapter

An Adapter connects O.R.I.O.N. with an external ecosystem.

Examples:

- Google Calendar Adapter
- GitHub Adapter
- Home Assistant Adapter
- Slack Adapter

Adapters translate between external APIs and internal Contracts.

---

## Contract

A Contract defines how components communicate.

Contracts are stable.

Contracts define behavior.

Contracts never define implementation.

Examples:

- MemoryRepository
- LlmProvider
- SpeechToTextProvider
- EventPublisher

---

## Event

An Event represents something that has already happened.

Events describe facts.

Examples:

- UserAuthenticated
- VoiceCaptured
- SkillExecuted
- MemoryStored

Events are immutable.

The Core custodies shared Event Contracts and schemas. A capability or domain owns Event semantics. An Engine, Adapter, or other authorized component may publish only Events whose semantics it is authorized to represent.

Domain Events, integration Events, and platform or Infrastructure Events retain distinct semantic owners. Runtime publication does not transfer semantic ownership.

---

## Core

The Core defines the language of O.R.I.O.N.

The Core contains:

- Domain Models
- Contracts
- Events
- Interfaces
- Types
- Exceptions

The Core must remain independent from frameworks and providers.

The Core defines shared domain language, platform-wide constraints, architectural policies, and cross-capability invariants. Capability-specific business rules, semantic decisions, and behavior remain owned by the applicable Engine.

---

## Client

A Client is an interface through which users interact with O.R.I.O.N.

Clients never own business logic.

Examples:

- Mobile
- Desktop
- Watch
- Web
- IoT Device

---

## Context

Context represents the temporary selection or projection of information relevant to the current operational or reasoning situation.

Context may include:

- Current user
- Current device
- Current conversation
- Current task
- Environment
- Time
- Location

Context may reference or project Memory and Knowledge without transferring ownership.

Context is transient.

### Context Lineage

A Context Lineage represents the logical evolution of related Context Revisions and has one stable Context Lineage Identity.

### Context Revision

A Context Revision is one immutable representation of Context within a lineage. Each revision has its own unique Context Revision Identity and a revision number or equivalent ordering semantic.

### Active Context

Active Context is a Context Revision in the Active lifecycle state and valid for consumption. It is not a separate identity model.

### Context Snapshot

A Context Snapshot is an immutable materialized representation of one Context Revision. Retention for operational evidence does not make it cognitive Memory.

### Logical Reconstruction

Logical Reconstruction creates a logically equivalent Context Revision from authoritative, version-identifiable source revisions when those revisions remain available.

### Exact Replay

Exact Replay reproduces the exact Context Revision consumed by a reasoning cycle and requires sufficient retained immutable historical evidence.

---

## Memory

Memory represents intentionally retained experience and user continuity.

Memory is not conversation history.

Memory includes:

- Episodic experiences
- Intentionally retained interaction information
- Preferences
- Provenance that an assertion or interaction occurred

Memory is classified by semantic role, not by persistence.

---

## Knowledge

Knowledge represents justified claims accepted by the platform as sufficiently true for use.

Knowledge includes:

- Validated facts
- Domain knowledge
- Validated procedures
- Stable platform definitions

Knowledge preserves provenance and validation state.

Knowledge is an independent platform capability owned exclusively by the Knowledge Engine.

The Knowledge Engine governs claim acceptance, validation state, provenance requirements, lifecycle and version semantics, and contradiction resolution within the Knowledge domain.

The Core may custody shared Knowledge definitions, but it does not own Knowledge behavior. Providers and Adapters may support or supply information, but they do not determine what becomes accepted Knowledge.

---

## Session

A Session represents a temporary interaction between a user and O.R.I.O.N.

Sessions maintain temporary state.

Sessions eventually expire.

---

## Workflow

A Workflow is an ordered sequence of capabilities executed to achieve a goal.

Workflows may involve multiple Engines and Skills.

---

## Intelligence

The collective behavior produced by the collaboration of Engines.

No single Engine owns intelligence.

Intelligence emerges through orchestration.

---

## Brain

The Brain Engine orchestrates cognitive execution across Context, Reasoning, Planning, Memory, Knowledge, and Skill invocation through Contracts.

It manages high-level cognitive flow and may assemble the final cognitive result from capability outputs. It does not perform domain reasoning, replace the Reasoning Engine, independently generate reasoning content, or own the semantics of coordinated capabilities.

## Reasoning Engine

The Reasoning Engine owns inference and reasoning over exactly one immutable Active Context Revision. It produces reasoning outcomes and may propose candidate responses, conclusions, decisions, or next actions.

It does not orchestrate the full cognitive pipeline, execute Skills, own Planning or Context, or perform final transport, presentation, voice rendering, or Client delivery.

## Security Engine

The Security Engine owns security policy semantics, authorization decision semantics, and Security-domain rules.

Engines, Gateways, Adapters, Providers, and Infrastructure may enforce applicable Security-owned decisions at protected boundaries. Enforcement does not transfer Security semantic ownership and does not require direct synchronous coupling to the Security Engine.

---

## Platform

O.R.I.O.N. itself.

The platform consists of:

- Core
- Engines
- Skills
- Providers
- Adapters
- Infrastructure
- Clients

---

## User

A person interacting with O.R.I.O.N.

Users own:

- Identity
- Memory
- Preferences
- Permissions
- Devices

---

## Device

Any hardware capable of interacting with O.R.I.O.N.

Examples:

- Smartphone
- Smartwatch
- Desktop
- Smart Speaker
- Raspberry Pi
- Vehicle

Devices access intelligence.

They do not contain intelligence.

---

## Integration

A connection between O.R.I.O.N. and an external system.

Integrations are implemented through Adapters.

---

## Observability

The ability to understand what the platform is doing.

Observability includes:

- Logs
- Metrics
- Traces
- Events
- Health Checks

---

## Architectural Integrity

The property that ensures the platform remains consistent with its engineering principles.

Every contribution should preserve Architectural Integrity.

---

# Naming Rules

Contributors should always use the official terminology defined in this document.

Examples:

✔ Engine

✔ Skill

✔ Provider

✔ Adapter

✔ Capability

Avoid ambiguous alternatives such as:

✘ Service (when Engine is intended)

✘ Plugin (when Skill is intended)

✘ Module (when Capability is intended)

---

# Related Documents

- README.md
- MANIFESTO.md
- AGENTS.md
- Architecture
- OES-0000 — Engineering Philosophy
- OES-0002 — Engine Design

---

# Engineering Motto

> Shared language creates shared understanding.
