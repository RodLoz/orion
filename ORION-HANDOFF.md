# O.R.I.O.N. — Project Handoff

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.3.0 |
| **Updated** | 2026-07-19 |

---

# Purpose

This document provides a concise summary of the current state of the O.R.I.O.N. project.

Its objective is to allow a new AI agent, contributor, or future conversation to immediately understand the project without reviewing the entire repository history.

---

# Project Vision

O.R.I.O.N. (Omni-Responsive Intelligent Operating Network) is an AI Operating Network designed to become a long-lived, multi-device, capability-oriented intelligent platform.

The platform is intended to evolve beyond a conversational assistant by integrating reasoning, memory, automation, and external ecosystems.

---

# Current Phase

Foundation Candidate

The Architectural Foundation exists and has undergone correction following REVIEW-0002.

Implementation has not started.

FND-001 through FND-007 from REVIEW-0002 have been resolved. Foundation Freeze has not been approved; a new independent Foundation Review is required first.

---

# Foundation Status

Completed:

- Vision
- Manifesto
- README
- Engineering Standards (OES)
- Architecture Decisions (ADR)
- REVIEW-0001 and REVIEW-0002 historical architecture reviews
- Documentation Authority
- Documentation Templates

Completed foundation artifacts:

- Memory Concept Model
- Knowledge Concept Model
- Context Concept Model
- Corrections for REVIEW-0002 findings FND-001 through FND-007

Pending:

- Independent Foundation re-review
- Foundation Freeze decision

---

# Architectural Style

The platform follows a Capability-Oriented Architecture inspired by:

- Clean Architecture
- Hexagonal Architecture
- Event-Driven Design
- Domain-Oriented Design
- AI Orchestration

---

# Foundational ADRs

Completed:

- ADR-0001 — Core Ownership and Dependency Direction
- ADR-0002 — Capability-Oriented Architecture
- ADR-0003 — Engine Communication Model
- ADR-0004 — Separation of Skills, Providers and Adapters
- ADR-0005 — Memory Architecture Principles

---

# Engineering Standards

Completed:

- OES-0000 Engineering Philosophy
- OES-0001 Repository Structure
- OES-0002 Engine Design
- OES-0003 Skill Design
- OES-0004 Contracts
- OES-0005 Events
- OES-0006 Provider Design
- OES-0007 Adapter Design
- OES-0008 Documentation Standards
- OES-0009 Security Standards
- OES-0010 Versioning Standards

---

# Concept Models

Current status:

- Memory Model ✅
- Knowledge Model ✅
- Context Model ✅

These models define the cognitive foundation of the platform.

---

# Core Concepts

The platform distinguishes three fundamental concepts.

Memory

"What have I experienced?"

Intentionally retained experience, user preferences, and provenance that an assertion or interaction occurred.

Knowledge

"What is accepted as true?"

Validated facts, domain knowledge, validated procedures, and stable platform definitions with provenance and validation state.

Knowledge is an independent capability. The Knowledge Engine is its single architectural owner and governs claim acceptance, validation state, provenance, lifecycle and version semantics, and contradiction resolution.

Context

"What is relevant right now?"

The temporary selection or projection of information relevant to the current operational or reasoning situation.

The boundary is based on semantic role and authority, not persistence. Context may reference Memory and Knowledge without reclassifying them or assuming durable ownership.

Context evolves through lineages and immutable revisions. A Context Lineage has one stable Lineage Identity; each Context Revision has its own unique Revision Identity and ordering semantic. Active Context means a Context Revision in the Active lifecycle state.

The canonical lifecycle is Collecting → Composing → Validating → Active → Expired → Archived (optional). Operational changes create new revisions rather than updating an Active revision.

Logical reconstruction is conditional on version-identifiable source revisions remaining available. Exact replay requires retained immutable evidence. Expiration, archival retention, and deletion are distinct, and retained Context evidence does not become cognitive Memory.

Reasoning combines all three.

---

# Platform Principles

The Core defines the language.

Engines own behavior.

The Knowledge Engine exclusively owns Knowledge behavior and governance.

Providers implement technology.

Adapters integrate ecosystems.

Skills orchestrate business capabilities.

Clients provide interaction.

Infrastructure provides execution.

---

# Planned Engines

Examples include:

- Brain Engine
- Identity Engine
- Context Engine
- Memory Engine
- Knowledge Engine
- Reasoning Engine
- Planning Engine
- Voice Engine
- Skill Engine
- Security Engine
- Automation Engine
- Vision Engine

---

# Planned Repository Structure

```text
docs/
specifications/
src/
tests/
scripts/
```

Within specifications:

```text
concepts/
architecture/
engines/
flows/
contracts/
events/
protocols/
schemas/
```

---

# Next Milestones

1. Conduct an independent Foundation re-review
2. Decide Foundation Freeze based on the new review
3. Bootstrap implementation only after approval
4. Create Engine Specifications at the appropriate post-freeze stage
5. Build the first executable platform

---

# Working Methodology

Architecture

ChatGPT

Implementation

Codex

Repository

GitHub

Every architectural change requires an ADR.

Implementation must follow Engineering Standards.

---

# Important Rules

- Never bypass the Core.
- Never couple business logic to Providers.
- Skills never communicate directly with external systems.
- Memory is a capability, not a database.
- Knowledge is not Memory.
- Context is temporary.
- Contracts define communication.
- Events define asynchronous collaboration.
- Core is the canonical custodian of shared architectural Contracts; Engines retain capability behavior and semantic ownership; implementation layers implement or translate Contracts.
- Source-code dependencies point inward toward Core abstractions. Runtime interaction, data, and event flows do not reverse that dependency direction.
- Reasoning Engine owns inference and reasoning over an Active Context Revision. Brain Engine owns cognitive orchestration and final cognitive-result assembly, but does not independently generate reasoning content. Final transport and presentation belong outside both.

---

# Current Objective

Prepare the corrected Foundation for an independent re-review.

Implementation begins only after the Foundation has been formally approved.

---

# Long-Term Vision

Build an extensible AI Operating Network capable of operating across multiple devices, providers, and ecosystems while preserving architectural consistency, explainability, privacy, and long-term maintainability.
