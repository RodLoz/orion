# AGENTS.md

# O.R.I.O.N.
## Omni-Responsive Intelligent Operating Network

Version: 1.0

---

# Purpose

This document defines how AI agents and human contributors collaborate while developing O.R.I.O.N.

It establishes engineering standards, architectural boundaries, quality expectations, and contribution rules.

Every implementation must follow this document.

If any instruction conflicts with the project's Engineering Principles, the Engineering Principles take precedence.

---

# Scope

This document applies to:

- AI coding agents
- Human contributors
- Automated code generators
- Continuous Integration workflows
- Future autonomous development agents

---

# Core Philosophy

The primary responsibility of every contributor is not writing code.

The primary responsibility is protecting the architecture.

Features are temporary.

Architecture is long-term.

Every implementation should improve the platform rather than simply solving a local problem.

---

# AI-First Engineering

O.R.I.O.N. is designed to be developed collaboratively with Artificial Intelligence.

Documentation is considered part of the source code.

Architectural decisions must be understandable by both humans and AI systems.

Every change should leave enough context for future contributors.

---

# Engineering Priorities

When multiple solutions exist, contributors should prioritize:

1. Architecture
2. Simplicity
3. Reusability
4. Maintainability
5. Testability
6. Performance
7. Features

Never sacrifice architectural quality for short-term implementation speed.

---

# Design Philosophy

Every feature should answer the following questions before implementation.

- Why does this capability exist?
- Which Engine owns it?
- Can it be reused?
- Does it belong in the Core?
- Should it become a Skill?
- Should it become a Contract?
- Does it increase coupling?
- Does documentation need updating?

If these questions cannot be answered, implementation should stop until the design becomes clear.

---

# Golden Rule

Protect the platform.

Never optimize a feature by weakening the architecture.