# AGENTS.md

# O.R.I.O.N.

## AI Collaboration Guide

Version: 1.0

---

# Purpose

This document defines how AI agents collaborate while contributing to O.R.I.O.N.

It establishes the operational rules that every AI agent and human contributor must follow.

This document is intentionally concise.

Detailed engineering standards are defined in the O.R.I.O.N. Engineering Standards (OES).

---

# Mission

Your mission is not simply to generate code.

Your mission is to preserve the architectural integrity of O.R.I.O.N.

Correct architecture is always more valuable than quickly implemented features.

---

# Before You Start

Before making any change, read the following documents in this order.

1. README.md
2. MANIFESTO.md
3. docs/vision.md
4. docs/principles.md
5. docs/architecture.md
6. Relevant OES documents

Never modify the project without understanding its architectural goals.

---

# Core Responsibilities

Every contributor should:

- Preserve architectural integrity.
- Prefer reusable solutions.
- Minimize coupling.
- Document important decisions.
- Keep the Core independent.
- Respect engineering standards.

---

# Decision Checklist

Before implementing any feature, ask:

- Does this capability already exist?
- Which Engine owns this responsibility?
- Should this become a Skill?
- Should this become a Provider?
- Does this belong in the Core?
- Does this require a Contract?
- Does documentation need updating?
- Does an ADR need to be created?

If any answer is unclear, implementation should pause until the design is clarified.

---

# Repository Navigation

Use the repository as follows.

README.md

Project overview.

MANIFESTO.md

Project philosophy.

docs/

Architecture and engineering documentation.

engineering/

Permanent engineering standards.

adr/

Architectural decisions.

core/

Business concepts.

services/

Engine implementations.

packages/

Reusable libraries.

apps/

Clients.

specifications/

Technical specifications.

---

# Development Priorities

Always prioritize:

1. Architecture
2. Simplicity
3. Maintainability
4. Reusability
5. Testability
6. Performance
7. Features

Never reverse this order.

---

# Core Rules

Never introduce business logic into clients.

Never couple Engines directly.

Never depend directly on external providers.

Never bypass Contracts.

Never violate Platform First.

Never duplicate existing capabilities.

Never modify architecture without documenting the reason.

---

# Documentation Rules

Documentation is part of the implementation.

Whenever architecture changes:

- Update documentation.
- Update relevant OES.
- Create an ADR if required.

Code without documentation is incomplete.

---

# AI Collaboration Rules

Think before coding.

Prefer understanding over assumptions.

Prefer architecture over shortcuts.

Prefer reusable abstractions over feature-specific implementations.

If uncertainty exists, request clarification instead of inventing behavior.

Never fabricate APIs, providers, or capabilities.

---

# Quality Checklist

Every completed contribution should satisfy the following.

✔ Architecture preserved

✔ Documentation updated

✔ Contracts respected

✔ Tests added or updated

✔ Naming conventions respected

✔ No unnecessary coupling introduced

✔ No duplicated logic

---

# Escalation

If an implementation requires changing:

- Core concepts
- Contracts
- Engine responsibilities
- Repository structure

Stop implementation.

Document the proposal.

Create an ADR.

Wait for approval before continuing.

---

# Definition of Done

A contribution is complete only when:

- Implementation is correct.
- Documentation is updated.
- Tests pass.
- Engineering standards are respected.
- Architectural integrity remains intact.

---

# Final Rule

Always leave O.R.I.O.N. in a better state than you found it.