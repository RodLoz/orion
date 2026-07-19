# OES-0007 — Adapter Design

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.1.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-19 |
| **Applies To** | All Adapters |

---

# Purpose

This standard defines how Adapters integrate O.R.I.O.N. with external ecosystems.

Adapters isolate third-party systems from the platform by translating external APIs into internal Contracts.

They preserve architectural integrity while allowing O.R.I.O.N. to communicate with virtually any external service.

---

# Scope

This standard applies to every Adapter implemented by the platform.

Examples include:

- GitHub
- Spotify
- Google Calendar
- Microsoft 365
- IBM Sterling
- SAP
- Jira
- Home Assistant
- Slack
- Discord

---

# Definition

An Adapter is a bridge between O.R.I.O.N. and an external ecosystem.

Adapters translate external APIs into internal Contracts.

Adapters never own business logic.

Adapters never own intelligence.

---

# Responsibilities

An Adapter may:

- Authenticate against external systems.
- Translate API requests.
- Translate API responses.
- Normalize external data.
- Publish Events.
- Consume Events.
- Handle retries.
- Handle rate limits.

An Adapter must not:

- Modify platform architecture.
- Implement business rules.
- Bypass Contracts.
- Depend directly on Engines.

---

# Adapter Philosophy

External systems evolve independently.

O.R.I.O.N. should not.

Adapters absorb ecosystem changes so the rest of the platform remains stable.

---

# Runtime Interaction Flow

The following diagram describes runtime interaction through a Contract. Its arrows do not represent source-code dependency direction.

Correct

Skill

↓

Contract

↓

Adapter

↓

External API

Incorrect

Skill

↓

GitHub REST API

Canonical source-code dependency direction is inward: an Adapter implementation depends on the applicable Core Contract or abstraction. The Contract and Core MUST NOT source-depend on the Adapter or external API, and a Skill MUST NOT source-depend on a concrete Adapter.

---

# Communication

Adapters communicate with O.R.I.O.N. through Contracts.

Adapters communicate with external systems through SDKs, REST APIs, GraphQL APIs, WebSockets, or proprietary protocols.

External communication must never leak into the Core.

---

# Configuration

Configuration must remain external.

Examples:

- API Tokens
- OAuth Credentials
- URLs
- Organization IDs
- Workspace IDs
- Timeouts

Hardcoded configuration is forbidden.

---

# Authentication

Authentication mechanisms belong inside Adapters.

Supported mechanisms may include:

- OAuth 2.0
- API Keys
- JWT
- Client Credentials
- SSH
- SAML

Authentication details must never be exposed outside the Adapter.

---

# Error Handling

Adapters normalize external failures.

Examples:

GitHub 403

↓

PermissionDenied

Spotify Timeout

↓

ProviderTimeout

SAP Authentication Error

↓

AuthenticationFailed

Consumers should never receive ecosystem-specific errors.

---

# Events

Adapters may publish Events when a meaningful completed integration fact exists and the Adapter or integration domain is the semantic owner.

Such Events are Adapter-owned integration Events. An Adapter MUST NOT publish or impersonate an Engine-owned domain Event; domain facts must enter the owning capability through its Contracts. Core custody of the shared Event schema does not transfer semantic ownership or publication authority.

Examples:

IssueCreated

RepositoryUpdated

PlaylistChanged

TransferCompleted

WebhookReceived

Events should follow OES-0005.

---

# Security

Adapters must:

Protect credentials.

Validate responses.

Validate requests.

Respect least privilege.

Never expose secrets.

Log safely.

---

# Observability

Every Adapter should expose:

Health Status

Availability

Latency

Request Count

Error Rate

Retries

Rate Limit Status

---

# Testing

Every Adapter must include:

Unit Tests

Integration Tests

Mocked External APIs

Authentication Tests

Failure Simulation

Contract Validation

---

# Documentation

Every Adapter should document:

Supported APIs

Authentication

Permissions

Known Limitations

Supported Versions

Rate Limits

Failure Modes

---

# Anti-Patterns

Avoid:

Business logic inside Adapters.

Engine-to-Adapter coupling.

Hardcoded credentials.

Undocumented API assumptions.

SDK usage outside Adapters.

Leaking external API models into the Core.

---

# Definition of Done

An Adapter is complete when:

✔ Implements Contracts

✔ Authentication implemented

✔ External configuration

✔ Tests completed

✔ Documentation completed

✔ Observability enabled

✔ Errors normalized

✔ Security validated

---

# Related Standards

- OES-0002 — Engine Design
- OES-0003 — Skill Design
- OES-0004 — Contracts
- OES-0005 — Events
- OES-0006 — Providers

---

# Engineering Motto

> Adapters isolate ecosystems so the platform remains independent.
