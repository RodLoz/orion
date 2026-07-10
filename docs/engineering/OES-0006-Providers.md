# OES-0006 — Provider Design

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-10 |
| **Applies To** | All Providers |

---

# Purpose

This standard defines the design, lifecycle, registration, selection, execution, and governance of Providers within O.R.I.O.N.

Providers isolate external technologies from the platform and guarantee that the Core, Engines, and Skills remain independent of vendor-specific implementations.

---

# Scope

This standard applies to every Provider used by the platform.

Examples include:

- LLM Providers
- Speech-to-Text Providers
- Text-to-Speech Providers
- Embedding Providers
- Database Providers
- Cache Providers
- Storage Providers
- Notification Providers
- Authentication Providers

---

# Philosophy

Providers represent technology.

They never represent business capabilities.

Technology changes.

Architecture should not.

Replacing a Provider must never require modifications to business logic.

---

# Definition

A Provider is a replaceable implementation of a Contract.

A Provider exists to translate a technology-specific interface into a platform Contract.

```
Core
        ↓
Contract
        ↓
Provider
        ↓
Technology
```

The platform communicates with Contracts.

Providers communicate with technologies.

---

# Architectural Principles

Providers must be:

- Replaceable
- Observable
- Stateless whenever possible
- Configurable
- Independently testable
- Versioned

Providers must never:

- Contain business rules.
- Modify platform behavior.
- Access unrelated Engines.
- Store domain state.

---

# Provider Lifecycle

Every Provider follows the same lifecycle.

```
Discovered
      ↓
Registered
      ↓
Configured
      ↓
Validated
      ↓
Available
      ↓
Selected
      ↓
Executing
      ↓
Stopped
```

---

# Registration

Providers must register themselves through the Provider Registry.

Registration should include:

- Provider ID
- Name
- Version
- Supported Contract
- Supported Capabilities
- Priority
- Health Status

---

# Discovery

Provider discovery should be automatic whenever possible.

Discovery may be based on:

- Configuration
- Dependency Injection
- Plugin loading
- Package metadata

Business logic must never manually instantiate Providers.

---

# Selection

The Provider Registry is responsible for selecting the most appropriate Provider.

Selection criteria may include:

- Capability support
- Priority
- Health
- Cost
- Latency
- Region
- User preference
- Organization policy

Selection rules must be deterministic.

---

# Capabilities

Providers declare the capabilities they support.

Example:

OpenAI Provider

Capabilities:

- chat
- reasoning
- embeddings

Example:

Whisper Provider

Capabilities:

- speech-to-text

Capabilities must be discoverable at runtime.

---

# Configuration

Providers receive configuration externally.

Examples:

- API Keys
- OAuth Credentials
- Regions
- Endpoints
- Timeouts
- Retry Policies

Configuration must never be hardcoded.

---

# Health

Every Provider exposes its health.

Minimum states:

- Healthy
- Degraded
- Unavailable

Health checks should be lightweight.

---

# Failover

If a Provider becomes unavailable, the Provider Registry may select another compatible Provider.

Failover policies should be configurable.

Provider replacement should be transparent whenever possible.

---

# Performance

Providers should expose:

- Average latency
- Error rate
- Success rate
- Retry count
- Timeout count

Performance metrics support runtime selection.

---

# Security

Providers must:

- Protect credentials.
- Validate requests.
- Validate responses.
- Never log secrets.
- Respect least privilege.
- Support credential rotation.

---

# Observability

Every Provider should expose:

- Health
- Availability
- Version
- Metrics
- Structured Logs
- Correlation IDs
- Trace IDs

---

# Versioning

Providers follow Semantic Versioning.

Breaking changes require a major version.

Minor versions must remain compatible with their Contract.

---

# Compatibility

A Provider must explicitly declare:

- Supported Contract Version
- Supported Protocol Version
- Supported Platform Version

Compatibility must be validated during registration.

---

# Testing

Every Provider requires:

- Unit Tests
- Contract Tests
- Integration Tests
- Failure Simulation
- Timeout Tests
- Compatibility Tests

---

# Documentation

Every Provider must document:

- Purpose
- Configuration
- Authentication
- Supported Features
- Known Limitations
- Compatibility
- Failure Modes

---

# Anti-Patterns

Avoid:

- Business logic inside Providers
- Hardcoded credentials
- Direct SDK usage outside Providers
- Hidden configuration
- Provider-specific exceptions
- Mutable global state

---

# Definition of Done

A Provider is complete when:

- ✔ Implements a Contract
- ✔ Registers successfully
- ✔ Supports health checks
- ✔ Exposes metrics
- ✔ Supports configuration
- ✔ Includes automated tests
- ✔ Documents compatibility
- ✔ Handles failures gracefully

---

# Related Standards

- OES-0002 — Engine Design
- OES-0004 — Contracts
- OES-0005 — Events
- OES-0007 — Adapter Design

---

# Engineering Motto

> Providers isolate technology so the platform can evolve without rewriting its intelligence.