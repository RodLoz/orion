# ARCH-0001-Core-Architecture.md

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-09 |
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

The Core owns:

- Domain Models
- Contracts
- Events
- Value Objects
- Exceptions
- Policies
- Types
- Constants
- Identifiers
- Capability Definitions

The Core never owns implementations.

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

The Core defines every Contract used by the platform.

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

Models contain business rules.

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

Policies describe platform rules.

Examples:

Permission Policy

Memory Policy

Security Policy

Skill Policy

Policies contain decisions.

Not implementations.

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

Every capability should be registered in the Core.

Examples:

VOICE

MEMORY

PLANNING

REASONING

IDENTITY

VISION

SECURITY

AUTOMATION

The registry defines what O.R.I.O.N. can do.

---

# Dependency Rules

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

100% unit test coverage for domain rules.

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