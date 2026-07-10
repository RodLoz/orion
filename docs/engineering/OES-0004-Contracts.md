# OES-0004 — Contracts

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-09 |
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

Every Contract has exactly one owner.

Examples

Voice Engine

owns

SpeechToText Contract

Memory Engine

owns

Memory Repository Contract

Identity Engine

owns

Identity Provider Contract

---

# Contract Responsibilities

Every Contract must define:

Purpose

Inputs

Outputs

Possible failures

Version

Owner

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

Correct

Reasoning Engine

↓

Memory Contract

↓

Memory Engine

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