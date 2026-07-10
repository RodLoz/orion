# OES-0010 — Versioning Standards

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-10 |
| **Applies To** | Entire Platform |

---

# Purpose

This standard defines how versioning is managed throughout the O.R.I.O.N. platform.

Versioning provides stability, traceability, compatibility, and predictable evolution across every engineering artifact.

This standard applies not only to software, but also to documentation, specifications, contracts, schemas, APIs, protocols, Engines, Skills, Providers, and Adapters.

---

# Versioning Philosophy

Everything that evolves must be versioned.

Versioning allows components to evolve independently while preserving compatibility.

Version numbers communicate engineering intent.

---

# Semantic Versioning

O.R.I.O.N. adopts Semantic Versioning.

```
MAJOR.MINOR.PATCH
```

Example:

```
2.4.7
```

Where:

- MAJOR → Breaking changes
- MINOR → Backward-compatible features
- PATCH → Backward-compatible fixes

---

# Versioned Artifacts

The following artifacts MUST have versions:

- Platform
- Core
- Engines
- Skills
- Providers
- Adapters
- Contracts
- Events
- Protocols
- Schemas
- APIs
- Documentation
- Engineering Standards
- Architecture Specifications

---

# Platform Version

The platform has a single global version.

Example:

```
O.R.I.O.N.

v1.0.0
```

The platform version does not replace component versions.

---

# Engine Versioning

Every Engine maintains its own version.

Example:

```
Identity Engine

v1.3.0
```

Engine versions evolve independently.

---

# Skill Versioning

Every Skill follows Semantic Versioning.

Example:

```
Calendar Skill

v2.1.4
```

Skill compatibility must be declared explicitly.

---

# Provider Versioning

Providers declare:

- Provider Version
- Supported Contract Version
- Supported Platform Version

Example:

```
OpenAI Provider

Version: 1.8.0

Supports:

Contract 2.x

Platform 1.x
```

---

# Contract Versioning

Contracts evolve cautiously.

Breaking changes require:

- Major Version Increment
- Migration Strategy
- ADR
- Documentation Update

Backward compatibility is preferred whenever possible.

---

# Event Versioning

Events are versioned independently.

Consumers should tolerate older versions whenever practical.

Breaking event changes require explicit migration.

---

# API Versioning

Public APIs should expose explicit versions.

Examples:

```
/api/v1/

```

Future versions:

```
/api/v2/

```

API versioning strategy should be documented separately.

---

# Schema Versioning

Every schema must declare its version.

Example:

```
event.schema.json

version

1.0.0
```

Schema compatibility should be validated automatically.

---

# Documentation Versioning

Engineering documents follow Semantic Versioning.

Examples:

```
OES-0006

Version

2.0.0
```

Major documentation updates indicate normative changes.

Editorial corrections increment PATCH.

---

# Compatibility

Every component should explicitly declare compatibility.

Examples:

Supports:

Platform 1.x

Contract 2.x

Protocol 1.x

Schema 3.x

---

# Deprecation

Deprecated components remain supported for a defined period.

Every deprecated artifact should include:

- Deprecation Notice
- Recommended Replacement
- Planned Removal Version

Example:

```
Status

Deprecated

Replacement

Provider Registry v2
```

---

# Breaking Changes

Breaking changes require:

- Major Version Increment
- ADR
- Migration Documentation
- Updated Specifications
- Compatibility Assessment

Breaking changes should be minimized.

---

# Release Types

Platform releases may include:

- Alpha
- Beta
- Release Candidate (RC)
- Stable
- Long-Term Support (LTS)

Example:

```
v1.0.0-beta.1
```

---

# Release Notes

Every release should include:

- Summary
- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

Release notes should be human-readable.

---

# Change Management

Every significant change should be traceable.

Preferred references include:

- Git Commit
- Pull Request
- ADR
- REVIEW
- Issue

---

# Migration

Breaking releases should include migration guidance.

Migration documentation should describe:

- What changed
- Why it changed
- Required actions
- Compatibility considerations

---

# Version Validation

Automated validation should ensure:

- Version consistency
- Compatibility declarations
- Dependency compatibility
- Schema compatibility

Validation should occur during CI.

---

# Lifecycle

Every artifact follows a lifecycle.

```
Draft

↓

Review

↓

Active

↓

Deprecated

↓

Superseded

↓

Archived
```

---

# Anti-Patterns

Avoid:

- Unversioned artifacts
- Hidden breaking changes
- Multiple version sources
- Manual compatibility tracking
- Silent deprecations
- Version reuse

---

# Definition of Done

Versioning is complete when:

- ✔ Version assigned
- ✔ Compatibility declared
- ✔ Release notes prepared
- ✔ Migration documented (if required)
- ✔ CI validation enabled
- ✔ Related documentation updated

---

# Related Standards

- OES-0004 — Contracts
- OES-0005 — Events
- OES-0006 — Provider Design
- OES-0008 — Documentation Standards
- OES-0009 — Security Standards

---

# Engineering Motto

> Versioning preserves trust while software evolves.