# ARCH-0001-Core-Architecture.md

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.2.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-19 |
| **Applies To** | O.R.I.O.N. Core |

---

# Purpose

This specification defines the architecture of the O.R.I.O.N. Core.

The Core is the foundation of the platform.

Every Engine, Skill, Provider, Adapter, Client, and Infrastructure component depends on the Core.

The Core depends on nothing.

---

# Vision

The Core defines the language of O.R.I.O.N.

It does not implement intelligence.

It defines how intelligence is described.

---

# Architectural Rule

Dependencies always point toward the Core.

The Core never depends on:

- Frameworks
- SDKs
- Databases
- AI Providers
- HTTP
- UI
- Infrastructure

The Core must remain completely technology independent.

---

# Responsibilities

The Core is the canonical custodian of shared architectural Contracts and owns the platform definitions listed below:

- Domain Models
- Contracts
- Events
- Value Objects
- Exceptions
- Architectural Policy Definitions
- Platform-Wide Constraints
- Types
- Constants
- Identifiers
- Capability Definitions

The Core never owns implementations.

The Core MAY define shared domain language, cross-capability invariants, platform-wide constraints, architectural policies, and the types or Contracts through which policies are expressed.

The Core MUST NOT own capability-specific business rules, semantic decisions, or behavior. Those responsibilities remain with the owning capability Engine. Custody of a shared model or policy definition does not make the Core a second semantic owner.

The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types.

The Core does not own Knowledge behavior, claim acceptance, validation state, provenance governance, lifecycle semantics, version semantics, or contradiction resolution. Those responsibilities belong to the Knowledge Engine.

---

# Core Principles

The Core must remain:

- Small
- Stable
- Explicit
- Independent
- Framework-free
- Vendor-neutral

---

# Core Structure

```text
core/

contracts/

events/

models/

value_objects/

types/

exceptions/

constants/

identifiers/

capabilities/

policies/

version.py
```

---

# Contracts

The Core custodies shared architectural Contracts used by the platform, including shared schemas, identifiers, interfaces, event envelopes, and cross-capability definitions.

Contract custody governs shared definitions, compatibility, and versioning. It does not transfer capability behavior or domain semantic ownership from an Engine to the Core. Providers, Adapters, and other implementation layers implement or translate Contracts without changing their semantics.

Examples:

MemoryRepository

SpeechToTextProvider

SkillExecutor

Planner

IdentityProvider

No implementation exists inside the Core.

---

# Events

The Core defines Event schemas.

Examples:

VoiceCaptured

MemoryStored

SkillExecuted

WorkflowCompleted

Events remain immutable.

---

# Models

Models describe the business language.

Examples:

User

Device

Memory

Skill

Capability

Session

Workflow

Models define shared domain language and MAY enforce platform-wide or cross-capability invariants.

Models MUST NOT become owners of capability-specific business behavior.

Models do not depend on infrastructure.

---

# Value Objects

Value Objects describe immutable concepts.

Examples:

Email

DeviceId

SessionId

UserId

EngineId

CorrelationId

Timestamp

Language

Locale

---

# Policies

Policies in the Core describe architectural policies, platform-wide constraints, cross-capability invariants, or shared policy Contracts.

Examples:

Permission Policy

Cross-Capability Compatibility Policy

Platform Privacy Constraint

Security Policy Contract

Capability-specific policy decisions and semantic rules remain with their owning Engines. Core policy custody defines shared language and constraints, not capability behavior or implementation.

---

# Identifiers

Every important entity should use strongly typed identifiers.

Avoid primitive strings whenever possible.

Examples:

SkillId

EngineId

ProviderId

WorkflowId

SessionId

---

# Types

Shared platform types belong here.

Examples:

Enums

Aliases

Common Interfaces

Result Types

---

# Exceptions

The Core defines platform exceptions.

Examples:

ValidationException

PermissionDenied

ConfigurationException

CapabilityUnavailable

ContractViolation

---

# Capability Registry

The Core defines capability identities and custodies capability-registry Contracts.

Examples:

VOICE

MEMORY

KNOWLEDGE

PLANNING

REASONING

IDENTITY

VISION

SECURITY

AUTOMATION

These stable definitions describe what O.R.I.O.N. can do. Mutable runtime availability, registration instances, selection, and health state remain outside the Core behind Core-custodied Contracts.

---

# Source-Code Dependency Rules

The canonical source-code dependency direction is:

```text
Clients -> Gateway / Application Boundary -> Engines / Skills -> Core Abstractions
Providers / Adapters / Infrastructure ------------------------> Core Abstractions
```

These arrows do not describe runtime call, data, or event flow. The Core MUST NOT depend on Engines, Skills, Providers, Adapters, Infrastructure, or Clients. Engines MUST NOT depend directly on concrete Providers, Adapters, or Infrastructure implementations. Skills MUST NOT depend directly on concrete external systems.

Allowed

Skill

↓

Contract

↓

Core

Allowed

Engine

↓

Core

Forbidden

Core

↓

Provider

Forbidden

Core

↓

Engine

Forbidden

Core

↓

Framework

---

# Initialization

The Core is loaded first.

Then:

Contracts

↓

Capability Registry

↓

Configuration

↓

Providers

↓

Engines

↓

Skills

↓

Clients

---

# Versioning

The Core follows Semantic Versioning.

Breaking changes should be extremely rare.

---

# Testing

The Core must maintain:

Comprehensive unit test coverage for domain rules, proportionate to their criticality.

Contract validation.

Event validation.

Identifier validation.

---

# Success Criteria

The Core is successful when:

Every other component depends on it.

It depends on nothing.

Its public Contracts remain stable.

It survives framework migrations.

It survives provider replacements.

---

# Future Evolution

The Core should evolve carefully.

Every breaking modification requires:

ADR

Migration Plan

Version Increment

Documentation Update

---

# Related Documents

- OES-0000 — Engineering Philosophy
- OES-0002 — Engine Design
- OES-0004 — Contracts
- OES-0005 — Events
- Glossary

---

# Engineering Motto

> The Core defines the language. Everything else speaks it.
