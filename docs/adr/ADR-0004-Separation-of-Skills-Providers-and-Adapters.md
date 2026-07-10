# ADR-0004 — Separation of Skills, Providers and Adapters

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-10 |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. extends its functionality through multiple architectural elements.

During the Foundation Review, ambiguity was identified regarding the responsibilities of Skills, Providers, and Adapters.

Without explicit separation, contributors may implement business logic in infrastructure components or infrastructure concerns inside Skills.

---

# Problem Statement

The platform requires clear ownership boundaries.

Specifically:

- What is a Skill?
- What is a Provider?
- What is an Adapter?
- Who owns business logic?
- Who owns external integrations?

---

# Decision

O.R.I.O.N. separates Skills, Providers, and Adapters into three distinct architectural concepts.

Each has a unique responsibility.

They must never overlap.

---

# Skill

A Skill represents a platform capability that can be executed.

A Skill answers:

> **What can O.R.I.O.N. do?**

Examples:

- Create Calendar Event
- Send Email
- Turn On Lights
- Translate Text
- Summarize Document
- Schedule Reminder
- Play Music

Skills contain business workflow.

Skills orchestrate other components.

Skills never communicate directly with external technologies.

---

# Provider

A Provider implements a platform Contract.

A Provider answers:

> **How is this capability implemented?**

Examples:

- OpenAI Provider
- Gemini Provider
- Whisper Provider
- ElevenLabs Provider
- PostgreSQL Provider

Providers isolate technology.

Providers never contain business rules.

Providers may be replaced without affecting Skills.

---

# Adapter

An Adapter integrates O.R.I.O.N. with an external ecosystem.

An Adapter answers:

> **How do we communicate with another system?**

Examples:

- Google Calendar Adapter
- Microsoft Graph Adapter
- GitHub Adapter
- Spotify Adapter
- Home Assistant Adapter
- IBM Sterling Adapter

Adapters translate between external APIs and internal Contracts.

Adapters own authentication details for external systems.

---

# Responsibility Matrix

| Responsibility | Skill | Provider | Adapter |
|---------------|-------|----------|----------|
| Business workflow | ✔ | ✘ | ✘ |
| AI implementation | ✘ | ✔ | ✘ |
| External API integration | ✘ | ✘ | ✔ |
| User interaction | ✘ | ✘ | ✘ |
| Technology abstraction | ✘ | ✔ | ✔ |
| Platform orchestration | ✔ | ✘ | ✘ |

---

# Dependency Direction

```
Skill
    │
    ▼
Contracts
    │
    ▼
Adapter
    │
    ▼
External Platform
```

```
Skill
    │
    ▼
Contracts
    │
    ▼
Provider
    │
    ▼
Technology
```

Neither Providers nor Adapters may call Skills.

---

# Collaboration Example

User:

"Schedule a meeting tomorrow."

```
Voice Engine

↓

Reasoning Engine

↓

Planning Engine

↓

Calendar Skill

↓

Calendar Contract

↓

Google Calendar Adapter

↓

Google Calendar API
```

The Skill decides **what** should happen.

The Adapter decides **how** to communicate with Google.

---

Another example:

User:

"Summarize this document."

```
Reasoning Engine

↓

Summarization Skill

↓

LLM Contract

↓

OpenAI Provider
```

The Skill owns the workflow.

The Provider owns the AI implementation.

---

# Rationale

This separation:

- prevents architectural leakage;
- keeps business logic independent;
- enables technology replacement;
- simplifies testing;
- improves maintainability.

---

# Alternatives Considered

## Combine Skills and Adapters

Rejected.

Reason:

Business logic becomes coupled to external APIs.

---

## Combine Providers and Adapters

Rejected.

Reason:

Technology abstraction and ecosystem integration have different responsibilities.

---

## Put Business Logic inside Providers

Rejected.

Reason:

Business behavior would become vendor-dependent.

---

# Consequences

Positive:

- Clear ownership.
- Easier testing.
- Easier provider replacement.
- Better extensibility.

Negative:

- More architectural components.
- Additional documentation.

---

# Risks

Developers may initially confuse Providers and Adapters.

Mitigation:

Examples, templates, and Engineering Standards should reinforce the distinction.

---

# Dependencies

- ADR-0001 — Core Ownership and Dependency Direction
- ADR-0002 — Capability-Oriented Architecture
- ADR-0003 — Engine Communication Model
- OES-0003 — Skill Design
- OES-0006 — Provider Design
- OES-0007 — Adapter Design

---

# Future Review

Review when introducing plugin-based ecosystem integrations or distributed Skill execution.

---

# Change History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 2026-07-10 | Initial architecture decision. |

---

# Engineering Motto

> Skills decide what to do. Providers implement technology. Adapters connect ecosystems.