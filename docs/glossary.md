# Glossary

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-09 |
| **Applies To** | Entire Platform |

---

# Purpose

This document defines the official vocabulary of O.R.I.O.N.

Every document, implementation, specification, and AI agent should use these definitions consistently.

If multiple interpretations exist, the definitions in this document take precedence.

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

Each Engine is responsible for exactly one domain of intelligence.

Engines expose Contracts.

Engines publish Events.

Engines never communicate directly with other Engines.

Examples:

- Brain Engine
- Voice Engine
- Memory Engine
- Planning Engine
- Identity Engine

---

## Skill

A Skill extends the platform by orchestrating one or more capabilities.

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

Context represents the information required to make intelligent decisions.

Context may include:

- Current user
- Current device
- Current conversation
- Current task
- Environment
- Time
- Location

Context is transient.

---

## Memory

Memory represents persistent knowledge.

Memory is not conversation history.

Memory includes:

- Preferences
- Facts
- Relationships
- Learned behavior
- Long-term knowledge

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

The Brain Engine coordinates platform execution.

It does not own every capability.

It orchestrates capabilities.

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