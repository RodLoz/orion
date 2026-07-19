# OES-0002 — Engine Design

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.2.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-07-19 |
| **Applies To** | All Engines |

---

# Purpose

This standard defines what an Engine is, how it should be designed, how it communicates with the rest of the platform, and the responsibilities every Engine must fulfill.

Every Engine within O.R.I.O.N. must comply with this standard.

---

# Scope

This standard applies to every Engine, including future Engines introduced into the platform.

Examples include:

- Brain Engine
- Voice Engine
- Memory Engine
- Knowledge Engine
- Context Engine
- Planning Engine
- Reasoning Engine
- Identity Engine
- Skill Engine
- Automation Engine
- Security Engine
- Vision Engine

---

# Definition

An Engine is an autonomous capability responsible for one specific domain of intelligence within O.R.I.O.N.

An Engine is not a service.

An Engine is not a provider.

An Engine is not an application.

An Engine represents a capability of the platform.

---

# Core Principles

Every Engine must:

- Own a single capability.
- Have a clearly defined responsibility.
- Expose cross-boundary interaction through Contracts under Core custody and governance.
- Be replaceable.
- Be independently testable.
- Be observable.
- Publish an Event when a meaningful completed domain fact exists; never invent Events solely to satisfy a lifecycle checklist.
- Never depend directly on another Engine.

---

# Single Responsibility

Each Engine owns exactly one domain.

Examples:

Voice Engine

Responsible for speech input and speech output.

Not responsible for memory.

Not responsible for planning.

Not responsible for reasoning.

---

Memory Engine

Responsible for storing and retrieving intentionally retained experience and user continuity.

Responsible for governing whether a proposed Memory candidate is intentionally retained, consistent with ADR-0005.

Physical persistence is implemented through Contracts and implementation layers; this does not transfer Memory domain ownership from the Memory Engine.

---

Knowledge Engine

Responsible for the semantics and governance of Knowledge.

The Knowledge Engine:

- governs acceptance of claims as Knowledge;
- governs validation state and provenance requirements;
- governs Knowledge lifecycle and version semantics;
- resolves contradictions within the Knowledge domain;
- exposes Knowledge through Contracts;
- provides Knowledge references or projections to Context.

The Knowledge Engine does not own storage technology, Context, or Memory.

The Knowledge Engine does not perform Reasoning or Planning.

Providers and Adapters may supply observations or technical support, but they never determine what is accepted as Knowledge.

---

Planning Engine

Responsible for decomposing objectives.

Not responsible for executing them.

---

Brain Engine

Responsible for orchestrating cognitive execution across Context, Reasoning, Planning, Memory, Knowledge, and Skill invocation through Contracts.

The Brain Engine manages the high-level cognitive execution flow and coordinates the appropriate capability. It does not perform domain reasoning, replace the Reasoning Engine, own the semantics of coordinated capabilities, or independently generate reasoning content.

Reasoning Engine

Responsible for evaluating exactly one Active Context Revision, performing inference and reasoning, and producing reasoning outcomes.

A reasoning outcome may include a candidate response, conclusion, decision, or next action. The Reasoning Engine does not orchestrate the full cognitive pipeline, execute Skills, own Planning or Context, or deliver results to Clients.

The Brain Engine may assemble the final cognitive result from capability outputs. Final transport, presentation, voice rendering, and client delivery belong outside both Engines.

---

# Communication

Engines communicate through Contracts and Events.

Never through direct implementation dependencies.

The following diagrams describe Runtime Interaction Flow. Their arrows do not represent source-code dependency direction.

Correct

Voice Engine

↓

Speech Contract

↓

Reasoning Engine

Incorrect

Voice Engine

↓

Reasoning Engine

↓

Memory Engine

↓

Skill Engine

---

# Source-Code Dependencies

Source-code dependencies always point toward Core-custodied Contracts.

Never toward implementations. Runtime interaction arrows do not change this dependency direction.

Correct

Brain Engine

↓

Core Contract

Incorrect

Brain Engine

↓

OpenAI SDK

---

# Lifecycle

Every Engine should support the following lifecycle.

Initialize

↓

Ready

↓

Running

↓

Stopping

↓

Stopped

Initialization should be deterministic.

---

# Responsibilities

Every Engine should clearly define:

Inputs

Outputs

Dependencies

Published Events

Consumed Events

Configuration

Error Types

Metrics

Health Checks

---

# Configuration

Configuration must be external.

Engines must never hardcode:

API keys

URLs

Credentials

Provider names

Environment-specific values

---

# State

Engines should be stateless whenever possible.

When state is required, ownership must be explicit.

Physical persistence belongs outside the Engine behind Contracts. The capability Engine retains semantic ownership and lifecycle governance of its domain state.

---

# Providers

Providers implement external technologies.

Examples

SpeechToText Provider

OpenAI

Azure

Local Whisper

Future Provider

The Engine never knows which Provider is active.

---

# Contracts

Every Engine exposes Contracts.

Contracts define:

Inputs

Outputs

Expected behavior

Failure behavior

Version compatibility

Contracts should remain stable.

---

# Events

Engines should publish meaningful domain Events only when a meaningful completed domain fact exists and the Engine is authorized to represent that Event's semantics.

The Core custodies shared Event schemas. The capability or domain owns Event semantics, and runtime publication authority remains distinct. An Engine MUST NOT publish another domain's Event as though it were the semantic owner.

Examples:

VoiceCaptured

VoiceTranscribed

MemoryStored

MemoryRetrieved

IdentityVerified

SkillExecuted

PlanCreated

AutomationTriggered

Events should describe completed work.

---

# Observability

Every Engine should expose:

Health status

Execution metrics

Latency

Failures

Warnings

Diagnostic information

---

# Logging

Logging must be structured.

Logs should answer:

What happened?

When?

Why?

Which Engine?

Which request?

Which user (when allowed)?

---

# Error Handling

Errors must be explicit.

Avoid generic exceptions.

Errors should be categorized.

Examples:

ValidationError

ProviderError

PermissionError

EngineUnavailable

ConfigurationError

UnexpectedError

---

# Testing

Every Engine must include:

Unit tests

Integration tests

Contract tests

Behavior tests where appropriate

Testing is mandatory.

---

# Security

Every Engine must:

Validate inputs.

Respect permissions.

Protect sensitive information.

Never expose secrets.

Never trust external input.

---

# Performance

Optimize only after correctness.

Prefer readable implementations over premature optimization.

Performance improvements must preserve architectural integrity.

---

# Anti-Patterns

Do not:

Depend directly on providers.

Share mutable state.

Access databases without Contracts.

Implement multiple capabilities.

Call another Engine directly.

Hide failures.

Ignore metrics.

Ignore documentation.

---

# Definition of a Complete Engine

An Engine is complete when it provides:

✔ Single responsibility

✔ Public Contracts

✔ Event publication when a meaningful completed domain fact exists

✔ Tests

✔ Documentation

✔ Observability

✔ Structured logging

✔ External configuration

✔ Security validation

✔ Metrics

---

# Engine Checklist

Before introducing a new Engine ask:

Is this a new capability?

Can an existing Engine own it?

Does it deserve independent lifecycle?

Does it require its own Contracts?

Will it publish Events?

Can it evolve independently?

If the answer is "No" to most of these questions, a new Engine should probably not be created.

---

# Related Standards

- OES-0000 — Engineering Philosophy
- OES-0001 — Repository Structure
- OES-0003 — Skill Design
- OES-0004 — Contracts
- OES-0005 — Events
- OES-0006 — Providers

---

# Engineering Motto

> Engines own capabilities. Providers implement technologies.
