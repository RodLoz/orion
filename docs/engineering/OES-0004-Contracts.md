# OES-0004 — Contracts

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-19 |
| **Applies To** | All Contracts |

---

# Purpose

This standard defines how components communicate inside O.R.I.O.N.

Contracts provide stable boundaries between capabilities.

Every Engine, Skill, Provider, and Adapter communicates through Contracts.

Implementations may change.

Contracts should remain stable.

---

# Scope

This standard applies to:

- Engine Contracts
- Provider Contracts
- Adapter Contracts
- Repository Contracts
- Event Contracts

---

# Definition

A Contract is a stable agreement between two components.

A Contract defines:

- Purpose
- Inputs
- Outputs
- Expected behavior
- Failure behavior

A Contract never defines implementation details.

---

# Why Contracts Exist

Contracts provide:

- Decoupling
- Replaceability
- Testability
- Maintainability
- Predictability

Without Contracts, architectural integrity cannot be preserved.

---

# Architectural Rule

Components communicate through Contracts.

Never through concrete implementations.

Correct

Brain Engine

↓

Memory Contract

↓

Memory Engine

Incorrect

Brain Engine

↓

Memory Engine

---

# Ownership

Contract governance MUST distinguish three responsibilities:

- **Contract custody**: the Core is the canonical custodian of shared architectural Contract definitions, including shared schemas, identifiers, interfaces, event envelopes, cross-capability definitions, and their compatibility and versioning rules.
- **Domain semantic ownership**: exactly one capability Engine owns the behavior and domain meaning expressed through a capability Contract.
- **Implementation responsibility**: an implementation layer implements or translates the Contract without changing its semantics.

Core custody MUST NOT imply ownership of capability behavior. Providers and Adapters MUST NOT become semantic owners merely because they implement or translate a Contract.

Examples

The Voice Engine owns Voice behavior; Core custodies shared Voice Contracts; a Provider may implement a provider-facing Contract.

The Memory Engine owns Memory behavior; Core custodies shared Memory Contracts; an implementation layer may implement persistence without owning Memory semantics.

The Identity Engine owns Identity behavior; Core custodies shared Identity Contracts; an Adapter or Provider may translate or implement them without owning Identity semantics.

---

# Contract Responsibilities

Every Contract must define:

Purpose

Inputs

Outputs

Possible failures

Version

Domain semantic owner and schema custodian

Expected guarantees

---

# Contract Characteristics

Good Contracts should be:

Stable

Simple

Explicit

Technology-independent

Versionable

Testable

Replaceable

---

# Dependency Rule

Dependencies always point toward Contracts.

Never toward implementations.

The following is runtime interaction flow, not source-code dependency direction.

Correct runtime interaction

Reasoning Engine

↓

Memory Contract

↓

Memory Engine

Both Engine implementations depend on the Core-custodied Memory Contract; the Contract does not source-depend on either Engine.

Incorrect

Reasoning Engine

↓

Memory Engine

↓

Database

---

# Versioning

Contracts follow Semantic Versioning.

Breaking changes require a major version.

Backward-compatible changes require a minor version.

Bug fixes require a patch version.

---

# Contract Evolution

Prefer extending Contracts over replacing them.

Breaking changes require:

Documentation updates

ADR

Migration strategy

---

# Engine Contracts

Every Engine should expose public Contracts.

Examples

MemoryRepository

SkillExecutor

VoiceRecognizer

Planner

ContextResolver

IdentityVerifier

---

# Provider Contracts

Providers implement technology-specific Contracts.

Examples

SpeechToTextProvider

TextToSpeechProvider

VectorDatabaseProvider

CacheProvider

LLMProvider

---

# Adapter Contracts

Adapters expose external systems through Contracts.

Examples

GitHubRepository

SpotifyPlayer

CalendarProvider

NotificationProvider

---

# Repository Contracts

Repositories abstract persistence.

Business logic never depends on databases.

Correct

MemoryRepository

↓

PostgreSQL Provider

Incorrect

Memory Engine

↓

SQL Query

---

# Failure Handling

Contracts must define expected failures.

Examples

ValidationError

PermissionDenied

ProviderUnavailable

ConfigurationError

Timeout

UnexpectedFailure

---

# Testing

Every Contract should have:

Contract Tests

Compatibility Tests

Behavior Validation

Documentation Examples

---

# Documentation

Every Contract should include:

Purpose

Owner

Inputs

Outputs

Failure cases

Examples

Version

---

# Anti-Patterns

Avoid:

Leaking implementation details

Technology-specific Contracts

Business logic inside Contracts

Circular dependencies

Breaking compatibility without version changes

Hidden behaviors

---

# Definition of Done

A Contract is complete when:

✔ Purpose documented

✔ Inputs defined

✔ Outputs defined

✔ Errors documented

✔ Tests implemented

✔ Version assigned

✔ Owner identified

✔ Documentation completed

---

# Related Standards

- OES-0000 — Engineering Philosophy
- OES-0002 — Engine Design
- OES-0003 — Skill Design
- OES-0005 — Events

---

# Engineering Motto

> Contracts protect architecture from implementation.
