# OES-0003 — Skill Design

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-09 |
| **Applies To** | All Skills |

---

# Purpose

This standard defines how Skills are designed, implemented, versioned, and integrated into O.R.I.O.N.

Skills are the primary mechanism used to extend the platform without modifying the Core.

---

# Scope

This standard applies to every Skill, regardless of its purpose.

Examples include:

- Calendar
- Email
- Weather
- Spotify
- GitHub
- IBM
- Smart Home
- Finance
- Vision
- Translation

---

# Definition

A Skill is an independent capability package that extends O.R.I.O.N.

A Skill may orchestrate multiple Engines.

A Skill never owns platform intelligence.

That responsibility belongs to the Engines.

---

# Responsibilities

A Skill may:

- Execute workflows.
- Consume Engine Contracts.
- Consume Providers indirectly.
- Publish Events.
- Consume Events.
- Request user confirmation.
- Store Skill-specific configuration.
- Expose public capabilities.

A Skill must not:

- Modify the Core.
- Bypass Contracts.
- Access Providers directly.
- Contain platform-wide business logic.

---

# Skill Lifecycle

Discovery

↓

Validation

↓

Registration

↓

Initialization

↓

Execution

↓

Shutdown

Skills should be loadable without restarting the platform whenever possible.

---

# Skill Manifest

Every Skill must include a manifest.

Minimum fields:

```yaml
id: calendar

name: Calendar

version: 1.0.0

description: Calendar management

author: Orion Contributors

license: MIT

permissions:

- calendar.read

- calendar.write

capabilities:

- create_event

- update_event

- delete_event

events:

publishes:

- EventCreated

consumes:

- UserAuthenticated
```

---

# Required Structure

```text
calendar/

manifest.yaml

README.md

CHANGELOG.md

LICENSE

permissions.yaml

src/

tests/

assets/
```

---

# Naming

Skill IDs must:

- Be lowercase.
- Use kebab-case.
- Remain globally unique.

Examples:

calendar

weather

github

home-assistant

finance

---

# Versioning

Skills follow Semantic Versioning.

MAJOR.MINOR.PATCH

Breaking changes require a major version.

---

# Dependencies

Skills may depend on:

Engine Contracts

Shared Packages

Specifications

Other Skills only through Contracts.

Direct implementation dependencies are forbidden.

---

# Permissions

Permissions must be explicit.

Example:

calendar.read

calendar.write

calendar.delete

Never use wildcard permissions.

---

# Configuration

Configuration belongs outside source code.

Secrets must never be stored inside Skills.

---

# Events

Skills should communicate through Events whenever appropriate.

Example:

EventCreated

IssueOpened

InvoicePaid

MemoryUpdated

---

# Logging

Logging should include:

Skill ID

Version

Execution ID

Duration

Result

Errors

---

# Error Handling

Every Skill should expose explicit failures.

Examples:

PermissionDenied

ConfigurationMissing

ProviderUnavailable

ValidationFailed

UnexpectedFailure

---

# Testing

Every Skill must include:

Unit Tests

Integration Tests

Manifest Validation

Permission Validation

---

# Documentation

Every Skill must provide:

README

Manifest

Permission description

Examples

Known limitations

---

# Security

Skills should operate under least privilege.

Only request permissions that are actually required.

Sensitive actions should request user confirmation.

---

# Observability

Every Skill should expose:

Execution count

Success rate

Failure rate

Latency

Health information

---

# Anti-Patterns

Avoid:

Business logic in manifests

Hidden permissions

Global state

Provider-specific code

Duplicated workflows

Silent failures

Unstructured logging

---

# Definition of Done

A Skill is complete when:

✔ Manifest exists

✔ Permissions defined

✔ Tests implemented

✔ Documentation completed

✔ Contracts respected

✔ Logging implemented

✔ Events documented

✔ Security validated

---

# Related Standards

- OES-0000 — Engineering Philosophy

- OES-0002 — Engine Design

- OES-0004 — Contracts

- OES-0005 — Events

---

# Engineering Motto

> Skills extend intelligence. Engines own intelligence.